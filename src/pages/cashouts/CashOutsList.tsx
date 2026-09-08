import { useTable } from "@refinedev/antd";
import { App, Button, Segmented, Space, Table } from "antd";
import { ListCard } from "../../components/ListCard";
import { StatusTag } from "../../components/StatusTag";
import type { CashOut, CashOutStatus } from "../../data/fake/money";
import { dayLabel, pesos, thousands } from "../../lib/format";

const FILTERS: { label: string; value: CashOutStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Requested", value: "requested" },
  { label: "Review", value: "review" },
  { label: "Processing", value: "processing" },
  { label: "Sent", value: "sent" },
  { label: "Failed", value: "failed" },
];

const WALLET: Record<CashOut["wallet"], string> = { gcash: "GCash", maya: "Maya" };

/** What can happen to a request next; the API will enforce the same moves. */
const NEXT: Partial<Record<CashOutStatus, string[]>> = {
  requested: ["Approve", "Review", "Fail"],
  review: ["Approve", "Fail"],
  processing: ["Mark sent", "Fail"],
};

export function CashOutsList() {
  const { message } = App.useApp();
  const { tableProps, setFilters } = useTable<CashOut>({ resource: "cash-outs", pagination: { pageSize: 10 }, sorters: { initial: [{ field: "requestedAt", order: "desc" }] } });
  const act = (what: string, reference: string) => message.info(`${what} on ${reference} lands with the API.`);
  return (
    <ListCard
      title="Cash-outs"
      subtitle="Requests waiting on you, and everything already sent."
      toolbar={<Segmented options={FILTERS} defaultValue="" onChange={(value) => setFilters([{ field: "status", operator: "eq", value }])} />}
    >
      <Table<CashOut> {...tableProps} rowKey="id">
        <Table.Column<CashOut> title="Reference" dataIndex="reference" render={(v: string) => <span className="cell-primary">{v}</span>} />
        <Table.Column<CashOut> title="Member" dataIndex="memberName" />
        <Table.Column<CashOut> title="Wallet" render={(_, c) => <><div>{WALLET[c.wallet]}</div><div className="cell-muted">•••• {c.numberLast4}</div></>} />
        <Table.Column<CashOut> title="Amount" dataIndex="points" sorter render={(v: number) => <><div className="cell-primary">{pesos(v)}</div><div className="cell-muted">{thousands(v)} pts</div></>} />
        <Table.Column title="Status" dataIndex="status" render={(s: string) => <StatusTag status={s} />} />
        <Table.Column<CashOut> title="Requested" dataIndex="requestedAt" sorter render={(v: string) => <span className="cell-muted">{dayLabel(new Date(v))}</span>} />
        <Table.Column<CashOut> title="" render={(_, c) => (
          <Space>
            {(NEXT[c.status] ?? []).map((what) => (
              <Button key={what} size="small" type={what === "Fail" ? "text" : "primary"} danger={what === "Fail"} onClick={() => act(what, c.reference)}>{what}</Button>
            ))}
          </Space>
        )} />
      </Table>
    </ListCard>
  );
}

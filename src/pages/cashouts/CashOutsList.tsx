import { useTable } from "@refinedev/antd";
import { useUpdate } from "@refinedev/core";
import { Button, Form, Input, Popconfirm, Segmented, Space, Table, type ButtonProps } from "antd";
import { useState } from "react";
import { ListCard } from "../../components/ListCard";
import { RecordModal } from "../../components/RecordModal";
import { SearchBox } from "../../components/SearchBox";
import { StatusTag } from "../../components/StatusTag";
import type { CashOut, CashOutStatus } from "../../data/fake/money";
import { MOVES, type Move } from "../../lib/cashOutMoves";
import { dayLabel, pesos, thousands } from "../../lib/format";
import { required } from "../../lib/rules";
import { useSearchFilter } from "../../lib/useSearchFilter";

const FIELDS = ["reference", "memberName"] as const;

const FILTERS: { label: string; value: CashOutStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Requested", value: "requested" },
  { label: "Review", value: "review" },
  { label: "Processing", value: "processing" },
  { label: "Sent", value: "sent" },
  { label: "Failed", value: "failed" },
];

const WALLET: Record<CashOut["wallet"], string> = { gcash: "GCash", maya: "Maya" };
const TONE: Record<Move["tone"], ButtonProps> = { primary: { type: "primary" }, quiet: {}, danger: { type: "text", danger: true } };

/** What the toast says once a request has moved. */
const MOVED: Partial<Record<CashOutStatus, { message: string; description: string }>> = {
  processing: { message: "approved", description: "It is processing; mark it sent once the money has left." },
  review: { message: "set aside for review", description: "Nothing moves until it is approved or failed." },
  sent: { message: "marked as sent", description: "The member sees it as sent." },
};

const EMPTY_REASON = { reason: "" };

function StatusCell({ cashOut }: { cashOut: CashOut }) {
  return (
    <>
      <StatusTag status={cashOut.status} />
      {cashOut.status === "failed" && cashOut.failureReason && <div className="cell-muted">{cashOut.failureReason}</div>}
      {cashOut.status === "sent" && cashOut.sentAt && <div className="cell-muted">sent {dayLabel(new Date(cashOut.sentAt))}</div>}
    </>
  );
}

/** Marking sent is the one irreversible step, so it alone asks first. */
function MoveButton({ move, wallet, onPick }: { move: Move; wallet: string; onPick: () => void }) {
  if (move.to !== "sent") return <Button size="small" {...TONE[move.tone]} onClick={onPick}>{move.label}</Button>;
  return (
    <Popconfirm title="Has the money left for the wallet?" description={`${wallet} shows the transfer.`} okText="Mark sent" onConfirm={onPick}>
      <Button size="small" {...TONE[move.tone]}>{move.label}</Button>
    </Popconfirm>
  );
}

export function CashOutsList() {
  const { tableProps, setFilters } = useTable<CashOut>({ resource: "cash-outs", pagination: { pageSize: 10 }, sorters: { initial: [{ field: "requestedAt", order: "desc" }] } });
  const { q, search } = useSearchFilter(FIELDS, setFilters);
  const { mutate: update } = useUpdate<CashOut>();
  const [failing, setFailing] = useState<CashOut | null>(null);
  const [busy, setBusy] = useState(false);

  const advance = (cashOut: CashOut, move: Move) => {
    const said = MOVED[move.to];
    update({
      resource: "cash-outs",
      id: cashOut.id,
      values: { status: move.to, ...(move.to === "sent" && { sentAt: new Date().toISOString() }) },
      successNotification: said ? { type: "success", message: `${cashOut.reference} ${said.message}`, description: said.description } : false,
    });
  };

  /** Failing returns the points: the provider credits them as the API's ledger would. */
  const fail = ({ reason }: { reason: string }) => {
    const cashOut = failing;
    if (!cashOut) return;
    setBusy(true);
    update(
      {
        resource: "cash-outs",
        id: cashOut.id,
        values: { status: "failed", failureReason: reason.trim() },
        successNotification: { type: "success", message: `${cashOut.reference} failed`, description: `${thousands(cashOut.points)} pts are back with ${cashOut.memberName}.` },
      },
      { onSuccess: () => setFailing(null), onSettled: () => setBusy(false) },
    );
  };

  const pick = (cashOut: CashOut, move: Move) => (move.to === "failed" ? setFailing(cashOut) : advance(cashOut, move));

  return (
    <ListCard
      title="Cash-outs"
      subtitle="Requests waiting on you, and everything already sent."
      toolbar={
        <>
          <SearchBox initial={q} placeholder="Search reference or member" onSearch={search} />
          <span className="list-toolbar__spacer" />
          <Segmented options={FILTERS} defaultValue="" onChange={(value) => setFilters([{ field: "status", operator: "eq", value }])} />
        </>
      }
    >
      <Table<CashOut> {...tableProps} rowKey="id">
        <Table.Column<CashOut> title="Reference" dataIndex="reference" render={(v: string) => <span className="cell-primary">{v}</span>} />
        <Table.Column<CashOut> title="Member" dataIndex="memberName" />
        <Table.Column<CashOut> title="Wallet" render={(_, c) => <><div>{WALLET[c.wallet]}</div><div className="cell-muted">•••• {c.numberLast4}</div></>} />
        <Table.Column<CashOut> title="Amount" dataIndex="points" sorter render={(v: number) => <><div className="cell-primary">{pesos(v)}</div><div className="cell-muted">{thousands(v)} pts</div></>} />
        <Table.Column<CashOut> title="Status" dataIndex="status" render={(_, c) => <StatusCell cashOut={c} />} />
        <Table.Column<CashOut> title="Requested" dataIndex="requestedAt" sorter render={(v: string) => <span className="cell-muted">{dayLabel(new Date(v))}</span>} />
        <Table.Column<CashOut> title="" render={(_, c) => (
          <Space>
            {(MOVES[c.status] ?? []).map((move) => <MoveButton key={move.label} move={move} wallet={`${WALLET[c.wallet]} •••• ${c.numberLast4}`} onPick={() => pick(c, move)} />)}
          </Space>
        )} />
      </Table>
      <RecordModal open={failing !== null} title={failing ? `Fail ${failing.reference}` : ""} okText="Fail and return the points" initialValues={EMPTY_REASON} busy={busy} onCancel={() => setFailing(null)} onSubmit={fail}>
        {failing && <p className="cell-muted" style={{ marginTop: 0 }}>{thousands(failing.points)} pts go back to {failing.memberName}. The reason is what they read.</p>}
        <Form.Item name="reason" label="Reason" rules={[required("Say why, in a line the member can act on."), { max: 120, message: "Up to 120 characters." }]}>
          <Input.TextArea rows={2} maxLength={120} showCount placeholder="Wallet number not registered" />
        </Form.Item>
      </RecordModal>
    </ListCard>
  );
}

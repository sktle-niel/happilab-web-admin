import { useTable } from "@refinedev/antd";
import { Table } from "antd";
import { ListCard } from "../../components/ListCard";
import { SearchBox } from "../../components/SearchBox";
import { StatusTag } from "../../components/StatusTag";
import type { Order } from "../../data/types";
import { dayLabel, pesos } from "../../lib/format";
import { useSearchFilter } from "../../lib/useSearchFilter";

const FIELDS = ["externalReference", "buyerName"] as const;
const pointsOf = (o: Order) => o.items.reduce((sum, item) => sum + item.pointsAwarded, 0);
const linesOf = (o: Order) => o.items.map((item) => `${item.product} × ${item.quantity}`).join(", ");

/** Orders arrive from the app, when a member's buyer purchases; staff read them here and never record one. */
export function OrdersList() {
  const { tableProps, setFilters } = useTable<Order>({ resource: "orders", pagination: { pageSize: 10 }, sorters: { initial: [{ field: "placedAt", order: "desc" }] } });
  const { q, search } = useSearchFilter(FIELDS, setFilters);
  return (
    <ListCard
      title="Orders"
      subtitle="Every order the app has brought in, and the points it earned the referrer."
      toolbar={<SearchBox initial={q} placeholder="Search reference or buyer" onSearch={search} />}
    >
      <Table<Order> {...tableProps} rowKey="id">
        <Table.Column<Order> title="Reference" dataIndex="externalReference" render={(v: string) => <span className="cell-primary">{v}</span>} />
        <Table.Column<Order> title="Buyer" dataIndex="buyerName" render={(_, o) => <><div>{o.buyerName}</div><div className="cell-muted">{o.referrerName ? `via ${o.referrerName}` : "no code"}</div></>} />
        <Table.Column<Order> title="Items" render={(_, o) => linesOf(o)} />
        <Table.Column<Order> title="Total" dataIndex="total" sorter render={(_, o) => pesos(o.totalCentavos / 100)} />
        <Table.Column<Order> title="Points" render={(_, o) => <span className="chip">+{pointsOf(o)} pts</span>} />
        <Table.Column title="Status" dataIndex="status" sorter render={(s: string) => <StatusTag status={s} />} />
        <Table.Column<Order> title="Placed" dataIndex="placedAt" sorter render={(v: string) => <span className="cell-muted">{dayLabel(new Date(v))}</span>} />
      </Table>
    </ListCard>
  );
}

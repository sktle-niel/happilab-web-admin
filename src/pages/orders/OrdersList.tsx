import { PlusOutlined } from "@ant-design/icons";
import { useTable } from "@refinedev/antd";
import { Button, Table } from "antd";
import { useState } from "react";
import { ListCard } from "../../components/ListCard";
import { SearchBox } from "../../components/SearchBox";
import { Spot } from "../../components/Spot";
import { StatusTag } from "../../components/StatusTag";
import type { Order } from "../../data/fake/money";
import { dayLabel, pesos } from "../../lib/format";
import { useSearchFilter } from "../../lib/useSearchFilter";
import { OrderForm } from "./OrderForm";

const FIELDS = ["externalReference", "buyerName"] as const;

export function OrdersList() {
  const { tableProps, setFilters } = useTable<Order>({ resource: "orders", pagination: { pageSize: 10 }, sorters: { initial: [{ field: "placedAt", order: "desc" }] } });
  const { q, search } = useSearchFilter(FIELDS, setFilters);
  const [recording, setRecording] = useState(false);
  return (
    <ListCard
      title="Orders"
      subtitle="Every order recorded from the stores, and the points it earned the referrer."
      toolbar={<SearchBox initial={q} placeholder="Search reference or buyer" onSearch={search} />}
      aside={<Spot id="record-order" inline><Button type="primary" icon={<PlusOutlined />} onClick={() => setRecording(true)}>Record order</Button></Spot>}
    >
      <Table<Order> {...tableProps} rowKey="id">
        <Table.Column<Order> title="Reference" dataIndex="externalReference" render={(v: string) => <span className="cell-primary">{v}</span>} />
        <Table.Column<Order> title="Buyer" dataIndex="buyerName" render={(_, o) => <><div>{o.buyerName}</div><div className="cell-muted">via {o.referrerName}</div></>} />
        <Table.Column<Order> title="Items" render={(_, o) => `${o.product} × ${o.quantity}`} />
        <Table.Column<Order> title="Total" dataIndex="totalCentavos" sorter render={(v: number) => pesos(v / 100)} />
        <Table.Column<Order> title="Points" dataIndex="pointsAwarded" sorter render={(v: number) => <span className="chip">+{v} pts</span>} />
        <Table.Column title="Status" dataIndex="status" render={(s: string) => <StatusTag status={s} />} />
        <Table.Column<Order> title="Placed" dataIndex="placedAt" sorter render={(v: string) => <span className="cell-muted">{dayLabel(new Date(v))}</span>} />
      </Table>
      <OrderForm open={recording} onClose={() => setRecording(false)} />
    </ListCard>
  );
}

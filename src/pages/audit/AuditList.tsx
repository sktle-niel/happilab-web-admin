import { useTable } from "@refinedev/antd";
import { Table } from "antd";
import { ListCard } from "../../components/ListCard";
import type { AuditEntry } from "../../data/fake/money";

const when = (iso: string) => new Date(iso).toLocaleString("en-PH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function AuditList() {
  const { tableProps } = useTable<AuditEntry>({ resource: "audit", pagination: { pageSize: 15 }, sorters: { initial: [{ field: "at", order: "desc" }] } });
  return (
    <ListCard title="Audit log" subtitle="Every sensitive action, who did it, and from where.">
      <Table<AuditEntry> {...tableProps} rowKey="id">
        <Table.Column<AuditEntry> title="When" dataIndex="at" render={(v: string) => <span className="cell-muted">{when(v)}</span>} />
        <Table.Column title="Actor" dataIndex="actor" render={(v: string) => <span className="cell-primary">{v}</span>} />
        <Table.Column title="Action" dataIndex="action" render={(v: string) => <code>{v}</code>} />
        <Table.Column title="Detail" dataIndex="detail" />
        <Table.Column title="IP" dataIndex="ip" render={(v: string) => <span className="cell-muted">{v}</span>} />
      </Table>
    </ListCard>
  );
}

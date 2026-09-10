import { useTable } from "@refinedev/antd";
import { Table } from "antd";
import { ListCard } from "../../components/ListCard";
import type { AuditEntry } from "../../data/types";

const when = (iso: string) => new Date(iso).toLocaleString("en-PH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
/** The row's flat metadata as one line: `role: support · pages: support,cash-outs`. */
const detail = (entry: AuditEntry) => Object.entries(entry.metadata ?? {}).map(([key, value]) => `${key}: ${String(value)}`).join(" · ");

export function AuditList() {
  const { tableProps } = useTable<AuditEntry>({ resource: "audit", pagination: { pageSize: 15 }, sorters: { initial: [{ field: "at", order: "desc" }] } });
  return (
    <ListCard title="Audit log" subtitle="Every sensitive action, who did it, and from where.">
      <Table<AuditEntry> {...tableProps} rowKey="id">
        <Table.Column<AuditEntry> title="When" dataIndex="at" render={(v: string) => <span className="cell-muted">{when(v)}</span>} />
        <Table.Column<AuditEntry> title="Actor" dataIndex="actor" render={(_, e) => <><div className="cell-primary">{e.actor}</div><div className="cell-muted">{e.actorKind}</div></>} />
        <Table.Column title="Action" dataIndex="action" render={(v: string) => <code>{v}</code>} />
        <Table.Column<AuditEntry> title="On" dataIndex="entity" render={(_, e) => <><div>{e.entity}</div>{e.entityId && <div className="cell-muted">{e.entityId.slice(0, 8)}</div>}</>} />
        <Table.Column<AuditEntry> title="Detail" render={(_, e) => <span className="cell-muted">{detail(e)}</span>} />
        <Table.Column title="IP" dataIndex="ip" render={(v: string) => <span className="cell-muted">{v}</span>} />
      </Table>
    </ListCard>
  );
}

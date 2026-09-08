import { PlusOutlined } from "@ant-design/icons";
import { useTable } from "@refinedev/antd";
import { Button, Table } from "antd";
import { useState } from "react";
import { ListCard } from "../../components/ListCard";
import { Spot } from "../../components/Spot";
import { StatusTag } from "../../components/StatusTag";
import type { Staff } from "../../data/fake/people";
import { ROLE_LABELS, describeAccess } from "../../lib/access";
import { dayLabel, initials } from "../../lib/format";
import { StaffForm } from "./StaffForm";

export function StaffList() {
  const { tableProps } = useTable<Staff>({ resource: "staff", pagination: { mode: "off" } });
  const [editing, setEditing] = useState<Staff | null | undefined>(undefined);
  return (
    <ListCard
      title="Staff"
      subtitle="Who runs the programme, and which pages each of them may open."
      aside={<Spot id="add-staff" inline><Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing(null)}>Add staff</Button></Spot>}
    >
      <Table<Staff> {...tableProps} rowKey="id" pagination={false}>
        <Table.Column<Staff> title="Account" dataIndex="name" render={(_, s) => (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="who__avatar" style={{ width: 36, height: 36, fontSize: 12 }}>{initials(s.name)}</span>
            <div><div className="cell-primary">{s.name}</div><div className="cell-muted">{s.email}</div></div>
          </div>
        )} />
        <Table.Column<Staff> title="Role" dataIndex="role" render={(r: Staff["role"]) => <span className={`chip ${r === "owner" ? "" : "chip--lavender"}`}>{ROLE_LABELS[r]}</span>} />
        <Table.Column<Staff> title="Access" dataIndex="pages" render={(pages: Staff["pages"]) => <span className="cell-muted">{describeAccess(pages)}</span>} />
        <Table.Column title="Status" dataIndex="status" render={(s: string) => <StatusTag status={s} />} />
        <Table.Column<Staff> title="Last seen" dataIndex="lastSeenAt" render={(v: string | null) => <span className="cell-muted">{v ? dayLabel(new Date(v)) : "never"}</span>} />
        <Table.Column<Staff> title="" render={(_, s) => (s.role === "owner" ? null : <Button size="small" onClick={() => setEditing(s)}>Edit access</Button>)} />
      </Table>
      <StaffForm open={editing !== undefined} account={editing ?? null} onClose={() => setEditing(undefined)} />
    </ListCard>
  );
}

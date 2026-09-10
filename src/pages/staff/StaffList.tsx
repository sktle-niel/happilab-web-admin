import { PlusOutlined } from "@ant-design/icons";
import { useTable } from "@refinedev/antd";
import { useMutation } from "@tanstack/react-query";
import { Button, Space, Table } from "antd";
import { useState } from "react";
import { toast } from "sonner";
import { ListCard } from "../../components/ListCard";
import { Spot } from "../../components/Spot";
import { StatusTag } from "../../components/StatusTag";
import type { Staff } from "../../data/types";
import { ROLE_LABELS, describeAccess } from "../../lib/access";
import { api } from "../../lib/api";
import { dayLabel, initials } from "../../lib/format";
import { useAccountStatus } from "../../lib/useAccountStatus";
import { useStaffSession } from "../../providers/session";
import { StaffForm } from "./StaffForm";

/** The wire says suspended and pending; the page says deactivated and waiting for its code. */
const LABELS: Partial<Record<Staff["status"], string>> = { suspended: "Deactivated", pending: "Pending code" };

const WORDS = {
  off: "deactivated",
  on: "reactivated",
  offDescription: "Signed out everywhere. The account keeps its role and pages for when it comes back.",
  onDescription: "They can sign in again, with a code as always.",
};

/** A fresh activation code for an account still waiting on its first; the API's refusal is told as it worded it. */
function useResendCode() {
  const { mutate, isPending } = useMutation({
    mutationFn: (account: Staff) => api.post(`/v1/admin/staff/${account.id}/invite`),
    onSuccess: (_, account) => toast.success(`Code sent again to ${account.email}`, { description: "It is good for a day." }),
    onError: (error: Error) => toast.error(error.message),
  });
  return { resend: mutate, sending: isPending };
}

type SwitchProps = { account: Staff; onDisable: (s: Staff) => void; onEnable: (s: Staff) => void };

function StaffSwitch({ account, onDisable, onEnable }: SwitchProps) {
  return account.status === "active" ? (
    <Button size="small" type="text" danger onClick={() => onDisable(account)}>Deactivate</Button>
  ) : (
    <Button size="small" onClick={() => onEnable(account)}>Reactivate</Button>
  );
}

export function StaffList() {
  const { tableProps } = useTable<Staff>({ resource: "staff", pagination: { mode: "off" } });
  const { identity } = useStaffSession();
  const { disable, enable } = useAccountStatus("staff", WORDS);
  const { resend, sending } = useResendCode();
  const [editing, setEditing] = useState<Staff | null | undefined>(undefined);
  // The API refuses edits to the owner and to oneself, so neither row offers them.
  const untouchable = (s: Staff) => s.role === "owner" || s.id === identity?.id;
  return (
    <ListCard
      title="Staff"
      subtitle="Who runs the programme, and which pages each of them may open."
      aside={<Spot id="add-staff" inline><Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing(null)}>Add support</Button></Spot>}
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
        <Table.Column<Staff> title="Status" dataIndex="status" render={(s: Staff["status"]) => <StatusTag status={s} label={LABELS[s]} />} />
        <Table.Column<Staff> title="Last seen" dataIndex="lastSeenAt" className="cell-nowrap" render={(v: string | null) => <span className="cell-muted">{v ? dayLabel(new Date(v)) : "never"}</span>} />
        <Table.Column<Staff> title="" render={(_, s) => (untouchable(s) ? null : (
          <Space>
            <Button size="small" onClick={() => setEditing(s)}>Edit access</Button>
            {s.status === "pending" ? (
              <Button size="small" loading={sending} onClick={() => resend(s)}>Resend code</Button>
            ) : (
              <StaffSwitch account={s} onDisable={disable} onEnable={enable} />
            )}
          </Space>
        ))} />
      </Table>
      <StaffForm open={editing !== undefined} account={editing ?? null} onClose={() => setEditing(undefined)} />
    </ListCard>
  );
}

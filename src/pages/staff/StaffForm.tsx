import { Checkbox, Form, Input, Modal, Select } from "antd";
import { useEffect } from "react";
import type { Staff } from "../../data/fake/people";
import { ALL_PAGES, ROLE_LABELS, ROLE_PRESETS, pageLabel, type PageKey, type StaffRole } from "../../lib/access";
import { useSaveRecord } from "../../lib/useSaveRecord";

type Values = { name: string; email: string; role: Exclude<StaffRole, "owner">; pages: PageKey[] };
type Props = { open: boolean; account: Staff | null; onClose: () => void };

const ROLE_OPTIONS = (["admin", "support"] as const).map((role) => ({ value: role, label: ROLE_LABELS[role] }));
const PAGE_OPTIONS = ALL_PAGES.filter((key) => key !== "dashboard").map((key) => ({ value: key, label: pageLabel(key) }));

/** One form for a new account and for changing what an existing one may open. */
export function StaffForm({ open, account, onClose }: Props) {
  const [form] = Form.useForm<Values>();
  const { save, busy } = useSaveRecord("staff", { created: "Account added", updated: "Access updated" });

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue(account ? { name: account.name, email: account.email, role: account.role === "owner" ? "admin" : account.role, pages: account.pages } : { name: "", email: "", role: "support", pages: ROLE_PRESETS.support });
  }, [open, account, form]);

  /** Picking a role fills the boxes with its preset; the boxes can then be changed by hand. */
  const applyPreset = (role: Values["role"]) => form.setFieldsValue({ pages: ROLE_PRESETS[role] });

  const submit = (values: Values) => {
    const pages: PageKey[] = ["dashboard", ...values.pages.filter((key) => key !== "dashboard")];
    if (account) save(account.id, { name: values.name, role: values.role, pages }, onClose, `${values.name} can open ${pages.length - 1} pages besides the dashboard.`);
    else save(null, { ...values, pages, status: "active", lastSeenAt: null }, onClose, "They can sign in with a code from their email.");
  };

  return (
    <Modal open={open} onCancel={onClose} onOk={form.submit} okText={account ? "Save access" : "Add account"} confirmLoading={busy} title={account ? `Access for ${account.name}` : "New staff account"} destroyOnHidden>
      <Form<Values> form={form} layout="vertical" onFinish={submit} requiredMark={false}>
        <Form.Item name="name" label="Name" rules={[{ required: true, min: 2, max: 80 }]}><Input /></Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}><Input disabled={account !== null} /></Form.Item>
        <Form.Item name="role" label="Role" extra="A role is a starting set of pages; tick or untick below to fit the person.">
          <Select options={ROLE_OPTIONS} onChange={applyPreset} />
        </Form.Item>
        <Form.Item name="pages" label="Pages this account can open" extra="Dashboard is always on, and shows only the cards of these pages.">
          <Checkbox.Group className="page-grid" options={PAGE_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

import { useCreate, useUpdate } from "@refinedev/core";
import { Checkbox, Form, Input, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import type { Staff } from "../../data/fake/people";
import { ALL_PAGES, ROLE_LABELS, ROLE_PRESETS, pageLabel, type PageKey, type StaffRole } from "../../lib/access";

type Values = { name: string; email: string; role: Exclude<StaffRole, "owner">; pages: PageKey[] };
type Props = { open: boolean; account: Staff | null; onClose: () => void };

const ROLE_OPTIONS = (["admin", "support"] as const).map((role) => ({ value: role, label: ROLE_LABELS[role] }));
const PAGE_OPTIONS = ALL_PAGES.filter((key) => key !== "dashboard").map((key) => ({ value: key, label: pageLabel(key) }));

/** One form for a new account and for changing what an existing one may open. */
export function StaffForm({ open, account, onClose }: Props) {
  const [form] = Form.useForm<Values>();
  const { mutate: create } = useCreate();
  const { mutate: update } = useUpdate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue(account ? { name: account.name, email: account.email, role: account.role === "owner" ? "admin" : account.role, pages: account.pages } : { name: "", email: "", role: "support", pages: ROLE_PRESETS.support });
  }, [open, account, form]);

  /** Picking a role fills the boxes with its preset; the boxes can then be changed by hand. */
  const applyPreset = (role: Values["role"]) => form.setFieldValue("pages", ROLE_PRESETS[role]);

  const submit = (values: Values) => {
    const pages: PageKey[] = ["dashboard", ...values.pages.filter((key) => key !== "dashboard")];
    setBusy(true);
    const done = { onSuccess: onClose, onSettled: () => setBusy(false) };
    if (account) {
      update({ resource: "staff", id: account.id, values: { name: values.name, role: values.role, pages }, successNotification: { message: "Access updated", description: `${values.name} can open ${pages.length - 1} pages besides the dashboard.`, type: "success" } }, done);
    } else {
      create({ resource: "staff", values: { ...values, pages, status: "active", lastSeenAt: null }, successNotification: { message: "Account added", description: "They can sign in with a code from their email.", type: "success" } }, done);
    }
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

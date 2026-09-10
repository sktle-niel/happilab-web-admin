import { Checkbox, Form, Input, Modal } from "antd";
import { useEffect } from "react";
import type { Staff } from "../../data/types";
import { ALL_PAGES, ROLE_PRESETS, pageLabel, type PageKey } from "../../lib/access";
import { useSaveRecord } from "../../lib/useSaveRecord";

type Values = { name: string; email: string; pages: PageKey[] };
type Props = { open: boolean; account: Staff | null; onClose: () => void };

const PAGE_OPTIONS = ALL_PAGES.filter((key) => key !== "dashboard").map((key) => ({ value: key, label: pageLabel(key) }));

/**
 * One form for a new account and for changing what an existing one may
 * open. Every account added here is support: the owner is the one
 * administrator, and the API refuses any other role.
 */
export function StaffForm({ open, account, onClose }: Props) {
  const [form] = Form.useForm<Values>();
  const { save, busy } = useSaveRecord("staff", { created: "Account added", updated: "Access updated" });

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue(account ? { name: account.name, email: account.email, pages: account.pages } : { name: "", email: "", pages: ROLE_PRESETS.support });
  }, [open, account, form]);

  const submit = (values: Values) => {
    const pages: PageKey[] = ["dashboard", ...values.pages.filter((key) => key !== "dashboard")];
    if (account) save(account.id, { name: values.name, pages }, onClose, `${values.name} can open ${pages.length - 1} pages besides the dashboard.`);
    else save(null, { ...values, pages }, onClose, "An email with a link to choose their password is on its way.");
  };

  return (
    <Modal open={open} onCancel={onClose} onOk={form.submit} okText={account ? "Save access" : "Add support account"} confirmLoading={busy} title={account ? `Access for ${account.name}` : "New support account"} destroyOnHidden>
      <Form<Values> form={form} layout="vertical" onFinish={submit} requiredMark={false}>
        <Form.Item name="name" label="Name" rules={[{ required: true, min: 2, max: 80 }]}><Input /></Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}><Input disabled={account !== null} /></Form.Item>
        <Form.Item name="pages" label="Pages this account can open" extra="Support accounts read these pages and work the desk; only the owner changes money, the catalogue, the copy, the settings and this list. Dashboard is always on, and shows only the cards of these pages.">
          <Checkbox.Group className="page-grid" options={PAGE_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

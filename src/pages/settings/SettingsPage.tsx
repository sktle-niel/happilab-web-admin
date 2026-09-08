import { InboxOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, InputNumber, Select, Upload } from "antd";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { PageHead } from "../../components/Card";
import { Spot } from "../../components/Spot";

/** The keys the API keeps under /v1/admin/settings, one card each, with the Falcon Crest defaults filled in. */
const DEFAULTS = {
  brand: { name: "AC Falcon Crest Ventures", tagline: "Share a code, earn on every order it brings in.", support_name: "Falcon Crest Support" },
  programme: { earn_rate_label: "5–7%", points_per_peso: 1, min_cash_out_points: 1000, cash_out_presets: [1000, 2000], payout_methods: ["gcash", "maya"], arrival_note: "It usually arrives within 24 hours." },
  support: { status_line: "Online · replies within 24 hours", acknowledgement: "Thanks, we have got it. A teammate will reply here within 24 hours." },
};

const backend = import.meta.env.VITE_BACKEND ?? "fake";
const apiUrl = import.meta.env.VITE_API_BASE_URL ?? "";

function SettingsCard({ title, spot, children }: { title: string; spot: string; children: ReactNode }) {
  return (
    <div className="card" data-spot={spot}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

/** A form field the search can land on. */
function Field({ spot, name, label, rules, children }: { spot: string; name: string; label: string; rules?: object[]; children: ReactNode }) {
  return (
    <Spot id={spot}>
      <Form.Item name={name} label={label} rules={rules}>{children}</Form.Item>
    </Spot>
  );
}

const wide = { style: { width: "100%" } };

export function SettingsPage() {
  const save = (key: string) => () => toast.success(`${key} saved for this session. The API keeps it once connected.`);
  return (
    <>
      <PageHead title="Settings" subtitle="What the app says, shows and promises. Every change reaches members on their next launch." />
      <div className="settings-grid stagger">
        <SettingsCard title="Brand" spot="brand">
          <Form layout="vertical" initialValues={DEFAULTS.brand} onFinish={save("Brand")} requiredMark={false}>
            <Field spot="brand-name" name="name" label="App name" rules={[{ required: true, min: 2, max: 40 }]}><Input /></Field>
            <Field spot="brand-tagline" name="tagline" label="Tagline" rules={[{ max: 120 }]}><Input /></Field>
            <Field spot="brand-support-name" name="support_name" label="Support name" rules={[{ required: true, min: 2, max: 60 }]}><Input /></Field>
            <Button type="primary" htmlType="submit">Save brand</Button>
          </Form>
        </SettingsCard>

        <SettingsCard title="Programme" spot="programme">
          <Form layout="vertical" initialValues={DEFAULTS.programme} onFinish={save("Programme")} requiredMark={false}>
            <Field spot="earn-rate" name="earn_rate_label" label="Earn rate, as shown" rules={[{ required: true, max: 20 }]}><Input /></Field>
            <Field spot="points-per-peso" name="points_per_peso" label="Points per peso" rules={[{ required: true }]}><InputNumber min={1} max={1000} {...wide} /></Field>
            <Field spot="min-cash-out" name="min_cash_out_points" label="Minimum cash-out, points" rules={[{ required: true }]}><InputNumber min={100} max={1_000_000} step={100} {...wide} /></Field>
            <Field spot="cash-out-presets" name="cash_out_presets" label="Preset amounts"><Select mode="tags" tokenSeparators={[","]} /></Field>
            <Field spot="payout-methods" name="payout_methods" label="Payout methods"><Checkbox.Group options={[{ label: "GCash", value: "gcash" }, { label: "Maya", value: "maya" }]} /></Field>
            <Field spot="arrival-note" name="arrival_note" label="Arrival note" rules={[{ required: true, max: 120 }]}><Input /></Field>
            <Button type="primary" htmlType="submit">Save programme</Button>
          </Form>
        </SettingsCard>

        <SettingsCard title="Assets" spot="assets">
          <p className="cell-muted" style={{ marginTop: 0 }}>The backdrop behind every screen, the logo, and the onboarding clips. Images and mp4 only.</p>
          <Upload.Dragger multiple={false} beforeUpload={() => { toast("Uploads land with the API and Supabase Storage."); return Upload.LIST_IGNORE; }}>
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">Drop a backdrop, logo or clip here</p>
            <p className="ant-upload-hint">Signed straight into storage; the app picks it up on its next launch.</p>
          </Upload.Dragger>
        </SettingsCard>

        <SettingsCard title="Support copy" spot="support-copy">
          <Form layout="vertical" initialValues={DEFAULTS.support} onFinish={save("Support copy")} requiredMark={false}>
            <Field spot="status-line" name="status_line" label="Status line" rules={[{ required: true, max: 80 }]}><Input /></Field>
            <Field spot="acknowledgement" name="acknowledgement" label="Acknowledgement" rules={[{ required: true, max: 200 }]}><Input.TextArea rows={3} /></Field>
            <Button type="primary" htmlType="submit">Save support copy</Button>
          </Form>
        </SettingsCard>

        <SettingsCard title="Backend" spot="backend">
          <p className="cell-muted" style={{ marginTop: 0 }}>Where this admin reads and writes. Set at build time, never from the browser.</p>
          <Form layout="vertical">
            <Form.Item label="Data source"><Input value={backend === "api" ? "API" : "Bundled data"} readOnly /></Form.Item>
            <Form.Item label="API base URL"><Input value={apiUrl || "—"} readOnly /></Form.Item>
          </Form>
          <code className="cell-muted">VITE_BACKEND=api VITE_API_BASE_URL=https://api.example.com npm run build</code>
        </SettingsCard>
      </div>
    </>
  );
}

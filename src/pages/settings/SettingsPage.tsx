import { InboxOutlined } from "@ant-design/icons";
import { App, Button, Checkbox, Form, Input, InputNumber, Select, Upload } from "antd";
import { PageHead } from "../../components/Card";

/** The keys the API keeps under /v1/admin/settings, one card each, with the Falcon Crest defaults filled in. */
const DEFAULTS = {
  brand: { name: "AC Falcon Crest Ventures", tagline: "Share a code, earn on every order it brings in.", support_name: "Falcon Crest Support" },
  programme: { earn_rate_label: "5–7%", points_per_peso: 1, min_cash_out_points: 1000, cash_out_presets: [1000, 2000], payout_methods: ["gcash", "maya"], arrival_note: "It usually arrives within 24 hours." },
  support: { status_line: "Online · replies within 24 hours", acknowledgement: "Thanks, we have got it. A teammate will reply here within 24 hours." },
};

const backend = import.meta.env.VITE_BACKEND ?? "fake";
const apiUrl = import.meta.env.VITE_API_BASE_URL ?? "";

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export function SettingsPage() {
  const { message } = App.useApp();
  const save = (key: string) => () => message.success(`${key} saved for this session. The API keeps it once connected.`);
  return (
    <>
      <PageHead title="Settings" subtitle="What the app says, shows and promises. Every change reaches members on their next launch." />
      <div className="settings-grid">
        <SettingsCard title="Brand">
          <Form layout="vertical" initialValues={DEFAULTS.brand} onFinish={save("Brand")} requiredMark={false}>
            <Form.Item name="name" label="App name" rules={[{ required: true, min: 2, max: 40 }]}><Input /></Form.Item>
            <Form.Item name="tagline" label="Tagline" rules={[{ max: 120 }]}><Input /></Form.Item>
            <Form.Item name="support_name" label="Support name" rules={[{ required: true, min: 2, max: 60 }]}><Input /></Form.Item>
            <Button type="primary" htmlType="submit">Save brand</Button>
          </Form>
        </SettingsCard>

        <SettingsCard title="Programme">
          <Form layout="vertical" initialValues={DEFAULTS.programme} onFinish={save("Programme")} requiredMark={false}>
            <Form.Item name="earn_rate_label" label="Earn rate, as shown" rules={[{ required: true, max: 20 }]}><Input /></Form.Item>
            <Form.Item name="points_per_peso" label="Points per peso" rules={[{ required: true }]}><InputNumber min={1} max={1000} style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="min_cash_out_points" label="Minimum cash-out, points" rules={[{ required: true }]}><InputNumber min={100} max={1_000_000} step={100} style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="cash_out_presets" label="Preset amounts"><Select mode="tags" tokenSeparators={[","]} /></Form.Item>
            <Form.Item name="payout_methods" label="Payout methods"><Checkbox.Group options={[{ label: "GCash", value: "gcash" }, { label: "Maya", value: "maya" }]} /></Form.Item>
            <Form.Item name="arrival_note" label="Arrival note" rules={[{ required: true, max: 120 }]}><Input /></Form.Item>
            <Button type="primary" htmlType="submit">Save programme</Button>
          </Form>
        </SettingsCard>

        <SettingsCard title="Assets">
          <p className="cell-muted" style={{ marginTop: 0 }}>The backdrop behind every screen, the logo, and the onboarding clips. Images and mp4 only.</p>
          <Upload.Dragger multiple={false} beforeUpload={() => { message.info("Uploads land with the API and Supabase Storage."); return Upload.LIST_IGNORE; }}>
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">Drop a backdrop, logo or clip here</p>
            <p className="ant-upload-hint">Signed straight into storage; the app picks it up on its next launch.</p>
          </Upload.Dragger>
        </SettingsCard>

        <SettingsCard title="Support copy">
          <Form layout="vertical" initialValues={DEFAULTS.support} onFinish={save("Support copy")} requiredMark={false}>
            <Form.Item name="status_line" label="Status line" rules={[{ required: true, max: 80 }]}><Input /></Form.Item>
            <Form.Item name="acknowledgement" label="Acknowledgement" rules={[{ required: true, max: 200 }]}><Input.TextArea rows={3} /></Form.Item>
            <Button type="primary" htmlType="submit">Save support copy</Button>
          </Form>
        </SettingsCard>

        <SettingsCard title="Backend">
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

import { Button, Checkbox, Form, Input, InputNumber, Select } from "antd";
import { toast } from "sonner";
import { PageHead } from "../../components/Card";
import { saveSetting, useSettings, type SettingKey, type Settings } from "../../data/fake/settings";
import { backend } from "../../lib/env";
import { AssetsCard } from "./AssetsCard";
import { Field, SettingsCard } from "./SettingsCard";

const apiUrl = import.meta.env.VITE_API_BASE_URL ?? "";
const wide = { style: { width: "100%" } };
const SAVED = "Members see it on their next launch.";

/** Presets arrive as tags, so as strings; the app wants distinct whole numbers, ascending. */
const tidyProgramme = (value: Settings["programme"]): Settings["programme"] => ({
  ...value,
  cash_out_presets: [...new Set((value.cash_out_presets as (number | string)[]).map(Number).filter((n) => Number.isInteger(n) && n > 0))].sort((a, b) => a - b),
});

export function SettingsPage() {
  const settings = useSettings();
  const save =
    <K extends SettingKey>(key: K, label: string, tidy: (value: Settings[K]) => Settings[K] = (value) => value) =>
    (value: Settings[K]) => {
      saveSetting(key, tidy(value));
      toast.success(`${label} saved`, { description: SAVED });
    };
  return (
    <>
      <PageHead title="Settings" subtitle="What the app says, shows and promises. Every change reaches members on their next launch." />
      <div className="settings-grid stagger">
        <SettingsCard title="Brand" spot="brand">
          <Form layout="vertical" initialValues={settings.brand} onFinish={save("brand", "Brand")} requiredMark={false}>
            <Field spot="brand-name" name="name" label="App name" rules={[{ required: true, min: 2, max: 40 }]}><Input /></Field>
            <Field spot="brand-tagline" name="tagline" label="Tagline" rules={[{ max: 120 }]}><Input /></Field>
            <Field spot="brand-support-name" name="support_name" label="Support name" rules={[{ required: true, min: 2, max: 60 }]}><Input /></Field>
            <Button type="primary" htmlType="submit">Save brand</Button>
          </Form>
        </SettingsCard>

        <SettingsCard title="Programme" spot="programme">
          <Form layout="vertical" initialValues={settings.programme} onFinish={save("programme", "Programme", tidyProgramme)} requiredMark={false}>
            <Field spot="earn-rate" name="earn_rate_label" label="Earn rate, as shown" rules={[{ required: true, max: 20 }]}><Input /></Field>
            <Field spot="points-per-peso" name="points_per_peso" label="Points per peso" rules={[{ required: true }]}><InputNumber min={1} max={1000} {...wide} /></Field>
            <Field spot="min-cash-out" name="min_cash_out_points" label="Minimum cash-out, points" rules={[{ required: true }]}><InputNumber min={100} max={1_000_000} step={100} {...wide} /></Field>
            <Field spot="cash-out-presets" name="cash_out_presets" label="Preset amounts"><Select mode="tags" tokenSeparators={[","]} /></Field>
            <Field spot="payout-methods" name="payout_methods" label="Payout methods" rules={[{ required: true, message: "Keep at least one wallet." }]}><Checkbox.Group options={[{ label: "GCash", value: "gcash" }, { label: "Maya", value: "maya" }]} /></Field>
            <Field spot="arrival-note" name="arrival_note" label="Arrival note" rules={[{ required: true, max: 120 }]}><Input /></Field>
            <Button type="primary" htmlType="submit">Save programme</Button>
          </Form>
        </SettingsCard>

        <AssetsCard />

        <SettingsCard title="Support copy" spot="support-copy">
          <Form layout="vertical" initialValues={settings.support} onFinish={save("support", "Support copy")} requiredMark={false}>
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

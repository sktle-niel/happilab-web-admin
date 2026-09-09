import { Button, Checkbox, Form, Input, InputNumber, Select } from "antd";
import { toast } from "sonner";
import { PageHead } from "../../components/Card";
import type { SettingKey, Settings } from "../../data/types";
import { API_BASE_URL } from "../../lib/config";
import { useSaveSetting, useSettings } from "../../lib/useSettings";
import { AssetsCard } from "./AssetsCard";
import { Field, SettingsCard } from "./SettingsCard";

const wide = { style: { width: "100%" } };
const SAVED = "Members see it on their next launch.";

/** Presets arrive as tags, so as strings; the app wants distinct whole numbers, ascending. */
const tidyProgramme = (value: Settings["programme"]): Settings["programme"] => ({
  ...value,
  cashOutPresets: [...new Set((value.cashOutPresets as (number | string)[]).map(Number).filter((n) => Number.isInteger(n) && n > 0))].sort((a, b) => a - b),
});

export function SettingsPage() {
  const { settings } = useSettings();
  const { save, saving } = useSaveSetting();
  if (!settings) return <PageHead title="Settings" subtitle="Loading what the app says, shows and promises…" />;
  const submit =
    <K extends SettingKey>(key: K, label: string, tidy: (value: Settings[K]) => Settings[K] = (value) => value) =>
    (value: Settings[K]) =>
      save({ key, value: tidy(value) }).then(
        () => toast.success(`${label} saved`, { description: SAVED }),
        (error: Error) => toast.error(error.message),
      );
  return (
    <>
      <PageHead title="Settings" subtitle="What the app says, shows and promises. Every change reaches members on their next launch." />
      <div className="settings-grid stagger">
        <SettingsCard title="Brand" spot="brand">
          <Form layout="vertical" initialValues={settings.brand} onFinish={submit("brand", "Brand")} requiredMark={false}>
            <Field spot="brand-name" name="name" label="App name" rules={[{ required: true, min: 2, max: 40 }]}><Input /></Field>
            <Field spot="brand-tagline" name="tagline" label="Tagline" rules={[{ max: 120 }]}><Input /></Field>
            <Field spot="brand-support-name" name="supportName" label="Support name" rules={[{ required: true, min: 2, max: 60 }]}><Input /></Field>
            <Button type="primary" htmlType="submit" loading={saving}>Save brand</Button>
          </Form>
        </SettingsCard>

        <SettingsCard title="Programme" spot="programme">
          <Form layout="vertical" initialValues={settings.programme} onFinish={submit("programme", "Programme", tidyProgramme)} requiredMark={false}>
            <Field spot="earn-rate" name="earnRateLabel" label="Earn rate, as shown" rules={[{ required: true, max: 20 }]}><Input /></Field>
            <Field spot="points-per-peso" name="pointsPerPeso" label="Points per peso" rules={[{ required: true }]}><InputNumber min={1} max={1000} {...wide} /></Field>
            <Field spot="min-cash-out" name="minCashOutPoints" label="Minimum cash-out, points" rules={[{ required: true }]}><InputNumber min={100} max={1_000_000} step={100} {...wide} /></Field>
            <Field spot="cash-out-presets" name="cashOutPresets" label="Preset amounts"><Select mode="tags" tokenSeparators={[","]} /></Field>
            <Field spot="payout-methods" name="payoutMethods" label="Payout methods" rules={[{ required: true, message: "Keep at least one wallet." }]}><Checkbox.Group options={[{ label: "GCash", value: "gcash" }, { label: "Maya", value: "maya" }]} /></Field>
            <Field spot="arrival-note" name="arrivalNote" label="Arrival note" rules={[{ required: true, max: 120 }]}><Input /></Field>
            <Button type="primary" htmlType="submit" loading={saving}>Save programme</Button>
          </Form>
        </SettingsCard>

        <AssetsCard />

        <SettingsCard title="Support copy" spot="support-copy">
          <Form layout="vertical" initialValues={settings.support} onFinish={submit("support", "Support copy")} requiredMark={false}>
            <Field spot="status-line" name="statusLine" label="Status line" rules={[{ required: true, max: 80 }]}><Input /></Field>
            <Field spot="acknowledgement" name="acknowledgement" label="Acknowledgement" rules={[{ required: true, max: 200 }]}><Input.TextArea rows={3} /></Field>
            <Button type="primary" htmlType="submit" loading={saving}>Save support copy</Button>
          </Form>
        </SettingsCard>

        <SettingsCard title="Backend" spot="backend">
          <p className="cell-muted" style={{ marginTop: 0 }}>Where this admin reads and writes. Set at build time, never from the browser.</p>
          <Form layout="vertical">
            <Form.Item label="API base URL"><Input value={API_BASE_URL} readOnly /></Form.Item>
          </Form>
          <code className="cell-muted">VITE_API_BASE_URL=https://api.example.com npm run build</code>
        </SettingsCard>
      </div>
    </>
  );
}

import { Form } from "antd";
import type { ReactNode } from "react";
import { Spot } from "../../components/Spot";

/** One settings key per card; the search lands on the card by its spot. */
export function SettingsCard({ title, spot, children }: { title: string; spot: string; children: ReactNode }) {
  return (
    <div className="card" data-spot={spot}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

/** A form field the search can land on. */
export function Field({ spot, name, label, rules, children }: { spot: string; name: string; label: string; rules?: object[]; children: ReactNode }) {
  return (
    <Spot id={spot}>
      <Form.Item name={name} label={label} rules={rules}>{children}</Form.Item>
    </Spot>
  );
}

import { Form, Input, InputNumber, Segmented, Switch } from "antd";
import { BADGES, STORES } from "../../lib/products";
import { httpsOnly, required } from "../../lib/rules";

const BADGE_OPTIONS = [{ label: "None", value: "" }, ...BADGES.map((badge) => ({ label: badge.label, value: badge.value }))];
const atLeastOne = { type: "number" as const, min: 1, message: "At least 1." };

/** The fields in the order a person fills them: what it is, what it costs and earns, where it sells, whether it shows. */
export function ProductFields() {
  return (
    <>
      <div className="field-grid">
        <Form.Item name="name" label="Product name" rules={[required("Give it a name."), { min: 2, max: 80, message: "2 to 80 characters." }]}>
          <Input placeholder="Sakura Glow Soap" maxLength={80} />
        </Form.Item>
        <Form.Item name="badge" label="Badge over the photo">
          <Segmented options={BADGE_OPTIONS} />
        </Form.Item>
      </div>
      <Form.Item name="blurb" label="Blurb" rules={[required("Say what it is in a line."), { max: 120, message: "Up to 120 characters." }]}>
        <Input.TextArea rows={2} maxLength={120} showCount placeholder="Gentle wellness soap with sunscreen benefits" />
      </Form.Item>
      <div className="field-grid field-grid--3">
        <Form.Item name="price" label="Price" rules={[required("Set a price."), atLeastOne]}>
          <InputNumber prefix="₱" min={1} step={10} placeholder="150" />
        </Form.Item>
        <Form.Item name="pointsMin" label="Points per sale, from" rules={[required("The least it earns."), atLeastOne]}>
          <InputNumber min={1} placeholder="7" />
        </Form.Item>
        <Form.Item
          name="pointsMax"
          label="Points per sale, up to"
          dependencies={["pointsMin"]}
          rules={[
            required("The most it earns."),
            atLeastOne,
            ({ getFieldValue }) => ({
              validator: (_, value: number | null) => (value == null || value >= (getFieldValue("pointsMin") ?? 0) ? Promise.resolve() : Promise.reject(new Error("Not below the lower figure."))),
            }),
          ]}
        >
          <InputNumber min={1} placeholder="11" />
        </Form.Item>
      </div>
      <p className="field-note">Store links. A share opens the store with the member's code attached; a store without a link opens a search for the name.</p>
      <div className="field-grid field-grid--3">
        {STORES.map((store) => (
          <Form.Item key={store.key} name={["storeLinks", store.key]} label={store.label} rules={[{ type: "url", message: "Enter a full link." }, httpsOnly]}>
            <Input placeholder={store.placeholder} />
          </Form.Item>
        ))}
      </div>
      <Form.Item name="isActive" label="Live in the app" valuePropName="checked" extra="Off keeps it here in the catalogue and out of the app.">
        <Switch />
      </Form.Item>
    </>
  );
}

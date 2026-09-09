import { useCreate, useList, useOne, useUpdate } from "@refinedev/core";
import { Button, Form, Input, InputNumber, Segmented, Switch } from "antd";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { PageHead } from "../../components/Card";
import type { Product } from "../../data/fake/catalogue";
import { BADGES, STORES } from "../../lib/products";
import { PhotoDrop } from "./PhotoDrop";
import { ProductPreview } from "./ProductPreview";
import { EMPTY, fromRecord, toRecord, type ProductValues } from "./productValues";

const BADGE_OPTIONS = [{ label: "None", value: "" }, ...BADGES.map((badge) => ({ label: badge.label, value: badge.value }))];
const required = (message: string) => ({ required: true, message });
const atLeastOne = { type: "number" as const, min: 1, message: "At least 1." };
const httpsOnly = {
  validator: (_: unknown, url?: string) => (!url || url.startsWith("https://") ? Promise.resolve() : Promise.reject(new Error("Links start with https://."))),
};
const SAVED = { type: "success" as const, description: "Members see it on their next launch." };

/** The fields in the order a person fills them: what it is, what it costs and earns, where it sells, whether it shows. */
function Fields() {
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

function Missing({ onBack }: { onBack: () => void }) {
  return (
    <div className="card no-access">
      <h2>No such product</h2>
      <p>It may have been removed since this link was made.</p>
      <Button type="primary" onClick={onBack}>Back to products</Button>
    </div>
  );
}

/** One page adds a product and edits one: the preview on the left is redrawn from the fields on the right. */
export function ProductEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = id !== undefined;
  const [form] = Form.useForm<ProductValues>();
  const [busy, setBusy] = useState(false);
  const { result: record, query } = useOne<Product>({ resource: "products", id: id ?? "", queryOptions: { enabled: editing } });
  const { result: catalogue } = useList<Product>({ resource: "products", pagination: { mode: "off" }, queryOptions: { enabled: !editing } });
  const { mutate: create } = useCreate<Product>();
  const { mutate: update } = useUpdate<Product>();
  const watched = Form.useWatch([], form);
  const back = () => navigate("/products");

  if (editing && query.isError) return <Missing onBack={back} />;
  if (editing && !record) return <PageHead title="Edit product" subtitle="Loading…" />;

  const initial = record ? fromRecord(record) : EMPTY;
  const live: ProductValues = { ...initial, ...watched };
  // A new product joins the end of the order the app shows.
  const nextPosition = (catalogue?.data ?? []).reduce((max, p) => Math.max(max, p.position), 0) + 1;

  const submit = (values: ProductValues) => {
    setBusy(true);
    const done = { onSuccess: back, onSettled: () => setBusy(false) };
    if (record) update({ resource: "products", id: record.id, values: toRecord(values, record.position), successNotification: { ...SAVED, message: "Product saved" } }, done);
    else create({ resource: "products", values: toRecord(values, nextPosition), successNotification: { ...SAVED, message: "Product added" } }, done);
  };

  return (
    <>
      <PageHead title={record ? "Edit product" : "Add product"} subtitle="The card on the left is the product as members see it; fill it in on the right." />
      <Form<ProductValues> key={id ?? "new"} form={form} layout="vertical" requiredMark={false} initialValues={initial} onFinish={submit}>
        <div className="product-editor">
          <ProductPreview values={live} isEdit={record !== undefined} busy={busy} onCancel={back} onSave={() => form.submit()} />
          <div className="product-editor__main stagger">
            <section className="card">
              <h3>Product photo</h3>
              <Form.Item name="imageUrl" rules={[required("Add a photo; the card has nothing to show without one.")]}>
                <PhotoDrop />
              </Form.Item>
            </section>
            <section className="card">
              <h3>Product information</h3>
              <Fields />
            </section>
          </div>
        </div>
      </Form>
    </>
  );
}

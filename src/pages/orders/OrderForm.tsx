import { useList } from "@refinedev/core";
import { Form, Input, InputNumber, Segmented, Select } from "antd";
import { useEffect } from "react";
import { RecordModal } from "../../components/RecordModal";
import type { Product } from "../../data/fake/catalogue";
import type { Order } from "../../data/fake/money";
import type { Member } from "../../data/fake/people";
import { pesos } from "../../lib/format";
import { required } from "../../lib/rules";
import { useSaveRecord } from "../../lib/useSaveRecord";

type Values = { externalReference: string; buyerId: string; productId: string; quantity: number; pointsAwarded: number; status: "confirmed" | "placed" };
const EMPTY: Values = { externalReference: "", buyerId: "", productId: "", quantity: 1, pointsAwarded: 0, status: "confirmed" };
const STATUSES = [
  { label: "Confirmed", value: "confirmed" },
  { label: "Placed", value: "placed" },
];

const referrerOf = (buyer: Member | undefined, all: Member[]) => (buyer?.referredBy ? all.find((m) => m.id === buyer.referredBy) : undefined);

/** The fields follow each other: the buyer names the referrer, the product and quantity set the points. */
function OrderFields({ buyers, all, products }: { buyers: Member[]; all: Member[]; products: Product[] }) {
  const form = Form.useFormInstance<Values>();
  const productId = Form.useWatch("productId", form);
  const quantity = Form.useWatch("quantity", form) ?? 1;
  const buyerId = Form.useWatch("buyerId", form);
  const product = products.find((p) => p.id === productId);
  const buyer = all.find((m) => m.id === buyerId);
  const referrer = referrerOf(buyer, all);

  useEffect(() => {
    // setFieldsValue, not setFieldValue: the latter trips a false circular-reference warning inside rc-field-form.
    if (product) form.setFieldsValue({ pointsAwarded: product.pointsMin * quantity });
  }, [product, quantity, form]);

  const pointsHint = product ? `${product.pointsMin * quantity} to ${product.pointsMax * quantity} pts for this order.` : "Pick a product first.";
  const buyerHint = buyer ? (referrer ? `Referred by ${referrer.name}, who earns the points.` : "No referrer on this account, so no points to award.") : undefined;

  return (
    <>
      <Form.Item name="externalReference" label="Store reference" rules={[required("The store's order number."), { min: 4, max: 40, message: "4 to 40 characters." }]}>
        <Input placeholder="SHP-482910337" />
      </Form.Item>
      <Form.Item name="buyerId" label="Buyer" rules={[required("Who bought it?")]} extra={buyerHint}>
        <Select showSearch optionFilterProp="label" placeholder="Search a member" options={buyers.map((m) => ({ value: m.id, label: `${m.name} · ${m.referralCode}` }))} />
      </Form.Item>
      <div className="field-grid">
        <Form.Item name="productId" label="Product" rules={[required("Which product?")]}>
          <Select placeholder="Pick one" options={products.map((p) => ({ value: p.id, label: `${p.name} · ${pesos(p.priceCentavos / 100)}` }))} />
        </Form.Item>
        <Form.Item name="quantity" label="Quantity" rules={[required("At least one."), { type: "number", min: 1, message: "At least one." }]}>
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
      </div>
      <div className="field-grid">
        <Form.Item name="pointsAwarded" label="Points to the referrer" extra={pointsHint} rules={[required("Zero or more."), { type: "number", min: 0, message: "Zero or more." }]}>
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="status" label="Status" extra="Points move only once confirmed.">
          <Segmented options={STATUSES} />
        </Form.Item>
      </div>
    </>
  );
}

/** Records an order from a store; on confirmed, the provider pays the referrer as the API's ledger would. */
export function OrderForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { result: memberList } = useList<Member>({ resource: "members", pagination: { mode: "off" }, queryOptions: { enabled: open } });
  const { result: productList } = useList<Product>({ resource: "products", pagination: { mode: "off" }, sorters: [{ field: "position", order: "asc" }], queryOptions: { enabled: open } });
  const { save, busy } = useSaveRecord("orders", { created: "Order recorded", updated: "Order saved", description: "Confirmed orders pay the referrer at once." });
  const all = memberList?.data ?? [];
  const buyers = all.filter((m) => m.status === "active");
  const products = (productList?.data ?? []).filter((p) => p.isActive && !p.deletedAt);

  const submit = (values: Values) => {
    const buyer = all.find((m) => m.id === values.buyerId);
    const product = products.find((p) => p.id === values.productId);
    if (!buyer || !product) return;
    const referrer = referrerOf(buyer, all);
    const order: Omit<Order, "id"> = {
      externalReference: values.externalReference.trim(),
      buyerId: buyer.id,
      buyerName: buyer.name,
      referrerName: referrer?.name ?? "—",
      product: product.name,
      quantity: values.quantity,
      totalCentavos: product.priceCentavos * values.quantity,
      pointsAwarded: referrer ? values.pointsAwarded : 0,
      status: values.status,
      placedAt: new Date().toISOString(),
    };
    save(null, order, onClose);
  };

  return (
    <RecordModal open={open} title="Record order" okText="Record order" initialValues={EMPTY} busy={busy} onCancel={onClose} onSubmit={submit}>
      <OrderFields buyers={buyers} all={all} products={products} />
    </RecordModal>
  );
}

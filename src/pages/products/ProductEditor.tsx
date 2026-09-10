import { useOne } from "@refinedev/core";
import { Button, Form } from "antd";
import { useNavigate, useParams } from "react-router";
import { PageHead } from "../../components/Card";
import type { Product } from "../../data/types";
import { required } from "../../lib/rules";
import { useSaveRecord } from "../../lib/useSaveRecord";
import { PhotoDrop } from "./PhotoDrop";
import { ProductFields } from "./ProductFields";
import { ProductPreview } from "./ProductPreview";
import { useProductRemoval } from "./useProductRemoval";
import { EMPTY, fromRecord, toRecord, type ProductValues } from "./productValues";

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
  const { result: record, query } = useOne<Product>({ resource: "products", id: id ?? "", queryOptions: { enabled: editing } });
  const { save, busy } = useSaveRecord("products", { created: "Product added", updated: "Product saved", description: "Members see it on their next launch." });
  const { softDelete } = useProductRemoval();
  const watched = Form.useWatch([], form);
  const back = () => navigate("/products");

  if (editing && query.isError) return <Missing onBack={back} />;
  if (editing && !record) return <PageHead title="Edit product" subtitle="Loading…" />;

  const initial = record ? fromRecord(record) : EMPTY;
  const live: ProductValues = { ...initial, ...watched };
  // A new product joins the end of the order the app shows; the API gives it its place.
  const submit = (values: ProductValues) => save(record?.id ?? null, toRecord(values), back);

  return (
    <>
      <PageHead title={record ? "Edit product" : "Add product"} subtitle="The card on the left is the product as members see it; fill it in on the right." />
      <Form<ProductValues> key={id ?? "new"} form={form} layout="vertical" requiredMark={false} initialValues={initial} onFinish={submit}>
        <div className="product-editor">
          <ProductPreview values={live} isEdit={record !== undefined} busy={busy} onCancel={back} onSave={() => form.submit()} onDelete={record ? () => softDelete(record, back) : undefined} />
          <div className="product-editor__main stagger">
            <section className="card">
              <h3>Product photo</h3>
              <Form.Item name="imageUrl" rules={[required("Add a photo; the card has nothing to show without one.")]}>
                <PhotoDrop />
              </Form.Item>
            </section>
            <section className="card">
              <h3>Product information</h3>
              <ProductFields />
            </section>
          </div>
        </div>
      </Form>
    </>
  );
}

import { PictureOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { pesos } from "../../lib/format";
import { STORES, badgeOf, earnLabel } from "../../lib/products";
import type { ProductValues } from "./productValues";

type Props = { values: ProductValues; isEdit: boolean; busy: boolean; onCancel: () => void; onSave: () => void; onDelete?: () => void };

/** The product as the app's grid tile shows it, redrawn from the form as it is typed. */
export function ProductPreview({ values, isEdit, busy, onCancel, onSave, onDelete }: Props) {
  const badge = badgeOf(values.badge);
  const stores = STORES.filter((store) => values.storeLinks?.[store.key]);
  return (
    <aside className="card product-preview" aria-label="Preview">
      <div className="product-preview__photo">
        {values.imageUrl ? (
          <img src={values.imageUrl} alt="" />
        ) : (
          <span className="product-preview__empty">
            <PictureOutlined />
            No photo yet
          </span>
        )}
        {badge && <span className={`pbadge pbadge--${badge.tone}`}>{badge.pill}</span>}
      </div>
      <div className="product-preview__body">
        <h3 className={values.name ? "" : "placeholder"}>{values.name || "Product name"}</h3>
        <p className={values.blurb ? "" : "placeholder"}>{values.blurb || "One line about it, as members read it under the name."}</p>
        <div className="product-preview__money">
          <b className={values.price ? "" : "placeholder"}>{pesos(values.price ?? 0)}</b>
          <small className={values.points ? "" : "placeholder"}>{earnLabel(values.points ?? 0)}</small>
        </div>
        <div className="product-preview__stores">
          {stores.length ? stores.map((store) => <span key={store.key} className="chip">{store.label}</span>) : <span className="cell-muted">Shares open a store search</span>}
        </div>
        <div className="product-preview__state">
          <span className="status-dot" style={{ background: values.isActive ? "var(--lime)" : "#d9d9d4" }} />
          {values.isActive ? "Live in the app" : "Hidden from the app"}
        </div>
      </div>
      <footer className="product-preview__footer">
        <Button onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button type="primary" onClick={onSave} loading={busy}>{isEdit ? "Save product" : "Create product"}</Button>
      </footer>
      {onDelete && (
        <button type="button" className="product-preview__delete" onClick={onDelete} disabled={busy}>
          Delete this product
        </button>
      )}
    </aside>
  );
}

import type { Product, ProductBadge } from "../../data/fake/catalogue";
import type { Store } from "../../lib/products";

/** The form's shape: pesos rather than centavos, and "" for no badge so a chip row can hold it. */
export type ProductValues = {
  name: string;
  blurb: string;
  price: number | null;
  pointsMin: number | null;
  pointsMax: number | null;
  badge: ProductBadge | "";
  imageUrl: string;
  storeLinks: Partial<Record<Store, string>>;
  isActive: boolean;
};

export const EMPTY: ProductValues = { name: "", blurb: "", price: null, pointsMin: null, pointsMax: null, badge: "", imageUrl: "", storeLinks: {}, isActive: true };

export const fromRecord = (p: Product): ProductValues => ({
  name: p.name,
  blurb: p.blurb,
  price: p.priceCentavos / 100,
  pointsMin: p.pointsMin,
  pointsMax: p.pointsMax,
  badge: p.badge ?? "",
  imageUrl: p.imageUrl,
  storeLinks: p.storeLinks,
  isActive: p.isActive,
});

/** What the table keeps. Validation has already made every number real; empty links are dropped. */
export const toRecord = (v: ProductValues, position: number): Omit<Product, "id"> => ({
  name: v.name.trim(),
  blurb: v.blurb.trim(),
  priceCentavos: Math.round((v.price ?? 0) * 100),
  pointsMin: v.pointsMin ?? 0,
  pointsMax: v.pointsMax ?? 0,
  imageUrl: v.imageUrl,
  badge: v.badge || null,
  isActive: v.isActive,
  position,
  storeLinks: Object.fromEntries(Object.entries(v.storeLinks ?? {}).filter(([, url]) => url?.trim())) as Product["storeLinks"],
});

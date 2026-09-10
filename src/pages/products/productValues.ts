import type { Product, ProductBadge } from "../../data/types";
import type { Store } from "../../lib/products";

/** The form's shape: pesos rather than centavos, and "" for no badge so a chip row can hold it. */
export type ProductValues = {
  name: string;
  blurb: string;
  price: number | null;
  points: number | null;
  badge: ProductBadge | "";
  imageUrl: string;
  storeLinks: Partial<Record<Store, string>>;
  isActive: boolean;
};

export const EMPTY: ProductValues = { name: "", blurb: "", price: null, points: null, badge: "", imageUrl: "", storeLinks: {}, isActive: true };

export const fromRecord = (p: Product): ProductValues => ({
  name: p.name,
  blurb: p.blurb,
  price: p.priceCentavos / 100,
  points: p.points,
  badge: p.badge ?? "",
  imageUrl: p.imageUrl,
  storeLinks: p.storeLinks,
  isActive: p.isActive,
});

/** What the API keeps. Validation has already made every number real; empty links are dropped. Position and the soft-delete stamp are the API's, never the form's. */
export const toRecord = (v: ProductValues): Omit<Product, "id" | "deletedAt" | "position"> => ({
  name: v.name.trim(),
  blurb: v.blurb.trim(),
  priceCentavos: Math.round((v.price ?? 0) * 100),
  points: v.points ?? 0,
  imageUrl: v.imageUrl,
  badge: v.badge || null,
  isActive: v.isActive,
  storeLinks: Object.fromEntries(Object.entries(v.storeLinks ?? {}).filter(([, url]) => url?.trim())) as Product["storeLinks"],
});

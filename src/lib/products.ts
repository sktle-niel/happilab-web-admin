import type { Product, ProductBadge } from "../data/fake/catalogue";

/** The storefronts a product can be shared to, in the app's order. */
export type Store = keyof Product["storeLinks"];
export const STORES: { key: Store; label: string; placeholder: string }[] = [
  { key: "tiktok", label: "TikTok", placeholder: "https://www.tiktok.com/…" },
  { key: "shopee", label: "Shopee", placeholder: "https://shopee.ph/…" },
  { key: "lazada", label: "Lazada", placeholder: "https://www.lazada.com.ph/…" },
];

export type Badge = NonNullable<ProductBadge>;

/** The badge over the photo: the admin's wording, and the pill text and tone the app paints it in. */
export const BADGES: { value: Badge; label: string; pill: string; tone: "lime" | "red" | "ink" }[] = [
  { value: "topSale", label: "Top sale", pill: "TOP SALE", tone: "lime" },
  { value: "newArrival", label: "New", pill: "NEW", tone: "red" },
  { value: "comingSoon", label: "Coming soon", pill: "SOON", tone: "ink" },
];

export const badgeOf = (badge: ProductBadge | "") => BADGES.find((b) => b.value === badge);

/** The earn line under the price, worded as the app's grid tile words it. */
export const earnLabel = (min: number, max: number) => `Earn ${min === max ? min : `${min}–${max}`} pts`;

import type { Hit, HitType } from "./search";

const KEY = "happilab-admin.recent";
const MAX = 3;
const TYPES: HitType[] = ["members", "orders", "cash-outs", "products", "pages"];

/** Stored rows are data from a browser, not from us: only the shape we wrote is read back. */
const isHit = (value: unknown): value is Hit => {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.key === "string" && TYPES.includes(v.type as HitType) && typeof v.title === "string" && typeof v.subtitle === "string" && typeof v.to === "string" && v.to.startsWith("/") && (v.stat === undefined || typeof v.stat === "string");
};

/** The last few things opened from the search, newest first. */
export function readRecent(): Hit[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isHit).slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function remember(hit: Hit): Hit[] {
  const next = [hit, ...readRecent().filter((h) => h.key !== hit.key)].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // No storage, no memory; the list still works for this visit.
  }
  return next;
}

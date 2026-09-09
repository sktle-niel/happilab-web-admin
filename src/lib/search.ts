import { products } from "../data/fake/catalogue";
import { cashOuts, orders } from "../data/fake/money";
import { members } from "../data/fake/people";
import { findDestinations } from "./destinations";
import { pesos, thousands } from "./format";

/** What the top bar can look for, in the order the chips show. */
export type HitType = "members" | "orders" | "cash-outs" | "products" | "pages";
export const HIT_TYPES: { type: HitType; label: string }[] = [
  { type: "members", label: "Members" },
  { type: "orders", label: "Orders" },
  { type: "cash-outs", label: "Cash-outs" },
  { type: "products", label: "Products" },
  { type: "pages", label: "Pages" },
];

/** One thing found: where it goes, and the figure worth showing beside it. */
export type Hit = { key: string; type: HitType; title: string; subtitle: string; to: string; stat?: string };
export type HitGroup = { type: HitType; label: string; to?: string; hits: Hit[] };

const LIMIT = 4;
const has = (q: string, ...fields: (string | null | undefined)[]) => fields.some((field) => field?.toLowerCase().includes(q));
const listWith = (path: string, term: string) => `${path}?q=${encodeURIComponent(term)}`;

const finders: Record<HitType, (q: string, term: string) => Hit[]> = {
  pages: (_q, term) => findDestinations(term).map((d) => ({ key: `pages:${d.to}`, type: "pages", title: d.title, subtitle: d.crumb, to: d.to })),
  members: (q) =>
    members
      .filter((m) => has(q, m.name, m.email, m.referralCode))
      .slice(0, LIMIT)
      .map((m) => ({ key: `members:${m.id}`, type: "members", title: m.name, subtitle: m.email, to: listWith("/members", m.name), stat: `${thousands(m.points)} pts` })),
  orders: (q) =>
    orders
      .filter((o) => has(q, o.externalReference, o.buyerName))
      .slice(0, LIMIT)
      .map((o) => ({ key: `orders:${o.id}`, type: "orders", title: o.externalReference, subtitle: `${o.buyerName} · ${o.product}`, to: listWith("/orders", o.externalReference), stat: pesos(o.totalCentavos / 100) })),
  "cash-outs": (q) =>
    cashOuts
      .filter((c) => has(q, c.reference, c.memberName))
      .slice(0, LIMIT)
      .map((c) => ({ key: `cash-outs:${c.id}`, type: "cash-outs", title: c.reference, subtitle: `${c.memberName} · ${c.status}`, to: listWith("/cash-outs", c.reference), stat: pesos(c.points) })),
  products: (q) =>
    products
      .filter((p) => !p.deletedAt && has(q, p.name, p.blurb))
      .slice(0, LIMIT)
      .map((p) => ({ key: `products:${p.id}`, type: "products", title: p.name, subtitle: p.blurb, to: listWith("/products", p.name), stat: pesos(p.priceCentavos / 100) })),
};

const listPath: Partial<Record<HitType, string>> = { members: "/members", orders: "/orders", "cash-outs": "/cash-outs", products: "/products" };

/** Everything the top bar can find among [types], a few per group, pages first. */
export function searchAll(query: string, types: readonly HitType[]): HitGroup[] {
  const term = query.trim();
  const q = term.toLowerCase();
  if (q.length < 2) return [];
  return HIT_TYPES.filter((t) => types.includes(t.type))
    .sort((a, b) => Number(b.type === "pages") - Number(a.type === "pages"))
    .map(({ type, label }) => {
      const path = listPath[type];
      return { type, label, hits: finders[type](q, term), ...(path && { to: listWith(path, term) }) };
    })
    .filter((group) => group.hits.length > 0);
}

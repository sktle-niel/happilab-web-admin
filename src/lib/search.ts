import { products } from "../data/fake/catalogue";
import { cashOuts, orders } from "../data/fake/money";
import { members } from "../data/fake/people";
import { findDestinations } from "./destinations";

export type Hit = { key: string; title: string; subtitle: string; to: string };
export type HitGroup = { label: string; to?: string; hits: Hit[] };

const LIMIT = 4;
const has = (q: string, ...fields: (string | null | undefined)[]) => fields.some((field) => field?.toLowerCase().includes(q));
const listWith = (path: string, term: string) => `${path}?q=${encodeURIComponent(term)}`;

/** Everything the top bar can find: places first, then records, a few per group. */
export function searchAll(query: string): HitGroup[] {
  const term = query.trim();
  const q = term.toLowerCase();
  if (q.length < 2) return [];
  const groups: HitGroup[] = [
    {
      label: "Pages",
      hits: findDestinations(term).map((d) => ({ key: d.to, title: d.title, subtitle: d.crumb, to: d.to })),
    },
    {
      label: "Members",
      to: listWith("/members", term),
      hits: members
        .filter((m) => has(q, m.name, m.email, m.referralCode))
        .slice(0, LIMIT)
        .map((m) => ({ key: m.id, title: m.name, subtitle: `${m.referralCode} · ${m.email}`, to: listWith("/members", m.name) })),
    },
    {
      label: "Orders",
      to: listWith("/orders", term),
      hits: orders
        .filter((o) => has(q, o.externalReference, o.buyerName))
        .slice(0, LIMIT)
        .map((o) => ({ key: o.id, title: o.externalReference, subtitle: `${o.buyerName} · ${o.product}`, to: listWith("/orders", o.externalReference) })),
    },
    {
      label: "Cash-outs",
      to: listWith("/cash-outs", term),
      hits: cashOuts
        .filter((c) => has(q, c.reference, c.memberName))
        .slice(0, LIMIT)
        .map((c) => ({ key: c.id, title: c.reference, subtitle: `${c.memberName} · ${c.status}`, to: listWith("/cash-outs", c.reference) })),
    },
    {
      label: "Products",
      to: listWith("/products", term),
      hits: products
        .filter((p) => has(q, p.name, p.blurb))
        .slice(0, LIMIT)
        .map((p) => ({ key: p.id, title: p.name, subtitle: p.blurb, to: listWith("/products", p.name) })),
    },
  ];
  return groups.filter((group) => group.hits.length > 0);
}

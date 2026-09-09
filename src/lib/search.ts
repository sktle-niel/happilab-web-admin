import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api, query as queryString } from "./api";
import { toCamel } from "./case";
import { findDestinations } from "./destinations";

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

type RemoteType = Exclude<HitType, "pages">;
type Found = { groups: { type: RemoteType; label: string; hits: { id: string; title: string; subtitle: string; stat: string | null }[] }[] };

const MIN = 2;
const WAIT_MS = 250;
const listPath: Record<RemoteType, string> = { members: "/members", orders: "/orders", "cash-outs": "/cash-outs", products: "/products" };
const listWith = (path: string, term: string) => `${path}?q=${encodeURIComponent(term)}`;

/** The value once it has held still for a moment, so a search runs per pause, not per keystroke. */
function useSettled(value: string) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(value), WAIT_MS);
    return () => window.clearTimeout(timer);
  }, [value]);
  return settled;
}

/** Pages found here, then whatever the API found among [types], a few per group; the API answers only for the pages the account may open. */
export function useSearch(input: string, types: readonly HitType[]): HitGroup[] {
  const term = input.trim();
  const settled = useSettled(term);
  const remote = types.filter((t): t is RemoteType => t !== "pages");
  const { data } = useQuery({
    queryKey: ["search", settled, remote.join(",")],
    queryFn: () => api.get(`/v1/admin/search${queryString({ q: settled, types: remote.join(",") })}`).then((body) => toCamel<Found>(body)),
    enabled: settled.length >= MIN && remote.length > 0,
    placeholderData: keepPreviousData,
  });
  if (term.length < MIN) return [];
  const pages: Hit[] = types.includes("pages") ? findDestinations(term).map((d) => ({ key: `pages:${d.to}`, type: "pages", title: d.title, subtitle: d.crumb, to: d.to })) : [];
  const groups: HitGroup[] = (data?.groups ?? [])
    .filter((group) => remote.includes(group.type))
    .map((group) => ({
      type: group.type,
      label: group.label,
      to: listWith(listPath[group.type], term),
      hits: group.hits.map((hit) => ({ key: `${group.type}:${hit.id}`, type: group.type, title: hit.title, subtitle: hit.subtitle, to: listWith(listPath[group.type], hit.title), ...(hit.stat && { stat: hit.stat }) })),
    }));
  return [...(pages.length > 0 ? [{ type: "pages" as const, label: "Pages", hits: pages }] : []), ...groups];
}

import { seeded } from "../../lib/seeded";
import { members } from "./people";
import { products } from "./catalogue";

export type CashOutStatus = "requested" | "review" | "processing" | "sent" | "failed";
export type CashOut = {
  id: string;
  reference: string;
  memberId: string;
  memberName: string;
  wallet: "gcash" | "maya";
  numberLast4: string;
  points: number;
  status: CashOutStatus;
  requestedAt: string;
  sentAt: string | null;
  failureReason: string | null;
};

export type Order = {
  id: string;
  externalReference: string;
  buyerId: string;
  buyerName: string;
  referrerName: string;
  product: string;
  quantity: number;
  totalCentavos: number;
  pointsAwarded: number;
  status: "placed" | "confirmed" | "cancelled" | "refunded";
  placedAt: string;
};

export type AuditEntry = { id: string; at: string; actor: string; action: string; entity: string; ip: string; detail: string };

const random = seeded(88);
/** Anchored on today, so the tables always read as this week's programme. */
const TODAY = new Date(new Date().toDateString()).getTime();
const isoDaysAgo = (days: number, hour = 9) => new Date(TODAY + hour * 3_600_000 - days * 86_400_000).toISOString();
const active = members.filter((m) => m.status === "active");

const STATUSES: CashOutStatus[] = ["requested", "requested", "review", "processing", "sent", "sent", "sent", "failed"];

export const cashOuts: CashOut[] = Array.from({ length: 58 }, (_, i) => {
  const member = random.pick(active);
  const status = i < 14 ? (i < 9 ? "requested" : i < 12 ? "review" : "processing") : random.pick(STATUSES);
  const days = i < 14 ? random.int(0, 4) : random.int(3, 120);
  return {
    id: `c${String(i + 1).padStart(3, "0")}`,
    reference: `CO-${random.int(10_000_000, 99_999_999).toString(36).toUpperCase().padStart(8, "X")}`,
    memberId: member.id,
    memberName: member.name,
    wallet: random.next() < 0.7 ? "gcash" : "maya",
    numberLast4: String(random.int(1000, 9999)),
    points: random.pick([1000, 1000, 1500, 2000, 2500, 3000, 5000]),
    status,
    requestedAt: isoDaysAgo(days, random.int(7, 11)),
    sentAt: status === "sent" ? isoDaysAgo(Math.max(0, days - random.int(1, 3)), 14) : null,
    failureReason: status === "failed" ? "Wallet number not registered" : null,
  };
});

export const orders: Order[] = Array.from({ length: 140 }, (_, i) => {
  const buyer = random.pick(active);
  const referrer = members.find((m) => m.id === buyer.referredBy) ?? members[0];
  const product = random.pick(products.filter((p) => p.isActive));
  const quantity = random.int(1, 3);
  return {
    id: `o${String(i + 1).padStart(3, "0")}`,
    externalReference: `SHP-${random.int(100_000_000, 999_999_999)}`,
    buyerId: buyer.id,
    buyerName: buyer.name,
    referrerName: referrer?.name ?? "—",
    product: product.name,
    quantity,
    totalCentavos: product.priceCentavos * quantity,
    pointsAwarded: random.int(product.pointsMin, product.pointsMax) * quantity,
    status: random.next() < 0.9 ? "confirmed" : random.pick(["placed", "cancelled", "refunded"] as const),
    // A handful land today, so the dashboard has a day to show before anything is recorded.
    placedAt: isoDaysAgo(i < 6 ? 0 : random.int(1, 180), random.int(8, 12)),
  };
});

const ACTIONS = [
  ["cash_out.sent", "cash_outs", "Marked CO-8FK2Q1 as sent"],
  ["settings.updated", "settings", "Changed brand.name"],
  ["product.updated", "products", "Sunscreen SPF50 price"],
  ["member.suspended", "members", "Rhea Torres"],
  ["staff.signed_in", "staff", "From Chrome on Windows"],
  ["order.recorded", "orders", "SHP-482910337, 27 pts"],
  ["post.published", "feed_posts", "Payouts within 24 hours"],
] as const;
const ACTORS = ["Niel Ladica", "Maria Santos", "Paolo Reyes"];

export const audit: AuditEntry[] = Array.from({ length: 80 }, (_, i) => {
  const [action, entity, detail] = random.pick(ACTIONS);
  // From yesterday back, so what staff do today always sits above the seed.
  return { id: `a${String(i + 1).padStart(3, "0")}`, at: isoDaysAgo(Math.floor(i / 4) + 1, 18 - (i % 4) * 3), actor: random.pick(ACTORS), action, entity, ip: `203.0.113.${random.int(2, 250)}`, detail };
});

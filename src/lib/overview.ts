import type { CashOut, Order } from "../data/fake/money";
import type { Member } from "../data/fake/people";
import { OPEN_STATUSES } from "./cashOutMoves";

export type Range = "today" | "week" | "month";
export const RANGES: { key: Range; label: string; days: number; noun: string }[] = [
  { key: "today", label: "Today", days: 1, noun: "today" },
  { key: "week", label: "Last 7 days", days: 7, noun: "this week" },
  { key: "month", label: "Last 30 days", days: 30, noun: "in 30 days" },
];

export type Figures = {
  /** deltaPercent is null when the period before had nothing to compare against. */
  pointsIssued: { value: number; deltaPercent: number | null };
  orders: { count: number; pesos: number; rows: Order[] };
  pending: { count: number; pesos: number; rows: CashOut[] };
  activeMembers: { value: number; rows: Member[] };
  flow: { earned: number; cashedOut: number; pending: number; rows: CashOut[] };
};

const DAY = 86_400_000;
const within = (iso: string, from: number, to: number) => {
  const at = new Date(iso).getTime();
  return at >= from && at < to;
};
const sum = <T>(rows: T[], pick: (row: T) => number) => rows.reduce((total, row) => total + pick(row), 0);
const delta = (now: number, before: number) => (before === 0 ? null : Math.round(((now - before) / before) * 100));

/** The dashboard's figures for one range, counted from the tables the way the API's stats route will. */
export function figuresFor(range: Range, orders: Order[], cashOuts: CashOut[], members: Member[], now = Date.now()): Figures {
  const days = RANGES.find((r) => r.key === range)?.days ?? 1;
  const from = now - days * DAY;
  const confirmed = orders.filter((o) => o.status === "confirmed");
  const current = confirmed.filter((o) => within(o.placedAt, from, now));
  const previous = confirmed.filter((o) => within(o.placedAt, from - days * DAY, from));
  const earned = sum(current, (o) => o.pointsAwarded);
  const sent = cashOuts.filter((c) => c.status === "sent" && c.sentAt !== null && within(c.sentAt, from, now));
  const open = cashOuts.filter((c) => OPEN_STATUSES.includes(c.status));
  const active = members.filter((m) => m.status === "active");
  return {
    pointsIssued: { value: earned, deltaPercent: delta(earned, sum(previous, (o) => o.pointsAwarded)) },
    orders: { count: current.length, pesos: sum(current, (o) => o.totalCentavos) / 100, rows: current },
    pending: { count: open.length, pesos: sum(open, (c) => c.points), rows: open },
    activeMembers: { value: active.length, rows: active },
    flow: { earned, cashedOut: sum(sent, (c) => c.points), pending: sum(open, (c) => c.points), rows: [...sent, ...open] },
  };
}

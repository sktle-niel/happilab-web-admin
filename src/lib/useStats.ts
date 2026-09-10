import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import { toCamel } from "./case";

export type Range = "today" | "week" | "month";
export const RANGES: { key: Range; label: string; noun: string }[] = [
  { key: "today", label: "Today", noun: "today" },
  { key: "week", label: "Last 7 days", noun: "this week" },
  { key: "month", label: "Last 30 days", noun: "in 30 days" },
];

export type Point = { label: string; current: boolean; requested: number; sent: number };
/** The dashboard as the API counts it; `deltaPercent` is null when the window before had nothing to compare against. */
export type Stats = {
  range: Range;
  pointsIssued: { value: number; deltaPercent: number | null };
  orders: { count: number; pesos: number };
  pending: { count: number; pesos: number; undecided: number };
  activeMembers: { value: number; deltaPercent: number | null };
  flow: { earned: number; cashedOut: number; pending: number };
  stages: { label: string; percent: number }[];
  queue: { waiting: number; averageWaitMinutes: number; next: { id: string; memberName: string }[] };
  tickets: { open: number; untaken: number };
  signIns: { levels: number[]; busyDays: number; deltaPercent: number | null };
  cashOuts: { byMonth: Point[]; byWeek: Point[]; sentThisMonthPesos: number; averageSendHours: number };
};

/** What the cards show before the first answer, so nothing jumps. */
export const EMPTY_STATS: Stats = {
  range: "today",
  pointsIssued: { value: 0, deltaPercent: null },
  orders: { count: 0, pesos: 0 },
  pending: { count: 0, pesos: 0, undecided: 0 },
  activeMembers: { value: 0, deltaPercent: null },
  flow: { earned: 0, cashedOut: 0, pending: 0 },
  stages: [],
  queue: { waiting: 0, averageWaitMinutes: 0, next: [] },
  tickets: { open: 0, untaken: 0 },
  signIns: { levels: [], busyDays: 0, deltaPercent: null },
  cashOuts: { byMonth: [], byWeek: [], sentThisMonthPesos: 0, averageSendHours: 0 },
};

const REFRESH_MS = 15_000;

/** The figures for one range, re-counted every quarter minute while a page shows them; callers of the same range share one request. */
export function useStats(range: Range = "today") {
  return useQuery({ queryKey: ["stats", range], queryFn: () => api.get(`/v1/admin/stats?range=${range}`).then((body) => toCamel<Stats>(body)), refetchInterval: REFRESH_MS });
}

import { seeded } from "../../lib/seeded";

/** The figures the overview shows; the API's dashboard endpoint will answer the same shape. */
export const overview = {
  date: new Date(2026, 8, 8),
  pointsIssued: { value: 48_200, deltaPercent: 12 },
  pending: { count: 14, pesos: 38_500 },
  activeMembers: { value: 1284, deltaPercent: 5 },
  flow: { earned: 62_400, cashedOut: 41_000, pending: 12_600 },
  stages: [
    { label: "Repeat buyers", percent: 45, color: "var(--lavender)" },
    { label: "First orders", percent: 30, color: "var(--ink)" },
    { label: "Joined only", percent: 25, color: "var(--lime)" },
  ],
  queue: { waiting: 3, averageWaitMinutes: 4, names: ["Ana Villanueva", "Kim Bautista", "Leo Ramos"] },
  ordersToday: { count: 27, pesos: 12_400 },
  cashOutsByMonth: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, i) => ({
    month,
    requested: [18, 22, 25, 30, 28, 34, 31, 39, 41, 0, 0, 0][i] ?? 0,
    sent: [16, 21, 24, 27, 27, 31, 30, 36, 33, 0, 0, 0][i] ?? 0,
  })),
  sentThisMonth: 41_000,
  averageSendHours: 74,
};

const random = seeded(7);

/** Eight weeks of sign-ins, one level per day, newest last. */
export const signInLevels: number[] = Array.from({ length: 56 }, (_, i) => {
  const weekday = i % 7;
  const base = weekday >= 5 ? 1 : 2;
  return Math.min(3, Math.max(0, base + random.int(-1, 1) + (i > 44 ? 1 : 0)));
});

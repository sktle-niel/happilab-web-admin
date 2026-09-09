import type { CashOutStatus } from "../data/fake/money";

/** One step a request can take from where it stands; the API enforces the same moves. */
export type Move = { label: string; to: CashOutStatus; tone: "primary" | "quiet" | "danger" };

export const MOVES: Partial<Record<CashOutStatus, Move[]>> = {
  requested: [
    { label: "Approve", to: "processing", tone: "primary" },
    { label: "Review", to: "review", tone: "quiet" },
    { label: "Fail", to: "failed", tone: "danger" },
  ],
  review: [
    { label: "Approve", to: "processing", tone: "primary" },
    { label: "Fail", to: "failed", tone: "danger" },
  ],
  processing: [
    { label: "Mark sent", to: "sent", tone: "primary" },
    { label: "Fail", to: "failed", tone: "danger" },
  ],
};

/** The statuses still on the desk, as the queue counts them. */
export const OPEN_STATUSES: CashOutStatus[] = ["requested", "review", "processing"];

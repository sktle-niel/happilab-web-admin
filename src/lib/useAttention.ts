import { useList } from "@refinedev/core";
import type { CashOut } from "../data/fake/money";
import { useConversations } from "../data/fake/support";
import { OPEN_STATUSES } from "./cashOutMoves";

export type Notice = { key: string; label: string; to: string };

/** What is waiting on the desk right now, counted live: the bell, the sidebar badges and the search all read this. */
export function useAttention() {
  const { result } = useList<CashOut>({ resource: "cash-outs", pagination: { mode: "off" }, filters: [{ field: "status", operator: "in", value: OPEN_STATUSES }] });
  const open = result?.data ?? [];
  const undecided = open.filter((c) => c.status !== "processing");
  const queued = useConversations().filter((c) => c.status === "queued");
  const notices: Notice[] = [
    ...(undecided.length > 0 ? [{ key: "cash-outs", label: `${undecided.length} cash-out${undecided.length === 1 ? "" : "s"} waiting for review`, to: "/cash-outs" }] : []),
    ...(queued.length > 0 ? [{ key: "support", label: queued.length === 1 ? `${queued[0]?.memberName} is in the support queue` : `${queued.length} members in the support queue`, to: "/support" }] : []),
  ];
  return { pendingCashOuts: open.length, queued: queued.length, notices };
}

import { useStats } from "./useStats";

export type Notice = { key: string; label: string; to: string };

/** What is waiting on the desk right now, from the same figures the dashboard shows: the bell, the sidebar badges and the search all read this. */
export function useAttention() {
  const { data } = useStats("today");
  const pendingCashOuts = data?.pending.count ?? 0;
  const undecided = data?.pending.undecided ?? 0;
  const queued = data?.queue.waiting ?? 0;
  const first = data?.queue.next[0]?.memberName;
  const openTickets = data?.tickets.untaken ?? 0;
  const notices: Notice[] = [
    ...(undecided > 0 ? [{ key: "cash-outs", label: `${undecided} cash-out${undecided === 1 ? "" : "s"} waiting for review`, to: "/cash-outs" }] : []),
    ...(queued > 0 ? [{ key: "support", label: queued === 1 && first ? `${first} is in the support queue` : `${queued} members in the support queue`, to: "/support" }] : []),
    ...(openTickets > 0 ? [{ key: "tickets", label: `${openTickets} ticket${openTickets === 1 ? "" : "s"} nobody has taken`, to: "/support?view=tickets" }] : []),
  ];
  return { pendingCashOuts, queued, openTickets, notices };
}

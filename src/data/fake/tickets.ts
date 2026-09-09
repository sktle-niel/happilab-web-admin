/**
 * Follow-ups that outlive a chat: something about an account that a
 * teammate has to fix or check before the member hears back. Opened from
 * a conversation or on their own, taken by one agent, closed when done.
 */
export type TicketStatus = "open" | "in_progress" | "done";
export type TicketCategory = "account" | "cash_out" | "referral" | "points" | "payout" | "other";

/** The same topics the app offers a member when a chat starts. */
export const TICKET_CATEGORIES: { value: TicketCategory; label: string }[] = [
  { value: "account", label: "Account issue" },
  { value: "cash_out", label: "Cash out issue" },
  { value: "referral", label: "Referral not counted" },
  { value: "points", label: "Missing points" },
  { value: "payout", label: "Payout account" },
  { value: "other", label: "Something else" },
];
export const categoryLabel = (category: TicketCategory) => TICKET_CATEGORIES.find((c) => c.value === category)?.label ?? category;

export type TicketNote = { id: string; author: string; text: string; at: string };
export type Ticket = {
  id: string;
  reference: string;
  memberId: string;
  memberName: string;
  conversationId: string | null;
  category: TicketCategory;
  summary: string;
  details: string;
  status: TicketStatus;
  assignee: string | null;
  openedBy: string;
  openedAt: string;
  doneAt: string | null;
  notes: TicketNote[];
};

const TODAY = new Date(new Date().toDateString()).getTime();
const isoDaysAgo = (days: number, hour: number) => new Date(TODAY - days * 86_400_000 + hour * 3_600_000).toISOString();

export const tickets: Ticket[] = [
  {
    id: "t001", reference: "T-0001", memberId: "m052", memberName: "Miguel Ramos", conversationId: "c6", category: "payout",
    summary: "Wallet name does not match the account", details: "Cash-out CO-XXXBRWI2 is on hold: the GCash profile says M. Ramos Jr. Member was asked for a screenshot of the wallet profile.",
    status: "open", assignee: null, openedBy: "Maria Santos", openedAt: isoDaysAgo(2, 15.4), doneAt: null,
    notes: [{ id: "n1", author: "Maria Santos", text: "Screenshot requested in chat; nothing back yet.", at: isoDaysAgo(2, 15.5) }],
  },
  {
    id: "t002", reference: "T-0002", memberId: "m041", memberName: "Rhea Torres", conversationId: null, category: "points",
    summary: "27 pts missing from the order of the 3rd", details: "Order SHP-562819949 confirmed on the 3rd but no ledger entry for the referrer.",
    status: "done", assignee: "Paolo Reyes", openedBy: "Paolo Reyes", openedAt: isoDaysAgo(3, 9), doneAt: isoDaysAgo(1, 10.2),
    notes: [
      { id: "n2", author: "Paolo Reyes", text: "Store confirmation arrived late; the points post once it does.", at: isoDaysAgo(3, 9.5) },
      { id: "n3", author: "Paolo Reyes", text: "Confirmed this morning, 27 pts credited. Told Rhea in chat.", at: isoDaysAgo(1, 10.2) },
    ],
  },
  {
    id: "t003", reference: "T-0003", memberId: "m021", memberName: "Kim Bautista", conversationId: null, category: "referral",
    summary: "Cousin joined without the code", details: "Rhea Bautista signed up on Tuesday with no referral code, then ordered the soap. Kim says she shared the link.",
    status: "in_progress", assignee: "Maria Santos", openedBy: "Niel Ladica", openedAt: isoDaysAgo(1, 14), doneAt: null,
    notes: [{ id: "n4", author: "Maria Santos", text: "Checking the sign-up log for the code on the link.", at: isoDaysAgo(1, 14.5) }],
  },
];

import type { Conversation, Message, Sender } from "./support";

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000);
const daysAgo = (d: number, hour: number) => new Date(new Date(new Date().toDateString()).getTime() - d * 86_400_000 + hour * 3_600_000);
let nextId = 100;
const line = (sender: Sender, text: string, at: Date, imageUrl: string | null = null): Message => ({ id: `m${nextId++}`, sender, text, at, imageUrl });
export const nextMessageId = () => `m${nextId++}`;

const GREETING = "Hi! You are chatting with Falcon Crest support. What can we help you with today?";
type Live = Omit<Conversation, "endedAt" | "resolution" | "ticketIds">;
const live = (c: Live): Conversation => ({ ...c, endedAt: null, resolution: null, ticketIds: [] });

/** Three in line, one with Maria, and three that ended over the last days: two resolved, one carried into a ticket. */
export const seedConversations: Conversation[] = [
  live({ id: "c1", memberId: "m014", memberName: "Ana Villanueva", topic: "Cash out issue", status: "queued", agentName: null, openedAt: minutesAgo(9), messages: [
    line("bot", GREETING, minutesAgo(9)),
    line("member", "My cash out has a problem.", minutesAgo(8)),
    line("bot", "We will trace it. Which amount and which wallet was it sent to, and when did you request it?", minutesAgo(8)),
    line("member", "₱1,000 to GCash, last Friday. It still says processing.", minutesAgo(7)),
    line("system", "Ana asked for an agent. Number 1 in line.", minutesAgo(6)),
  ] }),
  live({ id: "c2", memberId: "m021", memberName: "Kim Bautista", topic: "Referral not counted", status: "queued", agentName: null, openedAt: minutesAgo(6), messages: [
    line("bot", GREETING, minutesAgo(6)),
    line("member", "A referral of mine was not counted.", minutesAgo(5)),
    line("bot", "Let us check. Who did you refer, and roughly when did they order?", minutesAgo(5)),
    line("member", "My cousin Rhea, she ordered the soap on Tuesday.", minutesAgo(4)),
    line("system", "Kim asked for an agent. Number 2 in line.", minutesAgo(4)),
  ] }),
  live({ id: "c3", memberId: "m033", memberName: "Leo Ramos", topic: "Payout account", status: "queued", agentName: null, openedAt: minutesAgo(3), messages: [
    line("bot", GREETING, minutesAgo(3)),
    line("member", "I need help with my payout account.", minutesAgo(2)),
    line("bot", "Happy to help. Is it GCash or Maya, and what needs changing?", minutesAgo(2)),
    line("system", "Leo asked for an agent. Number 3 in line.", minutesAgo(2)),
  ] }),
  live({ id: "c4", memberId: "m008", memberName: "Bea Torres", topic: "Missing points", status: "with_agent", agentName: "Maria Santos", openedAt: minutesAgo(25), messages: [
    line("member", "Some of my points are missing.", minutesAgo(24)),
    line("bot", "We will look into it. Which order are the points from, and on what date?", minutesAgo(24)),
    line("system", "Maria Santos joined the chat.", minutesAgo(20)),
    line("agent", "Hi Bea, Maria here. I can see the order from the 3rd; the points post once the store confirms delivery.", minutesAgo(19)),
    line("member", "Ah okay, it was delivered yesterday.", minutesAgo(18)),
  ] }),
  { id: "c5", memberId: "m041", memberName: "Rhea Torres", topic: "Missing points", status: "ended", agentName: "Paolo Reyes", openedAt: daysAgo(1, 10), endedAt: daysAgo(1, 10.4), resolution: "resolved", ticketIds: [], messages: [
    line("member", "Some of my points are missing.", daysAgo(1, 10)),
    line("system", "Paolo Reyes joined the chat.", daysAgo(1, 10.1)),
    line("agent", "Hi Rhea. The order was confirmed this morning; 27 pts are on your balance now.", daysAgo(1, 10.2)),
    line("member", "I see them, thank you!", daysAgo(1, 10.3)),
    line("system", "Marked resolved by Paolo Reyes.", daysAgo(1, 10.4)),
  ] },
  { id: "c6", memberId: "m052", memberName: "Miguel Ramos", topic: "Payout account", status: "ended", agentName: "Maria Santos", openedAt: daysAgo(2, 15), endedAt: daysAgo(2, 15.5), resolution: "unresolved", ticketIds: ["t001"], messages: [
    line("member", "I need help with my payout account.", daysAgo(2, 15)),
    line("system", "Maria Santos joined the chat.", daysAgo(2, 15.1)),
    line("agent", "Hi Miguel. The name on the wallet does not match your account, so the cash-out is on hold. Can you send a screenshot of the wallet profile?", daysAgo(2, 15.2)),
    line("member", "", daysAgo(2, 15.3), "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=480&q=80"),
    line("system", "Ticket T-0001 opened: Payout account.", daysAgo(2, 15.4)),
    line("system", "Chat ended by Maria Santos.", daysAgo(2, 15.5)),
  ] },
  { id: "c7", memberId: "m060", memberName: "Ivy Santos", topic: "Account issue", status: "ended", agentName: "Maria Santos", openedAt: daysAgo(3, 11), endedAt: daysAgo(3, 11.3), resolution: "resolved", ticketIds: [], messages: [
    line("member", "I have a problem with my account.", daysAgo(3, 11)),
    line("system", "Maria Santos joined the chat.", daysAgo(3, 11.1)),
    line("agent", "Hi Ivy. Your account was disabled after five wrong passwords; it is enabled again, try signing in.", daysAgo(3, 11.2)),
    line("member", "It works now, thanks.", daysAgo(3, 11.25)),
    line("system", "Marked resolved by Maria Santos.", daysAgo(3, 11.3)),
  ] },
];

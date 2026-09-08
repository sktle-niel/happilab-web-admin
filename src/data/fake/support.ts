import { useSyncExternalStore } from "react";

/**
 * The support desk on bundled data: who is waiting, who is being helped,
 * and every line said. Kept in memory for the tab and pushed to whoever
 * is looking, the way the API's channel will.
 */
export type Sender = "member" | "bot" | "agent" | "system";
export type Message = { id: string; sender: Sender; text: string; at: Date };
export type Conversation = {
  id: string;
  memberId: string;
  memberName: string;
  topic: string;
  status: "queued" | "with_agent" | "ended";
  agentName: string | null;
  openedAt: Date;
  messages: Message[];
};

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000);
let nextId = 100;
const line = (sender: Sender, text: string, at: Date): Message => ({ id: `m${nextId++}`, sender, text, at });

let conversations: Conversation[] = [
  {
    id: "c1", memberId: "m014", memberName: "Ana Villanueva", topic: "Cash out issue", status: "queued", agentName: null, openedAt: minutesAgo(9),
    messages: [
      line("bot", "Hi! You are chatting with Falcon Crest support. What can we help you with today?", minutesAgo(9)),
      line("member", "My cash out has a problem.", minutesAgo(8)),
      line("bot", "We will trace it. Which amount and which wallet was it sent to, and when did you request it?", minutesAgo(8)),
      line("member", "₱1,000 to GCash, last Friday. It still says processing.", minutesAgo(7)),
      line("system", "Ana asked for an agent. Number 1 in line.", minutesAgo(6)),
    ],
  },
  {
    id: "c2", memberId: "m021", memberName: "Kim Bautista", topic: "Referral not counted", status: "queued", agentName: null, openedAt: minutesAgo(6),
    messages: [
      line("bot", "Hi! You are chatting with Falcon Crest support. What can we help you with today?", minutesAgo(6)),
      line("member", "A referral of mine was not counted.", minutesAgo(5)),
      line("bot", "Let us check. Who did you refer, and roughly when did they order?", minutesAgo(5)),
      line("member", "My cousin Rhea, she ordered the soap on Tuesday.", minutesAgo(4)),
      line("system", "Kim asked for an agent. Number 2 in line.", minutesAgo(4)),
    ],
  },
  {
    id: "c3", memberId: "m033", memberName: "Leo Ramos", topic: "Payout account", status: "queued", agentName: null, openedAt: minutesAgo(3),
    messages: [
      line("bot", "Hi! You are chatting with Falcon Crest support. What can we help you with today?", minutesAgo(3)),
      line("member", "I need help with my payout account.", minutesAgo(2)),
      line("bot", "Happy to help. Is it GCash or Maya, and what needs changing?", minutesAgo(2)),
      line("system", "Leo asked for an agent. Number 3 in line.", minutesAgo(2)),
    ],
  },
  {
    id: "c4", memberId: "m008", memberName: "Bea Torres", topic: "Missing points", status: "with_agent", agentName: "Maria Santos", openedAt: minutesAgo(25),
    messages: [
      line("member", "Some of my points are missing.", minutesAgo(24)),
      line("bot", "We will look into it. Which order are the points from, and on what date?", minutesAgo(24)),
      line("system", "Maria Santos joined the chat.", minutesAgo(20)),
      line("agent", "Hi Bea, Maria here. I can see the order from the 3rd; the points post once the store confirms delivery.", minutesAgo(19)),
      line("member", "Ah okay, it was delivered yesterday.", minutesAgo(18)),
    ],
  },
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());
const patch = (id: string, change: (c: Conversation) => Conversation) => {
  conversations = conversations.map((c) => (c.id === id ? change(c) : c));
  emit();
};

/** Every conversation, live; re-renders the caller when any changes. */
export function useConversations(): Conversation[] {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    () => conversations,
  );
}

export const queuePosition = (id: string) => conversations.filter((c) => c.status === "queued").findIndex((c) => c.id === id) + 1;

export function join(id: string, agentName: string): void {
  patch(id, (c) => ({ ...c, status: "with_agent", agentName, messages: [...c.messages, line("system", `${agentName} joined the chat.`, new Date())] }));
}

const REPLIES = ["Okay, thank you!", "Got it, I will wait for that.", "Thanks for checking."];

/** The agent's line, and a beat later the member's, so the thread feels attended. */
export function send(id: string, text: string): void {
  patch(id, (c) => ({ ...c, messages: [...c.messages, line("agent", text, new Date())] }));
  const reply = REPLIES[Math.floor(Math.random() * REPLIES.length)] ?? REPLIES[0]!;
  window.setTimeout(() => patch(id, (c) => (c.status === "with_agent" ? { ...c, messages: [...c.messages, line("member", reply, new Date())] } : c)), 1800);
}

export function end(id: string): void {
  patch(id, (c) => ({ ...c, status: "ended", messages: [...c.messages, line("system", `Chat with ${c.agentName ?? "support"} has ended.`, new Date())] }));
}

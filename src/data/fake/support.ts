import { useSyncExternalStore } from "react";
import { nextMessageId, seedConversations } from "./supportSeed";

/**
 * The support desk on bundled data: who is waiting, who is being helped,
 * what was said, and how each chat ended. Kept in memory for the tab and
 * pushed to whoever is looking, the way the API's channel will.
 */
export type Sender = "member" | "bot" | "agent" | "system";
export type Message = { id: string; sender: Sender; text: string; at: Date; imageUrl: string | null };
export type Resolution = "resolved" | "unresolved";
export type Conversation = {
  id: string;
  memberId: string;
  memberName: string;
  topic: string;
  status: "queued" | "with_agent" | "ended";
  agentName: string | null;
  openedAt: Date;
  endedAt: Date | null;
  resolution: Resolution | null;
  ticketIds: string[];
  messages: Message[];
};

let conversations: Conversation[] = seedConversations;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());
const patch = (id: string, change: (c: Conversation) => Conversation) => {
  conversations = conversations.map((c) => (c.id === id ? change(c) : c));
  emit();
};
const withLine = (c: Conversation, sender: Sender, text: string, imageUrl: string | null = null): Conversation => ({ ...c, messages: [...c.messages, { id: nextMessageId(), sender, text, at: new Date(), imageUrl }] });

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
  patch(id, (c) => withLine({ ...c, status: "with_agent", agentName }, "system", `${agentName} joined the chat.`));
}

const REPLIES = ["Okay, thank you!", "Got it, I will wait for that.", "Thanks for checking."];

/** The agent's line or photo, and a beat later the member's reply, so the thread feels attended. */
export function send(id: string, text: string, imageUrl: string | null = null): void {
  patch(id, (c) => withLine(c, "agent", text, imageUrl));
  const reply = REPLIES[Math.floor(Math.random() * REPLIES.length)] ?? REPLIES[0]!;
  window.setTimeout(() => patch(id, (c) => (c.status === "with_agent" ? withLine(c, "member", reply) : c)), 1800);
}

/** Ending without resolving: the member left, or the answer is still owed somewhere else. */
export function end(id: string, by: string): void {
  patch(id, (c) => withLine({ ...c, status: "ended", endedAt: c.endedAt ?? new Date(), resolution: c.resolution ?? "unresolved" }, "system", `Chat ended by ${by}.`));
}

/** Resolving ends the chat if it is still open, and marks it done either way. */
export function resolve(id: string, by: string): void {
  patch(id, (c) => withLine({ ...c, status: "ended", endedAt: c.endedAt ?? new Date(), resolution: "resolved" }, "system", `Marked resolved by ${by}.`));
}

/** A ticket opened from the chat leaves its trace in the thread and a link on the conversation. */
export function attachTicket(id: string, ticketId: string, reference: string, category: string): void {
  patch(id, (c) => withLine({ ...c, ticketIds: [...c.ticketIds, ticketId] }, "system", `Ticket ${reference} opened: ${category}.`));
}

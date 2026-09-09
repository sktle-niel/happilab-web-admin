import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Conversation, ConversationStatus, Thread } from "../data/types";
import { api, query } from "./api";
import { toCamel } from "./case";

const BASE = "/v1/admin/support/conversations";
const LIVE_MS = 4000;
const HISTORY_MS = 15_000;
type Line = { body?: string; attachmentUrl?: string };

/**
 * The desk's reads, polled while a page shows them: the line and the open
 * chats every few seconds, the history less often, one thread as fast as
 * the line. A push channel will replace the polling without changing
 * what these return.
 */
export function useConversations(status: ConversationStatus, q = "") {
  const ended = status === "ended";
  return useQuery({
    queryKey: ["conversations", status, q],
    queryFn: () => api.get(`${BASE}${query({ status, q, per_page: 100, sort: ended ? "ended_at" : "opened_at", order: ended ? "desc" : "asc" })}`).then((body) => toCamel<{ items: Conversation[]; total: number }>(body)),
    refetchInterval: ended ? HISTORY_MS : LIVE_MS,
  });
}

export function useThread(id: string | undefined) {
  return useQuery({ queryKey: ["conversation", id], queryFn: () => api.get(`${BASE}/${id}`).then((body) => toCamel<Thread>(body)), enabled: id !== undefined, refetchInterval: LIVE_MS });
}

/** The moves an agent makes on a chat; each refreshes the thread and the lists, and a refusal is told as the API worded it. */
export function useDeskActions() {
  const client = useQueryClient();
  const refresh = (id: string) => Promise.all([client.invalidateQueries({ queryKey: ["conversation", id] }), client.invalidateQueries({ queryKey: ["conversations"] })]);
  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ id, move, line }: { id: string; move: "join" | "end" | "resolve" | "messages"; line?: Line }) =>
      api.post(`${BASE}/${id}/${move}`, line && { body: line.body, attachment_url: line.attachmentUrl }),
    onSuccess: (_, { id }) => refresh(id),
    onError: (error: Error) => toast.error(error.message),
  });
  return {
    busy: isPending,
    join: (id: string) => mutateAsync({ id, move: "join" }),
    end: (id: string) => mutateAsync({ id, move: "end" }),
    resolve: (id: string) => mutateAsync({ id, move: "resolve" }),
    reply: (id: string, line: Line) => mutateAsync({ id, move: "messages", line }),
  };
}

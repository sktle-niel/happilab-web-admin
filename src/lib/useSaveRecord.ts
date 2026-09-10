import { useCreate, useUpdate } from "@refinedev/core";
import { useState } from "react";

type Words = { created: string; updated: string; description?: string };

/**
 * One save for a new row or an existing one, with the busy flag tracked
 * here: Refine's mutation flags do not typecheck on these hooks, so the
 * settle callback carries it instead. [description] on a call overrides
 * the words' when the notice needs the record's own detail.
 */
export function useSaveRecord(resource: string, words: Words) {
  const { mutate: create } = useCreate();
  const { mutate: update } = useUpdate();
  const [busy, setBusy] = useState(false);

  const save = (id: string | null, values: Record<string, unknown>, onDone?: () => void, description?: string) => {
    setBusy(true);
    const done = { onSuccess: () => onDone?.(), onSettled: () => setBusy(false) };
    const said = description ?? words.description;
    const notice = (message: string) => ({ type: "success" as const, message, ...(said && { description: said }) });
    // The API's own sentence is the whole notice; Refine's "status code: undefined" title says nothing.
    const refusal = (error?: { message?: string }) => ({ type: "error" as const, message: error?.message ?? "That could not be saved." });
    if (id) update({ resource, id, values, successNotification: notice(words.updated), errorNotification: refusal }, done);
    else create({ resource, values, successNotification: notice(words.created), errorNotification: refusal }, done);
  };

  return { save, busy };
}

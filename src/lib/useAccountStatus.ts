import { useUpdate } from "@refinedev/core";
import { undoToast } from "./undoToast";

export type AccountStatus = "active" | "suspended";
export type Account = { id: string; name: string };
type Words = { off: string; on: string; offDescription: string; onDescription: string };

/**
 * Members are disabled and staff deactivated, but both are the same soft
 * move on the wire: `status` goes to `suspended` and back to `active`,
 * every session ends, nothing is deleted. Told with Undo, not asked with
 * a dialog.
 */
export function useAccountStatus(resource: "members" | "staff", words: Words) {
  const { mutate: update } = useUpdate();

  const enable = (account: Account) =>
    update({
      resource,
      id: account.id,
      values: { status: "active" satisfies AccountStatus },
      successNotification: { type: "success", message: `${account.name} ${words.on}`, description: words.onDescription },
    });

  const disable = (account: Account) =>
    update(
      { resource, id: account.id, values: { status: "suspended" satisfies AccountStatus }, successNotification: false },
      { onSuccess: () => undoToast(`${account.name} ${words.off}`, words.offDescription, () => enable(account)) },
    );

  return { disable, enable };
}

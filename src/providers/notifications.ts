import type { NotificationProvider } from "@refinedev/core";
import { toast } from "sonner";

/** Refine's notifications, shown by Sonner: a failed sign-in, a saved record, an undoable delete. */
export const sonnerNotifications: NotificationProvider = {
  open: ({ key, message, description, type }) => {
    const options = { id: key, description };
    if (type === "error") toast.error(message, options);
    else if (type === "success") toast.success(message, options);
    else toast(message, options);
  },
  close: (key) => toast.dismiss(key),
};

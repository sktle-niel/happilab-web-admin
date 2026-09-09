import { toast } from "sonner";

const UNDO_MS = 6000;

/** A reversible action is told, not asked: the toast says what happened and carries the way back. */
export function undoToast(message: string, description: string, onUndo: () => void) {
  toast(message, { description, duration: UNDO_MS, action: { label: "Undo", onClick: onUndo } });
}

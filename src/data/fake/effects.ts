import { members } from "./people";

type Row = Record<string, unknown>;

/**
 * What the API does inside the same transaction as a write, done here on
 * the bundled tables: a failed cash-out credits the points back to the
 * member. Orders never start here; they arrive from the app, so their
 * points move on the API's side when the order does.
 */
export function afterUpdate(resource: string, before: Row, after: Row): void {
  if (resource === "cash-outs" && before.status !== "failed" && after.status === "failed") {
    const member = members.find((m) => m.id === after.memberId);
    if (member) member.points += Number(after.points) || 0;
  }
}

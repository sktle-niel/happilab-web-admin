import { orders } from "./money";
import { members } from "./people";

type Row = Record<string, unknown>;

const memberById = (id: unknown) => members.find((m) => m.id === id);

/**
 * What the API does inside the same transaction as a write, done here on
 * the bundled tables: a failed cash-out credits the points back, and a
 * confirmed order pays the referrer and counts the buyer.
 */
export function afterUpdate(resource: string, before: Row, after: Row): void {
  if (resource === "cash-outs" && before.status !== "failed" && after.status === "failed") {
    const member = memberById(after.memberId);
    if (member) member.points += Number(after.points) || 0;
  }
}

export function afterCreate(resource: string, row: Row): void {
  if (resource === "orders" && row.status === "confirmed") awardReferrer(row);
}

function awardReferrer(order: Row): void {
  const buyer = memberById(order.buyerId);
  const referrer = buyer?.referredBy ? memberById(buyer.referredBy) : undefined;
  if (!buyer || !referrer) return;
  const points = Number(order.pointsAwarded) || 0;
  referrer.points += points;
  referrer.lifetimePoints += points;
  // The new order is already in the table, so one order means a first buyer.
  if (orders.filter((o) => o.buyerId === buyer.id).length === 1) referrer.buyers += 1;
}

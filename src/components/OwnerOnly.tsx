import type { ReactNode } from "react";
import { isOwner } from "../lib/access";
import { NoAccess } from "../pages/NoAccess";
import { useStaffSession } from "../providers/session";

/** A screen only the owner may open — the ones that change what members see or are paid. Others read the list and no more. */
export function OwnerOnly({ children }: { children: ReactNode }) {
  const { identity } = useStaffSession();
  if (!identity) return null;
  if (!isOwner(identity.role)) return <NoAccess title="Only the owner changes this" text="Support accounts read the catalogue; adding, editing and removing products is the owner's." />;
  return children;
}

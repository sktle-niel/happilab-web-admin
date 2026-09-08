import type { AccessControlProvider } from "@refinedev/core";
import { canOpen, isPageKey } from "../lib/access";
import { fakeAuthProvider } from "./fakeAuthProvider";
import type { StaffIdentity } from "./session";

/**
 * Refine asks this before showing a page. The answer comes from the
 * signed-in account's page list; a resource that is not a page (a table
 * inside one) is never refused here — the page around it already was.
 */
export const accessControl: AccessControlProvider = {
  can: async ({ resource }) => {
    if (!resource || !isPageKey(resource)) return { can: true };
    const me = (await fakeAuthProvider.getIdentity?.()) as StaffIdentity | null;
    return canOpen(me?.pages, resource) ? { can: true } : { can: false, reason: "Not on this account's pages" };
  },
  options: { buttons: { enableAccessControl: false, hideIfUnauthorized: false } },
};

/**
 * What an account may open. Every page has a key; an account carries the
 * keys it may open, and the sidebar, the routes and the dashboard all
 * read that one list. Dashboard is always in it. The API keeps the same
 * list per staff account.
 */
export const PAGES = [
  { key: "dashboard", label: "Dashboard", path: "/" },
  { key: "members", label: "Members", path: "/members" },
  { key: "products", label: "Products", path: "/products" },
  { key: "orders", label: "Orders", path: "/orders" },
  { key: "cash-outs", label: "Cash-outs", path: "/cash-outs" },
  { key: "content", label: "Content", path: "/content" },
  { key: "support", label: "Support", path: "/support" },
  { key: "staff", label: "Staff", path: "/staff" },
  { key: "audit", label: "Audit log", path: "/audit" },
  { key: "settings", label: "Settings", path: "/settings" },
] as const;

export type PageKey = (typeof PAGES)[number]["key"];
export type StaffRole = "owner" | "support";

export const ALL_PAGES: PageKey[] = PAGES.map((page) => page.key);

/**
 * Two levels of staff: the owner, one account that runs everything, and
 * support, as many as the desk needs. A support account starts with the
 * preset and can be given more or fewer pages afterwards; what it may
 * change on them is the API's to decide.
 */
export const ROLE_PRESETS: Record<StaffRole, PageKey[]> = {
  owner: ALL_PAGES,
  support: ["dashboard", "support", "cash-outs", "products", "members"],
};

export const ROLE_LABELS: Record<StaffRole, string> = { owner: "Owner", support: "Support" };

export const isPageKey = (value: string): value is PageKey => ALL_PAGES.includes(value as PageKey);

/** Dashboard is never taken away; everything else needs to be on the list. */
export const canOpen = (pages: readonly PageKey[] | undefined, key: PageKey) => key === "dashboard" || (pages ?? []).includes(key);

export const pageLabel = (key: PageKey) => PAGES.find((page) => page.key === key)?.label ?? key;

/** "Everything", or the pages beyond the dashboard, in the sidebar's order. */
export const describeAccess = (pages: readonly PageKey[]) =>
  ALL_PAGES.every((key) => pages.includes(key)) ? "Everything" : ALL_PAGES.filter((key) => key !== "dashboard" && pages.includes(key)).map(pageLabel).join(", ") || "Dashboard only";

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
export type StaffRole = "owner" | "admin" | "support";

export const ALL_PAGES: PageKey[] = PAGES.map((page) => page.key);

/** What each role starts with; an account can be given more or less afterwards, except the owner. */
export const ROLE_PRESETS: Record<StaffRole, PageKey[]> = {
  owner: ALL_PAGES,
  admin: ALL_PAGES.filter((key) => key !== "staff"),
  support: ["dashboard", "support", "cash-outs", "products", "members"],
};

export const ROLE_LABELS: Record<StaffRole, string> = { owner: "Owner", admin: "Admin", support: "Support" };

export const isPageKey = (value: string): value is PageKey => ALL_PAGES.includes(value as PageKey);

/** Dashboard is never taken away; everything else needs to be on the list. */
export const canOpen = (pages: readonly PageKey[] | undefined, key: PageKey) => key === "dashboard" || (pages ?? []).includes(key);

export const pageLabel = (key: PageKey) => PAGES.find((page) => page.key === key)?.label ?? key;

/** "Everything", or the pages beyond the dashboard, in the sidebar's order. */
export const describeAccess = (pages: readonly PageKey[]) =>
  ALL_PAGES.every((key) => pages.includes(key)) ? "Everything" : ALL_PAGES.filter((key) => key !== "dashboard" && pages.includes(key)).map(pageLabel).join(", ") || "Dashboard only";

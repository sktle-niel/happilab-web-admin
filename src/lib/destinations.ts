import type { PageKey } from "./access";

/**
 * Every place the top bar can take you: pages, the cards and tabs on
 * them, and the settings fields. `to` may carry a hash naming the
 * `data-spot` the page should light up on arrival.
 */
export type Destination = { title: string; crumb: string; to: string; keywords?: string };

const settings = (title: string, spot: string, crumb: string, keywords?: string): Destination => ({ title, crumb, to: `/settings#${spot}`, ...(keywords && { keywords }) });

export const DESTINATIONS: Destination[] = [
  { title: "Dashboard", crumb: "Page", to: "/", keywords: "overview home" },
  { title: "Points issued", crumb: "Dashboard", to: "/#points-issued" },
  { title: "Cash-outs pending", crumb: "Dashboard", to: "/#cash-outs-pending", keywords: "waiting" },
  { title: "Active members", crumb: "Dashboard", to: "/#active-members" },
  { title: "Points flow", crumb: "Dashboard", to: "/#points-flow", keywords: "earned cashed out pending repeat buyers first orders joined" },
  { title: "Support queue", crumb: "Dashboard", to: "/#support-queue", keywords: "in line wait" },
  { title: "Orders today", crumb: "Dashboard", to: "/#orders-today", keywords: "sales" },
  { title: "Sign-ins", crumb: "Dashboard", to: "/#sign-ins", keywords: "busy days activity" },
  { title: "Cash-outs chart", crumb: "Dashboard", to: "/#cash-outs-chart", keywords: "monthly weekly sent average time" },
  { title: "Members", crumb: "Page", to: "/members", keywords: "people referrals codes status joined" },
  { title: "Products", crumb: "Page", to: "/products", keywords: "catalogue price badge stores live" },
  { title: "Add product", crumb: "Products", to: "/products/new", keywords: "new product" },
  { title: "Orders", crumb: "Page", to: "/orders", keywords: "sales references buyers" },
  { title: "Cash-outs", crumb: "Page", to: "/cash-outs", keywords: "requests approve review processing sent failed gcash maya payout" },
  { title: "Content", crumb: "Page", to: "/content", keywords: "feed posts faqs terms copy" },
  { title: "Feed posts", crumb: "Content", to: "/content?tab=posts#posts", keywords: "news feed" },
  { title: "FAQs", crumb: "Content", to: "/content?tab=faqs#faqs", keywords: "help questions answers" },
  { title: "Terms", crumb: "Content", to: "/content?tab=terms#terms", keywords: "programme terms sections" },
  { title: "Support desk", crumb: "Page", to: "/support", keywords: "queue agents chat" },
  { title: "In line", crumb: "Support", to: "/support#in-line", keywords: "queue waiting" },
  { title: "On the desk", crumb: "Support", to: "/support#on-the-desk", keywords: "agents online" },
  { title: "Chat history", crumb: "Support", to: "/support?view=history", keywords: "ended resolved past conversations" },
  { title: "Tickets", crumb: "Support", to: "/support?view=tickets", keywords: "account issues follow up open done" },
  { title: "Staff", crumb: "Page", to: "/staff", keywords: "owner admin support roles accounts" },
  { title: "Add staff", crumb: "Staff", to: "/staff#add-staff", keywords: "invite new account" },
  { title: "Audit log", crumb: "Page", to: "/audit", keywords: "actions history who did what" },
  { title: "Settings", crumb: "Page", to: "/settings", keywords: "configuration app" },
  settings("Brand", "brand", "Settings", "app name tagline support name"),
  settings("App name", "brand-name", "Settings · Brand"),
  settings("Tagline", "brand-tagline", "Settings · Brand"),
  settings("Support name", "brand-support-name", "Settings · Brand"),
  settings("Programme", "programme", "Settings", "earn rate points per peso minimum cash-out presets payout methods arrival note"),
  settings("Earn rate", "earn-rate", "Settings · Programme", "percent"),
  settings("Points per peso", "points-per-peso", "Settings · Programme", "conversion"),
  settings("Minimum cash-out", "min-cash-out", "Settings · Programme", "floor points"),
  settings("Preset amounts", "cash-out-presets", "Settings · Programme", "chips"),
  settings("Payout methods", "payout-methods", "Settings · Programme", "gcash maya wallets"),
  settings("Arrival note", "arrival-note", "Settings · Programme", "24 hours"),
  settings("Assets", "assets", "Settings", "backdrop logo clips upload images video"),
  settings("Support copy", "support-copy", "Settings", "status line acknowledgement"),
  settings("Status line", "status-line", "Settings · Support copy"),
  settings("Acknowledgement", "acknowledgement", "Settings · Support copy"),
  settings("Backend", "backend", "Settings", "api data source url"),
];

/** Title matches first, then anything in the crumb or keywords. */
export function findDestinations(query: string, limit = 6): Destination[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const score = (d: Destination) => {
    const title = d.title.toLowerCase();
    if (title.startsWith(q)) return 3;
    if (title.includes(q)) return 2;
    if (`${d.crumb} ${d.keywords ?? ""}`.toLowerCase().includes(q)) return 1;
    return 0;
  };
  return DESTINATIONS.map((d) => ({ d, s: score(d) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ d }) => d);
}

/** The things staff most often come to do, one key each while the search is open, shown only to accounts that may. */
export type QuickAction = { label: string; to: string; key: string; page: PageKey };
export const QUICK_ACTIONS: QuickAction[] = [
  { label: "Add product", to: "/products/new", key: "P", page: "products" },
  { label: "Add staff", to: "/staff#add-staff", key: "S", page: "staff" },
];

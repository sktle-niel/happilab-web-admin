import type { PageKey, StaffRole } from "../lib/access";

/**
 * The API's rows as the pages read them. The wire is snake_case; the data
 * provider turns every record into these camelCase shapes and every write
 * back, so a page never spells a wire name. Dates are ISO strings.
 */
export type MemberStatus = "active" | "suspended" | "closed";
export type Member = { id: string; fullName: string; email: string; referralCode: string; points: number; lifetimePoints: number; referredPeople: number; referredBuyers: number; status: MemberStatus; joinedAt: string };

export type Staff = { id: string; name: string; email: string; role: StaffRole; pages: PageKey[]; status: "pending" | "active" | "suspended"; lastSeenAt: string | null; createdAt: string };

export type ProductBadge = "topSale" | "newArrival" | "comingSoon" | null;
export type StoreLinks = Partial<Record<"tiktok" | "shopee" | "lazada", string>>;
export type Product = {
  id: string;
  name: string;
  blurb: string;
  priceCentavos: number;
  pointsMin: number;
  pointsMax: number;
  imageUrl: string;
  badge: ProductBadge;
  isActive: boolean;
  position: number;
  /** Stamped when a product is taken out softly; it stays in the table and can come back. */
  deletedAt: string | null;
  storeLinks: StoreLinks;
};

export type MediaKind = "none" | "image" | "video";
export type Post = { id: string; body: string; mediaKind: MediaKind; mediaUrl: string | null; likes: number; comments: number; isPublished: boolean; publishedAt: string };
export type Faq = { id: string; question: string; answer: string; position: number; isActive: boolean };
export type TermsSection = { id: string; heading: string; body: string; position: number };

export type OrderItem = { product: string; quantity: number; pointsAwarded: number };
export type Order = { id: string; externalReference: string; buyerName: string; referrerName: string | null; totalCentavos: number; status: "placed" | "confirmed" | "cancelled" | "refunded"; placedAt: string; items: OrderItem[] };

export type CashOutStatus = "requested" | "review" | "processing" | "sent" | "failed";
export type CashOut = {
  id: string;
  reference: string;
  memberId: string;
  memberName: string;
  wallet: "gcash" | "maya";
  numberLast4: string;
  points: number;
  amountCentavos: number;
  status: CashOutStatus;
  failureReason: string | null;
  requestedAt: string;
  sentAt: string | null;
};

export type AuditEntry = { id: number; action: string; entity: string; entityId: string | null; actor: string; actorKind: "staff" | "member" | "system"; ip: string; metadata: Record<string, string | number | boolean | null>; at: string };

export type Sender = "member" | "bot" | "agent" | "system";
export type Message = { id: string; sender: Sender; body: string; attachmentUrl: string | null; agentName: string | null; sentAt: string };
export type Resolution = "resolved" | "unresolved";
export type ConversationStatus = "queued" | "with_agent" | "ended";
export type Conversation = {
  id: string;
  memberId: string;
  memberName: string;
  topic: string | null;
  status: ConversationStatus;
  agentId: string | null;
  agentName: string | null;
  resolution: Resolution | null;
  openedAt: string;
  endedAt: string | null;
  ticketCount: number;
};
/** One chat opened: the row, every line said, and the tickets opened from it. */
export type Thread = Omit<Conversation, "ticketCount"> & { messages: Message[]; tickets: { id: string; reference: string; status: TicketStatus }[] };

export type TicketStatus = "open" | "in_progress" | "done";
export type TicketCategory = "account" | "cash_out" | "referral" | "points" | "payout" | "other";
export type TicketNote = { id: string; author: string; body: string; createdAt: string };
export type Ticket = {
  id: string;
  reference: string;
  memberId: string;
  memberName: string;
  conversationId: string | null;
  category: TicketCategory;
  summary: string;
  details: string;
  status: TicketStatus;
  assigneeStaffId: string | null;
  assigneeName: string | null;
  openedBy: string;
  openedAt: string;
  doneAt: string | null;
  /** Only on one ticket read on its own. */
  notes?: TicketNote[];
};

/** The same topics the app offers a member when a chat starts. */
export const TICKET_CATEGORIES: { value: TicketCategory; label: string }[] = [
  { value: "account", label: "Account issue" },
  { value: "cash_out", label: "Cash out issue" },
  { value: "referral", label: "Referral not counted" },
  { value: "points", label: "Missing points" },
  { value: "payout", label: "Payout account" },
  { value: "other", label: "Something else" },
];
export const categoryLabel = (category: TicketCategory) => TICKET_CATEGORIES.find((c) => c.value === category)?.label ?? category;

/** The settings the app reads, keyed as the API keeps them; the provider's conversion applies here as everywhere. */
export type Settings = {
  brand: { name: string; tagline: string; supportName: string };
  programme: { earnRateLabel: string; pointsPerPeso: number; minCashOutPoints: number; cashOutPresets: number[]; payoutMethods: string[]; arrivalNote: string };
  support: { statusLine: string; acknowledgement: string };
  assets: { logoUrl: string | null; backdropUrl: string | null; onboardingClipUrls: string[] };
};
export type SettingKey = keyof Settings;

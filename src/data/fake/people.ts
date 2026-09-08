import { ROLE_PRESETS, type PageKey, type StaffRole } from "../../lib/access";
import { seeded } from "../../lib/seeded";

export type MemberStatus = "active" | "suspended" | "closed";
export type Member = {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  referredBy: string | null;
  points: number;
  lifetimePoints: number;
  referrals: number;
  buyers: number;
  status: MemberStatus;
  joinedAt: string;
};

export type Staff = { id: string; name: string; email: string; role: StaffRole; pages: PageKey[]; status: "active" | "suspended"; lastSeenAt: string | null };

const FIRST = ["Maria", "Paolo", "Jen", "Kim", "Ana", "Ivy", "Carlo", "Bea", "Miguel", "Liza", "Ramon", "Tess", "Noel", "Grace", "Dan", "Rhea", "Jun", "Faith", "Leo", "Nica"];
const LAST = ["Cruz", "Mendoza", "Reyes", "Bautista", "Villanueva", "Santos", "Garcia", "Torres", "Flores", "Ramos", "Dela Cruz", "Castro", "Aquino", "Navarro", "Lim"];

const random = seeded(2026);

const isoDaysAgo = (days: number) => new Date(Date.UTC(2026, 8, 8) - days * 86_400_000).toISOString();

export const members: Member[] = Array.from({ length: 96 }, (_, i) => {
  const name = `${random.pick(FIRST)} ${random.pick(LAST)}`;
  const referrals = random.int(0, 14);
  const buyers = Math.min(referrals, random.int(0, 9));
  const lifetime = buyers * random.int(120, 900) + random.int(0, 300);
  const cashedOut = Math.floor(lifetime * random.next() * 0.7);
  return {
    id: `m${String(i + 1).padStart(3, "0")}`,
    name,
    email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}${i}@gmail.com`,
    referralCode: `FCV-${name.split(" ")[0]?.slice(0, 3).toUpperCase()}${random.int(10, 99)}`,
    referredBy: i === 0 ? null : `m${String(random.int(1, Math.max(1, i))).padStart(3, "0")}`,
    points: lifetime - cashedOut,
    lifetimePoints: lifetime,
    referrals,
    buyers,
    status: random.next() < 0.93 ? "active" : random.next() < 0.6 ? "suspended" : "closed",
    joinedAt: isoDaysAgo(random.int(1, 540)),
  };
});

export const staff: Staff[] = [
  { id: "s001", name: "Niel Ladica", email: "niel@falconcrest.ph", role: "owner", pages: ROLE_PRESETS.owner, status: "active", lastSeenAt: isoDaysAgo(0) },
  { id: "s002", name: "Maria Santos", email: "maria@falconcrest.ph", role: "admin", pages: ROLE_PRESETS.admin, status: "active", lastSeenAt: isoDaysAgo(1) },
  { id: "s003", name: "Paolo Reyes", email: "paolo@falconcrest.ph", role: "support", pages: ROLE_PRESETS.support, status: "active", lastSeenAt: isoDaysAgo(0) },
  { id: "s004", name: "Jen Cruz", email: "jen@falconcrest.ph", role: "support", pages: [...ROLE_PRESETS.support, "orders"], status: "suspended", lastSeenAt: isoDaysAgo(23) },
];

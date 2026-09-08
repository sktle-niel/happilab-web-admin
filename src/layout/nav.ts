import type { ComponentType } from "react";
import {
  AppstoreOutlined,
  AuditOutlined,
  CustomerServiceOutlined,
  FileTextOutlined,
  IdcardOutlined,
  SettingOutlined,
  ShoppingOutlined,
  TagsOutlined,
  TeamOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { overview } from "../data/fake/dashboard";

export type NavItem = { to: string; label: string; icon: ComponentType; badge?: number };

/** The sidebar, in the order the work happens: overview, the people, the money, the copy, the desk, the house. */
export const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: AppstoreOutlined, badge: overview.pending.count },
  { to: "/members", label: "Members", icon: TeamOutlined },
  { to: "/products", label: "Products", icon: TagsOutlined },
  { to: "/orders", label: "Orders", icon: ShoppingOutlined },
  { to: "/cash-outs", label: "Cash-outs", icon: WalletOutlined, badge: overview.pending.count },
  { to: "/content", label: "Content", icon: FileTextOutlined },
  { to: "/support", label: "Support", icon: CustomerServiceOutlined, badge: overview.queue.waiting },
  { to: "/staff", label: "Staff", icon: IdcardOutlined },
  { to: "/audit", label: "Audit log", icon: AuditOutlined },
  { to: "/settings", label: "Settings", icon: SettingOutlined },
];

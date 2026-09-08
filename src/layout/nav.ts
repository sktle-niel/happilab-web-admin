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
import { PAGES, type PageKey } from "../lib/access";

/** The sidebar's icon and badge for each page; order and labels come from the page list. */
const ICONS: Record<PageKey, ComponentType> = {
  dashboard: AppstoreOutlined,
  members: TeamOutlined,
  products: TagsOutlined,
  orders: ShoppingOutlined,
  "cash-outs": WalletOutlined,
  content: FileTextOutlined,
  support: CustomerServiceOutlined,
  staff: IdcardOutlined,
  audit: AuditOutlined,
  settings: SettingOutlined,
};

const BADGES: Partial<Record<PageKey, number>> = {
  dashboard: overview.pending.count,
  "cash-outs": overview.pending.count,
  support: overview.queue.waiting,
};

export type NavItem = { key: PageKey; to: string; label: string; icon: ComponentType; badge?: number };

export const NAV: NavItem[] = PAGES.map((page) => ({ key: page.key, to: page.path, label: page.label, icon: ICONS[page.key], ...(BADGES[page.key] && { badge: BADGES[page.key] }) }));

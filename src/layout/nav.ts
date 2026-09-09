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
import { PAGES, type PageKey } from "../lib/access";

/** The sidebar's icon for each page; order and labels come from the page list. */
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

export type NavItem = { key: PageKey; to: string; label: string; icon: ComponentType };

export const NAV: NavItem[] = PAGES.map((page) => ({ key: page.key, to: page.path, label: page.label, icon: ICONS[page.key] }));

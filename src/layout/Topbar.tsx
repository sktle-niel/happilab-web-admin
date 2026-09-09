import { BellOutlined, DownOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Dropdown, Tooltip } from "antd";
import { useNavigate } from "react-router";
import { GlobalSearch } from "../components/GlobalSearch";
import { initials } from "../lib/format";
import { useAttention } from "../lib/useAttention";
import { useStaffSession } from "../providers/session";

type Props = { sidebarHidden: boolean; onToggleSidebar: () => void };

/** The sidebar's switch sits first, in the same spot whether the sidebar is out or away. */
function SidebarToggle({ sidebarHidden, onToggleSidebar }: Props) {
  const label = sidebarHidden ? "Show sidebar" : "Hide sidebar";
  return (
    <Tooltip title={label} placement="bottomLeft">
      <button type="button" className="sidebar-toggle" aria-label={label} aria-expanded={!sidebarHidden} aria-controls="sidebar" onClick={onToggleSidebar}>
        {sidebarHidden ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </button>
    </Tooltip>
  );
}

/** The bell: what is waiting, counted live; each line opens its page. */
function Bell() {
  const navigate = useNavigate();
  const { notices } = useAttention();
  const items = notices.length > 0 ? notices.map((n) => ({ key: n.key, label: n.label, onClick: () => navigate(n.to) })) : [{ key: "none", label: "Nothing waiting on you.", disabled: true }];
  return (
    <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
      <button type="button" className="bell" aria-label={`Notifications, ${notices.length} waiting`}>
        <BellOutlined />
        {notices.length > 0 && <span className="bell__dot">{notices.length}</span>}
      </button>
    </Dropdown>
  );
}

export function Topbar(props: Props) {
  const { identity, signOut } = useStaffSession();
  const name = identity?.name ?? "Staff";
  return (
    <header className="topbar">
      <div className="topbar__lead">
        <SidebarToggle {...props} />
        <Dropdown menu={{ items: [{ key: "out", label: "Sign out", onClick: signOut }] }} trigger={["click"]} placement="bottomLeft">
          <button type="button" className="who">
            <span className="who__avatar">{initials(name)}</span>
            <span>
              <span className="who__name">{name} <DownOutlined style={{ fontSize: 10, marginLeft: 6 }} /></span>
              <span className="who__email">{identity?.email ?? ""}</span>
            </span>
          </button>
        </Dropdown>
      </div>
      <div className="topbar__tools">
        <GlobalSearch />
        <Bell />
      </div>
    </header>
  );
}

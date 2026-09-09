import { BellOutlined, DownOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Dropdown, Tooltip } from "antd";
import { GlobalSearch } from "../components/GlobalSearch";
import { initials } from "../lib/format";
import { useStaffSession } from "../providers/session";

const NOTICES = [
  { key: "n1", label: "3 cash-outs waiting for review" },
  { key: "n2", label: "Ana Villanueva is in the support queue" },
];

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
        <Dropdown menu={{ items: NOTICES }} trigger={["click"]} placement="bottomRight">
          <button type="button" className="bell" aria-label="Notifications">
            <BellOutlined />
            <span className="bell__dot">{NOTICES.length}</span>
          </button>
        </Dropdown>
      </div>
    </header>
  );
}

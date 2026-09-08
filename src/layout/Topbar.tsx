import { BellOutlined, DownOutlined, SearchOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import { initials } from "../lib/format";
import { useStaffSession } from "../providers/session";

const NOTICES = [
  { key: "n1", label: "3 cash-outs waiting for review" },
  { key: "n2", label: "Ana Villanueva is in the support queue" },
];

export function Topbar() {
  const { identity, signOut } = useStaffSession();
  const name = identity?.name ?? "Staff";
  return (
    <header className="topbar">
      <Dropdown menu={{ items: [{ key: "out", label: "Sign out", onClick: signOut }] }} trigger={["click"]} placement="bottomLeft">
        <button type="button" className="who">
          <span className="who__avatar">{initials(name)}</span>
          <span>
            <span className="who__name">{name} <DownOutlined style={{ fontSize: 10, marginLeft: 6 }} /></span>
            <span className="who__email">{identity?.email ?? ""}</span>
          </span>
        </button>
      </Dropdown>
      <div className="topbar__tools">
        <label className="search">
          <SearchOutlined />
          <input placeholder="Search members, orders, references…" aria-label="Search" />
        </label>
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

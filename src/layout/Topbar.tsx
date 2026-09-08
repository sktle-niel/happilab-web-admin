import { BellOutlined, DownOutlined, SearchOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import { initials } from "../lib/format";
import { useStaffSession } from "../providers/session";

export function Topbar() {
  const { identity, signOut } = useStaffSession();
  const name = identity?.name ?? "Staff";
  return (
    <header className="topbar">
      <Dropdown menu={{ items: [{ key: "out", label: "Sign out", onClick: signOut }] }} trigger={["click"]}>
        <div className="who">
          <span className="who__avatar">{initials(name)}</span>
          <div>
            <div className="who__name">{name} <DownOutlined style={{ fontSize: 10, marginLeft: 6 }} /></div>
            <div className="who__email">{identity?.email ?? ""}</div>
          </div>
        </div>
      </Dropdown>
      <div className="topbar__tools">
        <label className="search">
          <SearchOutlined />
          <input placeholder="Search members, orders, references…" aria-label="Search" />
        </label>
        <span className="bell">
          <BellOutlined />
          <span className="bell__dot">2</span>
        </span>
      </div>
    </header>
  );
}

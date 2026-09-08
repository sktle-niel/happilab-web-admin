import { NavLink, useNavigate } from "react-router";
import { canOpen } from "../lib/access";
import { useStaffSession } from "../providers/session";
import { NAV } from "./nav";

/** Only the pages this account may open; the rest do not exist as far as the sidebar knows. */
export function Sidebar() {
  const navigate = useNavigate();
  const { identity } = useStaffSession();
  const items = NAV.filter((item) => canOpen(identity?.pages, item.key));
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <img src="/parrot-96.png" alt="" />
        Falcon Crest
      </div>
      <nav>
        {items.map(({ to, label, icon: Icon, badge }) => (
          <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `nav__item${isActive ? " is-active" : ""}`}>
            <span className="nav__icon"><Icon /></span>
            {label}
            {badge ? <span className="nav__badge">{badge}</span> : null}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar__promo">
        <h4>Running on bundled data</h4>
        <p>Point the admin at the API to see the real programme.</p>
        <button type="button" onClick={() => navigate("/settings")}>Set up backend</button>
      </div>
    </aside>
  );
}

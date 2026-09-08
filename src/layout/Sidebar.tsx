import { NavLink, useNavigate } from "react-router";
import { NAV } from "./nav";

export function Sidebar() {
  const navigate = useNavigate();
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <img src="/brand.jpg" alt="" />
        Falcon Crest
      </div>
      <nav>
        {NAV.map(({ to, label, icon: Icon, badge }) => (
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

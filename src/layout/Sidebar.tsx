import { NavLink } from "react-router";
import { canOpen, type PageKey } from "../lib/access";
import { useAttention } from "../lib/useAttention";
import { useStaffSession } from "../providers/session";
import { NAV } from "./nav";

/**
 * Only the pages this account may open; the rest do not exist as far as
 * the sidebar knows. Badges count what is waiting, live. Tucked away, it
 * is inert: nothing in it can be tabbed to or read while it is off screen.
 */
export function Sidebar({ hidden }: { hidden: boolean }) {
  const { identity } = useStaffSession();
  const { pendingCashOuts, queued } = useAttention();
  const badges: Partial<Record<PageKey, number>> = { dashboard: pendingCashOuts, "cash-outs": pendingCashOuts, support: queued };
  const items = NAV.filter((item) => canOpen(identity?.pages, item.key));
  return (
    <aside id="sidebar" className="sidebar" inert={hidden}>
      <div className="sidebar__brand">
        <img src="/parrot-96.png" alt="" />
        Falcon Crest
      </div>
      <nav>
        {items.map(({ key, to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `nav__item${isActive ? " is-active" : ""}`}>
            <span className="nav__icon"><Icon /></span>
            {label}
            {badges[key] ? <span className="nav__badge">{badges[key]}</span> : null}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

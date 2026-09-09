import { Outlet } from "react-router";
import { useSpotlight } from "../lib/useSpotlight";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useSidebar } from "./useSidebar";

/** The whole page: a sticky dark sidebar that can be tucked away, then the content on a quiet canvas. */
export function AppFrame() {
  useSpotlight();
  const { hidden, toggle } = useSidebar();
  return (
    <div className={`app${hidden ? " is-collapsed" : ""}`}>
      <Sidebar hidden={hidden} />
      <main className="content">
        <div className="content__inner">
          <Topbar sidebarHidden={hidden} onToggleSidebar={toggle} />
          <Outlet />
        </div>
      </main>
    </div>
  );
}

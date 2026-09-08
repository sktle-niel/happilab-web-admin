import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/** The dark frame on the lime page: sidebar on the left, the rounded content panel on the right. */
export function AppFrame() {
  return (
    <div className="frame">
      <div className="frame__inner">
        <Sidebar />
        <main className="content">
          <Topbar />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

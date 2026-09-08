import { Outlet } from "react-router";
import { useSpotlight } from "../lib/useSpotlight";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/** The whole page: a sticky dark sidebar, then the content on a quiet canvas. */
export function AppFrame() {
  useSpotlight();
  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <div className="content__inner">
          <Topbar />
          <Outlet />
        </div>
      </main>
    </div>
  );
}

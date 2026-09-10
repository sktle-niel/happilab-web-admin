import { Authenticated, CanAccess, Refine } from "@refinedev/core";
import routerProvider, { CatchAllNavigate, NavigateToResource } from "@refinedev/react-router";
import { ConfigProvider } from "antd";
import type { ReactNode } from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import { AppFrame } from "./layout/AppFrame";
import { PAGES, type PageKey } from "./lib/access";
import { AuditList } from "./pages/audit/AuditList";
import { CashOutsList } from "./pages/cashouts/CashOutsList";
import { ContentPage } from "./pages/content/ContentPage";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { Forgot } from "./pages/login/Forgot";
import { Activate } from "./pages/login/Activate";
import { Login } from "./pages/login/Login";
import { Reset } from "./pages/login/Reset";
import { Verify } from "./pages/login/Verify";
import { MembersList } from "./pages/members/MembersList";
import { NoAccess } from "./pages/NoAccess";
import { OwnerOnly } from "./components/OwnerOnly";
import { OrdersList } from "./pages/orders/OrdersList";
import { ProductEditor } from "./pages/products/ProductEditor";
import { ProductsList } from "./pages/products/ProductsList";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { StaffList } from "./pages/staff/StaffList";
import { SupportPage } from "./pages/support/SupportPage";
import { accessControl } from "./providers/accessControl";
import { authProvider } from "./providers/authProvider";
import { dataProvider } from "./providers/dataProvider";
import { sonnerNotifications } from "./providers/notifications";
import { theme } from "./theme";

/** Every page the admin has, as a Refine resource; the paths match the sidebar. */
const RESOURCES = PAGES.map((page) => ({ name: page.key, list: page.path }));

/** The screen behind each page key; the route opens it only for accounts that may. */
const SCREENS: Record<PageKey, ReactNode> = {
  dashboard: <Dashboard />,
  members: <MembersList />,
  products: <ProductsList />,
  orders: <OrdersList />,
  "cash-outs": <CashOutsList />,
  content: <ContentPage />,
  support: <SupportPage />,
  staff: <StaffList />,
  audit: <AuditList />,
  settings: <SettingsPage />,
};

/** A page only for accounts that may open it. */
const guarded = (page: PageKey, screen: ReactNode) => (
  <CanAccess resource={page} action="list" fallback={<NoAccess />}>
    {screen}
  </CanAccess>
);

/** Sonner in the page's clothes: the card shadow, the card font, one radius. */
const TOAST_STYLE = {
  fontFamily: "var(--font)",
  fontSize: 13,
  borderRadius: 12,
  border: 0,
  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)",
};

export function App() {
  return (
    <BrowserRouter>
      <ConfigProvider theme={theme}>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
          accessControlProvider={accessControl}
          notificationProvider={sonnerNotifications}
          routerProvider={routerProvider}
          resources={RESOURCES}
          options={{ syncWithLocation: false, warnWhenUnsavedChanges: false, disableTelemetry: true }}
        >
          <Routes>
            <Route
              element={
                <Authenticated key="signed-in" fallback={<CatchAllNavigate to="/login" />}>
                  <AppFrame />
                </Authenticated>
              }
            >
              {PAGES.map((page) => (
                <Route
                  key={page.key}
                  index={page.key === "dashboard"}
                  path={page.key === "dashboard" ? undefined : page.path}
                  element={guarded(page.key, SCREENS[page.key])}
                />
              ))}
              <Route path="/products/new" element={guarded("products", <OwnerOnly><ProductEditor /></OwnerOnly>)} />
              <Route path="/products/:id/edit" element={guarded("products", <OwnerOnly><ProductEditor /></OwnerOnly>)} />
              <Route path="/support/tickets/:ticketId" element={guarded("support", <SupportPage />)} />
              <Route path="/support/:id" element={guarded("support", <SupportPage />)} />
            </Route>
            <Route
              element={
                <Authenticated key="signed-out" fallback={<Outlet />}>
                  <NavigateToResource resource="dashboard" />
                </Authenticated>
              }
            >
              <Route path="/login" element={<Login />} />
              <Route path="/login/verify" element={<Verify />} />
              <Route path="/login/forgot" element={<Forgot />} />
              <Route path="/login/reset" element={<Reset />} />
              <Route path="/login/activate" element={<Activate />} />
            </Route>
          </Routes>
        </Refine>
        <Toaster position="top-center" toastOptions={{ style: TOAST_STYLE }} />
      </ConfigProvider>
    </BrowserRouter>
  );
}

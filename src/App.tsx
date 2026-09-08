import { Authenticated, Refine } from "@refinedev/core";
import routerProvider, { CatchAllNavigate, NavigateToResource } from "@refinedev/react-router";
import { ConfigProvider } from "antd";
import { Toaster } from "sonner";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { AppFrame } from "./layout/AppFrame";
import { AuditList } from "./pages/audit/AuditList";
import { CashOutsList } from "./pages/cashouts/CashOutsList";
import { ContentPage } from "./pages/content/ContentPage";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { Login } from "./pages/login/Login";
import { MembersList } from "./pages/members/MembersList";
import { OrdersList } from "./pages/orders/OrdersList";
import { ProductsList } from "./pages/products/ProductsList";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { StaffList } from "./pages/staff/StaffList";
import { SupportPage } from "./pages/support/SupportPage";
import { fakeAuthProvider } from "./providers/fakeAuthProvider";
import { fakeDataProvider } from "./providers/fakeDataProvider";
import { theme } from "./theme";

/** Every resource the admin manages; the paths match the sidebar. */
const RESOURCES = [
  { name: "dashboard", list: "/" },
  { name: "members", list: "/members" },
  { name: "products", list: "/products" },
  { name: "orders", list: "/orders" },
  { name: "cash-outs", list: "/cash-outs" },
  { name: "posts", list: "/content" },
  { name: "support", list: "/support" },
  { name: "staff", list: "/staff" },
  { name: "audit", list: "/audit" },
  { name: "settings", list: "/settings" },
];

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
            dataProvider={fakeDataProvider}
            authProvider={fakeAuthProvider}
            routerProvider={routerProvider}
            resources={RESOURCES}
            options={{ syncWithLocation: true, warnWhenUnsavedChanges: false, disableTelemetry: true }}
          >
            <Routes>
              <Route
                element={
                  <Authenticated key="signed-in" fallback={<CatchAllNavigate to="/login" />}>
                    <AppFrame />
                  </Authenticated>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="/members" element={<MembersList />} />
                <Route path="/products" element={<ProductsList />} />
                <Route path="/orders" element={<OrdersList />} />
                <Route path="/cash-outs" element={<CashOutsList />} />
                <Route path="/content" element={<ContentPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/staff" element={<StaffList />} />
                <Route path="/audit" element={<AuditList />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              <Route
                element={
                  <Authenticated key="signed-out" fallback={<Outlet />}>
                    <NavigateToResource resource="dashboard" />
                  </Authenticated>
                }
              >
                <Route path="/login" element={<Login />} />
              </Route>
            </Routes>
          </Refine>
        <Toaster position="bottom-right" toastOptions={{ style: TOAST_STYLE }} />
      </ConfigProvider>
    </BrowserRouter>
  );
}

import { CheckOutlined } from "@ant-design/icons";
import { ConfigProvider } from "antd";
import type { ReactNode } from "react";
import "../../styles/login.css";

/** Green on the controls of these pages only; the dashboard keeps ink. */
const GREEN = { token: { colorPrimary: "#2f6108", colorPrimaryHover: "#3f7d0a", colorPrimaryActive: "#244c06", borderRadius: 12, controlHeight: 46 } };

/** The panel: the parrot, the line about the programme, and three glimpses of what is happening inside. */
function Hero() {
  return (
    <aside className="login__hero stagger" aria-hidden>
      <p className="login__tagline">Share a code, earn on every order it brings in, and run all of it from one place.</p>
      <div className="peek peek--stat">
        <span className="peek__label">Points issued</span>
        <span className="peek__value">48.2k <i className="chip">+12%</i></span>
        <span className="peek__sub">this month</span>
      </div>
      <div className="peek peek--sent">
        <span className="peek__check"><CheckOutlined /></span>
        <span><b>₱1,000 sent to GCash</b><small>Maria Cruz · 2 min ago</small></span>
      </div>
      <div className="peek peek--members">
        <span className="peek__avatars"><i>MC</i><i>PR</i><i>JB</i></span>
        <span><b>1,284 members</b><small>shared a code this week</small></span>
      </div>
      <img className="login__parrot" src="/parrot-640.png" alt="" />
    </aside>
  );
}

/** The sign-in pages' frame: the brand and the form on the left, the panel on the right. */
export function LoginShell({ children }: { children: ReactNode }) {
  return (
    <div className="login">
      <div className="login__inner">
        <section className="login__form">
          <div className="login__brand">
            <img src="/parrot-96.png" alt="" />
            <span>Falcon Crest<i>.</i></span>
          </div>
          <ConfigProvider theme={GREEN}>{children}</ConfigProvider>
        </section>
        <Hero />
      </div>
    </div>
  );
}

/** A filled field with its label sitting inside. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
    </label>
  );
}

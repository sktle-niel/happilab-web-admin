import { CheckOutlined } from "@ant-design/icons";
import { ConfigProvider } from "antd";
import type { ReactNode } from "react";
import "../../styles/login.css";

/** Green on the controls of these pages only; the dashboard keeps ink. */
const GREEN = { token: { colorPrimary: "#2f6108", colorPrimaryHover: "#3f7d0a", colorPrimaryActive: "#244c06", borderRadius: 12, controlHeight: 46 } };

/** The panel: the parrot, the line about the programme, and three glimpses of the day's work. */
function Hero() {
  return (
    <aside className="login__hero stagger" aria-hidden>
      <p className="login__tagline">Members share a code and earn on every order. You run all of it from here.</p>
      <div className="peek peek--stat">
        <span className="peek__label">Waiting for you</span>
        <span className="peek__value">14 <i className="chip">₱38,500</i></span>
        <span className="peek__sub">cash-outs to review</span>
      </div>
      <div className="peek peek--sent">
        <span className="peek__check"><CheckOutlined /></span>
        <span><b>CO-8FK2Q1 marked as sent</b><small>Maria Santos · 2 min ago</small></span>
      </div>
      <div className="peek peek--members">
        <span className="peek__avatars"><i>NL</i><i>MS</i><i>PR</i></span>
        <span><b>3 staff on the desk</b><small>Niel, Maria and Paolo</small></span>
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

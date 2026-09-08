import { CheckOutlined, FacebookFilled } from "@ant-design/icons";
import { Button, Checkbox, ConfigProvider, Form, Input } from "antd";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { useStaffSession } from "../../providers/session";
import "../../styles/login.css";

type Credentials = { email: string; password: string; remember?: boolean };

/** Green on the controls of this page only; the dashboard keeps ink. */
const GREEN = { token: { colorPrimary: "#2f6108", colorPrimaryHover: "#3f7d0a", colorPrimaryActive: "#244c06", borderRadius: 12, controlHeight: 46 } };

/** A filled field with its label sitting inside, the way the reference lays them out. */
function Field({ label, name, rules, children }: { label: string; name: string; rules: object[]; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <Form.Item name={name} rules={rules} noStyle>{children}</Form.Item>
    </label>
  );
}

const soon = (what: string) => () => toast(`${what} lands with the API.`);

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

export function Login() {
  const { signIn, isSigningIn } = useStaffSession();
  return (
    <div className="login">
      <div className="login__inner">
        <section className="login__form">
          <div className="login__brand">
            <img src="/parrot-96.png" alt="" />
            <span>Falcon Crest<i>.</i></span>
          </div>
          <h1>Welcome back</h1>
          <p className="login__lead">Sign in to run the programme.</p>

          <button type="button" className="login__social" onClick={soon("Google sign-in")}>
            <img src="/google-mark.png" alt="" />
            Continue with Google
          </button>
          <button type="button" className="login__social" onClick={soon("Facebook sign-in")}>
            <FacebookFilled />
            Continue with Facebook
          </button>
          <div className="login__or"><span>Or</span></div>

          <ConfigProvider theme={GREEN}>
            <Form<Credentials> onFinish={signIn} requiredMark={false} initialValues={{ remember: true }}>
              <Field label="Email" name="email" rules={[{ required: true, type: "email", message: "Enter your work email." }]}>
                <Input variant="borderless" placeholder="you@falconcrest.ph" autoComplete="username" />
              </Field>
              <Field label="Password" name="password" rules={[{ required: true, min: 12, message: "Twelve characters at least." }]}>
                <Input.Password variant="borderless" placeholder="••••••••••••" autoComplete="current-password" />
              </Field>
              <div className="login__row">
                <Form.Item name="remember" valuePropName="checked" noStyle><Checkbox>Remember me</Checkbox></Form.Item>
                <button type="button" className="login__link" onClick={soon("Password reset")}>Forgot password?</button>
              </div>
              <Button type="primary" htmlType="submit" block loading={isSigningIn} className="login__submit">Login</Button>
            </Form>
          </ConfigProvider>
          <p className="login__note">Don't have an account? <button type="button" className="login__link login__link--plain" onClick={soon("Access requests")}>Request access</button></p>
        </section>
        <Hero />
      </div>
    </div>
  );
}

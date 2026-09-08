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

export function Login() {
  const { signIn, isSigningIn } = useStaffSession();
  return (
    <div className="login">
      <section className="login__form">
        <div className="login__brand">
          <img src="/brand-mark.png" alt="" />
          <span>Falcon Crest</span>
        </div>
        <h1>Welcome back</h1>
        <p className="login__lead">Sign in to run the programme.</p>
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
              <button type="button" className="login__link" onClick={() => toast("Ask the owner to reset your password.")}>Forgot password?</button>
            </div>
            <Button type="primary" htmlType="submit" block loading={isSigningIn} className="login__submit">Sign in</Button>
          </Form>
        </ConfigProvider>
        <p className="login__note">No account? <span>Ask the owner to add you.</span></p>
      </section>
      <aside className="login__hero" aria-hidden>
        <img src="/hero-dark.jpg" alt="" />
        <p className="login__tagline">Share a code, earn on every order it brings in.<br />Run all of it from one place.</p>
      </aside>
    </div>
  );
}

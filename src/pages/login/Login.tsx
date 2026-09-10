import { Button, Form, Input } from "antd";
import { useEffect } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { googleEnabled } from "../../lib/google";
import { takeExpiredFlag } from "../../providers/tokens";
import { useStaffSession } from "../../providers/session";
import { Field, LoginShell } from "./LoginShell";

type Credentials = { email: string; password: string };

/** Step one of two: who you are. A code follows either way. */
export function Login() {
  const { signInWithPassword, signInWithGoogle, isBusy } = useStaffSession();

  useEffect(() => {
    if (takeExpiredFlag()) toast("Your session has ended. Sign in again.", { id: "expired" });
  }, []);

  return (
    <LoginShell>
      <h1>Welcome back</h1>
      <p className="login__lead">Sign in to run the programme. A code goes to your email every time.</p>

      {googleEnabled && (
        <>
          <button type="button" className="login__social" onClick={signInWithGoogle} disabled={isBusy}>
            <img src="/google-mark.png" alt="" />
            Continue with Google
          </button>
          <div className="login__or"><span>Or</span></div>
        </>
      )}

      <Form<Credentials> onFinish={({ email, password }) => signInWithPassword(email, password)} requiredMark={false}>
        <Field label="Email">
          <Form.Item name="email" rules={[{ required: true, type: "email", message: "Enter your work email." }]} noStyle>
            <Input variant="borderless" placeholder="you@falconcrest.ph" autoComplete="username" />
          </Form.Item>
        </Field>
        <Field label="Password">
          <Form.Item name="password" rules={[{ required: true, min: 12, message: "Twelve characters at least." }]} noStyle>
            <Input.Password variant="borderless" placeholder="••••••••••••" autoComplete="current-password" />
          </Form.Item>
        </Field>
        <div className="login__row login__row--end">
          <Link to="/login/forgot" className="login__link">Forgot password?</Link>
        </div>
        <Button type="primary" htmlType="submit" block loading={isBusy} className="login__submit">Continue</Button>
      </Form>
      <p className="login__note"><Link to="/login/activate" className="login__link">New to the desk? Activate your account</Link></p>
    </LoginShell>
  );
}

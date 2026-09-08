import { Button, Form, Input } from "antd";
import { Link, useSearchParams } from "react-router";
import { FAKE_RESET_TOKEN } from "../../providers/fakeAuthProvider";
import { useStaffSession } from "../../providers/session";
import { Field, LoginShell } from "./LoginShell";

const onBundledData = import.meta.env.VITE_BACKEND !== "api";

/** Asks for the address, then says the link is on its way. */
export function Forgot() {
  const { requestReset, isBusy } = useStaffSession();
  const [params] = useSearchParams();
  const sent = params.get("sent") === "1";

  if (sent) {
    return (
      <LoginShell>
        <h1>Check your email</h1>
        <p className="login__lead">If that address belongs to a staff account, a link to choose a new password is on its way. It is good for fifteen minutes.</p>
        <div className="login__stack">
          {onBundledData && (
            <Link to={`/login/reset?token=${FAKE_RESET_TOKEN}`}>
              <Button block>Open the link (bundled data)</Button>
            </Link>
          )}
          <Link to="/login/forgot"><Button block type="text">Send it again</Button></Link>
        </div>
        <p className="login__note"><Link to="/login" className="login__link">Back to sign in</Link></p>
      </LoginShell>
    );
  }

  return (
    <LoginShell>
      <h1>Reset your password</h1>
      <p className="login__lead">Enter your work email and we will send a link to choose a new one.</p>
      <Form<{ email: string }> onFinish={({ email }) => requestReset(email)} requiredMark={false}>
        <Field label="Email">
          <Form.Item name="email" rules={[{ required: true, type: "email", message: "Enter your work email." }]} noStyle>
            <Input variant="borderless" placeholder="you@falconcrest.ph" autoComplete="username" autoFocus />
          </Form.Item>
        </Field>
        <Button type="primary" htmlType="submit" block loading={isBusy} className="login__submit">Send reset link</Button>
      </Form>
      <p className="login__note"><Link to="/login" className="login__link">Back to sign in</Link></p>
    </LoginShell>
  );
}

import { Button, Form, Input } from "antd";
import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { PasswordRules } from "../../components/PasswordRules";
import { passwordMeetsPolicy } from "../../lib/password";
import { useStaffSession } from "../../providers/session";
import { Field, LoginShell } from "./LoginShell";

type NewPassword = { password: string; confirmPassword: string };

/** The page the emailed link opens: a new password, checked against the rules as it is typed. */
export function Reset() {
  const { updatePassword, isBusy } = useStaffSession();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");

  if (!token) {
    return (
      <LoginShell>
        <h1>This link is not complete</h1>
        <p className="login__lead">Open the link from the email again, or ask for a new one.</p>
        <Link to="/login/forgot"><Button type="primary" block className="login__submit">Request a new link</Button></Link>
      </LoginShell>
    );
  }

  return (
    <LoginShell>
      <h1>Choose a new password</h1>
      <p className="login__lead login__lead--tight">Every other device signs out once it is saved.</p>
      <Form<NewPassword> onFinish={(values) => updatePassword(values.password, values.confirmPassword, token)} requiredMark={false}>
        <Field label="New password">
          <Form.Item name="password" validateTrigger="onSubmit" rules={[{ validator: (_, value: string) => (passwordMeetsPolicy(value ?? "") ? Promise.resolve() : Promise.reject(new Error("Meet every rule below."))) }]} noStyle>
            <Input.Password variant="borderless" placeholder="••••••••••••" autoComplete="new-password" autoFocus onChange={(event) => setPassword(event.target.value)} />
          </Form.Item>
        </Field>
        <PasswordRules password={password} />
        <Field label="Confirm new password">
          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[({ getFieldValue }) => ({ validator: (_, value: string) => (value === getFieldValue("password") ? Promise.resolve() : Promise.reject(new Error("The two passwords do not match."))) })]}
            noStyle
          >
            <Input.Password variant="borderless" placeholder="••••••••••••" autoComplete="new-password" />
          </Form.Item>
        </Field>
        <Button type="primary" htmlType="submit" block loading={isBusy} className="login__submit">Save new password</Button>
      </Form>
      <p className="login__note"><Link to="/login" className="login__link">Back to sign in</Link></p>
    </LoginShell>
  );
}

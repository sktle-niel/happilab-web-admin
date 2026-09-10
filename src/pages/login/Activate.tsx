import { Button, Form, Input } from "antd";
import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { PasswordRules } from "../../components/PasswordRules";
import { passwordMeetsPolicy } from "../../lib/password";
import { useStaffSession } from "../../providers/session";
import { Field, LoginShell } from "./LoginShell";

type Values = { email: string; code: string; password: string; confirmPassword: string };

/** A new account's first way in: the code from the email, and the password the person chooses. Opens straight into a session. */
export function Activate() {
  const { activate, isBusy } = useStaffSession();
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");

  return (
    <LoginShell>
      <h1>Activate your account</h1>
      <p className="login__lead login__lead--tight">Enter the code from your email and choose your password. The code is good for an hour.</p>
      <Form<Values> initialValues={{ email: params.get("email") ?? "" }} onFinish={(values) => activate(values.email, values.code, values.password)} requiredMark={false}>
        <Field label="Email">
          <Form.Item name="email" rules={[{ required: true, type: "email", message: "Enter the email the code was sent to." }]} noStyle>
            <Input variant="borderless" placeholder="you@falconcrest.ph" autoComplete="username" />
          </Form.Item>
        </Field>
        <Field label="Activation code">
          <Form.Item name="code" rules={[{ required: true, pattern: /^\d{6}$/, message: "The six digits from the email." }]} noStyle>
            <Input variant="borderless" placeholder="123456" inputMode="numeric" maxLength={6} autoComplete="one-time-code" autoFocus={params.has("email")} />
          </Form.Item>
        </Field>
        <Field label="Password">
          <Form.Item name="password" validateTrigger="onSubmit" rules={[{ validator: (_, value: string) => (passwordMeetsPolicy(value ?? "") ? Promise.resolve() : Promise.reject(new Error("Meet every rule below."))) }]} noStyle>
            <Input.Password variant="borderless" placeholder="••••••••••••" autoComplete="new-password" onChange={(event) => setPassword(event.target.value)} />
          </Form.Item>
        </Field>
        <PasswordRules password={password} />
        <Field label="Confirm password">
          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[({ getFieldValue }) => ({ validator: (_, value: string) => (value === getFieldValue("password") ? Promise.resolve() : Promise.reject(new Error("The two passwords do not match."))) })]}
            noStyle
          >
            <Input.Password variant="borderless" placeholder="••••••••••••" autoComplete="new-password" />
          </Form.Item>
        </Field>
        <Button type="primary" htmlType="submit" block loading={isBusy} className="login__submit">Activate and sign in</Button>
      </Form>
      <p className="login__note"><Link to="/login" className="login__link">Already active? Sign in</Link></p>
    </LoginShell>
  );
}

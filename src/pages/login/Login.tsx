import { Button, Form, Input } from "antd";
import { useStaffSession } from "../../providers/session";
import "../../styles/login.css";

type Credentials = { email: string; password: string };

export function Login() {
  const { signIn, isSigningIn } = useStaffSession();
  return (
    <div className="login">
      <div className="login__card">
        <div className="login__brand"><img src="/brand.jpg" alt="" />Falcon Crest Admin</div>
        <h1>Sign in</h1>
        <p>Staff only. Members use the app.</p>
        <Form<Credentials> layout="vertical" onFinish={signIn} requiredMark={false}>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Enter your work email." }]}>
            <Input placeholder="you@falconcrest.ph" autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, min: 12, message: "Twelve characters at least." }]}>
            <Input.Password placeholder="••••••••••••" autoComplete="current-password" />
          </Form.Item>
          <Button className="login__submit" htmlType="submit" loading={isSigningIn}>Sign in</Button>
        </Form>
        <div className="login__note">On bundled data any email and a 12-character password will do.</div>
      </div>
    </div>
  );
}

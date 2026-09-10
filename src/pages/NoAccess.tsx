import { LockOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { Link } from "react-router";

type Props = { title?: string; text?: string };

/** What a page shows when the account may not open it, or may only look. */
export function NoAccess({ title = "Not on your pages", text = "This page is not part of your access. The owner can add it from Staff." }: Props) {
  return (
    <div className="card no-access">
      <span className="card__icon"><LockOutlined /></span>
      <h2>{title}</h2>
      <p>{text}</p>
      <Link to="/"><Button type="primary">Back to dashboard</Button></Link>
    </div>
  );
}

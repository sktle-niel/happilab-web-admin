import { LockOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { Link } from "react-router";

/** What a page shows when the account may not open it. */
export function NoAccess() {
  return (
    <div className="card no-access">
      <span className="card__icon"><LockOutlined /></span>
      <h2>Not on your pages</h2>
      <p>This page is not part of your access. The owner can add it from Staff.</p>
      <Link to="/"><Button type="primary">Back to dashboard</Button></Link>
    </div>
  );
}

import { CustomerServiceOutlined, TeamOutlined } from "@ant-design/icons";
import { App, Button, List } from "antd";
import { Card, PageHead, Stat } from "../../components/Card";
import { overview } from "../../data/fake/dashboard";
import { staff } from "../../data/fake/people";
import { initials } from "../../lib/format";

/** The desk: who is waiting, who is on. Lives on bundled figures until the push channel exists. */
export function SupportPage() {
  const { message } = App.useApp();
  const { queue } = overview;
  const agents = staff.filter((s) => s.role === "support" && s.status === "active");
  return (
    <>
      <PageHead title="Support" subtitle="Members waiting for a person, and the agents on the desk." />
      <div className="settings-grid">
        <Card icon={<CustomerServiceOutlined />} title="In line">
          <Stat value={String(queue.waiting)} unit="waiting" aside={{ label: "Avg wait", value: `${queue.averageWaitMinutes} min` }} />
          <List
            dataSource={queue.names}
            renderItem={(name, i) => (
              <List.Item actions={[<Button key="join" size="small" type="primary" onClick={() => message.info("Joining a chat lands with the push channel.")}>Join</Button>]}>
                <List.Item.Meta avatar={<span className="queue__avatar">{initials(name)}</span>} title={name} description={`#${i + 1} in line · asked ${3 + i * 2} min ago`} />
              </List.Item>
            )}
          />
        </Card>
        <Card icon={<TeamOutlined />} title="On the desk">
          <Stat value={String(agents.length)} unit="agents online" />
          <List
            dataSource={agents}
            renderItem={(agent) => (
              <List.Item>
                <List.Item.Meta avatar={<span className="queue__avatar">{initials(agent.name)}</span>} title={agent.name} description={agent.email} />
                <span className="chip">online</span>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </>
  );
}

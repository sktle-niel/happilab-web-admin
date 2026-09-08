import { DownOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import { useState } from "react";
import { PageHead } from "../../components/Card";
import { overview } from "../../data/fake/dashboard";
import { dayLabel } from "../../lib/format";
import { CashOutsChart } from "./CashOutsChart";
import { OrdersTodayCard, PointsFlowCard, QueueCard, SignInsCard, StatCards } from "./widgets";

const RANGES = [
  { key: "today", label: "Today" },
  { key: "week", label: "Last 7 days" },
  { key: "month", label: "Last 30 days" },
];

function RangePill() {
  const [range, setRange] = useState("today");
  const label = RANGES.find((r) => r.key === range)?.label ?? "Today";
  return (
    <Dropdown trigger={["click"]} placement="bottomRight" menu={{ items: RANGES, selectedKeys: [range], onClick: ({ key }) => setRange(key) }}>
      <button type="button" className="date-pill">
        <small>{dayLabel(overview.date)}</small>
        {label}
        <DownOutlined style={{ fontSize: 10, color: "var(--muted)" }} />
      </button>
    </Dropdown>
  );
}

export function Dashboard() {
  return (
    <>
      <PageHead title="Programme Overview" subtitle="How the referral programme is doing today." aside={<RangePill />} />
      <section className="dash stagger">
        <StatCards />
        <PointsFlowCard />
        <div className="dash__side">
          <QueueCard />
          <OrdersTodayCard />
        </div>
        <SignInsCard />
        <CashOutsChart />
      </section>
    </>
  );
}

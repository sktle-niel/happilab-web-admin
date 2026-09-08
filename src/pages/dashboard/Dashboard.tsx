import { DownOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import { useState } from "react";
import { PageHead } from "../../components/Card";
import { overview } from "../../data/fake/dashboard";
import { canOpen, type PageKey } from "../../lib/access";
import { dayLabel } from "../../lib/format";
import { useStaffSession } from "../../providers/session";
import { CashOutsChart } from "./CashOutsChart";
import { ActiveMembersCard, CashOutsPendingCard, OrdersTodayCard, PointsFlowCard, PointsIssuedCard, QueueCard, SignInsCard } from "./widgets";

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

const firstName = (name: string) => name.split(" ")[0] ?? name;

/**
 * Three tiers: the figures across the top, the points flow down the left,
 * and on the right the small cards two abreast with the chart beneath.
 * Every card belongs to a page; an account sees the cards of its pages.
 */
export function Dashboard() {
  const { identity } = useStaffSession();
  const may = (page: PageKey) => canOpen(identity?.pages, page);
  const onTheDesk = identity?.role === "support";
  return (
    <>
      <PageHead
        title={onTheDesk ? `Your desk, ${firstName(identity?.name ?? "")}` : "Programme Overview"}
        subtitle={onTheDesk ? "What is waiting for you today." : "How the referral programme is doing today."}
        aside={<RangePill />}
      />
      <section className="dash">
        <div className="dash__stats stagger">
          <PointsIssuedCard />
          {may("cash-outs") && <CashOutsPendingCard />}
          {may("members") && <ActiveMembersCard />}
        </div>
        <div className="dash__body">
          <PointsFlowCard />
          <div className="dash__right stagger">
            {may("support") && <QueueCard />}
            {may("members") && <SignInsCard />}
            {may("orders") && <OrdersTodayCard />}
            {may("cash-outs") && <CashOutsChart />}
          </div>
        </div>
      </section>
    </>
  );
}

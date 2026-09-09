import { DownOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import { useState } from "react";
import { PageHead } from "../../components/Card";
import { canOpen, type PageKey } from "../../lib/access";
import { dayLabel } from "../../lib/format";
import { EMPTY_STATS, RANGES, useStats, type Range } from "../../lib/useStats";
import { useStaffSession } from "../../providers/session";
import { CashOutsChart } from "./CashOutsChart";
import { ActiveMembersCard, CashOutsPendingCard, OrdersCard, PointsFlowCard, PointsIssuedCard, QueueCard, SignInsCard } from "./widgets";

function RangePill({ range, onChange }: { range: Range; onChange: (range: Range) => void }) {
  const label = RANGES.find((r) => r.key === range)?.label ?? "Today";
  return (
    <Dropdown trigger={["click"]} placement="bottomRight" menu={{ items: RANGES.map((r) => ({ key: r.key, label: r.label })), selectedKeys: [range], onClick: ({ key }) => onChange(key as Range) }}>
      <button type="button" className="date-pill">
        <small>{dayLabel(new Date())}</small>
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
 * The range pill asks the API to re-count every figure; every card
 * belongs to a page, and an account sees the cards of its pages.
 */
export function Dashboard() {
  const { identity } = useStaffSession();
  const [range, setRange] = useState<Range>("today");
  const { data } = useStats(range);
  const stats = data ?? EMPTY_STATS;
  const noun = RANGES.find((r) => r.key === range)?.noun ?? "today";
  const may = (page: PageKey) => canOpen(identity?.pages, page);
  const onTheDesk = identity?.role === "support";
  return (
    <>
      <PageHead
        title={onTheDesk ? `Your desk, ${firstName(identity?.name ?? "")}` : "Programme Overview"}
        subtitle={onTheDesk ? "What is waiting for you today." : `How the referral programme is doing ${noun}.`}
        aside={<RangePill range={range} onChange={setRange} />}
      />
      <section className="dash">
        <div className="dash__stats stagger">
          <PointsIssuedCard stats={stats} />
          {may("cash-outs") && <CashOutsPendingCard stats={stats} />}
          {may("members") && <ActiveMembersCard stats={stats} />}
        </div>
        <div className="dash__body">
          <PointsFlowCard stats={stats} />
          <div className="dash__right stagger">
            {may("support") && <QueueCard stats={stats} />}
            {may("members") && <SignInsCard stats={stats} />}
            {may("orders") && <OrdersCard stats={stats} noun={noun} />}
            {may("cash-outs") && <CashOutsChart cashOuts={stats.cashOuts} />}
          </div>
        </div>
      </section>
    </>
  );
}

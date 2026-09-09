import { DownOutlined } from "@ant-design/icons";
import { useList } from "@refinedev/core";
import { Dropdown } from "antd";
import { useMemo, useState } from "react";
import { PageHead } from "../../components/Card";
import type { CashOut, Order } from "../../data/fake/money";
import type { Member } from "../../data/fake/people";
import { canOpen, type PageKey } from "../../lib/access";
import { dayLabel } from "../../lib/format";
import { RANGES, figuresFor, type Range } from "../../lib/overview";
import { useStaffSession } from "../../providers/session";
import { CashOutsChart } from "./CashOutsChart";
import { ActiveMembersCard, CashOutsPendingCard, OrdersCard, PointsFlowCard, PointsIssuedCard, QueueCard, SignInsCard } from "./widgets";

const OFF = { pagination: { mode: "off" as const } };

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
 * The range pill re-counts every figure from the tables; every card
 * belongs to a page, and an account sees the cards of its pages.
 */
export function Dashboard() {
  const { identity } = useStaffSession();
  const [range, setRange] = useState<Range>("today");
  const { result: orders } = useList<Order>({ resource: "orders", ...OFF });
  const { result: cashOuts } = useList<CashOut>({ resource: "cash-outs", ...OFF });
  const { result: members } = useList<Member>({ resource: "members", ...OFF });
  const figures = useMemo(() => figuresFor(range, orders?.data ?? [], cashOuts?.data ?? [], members?.data ?? []), [range, orders, cashOuts, members]);
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
          <PointsIssuedCard figures={figures} />
          {may("cash-outs") && <CashOutsPendingCard figures={figures} />}
          {may("members") && <ActiveMembersCard figures={figures} />}
        </div>
        <div className="dash__body">
          <PointsFlowCard figures={figures} />
          <div className="dash__right stagger">
            {may("support") && <QueueCard />}
            {may("members") && <SignInsCard />}
            {may("orders") && <OrdersCard figures={figures} noun={noun} />}
            {may("cash-outs") && <CashOutsChart />}
          </div>
        </div>
      </section>
    </>
  );
}

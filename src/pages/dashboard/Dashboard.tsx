import { DownOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import { useState, type ReactElement } from "react";
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

/** Each card belongs to a page; an account sees the cards of the pages it may open. */
const CARDS: { page: PageKey; card: () => ReactElement }[] = [
  { page: "dashboard", card: PointsIssuedCard },
  { page: "cash-outs", card: CashOutsPendingCard },
  { page: "members", card: ActiveMembersCard },
  { page: "dashboard", card: PointsFlowCard },
  { page: "support", card: QueueCard },
  { page: "members", card: SignInsCard },
  { page: "orders", card: OrdersTodayCard },
  { page: "cash-outs", card: CashOutsChart },
];

const firstName = (name: string) => name.split(" ")[0] ?? name;

export function Dashboard() {
  const { identity } = useStaffSession();
  const cards = CARDS.filter(({ page }) => canOpen(identity?.pages, page));
  const onTheDesk = identity?.role === "support";
  return (
    <>
      <PageHead
        title={onTheDesk ? `Your desk, ${firstName(identity?.name ?? "")}` : "Programme Overview"}
        subtitle={onTheDesk ? "What is waiting for you today." : "How the referral programme is doing today."}
        aside={<RangePill />}
      />
      <section className="dash stagger">
        {cards.map(({ card: Card }, i) => <Card key={i} />)}
      </section>
    </>
  );
}

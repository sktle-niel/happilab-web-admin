import { CustomerServiceOutlined, ShoppingOutlined, SwapOutlined, TeamOutlined, ThunderboltOutlined, WalletOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { Card, Stat } from "../../components/Card";
import { compact, initials, pesos, thousands } from "../../lib/format";
import type { Stats } from "../../lib/useStats";

type Props = { stats: Stats };
const signed = (percent: number) => `${percent >= 0 ? "+" : ""}${percent}%`;
const chip = (percent: number | null) => (percent === null ? {} : { chip: signed(percent) });
/** A card's figures as one spreadsheet row, for the menu's export. */
const csv = (name: string, row: Record<string, unknown>) => () => ({ name, rows: [row] });
const STAGE_COLORS = ["var(--lavender)", "var(--ink)", "var(--lime)"];

export function PointsIssuedCard({ stats }: Props) {
  const { pointsIssued, range } = stats;
  return (
    <Card className="dash__stat" spot="points-issued" icon={<ThunderboltOutlined />} title="Points issued" menu={{ report: "/orders", csv: csv("points-issued", { range, points: pointsIssued.value, change_percent: pointsIssued.deltaPercent }) }}>
      <Stat value={compact(pointsIssued.value)} unit="pts earned" {...chip(pointsIssued.deltaPercent)} />
    </Card>
  );
}

export function CashOutsPendingCard({ stats }: Props) {
  const { pending } = stats;
  return (
    <Card className="dash__stat" spot="cash-outs-pending" icon={<WalletOutlined />} title="Cash-outs pending" menu={{ report: "/cash-outs", csv: csv("cash-outs-pending", { requests: pending.count, pesos: pending.pesos, waiting_for_review: pending.undecided }) }}>
      <Stat value={String(pending.count)} unit="requests" aside={{ label: "Waiting", value: pesos(pending.pesos) }} />
    </Card>
  );
}

export function ActiveMembersCard({ stats }: Props) {
  const { activeMembers, range } = stats;
  return (
    <Card className="dash__stat" spot="active-members" icon={<TeamOutlined />} title="Active members" menu={{ report: "/members", csv: csv("active-members", { range, members: activeMembers.value, joined_change_percent: activeMembers.deltaPercent }) }}>
      <Stat value={thousands(activeMembers.value)} unit="members" {...chip(activeMembers.deltaPercent)} />
    </Card>
  );
}

/** Where the points went, as three circles sized by share, then the referral stages as bars. */
export function PointsFlowCard({ stats }: Props) {
  const { flow, stages, range } = stats;
  return (
    <Card className="dash__flow" spot="points-flow" icon={<SwapOutlined />} title="Points flow" menu={{ report: "/cash-outs", csv: csv("points-flow", { range, earned: flow.earned, cashed_out: flow.cashedOut, pending: flow.pending }) }}>
      <Stat value={compact(flow.earned)} unit="pts earned" aside={{ label: "Cashed out", value: `${compact(flow.cashedOut)} pts` }} />
      <div className="bubbles">
        <div className="bubble bubble--lavender"><b>{compact(flow.earned)}</b><small>earned</small></div>
        <div className="bubble bubble--ink"><b>{compact(flow.cashedOut)}</b><small>cashed out</small></div>
        <div className="bubble bubble--lime"><b>{compact(flow.pending)}</b><small>pending</small></div>
      </div>
      <div className="bars">
        {stages.map((stage, i) => (
          <div key={stage.label}>
            <div className="bar__head">
              <span className="bar__value">{stage.percent}<small>%</small></span>
              <span className="bar__label">{stage.label}<i className="bar__swatch" style={{ background: STAGE_COLORS[i] }} /></span>
            </div>
            <div className="bar__track"><div className="bar__fill" style={{ width: `${stage.percent}%`, background: STAGE_COLORS[i] }} /></div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/** Who is in line right now; a row opens the conversation. */
export function QueueCard({ stats }: Props) {
  const navigate = useNavigate();
  const { queue } = stats;
  return (
    <Card className="dash__small" spot="support-queue" icon={<CustomerServiceOutlined />} title="Support queue" menu={{ report: "/support" }}>
      <Stat value={String(queue.waiting)} unit="in line" aside={{ label: "Avg wait", value: `${queue.averageWaitMinutes} min` }} />
      <div className="queue">
        {queue.next.map((c, i) => (
          <button type="button" className="queue__row" key={c.id} onClick={() => navigate(`/support/${c.id}`)}>
            <span className="queue__avatar">{initials(c.memberName)}</span>
            <b>{c.memberName}</b>
            <span>#{i + 1}</span>
          </button>
        ))}
        {queue.waiting === 0 && <span className="cell-muted">Nobody waiting.</span>}
      </div>
    </Card>
  );
}

export function OrdersCard({ stats, noun }: Props & { noun: string }) {
  const { orders, range } = stats;
  return (
    <Card className="dash__small" spot="orders-today" icon={<ShoppingOutlined />} title={`Orders ${noun}`} menu={{ report: "/orders", csv: csv("orders", { range, orders: orders.count, pesos: orders.pesos }) }}>
      <Stat value={String(orders.count)} unit="orders" aside={{ label: "Sales", value: pesos(orders.pesos) }} />
    </Card>
  );
}

/** One dot per day for eight weeks; the darker, the more members signed in. */
export function SignInsCard({ stats }: Props) {
  const { signIns } = stats;
  return (
    <Card className="dash__small" spot="sign-ins" icon={<TeamOutlined />} title="Sign-ins" menu={{ report: "/members" }}>
      <Stat value={String(signIns.busyDays)} unit="busy days" {...chip(signIns.deltaPercent)} />
      <div className="dots">
        {signIns.levels.map((level, i) => <i className="dot" data-level={level} key={i} />)}
      </div>
      <div className="dots__legend"><span>8 weeks ago</span><span>Today</span></div>
    </Card>
  );
}

import { CustomerServiceOutlined, ShoppingOutlined, SwapOutlined, TeamOutlined, ThunderboltOutlined, WalletOutlined } from "@ant-design/icons";
import { overview, signInLevels } from "../../data/fake/dashboard";
import { compact, initials, pesos, thousands } from "../../lib/format";
import { Card, Stat } from "../../components/Card";

export function StatCards() {
  const { pointsIssued, pending, activeMembers } = overview;
  return (
    <>
      <Card className="dash__stat" spot="points-issued" icon={<ThunderboltOutlined />} title="Points issued">
        <Stat value={compact(pointsIssued.value)} unit="pts this month" chip={`+${pointsIssued.deltaPercent}%`} />
      </Card>
      <Card className="dash__stat" spot="cash-outs-pending" icon={<WalletOutlined />} title="Cash-outs pending">
        <Stat value={String(pending.count)} unit="requests" aside={{ label: "Waiting", value: pesos(pending.pesos) }} />
      </Card>
      <Card className="dash__stat" spot="active-members" icon={<TeamOutlined />} title="Active members">
        <Stat value={thousands(activeMembers.value)} unit="members" chip={`+${activeMembers.deltaPercent}%`} />
      </Card>
    </>
  );
}

/** Where the points went, as three circles sized by share, then the referral stages as bars. */
export function PointsFlowCard() {
  const { flow, stages } = overview;
  return (
    <Card className="dash__flow" spot="points-flow" icon={<SwapOutlined />} title="Points flow">
      <Stat value={compact(flow.earned)} unit="pts earned" chip={`+${Math.round(((flow.earned - flow.cashedOut) / flow.earned) * 100)}%`} />
      <div className="bubbles">
        <div className="bubble bubble--lavender"><b>{compact(flow.earned)}</b><small>earned</small></div>
        <div className="bubble bubble--ink"><b>{compact(flow.cashedOut)}</b><small>cashed out</small></div>
        <div className="bubble bubble--lime"><b>{compact(flow.pending)}</b><small>pending</small></div>
      </div>
      <div className="bars">
        {stages.map((stage) => (
          <div key={stage.label}>
            <div className="bar__head">
              <span className="bar__value">{stage.percent}<small>%</small></span>
              <span className="bar__label">{stage.label}<i className="bar__swatch" style={{ background: stage.color }} /></span>
            </div>
            <div className="bar__track"><div className="bar__fill" style={{ width: `${stage.percent}%`, background: stage.color }} /></div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function QueueCard() {
  const { queue } = overview;
  return (
    <Card spot="support-queue" icon={<CustomerServiceOutlined />} title="Support queue">
      <Stat value={String(queue.waiting)} unit="in line" aside={{ label: "Avg wait", value: `${queue.averageWaitMinutes} min` }} />
      <div className="queue">
        {queue.names.map((name, i) => (
          <div className="queue__row" key={name}>
            <span className="queue__avatar">{initials(name)}</span>
            <b>{name}</b>
            <span>#{i + 1}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function OrdersTodayCard() {
  const { ordersToday } = overview;
  return (
    <Card spot="orders-today" icon={<ShoppingOutlined />} title="Orders today">
      <Stat value={String(ordersToday.count)} unit="orders" aside={{ label: "Sales", value: pesos(ordersToday.pesos) }} />
    </Card>
  );
}

/** One dot per day for eight weeks; the darker, the more members signed in. */
export function SignInsCard() {
  return (
    <Card className="dash__dots" spot="sign-ins" icon={<TeamOutlined />} title="Sign-ins">
      <Stat value={String(signInLevels.filter((l) => l >= 2).length)} unit="busy days" chip="+8%" />
      <div className="dots">
        {signInLevels.map((level, i) => <i className="dot" data-level={level} key={i} />)}
      </div>
      <div className="dots__legend"><span>8 weeks ago</span><span>Today</span></div>
    </Card>
  );
}

import { PageHead } from "../../components/Card";
import { overview } from "../../data/fake/dashboard";
import { dayLabel } from "../../lib/format";
import { CashOutsChart } from "./CashOutsChart";
import { OrdersTodayCard, PointsFlowCard, QueueCard, SignInsCard, StatCards } from "./widgets";

export function Dashboard() {
  return (
    <>
      <PageHead
        title="Programme Overview"
        subtitle="How the referral programme is doing today."
        aside={
          <div className="date-pill">
            <small>{dayLabel(overview.date)}</small>
            Today
          </div>
        }
      />
      <section className="dash">
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

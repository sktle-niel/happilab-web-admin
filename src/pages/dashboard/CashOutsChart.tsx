import { BankOutlined } from "@ant-design/icons";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { overview } from "../../data/fake/dashboard";
import { compact } from "../../lib/format";
import { Card } from "../../components/Card";

const CURRENT = overview.date.getMonth();
const LIME = "#d6f26a";
const LAVENDER = "#b9b2f4";

/** The month at hand in colour, every other month hatched — the reference's sleep chart, for money. */
export function CashOutsChart() {
  const data = overview.cashOutsByMonth;
  return (
    <Card
      className="dash__chart"
      dark
      icon={<BankOutlined />}
      title="Cash-outs"
      action={
        <select className="chart__select" defaultValue="monthly" aria-label="Period">
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
        </select>
      }
    >
      <div className="chart__stats">
        <div className="chart__stat">
          <i style={{ background: LIME }} />
          <div>
            <b>₱{compact(overview.sentThisMonth)}<small>sent</small></b>
            <span>This month</span>
          </div>
        </div>
        <div className="chart__stat">
          <i style={{ background: LAVENDER }} />
          <div>
            <b>{Math.floor(overview.averageSendHours / 24)}d {overview.averageSendHours % 24}h</b>
            <span>Average time to send</span>
          </div>
        </div>
      </div>
      <div className="chart__body">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} barCategoryGap="28%" margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="2.5" height="6" fill="#3a3a3a" />
              </pattern>
            </defs>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#b9b9b5", fontSize: 12, fontWeight: 600 }} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{ background: "#2c2c2c", border: 0, borderRadius: 14, color: "#fff", fontSize: 12 }}
              itemStyle={{ color: "#fff" }}
              formatter={(value, name) => [`${value} requests`, name === "sent" ? "Sent" : "Requested"]}
            />
            <Bar dataKey="requested" radius={8}>
              {data.map((_, i) => <Cell key={i} fill={i === CURRENT ? LAVENDER : "url(#hatch)"} />)}
            </Bar>
            <Bar dataKey="sent" radius={8}>
              {data.map((_, i) => <Cell key={i} fill={i === CURRENT ? LIME : "url(#hatch)"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

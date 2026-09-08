import { BankOutlined, DownOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import { useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { overview } from "../../data/fake/dashboard";
import { compact } from "../../lib/format";
import { Card } from "../../components/Card";

type Period = "monthly" | "weekly";
const PERIODS: { key: Period; label: string }[] = [
  { key: "monthly", label: "Monthly" },
  { key: "weekly", label: "Weekly" },
];
const LIME = "#d6f26a";
const LAVENDER = "#b9b2f4";

/** The period at hand in colour, every other one hatched — the reference's sleep chart, for money. */
export function CashOutsChart() {
  const [period, setPeriod] = useState<Period>("monthly");
  const series = period === "monthly" ? overview.cashOutsByMonth : overview.cashOutsByWeek;
  const current = series.findIndex((point) => point.current);
  const label = PERIODS.find((p) => p.key === period)?.label ?? "Monthly";
  return (
    <Card
      className="dash__chart"
      dark
      icon={<BankOutlined />}
      title="Cash-outs"
      action={
        <Dropdown
          trigger={["click"]}
          placement="bottomRight"
          menu={{ items: PERIODS, selectedKeys: [period], onClick: ({ key }) => setPeriod(key as Period) }}
        >
          <button type="button" className="chart__select">
            {label}
            <DownOutlined style={{ fontSize: 10 }} />
          </button>
        </Dropdown>
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
          <BarChart data={series} barGap={4} barCategoryGap="28%" margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="2.5" height="6" fill="#3a3a3a" />
              </pattern>
            </defs>
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#b9b9b5", fontSize: 12, fontWeight: 500 }} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{ background: "#262626", border: 0, borderRadius: 10, color: "#fff", fontSize: 12 }}
              itemStyle={{ color: "#fff" }}
              formatter={(value, name) => [`${value} requests`, name === "sent" ? "Sent" : "Requested"]}
            />
            <Bar dataKey="requested" radius={6} isAnimationActive={false}>
              {series.map((_, i) => <Cell key={i} fill={i === current ? LAVENDER : "url(#hatch)"} />)}
            </Bar>
            <Bar dataKey="sent" radius={6} isAnimationActive={false}>
              {series.map((_, i) => <Cell key={i} fill={i === current ? LIME : "url(#hatch)"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

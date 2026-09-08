import { MoreOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import { toast } from "sonner";
import type { ReactNode } from "react";

type CardProps = {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  dark?: boolean;
  className?: string;
  action?: ReactNode;
};

/** The card's own menu: the two things every figure on the dashboard can do. */
function CardMenu({ title }: { title: string }) {
  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      menu={{
        items: [
          { key: "report", label: "Open report" },
          { key: "export", label: "Export as CSV" },
        ],
        onClick: ({ key }) => toast(`${key === "report" ? "The report" : "The export"} for ${title} lands with the API.`),
      }}
    >
      <button type="button" className="card__kebab" aria-label={`${title} menu`}>
        <MoreOutlined />
      </button>
    </Dropdown>
  );
}

/** The dashboard's card: an icon in a circle, a title, a menu or an action, then whatever it holds. */
export function Card({ title, icon, children, dark = false, className = "", action }: CardProps) {
  return (
    <article className={`card ${dark ? "card--dark" : ""} ${className}`.trim()}>
      <header className="card__head">
        <span className="card__icon">{icon}</span>
        <span className="card__title">{title}</span>
        {action ?? <CardMenu title={title} />}
      </header>
      {children}
    </article>
  );
}

type StatProps = {
  value: string;
  unit: string;
  chip?: string;
  aside?: { label: string; value: string };
};

/** A big figure with its unit, and either a delta chip or a small aside. */
export function Stat({ value, unit, chip, aside }: StatProps) {
  return (
    <div className="stat">
      <span className="stat__value">{value}</span>
      {chip && <span className="chip">{chip}</span>}
      <span className="stat__unit">{unit}</span>
      {aside && (
        <span className="stat__aside">
          {aside.label}
          <b>{aside.value}</b>
        </span>
      )}
    </div>
  );
}

type PageHeadProps = { title: string; subtitle: string; aside?: ReactNode };

export function PageHead({ title, subtitle, aside }: PageHeadProps) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {aside}
    </div>
  );
}

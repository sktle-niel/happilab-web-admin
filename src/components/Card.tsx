import { MoreOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { downloadCsv } from "../lib/csv";

/** Where a card's figure comes from: the page that explains it, and the rows behind it for a spreadsheet. */
export type CardMenuProps = { report: string; csv?: () => { name: string; rows: Record<string, unknown>[] } };

type CardProps = {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  dark?: boolean;
  className?: string;
  action?: ReactNode;
  menu?: CardMenuProps;
  /** The id the search lands on, as `data-spot`. */
  spot?: string;
};

function CardMenu({ title, report, csv }: CardMenuProps & { title: string }) {
  const navigate = useNavigate();
  const items = [{ key: "report", label: "Open report" }, ...(csv ? [{ key: "export", label: "Export as CSV" }] : [])];
  const act = ({ key }: { key: string }) => {
    if (key === "report") navigate(report);
    else if (csv) {
      const file = csv();
      downloadCsv(file.name, file.rows);
    }
  };
  return (
    <Dropdown trigger={["click"]} placement="bottomRight" menu={{ items, onClick: act }}>
      <button type="button" className="card__kebab" aria-label={`${title} menu`}>
        <MoreOutlined />
      </button>
    </Dropdown>
  );
}

/** The dashboard's card: an icon in a circle, a title, a menu or an action, then whatever it holds. */
export function Card({ title, icon, children, dark = false, className = "", action, menu, spot }: CardProps) {
  return (
    <article className={`card ${dark ? "card--dark" : ""} ${className}`.trim()} data-spot={spot}>
      <header className="card__head">
        <span className="card__icon">{icon}</span>
        <span className="card__title">{title}</span>
        {action ?? (menu && <CardMenu title={title} {...menu} />)}
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

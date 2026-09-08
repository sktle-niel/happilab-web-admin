import type { ReactNode } from "react";

type CardProps = {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  dark?: boolean;
  className?: string;
  action?: ReactNode;
};

/** The dashboard's card: an icon in a circle, a title, a kebab or an action, then whatever it holds. */
export function Card({ title, icon, children, dark = false, className = "", action }: CardProps) {
  return (
    <article className={`card ${dark ? "card--dark" : ""} ${className}`.trim()}>
      <header className="card__head">
        <span className="card__icon">{icon}</span>
        <span className="card__title">{title}</span>
        {action ?? <span className="card__kebab" aria-hidden>⋮</span>}
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

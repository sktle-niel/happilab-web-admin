import { AppstoreOutlined, CustomerServiceOutlined, PlusOutlined, ShoppingOutlined, TagsOutlined, WalletOutlined } from "@ant-design/icons";
import type { ComponentType } from "react";
import { initials } from "../lib/format";
import type { Hit, HitType } from "../lib/search";

export type RowIcon = HitType | "plus" | "support";

/** One line the panel can land on: a search hit, a recent one, a quick action or something waiting. */
export type Row = { key: string; title: string; subtitle?: string; to: string; stat?: string; kbd?: string; icon: RowIcon; hit?: Hit };

export const TYPE_ICONS: Record<Exclude<RowIcon, "members">, ComponentType> = {
  pages: AppstoreOutlined,
  orders: ShoppingOutlined,
  "cash-outs": WalletOutlined,
  products: TagsOutlined,
  plus: PlusOutlined,
  support: CustomerServiceOutlined,
};

function Mark({ row }: { row: Row }) {
  if (row.icon === "members") return <span className="search-row__avatar">{initials(row.title)}</span>;
  const Icon = TYPE_ICONS[row.icon];
  return <span className="search-row__icon"><Icon /></span>;
}

type Props = { row: Row; active: boolean; onHover: () => void; onPick: () => void };

export function SearchRow({ row, active, onHover, onPick }: Props) {
  return (
    <button type="button" role="option" aria-selected={active} className={`search-row${active ? " is-active" : ""}`} onMouseEnter={onHover} onClick={onPick}>
      <Mark row={row} />
      <span className="search-row__text">
        <b>{row.title}</b>
        {row.subtitle && <span>{row.subtitle}</span>}
      </span>
      {row.stat && <span className="search-row__stat">{row.stat}</span>}
      {row.kbd && (
        <span className="search-row__kbd">
          <kbd>Alt</kbd>
          <kbd>{row.kbd}</kbd>
        </span>
      )}
    </button>
  );
}

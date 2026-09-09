import type { HitType } from "../lib/search";
import { SearchRow, type Row } from "./SearchRow";
import { TypeChips } from "./TypeChips";

export type Section = { label: string; count?: number; seeAll?: string; rows: Row[] };

type Props = {
  query: string;
  types: HitType[];
  sections: Section[];
  flat: Row[];
  active: number;
  onTypes: (types: HitType[]) => void;
  onHover: (index: number) => void;
  onPick: (row: Row) => void;
  onSeeAll: (to: string) => void;
};

function Empty({ query, types }: { query: string; types: HitType[] }) {
  if (types.length === 0) return <div className="search-panel__empty">Pick at least one kind above.</div>;
  if (query.length >= 2) return <div className="search-panel__empty">Nothing matches “{query}”.</div>;
  return <div className="search-panel__empty">Type to search members, orders, cash-outs, products and pages.</div>;
}

/** Under the box: what to look through, then either what was found or what is recent, quick and waiting. */
export function SearchPanel({ query, types, sections, flat, active, onTypes, onHover, onPick, onSeeAll }: Props) {
  return (
    <div className="search-panel" role="listbox" onMouseDown={(event) => event.preventDefault()}>
      <TypeChips types={types} onChange={onTypes} />
      {sections.length === 0 && <Empty query={query} types={types} />}
      {sections.map((section) => (
        <div key={section.label} className="search-panel__group">
          <div className="search-panel__label">
            <span>
              {section.label}
              {section.count !== undefined && <b>{section.count}</b>}
            </span>
            {section.seeAll && <button type="button" onClick={() => onSeeAll(section.seeAll!)}>See all</button>}
          </div>
          {section.rows.map((row) => {
            const index = flat.indexOf(row);
            return <SearchRow key={row.key} row={row} active={index === active} onHover={() => onHover(index)} onPick={() => onPick(row)} />;
          })}
        </div>
      ))}
    </div>
  );
}

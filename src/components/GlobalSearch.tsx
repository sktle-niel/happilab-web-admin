import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { overview } from "../data/fake/dashboard";
import { canOpen, type PageKey } from "../lib/access";
import { QUICK_ACTIONS } from "../lib/destinations";
import { readRecent, remember } from "../lib/recentSearches";
import { HIT_TYPES, searchAll, type Hit, type HitType } from "../lib/search";
import { useStaffSession } from "../providers/session";
import { SearchPanel, type Section } from "./SearchPanel";
import type { Row } from "./SearchRow";

const ALL_TYPES = HIT_TYPES.map((t) => t.type);
const hitRow = (hit: Hit): Row => ({ key: hit.key, title: hit.title, subtitle: hit.subtitle, to: hit.to, icon: hit.type, hit, ...(hit.stat && { stat: hit.stat }) });

/** With nothing typed: what was opened lately, what staff come to do, and what is waiting. */
function restingSections(recent: Hit[], pages: readonly PageKey[] | undefined): Section[] {
  const may = (page: PageKey) => canOpen(pages, page);
  const actions: Row[] = QUICK_ACTIONS.filter((a) => may(a.page)).map((a) => ({ key: `action:${a.to}`, title: a.label, to: a.to, kbd: a.key, icon: "plus" }));
  const waiting: Row[] = [
    ...(may("cash-outs") ? [{ key: "wait:cash-outs", title: "Cash-outs to review", to: "/cash-outs", stat: String(overview.pending.count), icon: "cash-outs" as const }] : []),
    ...(may("support") ? [{ key: "wait:support", title: "Members in the support queue", to: "/support", stat: String(overview.queue.waiting), icon: "support" as const }] : []),
  ];
  return [
    ...(recent.length > 0 ? [{ label: "Recent", count: recent.length, rows: recent.map(hitRow) }] : []),
    ...(actions.length > 0 ? [{ label: "Quick actions", rows: actions }] : []),
    ...(waiting.length > 0 ? [{ label: "Waiting on you", rows: waiting }] : []),
  ];
}

/** The top bar's search: `/` or Ctrl+K from anywhere, arrows and Enter to choose, Alt and a letter for a quick action. */
export function GlobalSearch() {
  const navigate = useNavigate();
  const { identity } = useStaffSession();
  const pages = identity?.pages;
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [types, setTypes] = useState<HitType[]>(ALL_TYPES);
  const [recent, setRecent] = useState<Hit[]>(readRecent);

  // A keyboard action, so it focuses at once, with no animation of its own.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if ((event.key === "k" && (event.ctrlKey || event.metaKey)) || (event.key === "/" && !typing)) {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const term = query.trim();
  const sections = useMemo<Section[]>(
    () => (term.length >= 2 ? searchAll(term, types).map((group) => ({ label: group.label, rows: group.hits.map(hitRow), ...(group.to && { seeAll: group.to }) })) : restingSections(recent, pages)),
    [term, types, recent, pages],
  );
  const flat = useMemo(() => sections.flatMap((section) => section.rows), [sections]);

  const leave = () => {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  };
  const pick = (row: Row) => {
    if (row.hit) setRecent(remember(row.hit));
    leave();
    navigate(row.to);
  };
  const seeAll = (to: string) => {
    leave();
    navigate(to);
  };
  const changeTypes = (next: HitType[]) => {
    setTypes(next);
    setActive(0);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.altKey && event.key.length === 1) {
      const action = flat.find((row) => row.kbd?.toLowerCase() === event.key.toLowerCase());
      if (action) {
        event.preventDefault();
        pick(action);
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, flat.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      const row = flat[active] ?? flat[0];
      if (row) pick(row);
    } else if (event.key === "Escape") {
      leave();
    }
  };

  return (
    <div className="search-wrap">
      <label className="search">
        <SearchOutlined />
        <input
          ref={inputRef}
          value={query}
          placeholder="Search actions, members, orders, pages…"
          aria-label="Search"
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
        />
        <kbd className="search__kbd">/</kbd>
      </label>
      {open && <SearchPanel query={term} types={types} sections={sections} flat={flat} active={active} onTypes={changeTypes} onHover={setActive} onPick={pick} onSeeAll={seeAll} />}
    </div>
  );
}

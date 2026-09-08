import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { searchAll } from "../lib/search";

/** The top bar's search: results as you type, arrows and Enter to choose, `/` or Ctrl+K to get here from anywhere. */
export function GlobalSearch() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const groups = useMemo(() => searchAll(query), [query]);
  const flat = useMemo(() => groups.flatMap((group) => group.hits), [groups]);

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

  const go = (to: string) => {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    navigate(to);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, flat.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      const to = flat[active]?.to ?? flat[0]?.to;
      if (to) go(to);
    } else if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showing = open && query.trim().length >= 2;
  return (
    <div className="search-wrap">
      <label className="search">
        <SearchOutlined />
        <input
          ref={inputRef}
          value={query}
          placeholder="Search members, orders, references…"
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
      {showing && (
        <div className="search-panel" role="listbox" onMouseDown={(event) => event.preventDefault()}>
          {groups.length === 0 && <div className="search-panel__empty">Nothing matches “{query.trim()}”.</div>}
          {groups.map((group) => (
            <div key={group.label} className="search-panel__group">
              <div className="search-panel__label">
                {group.label}
                {group.to && <button type="button" onClick={() => go(group.to!)}>See all</button>}
              </div>
              {group.hits.map((hit) => {
                const index = flat.indexOf(hit);
                return (
                  <button
                    type="button"
                    key={hit.key}
                    role="option"
                    aria-selected={index === active}
                    className={`search-hit${index === active ? " is-active" : ""}`}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => go(hit.to)}
                  >
                    <span className="search-hit__title">{hit.title}</span>
                    <span className="search-hit__sub">{hit.subtitle}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

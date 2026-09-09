import { useTable } from "@refinedev/antd";
import { Segmented } from "antd";
import { useState } from "react";
import { StatusTag } from "../../components/StatusTag";
import { categoryLabel, type Ticket, type TicketStatus } from "../../data/fake/tickets";
import { dayLabel } from "../../lib/format";

type Pile = "open" | "done";
const PILES: { label: string; value: Pile }[] = [
  { label: "Open", value: "open" },
  { label: "Done", value: "done" },
];
const STATUSES: Record<Pile, TicketStatus[]> = { open: ["open", "in_progress"], done: ["done"] };
export const TICKET_LABELS: Partial<Record<TicketStatus, string>> = { in_progress: "In progress" };

/** Tickets still open, or the ones done; a row opens the ticket on the right. */
export function TicketList({ selectedId, onOpen }: { selectedId: string | undefined; onOpen: (id: string) => void }) {
  const [pile, setPile] = useState<Pile>("open");
  const { tableProps, setFilters } = useTable<Ticket>({
    resource: "tickets",
    pagination: { mode: "off" },
    sorters: { initial: [{ field: "openedAt", order: "desc" }] },
    filters: { initial: [{ field: "status", operator: "in", value: STATUSES.open }] },
  });
  const rows = (tableProps.dataSource ?? []) as Ticket[];
  const show = (next: Pile) => {
    setPile(next);
    setFilters([{ field: "status", operator: "in", value: STATUSES[next] }], "merge");
  };
  return (
    <aside className="card chat-list">
      <div className="chat-list__search"><Segmented block options={PILES} value={pile} onChange={(next) => show(next as Pile)} /></div>
      <div className="chat-list__label">{pile === "open" ? "Open" : "Done"} <span className="nav__badge">{rows.length}</span></div>
      {rows.map((t) => (
        <div key={t.id} className={`chat-row${t.id === selectedId ? " is-selected" : ""}`} onClick={() => onOpen(t.id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onOpen(t.id)}>
          <div className="chat-row__body">
            <div className="chat-row__top"><b>{t.reference} · {t.memberName}</b><small>{dayLabel(new Date(t.openedAt))}</small></div>
            <div className="chat-row__snippet">{t.summary}</div>
            <div className="chat-row__tags">
              <StatusTag status={t.status} label={TICKET_LABELS[t.status]} />
              <small className="cell-muted">{categoryLabel(t.category)} · {t.assignee ?? "nobody yet"}</small>
            </div>
          </div>
        </div>
      ))}
      {rows.length === 0 && <div className="chat-list__empty">{pile === "open" ? "Nothing open. Tickets come from a chat's Open ticket." : "Nothing done yet."}</div>}
    </aside>
  );
}

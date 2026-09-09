import { Button } from "antd";
import { useState } from "react";
import { SearchBox } from "../../components/SearchBox";
import { StatusTag } from "../../components/StatusTag";
import type { Conversation } from "../../data/types";
import { dayLabel, initials } from "../../lib/format";
import { useConversations, useDeskActions } from "../../lib/useDesk";
import type { View } from "./SupportPage";

const minutesSince = (iso: string) => Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
const tickets = (n: number) => (n > 0 ? ` · ${n} ticket${n === 1 ? "" : "s"}` : "");

type RowProps = { conversation: Conversation; position?: number; selected: boolean; onOpen: () => void; onJoin?: () => void; joining?: boolean };

/** One chat in the list: who, where it stands, and what it is about. */
function Row({ conversation: c, position, selected, onOpen, onJoin, joining }: RowProps) {
  const when = c.status === "queued" ? `#${position} · ${minutesSince(c.openedAt)} min` : c.status === "ended" && c.endedAt ? dayLabel(new Date(c.endedAt)) : c.agentName;
  return (
    <div className={`chat-row${selected ? " is-selected" : ""}`} onClick={onOpen} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onOpen()}>
      <span className="queue__avatar">{initials(c.memberName)}</span>
      <div className="chat-row__body">
        <div className="chat-row__top"><b>{c.memberName}</b><small>{when}</small></div>
        <div className="chat-row__snippet">{c.topic ?? "No topic given"}</div>
        {c.status === "ended" && c.resolution && (
          <div className="chat-row__tags">
            <StatusTag status={c.resolution} />
            <small className="cell-muted">{c.topic ?? "No topic"}{tickets(c.ticketCount)}</small>
          </div>
        )}
      </div>
      {onJoin && <Button size="small" type="primary" loading={joining} onClick={(e) => { e.stopPropagation(); onJoin(); }}>Join</Button>}
    </div>
  );
}

type ListProps = { selectedId: string | undefined; onOpen: (id: string) => void };

/** Everything that ended, newest first, searched by member or topic on the API. */
function HistoryList({ selectedId, onOpen }: ListProps) {
  const [q, setQ] = useState("");
  const { data } = useConversations("ended", q);
  const ended = data?.items ?? [];
  return (
    <aside className="card chat-list">
      <div className="chat-list__search"><SearchBox initial={q} placeholder="Search member or topic" onSearch={setQ} /></div>
      <div className="chat-list__label">Ended <span className="nav__badge">{data?.total ?? 0}</span></div>
      {ended.map((c) => <Row key={c.id} conversation={c} selected={c.id === selectedId} onOpen={() => onOpen(c.id)} />)}
      {ended.length === 0 && <div className="chat-list__empty">No chat matches.</div>}
    </aside>
  );
}

/** The line, first in first, and the chats already open; Join takes the next one and opens it. */
function LiveList({ selectedId, onOpen }: ListProps) {
  const { data: waiting } = useConversations("queued");
  const { data: open } = useConversations("with_agent");
  const { join, busy } = useDeskActions();
  const queued = waiting?.items ?? [];
  const active = open?.items ?? [];
  return (
    <aside className="card chat-list">
      <div className="chat-list__label" data-spot="in-line">In line <span className="nav__badge">{queued.length}</span></div>
      {queued.map((c, i) => <Row key={c.id} conversation={c} position={i + 1} selected={c.id === selectedId} onOpen={() => onOpen(c.id)} joining={busy} onJoin={() => join(c.id).then(() => onOpen(c.id))} />)}
      {queued.length === 0 && <div className="chat-list__empty">Nobody waiting.</div>}
      <div className="chat-list__label" data-spot="on-the-desk">Open</div>
      {active.map((c) => <Row key={c.id} conversation={c} selected={c.id === selectedId} onOpen={() => onOpen(c.id)} />)}
      {active.length === 0 && <div className="chat-list__empty">No chat open. Ended ones are under History.</div>}
    </aside>
  );
}

export function ChatList({ view, ...props }: ListProps & { view: View }) {
  return view === "history" ? <HistoryList {...props} /> : <LiveList {...props} />;
}

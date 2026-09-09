import { Button } from "antd";
import { useState } from "react";
import { SearchBox } from "../../components/SearchBox";
import { StatusTag } from "../../components/StatusTag";
import { join, queuePosition, type Conversation } from "../../data/fake/support";
import { dayLabel, initials } from "../../lib/format";
import type { View } from "./SupportPage";

const minutesSince = (at: Date) => Math.max(1, Math.round((Date.now() - at.getTime()) / 60_000));

type RowProps = { conversation: Conversation; selected: boolean; onOpen: () => void; onJoin?: () => void };

/** One chat in the list: who, where it stands, and the last thing said. */
function Row({ conversation: c, selected, onOpen, onJoin }: RowProps) {
  const last = c.messages.at(-1);
  const when = c.status === "queued" ? `#${queuePosition(c.id)} · ${minutesSince(c.openedAt)} min` : c.status === "ended" && c.endedAt ? dayLabel(c.endedAt) : c.agentName;
  return (
    <div className={`chat-row${selected ? " is-selected" : ""}`} onClick={onOpen} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onOpen()}>
      <span className="queue__avatar">{initials(c.memberName)}</span>
      <div className="chat-row__body">
        <div className="chat-row__top"><b>{c.memberName}</b><small>{when}</small></div>
        <div className="chat-row__snippet">{last?.text}</div>
        {c.status === "ended" && c.resolution && (
          <div className="chat-row__tags">
            <StatusTag status={c.resolution} />
            <small className="cell-muted">{c.topic}{c.ticketIds.length > 0 ? ` · ${c.ticketIds.length} ticket${c.ticketIds.length === 1 ? "" : "s"}` : ""}</small>
          </div>
        )}
      </div>
      {onJoin && <Button size="small" type="primary" onClick={(e) => { e.stopPropagation(); onJoin(); }}>Join</Button>}
    </div>
  );
}

type Props = { view: View; conversations: Conversation[]; selectedId: string | undefined; me: string; onOpen: (id: string) => void };

/** Live: the line and the open chats. History: everything that ended, newest first, searchable by member or topic. */
export function ChatList({ view, conversations, selectedId, me, onOpen }: Props) {
  const [q, setQ] = useState("");
  if (view === "history") {
    const needle = q.toLowerCase();
    const ended = conversations
      .filter((c) => c.status === "ended" && (!needle || c.memberName.toLowerCase().includes(needle) || c.topic.toLowerCase().includes(needle)))
      .sort((a, b) => (b.endedAt?.getTime() ?? 0) - (a.endedAt?.getTime() ?? 0));
    return (
      <aside className="card chat-list">
        <div className="chat-list__search"><SearchBox initial={q} placeholder="Search member or topic" onSearch={setQ} /></div>
        <div className="chat-list__label">Ended <span className="nav__badge">{ended.length}</span></div>
        {ended.map((c) => <Row key={c.id} conversation={c} selected={c.id === selectedId} onOpen={() => onOpen(c.id)} />)}
        {ended.length === 0 && <div className="chat-list__empty">No chat matches.</div>}
      </aside>
    );
  }
  const queued = conversations.filter((c) => c.status === "queued");
  const active = conversations.filter((c) => c.status === "with_agent");
  return (
    <aside className="card chat-list">
      <div className="chat-list__label" data-spot="in-line">In line <span className="nav__badge">{queued.length}</span></div>
      {queued.map((c) => <Row key={c.id} conversation={c} selected={c.id === selectedId} onOpen={() => onOpen(c.id)} onJoin={() => { join(c.id, me); onOpen(c.id); }} />)}
      {queued.length === 0 && <div className="chat-list__empty">Nobody waiting.</div>}
      <div className="chat-list__label" data-spot="on-the-desk">Open</div>
      {active.map((c) => <Row key={c.id} conversation={c} selected={c.id === selectedId} onOpen={() => onOpen(c.id)} />)}
      {active.length === 0 && <div className="chat-list__empty">No chat open. Ended ones are under History.</div>}
    </aside>
  );
}

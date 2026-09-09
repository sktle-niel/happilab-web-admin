import { SendOutlined } from "@ant-design/icons";
import { Button, Input, Space } from "antd";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { StatusTag } from "../../components/StatusTag";
import { end, resolve, send, type Conversation, type Message } from "../../data/fake/support";
import { dayLabel, initials } from "../../lib/format";
import { TicketForm } from "./TicketForm";

const clock = (at: Date) => at.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });

function Bubble({ message }: { message: Message }) {
  if (message.sender === "system") return <div className="chat-note">{message.text}</div>;
  return (
    <div className={`chat-bubble chat-bubble--${message.sender}`}>
      {message.sender === "bot" && <span className="chat-bubble__who">Bot</span>}
      <p>{message.text}</p>
      <time>{clock(message.at)}</time>
    </div>
  );
}

/** Where the chat stands, in a line under the name. */
const standing = (c: Conversation, mine: boolean) => {
  if (c.status === "queued") return "waiting";
  if (c.status === "with_agent") return `with ${mine ? "you" : c.agentName}`;
  return `ended ${c.endedAt ? dayLabel(c.endedAt) : ""}${c.agentName ? ` · ${c.agentName}` : ""}`;
};

/** Resolve ends the chat as done; End leaves it unresolved; a ticket carries the account issue to whoever fixes it. */
function Actions({ c, me, onTicket }: { c: Conversation; me: string; onTicket: () => void }) {
  const live = c.status === "with_agent" && c.agentName === me;
  const unresolved = c.status === "ended" && c.resolution !== "resolved";
  return (
    <Space className="chat-pane__actions">
      {c.status !== "queued" && <Button size="small" onClick={onTicket}>Open ticket</Button>}
      {(live || unresolved) && <Button size="small" type="primary" onClick={() => resolve(c.id, me)}>{live ? "Resolve" : "Mark resolved"}</Button>}
      {live && <Button size="small" type="text" danger onClick={() => end(c.id, me)}>End chat</Button>}
    </Space>
  );
}

function Composer({ c, mine }: { c: Conversation; mine: boolean }) {
  const [draft, setDraft] = useState("");
  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    send(c.id, text);
    setDraft("");
  };
  if (c.status === "with_agent" && mine) {
    return (
      <div className="chat-composer">
        <Input value={draft} placeholder="Write a reply…" onChange={(e) => setDraft(e.target.value)} onPressEnter={submit} autoFocus />
        <Button type="primary" icon={<SendOutlined />} onClick={submit} disabled={!draft.trim()}>Send</Button>
      </div>
    );
  }
  const closed = c.status === "queued" ? "Join to reply." : c.status === "ended" ? `This chat has ended${c.resolution === "resolved" ? " and is resolved." : "."}` : `${c.agentName} is on this chat.`;
  return <div className="chat-composer chat-composer--closed">{closed}</div>;
}

/** The conversation: who, where it stands, every line said, and what the agent can do with it. */
export function Thread({ conversation: c, me }: { conversation: Conversation; me: string }) {
  const [ticketOpen, setTicketOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const mine = c.agentName === me;
  // Braces on purpose: scrollIntoView may return a value, and an effect must not.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [c.messages.length]);
  return (
    <div className="chat-pane">
      <header className="chat-pane__head">
        <span className="who__avatar">{initials(c.memberName)}</span>
        <div>
          <div className="who__name">{c.memberName}</div>
          <div className="who__email">{c.topic} · {standing(c, mine)}</div>
          {(c.resolution || c.ticketIds.length > 0) && (
            <div className="chat-pane__tickets">
              {c.resolution && <StatusTag status={c.resolution} />}
              {c.ticketIds.map((id) => <Link key={id} to={`/support/tickets/${id}`} className="chip chip--lavender">Ticket</Link>)}
            </div>
          )}
        </div>
        <Actions c={c} me={me} onTicket={() => setTicketOpen(true)} />
      </header>
      <div className="chat-thread">
        {c.messages.map((m) => <Bubble key={m.id} message={m} />)}
        <div ref={endRef} />
      </div>
      <Composer c={c} mine={mine} />
      <TicketForm open={ticketOpen} conversation={c} me={me} onClose={() => setTicketOpen(false)} />
    </div>
  );
}

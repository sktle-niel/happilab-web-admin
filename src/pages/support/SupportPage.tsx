import { CustomerServiceOutlined, SendOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { PageHead } from "../../components/Card";
import { end, join, queuePosition, send, useConversations, type Conversation, type Message } from "../../data/fake/support";
import { initials } from "../../lib/format";
import { useStaffSession } from "../../providers/session";

const clock = (at: Date) => at.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
const minutesSince = (at: Date) => Math.max(1, Math.round((Date.now() - at.getTime()) / 60_000));

function Row({ conversation, selected, onOpen, onJoin }: { conversation: Conversation; selected: boolean; onOpen: () => void; onJoin?: () => void }) {
  const last = conversation.messages.at(-1);
  return (
    <div className={`chat-row${selected ? " is-selected" : ""}`} onClick={onOpen} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onOpen()}>
      <span className="queue__avatar">{initials(conversation.memberName)}</span>
      <div className="chat-row__body">
        <div className="chat-row__top"><b>{conversation.memberName}</b><small>{conversation.status === "queued" ? `#${queuePosition(conversation.id)} · ${minutesSince(conversation.openedAt)} min` : conversation.agentName}</small></div>
        <div className="chat-row__snippet">{last?.text}</div>
      </div>
      {onJoin && <Button size="small" type="primary" onClick={(e) => { e.stopPropagation(); onJoin(); }}>Join</Button>}
    </div>
  );
}

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

function Thread({ conversation, mine }: { conversation: Conversation; mine: boolean }) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  // Braces on purpose: scrollIntoView may return a value, and an effect must not.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [conversation.messages.length]);
  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    send(conversation.id, text);
    setDraft("");
  };
  const open = conversation.status === "with_agent";
  return (
    <div className="chat-pane">
      <header className="chat-pane__head">
        <span className="who__avatar">{initials(conversation.memberName)}</span>
        <div>
          <div className="who__name">{conversation.memberName}</div>
          <div className="who__email">{conversation.topic} · {conversation.status === "queued" ? "waiting" : conversation.status === "ended" ? "ended" : `with ${mine ? "you" : conversation.agentName}`}</div>
        </div>
        {open && mine && <Button danger type="text" onClick={() => end(conversation.id)}>End chat</Button>}
      </header>
      <div className="chat-thread">
        {conversation.messages.map((m) => <Bubble key={m.id} message={m} />)}
        <div ref={endRef} />
      </div>
      {open && mine ? (
        <div className="chat-composer">
          <Input value={draft} placeholder="Write a reply…" onChange={(e) => setDraft(e.target.value)} onPressEnter={submit} autoFocus />
          <Button type="primary" icon={<SendOutlined />} onClick={submit} disabled={!draft.trim()}>Send</Button>
        </div>
      ) : (
        <div className="chat-composer chat-composer--closed">{conversation.status === "queued" ? "Join to reply." : conversation.status === "ended" ? "This chat has ended." : `${conversation.agentName} is on this chat.`}</div>
      )}
    </div>
  );
}

/** The desk: the line and the open chats on the left, the conversation on the right. */
export function SupportPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { identity } = useStaffSession();
  const conversations = useConversations();
  const me = identity?.name ?? "Support";
  const queued = conversations.filter((c) => c.status === "queued");
  const active = conversations.filter((c) => c.status !== "queued");
  const selected = conversations.find((c) => c.id === id);
  const openChat = (c: Conversation) => navigate(`/support/${c.id}`);
  const joinChat = (c: Conversation) => { join(c.id, me); openChat(c); };
  return (
    <>
      <PageHead title="Support" subtitle="Members waiting for a person, and the chats already open." />
      <div className="chat">
        <aside className="card chat-list">
          <div className="chat-list__label">In line <span className="nav__badge">{queued.length}</span></div>
          {queued.map((c) => <Row key={c.id} conversation={c} selected={c.id === id} onOpen={() => openChat(c)} onJoin={() => joinChat(c)} />)}
          {queued.length === 0 && <div className="chat-list__empty">Nobody waiting.</div>}
          <div className="chat-list__label">Open</div>
          {active.map((c) => <Row key={c.id} conversation={c} selected={c.id === id} onOpen={() => openChat(c)} />)}
        </aside>
        {selected ? (
          <Thread key={selected.id} conversation={selected} mine={selected.agentName === me} />
        ) : (
          <div className="card chat-pane chat-pane--empty">
            <span className="card__icon"><CustomerServiceOutlined /></span>
            <b>Pick a conversation</b>
            <p>Join someone in line, or open a chat that is already going.</p>
          </div>
        )}
      </div>
    </>
  );
}

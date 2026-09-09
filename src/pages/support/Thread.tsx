import { PictureOutlined, SendOutlined } from "@ant-design/icons";
import { Button, Input, Space, Upload } from "antd";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { StatusTag } from "../../components/StatusTag";
import type { Message, Thread as Chat } from "../../data/types";
import { PHOTO_ACCEPT, photoRefusal } from "../../lib/attachments";
import { dayLabel, initials } from "../../lib/format";
import { uploadFile } from "../../lib/uploads";
import { useDeskActions, useThread } from "../../lib/useDesk";
import type { Me } from "../../providers/session";
import { EmptyPane } from "./SupportPage";
import { TicketForm } from "./TicketForm";

type Actions = ReturnType<typeof useDeskActions>;
const clock = (iso: string) => new Date(iso).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });

function Bubble({ message }: { message: Message }) {
  if (message.sender === "system") return <div className="chat-note">{message.body}</div>;
  return (
    <div className={`chat-bubble chat-bubble--${message.sender}${message.attachmentUrl ? " chat-bubble--photo" : ""}`}>
      {message.sender === "bot" && <span className="chat-bubble__who">Bot</span>}
      {message.attachmentUrl && <img className="chat-bubble__photo" src={message.attachmentUrl} alt="Photo sent in the chat" />}
      {message.body && <p>{message.body}</p>}
      <time>{clock(message.sentAt)}</time>
    </div>
  );
}

/** Where the chat stands, in a line under the name. */
const standing = (c: Chat, mine: boolean) => {
  if (c.status === "queued") return "waiting";
  if (c.status === "with_agent") return `with ${mine ? "you" : c.agentName}`;
  return `ended ${c.endedAt ? dayLabel(new Date(c.endedAt)) : ""}${c.agentName ? ` · ${c.agentName}` : ""}`;
};

/** Resolve ends the chat as done; End leaves it unresolved; a ticket carries the account issue to whoever fixes it. */
function Moves({ c, mine, actions, onTicket }: { c: Chat; mine: boolean; actions: Actions; onTicket: () => void }) {
  const live = c.status === "with_agent" && mine;
  const unresolved = c.status === "ended" && c.resolution !== "resolved";
  return (
    <Space className="chat-pane__actions">
      {c.status !== "queued" && <Button size="small" onClick={onTicket}>Open ticket</Button>}
      {(live || unresolved) && <Button size="small" type="primary" loading={actions.busy} onClick={() => actions.resolve(c.id)}>{live ? "Resolve" : "Mark resolved"}</Button>}
      {live && <Button size="small" type="text" danger disabled={actions.busy} onClick={() => actions.end(c.id)}>End chat</Button>}
    </Space>
  );
}

function Composer({ c, mine, actions }: { c: Chat; mine: boolean; actions: Actions }) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const submit = () => {
    const body = draft.trim();
    if (!body) return;
    actions.reply(c.id, { body }).then(() => setDraft(""));
  };
  /** A photo goes out on its own, once it is under the limit the app holds members to as well; it lands in storage first. */
  const attach = (file: File) => {
    const refusal = photoRefusal(file.size);
    if (refusal) toast.error(refusal);
    else {
      setSending(true);
      uploadFile("chat", file)
        .then((url) => actions.reply(c.id, { attachmentUrl: url }), (error: Error) => toast.error(error.message))
        .finally(() => setSending(false));
    }
    return Upload.LIST_IGNORE;
  };
  if (c.status === "with_agent" && mine) {
    return (
      <div className="chat-composer">
        <Upload accept={PHOTO_ACCEPT} showUploadList={false} disabled={sending} beforeUpload={attach}>
          <Button icon={<PictureOutlined />} loading={sending} aria-label="Send a photo" title="Send a photo, up to 5 MB" />
        </Upload>
        <Input value={draft} placeholder="Write a reply…" onChange={(e) => setDraft(e.target.value)} onPressEnter={submit} autoFocus />
        <Button type="primary" icon={<SendOutlined />} onClick={submit} disabled={!draft.trim()} loading={actions.busy}>Send</Button>
      </div>
    );
  }
  const closed = c.status === "queued" ? "Join to reply." : c.status === "ended" ? `This chat has ended${c.resolution === "resolved" ? " and is resolved." : "."}` : `${c.agentName} is on this chat.`;
  return <div className="chat-composer chat-composer--closed">{closed}</div>;
}

/** The conversation: who, where it stands, every line said, and what the agent can do with it. */
export function Thread({ id, me }: { id: string; me: Me }) {
  const { data: c, isError } = useThread(id);
  const actions = useDeskActions();
  const [ticketOpen, setTicketOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const lines = c?.messages.length ?? 0;
  // Braces on purpose: scrollIntoView may return a value, and an effect must not.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);
  if (isError) return <EmptyPane title="No such chat" text="It may have been removed since this link was made." />;
  if (!c) return <div className="card chat-pane" />;
  const mine = c.agentId === me.id;
  return (
    <div className="chat-pane">
      <header className="chat-pane__head">
        <span className="who__avatar">{initials(c.memberName)}</span>
        <div>
          <div className="who__name">{c.memberName}</div>
          <div className="who__email">{c.topic ?? "No topic"} · {standing(c, mine)}</div>
          {(c.resolution || c.tickets.length > 0) && (
            <div className="chat-pane__tickets">
              {c.resolution && <StatusTag status={c.resolution} />}
              {c.tickets.map((t) => <Link key={t.id} to={`/support/tickets/${t.id}`} className="chip chip--lavender">{t.reference}</Link>)}
            </div>
          )}
        </div>
        <Moves c={c} mine={mine} actions={actions} onTicket={() => setTicketOpen(true)} />
      </header>
      <div className="chat-thread">
        {c.messages.map((m) => <Bubble key={m.id} message={m} />)}
        <div ref={endRef} />
      </div>
      <Composer c={c} mine={mine} actions={actions} />
      <TicketForm open={ticketOpen} conversation={c} me={me} onClose={() => setTicketOpen(false)} />
    </div>
  );
}

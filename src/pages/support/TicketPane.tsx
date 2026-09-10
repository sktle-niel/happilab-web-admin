import { SendOutlined } from "@ant-design/icons";
import { useInvalidate, useOne, useUpdate } from "@refinedev/core";
import { useMutation } from "@tanstack/react-query";
import { Button, Input, Space } from "antd";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { StatusTag } from "../../components/StatusTag";
import { categoryLabel, type Ticket } from "../../data/types";
import { api } from "../../lib/api";
import { dayLabel, initials } from "../../lib/format";
import type { Me } from "../../providers/session";
import { TICKET_LABELS } from "./TicketList";

const when = (iso: string) => new Date(iso).toLocaleString("en-PH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Take it, finish it, or reopen it; the API's PATCH carries the same three moves. */
function Moves({ t, me, onChange }: { t: Ticket; me: Me; onChange: (values: Partial<Ticket>, said: string) => void }) {
  return (
    <Space className="chat-pane__actions">
      {t.status !== "done" && t.assigneeStaffId !== me.id && <Button size="small" onClick={() => onChange({ assigneeStaffId: me.id, status: "in_progress" }, `${t.reference} is yours`)}>Take</Button>}
      {t.status !== "done" && <Button size="small" type="primary" onClick={() => onChange({ status: "done" }, `${t.reference} done`)}>Mark done</Button>}
      {t.status === "done" && <Button size="small" onClick={() => onChange({ status: "open" }, `${t.reference} reopened`)}>Reopen</Button>}
    </Space>
  );
}

/** One ticket: what it is, who has it, what has been found so far, and a line to add. */
export function TicketPane({ id, me }: { id: string; me: Me }) {
  const { result: t, query } = useOne<Ticket>({ resource: "tickets", id });
  const { mutate: update } = useUpdate<Ticket>();
  const invalidate = useInvalidate();
  const [draft, setDraft] = useState("");
  const note = useMutation({
    mutationFn: (body: string) => api.post(`/v1/admin/tickets/${id}/notes`, { body }),
    onSuccess: () => {
      setDraft("");
      return invalidate({ resource: "tickets", invalidates: ["detail"], id });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  if (query.isError) return <div className="card chat-pane chat-pane--empty"><b>No such ticket</b><p>It may have been removed.</p></div>;
  if (!t) return <div className="card chat-pane" />;

  const change = (values: Partial<Ticket>, said: string) => update({ resource: "tickets", id: t.id, values, successNotification: { type: "success", message: said } });
  const notes = t.notes ?? [];
  const addNote = () => {
    const body = draft.trim();
    if (body) note.mutate(body);
  };

  return (
    <div className="chat-pane">
      <header className="chat-pane__head">
        <span className="who__avatar">{initials(t.memberName)}</span>
        <div>
          <div className="who__name">{t.reference} · {t.summary}</div>
          <div className="who__email">{t.memberName} · {categoryLabel(t.category)}</div>
        </div>
        <Moves t={t} me={me} onChange={change} />
      </header>
      <div className="ticket-pane__body">
        <div className="ticket-pane__meta">
          <StatusTag status={t.status} label={TICKET_LABELS[t.status]} />
          <span>{t.assigneeName ? `${t.assigneeName} has it` : "Nobody has it yet"}</span>
          <span>· opened by {t.openedBy} on {dayLabel(new Date(t.openedAt))}</span>
          {t.doneAt && <span>· done {dayLabel(new Date(t.doneAt))}</span>}
          {t.conversationId && <Link to={`/support/${t.conversationId}?view=history`} className="chip chip--lavender">From the chat</Link>}
        </div>
        <p className="ticket-pane__details">{t.details || "No details were written."}</p>
        <div className="notes">
          {notes.map((n) => (
            <div key={n.id} className="note">
              <span className="queue__avatar">{initials(n.author)}</span>
              <div><b>{n.author}</b><span className="note__meta">{when(n.createdAt)}</span><p>{n.body}</p></div>
            </div>
          ))}
          {notes.length === 0 && <span className="cell-muted">No notes yet.</span>}
        </div>
      </div>
      <div className="chat-composer">
        <Input value={draft} placeholder="Add a note for whoever picks this up…" onChange={(e) => setDraft(e.target.value)} onPressEnter={addNote} disabled={note.isPending} />
        <Button type="primary" icon={<SendOutlined />} onClick={addNote} disabled={!draft.trim()} loading={note.isPending}>Note</Button>
      </div>
    </div>
  );
}

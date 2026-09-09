import { useCreate, useList } from "@refinedev/core";
import { Form, Input, Select } from "antd";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { RecordModal } from "../../components/RecordModal";
import type { Staff } from "../../data/fake/people";
import { attachTicket, type Conversation } from "../../data/fake/support";
import { TICKET_CATEGORIES, categoryLabel, type Ticket, type TicketCategory } from "../../data/fake/tickets";
import { required } from "../../lib/rules";

type Values = { category: TicketCategory; summary: string; details: string; assignee: string | null };
type Props = { open: boolean; conversation: Conversation; me: string; onClose: () => void };

/** The chat's topic in the app's words maps onto a category; anything else starts as "other". */
const categoryFor = (topic: string): TicketCategory => TICKET_CATEGORIES.find((c) => c.label === topic)?.value ?? "other";

/** What the member said, as the ticket's opening detail, so whoever takes it need not reread the chat. */
const memberSaid = (c: Conversation) => c.messages.filter((m) => m.sender === "member").map((m) => m.text).join(" ");

/** Opens a ticket from a chat: the account issue, in the member's words, handed to a teammate to fix. */
export function TicketForm({ open, conversation, me, onClose }: Props) {
  const navigate = useNavigate();
  const { result: staffList } = useList<Staff>({ resource: "staff", pagination: { mode: "off" }, queryOptions: { enabled: open } });
  const { result: existing } = useList<Ticket>({ resource: "tickets", pagination: { mode: "off" }, queryOptions: { enabled: open } });
  const { mutate: create } = useCreate<Ticket>();
  const [busy, setBusy] = useState(false);
  const initial = useMemo<Values>(() => ({ category: categoryFor(conversation.topic), summary: "", details: memberSaid(conversation), assignee: me }), [conversation, me]);
  const agents = (staffList?.data ?? []).filter((s) => s.status === "active").map((s) => ({ value: s.name, label: s.name }));
  const reference = `T-${String((existing?.data.length ?? 0) + 1).padStart(4, "0")}`;

  const submit = (values: Values) => {
    setBusy(true);
    const ticket: Omit<Ticket, "id"> = {
      reference,
      memberId: conversation.memberId,
      memberName: conversation.memberName,
      conversationId: conversation.id,
      category: values.category,
      summary: values.summary.trim(),
      details: values.details.trim(),
      status: values.assignee ? "in_progress" : "open",
      assignee: values.assignee,
      openedBy: me,
      openedAt: new Date().toISOString(),
      doneAt: null,
      notes: [],
    };
    create(
      { resource: "tickets", values: ticket, successNotification: false },
      {
        onSuccess: ({ data }) => {
          attachTicket(conversation.id, String(data.id), reference, categoryLabel(values.category));
          onClose();
          toast.success(`${reference} opened for ${conversation.memberName}`, { description: values.assignee ? `${values.assignee} has it.` : "Nobody has it yet; it waits under Tickets.", action: { label: "Open", onClick: () => navigate(`/support/tickets/${data.id}`) } });
        },
        onSettled: () => setBusy(false),
      },
    );
  };

  return (
    <RecordModal open={open} title={`Open ticket for ${conversation.memberName}`} okText="Open ticket" initialValues={initial} busy={busy} onCancel={onClose} onSubmit={submit}>
      <div className="field-grid">
        <Form.Item name="category" label="What it is about" rules={[required("Pick one.")]}>
          <Select options={TICKET_CATEGORIES} />
        </Form.Item>
        <Form.Item name="assignee" label="Who takes it" extra="Leave empty to put it in the open pile.">
          <Select allowClear placeholder="Nobody yet" options={agents} />
        </Form.Item>
      </div>
      <Form.Item name="summary" label="In one line" rules={[required("Say what needs doing."), { max: 120, message: "Up to 120 characters." }]}>
        <Input maxLength={120} placeholder="Wallet name does not match the account" />
      </Form.Item>
      <Form.Item name="details" label="Details" extra="Starts with what the member said in the chat." rules={[{ max: 1000, message: "Up to 1000 characters." }]}>
        <Input.TextArea rows={4} maxLength={1000} showCount />
      </Form.Item>
    </RecordModal>
  );
}

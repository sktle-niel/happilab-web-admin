import { useCreate, useList } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, Select } from "antd";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { RecordModal } from "../../components/RecordModal";
import { TICKET_CATEGORIES, type Staff, type Thread as Chat, type Ticket, type TicketCategory } from "../../data/types";
import { required } from "../../lib/rules";
import type { Me } from "../../providers/session";

type Values = { category: TicketCategory; summary: string; details: string; assigneeStaffId: string | null };
type Props = { open: boolean; conversation: Chat; me: Me; onClose: () => void };

/** The chat's topic in the app's words maps onto a category; anything else starts as "other". */
const categoryFor = (topic: string | null): TicketCategory => TICKET_CATEGORIES.find((c) => c.label === topic)?.value ?? "other";

/** What the member said, as the ticket's opening detail, so whoever takes it need not reread the chat. */
const memberSaid = (c: Chat) => c.messages.filter((m) => m.sender === "member" && m.body).map((m) => m.body).join(" ");

/** Opens a ticket from a chat: the account issue, in the member's words, handed to a teammate to fix. The API numbers it and writes the line into the chat. */
export function TicketForm({ open, conversation, me, onClose }: Props) {
  const navigate = useNavigate();
  const client = useQueryClient();
  const { result: staffList } = useList<Staff>({ resource: "staff", pagination: { mode: "off" }, queryOptions: { enabled: open } });
  const { mutate: create } = useCreate<Ticket>();
  const [busy, setBusy] = useState(false);
  const initial = useMemo<Values>(() => ({ category: categoryFor(conversation.topic), summary: "", details: memberSaid(conversation), assigneeStaffId: me.id }), [conversation, me]);
  const agents = (staffList?.data ?? []).filter((s) => s.status === "active").map((s) => ({ value: s.id, label: s.name }));

  const submit = (values: Values) => {
    setBusy(true);
    create(
      {
        resource: "tickets",
        values: { memberId: conversation.memberId, conversationId: conversation.id, category: values.category, summary: values.summary.trim(), details: values.details.trim(), assigneeStaffId: values.assigneeStaffId },
        successNotification: false,
      },
      {
        onSuccess: ({ data }) => {
          void client.invalidateQueries({ queryKey: ["conversation", conversation.id] });
          onClose();
          toast.success(`${data.reference} opened for ${conversation.memberName}`, {
            description: data.assigneeName ? `${data.assigneeName} has it.` : "Nobody has it yet; it waits under Tickets.",
            action: { label: "Open", onClick: () => navigate(`/support/tickets/${data.id}`) },
          });
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
        <Form.Item name="assigneeStaffId" label="Who takes it" extra="Leave empty to put it in the open pile.">
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

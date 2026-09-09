import { Form, Input, Segmented } from "antd";
import { useMemo } from "react";
import { RecordModal } from "../../components/RecordModal";
import type { Faq, Post, TermsSection } from "../../data/types";
import { httpsOnly, required } from "../../lib/rules";
import { useSaveRecord } from "../../lib/useSaveRecord";

type Editing<T> = { open: boolean; record: T | null; onClose: () => void };

const MEDIA = [
  { label: "None", value: "none" },
  { label: "Image", value: "image" },
  { label: "Video", value: "video" },
];
const STATUS: { label: string; value: Standing }[] = [
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
];

type Standing = "published" | "draft";
type PostValues = { body: string; mediaKind: Post["mediaKind"]; mediaUrl: string; status: Standing };
const EMPTY_POST: PostValues = { body: "", mediaKind: "none", mediaUrl: "", status: "published" };

/** Only asked for once the post carries media. */
function MediaLink() {
  const media = Form.useWatch<Post["mediaKind"]>("mediaKind");
  if (!media || media === "none") return null;
  return (
    <Form.Item name="mediaUrl" label={media === "video" ? "Video link" : "Image link"} rules={[{ type: "url", message: "Enter a full link." }, httpsOnly]}>
      <Input placeholder="https://" />
    </Form.Item>
  );
}

export function PostForm({ open, record, onClose }: Editing<Post>) {
  const { save, busy } = useSaveRecord("posts", { created: "Post saved", updated: "Post saved", description: "Members see the feed on their next launch." });
  const initial = useMemo<PostValues>(() => (record ? { body: record.body, mediaKind: record.mediaKind, mediaUrl: record.mediaUrl ?? "", status: record.isPublished ? "published" : "draft" } : EMPTY_POST), [record]);
  const submit = (values: PostValues) =>
    save(
      record?.id ?? null,
      { body: values.body.trim(), mediaKind: values.mediaKind, mediaUrl: values.mediaKind === "none" ? null : values.mediaUrl.trim() || null, isPublished: values.status === "published" },
      onClose,
    );
  return (
    <RecordModal open={open} title={record ? "Edit post" : "New post"} okText="Save post" initialValues={initial} busy={busy} onCancel={onClose} onSubmit={submit}>
      <Form.Item name="body" label="What the feed says" rules={[required("Write the post."), { max: 500, message: "Up to 500 characters." }]}>
        <Input.TextArea rows={4} maxLength={500} showCount placeholder="New batch of Sakura Glow Soap is in." />
      </Form.Item>
      <div className="field-grid">
        <Form.Item name="mediaKind" label="Media"><Segmented options={MEDIA} /></Form.Item>
        <Form.Item name="status" label="Status"><Segmented options={STATUS} /></Form.Item>
      </div>
      <MediaLink />
    </RecordModal>
  );
}

type FaqValues = { question: string; answer: string };
const EMPTY_FAQ: FaqValues = { question: "", answer: "" };

export function FaqForm({ open, record, onClose }: Editing<Faq>) {
  const { save, busy } = useSaveRecord("faqs", { created: "FAQ added", updated: "FAQ saved", description: "The help centre shows it on the next launch." });
  const initial = useMemo<FaqValues>(() => (record ? { question: record.question, answer: record.answer } : EMPTY_FAQ), [record]);
  const submit = (values: FaqValues) =>
    save(record?.id ?? null, { question: values.question.trim(), answer: values.answer.trim() }, onClose);
  return (
    <RecordModal open={open} title={record ? "Edit FAQ" : "Add FAQ"} okText="Save FAQ" initialValues={initial} busy={busy} onCancel={onClose} onSubmit={submit}>
      <Form.Item name="question" label="Question" rules={[required("The question members ask."), { max: 120, message: "Up to 120 characters." }]}>
        <Input maxLength={120} placeholder="How much is a point worth?" />
      </Form.Item>
      <Form.Item name="answer" label="Answer" rules={[required("The answer, in a line or two."), { max: 400, message: "Up to 400 characters." }]}>
        <Input.TextArea rows={3} maxLength={400} showCount />
      </Form.Item>
    </RecordModal>
  );
}

type SectionValues = { heading: string; body: string };
const EMPTY_SECTION: SectionValues = { heading: "", body: "" };

export function SectionForm({ open, record, onClose }: Editing<TermsSection>) {
  const { save, busy } = useSaveRecord("terms", { created: "Section added", updated: "Section saved", description: "Members read the terms as they stand on their next launch." });
  const initial = useMemo<SectionValues>(() => (record ? { heading: record.heading, body: record.body } : EMPTY_SECTION), [record]);
  const submit = (values: SectionValues) => save(record?.id ?? null, { heading: values.heading.trim(), body: values.body.trim() }, onClose);
  return (
    <RecordModal open={open} title={record ? "Edit section" : "Add section"} okText="Save section" initialValues={initial} busy={busy} onCancel={onClose} onSubmit={submit}>
      <Form.Item name="heading" label="Heading" rules={[required("Name the section."), { max: 60, message: "Up to 60 characters." }]}>
        <Input maxLength={60} placeholder="Membership" />
      </Form.Item>
      <Form.Item name="body" label="Text" rules={[required("The rule, as members read it."), { max: 1000, message: "Up to 1000 characters." }]}>
        <Input.TextArea rows={4} maxLength={1000} showCount />
      </Form.Item>
    </RecordModal>
  );
}

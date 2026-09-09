import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { useTable } from "@refinedev/antd";
import { useUpdate } from "@refinedev/core";
import { Button, Space, Table } from "antd";
import { StatusTag } from "../../components/StatusTag";
import type { Faq, Post, TermsSection } from "../../data/fake/catalogue";
import { dayLabel } from "../../lib/format";
import { useReorder } from "../../lib/useReorder";
import { FaqForm, PostForm, SectionForm } from "./ContentForms";

/** undefined: no form open; null: a new record; otherwise the record being edited. */
export type Editing<T> = T | null | undefined;
type Props<T> = { editing: Editing<T>; onEdit: (record: Editing<T>) => void };

const nextPosition = (rows: readonly { position: number }[]) => rows.reduce((max, row) => Math.max(max, row.position), 0) + 1;

/** Up and down swap places with the neighbour; the ends have one direction only. */
function OrderButtons({ index, count, onMove }: { index: number; count: number; onMove: (direction: -1 | 1) => void }) {
  return (
    <span className="order-buttons">
      <Button size="small" type="text" icon={<ArrowUpOutlined />} aria-label="Move up" disabled={index === 0} onClick={() => onMove(-1)} />
      <Button size="small" type="text" icon={<ArrowDownOutlined />} aria-label="Move down" disabled={index === count - 1} onClick={() => onMove(1)} />
    </span>
  );
}

export function Posts({ editing, onEdit }: Props<Post>) {
  const { tableProps } = useTable<Post>({ resource: "posts", pagination: { mode: "off" }, sorters: { initial: [{ field: "publishedAt", order: "desc" }] } });
  const { mutate: update } = useUpdate<Post>();
  const toggle = (post: Post) => {
    const status = post.status === "published" ? "draft" : "published";
    update({ resource: "posts", id: post.id, values: { status }, successNotification: { type: "success", message: status === "published" ? "Post published" : "Post taken down", description: "The feed changes on the next launch." } });
  };
  return (
    <>
      <Table<Post> {...tableProps} rowKey="id" pagination={false}>
        <Table.Column<Post> title="Post" dataIndex="body" render={(v: string) => <div style={{ maxWidth: 480 }}>{v}</div>} />
        <Table.Column<Post> title="Media" dataIndex="media" render={(v: string) => <span className="cell-muted">{v}</span>} />
        <Table.Column<Post> title="Likes" dataIndex="likes" />
        <Table.Column<Post> title="Comments" dataIndex="comments" />
        <Table.Column title="Status" dataIndex="status" render={(s: string) => <StatusTag status={s} />} />
        <Table.Column<Post> title="Published" dataIndex="publishedAt" className="cell-nowrap" render={(v: string) => <span className="cell-muted">{dayLabel(new Date(v))}</span>} />
        <Table.Column<Post> title="" render={(_, post) => (
          <Space>
            <Button size="small" onClick={() => onEdit(post)}>Edit</Button>
            <Button size="small" type="text" onClick={() => toggle(post)}>{post.status === "published" ? "Unpublish" : "Publish"}</Button>
          </Space>
        )} />
      </Table>
      <PostForm open={editing !== undefined} record={editing ?? null} onClose={() => onEdit(undefined)} />
    </>
  );
}

export function Faqs({ editing, onEdit }: Props<Faq>) {
  const { tableProps } = useTable<Faq>({ resource: "faqs", pagination: { mode: "off" }, sorters: { initial: [{ field: "position", order: "asc" }] } });
  const { mutate: update } = useUpdate<Faq>();
  const { move } = useReorder("faqs");
  const rows = (tableProps.dataSource ?? []) as Faq[];
  const toggle = (faq: Faq) =>
    update({ resource: "faqs", id: faq.id, values: { isActive: !faq.isActive }, successNotification: { type: "success", message: faq.isActive ? "FAQ hidden" : "FAQ shown", description: "The help centre changes on the next launch." } });
  return (
    <>
      <Table<Faq> {...tableProps} rowKey="id" pagination={false}>
        <Table.Column<Faq> title="#" dataIndex="position" width={60} />
        <Table.Column<Faq> title="Question" dataIndex="question" render={(v: string) => <span className="cell-primary">{v}</span>} />
        <Table.Column<Faq> title="Answer" dataIndex="answer" />
        <Table.Column<Faq> title="Status" dataIndex="isActive" render={(v: boolean) => <StatusTag status={v ? "published" : "draft"} label={v ? "Shown" : "Hidden"} />} />
        <Table.Column<Faq> title="" render={(_, faq, index) => (
          <Space>
            <OrderButtons index={index} count={rows.length} onMove={(direction) => move(rows, index, direction)} />
            <Button size="small" onClick={() => onEdit(faq)}>Edit</Button>
            <Button size="small" type="text" onClick={() => toggle(faq)}>{faq.isActive ? "Hide" : "Show"}</Button>
          </Space>
        )} />
      </Table>
      <FaqForm open={editing !== undefined} record={editing ?? null} onClose={() => onEdit(undefined)} nextPosition={nextPosition(rows)} />
    </>
  );
}

export function Terms({ editing, onEdit }: Props<TermsSection>) {
  const { tableProps } = useTable<TermsSection>({ resource: "terms", pagination: { mode: "off" }, sorters: { initial: [{ field: "position", order: "asc" }] } });
  const { move } = useReorder("terms");
  const rows = (tableProps.dataSource ?? []) as TermsSection[];
  return (
    <>
      <Table<TermsSection> {...tableProps} rowKey="id" pagination={false}>
        <Table.Column<TermsSection> title="#" dataIndex="position" width={60} />
        <Table.Column<TermsSection> title="Heading" dataIndex="heading" render={(v: string) => <span className="cell-primary">{v}</span>} />
        <Table.Column<TermsSection> title="Text" dataIndex="body" render={(v: string) => <div style={{ maxWidth: 560 }}>{v}</div>} />
        <Table.Column<TermsSection> title="" render={(_, section, index) => (
          <Space>
            <OrderButtons index={index} count={rows.length} onMove={(direction) => move(rows, index, direction)} />
            <Button size="small" onClick={() => onEdit(section)}>Edit</Button>
          </Space>
        )} />
      </Table>
      <SectionForm open={editing !== undefined} record={editing ?? null} onClose={() => onEdit(undefined)} nextPosition={nextPosition(rows)} />
    </>
  );
}

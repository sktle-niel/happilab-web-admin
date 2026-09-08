import { PlusOutlined } from "@ant-design/icons";
import { useTable } from "@refinedev/antd";
import { App, Button, Table, Tabs } from "antd";
import { ListCard } from "../../components/ListCard";
import { StatusTag } from "../../components/StatusTag";
import type { Faq, Post } from "../../data/fake/catalogue";
import { dayLabel } from "../../lib/format";

function Posts() {
  const { tableProps } = useTable<Post>({ resource: "posts", pagination: { mode: "off" }, sorters: { initial: [{ field: "publishedAt", order: "desc" }] } });
  return (
    <Table<Post> {...tableProps} rowKey="id" pagination={false}>
      <Table.Column<Post> title="Post" dataIndex="body" render={(v: string) => <div style={{ maxWidth: 520 }}>{v}</div>} />
      <Table.Column<Post> title="Media" dataIndex="media" render={(v: string) => <span className="cell-muted">{v}</span>} />
      <Table.Column<Post> title="Likes" dataIndex="likes" />
      <Table.Column<Post> title="Comments" dataIndex="comments" />
      <Table.Column title="Status" dataIndex="status" render={(s: string) => <StatusTag status={s} />} />
      <Table.Column<Post> title="Published" dataIndex="publishedAt" render={(v: string) => <span className="cell-muted">{dayLabel(new Date(v))}</span>} />
    </Table>
  );
}

function Faqs() {
  const { tableProps } = useTable<Faq>({ resource: "faqs", pagination: { mode: "off" }, sorters: { initial: [{ field: "position", order: "asc" }] } });
  return (
    <Table<Faq> {...tableProps} rowKey="id" pagination={false}>
      <Table.Column<Faq> title="#" dataIndex="position" width={60} />
      <Table.Column<Faq> title="Question" dataIndex="question" render={(v: string) => <span className="cell-primary">{v}</span>} />
      <Table.Column<Faq> title="Answer" dataIndex="answer" />
      <Table.Column<Faq> title="Status" dataIndex="isActive" render={(v: boolean) => <StatusTag status={v ? "published" : "draft"} />} />
    </Table>
  );
}

export function ContentPage() {
  const { message } = App.useApp();
  return (
    <ListCard
      title="Content"
      subtitle="What the feed says, and the help copy members read."
      aside={<Button type="primary" icon={<PlusOutlined />} onClick={() => message.info("Writing posts lands with the API.")}>New post</Button>}
    >
      <Tabs
        style={{ padding: "0 12px" }}
        items={[
          { key: "posts", label: "Feed posts", children: <Posts /> },
          { key: "faqs", label: "FAQs", children: <Faqs /> },
          { key: "terms", label: "Terms", children: <p className="cell-muted" style={{ padding: 12 }}>Terms sections are edited in Settings once the API is connected.</p> },
        ]}
      />
    </ListCard>
  );
}

import { PlusOutlined } from "@ant-design/icons";
import { Button, Tabs } from "antd";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { ListCard } from "../../components/ListCard";
import { Spot } from "../../components/Spot";
import type { Faq, Post, TermsSection } from "../../data/fake/catalogue";
import { Faqs, Posts, Terms, type Editing } from "./ContentTables";

type Tab = "posts" | "faqs" | "terms";
const TABS: { key: Tab; label: string; add: string }[] = [
  { key: "posts", label: "Feed posts", add: "New post" },
  { key: "faqs", label: "FAQs", add: "Add FAQ" },
  { key: "terms", label: "Terms", add: "Add section" },
];

/** Three tabs and one Add button that follows the tab; the address keeps the tab so the search can land on it. */
export function ContentPage() {
  const [params, setParams] = useSearchParams();
  const tab: Tab = TABS.find((t) => t.key === params.get("tab"))?.key ?? "posts";
  const [post, setPost] = useState<Editing<Post>>(undefined);
  const [faq, setFaq] = useState<Editing<Faq>>(undefined);
  const [section, setSection] = useState<Editing<TermsSection>>(undefined);
  const openNew: Record<Tab, () => void> = { posts: () => setPost(null), faqs: () => setFaq(null), terms: () => setSection(null) };
  const current = TABS.find((t) => t.key === tab) ?? TABS[0]!;
  return (
    <ListCard
      title="Content"
      subtitle="What the feed says, the help copy members read, and the terms they joined under."
      aside={<Button type="primary" icon={<PlusOutlined />} onClick={openNew[tab]}>{current.add}</Button>}
    >
      <Tabs
        activeKey={tab}
        onChange={(key) => setParams({ tab: key }, { replace: true })}
        style={{ padding: "0 12px" }}
        items={[
          { key: "posts", label: "Feed posts", children: <Spot id="posts"><Posts editing={post} onEdit={setPost} /></Spot> },
          { key: "faqs", label: "FAQs", children: <Spot id="faqs"><Faqs editing={faq} onEdit={setFaq} /></Spot> },
          { key: "terms", label: "Terms", children: <Spot id="terms"><Terms editing={section} onEdit={setSection} /></Spot> },
        ]}
      />
    </ListCard>
  );
}

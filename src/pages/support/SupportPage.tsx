import { CustomerServiceOutlined } from "@ant-design/icons";
import { Segmented } from "antd";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { PageHead } from "../../components/Card";
import { useConversations } from "../../data/fake/support";
import { useStaffSession } from "../../providers/session";
import { ChatList } from "./ChatList";
import { Thread } from "./Thread";
import { TicketList } from "./TicketList";
import { TicketPane } from "./TicketPane";

export type View = "live" | "history" | "tickets";
const VIEWS: { label: string; value: View }[] = [
  { label: "Live", value: "live" },
  { label: "History", value: "history" },
  { label: "Tickets", value: "tickets" },
];
const SUBTITLE: Record<View, string> = {
  live: "Members waiting for a person, and the chats already open.",
  history: "Every chat that has ended, and how it ended.",
  tickets: "Account issues that outlive a chat, until someone marks them done.",
};

function EmptyPane({ text }: { text: string }) {
  return (
    <div className="card chat-pane chat-pane--empty">
      <span className="card__icon"><CustomerServiceOutlined /></span>
      <b>Pick one on the left</b>
      <p>{text}</p>
    </div>
  );
}

/** The desk in three views on one layout: the list on the left, the conversation or the ticket on the right. */
export function SupportPage() {
  const navigate = useNavigate();
  const { id, ticketId } = useParams();
  const [params] = useSearchParams();
  const view: View = ticketId ? "tickets" : (VIEWS.find((v) => v.value === params.get("view"))?.value ?? "live");
  const { identity } = useStaffSession();
  const me = identity?.name ?? "Support";
  const conversations = useConversations();
  const selected = conversations.find((c) => c.id === id);
  const show = (next: View) => navigate(next === "live" ? "/support" : `/support?view=${next}`);
  const openChat = (chatId: string) => navigate(`/support/${chatId}${view === "history" ? "?view=history" : ""}`);
  return (
    <>
      <PageHead title="Support" subtitle={SUBTITLE[view]} aside={<Segmented options={VIEWS} value={view} onChange={(next) => show(next as View)} />} />
      <div className="chat">
        {view === "tickets" ? <TicketList selectedId={ticketId} onOpen={(t) => navigate(`/support/tickets/${t}`)} /> : <ChatList view={view} conversations={conversations} selectedId={id} me={me} onOpen={openChat} />}
        {view === "tickets" && (ticketId ? <TicketPane key={ticketId} id={ticketId} me={me} /> : <EmptyPane text="A ticket shows its notes and who has it." />)}
        {view !== "tickets" && (selected ? <Thread key={selected.id} conversation={selected} me={me} /> : <EmptyPane text={view === "history" ? "Any past chat opens here, with the way it ended." : "Join someone in line, or open a chat that is already going."} />)}
      </div>
    </>
  );
}

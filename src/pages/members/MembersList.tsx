import { useTable } from "@refinedev/antd";
import { Button, Segmented, Table } from "antd";
import { ListCard } from "../../components/ListCard";
import { SearchBox } from "../../components/SearchBox";
import { StatusTag } from "../../components/StatusTag";
import type { Member, MemberStatus } from "../../data/types";
import { dayLabel, thousands } from "../../lib/format";
import { useAccountStatus, type Account } from "../../lib/useAccountStatus";
import { useSearchFilter } from "../../lib/useSearchFilter";

const FIELDS = ["fullName", "email", "referralCode"] as const;

const FILTERS: { label: string; value: MemberStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Disabled", value: "suspended" },
  { label: "Closed", value: "closed" },
];

/** The wire says suspended; the page says disabled. Closed is the member's own word for leaving. */
const LABELS: Partial<Record<MemberStatus, string>> = { suspended: "Disabled" };

const WORDS = {
  off: "disabled",
  on: "enabled",
  offDescription: "Signed out and unable to sign in until enabled again. Points and referrals stay.",
  onDescription: "They can sign in again.",
};

const named = (m: Member): Account => ({ id: m.id, name: m.fullName });

type ActionProps = { member: Member; onDisable: (a: Account) => void; onEnable: (a: Account) => void };

/** Active accounts can be disabled, disabled ones enabled; a closed account left on its own and has no switch. */
function MemberAction({ member, onDisable, onEnable }: ActionProps) {
  if (member.status === "active") return <Button size="small" type="text" danger onClick={() => onDisable(named(member))}>Disable</Button>;
  if (member.status === "suspended") return <Button size="small" onClick={() => onEnable(named(member))}>Enable</Button>;
  return null;
}

export function MembersList() {
  const { tableProps, setFilters } = useTable<Member>({ resource: "members", pagination: { pageSize: 10 }, sorters: { initial: [{ field: "joinedAt", order: "desc" }] } });
  const { q, search } = useSearchFilter(FIELDS, setFilters);
  const { disable, enable } = useAccountStatus("members", WORDS);
  return (
    <ListCard
      title="Members"
      subtitle="Everyone who joined with a code, and what their code has brought in."
      toolbar={
        <>
          <SearchBox initial={q} placeholder="Search name, email or code" onSearch={search} />
          <span className="list-toolbar__spacer" />
          <Segmented options={FILTERS} defaultValue="" onChange={(value) => setFilters([{ field: "status", operator: "eq", value }])} />
        </>
      }
    >
      <Table<Member> {...tableProps} rowKey="id">
        <Table.Column<Member> title="Member" dataIndex="name" sorter render={(_, m) => <><div className="cell-primary">{m.fullName}</div><div className="cell-muted">{m.email}</div></>} />
        <Table.Column title="Code" dataIndex="referralCode" />
        <Table.Column<Member> title="Points" dataIndex="points" render={(v: number) => thousands(v)} />
        <Table.Column<Member> title="Lifetime" dataIndex="lifetimePoints" render={(v: number) => <span className="cell-muted">{thousands(v)}</span>} />
        <Table.Column<Member> title="Referrals" render={(_, m) => `${m.referredPeople} · ${m.referredBuyers} bought`} />
        <Table.Column<Member> title="Status" dataIndex="status" sorter render={(s: MemberStatus) => <StatusTag status={s} label={LABELS[s]} />} />
        <Table.Column<Member> title="Joined" dataIndex="joinedAt" sorter render={(v: string) => <span className="cell-muted">{dayLabel(new Date(v))}</span>} />
        <Table.Column<Member> title="" render={(_, m) => <MemberAction member={m} onDisable={disable} onEnable={enable} />} />
      </Table>
    </ListCard>
  );
}

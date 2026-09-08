import { useTable } from "@refinedev/antd";
import { Table } from "antd";
import { ListCard } from "../../components/ListCard";
import { SearchBox } from "../../components/SearchBox";
import { StatusTag } from "../../components/StatusTag";
import type { Member } from "../../data/fake/people";
import { dayLabel, thousands } from "../../lib/format";
import { useSearchFilter } from "../../lib/useSearchFilter";

const FIELDS = ["name", "email", "referralCode"] as const;

export function MembersList() {
  const { tableProps, setFilters } = useTable<Member>({ resource: "members", pagination: { pageSize: 10 }, sorters: { initial: [{ field: "joinedAt", order: "desc" }] } });
  const { q, search } = useSearchFilter(FIELDS, setFilters);
  return (
    <ListCard
      title="Members"
      subtitle="Everyone who joined with a code, and what their code has brought in."
      toolbar={<SearchBox initial={q} placeholder="Search name, email or code" onSearch={search} />}
    >
      <Table<Member> {...tableProps} rowKey="id">
        <Table.Column<Member> title="Member" dataIndex="name" sorter render={(_, m) => <><div className="cell-primary">{m.name}</div><div className="cell-muted">{m.email}</div></>} />
        <Table.Column title="Code" dataIndex="referralCode" />
        <Table.Column<Member> title="Points" dataIndex="points" sorter render={(v: number) => thousands(v)} />
        <Table.Column<Member> title="Lifetime" dataIndex="lifetimePoints" sorter render={(v: number) => <span className="cell-muted">{thousands(v)}</span>} />
        <Table.Column<Member> title="Referrals" dataIndex="referrals" sorter render={(_, m) => `${m.referrals} · ${m.buyers} bought`} />
        <Table.Column title="Status" dataIndex="status" render={(s: string) => <StatusTag status={s} />} />
        <Table.Column<Member> title="Joined" dataIndex="joinedAt" sorter render={(v: string) => <span className="cell-muted">{dayLabel(new Date(v))}</span>} />
      </Table>
    </ListCard>
  );
}

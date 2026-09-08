import { PlusOutlined } from "@ant-design/icons";
import { useTable } from "@refinedev/antd";
import { Button, Switch, Table } from "antd";
import { toast } from "sonner";
import { ListCard } from "../../components/ListCard";
import { SearchBox } from "../../components/SearchBox";
import { Spot } from "../../components/Spot";
import type { Product } from "../../data/fake/catalogue";
import { pesos } from "../../lib/format";
import { useSearchFilter } from "../../lib/useSearchFilter";

const FIELDS = ["name", "blurb"] as const;

const BADGE: Record<string, string> = { topSale: "Top sale", newArrival: "New", comingSoon: "Coming soon" };

export function ProductsList() {
  const { tableProps, setFilters } = useTable<Product>({ resource: "products", pagination: { mode: "off" }, sorters: { initial: [{ field: "position", order: "asc" }] } });
  const { q, search } = useSearchFilter(FIELDS, setFilters);
  const notYet = () => toast("Editing lands with the API.");
  return (
    <ListCard
      title="Products"
      subtitle="The catalogue members share, in the order the app shows it."
      toolbar={<SearchBox initial={q} placeholder="Search products" onSearch={search} />}
      aside={<Spot id="add-product" inline><Button type="primary" icon={<PlusOutlined />} onClick={notYet}>Add product</Button></Spot>}
    >
      <Table<Product> {...tableProps} rowKey="id" pagination={false}>
        <Table.Column<Product> title="Product" dataIndex="name" render={(_, p) => (
          <div style={{ display: "flex", alignItems: "center" }}>
            <img className="cell-thumb" src={p.imageUrl} alt="" />
            <div><div className="cell-primary">{p.name}</div><div className="cell-muted">{p.blurb}</div></div>
          </div>
        )} />
        <Table.Column<Product> title="Price" dataIndex="priceCentavos" render={(v: number) => pesos(v / 100)} />
        <Table.Column<Product> title="Points per sale" render={(_, p) => `${p.pointsMin}–${p.pointsMax} pts`} />
        <Table.Column<Product> title="Badge" dataIndex="badge" render={(b: string | null) => (b ? <span className="chip chip--lavender">{BADGE[b] ?? b}</span> : <span className="cell-muted">—</span>)} />
        <Table.Column<Product> title="Stores" render={(_, p) => <span className="cell-muted">{Object.keys(p.storeLinks).join(", ") || "search only"}</span>} />
        <Table.Column<Product> title="Live" dataIndex="isActive" render={(v: boolean) => <Switch checked={v} onChange={notYet} />} />
      </Table>
    </ListCard>
  );
}

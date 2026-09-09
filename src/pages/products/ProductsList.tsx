import { PlusOutlined } from "@ant-design/icons";
import { useTable } from "@refinedev/antd";
import { useUpdate } from "@refinedev/core";
import { Button, Switch, Table } from "antd";
import { useNavigate } from "react-router";
import { ListCard } from "../../components/ListCard";
import { SearchBox } from "../../components/SearchBox";
import type { Product } from "../../data/fake/catalogue";
import { pesos } from "../../lib/format";
import { STORES, badgeOf } from "../../lib/products";
import { useSearchFilter } from "../../lib/useSearchFilter";

const FIELDS = ["name", "blurb"] as const;

const storesOf = (p: Product) => STORES.filter((store) => p.storeLinks[store.key]).map((store) => store.label).join(", ") || "search only";

export function ProductsList() {
  const navigate = useNavigate();
  const { tableProps, setFilters } = useTable<Product>({ resource: "products", pagination: { mode: "off" }, sorters: { initial: [{ field: "position", order: "asc" }] } });
  const { q, search } = useSearchFilter(FIELDS, setFilters);
  const { mutate: update } = useUpdate<Product>();
  const setLive = (p: Product, isActive: boolean) =>
    update({
      resource: "products",
      id: p.id,
      values: { isActive },
      successNotification: { type: "success", message: isActive ? `${p.name} is live` : `${p.name} is hidden`, description: "Members see the change on their next launch." },
    });
  return (
    <ListCard
      title="Products"
      subtitle="The catalogue members share, in the order the app shows it."
      toolbar={<SearchBox initial={q} placeholder="Search products" onSearch={search} />}
      aside={<Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/products/new")}>Add product</Button>}
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
        <Table.Column<Product> title="Badge" dataIndex="badge" render={(b: Product["badge"]) => (b ? <span className="chip chip--lavender">{badgeOf(b)?.label ?? b}</span> : <span className="cell-muted">—</span>)} />
        <Table.Column<Product> title="Stores" render={(_, p) => <span className="cell-muted">{storesOf(p)}</span>} />
        <Table.Column<Product> title="Live" dataIndex="isActive" render={(v: boolean, p) => <Switch checked={v} onChange={(next) => setLive(p, next)} aria-label={`${p.name} live`} />} />
        <Table.Column<Product> title="" render={(_, p) => <Button size="small" onClick={() => navigate(`/products/${p.id}/edit`)}>Edit</Button>} />
      </Table>
    </ListCard>
  );
}

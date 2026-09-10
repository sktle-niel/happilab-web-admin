import { PlusOutlined } from "@ant-design/icons";
import { useTable } from "@refinedev/antd";
import { useUpdate, type CrudFilter } from "@refinedev/core";
import { Button, Segmented, Space, Switch, Table } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router";
import { ListCard } from "../../components/ListCard";
import { SearchBox } from "../../components/SearchBox";
import { StatusTag } from "../../components/StatusTag";
import type { Product } from "../../data/types";
import { dayLabel, pesos } from "../../lib/format";
import { STORES, badgeOf } from "../../lib/products";
import { useSearchFilter } from "../../lib/useSearchFilter";
import { useProductRemoval } from "./useProductRemoval";

const FIELDS = ["name", "blurb"] as const;

type View = "catalogue" | "deleted";
const VIEWS = [
  { label: "Catalogue", value: "catalogue" },
  { label: "Deleted", value: "deleted" },
];

/** Keyed, so switching the view replaces this filter and leaves the search alone; the catalogue is everything not deleted. */
const viewFilter = (view: View): CrudFilter => ({ key: "view", operator: "and", value: view === "deleted" ? [{ field: "status", operator: "eq", value: "deleted" }] : [] });

const storesOf = (p: Product) => STORES.filter((store) => p.storeLinks[store.key]).map((store) => store.label).join(", ") || "search only";

export function ProductsList() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("catalogue");
  const { tableProps, setFilters } = useTable<Product>({
    resource: "products",
    pagination: { mode: "off" },
    sorters: { initial: [{ field: "position", order: "asc" }] },
    filters: { initial: [viewFilter("catalogue")] },
  });
  const { q, search } = useSearchFilter(FIELDS, setFilters);
  const { mutate: update } = useUpdate<Product>();
  const { softDelete, restore } = useProductRemoval();
  const deleted = view === "deleted";

  const show = (next: View) => {
    setView(next);
    setFilters([viewFilter(next)], "merge");
  };
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
      subtitle={deleted ? "Taken out of the catalogue. Restore one and it returns to its place." : "The catalogue members share, in the order the app shows it."}
      toolbar={
        <>
          <SearchBox initial={q} placeholder="Search products" onSearch={search} />
          <span className="list-toolbar__spacer" />
          <Segmented options={VIEWS} value={view} onChange={(next) => show(next as View)} />
        </>
      }
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
        <Table.Column<Product> title="Points per sale" render={(_, p) => `${p.points} pts`} />
        <Table.Column<Product> title="Badge" dataIndex="badge" render={(b: Product["badge"]) => (b ? <span className="chip chip--lavender">{badgeOf(b)?.label ?? b}</span> : <span className="cell-muted">—</span>)} />
        <Table.Column<Product> title="Stores" render={(_, p) => <span className="cell-muted">{storesOf(p)}</span>} />
        {deleted ? (
          <Table.Column<Product> title="Deleted" dataIndex="deletedAt" render={(v: string) => <><StatusTag status="deleted" /><span className="cell-muted">{dayLabel(new Date(v))}</span></>} />
        ) : (
          <Table.Column<Product> title="Live" dataIndex="isActive" render={(v: boolean, p) => <Switch checked={v} onChange={(next) => setLive(p, next)} aria-label={`${p.name} live`} />} />
        )}
        <Table.Column<Product> title="" render={(_, p) => (
          deleted ? (
            <Button size="small" onClick={() => restore(p)}>Restore</Button>
          ) : (
            <Space>
              <Button size="small" onClick={() => navigate(`/products/${p.id}/edit`)}>Edit</Button>
              <Button size="small" type="text" danger onClick={() => softDelete(p)}>Delete</Button>
            </Space>
          )
        )} />
      </Table>
    </ListCard>
  );
}

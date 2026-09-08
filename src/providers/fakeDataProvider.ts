import type { CrudFilter, CrudSort, DataProvider } from "@refinedev/core";
import { faqs, posts, products } from "../data/fake/catalogue";
import { audit, cashOuts, orders } from "../data/fake/money";
import { members, staff } from "../data/fake/people";

/**
 * Refine's data contract over the bundled tables: paging, sorting and the
 * filters the lists use, in memory, with writes remembered for the tab.
 * The API provider will answer the same calls over HTTPS.
 */
type Row = { id: string } & Record<string, unknown>;

const tables: Record<string, Row[]> = { members, products, orders, "cash-outs": cashOuts, posts, faqs, staff, audit };

const rows = (resource: string): Row[] => {
  const table = tables[resource];
  if (!table) throw new Error(`No bundled data for ${resource}`);
  return table;
};

function matches(row: Row, filter: CrudFilter): boolean {
  if (!("field" in filter)) {
    if (filter.value.length === 0) return true;
    const results = filter.value.map((inner) => matches(row, inner));
    return filter.operator === "or" ? results.some(Boolean) : results.every(Boolean);
  }
  const value = row[filter.field];
  const wanted: unknown = filter.value;
  switch (filter.operator) {
    case "eq":
      return wanted === "" || wanted === undefined || value === wanted;
    case "ne":
      return value !== wanted;
    case "in":
      return Array.isArray(wanted) && wanted.includes(value);
    case "contains":
      return String(value ?? "").toLowerCase().includes(String(wanted ?? "").toLowerCase());
    default:
      return true;
  }
}

function compare(a: Row, b: Row, sorters: CrudSort[]): number {
  for (const sorter of sorters) {
    const left = a[sorter.field];
    const right = b[sorter.field];
    if (left === right) continue;
    const order = typeof left === "number" && typeof right === "number" ? left - right : String(left ?? "").localeCompare(String(right ?? ""));
    return sorter.order === "asc" ? order : -order;
  }
  return 0;
}

const find = (resource: string, id: string | number) => {
  const index = rows(resource).findIndex((row) => row.id === String(id));
  if (index < 0) throw new Error(`No ${resource} with id ${id}`);
  return index;
};

export const fakeDataProvider: DataProvider = {
  getApiUrl: () => "fake://bundled",

  getList: async ({ resource, pagination, sorters, filters }) => {
    let data = rows(resource).filter((row) => (filters ?? []).every((filter) => matches(row, filter)));
    if (sorters?.length) data = [...data].sort((a, b) => compare(a, b, sorters));
    const total = data.length;
    if (pagination?.mode !== "off") {
      const current = pagination?.currentPage ?? 1;
      const size = pagination?.pageSize ?? 10;
      data = data.slice((current - 1) * size, current * size);
    }
    return { data: data as never, total };
  },

  getOne: async ({ resource, id }) => ({ data: rows(resource)[find(resource, id)] as never }),

  create: async ({ resource, variables }) => {
    const row = { id: `${resource.slice(0, 1)}${Date.now()}`, ...(variables as object) } as Row;
    rows(resource).unshift(row);
    return { data: row as never };
  },

  update: async ({ resource, id, variables }) => {
    const table = rows(resource);
    const index = find(resource, id);
    const row = { ...table[index], ...(variables as object) } as Row;
    table[index] = row;
    return { data: row as never };
  },

  deleteOne: async ({ resource, id }) => {
    const [row] = rows(resource).splice(find(resource, id), 1);
    return { data: row as never };
  },
};

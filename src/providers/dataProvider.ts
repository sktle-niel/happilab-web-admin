import type { CrudFilter, DataProvider } from "@refinedev/core";
import { api, query, request } from "../lib/api";
import { snakeKey, toCamel, toSnake } from "../lib/case";
import { API_BASE_URL } from "../lib/config";

/**
 * Refine's data contract over the API. One dialect for every list —
 * `?page&per_page&sort&order&q` plus named filters, `{ items, total }`
 * back — and one conversion at the edge: records arrive camelCase and
 * leave snake_case, so no page spells a wire name.
 */
const PATHS: Record<string, string> = {
  members: "/v1/admin/members",
  products: "/v1/admin/products",
  orders: "/v1/admin/orders",
  "cash-outs": "/v1/admin/cash-outs",
  posts: "/v1/admin/posts",
  faqs: "/v1/admin/faqs",
  terms: "/v1/admin/terms",
  staff: "/v1/admin/staff",
  audit: "/v1/admin/audit",
  tickets: "/v1/admin/tickets",
  conversations: "/v1/admin/support/conversations",
};
/** The most rows one request may ask for; a list with paging off asks for this many. */
const PAGE_MAX = 100;

const pathOf = (resource: string) => {
  const path = PATHS[resource];
  if (!path) throw new Error(`No API path for ${resource}`);
  return path;
};

/** Refine's filters as the API's named fields: `eq` and `in` name a field, any `contains` is the search term. */
function filterParams(filters: CrudFilter[] = []): Record<string, string | undefined> {
  const out: Record<string, string> = {};
  const walk = (filter: CrudFilter) => {
    if (!("field" in filter)) return filter.value.forEach(walk);
    if (filter.value === "" || filter.value === undefined || filter.value === null) return;
    if (filter.operator === "contains") out.q = String(filter.value);
    else if (filter.operator === "in" && Array.isArray(filter.value)) out[snakeKey(filter.field)] = filter.value.join(",");
    else if (filter.operator === "eq") out[snakeKey(filter.field)] = String(filter.value);
  };
  filters.forEach(walk);
  return out;
}

type Listing = { items: unknown[]; total: number };
const asListing = (body: unknown): Listing => (Array.isArray(body) ? { items: body, total: body.length } : (body as Listing));

export const dataProvider: DataProvider = {
  getApiUrl: () => API_BASE_URL,

  getList: async ({ resource, pagination, sorters, filters }) => {
    const paged = pagination?.mode !== "off";
    const sort = sorters?.[0];
    const search = query({
      page: paged ? (pagination?.currentPage ?? 1) : 1,
      per_page: paged ? Math.min(pagination?.pageSize ?? 10, PAGE_MAX) : PAGE_MAX,
      ...(sort && { sort: snakeKey(sort.field), order: sort.order }),
      ...filterParams(filters),
    });
    const listing = asListing(await api.get(`${pathOf(resource)}${search}`));
    return { data: toCamel(listing.items), total: listing.total };
  },

  getOne: async ({ resource, id }) => ({ data: toCamel(await api.get(`${pathOf(resource)}/${id}`)) }),

  create: async ({ resource, variables }) => ({ data: toCamel(await api.post(pathOf(resource), toSnake(variables))) }),

  /** A write that answers 204 is echoed back from what was sent, so the page can update in place. */
  update: async ({ resource, id, variables }) => {
    const body = await api.patch(`${pathOf(resource)}/${id}`, toSnake(variables));
    return { data: body === undefined ? ({ id, ...(variables as object) } as never) : toCamel(body) };
  },

  deleteOne: async ({ resource, id }) => {
    await api.delete(`${pathOf(resource)}/${id}`);
    return { data: { id } as never };
  },

  /** Everything that is not a record's CRUD: the figures, the search, settings, the desk's moves. */
  custom: async ({ url, method, payload, query: params }) => {
    const search = params ? query(params as Record<string, string | number | boolean | undefined>) : "";
    return { data: toCamel(await request(method.toUpperCase() as "GET" | "POST" | "PUT" | "PATCH" | "DELETE", `${url}${search}`, payload === undefined ? undefined : toSnake(payload))) };
  },
};

import type { CrudFilter } from "@refinedev/core";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";

type SetFilters = (filters: CrudFilter[], behavior?: "merge" | "replace") => void;

/** One "contains" across several fields, keyed so a later search replaces it and leaves other filters alone. */
export const textFilter = (fields: readonly string[], value: string): CrudFilter => ({
  key: "text",
  operator: "or",
  value: value ? fields.map((field) => ({ field, operator: "contains", value })) : [],
});

/**
 * Ties a list's text search to `?q=` in the address, so the top bar can
 * land on a page already filtered and the toolbar box continues from it.
 */
export function useSearchFilter(fields: readonly string[], setFilters: SetFilters) {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const setRef = useRef(setFilters);
  setRef.current = setFilters;

  useEffect(() => {
    setRef.current([textFilter(fields, q)], "merge");
  }, [fields, q]);

  return { q, search: (value: string) => setRef.current([textFilter(fields, value)], "merge") };
}

import { useIsFetching } from "@tanstack/react-query";

/**
 * A thin lime line across the top of the content while any read is on its
 * way — a page opening, a list re-sorting, the dashboard re-counting. The
 * figures already on screen stay put underneath; the line says they are
 * being checked against the database right now.
 */
export function FetchingBar() {
  const fetching = useIsFetching() > 0;
  return <div className={`fetching${fetching ? " is-on" : ""}`} role="progressbar" aria-hidden={!fetching} aria-label="Loading" />;
}

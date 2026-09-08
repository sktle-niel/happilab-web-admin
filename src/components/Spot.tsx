import type { ReactNode } from "react";

/** Marks a piece of a page the search can land on and light up. */
export function Spot({ id, inline = false, children }: { id: string; inline?: boolean; children: ReactNode }) {
  return inline ? (
    <span data-spot={id} className="spot spot--inline">{children}</span>
  ) : (
    <div data-spot={id} className="spot">{children}</div>
  );
}

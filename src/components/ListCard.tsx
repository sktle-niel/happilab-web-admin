import type { ReactNode } from "react";
import { PageHead } from "./Card";

type Props = { title: string; subtitle: string; toolbar?: ReactNode; aside?: ReactNode; children: ReactNode };

/** A list page: the heading, then one card holding the toolbar and the table. */
export function ListCard({ title, subtitle, toolbar, aside, children }: Props) {
  return (
    <>
      <PageHead title={title} subtitle={subtitle} aside={aside} />
      <div className="card list-card">
        {toolbar && <div className="list-toolbar">{toolbar}</div>}
        {children}
      </div>
    </>
  );
}

import { useUpdate } from "@refinedev/core";

type Positioned = { id: string; position: number };

/** Moves a row one place up or down by swapping positions with its neighbour; the list re-sorts on its own. */
export function useReorder(resource: string) {
  const { mutate: update } = useUpdate();
  const move = (sorted: readonly Positioned[], index: number, direction: -1 | 1) => {
    const row = sorted[index];
    const other = sorted[index + direction];
    if (!row || !other) return;
    update({ resource, id: row.id, values: { position: other.position }, successNotification: false });
    update({ resource, id: other.id, values: { position: row.position }, successNotification: false });
  };
  return { move };
}

import { useDelete, useUpdate } from "@refinedev/core";
import { toast } from "sonner";
import type { Product } from "../../data/fake/catalogue";

const UNDO_MS = 6000;

type Named = Pick<Product, "id" | "name">;

/**
 * Removing a product is soft: the row keeps a `deletedAt` stamp, leaves
 * the catalogue and the app, and can come back. So there is no confirm
 * step; the toast carries Undo instead, and the Deleted view has Restore.
 */
export function useProductRemoval() {
  const { mutate: remove } = useDelete<Product>();
  const { mutate: update } = useUpdate<Product>();

  const restore = (product: Named) =>
    update({
      resource: "products",
      id: product.id,
      values: { deletedAt: null },
      successNotification: { type: "success", message: `${product.name} is back`, description: "It returns to the catalogue in its old place." },
    });

  const softDelete = (product: Named, onDone?: () => void) =>
    remove(
      { resource: "products", id: product.id, successNotification: false },
      {
        onSuccess: () => {
          onDone?.();
          toast(`${product.name} deleted`, {
            description: "Gone from the app. It waits under Deleted if you need it back.",
            duration: UNDO_MS,
            action: { label: "Undo", onClick: () => restore(product) },
          });
        },
      },
    );

  return { softDelete, restore };
}

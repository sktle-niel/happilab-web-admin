import { Tag } from "antd";

/** Every status the lists show, in the dashboard's palette rather than Ant's defaults. */
const STYLES: Record<string, { background: string; color: string }> = {
  active: { background: "#d6f26a", color: "#2f3b00" },
  published: { background: "#d6f26a", color: "#2f3b00" },
  confirmed: { background: "#d6f26a", color: "#2f3b00" },
  sent: { background: "#151515", color: "#ffffff" },
  requested: { background: "#b9b2f4", color: "#2a2358" },
  processing: { background: "#b9b2f4", color: "#2a2358" },
  placed: { background: "#b9b2f4", color: "#2a2358" },
  review: { background: "#ffe08a", color: "#5a4300" },
  draft: { background: "#ffe08a", color: "#5a4300" },
  suspended: { background: "#f4f4f1", color: "#5f5f5c" },
  closed: { background: "#f4f4f1", color: "#5f5f5c" },
  deleted: { background: "#f4f4f1", color: "#5f5f5c" },
  cancelled: { background: "#f4f4f1", color: "#5f5f5c" },
  failed: { background: "#ffd6d6", color: "#7a1f1f" },
  refunded: { background: "#ffd6d6", color: "#7a1f1f" },
};

export function StatusTag({ status }: { status: string }) {
  const style = STYLES[status] ?? { background: "#f4f4f1", color: "#5f5f5c" };
  return (
    <Tag style={{ ...style, border: 0, borderRadius: 999, fontWeight: 700, padding: "2px 10px", textTransform: "capitalize" }}>
      {status}
    </Tag>
  );
}

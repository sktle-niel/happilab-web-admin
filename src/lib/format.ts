/** Display helpers shared by the dashboard and the lists. */
export const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k` : String(n));

export const thousands = (n: number) => n.toLocaleString("en-PH");

export const pesos = (n: number) => `₱${thousands(n)}`;

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export const dayLabel = (date: Date) => date.toLocaleDateString("en-PH", { day: "numeric", month: "short", year: "numeric" });

const cell = (value: unknown) => {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** Hands the browser a CSV of [rows] named [name]; the columns are every key the rows carry, in first-seen order. */
export function downloadCsv(name: string, rows: Record<string, unknown>[]): void {
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const lines = [columns.join(","), ...rows.map((row) => columns.map((column) => cell(row[column])).join(","))];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}.csv`;
  link.click();
  // Revoking at once can cancel the download before the browser has read the blob.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

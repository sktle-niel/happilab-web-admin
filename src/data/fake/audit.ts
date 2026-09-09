import { audit } from "./money";
import { staff } from "./people";
import { readSession } from "./session";

type Row = Record<string, unknown>;

const actor = () => staff.find((s) => s.email === readSession()?.email)?.name ?? "Niel Ladica";

const describe = (row: Row) => {
  const label = row.name ?? row.reference ?? row.externalReference ?? row.question ?? row.heading ?? (typeof row.body === "string" ? row.body.slice(0, 60) : row.id);
  return String(label);
};

/** One line per write, the way the API's audit_log keeps it: who, what, on which row. */
export function logAudit(resource: string, verb: string, row: Row): void {
  audit.unshift({
    id: `a${Date.now()}${Math.floor(Math.random() * 1000)}`,
    at: new Date().toISOString(),
    actor: actor(),
    action: `${resource}.${verb}`,
    entity: resource,
    ip: "203.0.113.1",
    detail: describe(row),
  });
}

/** What a write did, for the log: a status it set, a soft delete or restore, or plain created and updated. */
export const verbFor = (variables: Row): string => {
  if (typeof variables.status === "string") return variables.status;
  if ("deletedAt" in variables) return variables.deletedAt === null ? "restored" : "deleted";
  return "updated";
};

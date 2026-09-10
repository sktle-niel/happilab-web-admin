import { api } from "./api";
import { toCamel } from "./case";

/** One folder per kind of asset on the API's side; the API decides what each accepts. */
export type UploadKind = "product" | "backdrop" | "logo" | "post" | "clip" | "chat";
type Signed = { path: string; uploadUrl: string; token: string; publicUrl: string };

/**
 * Signs one path with the API, puts the file straight into storage, and
 * returns the public URL to keep on the record. The storage key never
 * reaches the browser; the API's refusal — a type it will not take, or no
 * storage configured — is the sentence the page shows.
 */
export async function uploadFile(kind: UploadKind, file: File): Promise<string> {
  const signed = toCamel<Signed>(await api.post("/v1/admin/uploads/sign", { kind, content_type: file.type, content_length: file.size }));
  const url = signed.uploadUrl.includes("token=") ? signed.uploadUrl : `${signed.uploadUrl}?token=${encodeURIComponent(signed.token)}`;
  const response = await fetch(url, { method: "PUT", headers: { "content-type": file.type, "x-upsert": "false" }, body: file }).catch(() => null);
  if (!response?.ok) throw new Error("The file did not reach storage. Try again.");
  return signed.publicUrl;
}

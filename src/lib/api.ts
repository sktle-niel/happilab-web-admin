import { accessToken, renewTokens } from "../providers/tokens";
import { API_BASE_URL } from "./config";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type Options = { auth?: boolean; retry?: boolean };

/** What the API said when it refused: its code, and the sentence the page shows as it is. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly retryAfterSeconds?: number,
  ) {
    super(message);
  }
}

const FALLBACK: Record<number, string> = { 401: "Sign in again.", 403: "Not on this account's pages.", 404: "Not found.", 429: "Too many requests. Wait a moment.", 503: "That is not available right now." };

async function refusal(response: Response): Promise<ApiError> {
  const body = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
  const retryAfter = Number(response.headers.get("retry-after")) || undefined;
  const fallback = response.status === 429 && retryAfter ? `Too many requests. Try again in ${retryAfter}s.` : (FALLBACK[response.status] ?? "Something went wrong.");
  return new ApiError(response.status, body.error ?? "error", body.message ?? fallback, retryAfter);
}

/**
 * Every call the admin makes: JSON in and out, the bearer token when the
 * route wants one, one renewal and retry on a 401, and the API's own
 * sentence on a refusal. Nothing else in the codebase calls fetch.
 */
export async function request<T>(method: Method, path: string, body?: unknown, { auth = true, retry = true }: Options = {}): Promise<T> {
  const token = auth ? await accessToken() : null;
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: { accept: "application/json", ...(body !== undefined && { "content-type": "application/json" }), ...(token && { authorization: `Bearer ${token}` }) },
      body: body === undefined ? null : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "unreachable", "Cannot reach the API. Is it running?");
  }
  if (response.status === 401 && auth && retry && (await renewTokens())) return request<T>(method, path, body, { auth, retry: false });
  if (!response.ok) throw await refusal(response);
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

export const api = {
  get: <T>(path: string, options?: Options) => request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: Options) => request<T>("POST", path, body, options),
  put: <T>(path: string, body?: unknown, options?: Options) => request<T>("PUT", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: Options) => request<T>("PATCH", path, body, options),
  delete: <T>(path: string, options?: Options) => request<T>("DELETE", path, undefined, options),
};

/** A query string from named values; empty and undefined ones are left out. */
export const query = (params: Record<string, string | number | boolean | undefined>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== "") search.set(key, String(value));
  const text = search.toString();
  return text ? `?${text}` : "";
};

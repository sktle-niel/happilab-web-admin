import { API_BASE_URL } from "../lib/config";

/**
 * The staff session's pair of tokens, as the API issues them. The access
 * token is short-lived and renewed before it runs out; the refresh token
 * rotates on every renewal, so a stolen copy is useless once the real
 * browser has moved on. A refused renewal means the session is over.
 */
export type Tokens = { access_token: string; refresh_token: string; expires_at: string };

const KEY = "happilab-admin.tokens";
const MARGIN_MS = 30_000;
let cached: Tokens | null | undefined;
let renewing: Promise<Tokens | null> | null = null;

export function readTokens(): Tokens | null {
  if (cached === undefined) {
    try {
      const raw = localStorage.getItem(KEY);
      cached = raw ? (JSON.parse(raw) as Tokens) : null;
    } catch {
      cached = null;
    }
  }
  return cached;
}

export function saveTokens(next: Tokens | null): void {
  cached = next;
  try {
    if (next) localStorage.setItem(KEY, JSON.stringify(next));
    else localStorage.removeItem(KEY);
  } catch {
    // No storage: the session lasts as long as the tab.
  }
}

const fresh = (tokens: Tokens) => new Date(tokens.expires_at).getTime() - MARGIN_MS > Date.now();

/** One renewal at a time, however many requests are waiting on it. */
export function renewTokens(): Promise<Tokens | null> {
  renewing ??= (async () => {
    const current = readTokens();
    if (!current) return null;
    const response = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ refresh_token: current.refresh_token }),
    }).catch(() => null);
    const next = response?.ok ? ((await response.json()) as Tokens) : null;
    saveTokens(next);
    return next;
  })().finally(() => {
    renewing = null;
  });
  return renewing;
}

/** The access token to send now: the one we hold while it is good, or a renewed one; null when signed out. */
export async function accessToken(): Promise<string | null> {
  const current = readTokens();
  if (!current) return null;
  return fresh(current) ? current.access_token : ((await renewTokens())?.access_token ?? null);
}

import { API_BASE_URL } from "../lib/config";

/**
 * The staff session's pair of tokens, as the API issues them. The access
 * token is short-lived and renewed before it runs out; the refresh token
 * rotates on every renewal, so a stolen copy is useless once the real
 * browser has moved on. A refused renewal means the session is over.
 */
export type Tokens = { access_token: string; refresh_token: string; expires_at: string };

const KEY = "happilab-admin.tokens";
const EXPIRED = "happilab-admin.expired";
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

/** Remembers, for the sign-in page, that the session ended on its own rather than by choice. */
export function markExpired(): void {
  try {
    sessionStorage.setItem(EXPIRED, "1");
  } catch {
    // No storage: the page says nothing special.
  }
}

/** True once, right after a session ended on its own. */
export function takeExpiredFlag(): boolean {
  try {
    const was = sessionStorage.getItem(EXPIRED) === "1";
    sessionStorage.removeItem(EXPIRED);
    return was;
  } catch {
    return false;
  }
}

/**
 * The session is over and the API will not renew it: forget the tokens and
 * go back to sign-in, from wherever the page was, with the way back kept
 * as a deep link. A full navigation, so nothing of the old session stays
 * in memory. On the sign-in pages themselves there is nowhere to go.
 */
export function expireSession(): void {
  saveTokens(null);
  markExpired();
  const { pathname, search } = window.location;
  if (pathname.startsWith("/login")) return;
  const back = pathname === "/" ? "" : `?to=${encodeURIComponent(pathname + search)}`;
  window.location.replace(`/login${back}`);
}

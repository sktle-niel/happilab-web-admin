import type { AuthProvider } from "@refinedev/core";
import { ApiError, api } from "../lib/api";
import { passwordMeetsPolicy } from "../lib/password";
import type { StaffIdentity } from "./session";
import { accessToken, readTokens, saveTokens, type Tokens } from "./tokens";

/**
 * Staff sign-in against the API in two steps: who you are, then the code
 * it emailed. The tokens it issues live in `tokens.ts`; the identity behind
 * them is read once per session and forgotten on sign-out.
 */
const CHALLENGE = "happilab-admin.challenge";
const EXPIRED = "happilab-admin.expired";

export type LoginParams = { method: "password"; email: string; password: string } | { method: "google"; idToken: string } | { method: "otp"; code: string };
export type Challenge = { id: string; sentTo: string; sentAt: number };
type Me = { id: string; name: string; email: string; role: StaffIdentity["role"]; pages: StaffIdentity["pages"] };

let identity: StaffIdentity | undefined;

function read<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** The sign-in waiting for its code, if any. */
export const readChallenge = () => read<Challenge>(CHALLENGE);

export async function resendCode(): Promise<void> {
  const pending = readChallenge();
  if (!pending) return;
  await api.post("/v1/admin/auth/resend", { challenge_id: pending.id }, { auth: false });
  sessionStorage.setItem(CHALLENGE, JSON.stringify({ ...pending, sentAt: Date.now() } satisfies Challenge));
}

/** True once, right after a session ended for staying away too long. */
export function takeExpiredFlag(): boolean {
  const was = sessionStorage.getItem(EXPIRED) === "1";
  sessionStorage.removeItem(EXPIRED);
  return was;
}

const failed = (error: unknown) => ({ success: false, error: { name: "Sign in failed", message: error instanceof Error ? error.message : "Something went wrong." } });
const signedOut = { authenticated: false, redirectTo: "/login", logout: true };

const forget = () => {
  saveTokens(null);
  identity = undefined;
};

/** Step one, either way in: the API starts a challenge and mails the code. */
async function challenge(body: { email: string; password: string } | { google_id_token: string }) {
  const started = await api.post<{ challenge_id: string; sent_to: string }>("/v1/admin/auth/sign-in", body, { auth: false });
  sessionStorage.setItem(CHALLENGE, JSON.stringify({ id: started.challenge_id, sentTo: started.sent_to, sentAt: Date.now() } satisfies Challenge));
  return { success: true, redirectTo: "/login/verify" };
}

export const authProvider: AuthProvider = {
  login: async (params: LoginParams) => {
    try {
      if (params.method === "password") return await challenge({ email: params.email.trim().toLowerCase(), password: params.password });
      if (params.method === "google") return await challenge({ google_id_token: params.idToken });
      const pending = readChallenge();
      if (!pending) return failed(new Error("Start again from the sign-in page."));
      saveTokens(await api.post<Tokens>("/v1/admin/auth/verify", { challenge_id: pending.id, code: params.code }, { auth: false }));
      sessionStorage.removeItem(CHALLENGE);
      identity = undefined;
      return { success: true, redirectTo: "/" };
    } catch (error) {
      return failed(error);
    }
  },

  logout: async () => {
    await api.post("/v1/admin/auth/sign-out").catch(() => undefined);
    forget();
    return { success: true, redirectTo: "/login" };
  },

  /** A held token is good until the API refuses to renew it: seven days idle, or ended by the owner. */
  check: async () => {
    if (!readTokens()) return signedOut;
    if (await accessToken()) return { authenticated: true };
    sessionStorage.setItem(EXPIRED, "1");
    forget();
    return signedOut;
  },

  getIdentity: async (): Promise<StaffIdentity | null> => {
    if (!readTokens()) return null;
    if (identity === undefined) {
      const me = await api.get<Me>("/v1/admin/me").catch(() => null);
      if (!me) return null;
      identity = { id: me.id, name: me.name, email: me.email, role: me.role, pages: me.pages };
    }
    return identity;
  },

  forgotPassword: async ({ email }: { email?: unknown }) => {
    if (typeof email !== "string" || !email.includes("@")) return failed(new Error("Enter your work email."));
    try {
      await api.post("/v1/admin/auth/forgot", { email: email.trim().toLowerCase() }, { auth: false });
      return { success: true, redirectTo: "/login/forgot?sent=1" };
    } catch (error) {
      return failed(error);
    }
  },

  updatePassword: async ({ password, confirmPassword, token }: { password?: unknown; confirmPassword?: unknown; token?: unknown }) => {
    if (typeof password !== "string" || !passwordMeetsPolicy(password)) return failed(new Error("Twelve characters, a capital, a number and a symbol."));
    if (password !== confirmPassword) return failed(new Error("The two passwords do not match."));
    try {
      await api.post("/v1/admin/auth/reset", { token, password }, { auth: false });
      return { success: true, redirectTo: "/login", successNotification: { message: "Password changed", description: "Sign in with it, and a code will follow." } };
    } catch (error) {
      return failed(error);
    }
  },

  /** A 401 the client could not renew its way past ends the session; anything else is the page's to show. */
  onError: async (error) => {
    if (error instanceof ApiError && error.status === 401) {
      forget();
      return { logout: true, redirectTo: "/login", error };
    }
    return { error };
  },
};

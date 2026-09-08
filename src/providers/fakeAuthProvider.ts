import type { AuthProvider } from "@refinedev/core";
import { staff } from "../data/fake/people";
import { ROLE_PRESETS } from "../lib/access";
import { previewing } from "../lib/env";
import { passwordMeetsPolicy } from "../lib/password";
import type { StaffIdentity } from "./session";

/**
 * The stand-in for the API's staff sign-in: two steps, a code on every
 * sign-in whichever way it started, a session that lasts until sign-out
 * or seven days without a visit. Nothing here is a credential; the API
 * implementation replaces this file and keeps the same shape.
 */
const SESSION = "happilab-admin.session";
const CHALLENGE = "happilab-admin.challenge";
const EXPIRED = "happilab-admin.expired";
const RESET = "happilab-admin.reset";

export const IDLE_DAYS = 7;
export const FAKE_CODE = "123456";
export const FAKE_RESET_TOKEN = "bundled-reset-token";
const IDLE_MS = IDLE_DAYS * 86_400_000;
const GOOGLE_ACCOUNT = "niel@falconcrest.ph";

export type LoginParams =
  | { method: "password"; email: string; password: string }
  | { method: "google" }
  | { method: "otp"; code: string };

export type Challenge = { email: string; method: "password" | "google"; sentAt: number };
type Session = { email: string; lastSeen: number };

function read<T>(store: Storage, key: string): T | null {
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** The sign-in waiting for its code, if any. */
export const readChallenge = () => read<Challenge>(sessionStorage, CHALLENGE);

export function resendCode(): void {
  const pending = readChallenge();
  if (pending) sessionStorage.setItem(CHALLENGE, JSON.stringify({ ...pending, sentAt: Date.now() }));
}

/** True once, right after a session ended for staying away too long. */
export function takeExpiredFlag(): boolean {
  const was = sessionStorage.getItem(EXPIRED) === "1";
  sessionStorage.removeItem(EXPIRED);
  return was;
}

const failed = (message: string) => ({ success: false, error: { name: "Sign in failed", message } });

const challenge = (email: string, method: Challenge["method"]) => {
  sessionStorage.setItem(CHALLENGE, JSON.stringify({ email, method, sentAt: Date.now() } satisfies Challenge));
  return { success: true, redirectTo: "/login/verify" };
};

export const fakeAuthProvider: AuthProvider = {
  login: async (params: LoginParams) => {
    switch (params.method) {
      case "google":
        return challenge(GOOGLE_ACCOUNT, "google");
      case "password":
        if (!params.email.includes("@") || params.password.length < 12) return failed("Check the email and password.");
        return challenge(params.email.trim().toLowerCase(), "password");
      case "otp": {
        const pending = readChallenge();
        if (!pending) return failed("Start again from the sign-in page.");
        if (params.code !== FAKE_CODE) return failed("That code is not right.");
        sessionStorage.removeItem(CHALLENGE);
        localStorage.setItem(SESSION, JSON.stringify({ email: pending.email, lastSeen: Date.now() } satisfies Session));
        return { success: true, redirectTo: "/" };
      }
    }
  },

  logout: async () => {
    localStorage.removeItem(SESSION);
    return { success: true, redirectTo: "/login" };
  },

  /** Every visit renews the seven days; a visit after them ends the session instead. */
  check: async () => {
    if (previewing) return { authenticated: true };
    const session = read<Session>(localStorage, SESSION);
    if (!session) return { authenticated: false, redirectTo: "/login", logout: true };
    if (Date.now() - session.lastSeen > IDLE_MS) {
      localStorage.removeItem(SESSION);
      sessionStorage.setItem(EXPIRED, "1");
      return { authenticated: false, redirectTo: "/login", logout: true };
    }
    localStorage.setItem(SESSION, JSON.stringify({ ...session, lastSeen: Date.now() }));
    return { authenticated: true };
  },

  /** The staff record behind the session; an address the bundled list does not know signs in as the owner. */
  getIdentity: async (): Promise<StaffIdentity | null> => {
    const session = read<Session>(localStorage, SESSION);
    if (session) {
      const account = staff.find((s) => s.email === session.email);
      return account
        ? { id: account.id, name: account.name, email: account.email, role: account.role, pages: account.pages }
        : { id: "s001", name: "Niel Ladica", email: session.email, role: "owner", pages: ROLE_PRESETS.owner };
    }
    return previewing ? { id: "preview", name: "Preview", email: "preview@falconcrest.ph", role: "owner", pages: ROLE_PRESETS.owner } : null;
  },

  /** The link would go to the email; on bundled data the page shows it. */
  forgotPassword: async ({ email }: { email?: unknown }) => {
    if (typeof email !== "string" || !email.includes("@")) return failed("Enter your work email.");
    sessionStorage.setItem(RESET, JSON.stringify({ email: email.trim().toLowerCase(), token: FAKE_RESET_TOKEN }));
    return { success: true, redirectTo: "/login/forgot?sent=1" };
  },

  updatePassword: async ({ password, confirmPassword, token }: { password?: unknown; confirmPassword?: unknown; token?: unknown }) => {
    const pending = read<{ email: string; token: string }>(sessionStorage, RESET);
    if (!pending || token !== pending.token) return failed("This link has expired. Request a new one.");
    if (typeof password !== "string" || !passwordMeetsPolicy(password)) return failed("Twelve characters, a capital, a number and a symbol.");
    if (password !== confirmPassword) return failed("The two passwords do not match.");
    sessionStorage.removeItem(RESET);
    localStorage.removeItem(SESSION);
    return { success: true, redirectTo: "/login", successNotification: { message: "Password changed", description: "Sign in with it, and a code will follow." } };
  },

  onError: async (error) => ({ error }),
};

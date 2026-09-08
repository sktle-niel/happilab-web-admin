import type { AuthProvider } from "@refinedev/core";
import type { StaffIdentity } from "./session";

/**
 * Lets any email with a 12-character password in and remembers it for
 * the browser — the stand-in until the API issues staff tokens. Nothing
 * here is a credential; the API implementation replaces this file.
 */
const KEY = "happilab-admin.session";

const remembered = (): { email: string } | null => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as { email: string }) : null;
  } catch {
    return null;
  }
};

export const fakeAuthProvider: AuthProvider = {
  login: async ({ email, password }: { email?: unknown; password?: unknown }) => {
    if (typeof email !== "string" || typeof password !== "string" || password.length < 12) {
      return { success: false, error: { name: "Sign in failed", message: "Check the email and password." } };
    }
    localStorage.setItem(KEY, JSON.stringify({ email }));
    return { success: true, redirectTo: "/" };
  },
  logout: async () => {
    localStorage.removeItem(KEY);
    return { success: true, redirectTo: "/login" };
  },
  check: async () => (remembered() ? { authenticated: true } : { authenticated: false, redirectTo: "/login", logout: true }),
  getIdentity: async (): Promise<StaffIdentity | null> => {
    const session = remembered();
    return session ? { id: "s001", name: "Niel Ladica", email: session.email, role: "owner" } : null;
  },
  onError: async (error) => ({ error }),
};

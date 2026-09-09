/** The signed-in staff session on bundled data, as the auth provider keeps it. */
export const SESSION_KEY = "happilab-admin.session";
export type Session = { email: string; lastSeen: number };

export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

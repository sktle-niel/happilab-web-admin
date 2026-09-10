import { GOOGLE_CLIENT_ID } from "./config";

type Prompt = { isNotDisplayed(): boolean; isSkippedMoment(): boolean; isDismissedMoment(): boolean };
type Identity = { initialize(config: { client_id: string; callback: (response: { credential: string }) => void; cancel_on_tap_outside?: boolean }): void; prompt(listener: (moment: Prompt) => void): void };
declare global {
  interface Window {
    google?: { accounts: { id: Identity } };
  }
}

/** The Google button shows only when a client id was built in; the API checks the token against the same id. */
export const googleEnabled = GOOGLE_CLIENT_ID !== "";

let loading: Promise<Identity> | null = null;
const load = () =>
  (loading ??= new Promise<Identity>((resolve, reject) => {
    if (window.google) return resolve(window.google.accounts.id);
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => (window.google ? resolve(window.google.accounts.id) : reject(new Error("Google sign-in did not load.")));
    script.onerror = () => reject(new Error("Google sign-in did not load."));
    document.head.appendChild(script);
  }));

/** One id token for the account the person picks; rejects when they close the prompt instead. */
export async function googleIdToken(): Promise<string> {
  const google = await load();
  return new Promise((resolve, reject) => {
    google.initialize({ client_id: GOOGLE_CLIENT_ID, callback: ({ credential }) => resolve(credential), cancel_on_tap_outside: true });
    google.prompt((moment) => {
      if (moment.isNotDisplayed() || moment.isSkippedMoment() || moment.isDismissedMoment()) reject(new Error("Google sign-in was closed before an account was picked."));
    });
  });
}

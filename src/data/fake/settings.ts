import { useSyncExternalStore } from "react";

/** The keys the API keeps under /v1/admin/settings, with the Falcon Crest defaults the app shipped with. */
export type Settings = {
  brand: { name: string; tagline: string; support_name: string };
  programme: { earn_rate_label: string; points_per_peso: number; min_cash_out_points: number; cash_out_presets: number[]; payout_methods: string[]; arrival_note: string };
  support: { status_line: string; acknowledgement: string };
  assets: { logo_url: string | null; backdrop_url: string | null; onboarding_clip_urls: string[] };
};
export type SettingKey = keyof Settings;

export const DEFAULTS: Settings = {
  brand: { name: "AC Falcon Crest Ventures", tagline: "Share a code, earn on every order it brings in.", support_name: "Falcon Crest Support" },
  programme: { earn_rate_label: "5–7%", points_per_peso: 1, min_cash_out_points: 1000, cash_out_presets: [1000, 2000], payout_methods: ["gcash", "maya"], arrival_note: "It usually arrives within 24 hours." },
  support: { status_line: "Online · replies within 24 hours", acknowledgement: "Thanks, we have got it. A teammate will reply here within 24 hours." },
  assets: { logo_url: null, backdrop_url: null, onboarding_clip_urls: [] },
};

const KEY = "happilab-admin.settings";

/** A file picked in this tab lives at a blob: URL that dies with the tab, so it is not carried into the next one. */
const durable = (url: string | null) => (url && !url.startsWith("blob:") ? url : null);

function load(): Settings {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Settings>;
    const assets = { ...DEFAULTS.assets, ...stored.assets };
    return {
      brand: { ...DEFAULTS.brand, ...stored.brand },
      programme: { ...DEFAULTS.programme, ...stored.programme },
      support: { ...DEFAULTS.support, ...stored.support },
      assets: { logo_url: durable(assets.logo_url), backdrop_url: durable(assets.backdrop_url), onboarding_clip_urls: assets.onboarding_clip_urls.filter((url) => durable(url)) },
    };
  } catch {
    return DEFAULTS;
  }
}

let current: Settings = load();
const listeners = new Set<() => void>();

/** Every setting, live: the page re-renders when one is saved. */
export function useSettings(): Settings {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => current,
  );
}

/** Stores one key the way PUT /v1/admin/settings/:key will, and remembers it for the next visit. */
export function saveSetting<K extends SettingKey>(key: K, value: Settings[K]): void {
  current = { ...current, [key]: value };
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    // No storage: the change still holds for this visit.
  }
  listeners.forEach((listener) => listener());
}

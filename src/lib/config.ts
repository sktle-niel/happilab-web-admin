/** Build-time settings, read once here so no screen touches import.meta.env. */
export const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");

/** Google sign-in shows only when the API was given the same client id. */
export const GOOGLE_CLIENT_ID = String(import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "");

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND?: "fake" | "api";
  readonly VITE_API_BASE_URL?: string;
}

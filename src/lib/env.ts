/** Build-time switches. Read once here so no screen touches import.meta.env. */
export const backend: "fake" | "api" = import.meta.env.VITE_BACKEND === "api" ? "api" : "fake";

/** Skip sign-in to review pages. Only ever honoured on bundled data. */
export const previewing = backend === "fake" && import.meta.env.VITE_SKIP_AUTH === "1";

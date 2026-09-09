/** Form rules shared by the editors, so every page refuses the same things the API does. */
export const required = (message: string) => ({ required: true, message });

export const httpsOnly = {
  validator: (_: unknown, url?: string) => (!url || url.startsWith("https://") ? Promise.resolve() : Promise.reject(new Error("Links start with https://."))),
};

/** The staff password policy, the same rules the API enforces, shown as the user types. */
export type PasswordRule = { label: string; passes: (password: string) => boolean };

export const PASSWORD_RULES: readonly PasswordRule[] = [
  { label: "12 characters", passes: (p) => p.length >= 12 },
  { label: "A capital letter", passes: (p) => /[A-Z]/.test(p) },
  { label: "A number", passes: (p) => /\d/.test(p) },
  { label: "A symbol", passes: (p) => /[^A-Za-z0-9]/.test(p) },
];

export const passwordMeetsPolicy = (password: string) => PASSWORD_RULES.every((rule) => rule.passes(password));

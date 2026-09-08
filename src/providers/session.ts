import { useGetIdentity, useLogin, useLogout } from "@refinedev/core";

export type StaffIdentity = { id: string; name: string; email: string; role: "owner" | "admin" | "support" };
type Credentials = { email: string; password: string };

/** The signed-in staff account and the two ways in and out, so no screen imports Refine's auth hooks directly. */
export function useStaffSession() {
  const { data: identity } = useGetIdentity<StaffIdentity>();
  const { mutate: login, isPending } = useLogin<Credentials>();
  const { mutate: logout } = useLogout();
  return {
    identity,
    isSigningIn: isPending,
    signIn: (credentials: Credentials) => login(credentials),
    signOut: () => logout(),
  };
}

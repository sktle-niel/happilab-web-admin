import { useForgotPassword, useGetIdentity, useLogin, useLogout, useUpdatePassword } from "@refinedev/core";
import { toast } from "sonner";
import type { PageKey, StaffRole } from "../lib/access";
import { googleIdToken } from "../lib/google";
import type { LoginParams } from "./authProvider";

export type StaffIdentity = { id: string; name: string; email: string; role: StaffRole; pages: PageKey[] };
/** The signed-in account as the desk names it on what it does. */
export type Me = Pick<StaffIdentity, "id" | "name">;

/** The signed-in staff account and every way in and out, so no screen imports Refine's auth hooks directly. */
export function useStaffSession() {
  const { data: identity } = useGetIdentity<StaffIdentity>();
  // Refine redirects on success and raises a notification on failure; Sonner shows it.
  const { mutate: login, isPending } = useLogin<LoginParams>();
  const { mutate: logout } = useLogout();
  const { mutate: forgot, isPending: isRequesting } = useForgotPassword<{ email: string }>();
  const { mutate: update, isPending: isUpdating } = useUpdatePassword<{ password: string; confirmPassword: string; token: string }>();
  return {
    identity,
    isBusy: isPending || isRequesting || isUpdating,
    requestReset: (email: string) => forgot({ email }),
    updatePassword: (password: string, confirmPassword: string, token: string) => update({ password, confirmPassword, token }),
    signInWithPassword: (email: string, password: string) => login({ method: "password", email, password }),
    signInWithGoogle: () => googleIdToken().then((idToken) => login({ method: "google", idToken }), (error: Error) => toast.error(error.message)),
    verify: (code: string) => login({ method: "otp", code }),
    signOut: () => logout(),
  };
}

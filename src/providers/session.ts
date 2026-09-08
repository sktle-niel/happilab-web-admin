import { useForgotPassword, useGetIdentity, useLogin, useLogout, useUpdatePassword } from "@refinedev/core";
import type { LoginParams } from "./fakeAuthProvider";

export type StaffIdentity = { id: string; name: string; email: string; role: "owner" | "admin" | "support" };

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
    signInWithGoogle: () => login({ method: "google" }),
    verify: (code: string) => login({ method: "otp", code }),
    signOut: () => logout(),
  };
}

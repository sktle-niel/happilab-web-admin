import { useForgotPassword, useGetIdentity, useLogin, useLogout, useUpdatePassword } from "@refinedev/core";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import type { PageKey, StaffRole } from "../lib/access";
import { googleIdToken } from "../lib/google";
import { startSignIn, type LoginParams } from "./authProvider";

export type StaffIdentity = { id: string; name: string; email: string; role: StaffRole; pages: PageKey[] };
/** The signed-in account as the desk names it on what it does. */
export type Me = Pick<StaffIdentity, "id" | "name">;

/** The signed-in staff account and every way in and out, so no screen imports Refine's auth hooks directly. */
export function useStaffSession() {
  const { data: identity } = useGetIdentity<StaffIdentity>();
  const navigate = useNavigate();
  const { search } = useLocation();
  // Step one goes to the verify page by hand, keeping a `?to=` deep link for
  // step two: Refine's login would follow that link at once, before there
  // is a session, and the page would send the person straight back here.
  const { mutate: start, isPending: isStarting } = useMutation({
    mutationFn: startSignIn,
    onSuccess: () => navigate(`/login/verify${search}`, { replace: true }),
    onError: (error: Error) => toast.error(error.message),
  });
  // Refine redirects on success — to the deep link, or home — and raises a notification on failure; Sonner shows it.
  const { mutate: login, isPending } = useLogin<LoginParams>();
  const { mutate: logout } = useLogout();
  const { mutate: forgot, isPending: isRequesting } = useForgotPassword<{ email: string }>();
  const { mutate: update, isPending: isUpdating } = useUpdatePassword<{ password: string; confirmPassword: string; token: string }>();
  return {
    identity,
    isBusy: isStarting || isPending || isRequesting || isUpdating,
    requestReset: (email: string) => forgot({ email }),
    updatePassword: (password: string, confirmPassword: string, token: string) => update({ password, confirmPassword, token }),
    signInWithPassword: (email: string, password: string) => start({ email: email.trim().toLowerCase(), password }),
    signInWithGoogle: () => googleIdToken().then((idToken) => start({ google_id_token: idToken }), (error: Error) => toast.error(error.message)),
    verify: (code: string) => login({ code }),
    activate: (email: string, code: string, password: string) => login({ email, code, password }),
    signOut: () => logout(),
  };
}

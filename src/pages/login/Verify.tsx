import { Button } from "antd";
import { OTPInput, REGEXP_ONLY_DIGITS, type SlotProps } from "input-otp";
import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { toast } from "sonner";
import { forgetChallenge, isExpiredSignIn, readChallenge, resendCode } from "../../providers/authProvider";
import { useStaffSession } from "../../providers/session";
import { LoginShell } from "./LoginShell";

const LENGTH = 6;
const RESEND_SECONDS = 30;
/** A code is good for this long from the moment it is sent; a resend starts it over. */
const CODE_MINUTES = 10;

function Slot({ char, isActive, hasFakeCaret }: SlotProps) {
  return (
    <div className={`otp__slot${isActive ? " is-active" : ""}`}>
      {char ?? (hasFakeCaret ? <span className="otp__caret" /> : null)}
    </div>
  );
}

/** Step two of two: the code from the email. Verifies on the sixth digit. */
export function Verify() {
  const { verify, isBusy } = useStaffSession();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(readChallenge);
  const [code, setCode] = useState("");
  const [wait, setWait] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = window.setTimeout(() => setWait(wait - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [wait]);

  /** The sign-in is over: back to the start, and say why. */
  const expire = useCallback(() => {
    forgetChallenge();
    toast("That sign-in has expired. Start again.", { id: "expired-code" });
    navigate("/login", { replace: true });
  }, [navigate]);

  // The code's ten minutes run from when it was sent; once they pass, the page has nothing to verify.
  useEffect(() => {
    if (!challenge) return;
    const left = challenge.sentAt + CODE_MINUTES * 60_000 - Date.now();
    if (left <= 0) return expire();
    const timer = window.setTimeout(expire, left);
    return () => window.clearTimeout(timer);
  }, [challenge, expire]);

  if (!challenge) return <Navigate to="/login" replace />;

  const resend = () =>
    resendCode().then(
      () => {
        setChallenge(readChallenge());
        setWait(RESEND_SECONDS);
        toast(`Code sent again to ${challenge.sentTo}.`);
      },
      (error: Error) => (isExpiredSignIn(error) ? expire() : toast.error(error.message)),
    );

  return (
    <LoginShell>
      <h1>Check your email</h1>
      <p className="login__lead">
        We sent a {LENGTH}-digit code to <b>{challenge.sentTo}</b>. It is good for ten minutes.
      </p>
      <OTPInput
        maxLength={LENGTH}
        value={code}
        onChange={setCode}
        onComplete={verify}
        pattern={REGEXP_ONLY_DIGITS}
        inputMode="numeric"
        autoFocus
        containerClassName="otp"
        render={({ slots }) => slots.map((slot, i) => <Slot key={i} {...slot} />)}
      />
      <Button type="primary" block className="login__submit" loading={isBusy} disabled={code.length < LENGTH} onClick={() => verify(code)}>
        Verify
      </Button>
      <p className="login__note">
        {wait > 0 ? `Resend code in ${wait}s` : <button type="button" className="login__link login__link--plain" onClick={resend}>Resend code</button>}
      </p>
      <p className="login__note"><Link to="/login" className="login__link">Use a different account</Link></p>
    </LoginShell>
  );
}

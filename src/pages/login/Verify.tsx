import { Button } from "antd";
import { OTPInput, REGEXP_ONLY_DIGITS, type SlotProps } from "input-otp";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import { toast } from "sonner";
import { FAKE_CODE, readChallenge, resendCode } from "../../providers/fakeAuthProvider";
import { useStaffSession } from "../../providers/session";
import { LoginShell } from "./LoginShell";

const LENGTH = 6;
const RESEND_SECONDS = 30;

/** n•••@domain: enough to recognise the address, not enough to read it off a shoulder. */
const mask = (email: string) => {
  const [user = "", domain = ""] = email.split("@");
  return `${user.slice(0, 1)}•••@${domain}`;
};

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
  const [challenge] = useState(readChallenge);
  const [code, setCode] = useState("");
  const [wait, setWait] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (challenge) toast(`Bundled data: your code is ${FAKE_CODE}.`, { id: "fake-code", duration: 8000 });
  }, [challenge]);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = window.setTimeout(() => setWait(wait - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [wait]);

  if (!challenge) return <Navigate to="/login" replace />;

  const resend = () => {
    resendCode();
    setWait(RESEND_SECONDS);
    toast(`Code sent again to ${mask(challenge.email)}.`);
  };

  return (
    <LoginShell>
      <h1>Check your email</h1>
      <p className="login__lead">
        We sent a {LENGTH}-digit code to <b>{mask(challenge.email)}</b>. It is good for ten minutes.
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

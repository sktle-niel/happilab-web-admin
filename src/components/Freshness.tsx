import { useEffect, useState } from "react";

type Props = { updatedAt: number; fetching: boolean };

/** How old the figures on screen are, and whether fresher ones are on their way. */
export function Freshness({ updatedAt, fetching }: Props) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  if (fetching) return <span className="freshness is-refreshing">Updating…</span>;
  if (!updatedAt) return null;
  const seconds = Math.max(0, Math.round((now - updatedAt) / 1000));
  return <span className="freshness">Live · updated {seconds < 5 ? "just now" : `${seconds}s ago`}</span>;
}

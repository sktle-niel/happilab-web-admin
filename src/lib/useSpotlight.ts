import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

const HOLD_MS = 4000;
const TRIES = 20;

/**
 * When the address carries a hash, finds the element marked
 * `data-spot="<hash>"`, scrolls it into view and lights it up for four
 * seconds, then drops the hash so the same search can be run again.
 */
export function useSpotlight() {
  const { hash, pathname, search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const id = hash.slice(1);
    if (!id) return;
    let tries = 0;
    let hold: number | undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const attempt = () => {
      const target = document.querySelector<HTMLElement>(`[data-spot="${CSS.escape(id)}"]`);
      if (!target) {
        if (tries++ < TRIES) window.setTimeout(attempt, 50);
        return;
      }
      target.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
      target.classList.add("is-spotlit");
      hold = window.setTimeout(() => target.classList.remove("is-spotlit"), HOLD_MS);
      navigate({ pathname, search }, { replace: true });
    };
    const frame = requestAnimationFrame(attempt);

    return () => {
      cancelAnimationFrame(frame);
      if (hold) window.clearTimeout(hold);
    };
  }, [hash, pathname, search, navigate]);
}

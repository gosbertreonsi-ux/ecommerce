import { useEffect, useState } from "react";

const KEY = "eshop-intro-seen";
const DURATION = 1600;

/** Skip the intro on repeat visits in a session, and for people who prefer reduced motion. */
function shouldSkipIntro(): boolean {
  try {
    if (sessionStorage.getItem(KEY) === "1") {
      return true;
    }
  } catch {
    /* storage unavailable */
  }

  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function Loader() {
  const [skip] = useState(shouldSkipIntro);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (skip) return;

    const start = performance.now();
    let raf = 0;
    let timeout = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / DURATION);

      setCount(Math.round(progress * 100));

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }

      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* storage unavailable */
      }

      timeout = window.setTimeout(() => setDone(true), 250);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
    };
  }, [skip]);

  if (skip || gone) return null;

  return (
    <div
      aria-hidden="true"
      className={`vero-loader ${done ? "vero-loader--done" : ""}`}
      onTransitionEnd={() => {
        if (done) setGone(true);
      }}
    >
      <p className="serif-italic text-2xl">E-Shop</p>

      <span className="vero-loader__count">{count}%</span>
    </div>
  );
}

export default Loader;
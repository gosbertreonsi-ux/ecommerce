import { useEffect, useState } from "react";

const KEY = "eshop-intro-seen";

function Loader() {
  const [seen] = useState(() => {
    try { return sessionStorage.getItem(KEY) === "1"; } catch { return false; }
  });
  const [count, setCount] = useState(seen ? 100 : 0);
  const [done, setDone] = useState(seen);

  useEffect(() => {
    if (seen) return;
    const start = performance.now();
    const duration = 1600;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setCount(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        try { sessionStorage.setItem(KEY, "1"); } catch { /* ignore */ }
        setTimeout(() => setDone(true), 250);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen]);

  if (seen) return null;

  return (
    <div className={`vero-loader ${done ? "vero-loader--done" : ""}`} aria-hidden={done}>
      <p className="serif-italic text-2xl">E-Shop</p>
      <span className="vero-loader__count">{count}%</span>
    </div>
  );
}

export default Loader;
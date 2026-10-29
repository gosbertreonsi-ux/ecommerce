import { useEffect, useRef, useState } from "react";
import "../floating-anime-ad.css";

type AdvertPhase = "waiting" | "first" | "second";

/**
 * Homepage-only, scroll-controlled decorations:
 * 1. The original falling anime enters over "Find your favourites".
 * 2. When the footer begins to appear, it flies BACK UP.
 * 3. The exact transparent girl-and-products art then rises from below
 *    and settles on the RIGHT, at the final section / footer boundary.
 *
 * Both artworks have pointer-events: none (shopping remains clickable).
 * Neither image requires a backend change or any product upload.
 */
function FloatingAnimeAdvert() {
  const markerRef = useRef<HTMLSpanElement | null>(null);
  const [phase, setPhase] = useState<AdvertPhase>("waiting");

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const marker = markerRef.current;
      if (!marker) return;

      const viewportHeight = window.innerHeight;
      const enteredCollection =
        marker.getBoundingClientRect().top <= viewportHeight * 0.66;

      // The lower edge of the final black section marks the precise seam
      // between "Make room for more" and the footer (the pink-marked area).
      const finalSection = document.querySelector<HTMLElement>(".esh-final-note");
      const footer = document.querySelector<HTMLElement>(".esh-footer");
      const footerSeam = finalSection?.getBoundingClientRect().bottom
        ?? footer?.getBoundingClientRect().top;

      // Trigger when the footer is just visible, not on the collection cards.
      const enteredFooter =
        footerSeam !== undefined && footerSeam <= viewportHeight * 0.88;

      const nextPhase: AdvertPhase = enteredFooter
        ? "second"
        : enteredCollection
          ? "first"
          : "waiting";

      setPhase((current) => current === nextPhase ? current : nextPhase);
    };

    const scheduleMeasure = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure);

    return () => {
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <span ref={markerRef} className="esh-floating-anime__marker" aria-hidden="true" />

      {/* FIRST ANIME: swings into the collection, then exits UP at its limit. */}
      <div
        className={[
          "esh-floating-anime",
          phase === "first" ? "esh-floating-anime--pinned" : "",
          phase === "second" ? "esh-floating-anime--exiting" : "",
        ].filter(Boolean).join(" ")}
        aria-hidden="true"
      >
        <div className="esh-floating-anime__swing">
          <img
            className="esh-floating-anime__art"
            src="/images/falling-shopping-anime.png"
            alt=""
            draggable={false}
            decoding="async"
          />
        </div>
      </div>

      {/* SECOND ANIME: same exact uploaded girl with her shopping products.
          The uploaded PNG is already transparent (RGBA).
          Rises from below over the RIGHT footer area and bobs happily. */}
      <div
        className={`esh-receiving-anime${phase === "second" ? " esh-receiving-anime--visible" : ""}`}
        aria-hidden="true"
      >
        <div className="esh-receiving-anime__happy">
          <img
            className="esh-receiving-anime__art"
            src="/images/receiving-shopping-anime.png"
            alt=""
            draggable={false}
            decoding="async"
          />
        </div>
      </div>
    </>
  );
}

export default FloatingAnimeAdvert;

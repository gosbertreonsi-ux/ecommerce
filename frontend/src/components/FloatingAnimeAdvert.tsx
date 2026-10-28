import { useEffect, useRef, useState } from "react";
import "../floating-anime-ad.css";

/**
 * Scroll-activated decorative advertisement for the home page.
 * The marker is positioned inside the "Find your favourites" section.
 * Once the visitor passes it, the artwork hangs at a fixed screen angle
 * until they scroll back up or reach the footer.
 *
 * No store/API calls, no clickable overlay, and no animation library.
 */
function FloatingAnimeAdvert() {
  const markerRef = useRef<HTMLSpanElement | null>(null);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    let animationFrame = 0;

    const updatePosition = () => {
      animationFrame = 0;
      const marker = markerRef.current;
      if (!marker) return;

      // Begin the entrance when the section reaches the lower-middle viewport.
      const reachedSection =
        marker.getBoundingClientRect().top <= window.innerHeight * 0.66;

      // Keep the last part of the page (footer) unobstructed.
      const footer = document.querySelector("footer");
      const reachedFooter = footer
        ? footer.getBoundingClientRect().top <= window.innerHeight * 0.88
        : false;

      const shouldPin = reachedSection && !reachedFooter;
      setIsPinned((previous) => previous === shouldPin ? previous : shouldPin);
    };

    const requestUpdate = () => {
      if (animationFrame === 0) {
        animationFrame = window.requestAnimationFrame(updatePosition);
      }
    };

    updatePosition();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <>
      <span ref={markerRef} className="esh-floating-anime__marker" aria-hidden="true" />

      <div
        className={`esh-floating-anime${isPinned ? " esh-floating-anime--pinned" : ""}`}
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
    </>
  );
}

export default FloatingAnimeAdvert;

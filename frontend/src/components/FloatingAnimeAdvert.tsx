import { useEffect, useRef, useState } from "react";
import "../floating-anime-ad.css";

type FooterStage = "hidden" | "receiving" | "wondering";

const FOOTER_READ_DELAY_MS = 2200;
const RECEIVING_VISIBLE_MS = 2600;

/**
 * Homepage decorative anime sequence.
 * 1) Main hanging anime appears near “Find your favourites”.
 * 2) When the footer area is reached, the hanging anime exits upward.
 * 3) After a short reading delay, the receiving anime fades in on the right.
 * 4) After a static pause, the wondering girl eases in on the left.
 */
function FloatingAnimeAdvert() {
  const markerRef = useRef<HTMLSpanElement | null>(null);
  const timersRef = useRef<number[]>([]);
  const footerSequenceStartedRef = useRef(false);

  const [isPinned, setIsPinned] = useState(false);
  const [footerStage, setFooterStage] = useState<FooterStage>("hidden");

  useEffect(() => {
    let animationFrame = 0;

    const clearTimers = () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };

    const resetFooterSequence = () => {
      footerSequenceStartedRef.current = false;
      clearTimers();
      setFooterStage("hidden");
    };

    const startFooterSequence = () => {
      footerSequenceStartedRef.current = true;
      clearTimers();
      setFooterStage("hidden");

      timersRef.current.push(
        window.setTimeout(() => {
          setFooterStage("receiving");
        }, FOOTER_READ_DELAY_MS),
      );

      timersRef.current.push(
        window.setTimeout(() => {
          setFooterStage("wondering");
        }, FOOTER_READ_DELAY_MS + RECEIVING_VISIBLE_MS),
      );
    };

    const updatePosition = () => {
      animationFrame = 0;

      const marker = markerRef.current;
      if (!marker) return;

      const reachedSection =
        marker.getBoundingClientRect().top <= window.innerHeight * 0.66;

      const footer = document.querySelector("footer");
      const footerVisible = footer
        ? footer.getBoundingClientRect().top <= window.innerHeight * 0.9
        : false;

      const shouldPinMain = reachedSection && !footerVisible;
      setIsPinned((previous) =>
        previous === shouldPinMain ? previous : shouldPinMain,
      );

      if (footerVisible) {
        if (!footerSequenceStartedRef.current) {
          startFooterSequence();
        }
      } else if (footerSequenceStartedRef.current) {
        resetFooterSequence();
      }
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
      clearTimers();
    };
  }, []);

  return (
    <>
      <span
        ref={markerRef}
        className="esh-floating-anime__marker"
        aria-hidden="true"
      />

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

      <div
        className={`esh-footer-anime esh-footer-anime--receiving${footerStage === "receiving" ? " is-visible" : ""}`}
        aria-hidden="true"
      >
        <img
          className="esh-footer-anime__art"
          src="/images/receiving-shopping-anime.png"
          alt=""
          draggable={false}
          decoding="async"
        />
      </div>

      <div
        className={`esh-footer-anime esh-footer-anime--wondering${footerStage === "wondering" ? " is-visible" : ""}`}
        aria-hidden="true"
      >
        <img
          className="esh-footer-anime__art esh-footer-anime__art--wondering"
          src="/images/wondering-girl.png"
          alt=""
          draggable={false}
          decoding="async"
        />
      </div>
    </>
  );
}

export default FloatingAnimeAdvert;

import { useEffect, useRef, useState } from "react";
import "../floating-anime-ad.css";

type FooterStage = "hidden" | "receiving" | "wondering" | "finished";

// Time to read the footer before the right-hand girl arrives.
const FOOTER_READ_DELAY_MS = 2200;
// How long the receiving girl stays before the wondering girl replaces her.
const RECEIVING_VISIBLE_MS = 2600;
// A deliberate further downward scroll dismisses the wondering girl.
const WONDERING_DISMISS_SCROLL_PX = 28;

function FloatingAnimeAdvert() {
  const markerRef = useRef<HTMLSpanElement>(null);
  const receivingRef = useRef<HTMLDivElement>(null);
  const wonderingRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);
  const footerStartedRef = useRef(false);
  const stageRef = useRef<FooterStage>("hidden");
  const lastScrollYRef = useRef(0);
  const wonderingDownwardTravelRef = useRef(0);

  const [isPinned, setIsPinned] = useState(false);
  const [stage, setStage] = useState<FooterStage>("hidden");

  useEffect(() => {
    let frame = 0;
    lastScrollYRef.current = window.scrollY;

    const changeStage = (nextStage: FooterStage) => {
      stageRef.current = nextStage;
      setStage(nextStage);
      if (nextStage === "wondering") {
        wonderingDownwardTravelRef.current = 0;
      }
    };

    const clearTimers = () => {
      timersRef.current.forEach(window.clearTimeout);
      timersRef.current = [];
    };

    const beginFooterSequence = () => {
      footerStartedRef.current = true;
      clearTimers();
      changeStage("hidden");

      timersRef.current.push(window.setTimeout(() => {
        changeStage("receiving");
      }, FOOTER_READ_DELAY_MS));

      timersRef.current.push(window.setTimeout(() => {
        changeStage("wondering");
      }, FOOTER_READ_DELAY_MS + RECEIVING_VISIBLE_MS));
    };

    const resetFooterSequence = () => {
      footerStartedRef.current = false;
      clearTimers();
      changeStage("hidden");
    };

    const syncFooterArtSize = (footerRect: DOMRect) => {
      // Fit the full image between the footer's upper border and bottom edge.
      // This keeps both girls tall enough to reach the black/cream dividing line.
      const maxHeight = window.innerHeight * (window.innerWidth < 600 ? 0.79 : 0.88);
      const height = Math.max(100, Math.min(footerRect.height - 12, maxHeight));
      const bottom = window.innerHeight - footerRect.bottom + 6;

      for (const node of [receivingRef.current, wonderingRef.current]) {
        if (!node) continue;
        node.style.setProperty("--esh-footer-girl-height", `${height}px`);
        node.style.setProperty("--esh-footer-girl-bottom", `${bottom}px`);
      }
    };

    const updatePosition = () => {
      frame = 0;
      const marker = markerRef.current;
      if (!marker) return;

      const scrollY = window.scrollY;
      const scrollDelta = scrollY - lastScrollYRef.current;
      lastScrollYRef.current = scrollY;

      const reachedCollection =
        marker.getBoundingClientRect().top <= window.innerHeight * 0.66;

      const footer = document.querySelector("footer");
      const footerRect = footer?.getBoundingClientRect();
      const reachedFooter = !!footerRect &&
        footerRect.top <= window.innerHeight * 0.9 && footerRect.bottom > 0;

      if (footerRect) syncFooterArtSize(footerRect);

      // As soon as the footer ends on an upward scroll, the hanging anime
      // returns. Both footer characters fade out at the same time.
      const showHanging = reachedCollection && !reachedFooter;
      setIsPinned((previous) => previous === showHanging ? previous : showHanging);

      if (reachedFooter) {
        if (!footerStartedRef.current) beginFooterSequence();

        if (stageRef.current === "wondering" && scrollDelta > 0) {
          wonderingDownwardTravelRef.current += scrollDelta;
          if (wonderingDownwardTravelRef.current >= WONDERING_DISMISS_SCROLL_PX) {
            changeStage("finished");
          }
        }
      } else if (footerStartedRef.current) {
        resetFooterSequence();
      }
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updatePosition);
    };

    updatePosition();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
      clearTimers();
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

      {/* Right side: larger receiving girl, closer to the floating products. */}
      <div
        ref={receivingRef}
        className={`esh-footer-anime esh-footer-anime--receiving${stage === "receiving" ? " is-visible" : ""}`}
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

      {/* Left side: wondering girl replaces receiving girl, then scrolls away. */}
      <div
        ref={wonderingRef}
        className={`esh-footer-anime esh-footer-anime--wondering${stage === "wondering" ? " is-visible" : ""}`}
        aria-hidden="true"
      >
        <img
          className="esh-footer-anime__art"
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

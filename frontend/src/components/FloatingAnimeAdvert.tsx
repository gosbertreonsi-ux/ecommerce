import { useEffect, useRef, useState } from "react";
import "../floating-anime-ad.css";

type FooterStage = "hidden" | "receiving" | "wondering" | "finished";

// Time to read the footer before the right-hand girl arrives.
const FOOTER_READ_DELAY_MS = 2200;
// How long the receiving girl stays before the wondering girl replaces her.
const RECEIVING_VISIBLE_MS = 2600;
// A deliberate further downward scroll dismisses the wondering girl.
const WONDERING_DISMISS_SCROLL_PX = 28;

/**
 * YOUR SOCIAL LINKS — edit these two addresses whenever you like.
 * GitHub points to your public profile. WhatsApp uses a working message-sharing
 * link until you add your own number, e.g. https://wa.me/2557XXXXXXXX.
 */
const SOCIAL_LINKS = {
  github: "https://github.com/gosbertreonsi-ux",
  whatsapp: "https://wa.me/255740462193?text=Hell%20E%20shop",
} as const;

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
        aria-hidden={stage !== "wondering"}
      >
        {/* Original artwork stays exactly as it was. */}
        <img
          className="esh-footer-anime__art"
          src="/images/wondering-girl.png"
          alt=""
          draggable={false}
          decoding="async"
        />

        {/* Small circular links float near her two raised hands.
            The rest of this overlay stays non-interactive. */}
        <div className="esh-wondering-socials">
          <a
            className="esh-wondering-social esh-wondering-social--left"
            href={SOCIAL_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit my GitHub profile"
            title="GitHub"
            tabIndex={stage === "wondering" ? 0 : -1}
          >
            {/* GitHub brand logo: inline SVG, no lucide-react brand import. */}
            <svg
              width={17}
              height={17}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M12 .297a12 12 0 0 0-3.793 23.387c.6.111.82-.261.82-.577v-2.234c-3.338.726-4.043-1.416-4.043-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.082-.73.082-.73 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.467-1.332-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.536-1.524.118-3.176 0 0 1.008-.323 3.3 1.23a11.52 11.52 0 0 1 6.006 0c2.291-1.553 3.296-1.23 3.296-1.23.656 1.652.244 2.873.12 3.176.77.84 1.235 1.91 1.235 3.221 0 4.61-2.807 5.624-5.48 5.921.43.37.823 1.102.823 2.222v3.293c0 .319.216.694.825.576A12 12 0 0 0 12 .297" />
            </svg>
          </a>
          <a
            className="esh-wondering-social esh-wondering-social--right"
            href={SOCIAL_LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open WhatsApp"
            title="WhatsApp"
            tabIndex={stage === "wondering" ? 0 : -1}
          >
            {/* WhatsApp mark, inline SVG: no icon dependency or image background. */}
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.15-.197.297-.767.965-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.058-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.496.099-.198.05-.372-.025-.52-.074-.15-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.48 0 1.462 1.065 2.875 1.213 3.073.149.198 2.096 3.2 5.077 4.487.71.307 1.263.49 1.694.627.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.005-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347M12.004 0C5.38 0 .005 5.375.002 12a11.93 11.93 0 0 0 1.6 5.979L0 24l6.335-1.652A11.96 11.96 0 0 0 12.004 24C18.63 24 24 18.626 24 12S18.63 0 12.004 0zm0 21.8a9.77 9.77 0 0 1-4.984-1.366l-.358-.212-3.716.973.992-3.624-.234-.373A9.757 9.757 0 0 1 2.2 12.003c.003-5.407 4.4-9.806 9.807-9.806 5.407 0 9.806 4.4 9.806 9.807 0 5.407-4.4 9.796-9.81 9.796z" />
            </svg>
          </a>
        </div>
      </div>
    </>
  );
}

export default FloatingAnimeAdvert;

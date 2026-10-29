import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import "../home-background-audio.css";

/**
 * Home-page music settings — change these values to suit your store.
 * Range: 0 (silent) to 1 (full volume).
 * Using a quiet default helps keep browsing comfortable.
 */
const AUDIO_SOURCE = "../../public/audio/ad1.mp3";
const DEFAULT_VOLUME = 0.1;
const START_MUTED = false;
const MUTE_PREFERENCE_KEY = "esh-home-background-audio-muted";

function initialMuted() {
  try {
    const saved = window.localStorage.getItem(MUTE_PREFERENCE_KEY);
    return saved === null ? START_MUTED : saved === "true";
  } catch {
    return START_MUTED;
  }
}

function storeMuted(muted: boolean) {
  try {
    window.localStorage.setItem(MUTE_PREFERENCE_KEY, String(muted));
  } catch {
    // A private browser session may block storage; audio still works.
  }
}

/** Mount only on the homepage; unmount automatically pauses the audio. */
export default function HomeBackgroundAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(initialMuted);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let disposed = false;
    audio.volume = Math.min(1, Math.max(0, DEFAULT_VOLUME));
    audio.muted = initialMuted();

    // Browsers may reject autoplay with sound. Try it, then fall back to
    // muted looping playback. The icon lets the visitor turn sound on.
    void audio.play().catch(async () => {
      if (disposed) return;
      audio.muted = true;
      setMuted(true);
      try {
        await audio.play();
      } catch {
        // Even muted autoplay may be blocked; the toggle can start it.
      }
    });

    return () => {
      disposed = true;
      audio.pause();
    };
  }, []);

  const toggleMuted = async () => {
    const audio = audioRef.current;
    if (!audio || unavailable) return;

    const nextMuted = !muted;
    audio.volume = Math.min(1, Math.max(0, DEFAULT_VOLUME));
    audio.muted = nextMuted;

    if (nextMuted) {
      setMuted(true);
      storeMuted(true);
      return;
    }

    try {
      await audio.play();
      setMuted(false);
      storeMuted(false);
    } catch {
      audio.muted = true;
      setMuted(true);
      storeMuted(true);
    }
  };

  const label = unavailable
    ? "Background music unavailable"
    : muted
      ? "Play background music"
      : "Mute background music";

  return (
    <div className="esh-home-audio" role="group" aria-label="Homepage music">
      <audio
        ref={audioRef}
        src={AUDIO_SOURCE}
        loop
        preload="auto"
        aria-hidden="true"
        onError={() => {
          setUnavailable(true);
          setMuted(true);
        }}
      />
      <button
        type="button"
        className="esh-home-audio__toggle"
        aria-label={label}
        aria-pressed={!muted && !unavailable}
        title={label}
        disabled={unavailable}
        onClick={() => { void toggleMuted(); }}
      >
        {muted || unavailable ? (
          <VolumeX size={17} aria-hidden="true" />
        ) : (
          <Volume2 size={17} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

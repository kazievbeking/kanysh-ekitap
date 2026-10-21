import { useEffect, useRef, useState } from "react";
import { asset } from "../data/book";
import { backgroundTrack } from "../data/music";
import { Icon } from "./Icon";

const VOLUME_KEY = "kanysh-background-music-volume";
function storedVolume() {
  try {
    const value = localStorage.getItem(VOLUME_KEY);
    const n = value === null ? 0.18 : Number(value);
    return Number.isFinite(n) ? Math.min(0.5, Math.max(0, n)) : 0.18;
  } catch {
    return 0.18;
  }
}
export function BackgroundMusic({
  ducked,
  suspended,
}: {
  ducked: boolean;
  suspended: boolean;
}) {
  const audio = useRef<HTMLAudioElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [volume, setVolume] = useState(storedVolume);
  const [error, setError] = useState("");
  const [hidden, setHidden] = useState(document.hidden);
  const paused = suspended || hidden;

  useEffect(() => {
    const listener = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", listener);
    return () => document.removeEventListener("visibilitychange", listener);
  }, []);
  useEffect(() => {
    const el = audio.current;
    return () => el?.pause();
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(VOLUME_KEY, String(volume));
    } catch {
      /* Сақтау бұғатталса да ойнату жұмыс істейді. */
    }
  }, [volume]);
  useEffect(() => {
    const el = audio.current;
    if (!el) return;
    const target = ducked ? volume * 0.22 : volume;
    if (!enabled || paused) {
      el.volume = target;
      return;
    }
    const start = el.volume;
    const began = Date.now();
    const timer = setInterval(() => {
      const fraction = Math.min(1, (Date.now() - began) / 450);
      el.volume = start + (target - start) * fraction;
      if (fraction === 1) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [volume, ducked, enabled, paused]);
  useEffect(() => {
    const el = audio.current;
    if (!el) return;
    if (!enabled || paused) el.pause();
    else
      void el.play().catch(() => {
        setEnabled(false);
        setError("Музыканы қосу үшін батырманы қайта басыңыз.");
      });
  }, [enabled, paused]);

  function toggle() {
    if (enabled) {
      setEnabled(false);
      audio.current?.pause();
      return;
    }
    setError("");
    if (audio.current) {
      audio.current.volume = ducked ? volume * 0.22 : volume;
      if (!paused)
        void audio.current.play().catch(() => {
          setEnabled(false);
          setError("Музыканы ойнату мүмкін болмады.");
        });
    }
    setEnabled(true);
  }
  return (
    <div className="background-music">
      <audio
        ref={audio}
        data-background-music="true"
        src={asset(backgroundTrack.file)}
        loop
        preload="none"
        onError={() => {
          setEnabled(false);
          setError("Музыка файлы ашылмады.");
        }}
      />
      <button
        className={`icon-button music-toggle ${enabled ? "music-on" : ""}`}
        onClick={toggle}
        aria-label={enabled ? "Фондық музыканы өшіру" : "Фондық музыканы қосу"}
        aria-pressed={enabled}
        title={enabled ? "Фондық музыканы өшіру" : "Фондық музыканы қосу"}
      >
        <Icon name="Music2" size={19} />
        {enabled && <span className="music-indicator" />}
      </button>
      <details className="music-options">
        <summary aria-label="Музыка баптаулары" title="Музыка баптаулары">
          ⌄
        </summary>
        <div className="music-panel">
          <span className="eyebrow">ФОНДЫҚ МУЗЫКА</span>
          <p>Тыныш фортепиано әуені</p>
          <label>
            Музыка деңгейі
            <input
              type="range"
              aria-label="Фондық музыка деңгейі"
              min="0"
              max="0.5"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
            />
          </label>
          <small>
            Диктор сөйлегенде бәсеңдейді. Ойын кезінде және бет жасырылғанда
            тоқтайды.
          </small>
          <div className="music-credit">
            <a href={backgroundTrack.source} target="_blank" rel="noreferrer">
              {backgroundTrack.title}
            </a>
            <span>{backgroundTrack.artist} · incompetech.com</span>
            <a href={backgroundTrack.license} target="_blank" rel="noreferrer">
              CC BY 4.0
            </a>
          </div>
          {error && (
            <p className="audio-error" role="status">
              {error}
            </p>
          )}
        </div>
      </details>
      {error && (
        <span className="sr-only" role="status">
          {error}
        </span>
      )}
    </div>
  );
}

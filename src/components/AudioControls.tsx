import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import type { AudioSegment } from "../types";
import { asset } from "../data/book";
import { Icon } from "./Icon";
export type AudioHandle = {
  pause: () => void;
  isPlaying: () => boolean;
  play: () => void;
};
const time = (n: number) =>
  `${Math.floor(Math.max(0, n) / 60)}:${String(Math.floor(Math.max(0, n) % 60)).padStart(2, "0")}`;
export const AudioControls = forwardRef<
  AudioHandle,
  {
    segment?: AudioSegment;
    volume: number;
    onVolume: (n: number) => void;
    onBoundary: () => void;
    onPlaying: (v: boolean) => void;
    onTime: (v: number) => void;
    savedTime?: number;
    autoPlay: boolean;
    sceneTitle: string;
  }
>(function AudioControls(
  {
    segment,
    volume,
    onVolume,
    onBoundary,
    onPlaying,
    onTime,
    savedTime,
    autoPlay,
    sceneTitle,
  },
  ref,
) {
  const audio = useRef<HTMLAudioElement>(null),
    reached = useRef(false),
    stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [playing, setPlaying] = useState(false),
    [position, setPosition] = useState(segment?.start ?? 0),
    [ready, setReady] = useState(false),
    [error, setError] = useState("");
  const callbacks = useRef({ onBoundary, onPlaying, onTime });
  callbacks.current = { onBoundary, onPlaying, onTime };
  async function play() {
    if (!audio.current || !segment || !ready) return;
    try {
      if (audio.current.currentTime >= segment.end - 0.05)
        audio.current.currentTime = segment.start;
      reached.current = false;
      await audio.current.play();
      setError("");
    } catch {
      setError("Дыбысты қосу үшін ойнату батырмасын басыңыз.");
    }
  }
  useImperativeHandle(ref, () => ({
    pause: () => audio.current?.pause(),
    isPlaying: () => !!audio.current && !audio.current.paused,
    play: () => {
      void play();
    },
  }));
  useEffect(() => {
    const el = audio.current;
    return () => {
      if (stopTimer.current) clearTimeout(stopTimer.current);
      if (el) el.pause();
      callbacks.current.onPlaying(false);
    };
  }, []);
  useEffect(() => {
    if (audio.current) audio.current.volume = volume;
  }, [volume]);
  const start = segment?.start ?? 0,
    end = segment?.end ?? 0,
    duration = end - start;
  function boundary() {
    if (reached.current) return;
    reached.current = true;
    if (audio.current) {
      audio.current.pause();
      audio.current.currentTime = end;
    }
    setPosition(end);
    callbacks.current.onTime(end);
    callbacks.current.onBoundary();
  }
  function scheduleBoundary() {
    if (stopTimer.current) clearTimeout(stopTimer.current);
    const el = audio.current;
    if (el && !el.paused && segment)
      stopTimer.current = setTimeout(
        boundary,
        Math.max(0, (end - el.currentTime) * 1000),
      );
  }
  const ratio =
    duration > 0
      ? Math.min(100, Math.max(0, ((position - start) / duration) * 100))
      : 0;
  return (
    <div className="audio-player">
      <audio
        ref={audio}
        src={segment ? asset(segment.file) : undefined}
        preload="metadata"
        onLoadedMetadata={() => {
          const el = audio.current!;
          el.currentTime =
            savedTime && savedTime >= start && savedTime < end - 0.1
              ? savedTime
              : start;
          setPosition(el.currentTime);
          setReady(true);
          if (autoPlay) {
            reached.current = false;
            void el
              .play()
              .catch(() =>
                setError("Жалғастыру үшін ойнату батырмасын басыңыз."),
              );
          }
        }}
        onPlay={() => {
          setPlaying(true);
          callbacks.current.onPlaying(true);
          scheduleBoundary();
        }}
        onPause={() => {
          if (stopTimer.current) clearTimeout(stopTimer.current);
          setPlaying(false);
          callbacks.current.onPlaying(false);
        }}
        onTimeUpdate={() => {
          const t = audio.current!.currentTime;
          setPosition(t);
          callbacks.current.onTime(t);
          if (t >= end) boundary();
        }}
        onSeeking={() => {
          if (stopTimer.current) clearTimeout(stopTimer.current);
        }}
        onSeeked={scheduleBoundary}
        onWaiting={() => {
          if (stopTimer.current) clearTimeout(stopTimer.current);
        }}
        onPlaying={scheduleBoundary}
        onEnded={boundary}
        onError={() =>
          setError("Аудиофайл ашылмады. Мәтінді оқуды жалғастыра аласыз.")
        }
      />
      <button
        className="play-button"
        disabled={!segment || !ready}
        onClick={() => (playing ? audio.current?.pause() : void play())}
        aria-label={playing ? "Кідірту" : "Ойнату"}
      >
        <Icon name={playing ? "Pause" : "Play"} size={23} />
      </button>
      <div className="audio-main">
        <div className="audio-label">
          <span>
            <Icon name="Headphones" size={13} />
            {sceneTitle}
          </span>
          <span>
            {time(position - start)}
            <span className="time-divider"> / </span>
            {time(duration)}
          </span>
        </div>
        <div className="audio-track">
          <div className="waveform" aria-hidden="true">
            {Array.from({ length: 70 }, (_, i) => (
              <i
                key={i}
                className={(i / 70) * 100 < ratio ? "played" : ""}
                style={{ height: `${4 + ((i * 17 + 7) % 23)}px` }}
              />
            ))}
          </div>
          <input
            aria-label="Көріністегі аудио уақыты"
            type="range"
            min={start}
            max={end || 1}
            step="0.05"
            value={Math.min(end || 1, Math.max(start, position))}
            disabled={!ready}
            onChange={(e) => {
              if (audio.current) {
                const next = Number(e.target.value);
                reached.current = false;
                audio.current.currentTime = next;
                setPosition(next);
                callbacks.current.onTime(next);
              }
            }}
          />
        </div>
        {(!segment || error) && (
          <p className="audio-error" role="status">
            {error || "Бұл көрініске аудио әлі байланыстырылмаған."}
          </p>
        )}
      </div>
      <div className="volume-controls">
        <button
          className="icon-button"
          aria-label={volume === 0 ? "Дыбысты қосу" : "Дыбысты өшіру"}
          onClick={() => onVolume(volume === 0 ? 0.8 : 0)}
        >
          <Icon name={volume === 0 ? "VolumeX" : "Volume2"} size={19} />
        </button>
        <input
          aria-label="Дыбыс деңгейі"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => onVolume(Number(e.target.value))}
        />
      </div>
    </div>
  );
});

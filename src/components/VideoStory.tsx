import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { asset } from "../data/book";
import { academyVideos, videoFrame } from "../data/academyVideos";
import type { Scene } from "../types";
import { Icon } from "./Icon";
import "./video-story.css";

export function VideoStory({
  scene,
  elapsed,
  duration,
  playing,
  blocked,
  getElapsed,
  onPlay,
  reducedMotion = false,
}: {
  scene: Scene;
  elapsed: number;
  duration: number;
  playing: boolean;
  blocked: boolean;
  getElapsed: () => number;
  onPlay: () => void;
  reducedMotion?: boolean;
}) {
  const clips = academyVideos[scene.id];
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const videoRefs = useMemo(
    () =>
      clips.map((_, index) => (node: HTMLVideoElement | null) => {
        if (!node) videos.current[index]?.pause();
        videos.current[index] = node;
      }),
    [clips],
  );
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(() => videoFrame(clips, elapsed).index);
  const activeRef = useRef(active);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const [systemReduced, setSystemReduced] = useState(
    () =>
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const still = reducedMotion || systemReduced;
  const latest = useRef({ playing, blocked, still, getElapsed, duration });
  latest.current = { playing, blocked, still, getElapsed, duration };
  useEffect(() => {
    if (typeof matchMedia === "undefined") return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setSystemReduced(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  function sync(value: number, force = false) {
    const state = latest.current;
    const time = Math.max(
      0,
      Math.min(state.duration, Number.isFinite(value) ? value : 0),
    );
    const frame = videoFrame(clips, time);
    root.current?.style.setProperty("--elapsed", String(time));
    if (frame.index !== activeRef.current) {
      activeRef.current = frame.index;
      setActive(frame.index);
    }
    videos.current.forEach((video, index) => {
      if (!video) return;
      video.muted = true;
      video.defaultMuted = true;
      if (index !== frame.index) {
        if (!video.paused) video.pause();
        return;
      }
      if (video.readyState < 1) return;
      if (force || Math.abs(video.currentTime - frame.time) > 0.35) {
        try {
          video.currentTime = Math.min(
            frame.time,
            Math.max(0, video.duration - 0.05),
          );
        } catch {
          /* Metadata may be replaced during a source change. */
        }
      }
      if (state.playing && !state.blocked && !state.still) {
        if (video.paused)
          void video.play().catch(() => {
            /* The next user playback action retries. */
          });
      } else if (!video.paused) video.pause();
    });
  }
  const syncRef = useRef(sync);
  syncRef.current = sync;
  useEffect(() => {
    let request = 0;
    syncRef.current(elapsed, !playing || blocked || still);
    if (playing && !blocked && !still) {
      const tick = () => {
        syncRef.current(getElapsed());
        request = requestAnimationFrame(tick);
      };
      request = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(request);
  }, [elapsed, playing, blocked, still, getElapsed]);
  useEffect(() => {
    const elements = videos.current;
    return () => elements.forEach((v) => v?.pause());
  }, []);
  return (
    <div
      ref={root}
      className="film-stage video-stage"
      role="region"
      aria-label={`${scene.title}: бейнекөрініс`}
      data-playing={playing && !blocked && !still}
      data-shot={active}
      data-scene={scene.id}
      style={{ "--elapsed": Math.max(0, elapsed) } as CSSProperties}
    >
      {clips.map((clip, index) => (
        <video
          key={clip.file}
          ref={videoRefs[index]}
          className="story-video"
          data-active={active === index}
          aria-hidden={active !== index}
          muted
          playsInline
          loop
          preload="auto"
          poster={asset(clip.poster)}
          onLoadedMetadata={() =>
            syncRef.current(latest.current.getElapsed(), true)
          }
          onCanPlay={() => syncRef.current(latest.current.getElapsed(), true)}
          onError={() => setFailed((p) => ({ ...p, [index]: true }))}
          src={asset(clip.file)}
        />
      ))}
      <span className="film-art-note">Көркем бейнекөрініс</span>
      {failed[active] ? (
        <div className="video-error" role="status">
          <p>Бейнені жүктеу мүмкін болмады. Мәтін мен аудио қолжетімді.</p>
          <button
            className="button primary"
            onClick={() => {
              setFailed((p) => ({ ...p, [active]: false }));
              videos.current[active]?.load();
            }}
          >
            Қайта жүктеу
          </button>
        </div>
      ) : (
        !playing &&
        !blocked && (
          <button
            className="film-start"
            onClick={onPlay}
            aria-label="Анимацияны ойнату"
          >
            <span>
              <Icon name="Play" size={28} />
            </span>
            <small>Әңгімені тыңдау</small>
          </button>
        )
      )}
      {still && (
        <span className="video-motion-note">
          Қозғалысты азайту қосулы · аудио мен мәтін қолжетімді
        </span>
      )}
    </div>
  );
}

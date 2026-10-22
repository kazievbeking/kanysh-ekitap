import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { asset } from "../data/book";
import { storyboards, shotAt, imageDescriptions } from "../data/storyboards";
import type { Scene } from "../types";
import { FilmLayers } from "./FilmLayers";
import { Icon } from "./Icon";
import "./animated-story.css";
import { filmFrame } from "../data/filmFrame";

export function AnimatedStory({
  scene,
  duration,
  elapsed,
  playing,
  blocked,
  getElapsed,
  onPlay,
}: {
  scene: Scene;
  duration: number;
  elapsed: number;
  playing: boolean;
  blocked: boolean;
  getElapsed: () => number;
  onPlay: () => void;
}) {
  const shots = storyboards[scene.id] || [
    { at: 0, image: scene.image, effect: "sunlight" as const },
  ];
  const root = useRef<HTMLDivElement>(null),
    activeRef = useRef(shotAt(shots, elapsed));
  const [active, setActive] = useState(activeRef.current);
  useEffect(() => {
    let frame = 0;
    function paint(time: number) {
      const clamped = Math.max(
        0,
        Math.min(duration, Number.isFinite(time) ? time : 0),
      );
      root.current?.style.setProperty("--elapsed", String(clamped));
      const next = shotAt(shots, clamped);
      root.current
        ?.querySelectorAll<HTMLElement>(".film-shot")
        .forEach((element, index) => {
          const frame = filmFrame(shots, index, clamped, duration);
          element.style.opacity = String(frame.opacity);
          element.style.visibility = frame.visible ? "visible" : "hidden";
          const image = element.querySelector<HTMLElement>(".film-backdrop");
          if (image) image.style.transform = frame.transform;
        });
      if (next !== activeRef.current) {
        activeRef.current = next;
        setActive(next);
      }
    }
    paint(elapsed);
    if (playing && !blocked) {
      const tick = () => {
        paint(getElapsed());
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(frame);
  }, [elapsed, playing, blocked, duration, getElapsed, shots]);
  return (
    <div
      ref={root}
      className="film-stage"
      role="region"
      aria-label={`${scene.title}: анимациялық көрініс`}
      data-playing={playing && !blocked}
      data-shot={active}
      style={{ "--elapsed": Math.max(0, elapsed) } as CSSProperties}
    >
      {shots.map((shot, i) => (
        <div
          className={`film-shot film-${shot.effect}`}
          data-active={active === i}
          key={`${scene.id}-${i}`}
          style={
            {
              opacity: filmFrame(shots, i, elapsed, duration).opacity,
              visibility: filmFrame(shots, i, elapsed, duration).visible
                ? "visible"
                : "hidden",
              "--at": shot.at,
              "--until": shots[i + 1]?.at ?? duration + 1,
              "--span": Math.max(1, (shots[i + 1]?.at ?? duration) - shot.at),
              "--focus": shot.focus ?? "50% 50%",
              "--direction": shot.direction ?? 1,
              "--fade-in": i === 0 ? 1 : 0,
            } as CSSProperties
          }
          aria-hidden={active !== i}
        >
          <img
            className="film-backdrop"
            style={{
              transform: filmFrame(shots, i, elapsed, duration).transform,
            }}
            src={asset(`images/${shot.image}.webp`)}
            alt={imageDescriptions[shot.image] ?? scene.caption}
            loading={i < 2 ? "eager" : "lazy"}
            draggable={false}
          />
          <FilmLayers effect={shot.effect} />
        </div>
      ))}
      <div className="film-vignette" />
      <div className="film-grain" />
      <span className="film-art-note">Көркем анимация</span>
      {!playing && !blocked && (
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
      )}
      <div className="film-cuts" aria-hidden="true">
        {shots.map((_, i) => (
          <i className={i === active ? "active" : ""} key={i} />
        ))}
      </div>
    </div>
  );
}

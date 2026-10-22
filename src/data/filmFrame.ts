import { shotAt } from "./storyboards";
import type { FilmShot } from "./storyboards";

// Keep frame visibility explicit: future illustrations must never cover the scene.
export function filmFrame(
  shots: FilmShot[],
  index: number,
  elapsed: number,
  duration: number,
) {
  const time = Math.max(
    0,
    Math.min(duration, Number.isFinite(elapsed) ? elapsed : 0),
  );
  const active = shotAt(shots, time);
  const fade =
    active === 0 ? 1 : Math.min(1, Math.max(0, time - shots[active].at));
  const visible = index === active || (index === active - 1 && fade < 1);
  const shot = shots[index];
  const span = Math.max(1, (shots[index + 1]?.at ?? duration) - shot.at);
  const progress = Math.min(1, Math.max(0, (time - shot.at) / span));
  return {
    visible,
    opacity: index === active ? fade : visible ? 1 : 0,
    transform: `scale(${1.025 + progress * 0.115}) translateX(${(-1 + progress * 2) * (shot.direction ?? 1)}%)`,
  };
}

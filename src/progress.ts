import type { Progress } from "./types";
import { chapters } from "./data/book";
export const STORAGE_KEY = "kanysh-book-progress-v1";
export const freshProgress = (): Progress => ({
  chapter: "academy",
  scene: 0,
  completedGames: [],
  volume: 0.8,
  positions: {},
  finishedChapters: [],
  audioTimes: {},
  reducedMotion: false,
});
export function loadProgress(): Progress {
  try {
    const p = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!p || typeof p !== "object") return freshProgress();
    const chapter = chapters.find((c) => c.id === p.chapter) || chapters[0];
    const numbers = (value: unknown): Record<string, number> =>
      Object.fromEntries(
        Object.entries(value && typeof value === "object" ? value : {}).filter(
          ([, v]) => typeof v === "number" && Number.isFinite(v) && v >= 0,
        ),
      ) as Record<string, number>;
    return {
      ...freshProgress(),
      chapter: chapter.id,
      scene: Math.max(
        0,
        Math.min(
          chapter.scenes.length - 1,
          Number.isInteger(p.scene) ? p.scene : 0,
        ),
      ),
      volume:
        typeof p.volume === "number" && Number.isFinite(p.volume)
          ? Math.max(0, Math.min(1, p.volume))
          : 0.8,
      completedGames: Array.isArray(p.completedGames)
        ? p.completedGames.filter((x: unknown) => typeof x === "string")
        : [],
      finishedChapters: Array.isArray(p.finishedChapters)
        ? p.finishedChapters.filter((x: unknown) => typeof x === "string")
        : [],
      positions: numbers(p.positions),
      audioTimes: numbers(p.audioTimes),
      reducedMotion: p.reducedMotion === true,
    };
  } catch {
    return freshProgress();
  }
}
export function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

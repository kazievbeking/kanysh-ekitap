import { it, expect } from "vitest";
import { storyboards } from "../src/data/storyboards";
import { filmFrame } from "../src/data/filmFrame";

it("академияның екінші көрінісінде 15 секундта тек қолжазба толық көрінеді", () => {
  const shots = storyboards["academy-02"];
  for (const time of [0, 15, 42, 44, 57, 92, 15]) {
    const frames = shots.map((_, i) => filmFrame(shots, i, time, 100));
    expect(frames.filter((f) => f.visible)).toHaveLength(1);
    expect(frames.find((f) => f.visible)?.opacity).toBe(1);
    expect(frames.filter((f) => !f.visible).every((f) => f.opacity === 0)).toBe(
      true,
    );
  }
});
it("кадр ауысуында тек көршілес екі сурет қабаттасады", () => {
  const shots = storyboards["academy-02"];
  const frames = shots.map((_, i) => filmFrame(shots, i, 43.5, 100));
  const incoming = shots.findIndex((s) => s.at === 43);
  frames.forEach((frame, index) => {
    expect(frame.visible).toBe(index === incoming || index === incoming - 1);
    expect(frame.opacity).toBe(
      index === incoming ? 0.5 : index === incoming - 1 ? 1 : 0,
    );
  });
});

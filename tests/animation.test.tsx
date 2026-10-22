import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { existsSync } from "node:fs";
import { App } from "../src/App";
import { chapters } from "../src/data/book";
import { storyboards, shotAt } from "../src/data/storyboards";
import manifest from "../src/data/audio-manifest.json";
import { freshProgress, STORAGE_KEY } from "../src/progress";
import type { AudioSegment } from "../src/types";

const narration = () =>
  document.querySelector(
    "audio:not([data-background-music])",
  ) as HTMLAudioElement;
const stage = () => document.querySelector(".film-stage") as HTMLElement;

it("ойын мәзірі ашылса кеш жүктелген аудио өздігінен басталмайды", async () => {
  const user = userEvent.setup();
  location.hash = "#/read/academy/0";
  render(<App />);
  await user.click(screen.getByRole("button", { name: "Анимацияны ойнату" }));
  await user.click(
    screen.getByRole("button", { name: "Тапсырмалар", exact: true }),
  );
  fireEvent.loadedMetadata(narration());
  expect(narration().paused).toBe(true);
  expect(stage().getAttribute("data-playing")).toBe("false");
});

it("екі бөлімдегі тоғыз көріністе аудио ұзақтығына сай толық раскадровка бар", () => {
  expect(Object.keys(storyboards)).toHaveLength(9);
  for (const chapter of chapters)
    for (const scene of chapter.scenes) {
      const shots = storyboards[scene.id];
      const segment = (manifest.segments as Record<string, AudioSegment>)[
        scene.id
      ];
      expect(shots.length).toBeGreaterThanOrEqual(2);
      expect(shots[0].at).toBe(0);
      shots.forEach((shot, i) => {
        expect(existsSync(`public/images/${shot.image}.webp`)).toBe(true);
        expect(shot.at).toBeLessThan(segment.end - segment.start);
        if (i) expect(shot.at).toBeGreaterThan(shots[i - 1].at);
      });
      expect(shotAt(shots, segment.end - segment.start)).toBe(shots.length - 1);
    }
});

it("барлық көріністе мәтін панелі орнына анимациялық сахна көрсетіледі", () => {
  for (const chapter of chapters)
    for (let i = 0; i < chapter.scenes.length; i++) {
      location.hash = `#/read/${chapter.id}/${i}`;
      const view = render(<App />);
      expect(stage()).toBeTruthy();
      expect(document.querySelector(".text-page")).toBeNull();
      expect(screen.queryByRole("button", { name: "Мәтінді оқу" })).toBeNull();
      expect(document.querySelector(".reader")?.textContent).not.toContain(
        chapter.scenes[i].paragraphs[0],
      );
      expect(document.querySelectorAll(".film-shot").length).toBe(
        storyboards[chapter.scenes[i].id].length,
      );
      view.unmount();
    }
});

it("аудионы алға және артқа жылжыту тиісті анимациялық кадрды қалпына келтіреді", async () => {
  const user = userEvent.setup();
  location.hash = "#/read/academy/0";
  render(<App />);
  fireEvent.loadedMetadata(narration());
  await user.click(screen.getByRole("button", { name: "Ойнату", exact: true }));
  narration().currentTime = 23;
  fireEvent.timeUpdate(narration());
  expect(stage().getAttribute("data-shot")).toBe("1");
  expect(Number(stage().style.getPropertyValue("--elapsed"))).toBe(23);
  await user.click(
    screen.getByRole("button", { name: "Кідірту", exact: true }),
  );
  expect(stage().getAttribute("data-playing")).toBe("false");
  fireEvent.change(
    screen.getByRole("slider", { name: "Көріністегі аудио уақыты" }),
    { target: { value: "37" } },
  );
  expect(stage().getAttribute("data-shot")).toBe("2");
  fireEvent.change(
    screen.getByRole("slider", { name: "Көріністегі аудио уақыты" }),
    { target: { value: "5" } },
  );
  expect(stage().getAttribute("data-shot")).toBe("0");
  expect(stage().getAttribute("data-playing")).toBe("false");
});

it("анимация кадры таймерден емес нақты аудио уақытынан есептеледі", async () => {
  let callback: FrameRequestCallback | undefined;
  const request = vi
    .spyOn(window, "requestAnimationFrame")
    .mockImplementation((cb) => {
      callback = cb;
      return 99;
    });
  const cancel = vi.spyOn(window, "cancelAnimationFrame");
  try {
    const user = userEvent.setup();
    location.hash = "#/read/academy/0";
    render(<App />);
    fireEvent.loadedMetadata(narration());
    await user.click(
      screen.getByRole("button", { name: "Ойнату", exact: true }),
    );
    expect(callback).toBeDefined();
    narration().currentTime = 24.75;
    act(() => callback!(performance.now()));
    expect(Number(stage().style.getPropertyValue("--elapsed"))).toBe(24.75);
    expect(stage().getAttribute("data-shot")).toBe("1");
    await user.click(
      screen.getByRole("button", { name: "Кідірту", exact: true }),
    );
    expect(cancel).toHaveBeenCalledWith(99);
    expect(Number(stage().style.getPropertyValue("--elapsed"))).toBe(24.75);
  } finally {
    request.mockRestore();
    cancel.mockRestore();
  }
});

it("ойын ашылғанда аудио мен анимация бірге тоқтайды", async () => {
  const user = userEvent.setup();
  location.hash = "#/read/fugitive/1";
  render(<App />);
  fireEvent.loadedMetadata(narration());
  await user.click(screen.getByRole("button", { name: "Ойнату", exact: true }));
  expect(stage().getAttribute("data-playing")).toBe("true");
  narration().currentTime = manifest.segments["fugitive-02"].end;
  fireEvent.timeUpdate(narration());
  expect(screen.getByRole("dialog", { name: "ОЙЛАНУ СӘТІ" })).toBeTruthy();
  expect(narration().paused).toBe(true);
  await waitFor(() =>
    expect(stage().getAttribute("data-playing")).toBe("false"),
  );
});

it("сақталған аудио уақытынан ашылғанда бұрынғы кадр көрсетіледі", () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...freshProgress(), audioTimes: { "academy-01": 23 } }),
  );
  location.hash = "#/read/academy/0";
  render(<App />);
  fireEvent.loadedMetadata(narration());
  expect(narration().currentTime).toBe(23);
  expect(stage().getAttribute("data-shot")).toBe("1");
  expect(stage().getAttribute("data-playing")).toBe("false");
});

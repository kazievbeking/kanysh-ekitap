import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect, vi } from "vitest";
import { existsSync } from "node:fs";
import { App } from "../src/App";
import { academyVideos, videoFrame } from "../src/data/academyVideos";
import { freshProgress, STORAGE_KEY } from "../src/progress";
import manifest from "../src/data/audio-manifest.json";

const audio = () =>
  document.querySelector<HTMLAudioElement>(
    "audio:not([data-background-music])",
  )!;
const videos = () => [
  ...document.querySelectorAll<HTMLVideoElement>("video.story-video"),
];
function readyVideos() {
  for (const video of videos()) {
    Object.defineProperty(video, "readyState", {
      configurable: true,
      value: 4,
    });
    Object.defineProperty(video, "duration", {
      configurable: true,
      value: video.src.includes("clip-5") ? 9 : 10,
    });
    fireEvent.loadedMetadata(video);
  }
}
it("бес MP4 пен постер бар, барлық төрт көрініс бейнеге ауыстырылған", () => {
  const files = new Set<string>();
  for (const [scene, clips] of Object.entries(academyVideos)) {
    for (const clip of clips) {
      files.add(clip.file);
      expect(existsSync(`public/${clip.file}`)).toBe(true);
      expect(existsSync(`public/${clip.poster}`)).toBe(true);
    }
    location.hash = `#/read/academy/${Number(scene.slice(-2)) - 1}`;
    const view = render(<App />);
    expect(videos().length).toBe(clips.length);
    expect(view.container.querySelector(".film-backdrop")).toBeNull();
    expect(
      view.container.querySelector(".reader-text .text-scroll p"),
    ).toBeTruthy();
    expect(videos().every((v) => v.muted && v.playsInline)).toBe(true);
    expect(videos().filter((v) => v.dataset.active === "true")).toHaveLength(1);
    view.unmount();
  }
  expect(files.size).toBe(5);
  expect(videoFrame(academyVideos["academy-01"], 9)).toEqual({
    index: 1,
    time: 0,
  });
  expect(videoFrame(academyVideos["academy-01"], 19)).toEqual({
    index: 0,
    time: 0,
  });
  expect(videoFrame(academyVideos["academy-01"], 23)).toEqual({
    index: 0,
    time: 4,
  });
});
it("пауза, алға және кері айналдыру бейнені аудиомен бірге басқарады", async () => {
  const user = userEvent.setup();
  location.hash = "#/read/academy/0";
  render(<App />);
  fireEvent.loadedMetadata(audio());
  readyVideos();
  await user.click(screen.getByRole("button", { name: "Ойнату", exact: true }));
  expect(videos()[0].paused).toBe(false);
  audio().currentTime = 10;
  fireEvent.timeUpdate(audio());
  expect(videos()[0].paused).toBe(true);
  expect(videos()[1].paused).toBe(false);
  expect(videos()[1].currentTime).toBeCloseTo(1);
  await user.click(
    screen.getByRole("button", { name: "Кідірту", exact: true }),
  );
  expect(videos().every((v) => v.paused)).toBe(true);
  fireEvent.change(
    screen.getByRole("slider", { name: "Көріністегі аудио уақыты" }),
    { target: { value: "20" } },
  );
  expect(videos()[0].dataset.active).toBe("true");
  expect(videos()[0].currentTime).toBeCloseTo(1);
  fireEvent.change(
    screen.getByRole("slider", { name: "Көріністегі аудио уақыты" }),
    { target: { value: "3" } },
  );
  expect(videos()[0].currentTime).toBeCloseTo(3);
  expect(videos().every((v) => v.paused)).toBe(true);
});
it("ойын мәзірінде кеш жүктелген бейне қосылмайды, шыққанда дауысы өшірулі", async () => {
  const user = userEvent.setup();
  location.hash = "#/read/academy/0";
  render(<App />);
  fireEvent.loadedMetadata(audio());
  await user.click(screen.getByRole("button", { name: "Ойнату", exact: true }));
  await user.click(
    screen.getByRole("button", { name: "Тапсырмалар", exact: true }),
  );
  readyVideos();
  expect(videos().every((v) => v.paused && v.muted)).toBe(true);
});
it("сақталған уақыт және қозғалысты азайту бейнеге де қолданылады", async () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...freshProgress(),
      reducedMotion: true,
      audioTimes: { "academy-01": 23 },
    }),
  );
  const user = userEvent.setup();
  location.hash = "#/read/academy/0";
  render(<App />);
  fireEvent.loadedMetadata(audio());
  readyVideos();
  expect(videos()[0].currentTime).toBeCloseTo(4);
  await user.click(screen.getByRole("button", { name: "Ойнату", exact: true }));
  expect(audio().paused).toBe(false);
  expect(videos().every((v) => v.paused)).toBe(true);
});
it("аудио шекарасындағы тапсырма барлық бейнені тоқтатады", async () => {
  const user = userEvent.setup();
  location.hash = "#/read/academy/0";
  render(<App />);
  fireEvent.loadedMetadata(audio());
  readyVideos();
  await user.click(screen.getByRole("button", { name: "Ойнату", exact: true }));
  audio().currentTime = manifest.segments["academy-01"].end;
  fireEvent.timeUpdate(audio());
  expect(screen.getByRole("dialog", { name: "ОЙЛАНУ СӘТІ" })).toBeTruthy();
  expect(videos().every((v) => v.paused)).toBe(true);
});
it("келесі көрініске өткенде алдыңғы бейне тоқтайды", async () => {
  const user = userEvent.setup();
  location.hash = "#/read/academy/1";
  render(<App />);
  fireEvent.loadedMetadata(audio());
  readyVideos();
  await user.click(screen.getByRole("button", { name: "Ойнату", exact: true }));
  const previous = videos();
  await user.click(screen.getByRole("button", { name: "Келесі", exact: true }));
  expect(previous.every((v) => v.paused)).toBe(true);
  expect(videos()[0].src).toContain("clip-4.mp4");
});

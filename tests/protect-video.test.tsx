import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect } from "vitest";
import { existsSync } from "node:fs";
import { App } from "../src/App";
import { protectVideos, videoFrame } from "../src/data/academyVideos";
import manifest from "../src/data/audio-manifest.json";

it("екінші бөлімнің бес кадры ретімен қосылып, бесінші кадр Әуезовке арналған", () => {
  for (let index = 0; index < 5; index++) {
    const id = `protect-0${index + 1}`;
    const clip = protectVideos[id][0];
    expect(clip.file).toBe(`video/protect/clip-${index + 1}.mp4`);
    expect(existsSync(`public/${clip.file}`)).toBe(true);
    expect(existsSync(`public/${clip.poster}`)).toBe(true);
    location.hash = `#/read/protect/${index}`;
    const view = render(<App />);
    const book = view.container.querySelector(".reader-book")!;
    expect(
      book.querySelector(":scope > .video-stage video")?.getAttribute("src"),
    ).toContain(clip.file);
    expect(
      book.querySelector(":scope > .reader-text .text-scroll p"),
    ).toBeTruthy();
    expect(book.querySelector(".film-backdrop")).toBeNull();
    if (index === 4) {
      expect(book.textContent).toContain("Әуезовтің Мәскеуге жетуі");
      expect(book.textContent).toContain("Мұхтар");
    }
    view.unmount();
  }
  expect(existsSync("materials/illustrations/protect-auezov.png")).toBe(true);
  expect(videoFrame(protectVideos["protect-05"], 84.4)).toEqual({
    index: 0,
    time: 84.4,
  });
});
it("екінші бөлімнің бейнесі аудиомен бірге жылжып, тапсырма кезінде тоқтайды", async () => {
  const user = userEvent.setup();
  location.hash = "#/read/protect/3";
  render(<App />);
  const audio = document.querySelector<HTMLAudioElement>(
    "audio:not([data-background-music])",
  )!;
  const video = document.querySelector<HTMLVideoElement>("video.story-video")!;
  fireEvent.loadedMetadata(audio);
  Object.defineProperty(video, "readyState", { configurable: true, value: 4 });
  Object.defineProperty(video, "duration", { configurable: true, value: 10 });
  fireEvent.loadedMetadata(video);
  await user.click(screen.getByRole("button", { name: "Ойнату", exact: true }));
  expect(video.paused).toBe(false);
  expect(video.muted).toBe(true);
  audio.currentTime = manifest.segments["protect-04"].start + 13;
  fireEvent.timeUpdate(audio);
  expect(video.currentTime).toBeCloseTo(3);
  await user.click(
    screen.getByRole("button", { name: "Кідірту", exact: true }),
  );
  expect(video.paused).toBe(true);
  fireEvent.change(
    screen.getByRole("slider", { name: "Көріністегі аудио уақыты" }),
    { target: { value: String(manifest.segments["protect-04"].start + 2) } },
  );
  expect(video.currentTime).toBeCloseTo(2);
  await user.click(screen.getByRole("button", { name: "Келесі", exact: true }));
  expect(screen.getByRole("dialog", { name: "ОЙЛАНУ СӘТІ" })).toBeTruthy();
  expect(video.paused).toBe(true);
});

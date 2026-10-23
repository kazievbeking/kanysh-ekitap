import { render, fireEvent } from "@testing-library/react";
import { it, expect } from "vitest";
import { App } from "../src/App";
import { fugitiveHandPose } from "../src/data/fugitiveMotion";
import { illustrationCrop } from "../src/data/illustrationCrop";
import { storyboards } from "../src/data/storyboards";
import manifest from "../src/data/audio-manifest.json";

it("екінші бөлімде қол қимылы шағын, беттер мен жасырын қолдар өзгермейді", () => {
  for (const image of ["evening", "warning", "support"]) {
    for (let time = 0; time < 100; time += 0.5) {
      const pose = fugitiveHandPose(image, time)!;
      expect(Math.abs(pose.angle)).toBeLessThan(0.008);
      expect(pose.shift.every((x) => Math.abs(x) < 0.0012)).toBe(true);
      expect(fugitiveHandPose(image, time)).toEqual(pose);
    }
  }
  for (const image of ["train", "station", "manuscript"])
    expect(fugitiveHandPose(image, 20)).toBeNull();
});
it("барлық бес көріністе қозғалыс бар және кері айналдыру кадрды қалпына келтіреді", () => {
  for (let index = 0; index < 5; index++) {
    location.hash = `#/read/fugitive/${index}`;
    const view = render(<App />);
    expect(view.container.querySelectorAll(".fugitive-details").length).toBe(
      storyboards[`fugitive-0${index + 1}`].length,
    );
    const audio = view.container.querySelector<HTMLAudioElement>(
      "audio:not([data-background-music])",
    )!;
    fireEvent.loadedMetadata(audio);
    const start = (manifest.segments as Record<string, { start: number }>)[
      `fugitive-0${index + 1}`
    ].start;
    audio.currentTime = start + 15;
    fireEvent.timeUpdate(audio);
    const stage = view.container.querySelector<HTMLElement>(".film-stage")!;
    expect(Number(stage.style.getPropertyValue("--elapsed"))).toBeCloseTo(15);
    audio.currentTime = start + 2;
    fireEvent.timeUpdate(audio);
    expect(Number(stage.style.getPropertyValue("--elapsed"))).toBeCloseTo(2);
    expect(stage.dataset.playing).toBe("false");
    view.unmount();
  }
});
it("терезедегі эффектілер телефонда да суреттің crop аймағына сәйкес келеді", () => {
  for (const [w, h] of [
    [1200, 600],
    [360, 550],
    [800, 500],
  ]) {
    const crop = illustrationCrop(1536, 1024, w, h, "36% 44%");
    expect(crop.width / crop.height).toBeCloseTo(w / h);
    expect(crop.x).toBeGreaterThanOrEqual(0);
    expect(crop.y).toBeGreaterThanOrEqual(0);
    expect(crop.x + crop.width).toBeLessThanOrEqual(1536.00001);
    expect(crop.y + crop.height).toBeLessThanOrEqual(1024.00001);
    expect(crop.x).toBeCloseTo((1536 - crop.width) * 0.36);
    expect(crop.y).toBeCloseTo((1024 - crop.height) * 0.44);
  }
});

import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { App } from "../src/App";
import { chapters } from "../src/data/book";
import { gameDetails } from "../src/data/games";
import { STORAGE_KEY, freshProgress, loadProgress } from "../src/progress";
import manifest from "../src/data/audio-manifest.json";

it("жаңа бөлім бет ретімен екеуінің арасына қосылып, мәтіні толық сақталған", () => {
  expect(chapters.map((c) => c.id)).toEqual(["academy", "protect", "fugitive"]);
  expect(chapters.map((c) => c.pages)).toEqual([
    "117–119",
    "284–285",
    "289–291",
  ]);
  const chapter = chapters[1];
  expect(chapter.scenes.map((s) => s.paragraphs.join(" ")).join(" ")).toBe(
    readFileSync("materials/chapter-3-extracted.txt", "utf8").trim(),
  );
  for (const [id, definition] of Object.entries(gameDetails)) {
    const source = chapters.find((c) => c.id === definition.chapter)!;
    expect(source.scenes.some((s) => s.gameAfter === id)).toBe(true);
  }
});
it("ескі сақталған Қашқын академик барысы жаңа бөлім қосылғанда жоғалмайды", () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...freshProgress(),
      chapter: "fugitive",
      scene: 3,
      positions: { fugitive: 3 },
      audioTimes: { "fugitive-04": 12 },
    }),
  );
  expect(loadProgress().chapter).toBe("fugitive");
  expect(loadProgress().scene).toBe(3);
  expect(loadProgress().audioTimes["fugitive-04"]).toBe(12);
});
it("жаңа тапсырма дұрыс жауапты тексеріп, соңғы көріністен жалғастырады", async () => {
  const user = userEvent.setup();
  location.hash = "#/read/protect/3";
  render(<App />);
  const audio = document.querySelector<HTMLAudioElement>(
    "audio:not([data-background-music])",
  )!;
  fireEvent.loadedMetadata(audio);
  await user.click(screen.getByRole("button", { name: "Келесі", exact: true }));
  const dialog = screen.getByRole("dialog", { name: "ОЙЛАНУ СӘТІ" });
  expect(dialog.textContent).toContain("284–285");
  await user.click(
    within(dialog).getByRole("button", { name: "Набатов", exact: true }),
  );
  await user.click(
    within(dialog).getByRole("button", { name: "Жауапты тексеру" }),
  );
  expect(within(dialog).queryByText("Керемет, шешім табылды!")).toBeNull();
  await user.click(
    within(dialog).getByRole("button", { name: "Мұхтар Әуезов", exact: true }),
  );
  await user.click(
    within(dialog).getByRole("button", { name: "Жауапты тексеру" }),
  );
  await user.click(
    within(dialog).getByRole("button", { name: "Әңгімені жалғастыру" }),
  );
  await waitFor(() => expect(location.hash).toBe("#/read/protect/4"));
  expect(loadProgress().completedGames).toContain("protect-choice");
  const last = document.querySelector<HTMLAudioElement>(
    "audio:not([data-background-music])",
  )!;
  fireEvent.loadedMetadata(last);
  expect(last.currentTime).toBe(manifest.segments["protect-05"].start);
  await user.click(screen.getByRole("button", { name: "Бөлімді аяқтау" }));
  expect(loadProgress().finishedChapters).toContain("protect");
});

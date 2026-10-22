import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  within,
} from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { App } from "../src/App";
import { chapters } from "../src/data/book";
import manifest from "../src/data/audio-manifest.json";
import { loadProgress, STORAGE_KEY, freshProgress } from "../src/progress";
import { readFileSync } from "node:fs";

async function go(hash: string) {
  await act(async () => {
    location.hash = hash;
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
}
function media() {
  return document.querySelector(
    "audio:not([data-background-music])",
  ) as HTMLAudioElement;
}
function ready() {
  fireEvent.loadedMetadata(media());
}
async function solveOpening(user: ReturnType<typeof userEvent.setup>) {
  const dialog = await screen.findByRole("dialog", { name: "ОЙЛАНУ СӘТІ" });
  for (const answer of [
    "1946",
    "1 шілде",
    "Абай атындағы Опера және балет театры",
  ])
    await user.click(
      within(dialog).getByRole("button", { name: answer, exact: true }),
    );
  await user.click(
    within(dialog).getByRole("button", { name: "Үзіндіні тексеру" }),
  );
  await user.click(
    within(dialog).getByRole("button", { name: "Әңгімені жалғастыру" }),
  );
}
async function solveRoute(user: ReturnType<typeof userEvent.setup>) {
  const dialog = await screen.findByRole("dialog", { name: "ОЙЛАНУ СӘТІ" });
  for (const city of ["Алматы", "Қызылорда", "Орал", "Қазан", "Мәскеу"])
    await user.click(
      within(dialog).getByRole("button", { name: city, exact: true }),
    );
  await user.click(
    within(dialog).getByRole("button", { name: "Бағытты тексеру" }),
  );
  await user.click(
    within(dialog).getByRole("button", { name: "Әңгімені жалғастыру" }),
  );
}
describe("Кітаптың толық сценарийлері", () => {
  it("PDF-тен алынған мәтін көріністерде қысқартусыз сақталған", () => {
    const raw = readFileSync("materials/extracted.txt", "utf8");
    const [one, two] = raw.split("Первая часть:")[1].split("Вторая часть:");
    const clean = (s: string) =>
      s
        .replace(/\[thoughtful\]\s*/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .normalize("NFC");
    for (const [index, text] of [one, two].entries())
      expect(
        chapters[index].scenes.map((s) => s.paragraphs.join(" ")).join(" "),
      ).toBe(clean(text));
  });
  it("екі бөлімнің мәтіндері мен аудио шекаралары тұтас", () => {
    for (const c of chapters) {
      let end = 0;
      for (const s of c.scenes) {
        const segment = (
          manifest.segments as Record<
            string,
            { start: number; end: number; file: string }
          >
        )[s.id];
        expect(segment).toBeDefined();
        expect(segment.start).toBe(end);
        expect(segment.end).toBeGreaterThan(segment.start);
        end = segment.end;
        expect(s.paragraphs.join("").length).toBeGreaterThan(50);
      }
    }
  });
  it("бірінші бөлім: ойын дыбысты тоқтатады, дұрыс шешімнен кейін келесі көріністен жалғасады", async () => {
    const user = userEvent.setup();
    location.hash = "#/read/academy/0";
    render(<App />);
    ready();
    await user.click(
      screen.getByRole("button", { name: "Ойнату", exact: true }),
    );
    expect(media().paused).toBe(false);
    await user.click(
      screen.getByRole("button", { name: "Келесі", exact: true }),
    );
    expect(media().paused).toBe(true);
    await solveOpening(user);
    expect(loadProgress().completedGames).toContain("opening-facts");
    await waitFor(() => expect(location.hash).toBe("#/read/academy/1"));
    ready();
    await user.click(
      screen.getByRole("button", { name: "Келесі", exact: true }),
    );
    await waitFor(() => expect(location.hash).toBe("#/read/academy/2"));
    ready();
    expect(media().paused).toBe(false);
    const oldAudio = media();
    await user.click(
      screen.getByRole("button", { name: "Келесі", exact: true }),
    );
    expect(oldAudio.paused).toBe(true);
    const dialog = screen.getByRole("dialog", { name: "ОЙЛАНУ СӘТІ" });
    expect(dialog).toBeTruthy();
    await user.click(
      within(dialog).getByRole("button", { name: "Жауапты тексеру" }),
    );
    expect(within(dialog).getByRole("status").textContent).toContain(
      "Тағы бір",
    );
    for (const [name, field] of [
      ["Әлкей Марғұлан", "Тарих"],
      ["Мұхтар Әуезов", "Әдебиет"],
      ["Ахмет Жұбанов", "Өнертану"],
    ]) {
      await user.click(
        within(dialog).getByRole("button", { name, exact: true }),
      );
      await user.click(
        within(dialog).getByRole("button", { name: new RegExp(`^${field}`) }),
      );
    }
    await user.click(
      within(dialog).getByRole("button", { name: "Жауапты тексеру" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Әңгімені жалғастыру" }),
    );
    await waitFor(() => expect(location.hash).toBe("#/read/academy/3"));
    ready();
    await waitFor(() => expect(media().paused).toBe(false));
    const segment = (manifest.segments as Record<string, { start: number }>)[
      chapters[0].scenes[3].id
    ];
    expect(media().currentTime).toBe(segment.start);
    expect(loadProgress().completedGames).toContain("science-team");
    await user.click(screen.getByRole("button", { name: "Бөлімді аяқтау" }));
    expect(loadProgress().finishedChapters).toContain("academy");
  });
  it("екінші бөлім: аудио шекарасында ойын ашылады, реттеу және толық аяқтау жұмыс істейді", async () => {
    const user = userEvent.setup();
    location.hash = "#/read/fugitive/1";
    render(<App />);
    ready();
    await user.click(
      screen.getByRole("button", { name: "Ойнату", exact: true }),
    );
    const segment = (manifest.segments as Record<string, { end: number }>)[
      chapters[1].scenes[1].id
    ];
    media().currentTime = segment.end;
    fireEvent.timeUpdate(media());
    expect(media().paused).toBe(true);
    const dialog = await screen.findByRole("dialog", { name: "ОЙЛАНУ СӘТІ" });
    await user.click(
      within(dialog).getByRole("button", { name: "Ретін тексеру" }),
    );
    expect(within(dialog).getByRole("status").textContent).toContain(
      "Ретті тағы",
    );
    await user.click(
      within(dialog).getByRole("button", {
        name: "Қауіп туралы хабар алу: жоғары жылжыту",
      }),
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Билет алу: жоғары жылжыту" }),
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Билет алу: жоғары жылжыту" }),
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Ретін тексеру" }),
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Әңгімені жалғастыру" }),
    );
    await waitFor(() => expect(location.hash).toBe("#/read/fugitive/2"));
    ready();
    await waitFor(() => expect(media().paused).toBe(false));
    for (const index of [3, 4]) {
      await user.click(
        screen.getByRole("button", { name: "Келесі", exact: true }),
      );
      if (index === 4) await solveRoute(user);
      await waitFor(() =>
        expect(location.hash).toBe(`#/read/fugitive/${index}`),
      );
      ready();
    }
    await user.click(screen.getByRole("button", { name: "Бөлімді аяқтау" }));
    expect(loadProgress().finishedChapters).toContain("fugitive");
    expect(loadProgress().completedGames).toContain("event-chain");
    expect(loadProgress().completedGames).toContain("journey-route");
  });
  it("жаңартудан кейін прогресс, ойындар, дыбыс және аудио уақыты сақталады", async () => {
    location.hash = "#/read/academy/1";
    const first = render(<App />);
    ready();
    media().currentTime = 70;
    fireEvent.timeUpdate(media());
    fireEvent.change(screen.getByRole("slider", { name: "Дыбыс деңгейі" }), {
      target: { value: "0.35" },
    });
    first.unmount();
    render(<App />);
    ready();
    expect(loadProgress().scene).toBe(1);
    expect(loadProgress().volume).toBe(0.35);
    expect(media().currentTime).toBe(70);
  });
  it("энциклопедия тек атау мен кері навигациядан тұрады, шыққанда аудио тоқтайды", async () => {
    const user = userEvent.setup();
    location.hash = "#/read/academy/0";
    render(<App />);
    ready();
    await user.click(
      screen.getByRole("button", { name: "Ойнату", exact: true }),
    );
    const oldAudio = media();
    await go("#/encyclopedia");
    expect(oldAudio.paused).toBe(true);
    const page = document.querySelector(".encyclopedia")!;
    expect(page.querySelectorAll(".encyclopedia-sections button").length).toBe(
      3,
    );
    expect(page.textContent).toContain("Қаныш әлемі");
    expect(page.textContent).toContain(
      "Маңғыстаудың байлығы бірнеше ұрпаққа жетеді",
    );
    expect(
      document.querySelector("audio:not([data-background-music])"),
    ).toBeNull();
  });
  it("бұзылған localStorage қолданбаны тоқтатпайды", () => {
    localStorage.setItem(STORAGE_KEY, "{broken");
    expect(loadProgress().chapter).toBe("academy");
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        chapter: "bad",
        scene: 999,
        volume: "bad",
        positions: null,
        completedGames: null,
      }),
    );
    expect(loadProgress().scene).toBe(3);
    expect(loadProgress().volume).toBe(0.8);
  });
  it("көріністі қайта таңдағанда басынан басталады, ал бет жаңарғанда сақталған жері ашылады", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...freshProgress(), completedGames: ["opening-facts"] }),
    );
    location.hash = "#/read/academy/1";
    render(<App />);
    ready();
    media().currentTime = 70;
    fireEvent.timeUpdate(media());
    await user.click(
      screen.getByRole("button", { name: "Алдыңғы", exact: true }),
    );
    await waitFor(() => expect(location.hash).toBe("#/read/academy/0"));
    ready();
    await user.click(
      screen.getByRole("button", { name: "Келесі", exact: true }),
    );
    await waitFor(() => expect(location.hash).toBe("#/read/academy/1"));
    ready();
    expect(media().currentTime).toBe(manifest.segments["academy-02"].start);
    expect(media().paused).toBe(true);
  });
  it("кітапты ашу, мәтінге тікелей өту және прогресті тазалау жұмыс істейді", async () => {
    const user = userEvent.setup();
    location.hash = "#/cover";
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Кітапты ашу", exact: true }),
    );
    await screen.findByRole("heading", { name: "Мазмұны", exact: true });
    await user.click(screen.getByRole("link", { name: "Мазмұнға өту" }));
    expect(location.hash).toBe("#/home");
    expect(document.activeElement?.id).toBe("main");
    await user.click(screen.getByRole("button", { name: "Баптаулар" }));
    await user.click(
      screen.getByRole("checkbox", { name: /Қозғалысты азайту/ }),
    );
    expect(loadProgress().reducedMotion).toBe(true);
    await user.click(
      screen.getByRole("button", { name: "Басынан бастау", exact: true }),
    );
    await user.click(
      screen.getByRole("button", { name: "Иә, басынан бастау" }),
    );
    await waitFor(() => expect(location.hash).toBe("#/cover"));
    expect(loadProgress().reducedMotion).toBe(false);
    expect(loadProgress().completedGames).toEqual([]);
  });
});

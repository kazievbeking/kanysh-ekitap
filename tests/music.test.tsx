import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { App } from "../src/App";
import { BackgroundMusic } from "../src/components/BackgroundMusic";

it("фон ерікті қосылады, диктор астында бәсеңдейді және ойында тоқтайды", async () => {
  const user = userEvent.setup();
  location.hash = "#/read/academy/2";
  render(<App />);
  const background = document.querySelector(
    "audio[data-background-music]",
  ) as HTMLAudioElement;
  const narration = document.querySelector(
    "audio:not([data-background-music])",
  ) as HTMLAudioElement;
  expect(background.paused).toBe(true);
  await user.click(
    screen.getByRole("button", { name: "Фондық музыканы қосу" }),
  );
  expect(background.paused).toBe(false);
  expect(background.loop).toBe(true);
  fireEvent.loadedMetadata(narration);
  await user.click(screen.getByRole("button", { name: "Ойнату", exact: true }));
  await waitFor(() => expect(background.volume).toBeLessThan(0.05));
  await user.click(screen.getByRole("button", { name: "Келесі", exact: true }));
  expect(narration.paused).toBe(true);
  await waitFor(() => expect(background.paused).toBe(true));
  const game = screen.getByRole("dialog", { name: "ОЙЛАНУ СӘТІ" });
  await user.click(
    within(game).getByRole("button", { name: "Анимацияға оралу" }),
  );
  await waitFor(() => expect(background.paused).toBe(false));
  await user.click(
    screen.getByRole("button", { name: "Фондық музыканы өшіру" }),
  );
  expect(background.paused).toBe(true);
});

it("музыка деңгейі сақталады және жасырылған бетте ойнату тоқтайды", async () => {
  const user = userEvent.setup();
  const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(false);
  try {
    const view = render(<BackgroundMusic ducked={false} suspended={false} />);
    const background = document.querySelector("audio")!;
    await user.click(
      screen.getByRole("button", { name: "Фондық музыканы қосу" }),
    );
    fireEvent.change(screen.getByLabelText("Фондық музыка деңгейі"), {
      target: { value: "0.3" },
    });
    expect(localStorage.getItem("kanysh-background-music-volume")).toBe("0.3");
    hidden.mockReturnValue(true);
    fireEvent(document, new Event("visibilitychange"));
    expect(background.paused).toBe(true);
    hidden.mockReturnValue(false);
    fireEvent(document, new Event("visibilitychange"));
    await waitFor(() => expect(background.paused).toBe(false));
    view.unmount();
    expect(background.paused).toBe(true);
    render(<BackgroundMusic ducked={false} suspended={false} />);
    expect(
      (screen.getByLabelText("Фондық музыка деңгейі") as HTMLInputElement)
        .value,
    ).toBe("0.3");
    expect(document.querySelector("audio")!.paused).toBe(true);
  } finally {
    hidden.mockRestore();
  }
});

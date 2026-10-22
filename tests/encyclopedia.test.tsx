import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Encyclopedia } from "../src/components/Encyclopedia";
import data from "../src/data/encyclopedia.json";

describe("Қаныш әлемі энциклопедиясы", () => {
  it("үш бөлімнің толық мәтінін көрсетеді және іздейді", () => {
    render(<Encyclopedia onBack={() => {}} />);
    data.sections.forEach((section) => {
      fireEvent.click(
        screen.getByRole("button", { name: new RegExp(section.title) }),
      );
      const articles = document.querySelectorAll(".encyclopedia-entry");
      expect(articles.length).toBe(section.entries.length);
      section.entries.forEach((entry, index) =>
        entry.paragraphs.forEach((text) =>
          expect(articles[index].textContent).toContain(text),
        ),
      );
    });
    const search = screen.getByRole("searchbox");
    fireEvent.change(search, { target: { value: "Жер-судың аты" } });
    expect(document.querySelectorAll(".encyclopedia-entry").length).toBe(1);
    expect(
      document.querySelector(".encyclopedia-entries")?.textContent,
    ).toContain("41-бет");
    fireEvent.change(search, { target: { value: "xyznotfound" } });
    expect(screen.getByText("Сәйкес жазба табылмады")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Іздеуді тазарту" }));
    expect(document.querySelectorAll(".encyclopedia-entry").length).toBe(
      data.sections[2].entries.length,
    );
  });
  it("бөлім ауысқанда іздеуді тазартады", () => {
    render(<Encyclopedia onBack={() => {}} />);
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "Маңғыстау" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Ғалымдардың пікірлері/ }),
    );
    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("");
    expect(document.querySelectorAll(".encyclopedia-entry").length).toBe(
      data.sections[1].entries.length,
    );
  });
});

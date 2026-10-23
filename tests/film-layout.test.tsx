import { render } from "@testing-library/react";
import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { App } from "../src/App";

it("үш бөлімнің кадрлары декорация өлшемдерін қабылдамай, толық сахнаны жабады", () => {
  const css = document.createElement("style");
  css.textContent =
    readFileSync("src/components/animated-story.css", "utf8") +
    readFileSync("src/components/academy-motion.css", "utf8") +
    readFileSync("src/components/fugitive-motion.css", "utf8");
  document.head.append(css);
  try {
    for (const [chapter, scene] of [
      ...[1, 0, 2, 3].map((i) => ["academy", i]),
      ...[0, 1, 2, 3, 4].map((i) => ["fugitive", i]),
      ...[0, 1, 2, 3, 4].map((i) => ["protect", i]),
    ]) {
      location.hash = `#/read/${chapter}/${scene}`;
      const view = render(<App />);
      for (const shot of view.container.querySelectorAll<HTMLElement>(
        ".film-shot",
      )) {
        // Decorative classes have their own size, perspective, and animation;
        // none may ever be attached to the full-frame container.
        expect(
          shot.matches(".film-ink,.film-science,.film-curtain,.film-letter"),
        ).toBe(false);
        const style = getComputedStyle(shot);
        expect(style.position).toBe("absolute");
        expect(["", "none"]).toContain(style.transform);
        expect(["", "none"]).toContain(style.animationName);
        expect(style.width).toBe("100%");
        expect(style.height).toBe("100%");
      }
      view.unmount();
    }
  } finally {
    css.remove();
  }
});

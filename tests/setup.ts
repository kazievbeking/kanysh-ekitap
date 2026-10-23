import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
const playing = new WeakSet<HTMLMediaElement>();
Object.defineProperty(HTMLMediaElement.prototype, "paused", {
  configurable: true,
  get() {
    return !playing.has(this);
  },
});
Object.defineProperty(HTMLMediaElement.prototype, "play", {
  configurable: true,
  value: vi.fn(function (this: HTMLMediaElement) {
    playing.add(this);
    this.dispatchEvent(new Event("play"));
    return Promise.resolve();
  }),
});
Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  configurable: true,
  value: vi.fn(function (this: HTMLMediaElement) {
    playing.delete(this);
    this.dispatchEvent(new Event("pause"));
  }),
});
Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
  configurable: true,
  value: function () {
    this.setAttribute("open", "");
  },
});
Object.defineProperty(HTMLDialogElement.prototype, "close", {
  configurable: true,
  value: function () {
    this.removeAttribute("open");
  },
});
window.scrollTo = vi.fn();
// jsdom has no GPU: the default exercises the intact-image fallback.
Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  configurable: true,
  value: vi.fn(() => null),
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
  location.hash = "";
});

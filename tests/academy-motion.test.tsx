import { render, fireEvent, act } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import { LivingIllustration } from "../src/components/LivingIllustration";
import { handPose, usesLivingIllustration } from "../src/data/academyMotion";
import { storyboards } from "../src/data/storyboards";
import { App } from "../src/App";

it("қол қимылы шағын, қайталанатын және тиісті суреттермен шектелген", () => {
  for (const image of ["ceremony", "scholars"]) {
    for (let time = 0; time < 240; time += 0.25) {
      const pose = handPose(image, time)!;
      expect(Math.abs(pose.angle)).toBeLessThan(0.019);
      expect(pose.shift.every((v) => Math.abs(v) <= 0.0012)).toBe(true);
      expect(handPose(image, time)).toEqual(pose);
    }
  }
  for (const [id, shots] of Object.entries(storyboards)) {
    for (const shot of shots)
      if (id.startsWith("fugitive-"))
        expect(usesLivingIllustration(id, shot)).toBe(
          ["evening", "warning", "support"].includes(shot.image),
        );
  }
});

it("GPU болмаса бастапқы сурет сақталып, бос кенеп көрсетілмейді", () => {
  location.hash = "#/read/academy/3";
  const view = render(<App />);
  expect(
    view.container.querySelector(".film-backdrop")?.getAttribute("src"),
  ).toContain("ceremony.webp");
  expect(view.container.querySelector("canvas[data-ready]")).toBeNull();
  expect(view.container.querySelectorAll(".academy-details").length).toBe(
    storyboards["academy-04"].length,
  );
});

it("қол қозғалысы аудио уақытымен салынып, контекст жоғалса суретке оралады", () => {
  const gl = {
    createShader: vi.fn(() => ({})),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn(() => true),
    deleteShader: vi.fn(),
    createProgram: vi.fn(() => ({})),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn(() => true),
    useProgram: vi.fn(),
    deleteProgram: vi.fn(),
    createBuffer: vi.fn(() => ({})),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    deleteBuffer: vi.fn(),
    getUniformLocation: vi.fn((_: unknown, name: string) => name),
    createTexture: vi.fn(() => ({})),
    bindTexture: vi.fn(),
    texParameteri: vi.fn(),
    uniform1i: vi.fn(),
    texImage2D: vi.fn(),
    deleteTexture: vi.fn(),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    uniform2fv: vi.fn(),
    drawArrays: vi.fn(),
    viewport: vi.fn(),
    isContextLost: vi.fn(() => false),
  };
  const request = vi.spyOn(window, "requestAnimationFrame");
  const context = vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockReturnValue(gl as unknown as WebGLRenderingContext);
  let picture: {
    onload: null | (() => void);
    width: number;
    height: number;
    src: string;
  };
  class TestImage {
    onload = null;
    width = 1536;
    height = 1024;
    src = "";
    constructor() {
      picture = this;
    }
  }
  vi.stubGlobal("Image", TestImage);
  const rect = vi
    .spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect")
    .mockReturnValue({ width: 960, height: 600 } as DOMRect);
  const cw = vi
    .spyOn(HTMLCanvasElement.prototype, "clientWidth", "get")
    .mockReturnValue(960);
  const ch = vi
    .spyOn(HTMLCanvasElement.prototype, "clientHeight", "get")
    .mockReturnValue(600);
  try {
    const view = render(
      <LivingIllustration
        src="images/ceremony.webp"
        image="ceremony"
        focus="64% 45%"
      />,
    );
    const canvas = view.container.querySelector("canvas")!;
    act(() => picture!.onload!());
    expect(canvas.dataset.ready).toBe("true");
    fireEvent(canvas, new CustomEvent("film-time", { detail: 15 }));
    expect(gl.uniform1f).toHaveBeenCalledWith(
      "angle",
      handPose("ceremony", 15)!.angle,
    );
    expect(request).not.toHaveBeenCalled(); // The parent audio clock drives every frame.
    fireEvent(canvas, new CustomEvent("film-time", { detail: 2 }));
    expect(gl.uniform1f).toHaveBeenCalledWith(
      "angle",
      handPose("ceremony", 2)!.angle,
    );
    fireEvent(canvas, new Event("webglcontextlost", { cancelable: true }));
    expect(canvas.dataset.ready).toBeUndefined();
    view.unmount();
    expect(gl.deleteTexture).toHaveBeenCalled();
    expect(gl.deleteBuffer).toHaveBeenCalled();
  } finally {
    request.mockRestore();
    context.mockRestore();
    rect.mockRestore();
    cw.mockRestore();
    ch.mockRestore();
    vi.unstubAllGlobals();
  }
});

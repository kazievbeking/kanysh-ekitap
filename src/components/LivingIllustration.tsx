import { useEffect, useRef } from "react";
import { handPose } from "../data/academyMotion";

const vertex = `attribute vec2 position;
varying vec2 screenUV;
void main(){screenUV=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const fragment = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 screenUV;
uniform sampler2D illustration;
uniform vec2 cropScale, cropOffset, center, radius, pivot, shift;
uniform float angle, aspect;
void main(){
 vec2 uv=vec2(screenUV.x,1.-screenUV.y)*cropScale+cropOffset;
 vec2 relative=(uv-center)/radius;
 float weight=1.-smoothstep(.35,1.,length(relative));
 vec2 point=(uv-pivot)*vec2(aspect,1.);
 float a=-angle*weight;
 mat2 rotation=mat2(cos(a),sin(a),-sin(a),cos(a));
 vec2 moved=(rotation*point)/vec2(aspect,1.)+pivot-shift*weight;
 gl_FragColor=texture2D(illustration,clamp(moved,vec2(0.),vec2(1.)));
}`;

// Render from the original texture on every sampled audio time. No cumulative
// warping, separate playback clock, cut-out edges, or changes to facial features.
export function LivingIllustration({
  src,
  image,
  focus,
}: {
  src: string;
  image: string;
  focus: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        preserveDrawingBuffer: false,
      });
    } catch {
      return;
    }
    if (!gl) return;
    const context = gl;
    const compile = (type: number, source: string) => {
      const shader = context.createShader(type)!;
      context.shaderSource(shader, source);
      context.compileShader(shader);
      if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
        context.deleteShader(shader);
        return null;
      }
      return shader;
    };
    const vs = compile(context.VERTEX_SHADER, vertex),
      fs = compile(context.FRAGMENT_SHADER, fragment);
    if (!vs || !fs) {
      if (vs) context.deleteShader(vs);
      if (fs) context.deleteShader(fs);
      return;
    }
    const program = context.createProgram()!;
    context.attachShader(program, vs);
    context.attachShader(program, fs);
    context.linkProgram(program);
    if (!context.getProgramParameter(program, context.LINK_STATUS)) {
      context.deleteProgram(program);
      context.deleteShader(vs);
      context.deleteShader(fs);
      return;
    }
    context.useProgram(program);
    const buffer = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      context.STATIC_DRAW,
    );
    const position = context.getAttribLocation(program, "position");
    context.enableVertexAttribArray(position);
    context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0);
    const uniforms = Object.fromEntries(
      [
        "cropScale",
        "cropOffset",
        "center",
        "radius",
        "pivot",
        "shift",
        "angle",
        "aspect",
        "illustration",
      ].map((name) => [name, context.getUniformLocation(program, name)]),
    );
    const texture = context.createTexture();
    context.bindTexture(context.TEXTURE_2D, texture);
    context.texParameteri(
      context.TEXTURE_2D,
      context.TEXTURE_MIN_FILTER,
      context.LINEAR,
    );
    context.texParameteri(
      context.TEXTURE_2D,
      context.TEXTURE_MAG_FILTER,
      context.LINEAR,
    );
    context.texParameteri(
      context.TEXTURE_2D,
      context.TEXTURE_WRAP_S,
      context.CLAMP_TO_EDGE,
    );
    context.texParameteri(
      context.TEXTURE_2D,
      context.TEXTURE_WRAP_T,
      context.CLAMP_TO_EDGE,
    );
    context.uniform1i(uniforms.illustration, 0);
    const picture = new Image();
    let ready = false,
      disposed = false;
    let time =
      Number(
        canvas
          .closest<HTMLElement>(".film-stage")
          ?.style.getPropertyValue("--elapsed"),
      ) || 0;
    function draw() {
      if (!ready || disposed || context.isContextLost()) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(canvas.clientWidth * ratio)),
        height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      context.viewport(0, 0, width, height);
      const cover = Math.max(width / picture.width, height / picture.height);
      const sx = width / (picture.width * cover),
        sy = height / (picture.height * cover);
      const [fx, fy] = focus.split(" ").map((v) => parseFloat(v) / 100);
      context.uniform2f(uniforms.cropScale, sx, sy);
      context.uniform2f(
        uniforms.cropOffset,
        (1 - sx) * (fx ?? 0.5),
        (1 - sy) * (fy ?? 0.5),
      );
      const pose = handPose(image, time)!;
      context.uniform2fv(uniforms.center, pose.center);
      context.uniform2fv(uniforms.radius, pose.radius);
      context.uniform2fv(uniforms.pivot, pose.pivot);
      context.uniform2fv(uniforms.shift, pose.shift);
      context.uniform1f(uniforms.angle, pose.angle);
      context.uniform1f(uniforms.aspect, picture.width / picture.height);
      context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
      canvas.dataset.ready = "true";
    }
    const onTime = (event: Event) => {
      time = (event as CustomEvent<number>).detail;
      draw();
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      delete canvas.dataset.ready;
    };
    canvas.addEventListener("film-time", onTime);
    canvas.addEventListener("webglcontextlost", onLost);
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(draw) : null;
    observer?.observe(canvas);
    picture.onload = () => {
      if (disposed) return;
      context.bindTexture(context.TEXTURE_2D, texture);
      context.texImage2D(
        context.TEXTURE_2D,
        0,
        context.RGBA,
        context.RGBA,
        context.UNSIGNED_BYTE,
        picture,
      );
      ready = true;
      time =
        Number(
          canvas
            .closest<HTMLElement>(".film-stage")
            ?.style.getPropertyValue("--elapsed"),
        ) || 0;
      draw();
    };
    picture.src = src;
    return () => {
      disposed = true;
      picture.onload = null;
      canvas.removeEventListener("film-time", onTime);
      canvas.removeEventListener("webglcontextlost", onLost);
      observer?.disconnect();
      delete canvas.dataset.ready;
      context.deleteTexture(texture);
      context.deleteBuffer(buffer);
      context.deleteProgram(program);
      context.deleteShader(vs);
      context.deleteShader(fs);
    };
  }, [src, image, focus]);
  return (
    <canvas
      ref={ref}
      className="film-living-illustration"
      data-image={image}
      aria-hidden="true"
    />
  );
}

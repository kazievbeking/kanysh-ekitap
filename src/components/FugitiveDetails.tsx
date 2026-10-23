import { illustrationCrop } from "../data/illustrationCrop";
import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties } from "react";

const sizes: Record<string, [number, number]> = {
  evening: [1536, 1024],
  warning: [1600, 900],
  train: [1536, 1024],
  station: [1600, 900],
  support: [1536, 1024],
  manuscript: [1600, 900],
};

// The SVG uses exactly the same cover crop and focal point as the source image.
// Window effects therefore stay behind the glass on both phones and desktops.
export function FugitiveDetails({
  image,
  focus,
}: {
  image: string;
  focus: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [width, height] = sizes[image] ?? [1600, 900];
  const [box, setBox] = useState(`0 0 ${width} ${height}`);
  const id = `journey-window-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  useEffect(() => {
    const svg = ref.current!;
    function resize() {
      const w = svg.clientWidth,
        h = svg.clientHeight;
      if (!w || !h) return;
      const crop = illustrationCrop(width, height, w, h, focus);
      setBox(`${crop.x} ${crop.y} ${crop.width} ${crop.height}`);
    }
    resize();
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    observer?.observe(svg);
    window.addEventListener("resize", resize);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [width, height, focus]);
  return (
    <svg
      ref={ref}
      className={`fugitive-details fugitive-details-${image}`}
      viewBox={box}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {image === "evening" && (
        <>
          <ellipse
            className="fugitive-lamp-glow"
            cx="100"
            cy="540"
            rx="230"
            ry="200"
            fill="#e6ab4c"
          />
          <g
            className="fugitive-tea-steam"
            fill="none"
            stroke="#e8ddc3"
            strokeWidth="4"
            strokeLinecap="round"
          >
            <path d="M635 690q-15-24 0-42t0-40" />
            <path d="M657 687q14-21 0-39t0-34" />
          </g>
          <path
            className="fugitive-room-curtain"
            d="M1115 10q-25 200 0 400t0 175"
            fill="none"
            stroke="#d2bc8f"
            strokeWidth="18"
          />
        </>
      )}
      {image === "warning" && (
        <>
          <ellipse
            className="fugitive-lamp-glow"
            cx="1500"
            cy="440"
            rx="170"
            ry="180"
            fill="#efd497"
          />
          <path
            className="fugitive-paper-light"
            d="M466 486 683 520 673 593"
            fill="none"
            stroke="#fff0cb"
            strokeWidth="3"
          />
        </>
      )}
      {image === "train" && (
        <>
          <defs>
            <clipPath id={id}>
              <path d="M1080 160 1536 10V790L1080 675Z" />
            </clipPath>
          </defs>
          <g clipPath={`url(#${id})`}>
            <g className="fugitive-window-reflection" fill="#ffe5b5">
              <path d="m980 0 130 0 300 1024h-130Z" opacity=".12" />
              <path d="m1240 0 40 0 300 1024h-40Z" opacity=".08" />
            </g>
            <g
              className="fugitive-window-poles"
              stroke="#494a39"
              strokeWidth="7"
              opacity=".3"
            >
              <path d="M1510 350v520m-32-455h64" />
              <path d="M1850 320v550m-32-455h64" />
            </g>
            <g
              className="fugitive-window-vapor"
              fill="none"
              stroke="#eee3cd"
              strokeWidth="24"
              strokeLinecap="round"
            >
              <path d="M1350 575q-40-55 0-100t-5-105" />
              <path d="M1440 590q-35-70 4-110t0-85" />
            </g>
          </g>
        </>
      )}
      {(image === "station" || image === "support") && (
        <>
          <g
            className="fugitive-platform-vapor"
            fill="none"
            stroke="#efe6d4"
            strokeWidth="28"
            strokeLinecap="round"
          >
            <path
              d={
                image === "station"
                  ? "M1250 560q-40-80 5-135t0-105"
                  : "M1150 340q-40-70 0-125t0-100"
              }
            />
            <path
              d={
                image === "station"
                  ? "M1390 540q-20-60 5-100t0-100"
                  : "M1250 330q-30-80 0-135t0-80"
              }
            />
          </g>
          <ellipse
            className="fugitive-platform-light"
            cx={image === "station" ? 1400 : 450}
            cy="740"
            rx="260"
            ry="45"
            fill="#f3d197"
          />
        </>
      )}
      {image === "manuscript" && (
        <path
          className="fugitive-paper-light"
          d="M950 600q120-20 260 30"
          fill="none"
          stroke="#f5dfb5"
          strokeWidth="4"
        />
      )}
      {Array.from({ length: 5 }, (_, i) => (
        <circle
          key={i}
          className="fugitive-drift"
          cx={130 + i * 290}
          cy={180 + (i % 3) * 180}
          r="1.8"
          fill="#f4dec0"
          style={{ "--drift": i } as CSSProperties}
        />
      ))}
    </svg>
  );
}

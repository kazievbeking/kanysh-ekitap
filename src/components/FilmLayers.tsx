import { useId } from "react";
import type { CSSProperties } from "react";
import type { FilmEffect } from "../data/storyboards";

export function FilmLayers({ effect }: { effect: FilmEffect }) {
  const id = useId().replace(/:/g, "");
  const rail =
    effect === "departure" || effect === "journey" || effect === "arrival";
  return (
    <div className={`film-effects effects-${effect}`} aria-hidden="true">
      <div className="film-light" />
      <div className="film-atmosphere" />
      {Array.from({ length: 14 }, (_, i) => (
        <i
          className="film-mote"
          key={i}
          style={
            {
              "--i": i,
              "--x": `${(i * 37 + 13) % 100}%`,
              "--y": `${(i * 23 + 9) % 95}%`,
              "--cycle": `${8 + (i % 5) * 2}s`,
              "--phase": `${i * 0.73}s`,
            } as CSSProperties
          }
        />
      ))}
      {(effect === "sunlight" || effect === "wind") && (
        <>
          <div className="film-cloud cloud-one" />
          <div className="film-cloud cloud-two" />
          <svg className="film-birds" viewBox="0 0 400 140">
            <g className="bird-flight">
              <path
                d="M30 45q10-12 20 0q10-12 20 0M140 70q8-10 16 0q8-10 16 0M225 32q12-14 24 0q12-14 24 0"
                fill="none"
                stroke="#343e33"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          </svg>
          <div className="film-grass">
            {Array.from({ length: 15 }, (_, i) => (
              <i
                key={i}
                style={{ "--i": i, left: `${i * 7}%` } as CSSProperties}
              />
            ))}
          </div>
        </>
      )}
      {(effect === "ink" || effect === "science") && (
        <>
          <svg className="film-ink" viewBox="0 0 600 260">
            <g fill="none" stroke="#453522" strokeWidth="1.7" opacity=".8">
              {[0, 1, 2, 3, 4].map((i) => (
                <path
                  key={i}
                  className="ink-stroke"
                  pathLength="1"
                  style={{ "--row": i } as CSSProperties}
                  d={`M70 ${65 + i * 32}q20 -20 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0`}
                />
              ))}
            </g>
          </svg>
          <svg
            className="film-science"
            viewBox="0 0 300 300"
            fill="none"
            stroke="#e4d4ad"
            strokeWidth="1"
          >
            <g className="science-orbit">
              <ellipse cx="150" cy="150" rx="110" ry="45" />
              <ellipse
                cx="150"
                cy="150"
                rx="110"
                ry="45"
                transform="rotate(60 150 150)"
              />
              <ellipse
                cx="150"
                cy="150"
                rx="110"
                ry="45"
                transform="rotate(120 150 150)"
              />
              <circle cx="150" cy="150" r="8" fill="#e4d4ad" />
              <circle cx="260" cy="150" r="5" fill="#d4ab6d" />
            </g>
          </svg>
        </>
      )}
      {effect === "curtain" && (
        <>
          <div className="film-curtain curtain-left" />
          <div className="film-curtain curtain-right" />
          <div className="stage-spotlight" />
          <div className="stage-spotlight spotlight-second" />
        </>
      )}
      {effect === "lamplight" && (
        <>
          <div className="lamp-pool" />
          <div className="window-shadow" />
          <svg className="film-clock" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="#392f25"
              stroke="#b29a70"
              strokeWidth="3"
            />
            {Array.from({ length: 12 }, (_, i) => (
              <path
                key={i}
                d="M50 10v5"
                stroke="#bfa77d"
                transform={`rotate(${i * 30} 50 50)`}
              />
            ))}
            <path
              className="clock-minute"
              d="M50 50V18"
              stroke="#dbcba7"
              strokeWidth="2"
            />
            <path
              className="clock-hour"
              d="M50 50l-18 8"
              stroke="#dbcba7"
              strokeWidth="3"
            />
            <circle cx="50" cy="50" r="3" fill="#bba37b" />
          </svg>
        </>
      )}
      {effect === "letter" && (
        <svg className="film-letter" viewBox="0 0 420 290">
          <defs>
            <linearGradient id={`paper-${id}`} x2="0" y2="1">
              <stop stopColor="#f0dfba" />
              <stop offset="1" stopColor="#c7ad7e" />
            </linearGradient>
          </defs>
          <g className="letter-envelope">
            <rect
              x="25"
              y="70"
              width="290"
              height="175"
              rx="3"
              fill={`url(#paper-${id})`}
              stroke="#ab8d5b"
            />
            <path
              d="m25 245 145-105 145 105M25 70l145 110L315 70"
              fill="none"
              stroke="#ae9368"
              strokeWidth="2"
            />
            <g className="envelope-flap">
              <path
                d="M25 70 170 180 315 70Z"
                fill="#dac59c"
                stroke="#aa8b5d"
              />
            </g>
            <circle cx="170" cy="157" r="12" fill="#794b34" />
          </g>
          <g className="letter-ticket">
            <rect
              x="200"
              y="37"
              width="190"
              height="85"
              rx="4"
              fill="#e2d0a6"
              stroke="#9c825c"
            />
            <path d="M338 42v75" stroke="#998160" strokeDasharray="3 3" />
            <path
              d="M219 60h95M219 74h72M219 88h86"
              stroke="#8c7b5e"
              strokeWidth="3"
              opacity=".65"
            />
          </g>
        </svg>
      )}
      {rail && (
        <>
          <div className="film-track" />
          <div className="film-steam">
            {Array.from({ length: 9 }, (_, i) => (
              <i key={i} style={{ "--i": i } as CSSProperties} />
            ))}
          </div>
          <VintageTrain />
          <div className="passing-poles">
            <i />
            <i />
            <i />
          </div>
        </>
      )}
      {effect === "arrival" && <div className="arrival-glow" />}
    </div>
  );
}

function VintageTrain() {
  const gradient = useId().replace(/:/g, "");
  return (
    <svg className="animated-train" viewBox="0 0 1480 250">
      <defs>
        <linearGradient id={gradient} x2="0" y2="1">
          <stop stopColor="#444d39" />
          <stop offset=".5" stopColor="#29372d" />
          <stop offset="1" stopColor="#18231e" />
        </linearGradient>
      </defs>
      <g className="train-carriage">
        <path
          d="M365 45q0-17 18-17h620q18 0 18 17v140H365Z"
          fill={`url(#${gradient})`}
          stroke="#9e9477"
          strokeWidth="2"
        />
        <path d="M359 43q0-24 25-24h620q22 0 22 24Z" fill="#32382e" />
        <path d="M366 141h655M366 153h655" stroke="#a28b57" strokeWidth="2" />
        {Array.from({ length: 10 }, (_, i) => (
          <g key={i}>
            <rect
              x={393 + i * 59}
              y="57"
              width="38"
              height="52"
              rx="2"
              fill="#d0bd8f"
              stroke="#151d17"
              strokeWidth="5"
            />
            <path
              d={`M${412 + i * 59} 60v46`}
              stroke="#394136"
              strokeWidth="2"
            />
          </g>
        ))}
        <rect
          x="945"
          y="52"
          width="47"
          height="122"
          fill="#243229"
          stroke="#a19672"
        />
        <rect x="954" y="64" width="28" height="44" fill="#c5b18a" />
        <path d="M368 182h650" stroke="#171c18" strokeWidth="12" />
        <path
          d="M1030 65h35v103h-35M1036 68v94M1055 68v94"
          fill="#3e3d32"
          stroke="#171b16"
          strokeWidth="5"
        />
        <g className="second-car">
          <path
            d="M1065 45q0-17 18-17h395v157h-413Z"
            fill={`url(#${gradient})`}
            stroke="#958869"
          />
          <path d="M1060 43q0-24 25-24h395v24Z" fill="#32382e" />
          {Array.from({ length: 6 }, (_, i) => (
            <rect
              key={i}
              x={1090 + i * 59}
              y="57"
              width="38"
              height="52"
              fill="#d0bd8f"
              stroke="#151d17"
              strokeWidth="5"
            />
          ))}
          <path d="M1065 143h415" stroke="#a28b57" strokeWidth="2" />
        </g>
      </g>
      <g className="train-engine">
        {Array.from({ length: 7 }, (_, i) => (
          <circle
            className="engine-vapor"
            key={i}
            cx="75"
            cy="35"
            r="21"
            style={{ "--i": i } as CSSProperties}
          />
        ))}
        <path
          d="M55 97h215v73H55Z"
          fill="#27362d"
          stroke="#aca07e"
          strokeWidth="2"
        />
        <path d="M27 161h276l31 26H12Z" fill="#33372a" stroke="#99825b" />
        <path
          d="M63 97V59h23v38M123 97V75h28v22"
          fill="#2d3128"
          stroke="#aaa07e"
          strokeWidth="2"
        />
        <rect
          x="238"
          y="57"
          width="77"
          height="118"
          fill="#28392d"
          stroke="#a59a75"
          strokeWidth="2"
        />
        <path d="M227 57h100l-8-15h-84Z" fill="#35382c" />
        <rect
          x="257"
          y="72"
          width="42"
          height="43"
          fill="#cdbd92"
          stroke="#18251c"
          strokeWidth="5"
        />
        <path d="M317 99h43v76h-43" fill="#2f3b2f" stroke="#9d8d68" />
        <circle cx="49" cy="120" r="15" fill="#d8c79a" />
        <path d="M13 176 0 200h38" fill="#4a332b" stroke="#a68d60" />
        <path d="M110 173h152" stroke="#8b8d76" strokeWidth="5" />
      </g>
      {[86, 151, 217, 397, 479, 895, 977, 1100, 1182, 1395, 1460].map(
        (x, i) => (
          <g
            key={i}
            className="train-wheel"
            style={{ transformOrigin: `${x}px 190px` }}
          >
            <circle
              cx={x}
              cy="190"
              r={i < 3 ? 31 : 24}
              fill="#20271f"
              stroke="#ac9b76"
              strokeWidth="4"
            />
            <path
              d={`M${x - 20} 190h40M${x} 170v40m-15-35 30 30m-30 0 30-30`}
              stroke="#8b8d73"
              strokeWidth="2"
            />
            <circle cx={x} cy="190" r="6" fill="#c2b38b" />
          </g>
        ),
      )}
      <path
        className="train-piston"
        d="M86 190h131"
        stroke="#c1b48e"
        strokeWidth="7"
      />
    </svg>
  );
}

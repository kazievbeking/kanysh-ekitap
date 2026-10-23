import type { CSSProperties } from "react";

// Foreground accents are symbolic, without adding events to the narration.
export function AcademyDetails({ image }: { image: string }) {
  return (
    <div
      className={`academy-details academy-details-${image}`}
      aria-hidden="true"
    >
      {image === "academy" && (
        <>
          <div className="academy-sunwash" />
          <svg
            className="academy-leaves"
            viewBox="0 0 1000 600"
            preserveAspectRatio="none"
          >
            {Array.from({ length: 7 }, (_, i) => (
              <g
                className="academy-leaf"
                key={i}
                style={{ "--leaf": i } as CSSProperties}
              >
                <path
                  d="M0 0Q-18-23 2-36Q21-17 0 0"
                  fill={i % 2 ? "#a28b42" : "#6c743b"}
                />
                <path d="M0 0 2-30" stroke="#514d2d" fill="none" />
              </g>
            ))}
          </svg>
        </>
      )}
      {image === "heritage" && <div className="academy-horizon-haze" />}
      {image === "scholars" && <div className="academy-window-light" />}
      {image === "ceremony" && (
        <>
          <div className="academy-hall-light" />
          <div className="academy-hall-light hall-light-two" />
        </>
      )}
      {image === "manuscript" && (
        <svg className="academy-notebook" viewBox="0 0 520 300">
          <g className="academy-paper">
            <path
              d="M34 40 443 23 490 246 63 279Z"
              fill="#ddc798"
              fillOpacity=".88"
              stroke="#9a8056"
            />
            <path
              d="M65 84 407 70M69 115 415 101M73 146 423 132M77 177 431 163M81 208 439 194M85 239 447 225"
              stroke="#947e57"
              opacity=".24"
            />
            <path
              className="academy-map-line"
              pathLength="1"
              d="M96 180q30-65 75-29t67-18 65-12 63-45"
              fill="none"
              stroke="#735432"
              strokeWidth="2.4"
            />
            <g className="academy-map-points" fill="#785331">
              <circle cx="96" cy="180" r="4" />
              <circle cx="171" cy="151" r="4" />
              <circle cx="238" cy="133" r="4" />
              <circle cx="303" cy="121" r="4" />
              <circle cx="366" cy="76" r="4" />
            </g>
            <path
              className="academy-page-corner"
              d="m443 23-20 44 30 0Z"
              fill="#f1dfb9"
              stroke="#b29a6e"
            />
          </g>
          <g className="academy-drawing-pencil">
            <path
              d="m331 82 55-59 7 7-55 59Z"
              fill="#a07a43"
              stroke="#533e27"
            />
            <path d="m331 82-5 11 12-4" fill="#d6b887" />
            <path d="m326 93 5-3" stroke="#42382a" strokeWidth="2" />
          </g>
        </svg>
      )}
    </div>
  );
}

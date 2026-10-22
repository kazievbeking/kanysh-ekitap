import { chapters, bibliography, asset } from "../data/book";
import type { Progress } from "../types";
import { Icon } from "./Icon";
export function Home({
  progress,
  onRead,
  onEncyclopedia,
}: {
  progress: Progress;
  onRead: (chapter: string, scene?: number) => void;
  onEncyclopedia: () => void;
}) {
  return (
    <section className="open-book home-book">
      <div className="paper-page introduction">
        <span className="eyebrow">ОТБАСЫ ХРЕСТОМАТИЯСЫ</span>
        <div className="ornament">✦</div>
        <h1>
          Қаныш<span>және</span>
          <em>ғылыми майдан</em>
        </h1>
        <div className="fine-rule" />
        <p className="authors">{bibliography.authors}</p>
        <p className="intro-copy">
          Қаныш Сәтбаевтың болмысы, өмір жолы мен ғылым жолындағы жанқиярлық
          ерліктері туралы кітап.
        </p>
        <p className="secondary-copy">
          Қазақ Ғылым академиясының тарихы, оның жетістіктері және Қаныштың
          жанындағы ғылыми майдан серіктері жайында.
        </p>
        <div className="imprint">
          {bibliography.city} · {bibliography.publisher}
          <br />
          {bibliography.year} · {bibliography.pages} бет
        </div>
        <span className="page-number">01</span>
      </div>
      <div className="paper-page table-of-contents">
        <span className="eyebrow">КІТАП ІШІНДЕ</span>
        <h2>Мазмұны</h2>
        <p className="section-description">
          Екі оқиға. Ғылым жолындағы бір тағдыр.
        </p>
        <div className="chapter-list">
          {chapters.map((c, i) => {
            const percent = progress.finishedChapters.includes(c.id)
              ? 100
              : Math.round(
                  ((progress.positions[c.id] ?? 0) / c.scenes.length) * 100,
                );
            return (
              <button
                className="chapter-card"
                key={c.id}
                onClick={() => onRead(c.id, progress.positions[c.id] ?? 0)}
              >
                <div className="chapter-thumb">
                  <img src={asset(`images/${c.scenes[0].image}.webp`)} alt="" />
                  <span>{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="chapter-info">
                  <span className="small-label">
                    {c.year} · {c.pages}-беттер
                  </span>
                  <h3>{c.title}</h3>
                  <p>{c.subtitle}</p>
                  <div className="chapter-progress">
                    <span style={{ width: `${percent}%` }} />
                  </div>
                  <span className="progress-caption">
                    {percent === 100
                      ? "Қаралды"
                      : percent > 0
                        ? `${percent}% қаралды`
                        : "Көруді бастау"}
                  </span>
                </div>
                <Icon name="ArrowRight" size={20} />
              </button>
            );
          })}
        </div>
        <button className="encyclopedia-link" onClick={onEncyclopedia}>
          <span>
            <Icon name="Library" size={21} />
            Энциклопедия
          </span>
          <Icon name="ArrowRight" size={19} />
        </button>
        <span className="page-number">02</span>
      </div>
    </section>
  );
}

import { useState } from "react";
import { Icon } from "./Icon";
import data from "../data/encyclopedia.json";
import "./encyclopedia.css";

export function Encyclopedia({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState("");
  const section = data.sections[selected];
  const normalized = query.trim().toLocaleLowerCase("kk");
  const entries = section.entries.filter((entry) =>
    [entry.chapter, entry.subsection, ...entry.paragraphs]
      .join(" ")
      .toLocaleLowerCase("kk")
      .includes(normalized),
  );
  return (
    <section className="encyclopedia">
      <button className="text-button" onClick={onBack}>
        <Icon name="ArrowLeft" />
        Мазмұнға оралу
      </button>
      <header className="encyclopedia-hero">
        <div>
          <span className="small-label">ЭНЦИКЛОПЕДИЯ · ТҰЛҒА ЖӘНЕ МҰРА</span>
          <h1>{data.title}</h1>
          <p className="encyclopedia-subtitle">{data.subtitle}</p>
          <p>
            Қаныш Сәтбаевтың тұлғасын төл сөздері, замандастарының пікірлері
            және халық даналығы арқылы таныңыз.
          </p>
          <div className="encyclopedia-facts">
            <span>
              <strong>3</strong> тақырыптық бөлім
            </span>
            <span>
              <strong>149</strong> тұжырымды ой*
            </span>
          </div>
          <small>Құрастырушы: {data.compiler} · Қызылорда, 2026</small>
        </div>
        <a
          href="images/encyclopedia-cover.webp"
          target="_blank"
          rel="noreferrer"
          aria-label="Жинақтың мұқабасын ашу"
        >
          <img
            src="images/encyclopedia-cover.webp"
            alt="Қаныш әлемі: даналық сөздер мен ғылыми ойлар жинағының мұқабасы"
          />
        </a>
      </header>
      <details className="encyclopedia-context">
        <summary>Жинақ туралы · Алғы сөз және зерттеудің маңызы</summary>
        <div>
          {data.front.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </details>
      <nav
        className="encyclopedia-sections"
        aria-label="Энциклопедия бөлімдері"
      >
        {data.sections.map((item, index) => (
          <button
            key={item.id}
            aria-pressed={selected === index}
            onClick={() => {
              setSelected(index);
              setQuery("");
            }}
          >
            <span className="encyclopedia-roman">
              {["I", "II", "III"][index]}
            </span>
            <strong>{item.title}</strong>
            <span>{item.description}</span>
            <small>
              {item.sourceCount} тұжырымды ой{" "}
              <Icon name="ArrowRight" size={16} />
            </small>
          </button>
        ))}
      </nav>
      <div className="encyclopedia-heading">
        <div>
          <span className="small-label">
            {["І", "ІІ", "ІІІ"][selected]} БӨЛІМ
          </span>
          <h2>{section.title}</h2>
          <p>{section.description}</p>
        </div>
        <label className="encyclopedia-search">
          Бөлімнен іздеу
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Сөз, есім немесе кітап беті…"
          />
        </label>
      </div>
      <blockquote className="encyclopedia-epigraph">
        <p>{section.epigraph}</p>
        <cite>Қаныш Имантайұлы Сәтбаев</cite>
      </blockquote>
      <p className="encyclopedia-result" role="status">
        {entries.length} тақырыптық карточка{normalized ? " табылды" : ""}
      </p>
      <div className="encyclopedia-entries">
        {entries.map((entry, index) => (
          <article
            className="encyclopedia-entry"
            key={`${selected}-${entry.chapter}-${index}`}
          >
            <header>
              <span className="encyclopedia-entry-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p>{entry.chapter}</p>
                {entry.subsection && <h3>{entry.subsection}</h3>}
              </div>
            </header>
            <div className="encyclopedia-quotes">
              {entry.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
      {!entries.length && (
        <div className="encyclopedia-empty">
          <Icon name="BookOpen" size={30} />
          <h3>Сәйкес жазба табылмады</h3>
          <p>Басқа сөзді іздеңіз немесе басқа бөлімді таңдаңыз.</p>
          <button className="text-button" onClick={() => setQuery("")}>
            Іздеуді тазарту
          </button>
        </div>
      )}
      <details className="encyclopedia-context">
        <summary>Қорытынды · Жинақ бойынша пікір</summary>
        <div>
          {data.closing.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </details>
      <footer className="encyclopedia-source">
        <Icon name="ScrollText" size={24} />
        <div>
          <strong>Дереккөз: «Қаныш әлемі» кітапшасы</strong>
          <p>
            Мәтіндер, авторлардың аттары мен бет нөмірлері берілген жинақ
            бойынша сақталды. Бет нөмірлері «Қаныш және ғылыми майдан» кітабына
            қатысты. *Сандық мәліметтер жинақтағы қорытынды кестелерден алынды;
            бір карточкада бірнеше ой болуы мүмкін.
          </p>
        </div>
      </footer>
    </section>
  );
}

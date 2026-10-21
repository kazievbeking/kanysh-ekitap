import { useState } from "react";
import { asset } from "../data/book";
import { Icon } from "./Icon";
export function Cover({
  onOpen,
  hasProgress,
  onResume,
}: {
  onOpen: () => void;
  hasProgress: boolean;
  onResume: () => void;
}) {
  const [opening, setOpening] = useState(false);
  function open() {
    setOpening(true);
    window.setTimeout(onOpen, 650);
  }
  return (
    <section
      className={`cover-stage ${opening ? "opening" : ""}`}
      aria-label="Кітап мұқабасы"
    >
      <div className="cover-intro">
        <span className="eyebrow">
          <span className="tiny-line" />
          ЦИФРЛЫҚ КІТАПХАНА · 01
        </span>
        <h1>
          Бір ғұмыр. <br />
          Бір ұлттың <br />
          <em>ғылыми майданы.</em>
        </h1>
        <p>
          Қаныш Сәтбаевтың әлеміне қадам басыңыз. Кітапты оқып, тыңдап, тарихты
          жаңа қырынан таныңыз.
        </p>
        <button className="button primary" onClick={open} disabled={opening}>
          Кітапты ашу
          <Icon name="ArrowRight" size={19} />
        </button>
        {hasProgress && (
          <button className="resume-link" onClick={onResume}>
            <Icon name="Bookmark" size={16} />
            Оқуды жалғастыру
          </button>
        )}
        <div className="cover-features">
          <span>
            <Icon name="Headphones" size={17} />
            Аудиокітап
          </span>
          <span>
            <Icon name="BookOpen" size={17} />2 бөлім
          </span>
          <span>
            <Icon name="Lightbulb" size={17} />
            Интерактивті ойындар
          </span>
        </div>
      </div>
      <div className="book-display">
        <div className="book-shadow" />
        <div className="closed-book">
          <div className="book-spine">ҚАНЫШ ЖӘНЕ ҒЫЛЫМИ МАЙДАН</div>
          <div className="book-front">
            <img
              src={asset("images/portrait.webp")}
              alt="Қаныш Сәтбаевтың мұқабаға негізделген портреті"
            />
            <div className="cover-shade" />
            <div className="cover-frame" />
            <div className="cover-edition">ОТБАСЫ ХРЕСТОМАТИЯСЫ</div>
            <div className="cover-lettering">
              <span className="cover-name">ҚАНЫШ</span>
              <span className="cover-and">және</span>
              <span className="cover-title">ҒЫЛЫМИ МАЙДАН</span>
              <div className="cover-rule" />
              <span className="cover-authors">С. КЕРІМБАЙ · Ә. НӘБИ</span>
            </div>
          </div>
          <div className="book-pages" />
        </div>
        <span className="book-caption">
          <span>01 / 02</span>Тарихқа ашылған терезе
        </span>
      </div>
    </section>
  );
}

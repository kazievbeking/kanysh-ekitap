import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { BackgroundMusic } from "./BackgroundMusic";
export function BookShell({
  children,
  onContents,
  onHome,
  onSettings,
  reader = false,
  musicDucked = false,
  musicSuspended = false,
}: {
  children: ReactNode;
  onContents: () => void;
  onHome: () => void;
  onSettings: () => void;
  reader?: boolean;
  musicDucked?: boolean;
  musicSuspended?: boolean;
}) {
  return (
    <div className={`app-shell ${reader ? "reading" : ""}`}>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        Мазмұнға өту
      </a>
      <header className="site-header">
        <button
          className="wordmark"
          onClick={onHome}
          aria-label="Басты бетке оралу"
        >
          <span className="brand-icon">
            <Icon name="BookOpen" size={24} />
          </span>
          <span>
            ҚАНЫШ<span className="brand-sub">ИНТЕРАКТИВТІ КІТАП</span>
          </span>
        </button>
        <div className="header-center">Ғылымға арналған ғұмыр</div>
        <nav>
          <BackgroundMusic ducked={musicDucked} suspended={musicSuspended} />
          <button className="text-button contents-button" onClick={onContents}>
            <Icon name="Menu" size={18} />
            Мазмұны
          </button>
          <button
            className="icon-button"
            onClick={onSettings}
            aria-label="Баптаулар"
          >
            <Icon name="Settings2" size={19} />
          </button>
          <span className="language">ҚАЗ</span>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer">
        <span>«ОТБАСЫ ХРЕСТОМАТИЯСЫ» ЖОБАСЫ</span>
        <span>Оқы. Тыңда. Ойлан.</span>
        <span>ҚАНЫШ ЖӘНЕ ҒЫЛЫМИ МАЙДАН</span>
      </footer>
    </div>
  );
}

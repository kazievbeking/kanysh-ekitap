import { useEffect, useRef, useState } from "react";
import { BookShell } from "./components/BookShell";
import { Cover } from "./components/Cover";
import { Home } from "./components/Home";
import { Reader } from "./components/Reader";
import { Encyclopedia } from "./components/Encyclopedia";
import { Modal } from "./components/Modal";
import { Icon } from "./components/Icon";
import { chapters } from "./data/book";
import { loadProgress, saveProgress, freshProgress } from "./progress";
import type { Progress } from "./types";
type Route =
  | { page: "cover" | "home" | "encyclopedia" }
  | { page: "read"; chapter: string; scene: number };
function parseRoute(): Route {
  const [, page, c, s] = location.hash.split("/");
  if (page === "read") {
    const chapter = chapters.find((x) => x.id === c);
    if (chapter)
      return {
        page: "read",
        chapter: c,
        scene: Math.max(
          0,
          Math.min(chapter.scenes.length - 1, Math.floor(Number(s)) || 0),
        ),
      };
  }
  return { page: page === "home" || page === "encyclopedia" ? page : "cover" };
}
export function App() {
  const [progress, setProgress] = useState(loadProgress),
    [route, setRoute] = useState(parseRoute),
    [settings, setSettings] = useState(false),
    [reset, setReset] = useState(false),
    [storageError, setStorageError] = useState(false);
  const [readerSound, setReaderSound] = useState({
    playing: false,
    game: false,
  });
  const latest = useRef(progress);
  latest.current = progress;
  useEffect(() => {
    const handler = () => setRoute(parseRoute());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  useEffect(() => {
    const handler = () => saveProgress(latest.current);
    window.addEventListener("pagehide", handler);
    return () => window.removeEventListener("pagehide", handler);
  }, []);
  useEffect(() => {
    setStorageError(!saveProgress(progress));
    document.documentElement.dataset.reducedMotion = String(
      progress.reducedMotion,
    );
  }, [progress]);
  useEffect(() => {
    if (route.page === "read")
      setProgress((p) => ({
        ...p,
        chapter: route.chapter,
        scene: route.scene,
        positions: {
          ...p.positions,
          [route.chapter]: Math.max(
            p.positions[route.chapter] ?? 0,
            route.scene,
          ),
        },
      }));
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [route]);
  function navigate(hash: string) {
    if (location.hash === hash) setRoute(parseRoute());
    else location.hash = hash;
  }
  function update(patch: Partial<Progress>) {
    setProgress((p) => ({ ...p, ...patch }));
  }
  function read(chapter: string, scene = 0) {
    navigate(`#/read/${chapter}/${scene}`);
  }
  const activeChapter =
    route.page === "read"
      ? chapters.find((c) => c.id === route.chapter)!
      : null;
  return (
    <BookShell
      reader={route.page === "read"}
      musicDucked={readerSound.playing}
      musicSuspended={
        readerSound.game || settings || route.page === "encyclopedia"
      }
      onHome={() => navigate("#/cover")}
      onContents={() => navigate("#/home")}
      onSettings={() => setSettings(true)}
    >
      {route.page === "cover" ? (
        <Cover
          onOpen={() => navigate("#/home")}
          onResume={() => read(progress.chapter, progress.scene)}
          hasProgress={Object.keys(progress.positions).length > 0}
        />
      ) : route.page === "home" ? (
        <Home
          progress={progress}
          onRead={read}
          onEncyclopedia={() => navigate("#/encyclopedia")}
        />
      ) : route.page === "encyclopedia" ? (
        <Encyclopedia onBack={() => navigate("#/home")} />
      ) : (
        route.page === "read" &&
        activeChapter && (
          <Reader
            onSoundState={setReaderSound}
            key={activeChapter.id}
            chapter={activeChapter}
            index={route.scene}
            progress={progress}
            onMove={(i) => {
              setProgress((p) => {
                const audioTimes = { ...p.audioTimes };
                delete audioTimes[activeChapter.scenes[i].id];
                return { ...p, audioTimes };
              });
              read(activeChapter.id, i);
            }}
            onCompleteGame={(id) =>
              setProgress((p) => ({
                ...p,
                completedGames: [...new Set([...p.completedGames, id])],
              }))
            }
            onVolume={(volume) => update({ volume })}
            onTime={(scene, time) =>
              setProgress((p) => ({
                ...p,
                audioTimes: { ...p.audioTimes, [scene]: time },
              }))
            }
            onFinish={() =>
              setProgress((p) => ({
                ...p,
                finishedChapters: [
                  ...new Set([...p.finishedChapters, activeChapter.id]),
                ],
              }))
            }
            onContents={() => navigate("#/home")}
          />
        )
      )}{" "}
      {storageError && (
        <div className="storage-warning" role="status">
          Браузер сақтау мүмкіндігін бұғаттады. Оқу барысы бет жабылғанша
          сақталады.
        </div>
      )}
      {settings && (
        <Modal
          title="БАПТАУЛАР"
          onClose={() => {
            setSettings(false);
            setReset(false);
          }}
        >
          <h2>Оқуды өзіңізге бейімдеңіз</h2>
          <label className="setting-row">
            <span>
              Қозғалысты азайту
              <small>Анимациялар мен баяу жақындауды өшіру</small>
            </span>
            <input
              type="checkbox"
              checked={progress.reducedMotion}
              onChange={(e) => update({ reducedMotion: e.target.checked })}
            />
          </label>
          <p className="setting-help">
            Құрылғының қозғалысты азайту баптауы да ескеріледі.
          </p>
          <div className="setting-row">
            <span>
              Оқу барысы<small>Осы браузерде ғана сақталады</small>
            </span>
            <Icon name="Bookmark" />
          </div>
          {!reset ? (
            <button
              className="text-button reset-button"
              onClick={() => setReset(true)}
            >
              <Icon name="RotateCcw" size={17} />
              Басынан бастау
            </button>
          ) : (
            <div className="reset-confirm">
              <p>Оқу барысы мен орындалған ойындар тазалансын ба?</p>
              <button
                className="button primary"
                onClick={() => {
                  setProgress(freshProgress());
                  setSettings(false);
                  setReset(false);
                  navigate("#/cover");
                }}
              >
                Иә, басынан бастау
              </button>
              <button className="text-button" onClick={() => setReset(false)}>
                Болдырмау
              </button>
            </div>
          )}
        </Modal>
      )}
    </BookShell>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import type { Chapter, Progress, AudioSegment } from "../types";
import { AnimatedStory } from "./AnimatedStory";
import manifest from "../data/audio-manifest.json";
import { AudioControls } from "./AudioControls";
import type { AudioHandle } from "./AudioControls";
import { Icon } from "./Icon";
import { Modal } from "./Modal";
import { Game } from "./Games";
import { gameDetails } from "../data/games";
export function Reader({
  chapter,
  index,
  progress,
  onMove,
  onCompleteGame,
  onVolume,
  onTime,
  onFinish,
  onContents,
  onSoundState,
}: {
  chapter: Chapter;
  index: number;
  progress: Progress;
  onMove: (i: number) => void;
  onCompleteGame: (id: string) => void;
  onVolume: (n: number) => void;
  onTime: (scene: string, time: number) => void;
  onFinish: () => void;
  onContents: () => void;
  onSoundState: (state: { playing: boolean; game: boolean }) => void;
}) {
  const scene = chapter.scenes[index],
    audio = useRef<AudioHandle>(null),
    resume = useRef(false),
    gameAdvance = useRef(true);
  const [playing, setPlaying] = useState(false),
    [game, setGame] = useState<string | null>(null),
    [autoPlay, setAutoPlay] = useState(false),
    [ended, setEnded] = useState(false),
    [taskList, setTaskList] = useState(false);
  const segment = (manifest.segments as Record<string, AudioSegment>)[scene.id];
  const getElapsed = useCallback(
    () =>
      Math.max(
        0,
        (audio.current?.getTime() ?? segment?.start ?? 0) -
          (segment?.start ?? 0),
      ),
    [segment],
  );
  useEffect(() => {
    onSoundState({ playing, game: !!game || ended || taskList });
  }, [playing, game, ended, taskList, onSoundState]);
  useEffect(
    () => () => onSoundState({ playing: false, game: false }),
    [onSoundState],
  );
  function move(next: number, play = false) {
    audio.current?.pause();
    setAutoPlay(play);
    setEnded(false);
    onMove(next);
  }
  function next(fromAudio = false) {
    if (scene.gameAfter && !progress.completedGames.includes(scene.gameAfter)) {
      gameAdvance.current = true;
      resume.current = fromAudio || !!audio.current?.isPlaying();
      audio.current?.pause();
      setGame(scene.gameAfter);
      return;
    }
    if (index < chapter.scenes.length - 1)
      move(index + 1, fromAudio || !!audio.current?.isPlaying());
    else {
      audio.current?.pause();
      setEnded(true);
      onFinish();
    }
  }
  return (
    <section className="reader cinema-reader">
      <div className="reader-toolbar">
        <button className="text-button" onClick={onContents}>
          <Icon name="ArrowLeft" size={17} />
          Мазмұны
        </button>
        <span>{chapter.title}</span>
        <button
          className="text-button"
          onClick={() => {
            resume.current = !!audio.current?.isPlaying();
            audio.current?.pause();
            setTaskList(true);
          }}
        >
          <Icon name="Lightbulb" size={17} />
          Тапсырмалар
        </button>
      </div>
      <div className="open-book reader-book">
        <AnimatedStory
          key={scene.id}
          scene={scene}
          duration={segment ? segment.end - segment.start : 40}
          elapsed={Math.max(
            0,
            (progress.audioTimes[scene.id] ?? segment?.start ?? 0) -
              (segment?.start ?? 0),
          )}
          playing={playing}
          blocked={!!game || taskList || ended}
          getElapsed={getElapsed}
          onPlay={() => audio.current?.play()}
        />
      </div>
      <div className="reader-bottom">
        <AudioControls
          key={scene.id}
          ref={audio}
          sceneTitle={scene.title}
          segment={segment}
          volume={progress.volume}
          onVolume={onVolume}
          onBoundary={() => next(true)}
          onPlaying={setPlaying}
          onTime={(time) => onTime(scene.id, time)}
          savedTime={progress.audioTimes[scene.id]}
          autoPlay={autoPlay}
        />
        <div className="scene-navigation">
          <button
            className="text-button"
            disabled={index === 0}
            onClick={() => move(index - 1)}
          >
            <Icon name="ChevronLeft" size={19} />
            <span>Алдыңғы</span>
          </button>
          <div className="scene-dots" aria-label="Көріністер">
            {chapter.scenes.map((s, i) => (
              <button
                key={s.id}
                className={i === index ? "active" : ""}
                aria-label={`${i + 1}-көрініс: ${s.title}`}
                aria-current={i === index ? "step" : undefined}
                onClick={() => {
                  if (
                    i > index &&
                    chapter.scenes
                      .slice(index, i)
                      .some(
                        (s) =>
                          s.gameAfter &&
                          !progress.completedGames.includes(s.gameAfter),
                      )
                  ) {
                    next();
                  } else move(i);
                }}
              />
            ))}
            <span>
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(chapter.scenes.length).padStart(2, "0")}
            </span>
          </div>
          <button className="text-button next-scene" onClick={() => next()}>
            <span>
              {index === chapter.scenes.length - 1
                ? "Бөлімді аяқтау"
                : "Келесі"}
            </span>
            <Icon name="ChevronRight" size={19} />
          </button>
        </div>
      </div>
      {game && (
        <Modal
          title="ОЙЛАНУ СӘТІ"
          wide
          onClose={() => {
            setGame(null);
            resume.current = false;
          }}
        >
          <Game
            key={game}
            id={game}
            onRead={() => {
              setGame(null);
            }}
            onContinue={() => {
              onCompleteGame(game);
              setGame(null);
              if (gameAdvance.current) move(index + 1, resume.current);
              else if (resume.current) audio.current?.play();
            }}
          />
        </Modal>
      )}
      {taskList && (
        <Modal title="БӨЛІМ ТАПСЫРМАЛАРЫ" onClose={() => setTaskList(false)}>
          <h2>Оқығаныңды ойға түй</h2>
          <p className="game-instruction">
            Тапсырманы таңдаңыз. Аяқтаған соң оқу тоқтаған жерінен жалғасады.
          </p>
          <div className="task-list">
            {chapter.scenes
              .flatMap((s) => (s.gameAfter ? [s.gameAfter] : []))
              .map((id) => (
                <button
                  className="task-card"
                  key={id}
                  onClick={() => {
                    gameAdvance.current = false;
                    setTaskList(false);
                    setGame(id);
                  }}
                >
                  <Icon
                    name={
                      progress.completedGames.includes(id)
                        ? "Check"
                        : "Lightbulb"
                    }
                    size={22}
                  />
                  <span>
                    {gameDetails[id].title}
                    <small>
                      {progress.completedGames.includes(id)
                        ? "Орындалды · қайта орындау"
                        : "Тапсырманы ашу"}
                    </small>
                  </span>
                  <Icon name="ArrowRight" size={18} />
                </button>
              ))}
          </div>
        </Modal>
      )}
      {ended && (
        <Modal title="БӨЛІМ АЯҚТАЛДЫ" onClose={() => setEnded(false)}>
          <div className="completion">
            <span className="success-mark">
              <Icon name="Check" size={30} />
            </span>
            <h2>Ойға азық болған оқиға</h2>
            <p>
              «{chapter.title}» бөлімін тыңдап, көріп шықтыңыз. Қарау барысы осы
              браузерде сақталды.
            </p>
            <button className="button primary" onClick={onContents}>
              Мазмұнға оралу
              <Icon name="ArrowRight" size={18} />
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}

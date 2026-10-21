import { useState } from "react";
import { scienceCards, fields, eventCards, gameDetails } from "../data/games";
import { chapters } from "../data/book";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";
import { OpeningFactsGame, JourneyRouteGame } from "./ExtraGames";
const cardIcons: Record<string, IconName> = { artifact:"Landmark",book:"BookOpen",music:"Music2",letter:"Mail",ticket:"Ticket",case:"Briefcase",train:"TrainFront" };
export function Game({id,onContinue,onRead}:{id:string;onContinue:()=>void;onRead:()=>void}) {
  const [success,setSuccess]=useState(false), [hint,setHint]=useState(false), [message,setMessage]=useState("");
  const definition=gameDetails[id];
  if(!definition) return <p>Тапсырма табылмады.</p>;
  const chapter=chapters[definition.chapter];
  const onCheck=(ok:boolean)=>{setSuccess(ok);setMessage(ok?"":definition.retry);};
  return <div className="game-layout">
    <aside className="game-source"><span className="eyebrow"><Icon name="BookOpen" size={15}/>КІТАПТАН ҮЗІНДІ</span><blockquote>{definition.scenes.map(i=>chapter.scenes[i].paragraphs.join("\n\n")).join("\n\n")}</blockquote><p className="source-note">«Қаныш және ғылыми майдан», {chapter.pages}-беттерден берілген мәтін.</p>{id==="science-team"&&<p className="source-note">PDF-те үш ғалымның салалары толық көрсетілмеген. Ойындағы сәйкестіктер жоба тапсырмасына негізделген.</p>}<button className="text-button" onClick={onRead}><Icon name="ArrowLeft" size={16}/>Мәтінге оралу</button></aside>
    <div className="game-workspace"><span className="small-label">ОҚИҒА ІШІНДЕГІ ОЙЫН · {definition.number}</span><h2>{definition.title}</h2><p className="game-instruction">{definition.instruction}</p>
    {!success ? <>
      {id==="science-team"?<ScienceGame hint={hint} onCheck={onCheck}/>:id==="event-chain"?<SequenceGame onCheck={onCheck}/>:id==="opening-facts"?<OpeningFactsGame onCheck={onCheck}/>:<JourneyRouteGame onCheck={onCheck}/>}
      <div className="game-feedback" role="status">{message}</div><button className="text-button hint-button" onClick={()=>setHint(!hint)} aria-expanded={hint}><Icon name="Lightbulb" size={17}/>{hint?"Кеңесті жабу":"Кеңес алу"}</button>{hint&&<div className="hint">{definition.hint}</div>}
    </>:<div className="game-success" role="status"><span className="success-mark"><Icon name="Check" size={32}/></span><h3>Керемет, шешім табылды!</h3><p>{definition.explanation}</p><button className="button primary" onClick={onContinue}>Әңгімені жалғастыру<Icon name="ArrowRight" size={18}/></button></div>}
    </div>
  </div>;
}
function ScienceGame({
  hint,
  onCheck,
}: {
  hint: boolean;
  onCheck: (ok: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null),
    [assigned, setAssigned] = useState<Record<string, string>>({});
  function assign(field: string, id: string | null) {
    if (!id) return;
    setAssigned((p) => ({
      ...Object.fromEntries(Object.entries(p).filter(([, v]) => v !== id)),
      [field]: id,
    }));
    setSelected(null);
  }
  return (
    <>
      <div className="scientist-cards">
        {scienceCards.map((c) => (
          <button
            key={c.id}
            className={`scientist-card ${selected === c.id ? "selected" : ""} ${Object.values(assigned).includes(c.id) ? "assigned" : ""}`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", c.id);
              setSelected(c.id);
            }}
            onClick={() => setSelected(c.id)}
            aria-pressed={selected === c.id}
          >
            <Icon name={cardIcons[c.icon]} size={25} />
            <span>{c.name}</span>
            {hint && <small>{c.hint}</small>}
          </button>
        ))}
      </div>
      <div className="field-slots">
        {fields.map((field) => {
          const c = scienceCards.find((c) => c.id === assigned[field]);
          return (
            <button
              className={`field-slot ${c ? "filled" : ""}`}
              key={field}
              onClick={() => {
                if (selected) assign(field, selected);
                else if (c) {
                  setSelected(c.id);
                  setAssigned((p) => {
                    const next = { ...p };
                    delete next[field];
                    return next;
                  });
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain");
                if (scienceCards.some((c) => c.id === id)) assign(field, id);
              }}
            >
              <span>{field}</span>
              <span className="slot-name">
                {c ? c.name : "Ғалымды орналастырыңыз"}
              </span>
              {c && <Icon name={cardIcons[c.icon]} size={19} />}
            </button>
          );
        })}
      </div>
      <button
        className="button primary"
        onClick={() =>
          onCheck(scienceCards.every((c) => assigned[c.field] === c.id))
        }
      >
        Жауапты тексеру
        <Icon name="Check" size={17} />
      </button>
    </>
  );
}
function SequenceGame({ onCheck }: { onCheck: (ok: boolean) => void }) {
  const [order, setOrder] = useState(["packing", "warning", "train", "ticket"]);
  function move(from: number, to: number) {
    if (to < 0 || to >= order.length) return;
    setOrder((p) => {
      const next = [...p];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }
  return (
    <>
      <div className="logical-rules">
        <strong>Ойынның логикалық шарттары</strong>
        <p>
          Билет хабардан кейін алынады. Дайындық билеттен кейін аяқталады.
          Пойызға дайындықтан соң отырады.
        </p>
        <small>
          Бұл шарттар — ойын моделі, кітаптан алынған сөзбе-сөз дерек емес.
        </small>
      </div>
      <ol className="sequence-cards">
        {order.map((id, i) => {
          const c = eventCards.find((c) => c.id === id)!;
          return (
            <li
              key={id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const from = order.indexOf(
                  e.dataTransfer.getData("text/plain"),
                );
                if (from >= 0) move(from, i);
              }}
            >
              <span className="order-number">{i + 1}</span>
              <Icon name={cardIcons[c.icon]} size={21} />
              <span>{c.text}</span>
              <div className="reorder-actions">
                <button
                  className="icon-button"
                  disabled={i === 0}
                  aria-label={`${c.text}: жоғары жылжыту`}
                  onClick={() => move(i, i - 1)}
                >
                  <Icon name="MoveUp" size={16} />
                </button>
                <button
                  className="icon-button"
                  disabled={i === 3}
                  aria-label={`${c.text}: төмен жылжыту`}
                  onClick={() => move(i, i + 1)}
                >
                  <Icon name="MoveDown" size={16} />
                </button>
              </div>
            </li>
          );
        })}
      </ol>
      <button
        className="button primary"
        onClick={() => onCheck(order.every((id, i) => id === eventCards[i].id))}
      >
        Ретін тексеру
        <Icon name="Check" size={17} />
      </button>
    </>
  );
}

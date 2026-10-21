import { useState } from "react";
import { openingFacts, journeyCities, journeyChoices } from "../data/games";
import { Icon } from "./Icon";

export function OpeningFactsGame({ onCheck }: { onCheck: (ok: boolean) => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  return <>
    <div className="restored-fragment" aria-live="polite"><Icon name="Landmark" size={23}/><p>Академияның ресми ашылуы <strong>{answers.year || "…"}</strong> жылы, <strong>{answers.date || "…"}</strong> күні өтті.<br/>Өткен орны: <strong>{answers.place || "…"}</strong>.</p></div>
    {openingFacts.map(fact => <fieldset className="fact-options" key={fact.id}><legend>{fact.label}</legend>{fact.options.map(option => <button key={option} className={answers[fact.id] === option ? "chosen" : ""} aria-pressed={answers[fact.id] === option} onClick={() => setAnswers(p => ({...p,[fact.id]:option}))}>{option}</button>)}</fieldset>)}
    <button className="button primary" onClick={() => onCheck(openingFacts.every(fact => answers[fact.id] === fact.answer))}>Үзіндіні тексеру<Icon name="Check" size={17}/></button>
  </>;
}

export function JourneyRouteGame({ onCheck }: { onCheck: (ok: boolean) => void }) {
  const [route, setRoute] = useState<string[]>([]);
  return <>
    <p className="route-note">Бұл — мәтіндегі қалалардың реті, географиялық карта емес. Қосымша станциялар ойдан қосылмайды.</p>
    <ol className="journey-route" aria-label="Сапар бағыты">{journeyCities.map((_, i) => <li key={i}><span className={route[i] ? "station filled-station" : "station"}>{i + 1}</span><span>{route[i] || "Қаланы таңдаңыз"}</span></li>)}</ol>
    <div className="city-choices">{journeyChoices.map(city => <button className="city-choice" key={city} disabled={route.includes(city)} onClick={() => setRoute(p => [...p,city])}><Icon name="TrainFront" size={17}/>{city}</button>)}</div>
    <div className="route-actions"><button className="text-button" disabled={!route.length} onClick={() => setRoute(p => p.slice(0,-1))}><Icon name="ArrowLeft" size={16}/>Соңғы қадамды қайтару</button><button className="text-button" disabled={!route.length} onClick={() => setRoute([])}><Icon name="RotateCcw" size={16}/>Қайта құрастыру</button></div>
    <button className="button primary" onClick={() => onCheck(route.length === journeyCities.length && route.every((city,i) => city === journeyCities[i]))}>Бағытты тексеру<Icon name="Check" size={17}/></button>
  </>;
}

import { render,screen,within,fireEvent,waitFor } from "@testing-library/react";
import { it,expect,vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { Game } from "../src/components/Games";
import { App } from "../src/App";
import { loadProgress } from "../src/progress";

it("тарихи үзіндіні пернетақтамен түзету, кеңес және қайталау",async()=>{
  const user=userEvent.setup(),onContinue=vi.fn();
  render(<Game id="opening-facts" onContinue={onContinue} onRead={()=>{}}/>);
  for(const answer of ["1951","1 шілде","Абай атындағы Опера және балет театры"])await user.click(screen.getByRole("button",{name:answer,exact:true}));
  await user.click(screen.getByRole("button",{name:"Үзіндіні тексеру"}));
  expect(screen.getByRole("status").textContent).toContain("сәйкес келмейді");
  await user.click(screen.getByRole("button",{name:"Кеңес алу"}));expect(document.querySelector('.hint')?.textContent).toContain("1946");
  screen.getByRole("button",{name:"1946",exact:true}).focus();await user.keyboard("{Enter}");
  await user.click(screen.getByRole("button",{name:"Үзіндіні тексеру"}));await user.click(screen.getByRole("button",{name:"Әңгімені жалғастыру"}));expect(onContinue).toHaveBeenCalledOnce();
});

it("сапар бағыты қате реттен кейін кері қайту және қайта құрастыруды қолдайды",async()=>{
  const user=userEvent.setup();render(<Game id="journey-route" onContinue={()=>{}} onRead={()=>{}}/>);
  await user.click(screen.getByRole("button",{name:"Мәскеу",exact:true}));await user.click(screen.getByRole("button",{name:"Бағытты тексеру"}));expect(screen.getByRole("status").textContent).toContain("ретін");
  await user.click(screen.getByRole("button",{name:"Соңғы қадамды қайтару"}));expect((screen.getByRole("button",{name:"Мәскеу",exact:true}) as HTMLButtonElement).disabled).toBe(false);
  for(const city of ["Алматы","Қызылорда","Орал","Қазан","Мәскеу"])await user.click(screen.getByRole("button",{name:city,exact:true}));
  expect(within(screen.getByRole("list",{name:"Сапар бағыты"})).getAllByRole("listitem").map(el=>el.textContent)).toEqual(["1Алматы","2Қызылорда","3Орал","4Қазан","5Мәскеу"]);
  await user.click(screen.getByRole("button",{name:"Бағытты тексеру"}));expect(screen.getByRole("button",{name:"Әңгімені жалғастыру"})).toBeTruthy();
});

it("тапсырмалар мәзірі жаңа ойынды ашады және оқуды сол уақыттан жалғастырады",async()=>{
  const user=userEvent.setup();location.hash="#/read/academy/3";render(<App/>);
  const audio=document.querySelector("audio:not([data-background-music])") as HTMLAudioElement;
  fireEvent.loadedMetadata(audio);audio.currentTime=190;fireEvent.timeUpdate(audio);await user.click(screen.getByRole("button",{name:"Ойнату",exact:true}));
  await user.click(screen.getByRole("button",{name:"Тапсырмалар",exact:true}));expect(audio.paused).toBe(true);
  const menu=screen.getByRole("dialog",{name:"БӨЛІМ ТАПСЫРМАЛАРЫ"});expect(menu.querySelectorAll('.task-card').length).toBe(2);
  await user.click(within(menu).getByRole("button",{name:/Тарихи сәтті қалпына келтір/}));
  const game=screen.getByRole("dialog",{name:"ОЙЛАНУ СӘТІ"});
  for(const answer of ["1946","1 шілде","Абай атындағы Опера және балет театры"])await user.click(within(game).getByRole("button",{name:answer,exact:true}));
  await user.click(within(game).getByRole("button",{name:"Үзіндіні тексеру"}));await user.click(within(game).getByRole("button",{name:"Әңгімені жалғастыру"}));
  expect(location.hash).toBe("#/read/academy/3");expect(audio.currentTime).toBe(190);await waitFor(()=>expect(audio.paused).toBe(false));expect(loadProgress().completedGames).toContain("opening-facts");
});

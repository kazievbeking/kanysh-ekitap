import { readFile, writeFile } from 'node:fs/promises';

const raw = (await readFile('materials/extracted.txt','utf8')).replace(/\r/g,'');
const [first, second] = raw.split('Первая часть:')[1].split('Вторая часть:');
const clean = (text) => text.replace(/\[thoughtful\]\s*/g,'').replace(/\s+/g,' ').trim().normalize('NFC');
function partition(text, markers, descriptions) {
  const content=clean(text);
  const starts=[0,...markers.map(m=>{const i=content.indexOf(m); if(i<0)throw new Error(m); return i;})];
  return starts.map((start,i)=>({...descriptions[i], paragraphs:[content.slice(start,starts[i+1]??content.length).trim()]}));
}
const one=partition(first, ['Оларға жетпей тұрғаны','Қолайлы сəттің','Академия ашылғанда'], [
  {id:'academy-01',title:'Ұлы арманның бастауы',image:'academy',caption:'Алматы. Абай атындағы Опера және балет театры',label:'1946 · 1 шілде',gameAfter:'opening-facts'},
  {id:'academy-02',title:'Ғылымға бастар жол',image:'scholars',caption:'Ғылыми орталық туралы арман',label:'Ғылым жолы'},
  {id:'academy-03',title:'Бір мақсатқа біріккен ғалымдар',image:'scholars',caption:'Ұлт ғылымының ортақ мұраты',label:'Ғылыми орта',gameAfter:'science-team'},
  {id:'academy-04',title:'Академияның ашылуы',image:'ceremony',caption:'Кітаптағы ашылу салтанаты туралы баяндау',label:'Тарихи сәт'}
]);
const two=partition(second, ['<<Қызметтен кетіп','Ол жылдары Қаныш','Келесі күні суық өсек','Қаныш ағаны пойызға шығарып салған күні'], [
  {id:'fugitive-01',title:'Сын сағат',image:'evening',caption:'Ғалым өміріндегі қиын кезең',label:'1951 · 23 қараша'},
  {id:'fugitive-02',title:'Ескерту және әріптестің көмегі',image:'evening',caption:'Кітапта келтірілген Шапық Шөкин естелігі',label:'Қиын сәттегі шешім',gameAfter:'event-chain'},
  {id:'fugitive-03',title:'Алматыны қимай аттану',image:'train',caption:'Аяпбергеновтің кітапта келтірілген естелігі',label:'Жолға шығу'},
  {id:'fugitive-04',title:'Алаңға толы сапар',image:'train',caption:'Амандық туралы хабар күту',label:'Пойыз сапары',gameAfter:'journey-route'},
  {id:'fugitive-05',title:'Әріптестердің қолдауы',image:'support',caption:'Қазан мен Мәскеудегі қарсы алу туралы естелік',label:'Ғылыми ынтымақ'}
]);
for(const [name,scenes] of [['academy',one],['fugitive',two]])await writeFile(`src/data/${name}.json`,JSON.stringify(scenes,null,2)+'\n');
console.log('Екі бөлімнің мәтіні сақталды:',one.length,two.length);

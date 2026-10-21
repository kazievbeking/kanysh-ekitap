import {readFile,writeFile} from 'node:fs/promises';
import {parseFile} from 'music-metadata';
// Нақты аудиодан танылған сөйлемдердің тексерілген орындары.
const anchors={academy:{chapter:1,starts:[49.59,149.93,163.57]},fugitive:{chapter:2,starts:[51.24,80.46,176.06,221.88]}};
const manifest={version:1,status:'automatically-aligned',method:'Нақты MP3 файлдарындағы сөйлем шекаралары. Үзілістер бар жерде олардың орта тұсы алынды. Диктор мәтінінің орнына тану нәтижесі қолданылмайды.',review:'Шекаралар автоматты тану бойынша анықталған; тыңдап соңғы редакторлық салыстыру қажет.',segments:{}};
for(const [name,{chapter,starts}] of Object.entries(anchors)){
 const scenes=JSON.parse(await readFile(`src/data/${name}.json`,'utf8'));
 const transcript=JSON.parse(await readFile(`materials/audio-${chapter}-timings.json`,'utf8'));
 if(!transcript.complete)throw new Error('Аудионы тану әлі аяқталмаған');
 const file=`audio/chapter-${chapter}.mp3`;
 const {format}=await parseFile(`public/${file}`);
 const boundaries=[0,...starts.map(t=>{const i=transcript.segments.findIndex(s=>Math.abs(s.start-t)<.02);if(i<1)throw new Error(`Шекара табылмады: ${t}`);const previous=transcript.segments[i-1].end;return Math.round(((previous+t)/2)*1000)/1000;}),format.duration];
 scenes.forEach((s,i)=>manifest.segments[s.id]={file,start:boundaries[i],end:boundaries[i+1]});
}
await writeFile('src/data/audio-manifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log('Аудио manifest нақты екі MP3-ке байланыстырылды.');

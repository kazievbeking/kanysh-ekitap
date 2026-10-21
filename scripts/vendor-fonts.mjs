import {readFile,writeFile,mkdir} from 'node:fs/promises';
const css=await readFile('.tools/fonts.css','utf8');
await mkdir('src/fonts',{recursive:true});
const selected=[];
for(const block of css.match(/@font-face\s*\{[^}]+\}/g)){
 const family=block.match(/font-family: '([^']+)'/)[1];
 const weight=block.match(/font-weight: (\d+)/)[1];
 const style=block.match(/font-style: (\w+)/)[1];
 if(!((family==='Noto Sans'&&['400','600'].includes(weight))||(family==='Noto Serif'&&((style==='normal'&&['400','500'].includes(weight))||(style==='italic'&&weight==='400')))))continue;
 const url=block.match(/url\(([^)]+)\)/)[1];
 const name=family.toLowerCase().replace(' ','-')+'-'+style+'-'+weight+'.ttf';
 const result=await fetch(url);if(!result.ok)throw new Error(result.status);
 await writeFile('src/fonts/'+name,Buffer.from(await result.arrayBuffer()));
 selected.push(block.replace(url,'./fonts/'+name));
}
await writeFile('src/fonts.css',selected.join('\n')+'\n');
console.log('Жергілікті қаріптер:',selected.length);

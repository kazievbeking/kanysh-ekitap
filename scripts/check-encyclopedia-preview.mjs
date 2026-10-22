import { JSDOM, VirtualConsole } from 'jsdom';
const base=process.argv[2]||'http://127.0.0.1:5173/';
const html=await(await fetch(base)).text();
const script=html.match(/<script[^>]+src="([^"]+)/)?.[1];
if(!script)throw Error('Missing bundle');
const code=await(await fetch(new URL(script,base))).text();
const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(html,{url:base+'#/encyclopedia',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
dom.window.scrollTo=()=>{};dom.window.HTMLMediaElement.prototype.pause=function(){};
dom.window.eval(code);await new Promise(r=>setTimeout(r,350));
const doc=dom.window.document;
if(doc.querySelectorAll('.encyclopedia-sections button').length!==3)throw Error('Missing sections');
for(const b of doc.querySelectorAll('.encyclopedia-sections button')){b.click();await new Promise(r=>setTimeout(r,30));if(!doc.querySelector('.encyclopedia-entry'))throw Error('Missing content');}
const img=await fetch(new URL('images/encyclopedia-cover.webp',base));if(!img.ok)throw Error('Missing cover');
if(errors.length)throw Error(errors.join('\n'));
process.stdout.write('Encyclopedia: three sections render, all switches work, cover HTTP 200, no JavaScript errors.\n');dom.window.close();

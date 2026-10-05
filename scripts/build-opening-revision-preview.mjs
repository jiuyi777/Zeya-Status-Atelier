import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { buildOpeningHomeRegex } from '../opening-home-generator.js';
import { kineticDefaults, buildKineticPage } from '../opening-kinetic.js';
const source=await readFile(new URL('../index.js',import.meta.url),'utf8');
const out=new URL('../output/opening-revision/',import.meta.url);
await mkdir(out,{recursive:true});
const data={title:'在海风归来之际',subtitle:'与你重逢，是故事的下一页',author:'九一',model:'gemini3.7flash\nClaude4.5o / Claude4.6o\nkimi3',preset:'若夏终将完结\n衔春色',intro:'这是一座靠海的小城。你回到阔别多年的旧街，接手了一间临近打烊的书店，也重新遇见了那些留在记忆里的人。\n\n有人替你保管着一封旧信，有人一直记得你的习惯。夏日漫长，海风越过窗台，许多来不及说的话，终于有了新的开头。你可以决定这次留下多久，也可以选择，先去见哪一个人。',entries:[{title:'窗外的窥视者',summary:'雨落在画廊对面的玻璃上。那个人收起雨伞，静静望向窗内，却迟迟没有走近。',target:2},{title:'修复室的秘密',summary:'旧画修复室里，你们再次坐在同一张长桌前。熟悉的名字被轻轻念起，那些没有解释的往事也慢慢浮现。',target:3},{title:'午夜的旧情',summary:'你们在深夜的露台相遇。远处最后一班车驶过，有人终于开口，问你这次还会不会离开。',target:4}]};
const themes=[['kinetic','动态字构'],['collage','拼贴手账'],['dossier','黑银档案'],['bloom-letter','见花如晤']];
for(const [id] of themes){
 const block=source.match(new RegExp("id: '"+id+"', name: '[^']+'[^\\n]*\\r?\\n\\s*values: (\\{[^\\n]+\\})"));
 const values=block?Object.fromEntries([...block[1].matchAll(/(\w+): '([^']*)'/g)].map(m=>[m[1],m[2]])):{theme:id,font:'kai',text:'#028e96',accent:'#d38a53'};
 let html=buildOpeningHomeRegex({...values,...data}).replaceString.slice(8,-4);
 // Read-only production-layout sample. The real envelope interaction is tested separately.
 if(id==='bloom-letter')html=html.replace('<section class="bloom-letter" hidden>','<section class="bloom-letter">').replace(/<div class="bloom-scene"[^>]*>/,'<div class="bloom-scene" hidden>').replace('<p class="bloom-hint"','<p hidden class="bloom-hint"');
 await writeFile(new URL(id+'.html',out),html);
}
await writeFile(new URL('pixel-dusk.html',out),buildKineticPage(kineticDefaults('pixel-dusk')));
const cards=[['pixel-dusk','中央铁路'],...themes].map(([id,name])=>`<button data-page="${id}">${name}</button>`).join('');
await writeFile(new URL('index.html',out),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>开场白 · 排版修订</title><style>*{box-sizing:border-box;scrollbar-width:none}*::-webkit-scrollbar{display:none}body{margin:0;background:#e9e7e2;color:#46423d;font:14px/1.7 system-ui}header{max-width:1000px;margin:auto;padding:24px 20px 12px}h1{font-size:22px;margin:0 0 8px;font-weight:500}p{font-size:12px;color:#827c72;margin:0 0 18px}nav{display:flex;flex-wrap:wrap;gap:8px}button{cursor:pointer;font:12px/1.5 inherit;padding:8px 12px;background:#f6f4ee;border:1px solid #cfc9bc;border-radius:5px;color:inherit}button[aria-pressed=true]{color:#f8f6ef;background:#625b4e}main{padding:16px 14px 40px}iframe{display:block;width:390px;max-width:100%;height:1500px;margin:auto;border:0;box-shadow:0 8px 35px #54493814}.controls{display:flex;justify-content:space-between;align-items:center;margin:12px 0 0;gap:15px}.controls a{font-size:12px;color:#71644f}body.wide iframe{width:860px}</style><header><h1>开场白 · 排版修订</h1><p>手机尺寸预览。铁路可选站、暂停；下方四款用长简介和长标题检查排版。</p><nav>${cards}</nav><div class="controls"><button id="width">切换宽屏</button><a href="../../opening-kinetic-preview.html?theme=pixel-dusk">打开像素铁路编辑页 ↗</a></div></header><main><iframe title="修订预览" src="pixel-dusk.html"></iframe></main><script>const frame=document.querySelector('iframe');document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{frame.src=b.dataset.page+'.html';document.querySelectorAll('[data-page]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});document.querySelector('[data-page]').setAttribute('aria-pressed','true');document.querySelector('#width').onclick=()=>{const wide=document.body.classList.toggle('wide');document.querySelector('#width').textContent=wide?'切换手机':'切换宽屏';};</script></html>`);
console.log('output/opening-revision/index.html');

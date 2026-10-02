import { buildBloomPrintStyle } from './opening-bloom-print-style.js?v=0.11.36';
import { renderImageText, httpsImageUrl } from './opening-image-tools.js?v=0.11.36';
import { normalizeFloral } from './opening-floral-letter.js';
import { switchStarPage } from './opening-star-atlas.js';
export const BLOOM_ART = 'https://raw.githubusercontent.com/jiuyi777/Zeya-Status-Atelier/main/assets/opening-bloom-letter/letter-turquoise-cord.webp';
const BLOOM_PREVIEW_ART = new URL('./assets/opening-bloom-letter/letter-turquoise-cord.webp', import.meta.url).href;
export const BLOOM_DEFAULTS = { title: '见花如晤', subtitle: 'A LETTER IN BLOOM', author: '九一', intro: '把未说完的话，藏在花里。\n选一封信，让故事从这里开始。', accent: '#d38a53', ink: '#028e96', fontStyle: 'kai', fontSize: 17, entries: [{id:'opening-1',title:'初见时，花尚未眠',summary:'一场迟来的相逢。',body:'黄昏落在窗沿，你收到了一封没有署名的信。\n\n信纸上只有一句话：\n「花开的时候，你会来吗？」'},{id:'opening-2',title:'寄往旧日的信',summary:'重逢，或重新开始。',body:'旧信封里，藏着一片褪色的花瓣。\n\n你还记得，那个没有说完的春天。'}] };
const esc = v => String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll('`','&#96;');
export function bloomInteraction() {
  const scene=document.querySelector('.bloom-scene'); if(!scene)return;
  const page=document.querySelector('.bloom-page'), flower=scene.querySelector('.bloom-flower');
  const letter=document.querySelector('.bloom-letter'), hint=document.querySelector('.bloom-hint');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Keep the reading position for this host page only; a new visit starts sealed.
  let viewId=performance.timeOrigin;
  try{viewId=window.parent.performance.timeOrigin;}catch{}
  const storageKey='status-atelier:bloom-view:'+viewId+':'+page.dataset.bloomKey;
  function reveal(animate) {
    const previousHeight=page.getBoundingClientRect().height;
    scene.hidden=true;hint.hidden=true;letter.hidden=false;
    scene.dataset.phase='open';page.dataset.bloomState='open';
    if(animate&&!reduced&&page.animate&&letter.animate){
      const timing={duration:560,easing:'cubic-bezier(.22,.7,.25,1)'};
      page.animate([{height:previousHeight+'px'},{height:page.getBoundingClientRect().height+'px'}],timing);
      letter.animate([{opacity:0,transform:'translateY(18px)',clipPath:'inset(0 0 65% 0)'},{opacity:1,transform:'translateY(0)',clipPath:'inset(0)'}],timing);
    }
    try{sessionStorage.setItem(storageKey,'1');}catch{}
    page.dispatchEvent(new Event('bloom-opened',{bubbles:true}));
    if(animate)letter.querySelector('h2').focus({preventScroll:true});
  }
  let alreadyOpened=!letter.hidden;
  try{alreadyOpened ||= sessionStorage.getItem(storageKey)==='1';}catch{}
  if(alreadyOpened){reveal(false);return;}
  flower.addEventListener('click',()=>{
    if(scene.dataset.phase!=='closed')return;
    scene.dataset.phase='opening';page.dataset.bloomState='opening';flower.disabled=true;hint.textContent='展信中…';
    if(reduced)reveal(true);else setTimeout(()=>reveal(true),160);
  });
}
export function buildBloomPage(input={},pageId='home',options={}) {
 const d=normalizeFloral({...BLOOM_DEFAULTS,...input}), home=pageId==='home', page=d.entries.find(e=>e.id===pageId); if(!home&&!page)throw new Error('开场白不存在');
 const opened=!home||options.opened===true;
 const key=JSON.stringify([d.title,d.author,d.entries.map(entry=>entry.id)]);
 const font={kai:'STKaiti,KaiTi,serif',serif:'"Noto Serif SC","Source Han Serif SC","Songti SC",STSong,SimSun,serif',sans:'"Noto Sans SC","Microsoft YaHei",sans-serif',fangsong:'STFangsong,FangSong,serif',rounded:'YouYuan,sans-serif',clerical:'LiSu,serif'}[d.fontStyle];
 const art=httpsImageUrl(input.artUrl)||(options.preview?BLOOM_PREVIEW_ART:BLOOM_ART);
 const letter=`<section class="bloom-letter" ${opened?'':'hidden'}>${home?'':`<div class="letter-meta"><span>LETTER / ${String(d.entries.indexOf(page)+1).padStart(2,'0')}</span><button data-target="bloom-home">← 返回${esc(d.title)}</button></div>`}<h2 tabindex="-1">${esc(home?'展信安。':page.title)}</h2><div class="letter-intro">${renderImageText(home?d.intro:page.body,esc)}</div>${(home?d.imageUrl:page.imageUrl)?`<img class="bloom-cover" src="${esc(home?d.imageUrl:page.imageUrl)}" alt="作品配图">`:""}${home?`<div class="bloom-index">${d.entries.map((e,i)=>`<article class="bloom-entry"><span class="num">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(e.title)}</h3><p>${esc(e.summary)}</p>${e.imageUrl?`<img class="bloom-cover" src="${esc(e.imageUrl)}" alt="${esc(e.title)}配图">`:""}</div><button data-target="bloom-${e.id}" aria-label="阅读：${esc(e.title)}">读信 ↗</button></article>`).join('')}</div>`:`<button data-target="bloom-home">← 返回${esc(d.title)}</button>`}<p class="sign">${esc(d.author)} · 敬上</p></section>`;
 return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(d.title)}</title><style>${buildBloomPrintStyle(d,font)}</style></head><body><main class="bloom-page" data-star-page="bloom-${esc(pageId)}" data-bloom-key="${esc(key)}" data-bloom-state="${opened?'open':'closed'}"><header class="bloom-head"><span class="eyebrow">${esc(d.subtitle)}</span><h1>${esc(d.title)}</h1></header>${home?`<div class="bloom-scene" data-phase="${opened?'open':'closed'}" ${opened?'hidden':''}><button class="bloom-flower" type="button" aria-label="拆开来信"><img src="${esc(art)}" alt=""></button></div><p class="bloom-hint" role="status" ${opened?'hidden':''}>轻触拆开</p>`:''}${letter}<div class="notice" role="status"></div><footer class="bloom-footer">${esc(d.author)} · 花信</footer></main><script data-bloom-interaction>(${bloomInteraction.toString()})();</script><script>const switchPage=${switchStarPage.toString()};document.querySelectorAll('[data-target]').forEach(b=>b.addEventListener('click',async()=>{b.disabled=true;try{await switchPage(b.dataset.target,typeof getChatMessages==='function'?getChatMessages:window.TavernHelper?.getChatMessages,typeof setChatMessages==='function'?setChatMessages:window.TavernHelper?.setChatMessages);}catch(e){document.querySelector('.notice').textContent=e.message;}finally{b.disabled=false;}}));</script></body></html>`;
}
export function buildBloomGreetingFields(input){if(String(input?.artUrl||'').trim()&&!httpsImageUrl(input.artUrl))throw new Error('自定义花信插画请填写图床返回的 HTTPS 链接，留空使用定稿信封');const d=normalizeFloral({...BLOOM_DEFAULTS,...input}),fence=s=>'```html\n'+s+'\n```';return{first_mes:fence(buildBloomPage(input)),alternate_greetings:d.entries.map(e=>fence(buildBloomPage(input,e.id)))};}

import { normalizeFloral } from './opening-floral-letter.js?v=0.11.39';
import { switchStarPage } from './opening-star-atlas.js?v=0.11.39';
import { renderImageText } from './opening-image-tools.js';
import { kineticStyle } from './opening-kinetic-style.js?v=0.11.39';
import { kineticInteraction, clockSelection } from './opening-kinetic-runtime.js?v=0.11.39';
import { railwayLayout, railwayPoint, pixelRailCar, pixelRailwayRuntime } from './opening-pixel-rail.js?v=0.11.39';

export const KINETIC_THEMES = [
  { id: 'soft-clock', name: '此刻，开场', subtitle: 'A MOMENT TO BEGIN', description: '转动时钟 · 指针替你选一个开头', accent: '#ad4e3e', ink: '#282b28', fontStyle: 'serif' },
  { id: 'signal-field', name: '未读频率', subtitle: 'STORIES ON THE AIR', description: '像素收音机 · 调到你的故事频段', accent: '#c6cead', ink: '#e7e8db', fontStyle: 'sans' },
  { id: 'pixel-dusk', name: '下一站，像素', subtitle: 'TAKE YOUR TIME / FIND YOUR STORY', description: '像素小车 · 沿着弯弯铁路选故事', accent: '#775666', ink: '#51474f', fontStyle: 'sans' },
];
export const kineticTheme = id => KINETIC_THEMES.find(t => t.id === id) || KINETIC_THEMES[0];
const esc = v => String(v ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll('`','&#96;');
const num = v => String(v).padStart(2, '0');

export function kineticDefaults(id) {
  const t = kineticTheme(id);
  return { ...t, theme: t.id, title: t.name, displayTitle: 'NEXT\nCHAPTER', author: '九一', fontSize: 17, imageUrl: '', intro: '每一个此刻，都有另一种开始。', entries: [
    {id:'opening-1', title:'在雨停之前', summary:'便利店的灯还亮着。有人带着一把多余的伞，等你很久了。', body:'你在便利店门口躲雨。\n\n玻璃门再次打开，那个人走到你身旁，把一把干燥的伞递过来。\n\n「走吗？这次我顺路。」'},
    {id:'opening-2', title:'零点的来电', summary:'一个没有保存的号码，在零点整拨通。听筒里传来你的名字。', body:'时钟刚刚越过零点，手机亮了起来。\n\n你接起电话，听见风声，然后是一个许久未见的人。\n\n「先别挂。我有一件事，只想告诉你。」'},
    {id:'opening-3', title:'借一场日落', summary:'天台、汽水，还有一封被风拆开的信。今天的日落比往常晚。', body:'有人提前替你占好了天台最好的位置。\n\n两罐汽水并排放着，那封没有署名的信压在其中一罐下面。\n\n你刚伸出手，身后便响起脚步声。'},
    {id:'opening-4', title:'旧站台重逢', summary:'末班列车已经开走，站台上的人却像从未离开。', body:'广播说，今天的列车已经全部离站。\n\n你正要转身，站台另一端有人喊了你的名字。\n\n隔着灯下的薄雾，你看见一个本该出现在很多年前的人。'},
    {id:'opening-5', title:'寄往明天', summary:'抽屉里有一张明信片，邮戳却是明天的日期。', body:'你在空抽屉里找到了一张明信片。\n\n上面只有一句话：明天午后三点，请留在原地。\n\n字迹是你自己的。'},
    {id:'opening-6', title:'不设目的地', summary:'把地图折起来吧。这一次，让没走过的路决定方向。', body:'车票上的终点被墨水遮住了。\n\n坐在对面的人忽然笑了，把自己的那张递给你。\n\n「看来，我们要去同一个地方。」'},
  ]};
}
export function normalizeKinetic(input={}) {
  const t=kineticTheme(input.theme);
  const value={...kineticDefaults(t.id),...input};
  // Only retire the old factory palette. Keep custom colors and every content field.
  if(t.id==='pixel-dusk'){
    if(['#f5ec40','#c5b58b'].includes(String(value.accent).toLowerCase()))value.accent=t.accent;
    if(['#fff1d1','#ded8c8'].includes(String(value.ink).toLowerCase()))value.ink=t.ink;
  }
  const displayTitle=String(value.displayTitle??'NEXT\nCHAPTER').replace(/\r\n?/g,'\n').trim().slice(0,80);
  return {...normalizeFloral(value),theme:t.id,displayTitle};
}

function clockFace(d) {
  const ticks=Array.from({length:60},(_,i)=>`<line x1="260" y1="33" x2="260" y2="${i%5 ? 41 : 49}" transform="rotate(${i*6} 260 260)" class="${i%5 ? 'minor' : 'major'}"/>`).join('');
  const numbers=Array.from({length:12},(_,i)=>{const r=i*Math.PI/6;return `<text x="${260+195*Math.sin(r)}" y="${260-195*Math.cos(r)}">${i||12}</text>`;}).join('');
  const picks=d.entries.length>12?'':d.entries.map((e,i)=>{const rad=(i/d.entries.length)*Math.PI*2;return `<button class="clock-pick" data-select="${i}" style="--x:${50+27*Math.sin(rad)}%;--y:${50-27*Math.cos(rad)}%" aria-label="选择第${i+1}篇：${esc(e.title)}" aria-pressed="${i===0}">${num(i+1)}</button>`;}).join('');
  return `<div class="clock-object"><svg class="clock-face" viewBox="0 0 520 520" aria-hidden="true"><defs><linearGradient id="clock-metal" x2=".8" y2="1"><stop stop-color="#a8ada4"/><stop offset=".3" stop-color="#fafbf6"/><stop offset=".65" stop-color="#7c8379"/><stop offset="1" stop-color="#d5d8cc"/></linearGradient><radialGradient id="clock-paper" cx=".4" cy=".28" r=".8"><stop stop-color="#fcfcf5"/><stop offset="1" stop-color="#e8e9df"/></radialGradient></defs><circle class="clock-rim" cx="260" cy="260" r="254"/><circle class="clock-inner-rim" cx="260" cy="260" r="245"/><circle class="clock-dial-face" cx="260" cy="260" r="237"/><g class="ticks">${ticks}</g><g class="clock-hours">${numbers}</g><g class="clock-hand hour-hand" transform="rotate(302 260 260)"><path d="M255 284 L253 192 L257 156 L263 156 L267 192 L265 284 Z"/></g><g class="clock-hand minute-hand" transform="rotate(54 260 260)"><path d="M257 289 L256 115 L260 84 L264 115 L263 289 Z"/></g><g class="clock-hand second-hand"><path d="M260 304 L260 55"/><circle cx="260" cy="289" r="8"/></g><circle class="clock-pin" cx="260" cy="260" r="9"/><circle class="clock-pin-cap" cx="260" cy="260" r="3"/></svg>${picks}<span class="clock-inscription">MOMENT<br><small>STORY SELECTION CLOCK</small></span></div>`;
}
function entryCard(d,e,i) {
  return `<article class="scene-entry" data-entry="${i}" ${i?'hidden':''}><span class="entry-kicker">${d.theme==='pixel-dusk'?'停靠故事':d.theme==='signal-field'?'STORY CHANNEL':'此刻指向'} / ${num(i+1)}</span><h2>${esc(e.title)}</h2><div class="entry-description" data-edit-summary="${esc(e.id)}"><span class="description-label">本篇简介</span><p class="entry-summary">${esc(e.summary)}</p></div>${e.imageUrl?`<img class="entry-image" data-image-slot="${esc(e.id)}" src="${esc(e.imageUrl)}" alt="${esc(e.title)}配图" loading="lazy">`:''}<button data-target="${d.theme}-${e.id}" class="read-action"><span>${d.theme==='pixel-dusk'?'从这里出发':d.theme==='signal-field'?'接收这段故事':'从这一刻开始'}</span><span aria-hidden="true">↗</span></button></article>`;
}
function picks(d,mode='') {
  return `<nav class="story-picks ${mode}" aria-label="选择开场白">${d.entries.map((e,i)=>`<button data-select="${i}" aria-pressed="${i===0}"><span>${num(i+1)}</span><span>${esc(e.title)}</span>${d.theme==='pixel-dusk'?'<span class="pixel-arrow" aria-hidden="true">▶</span>':''}</button>`).join('')}</nav>`;
}
function intro(d) {return `<section class="work-intro" aria-label="作品介绍"><h2 class="description-label">作品介绍</h2><div class="work-intro-copy" data-edit-intro>${renderImageText(d.intro,esc)}</div>${d.imageUrl?`<img src="${esc(d.imageUrl)}" alt="作品配图" class="work-image">`:''}</section>`;}
function controls(label) {return `<button class="motion-toggle" data-motion aria-pressed="false">${label}</button>`;}
function clockHome(d,cards) {
  return `<header class="clock-header"><div><span class="micro">${esc(d.subtitle)}</span><h1>${esc(d.title)}</h1></div><span class="edition-stamp">VOL.<b>${num(d.entries.length)}</b><span>THE OPENING COLLECTION</span></span></header>${intro(d)}<div class="clock-layout"><div class="clock-stage">${clockFace(d)}<div class="clock-caption"><span><i class="live-dot"></i> <span data-motion-state>指针转动中</span></span>${controls('暂停指针')}</div></div><section class="clock-details"><div class="clock-index"><span data-current>01</span><span>/ ${num(d.entries.length)}</span><span class="tiny-cross">＋</span></div>${cards}${picks(d)}</section></div><footer class="scene-footer"><span>${esc(d.author)} / 开场时刻</span><span>红针选篇 · 点编号定位</span><span>↗</span></footer>`;
}
function pixelRadio(d) {
  const grille=Array.from({length:17},(_,y)=>Array.from({length:17},(_,x)=>{const r=Math.hypot(x-8,y-8);return r<=8.4?`<rect x="${x*3}" y="${y*3}" width="2" height="2" fill="${r>7?'#b7bc99':r>6?'#383f36':r>3?'#646f57':'#869272'}"/>`:'';}).join('')).join('');
  const bars=Array.from({length:16},(_,i)=>`<i style="--bar:${i};--level:${[42,67,89,55,100,71,39,82][i%8]}%"></i>`).join('');
  return `<div class="radio-set"><div class="radio-antenna" aria-hidden="true"></div><div class="radio-handle" aria-hidden="true"></div><div class="radio-case"><div class="radio-brand"><span>ELSEWHERE / FM</span><span class="radio-power">● STORY BAND</span></div><div class="radio-face"><div class="radio-speaker" aria-hidden="true"><svg viewBox="0 0 51 51" shape-rendering="crispEdges">${grille}</svg></div><div class="radio-display"><div class="lcd-top"><span>STEREO</span><span>CH <b data-current>01</b></span></div><div class="radio-frequency"><b data-radio-frequency>${d.entries.length?'88.0':'--.-'}</b><span>MHz</span></div><div class="radio-equalizer" aria-hidden="true">${bars}</div></div></div><div class="radio-tune"><label for="radio-tuner">TUNING <span>拖动调频 / 选择故事</span></label><div class="radio-scale" aria-hidden="true"><span>88</span><span>92</span><span>96</span><span>100</span><span>104</span><span>108</span></div><input id="radio-tuner" data-radio-tuner type="range" min="0" max="${Math.max(1,d.entries.length-1)}" step="1" value="0" ${d.entries.length<2?'disabled':''} aria-label="调频选择开场白"></div><div class="radio-controls"><div><span class="radio-model">STORY RECEIVER</span><span class="radio-small">VOL. ${num(d.entries.length)} / ${esc(d.author)}</span></div><button data-radio-step="-1" class="radio-step" aria-label="上一个故事频段" ${d.entries.length<2?'disabled':''}>◀</button><div class="radio-dial" aria-hidden="true"><i></i></div><button data-radio-step="1" class="radio-step" aria-label="下一个故事频段" ${d.entries.length<2?'disabled':''}>▶</button></div></div><div class="radio-feet" aria-hidden="true"></div></div>`;
}
function signalHome(d,cards) {
  return `<header class="signal-header"><span class="micro">■ ${esc(d.subtitle)}</span><span class="signal-top-right">${esc(d.author)} / ARCHIVE ${num(d.entries.length)}</span></header><div class="signal-title"><h1>${esc(d.title)}</h1><span>把偶然，调成同频。</span></div>${intro(d)}<div class="signal-display">${pixelRadio(d)}<section class="signal-console"><div class="scope-label"><span class="live-dot"></span> 已调到故事频段 <span class="scope-channel">CH <span data-current>01</span></span></div>${cards}</section></div><div class="signal-bottom"><span class="micro">PRESETS / 故事预设</span>${controls('暂停动态')}</div>${picks(d,'frequency-picks')}<footer class="scene-footer"><span>THERE IS A STORY IN EVERY FREQUENCY.</span><span>STORY RECEIVER / 01</span></footer>`;
}
// Each glyph reveals once; keep arbitrary user text accessible, including CJK fallback.
function pixelTitle(value,preview) {
  if(!value)return preview?'<div class="pixel-title is-empty" data-edit-display-title>点击填写顶部大字</div>':'';
  const glyphs={
    A:'01110/10001/10001/11111/10001/10001/10001',B:'11110/10001/10001/11110/10001/10001/11110',C:'01111/10000/10000/10000/10000/10000/01111',D:'11110/10001/10001/10001/10001/10001/11110',E:'11111/10000/10000/11110/10000/10000/11111',F:'11111/10000/10000/11110/10000/10000/10000',G:'01111/10000/10000/10111/10001/10001/01111',H:'10001/10001/10001/11111/10001/10001/10001',I:'11111/00100/00100/00100/00100/00100/11111',J:'00111/00010/00010/00010/10010/10010/01100',K:'10001/10010/10100/11000/10100/10010/10001',L:'10000/10000/10000/10000/10000/10000/11111',M:'10001/11011/10101/10101/10001/10001/10001',N:'10001/11001/10101/10011/10001/10001/10001',O:'01110/10001/10001/10001/10001/10001/01110',P:'11110/10001/10001/11110/10000/10000/10000',Q:'01110/10001/10001/10001/10101/10010/01101',R:'11110/10001/10001/11110/10100/10010/10001',S:'01111/10000/10000/01110/00001/00001/11110',T:'11111/00100/00100/00100/00100/00100/00100',U:'10001/10001/10001/10001/10001/10001/01110',V:'10001/10001/10001/10001/10001/01010/00100',W:'10001/10001/10001/10101/10101/11011/10001',X:'10001/10001/01010/00100/01010/10001/10001',Y:'10001/10001/01010/00100/00100/00100/00100',Z:'11111/00001/00010/00100/01000/10000/11111',
    '0':'01110/10001/10011/10101/11001/10001/01110','1':'00100/01100/00100/00100/00100/00100/01110','2':'01110/10001/00001/00010/00100/01000/11111','3':'11110/00001/00001/01110/00001/00001/11110','4':'00010/00110/01010/10010/11111/00010/00010','5':'11111/10000/10000/11110/00001/00001/11110','6':'01110/10000/10000/11110/10001/10001/01110','7':'11111/00001/00010/00100/01000/01000/01000','8':'01110/10001/10001/01110/10001/10001/01110','9':'01110/10001/10001/01111/00001/00001/01110',
    '!':'00100/00100/00100/00100/00100/00000/00100','?':'01110/10001/00001/00010/00100/00000/00100','.':'00000/00000/00000/00000/00000/00000/00100',',':'00000/00000/00000/00000/00000/00100/01000',':':'00000/00100/00000/00000/00100/00000/00000','-':'00000/00000/00000/11111/00000/00000/00000','/':'00001/00001/00010/00100/01000/10000/10000',"'":'00100/00100/01000/00000/00000/00000/00000'
  };
  let index=0;
  const lines=value.split('\n').map(line=>`<span class="pixel-title-line">${[...line].map(char=>{
    const rows=glyphs[char.toUpperCase()];
    const glyph=rows?`<svg viewBox="0 0 5 7" shape-rendering="crispEdges">${rows.split('/').map((row,y)=>[...row].map((v,x)=>v==='1'?`<rect x="${x}" y="${y}" width="1" height="1"/>`:'').join('')).join('')}</svg>`:esc(char===' '?'\u00a0':char);
    return `<span class="pixel-glyph${rows?'':' native-glyph'}" style="--char:${index++}">${glyph}</span>`;
  }).join('')||'&nbsp;'}</span>`).join('');
  return `<div class="pixel-title" data-edit-display-title role="img" aria-label="${esc(value)}"><span aria-hidden="true">${lines}</span></div>`;
}
function pixelHome(d,cards,preview) {
  const stations=d.entries.map((e,i)=>`<button class="rail-stop" data-select="${i}" aria-pressed="${i===0}"><span class="rail-stop-number">${num(i+1)}</span><span class="rail-stop-title">${esc(e.title)}</span></button>`).join('');
  // Cut a transparent gauge between the rails so the complete sleepers below stay visible.
  const railTrack=`<svg class="rail-track" aria-hidden="true"><defs><mask id="pixel-rail-gauge" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%" style="mask-type:luminance"><rect width="100%" height="100%" fill="#fff"/><path class="rail-route rail-gauge"/></mask></defs><path class="rail-route rail-ballast"/><path class="rail-route rail-sleepers"/><path class="rail-route rail-edges" mask="url(#pixel-rail-gauge)"/><g class="rail-buffer" data-rail-buffer><path d="M-3-13h6v26h-6zM-7-10h4v4h-4zm0 16h4v4h-4z"/></g><g class="rail-buffer" data-rail-buffer><path d="M-3-13h6v26h-6zM3-10h4v4h-4zm0 16h4v4h-4z"/></g></svg>`;
  return `<header class="pixel-header"><span>${esc(d.author)} / 故事候车室</span><span>VOL. ${num(d.entries.length)}</span>${controls('暂停动态')}</header><div class="pixel-heading">${pixelTitle(d.displayTitle,preview)}<div class="pixel-title-row"><h1>${esc(d.title)}</h1><span>${esc(d.subtitle)}</span></div></div>${intro(d)}<section class="railway-scene" aria-label="像素铁路"><div class="railway-caption"><span>STORY LOCAL <i>故事慢行线</i></span><span data-rail-status role="status">停靠 01</span></div><nav class="rail-map" data-rail-map aria-label="选择开场白">${railTrack}<div class="rail-stops">${stations}</div><div class="rail-car" data-rail-car aria-hidden="true">${pixelRailCar()}</div></nav><div class="railway-note"><span>沿着铁路，选一站出发。</span><span>第 <b data-current>01</b> 站 / ${num(d.entries.length)}</span></div></section><section class="station-story" aria-label="当前故事">${cards}</section><footer class="scene-footer"><span>${esc(d.author)} / 下一段旅程</span><span>慢一点，也没关系。</span></footer>`;
}

export function buildKineticPage(input={},pageId='home',options={}) {
  const d=normalizeKinetic(input),home=pageId==='home',e=d.entries.find(e=>e.id===pageId);
  if(!home&&!e)throw new Error('开场白不存在');
  const cards=d.entries.map((e,i)=>entryCard(d,e,i)).join('')||'<p class="empty-note">添加第一条开场白，开始这段故事。</p>';
  const runtimeArgs=[clockSelection.toString(),...(d.theme==='pixel-dusk'?[pixelRailwayRuntime.toString(),railwayLayout.toString(),railwayPoint.toString()]:[])].join(',');
  const back=`<button data-target="${d.theme}-home" class="back">← 返回${esc(d.title)}</button>`;
  const content=home?(d.theme==='soft-clock'?clockHome(d,cards):d.theme==='signal-field'?signalHome(d,cards):pixelHome(d,cards,options.preview)):`<header class="reading-top"><span class="micro">${esc(d.subtitle)}</span></header><div class="reading-number">${num(d.entries.indexOf(e)+1)}<span> / ${num(d.entries.length)}</span></div><article class="reading"><span class="micro">${d.theme==='pixel-dusk'?'旅程的这一页':d.theme==='signal-field'?'TRANSMISSION RECEIVED':'这一刻的故事'}</span><h1>${esc(e.title)}</h1><div class="reading-body">${renderImageText(e.body,esc)}</div>${e.imageUrl?`<img class="reading-image" src="${esc(e.imageUrl)}" alt="${esc(e.title)}配图">`:''}</article><footer class="reading-bottom"><span>${esc(d.author)} / ${esc(d.title)}</span>${back}</footer>`;
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(d.title)}</title><style>${kineticStyle(d)}</style></head><body><main class="kinetic ${d.theme}${home?'':' is-reading'}" data-theme="${d.theme}" data-selected="0" data-star-page="${d.theme}-${esc(pageId)}" data-motion-key="${esc(JSON.stringify([d.theme,d.title,d.author,d.entries.map(e=>e.id)]))}">${content}<div class="notice" role="status"></div></main><script data-kinetic-interaction>(${kineticInteraction.toString()})(${runtimeArgs});</script><script>const switchPage=${switchStarPage.toString()};document.querySelectorAll('[data-target]').forEach(button=>button.addEventListener('click',async()=>{const buttons=[...document.querySelectorAll('[data-target]')];buttons.forEach(b=>b.disabled=true);try{await switchPage(button.dataset.target,typeof getChatMessages==='function'?getChatMessages:window.TavernHelper?.getChatMessages,typeof setChatMessages==='function'?setChatMessages:window.TavernHelper?.setChatMessages);}catch(error){document.querySelector('.notice').textContent=error.message;}finally{buttons.forEach(b=>b.disabled=false);}}));</script></body></html>`;
}
export function buildKineticGreetingFields(input={}) {
  const d=normalizeKinetic(input),fence=html=>'```html\n'+html+'\n```';
  return {first_mes:fence(buildKineticPage(d)),alternate_greetings:d.entries.map(e=>fence(buildKineticPage(d,e.id)))};
}

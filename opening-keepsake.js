import { normalizeFloral } from './opening-floral-letter.js?v=0.11.39';
import { switchStarPage } from './opening-star-atlas.js?v=0.11.39';
import { renderImageText, httpsImageUrl } from './opening-image-tools.js';
import { keepsakeStyle } from './opening-keepsake-style.js?v=0.11.39';

export const KEEPSAKE_BOTANICAL_ART = 'https://raw.githubusercontent.com/jiuyi777/Zeya-Status-Atelier/opening-keepsake-artwork/assets/opening-keepsakes/pencil-chamomile.webp';
const localBotanicalArt = new URL('./assets/opening-keepsakes/pencil-chamomile.webp', import.meta.url).href;

export const KEEPSAKE_THEMES = [
  { id: 'cloth-book', name: '风藏书页', english: 'THE QUIET CHAPTER', description: '雾蓝布封 · 翻开一册小书', accent: '#a98653', ink: '#425a68', fontStyle: 'serif', action: '翻开小书', type: 'book' },
  { id: 'mixtape', name: '留声片刻', english: 'A SIDE OF OUR DAYS', description: '奶油墨绿 · 播放一段旧时光', accent: '#a76b43', ink: '#365b51', fontStyle: 'sans', action: '按下播放', type: 'tape' },
  { id: 'folded-map', name: '沿途拾光', english: 'SOMEWHERE WE BEGIN', description: '沙色地图 · 展开一段旅途', accent: '#af7654', ink: '#64705a', fontStyle: 'fangsong', action: '展开地图', type: 'map' },
  { id: 'vellum-page', name: '一页晴天', english: 'LIGHT THROUGH PAPER', description: '透纸叠色 · 揭开一页晴天', accent: '#bc9564', ink: '#617261', fontStyle: 'kai', action: '揭开描图纸', type: 'vellum' },
];
const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll('`', '&#96;');
export const keepsakeTheme = id => KEEPSAKE_THEMES.find(theme => theme.id === id) || KEEPSAKE_THEMES[0];

export function keepsakeDefaults(id) {
  const t = keepsakeTheme(id);
  return { theme: t.id, title: t.name, subtitle: t.english, author: '九一', intro: '留一点时间，给即将开始的故事。', accent: t.accent, ink: t.ink, fontStyle: t.fontStyle, fontSize: 17, imageUrl: '',
    entries: [
      { id: 'opening-1', title: '风停在这里', summary: '一次不期而遇，故事从此有了回声。', body: '风把窗边的纸页翻到了新的一面。\n\n你抬起头，恰好看见那个人停在门口，手里还握着一句没有说完的话。\n\n「原来你在这里。」' },
      { id: 'opening-2', title: '迟到的回音', summary: '那些尚未说出口的话，等一个重逢。', body: '那天留下的东西，你一直收得很好。\n\n直到多年后的一个午后，熟悉的笔迹再次出现。你展开它，才发现有些故事从未真正结束。' },
      { id: 'opening-3', title: '把明天留白', summary: '没有写好的结局，才值得重新出发。', body: '最后一班车还没有到站。\n\n你在空白的纸上写下第一个字，又轻轻划掉。远处有人向你招手，而这一次，你决定走过去。' },
    ] };
}

export function normalizeKeepsake(input = {}) {
  const t = keepsakeTheme(input.theme);
  const data = normalizeFloral({ ...keepsakeDefaults(t.id), ...input });
  data.theme = t.id;
  data.imageUrl = httpsImageUrl(data.imageUrl);
  data.entries = data.entries.map(entry => ({ ...entry, imageUrl: httpsImageUrl(entry.imageUrl) }));
  return data;
}

export function keepsakeInteraction() {
  const page = document.querySelector('.keepsake');
  const cover = page?.querySelector('.cover-stage');
  const sheet = page?.querySelector('.keepsake-sheet');
  const trigger = cover?.querySelector('[data-open]');
  if (!cover || !sheet || !trigger) return;
  let origin = performance.timeOrigin;
  try { origin = window.parent.performance.timeOrigin; } catch {}
  const key = 'status-atelier:keepsake:' + origin + ':' + page.dataset.keepsakeKey;
  function finish(focus) {
    cover.hidden = true; sheet.hidden = false; sheet.inert = false;
    page.dataset.state = 'open';
    try { sessionStorage.setItem(key, '1'); } catch {}
    page.dispatchEvent(new Event('keepsake-opened', { bubbles: true }));
    if (focus) sheet.querySelector('h1')?.focus({ preventScroll: true });
  }
  let opened = page.dataset.state === 'open';
  try { opened ||= sessionStorage.getItem(key) === '1'; } catch {}
  if (opened) { finish(false); return; }
  trigger.addEventListener('click', () => {
    if (page.dataset.state !== 'closed') return;
    trigger.disabled = true;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(true); return; }
    page.dataset.state = 'opening';
    const delay = page.dataset.kind === 'tape' ? 700 : 840;
    setTimeout(() => finish(true), delay);
  });
}

function coverMarkup(d, t, art) {
  const name = `<span class="object-title">${esc(d.title)}</span>`;
  const author = `<span class="object-author">${esc(d.author)} · 著</span>`;
  if (t.type === 'book') return `<span class="book-object"><span class="book-pages"></span><span class="book-front"><span class="cover-edition">${esc(d.subtitle)}</span><span class="book-label">${name}<span class="cover-line"></span>${author}</span><span class="book-foot">VOL. 01 &nbsp; / &nbsp; 故事集</span></span><span class="bookmark"></span></span>`;
  if (t.type === 'tape') return `<span class="tape-object"><span class="screw s1">×</span><span class="screw s2">×</span><span class="screw s3">×</span><span class="screw s4">×</span><span class="tape-label"><span class="tape-side">A<span>STEREO</span></span><span class="tape-name">${name}<span class="tape-sub">${esc(d.subtitle)}</span></span></span><span class="tape-window"><i class="reel"></i><span class="tape-strip"></span><i class="reel"></i></span><span class="tape-bottom"><i></i><span>NORMAL POSITION · C-${String(d.entries.length).padStart(2, '0')}</span><i></i></span></span>`;
  if (t.type === 'map') return `<span class="map-object"><span class="map-fold f1"></span><span class="map-fold f2"></span><span class="map-fold f3"></span><span class="map-road"></span><span class="map-dot dot1"></span><span class="map-dot dot2"></span><span class="map-tag"><span class="cover-edition">TRAVEL NOTES / 01</span>${name}<span>把故事写在途中</span></span><span class="compass">N<br>↑</span></span>`;
  return `<span class="vellum-object"><span class="vellum-under"><span>拾起光的形状</span><span>保存一个晴天</span></span><span class="vellum-overlay"><span class="vellum-caption">${esc(d.subtitle)}</span><span class="vellum-label">${name}<span class="cover-line"></span><span>写给，偶然翻开这一页的你</span></span><img class="pencil-botanical" src="${esc(art)}" alt="淡色彩铅小雏菊"><span class="vellum-seal">晴</span><span class="vellum-corner"></span></span><span class="paper-clip"></span></span>`;
}

function introMarkup(d, t) {
  return `<div class="intro-block"><span class="eyebrow">${esc(d.subtitle)}</span><h1 tabindex="-1">${esc(d.title)}</h1><div class="preface">${renderImageText(d.intro, esc)}</div>${d.imageUrl ? `<figure class="optional-image"><img src="${esc(d.imageUrl)}" alt="作品配图" loading="lazy"></figure>` : ''}<span class="byline">${esc(d.author)} <span>／</span> ${t.type === 'tape' ? '选录' : '著'}</span></div>`;
}

export function buildKeepsakePage(input = {}, pageId = 'home', options = {}) {
  const d = normalizeKeepsake(input), t = keepsakeTheme(d.theme), home = pageId === 'home';
  const entry = d.entries.find(item => item.id === pageId);
  if (!home && !entry) throw new Error('开场白不存在');
  const opened = !home || options.opened === true;
  const art = options.preview ? localBotanicalArt : KEEPSAKE_BOTANICAL_ART;
  const entries = d.entries.map((item, index) => `<article class="keepsake-entry"><span class="entry-number">${String(index + 1).padStart(2, '0')}</span><div class="entry-copy"><h2>${esc(item.title)}</h2>${item.summary ? `<p>${esc(item.summary)}</p>` : ''}${item.imageUrl ? `<img class="entry-image" src="${esc(item.imageUrl)}" alt="${esc(item.title)}配图" loading="lazy">` : ''}</div><button data-target="${t.id}-${item.id}" aria-label="阅读：${esc(item.title)}"><span aria-hidden="true">${t.type === 'tape' ? '▷' : '↗'}</span></button></article>`).join('');
  const directory = `<section class="directory"><div class="directory-head"><span>${{ book: '目 录', tape: 'SIDE A / 曲目', map: '从这里出发', vellum: '纸上的相遇' }[t.type]}</span><span>${String(d.entries.length).padStart(2, '0')} ${t.type === 'tape' ? 'TRACKS' : 'STORIES'}</span></div><div class="entry-list">${entries || '<p class="empty-note">这里等着你的第一段故事。</p>'}</div></section>`;
  const back = `<button data-target="${t.id}-home" class="back">← 返回${esc(d.title)}</button>`;
  const content = home ? `${introMarkup(d, t)}${directory}` : `<div class="reading-head"><span class="eyebrow">${String(d.entries.indexOf(entry) + 1).padStart(2, '0')} / ${esc(d.subtitle)}</span></div><article class="reading"><h1 tabindex="-1">${esc(entry.title)}</h1><div class="reading-body">${renderImageText(entry.body, esc)}</div>${entry.imageUrl ? `<figure class="optional-image"><img src="${esc(entry.imageUrl)}" alt="${esc(entry.title)}配图"></figure>` : ''}</article><div class="reading-foot"><span>${esc(d.author)}</span>${back}</div>`;
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(d.title)}</title><style>${keepsakeStyle(d, t)}</style></head><body><main class="keepsake k-${t.type}${home ? '' : ' is-reading'}" data-kind="${t.type}" data-state="${opened ? 'open' : 'closed'}" data-star-page="${t.id}-${esc(pageId)}" data-keepsake-key="${esc(JSON.stringify([t.id, d.title, d.author, d.entries.map(item => item.id)]))}">${home ? `<section class="cover-stage" ${opened ? 'hidden' : ''}><div class="cover-kicker"><span>${esc(t.english)}</span><span>COLLECTION / ${String(d.entries.length).padStart(2, '0')}</span></div><button type="button" class="open-object" data-open aria-label="${t.action}">${coverMarkup(d, t, art)}</button><span class="open-hint">${t.type === 'tape' ? '▷' : '↗'} &nbsp; ${t.action}</span></section>` : ''}<section class="keepsake-sheet" ${opened ? '' : 'hidden inert'}>${content}<footer class="sheet-footer"><span>${esc(d.subtitle)}</span><span>${home ? '序' : String(d.entries.indexOf(entry) + 1).padStart(2, '0')}</span></footer></section><div class="notice" role="status"></div></main><script data-keepsake-interaction>(${keepsakeInteraction.toString()})();</script><script>const switchPage=${switchStarPage.toString()};document.querySelectorAll('[data-target]').forEach(button=>button.addEventListener('click',async()=>{const buttons=[...document.querySelectorAll('[data-target]')];buttons.forEach(b=>b.disabled=true);try{await switchPage(button.dataset.target,typeof getChatMessages==='function'?getChatMessages:window.TavernHelper?.getChatMessages,typeof setChatMessages==='function'?setChatMessages:window.TavernHelper?.setChatMessages);}catch(error){document.querySelector('.notice').textContent=error.message;}finally{buttons.forEach(b=>b.disabled=false);}}));</script></body></html>`;
}

export function buildKeepsakeGreetingFields(input = {}) {
  const d = normalizeKeepsake(input), fence = html => '```html\n' + html + '\n```';
  return { first_mes: fence(buildKeepsakePage(d)), alternate_greetings: d.entries.map(entry => fence(buildKeepsakePage(d, entry.id))) };
}

const THEMES = new Set(['classical', 'newspaper', 'timeline', 'minimal', 'scroll', 'editorial', 'collage', 'dossier', 'glass', 'kinetic', 'noir-poster', 'negative-space']);
const FONTS = new Set(['serif', 'sans', 'kai', 'mono']);

export const OPENING_HOME_DEFAULTS = Object.freeze({
    ruleId: 'zeya-opening-home-v1',
    title: '作品导航',
    subtitle: 'STORY HOME',
    author: '九一',
    model: '填写模型名称',
    preset: '填写预设名称',
    intro: '这里填写整部作品的世界观、主要人物、故事背景与阅读提示。',
    theme: 'classical',
    font: 'serif',
    accent: '#9b3f32',
    background: '#f7f0df',
    cardBackground: '#fffaf0',
    text: '#3f3024',
    secondary: '#36526d',
    introBackground: '#e8e0d0',
    buttonColor: '#1a3048',
    worldlines: [],
    entries: [],
});

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function color(value, fallback) {
    return /^#[0-9a-f]{6}$/i.test(String(value || '')) ? String(value) : fallback;
}

function clean(value, fallback = '') {
    const normalized = String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
    return normalized || fallback;
}

function cleanMultiline(value, fallback = '') {
    const normalized = String(value ?? '')
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map(line => line.trimEnd())
        .join('\n')
        .trim();
    return normalized || fallback;
}

export function appendOpeningWorldline(openingHome, now = Date.now()) {
    openingHome.worldlines ??= [];
    const position = openingHome.worldlines.length + 1;
    const worldline = { id: `line-${now}-${position}`, name: `世界线 ${position}`, description: '', entries: [] };
    openingHome.worldlines.push(worldline);
    return worldline;
}

function escapeHtmlText(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/```/g, '&#96;&#96;&#96;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function staticMultiline(value, fallback = '—') {
    return escapeHtmlText(cleanMultiline(value, fallback)).replace(/\n/g, '<br>');
}

function staticIntro(value) {
    const lines = cleanMultiline(value, '—').split('\n').filter(line => line.trim());
    return lines.map(line => `<p>${escapeHtmlText(line)}</p>`).join('');
}

function contrastColor(value) {
    const normalized = /^#[0-9a-f]{6}$/i.test(value) ? value : '#e8e0d0';
    const number = Number.parseInt(normalized.slice(1), 16);
    const brightness = (number >> 16) * 299 + ((number >> 8) & 255) * 587 + (number & 255) * 114;
    return brightness > 150000 ? '#3f3024' : '#fffaf0';
}

export function normalizeOpeningHomeSettings(input = {}) {
    const defaults = clone(OPENING_HOME_DEFAULTS);
    const entries = Array.isArray(input.entries) ? input.entries : defaults.entries;
    const worldlines = Array.isArray(input.worldlines) ? input.worldlines : defaults.worldlines;
    const normalizedWorldlines = worldlines.map((worldline, index) => ({
        id: clean(worldline?.id, `line-${index + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_'),
        name: clean(worldline?.name, `世界线 ${index + 1}`),
        description: cleanMultiline(worldline?.description),
        entries: (Array.isArray(worldline?.entries) ? worldline.entries : []).map(entry => ({
            book: clean(entry?.book),
            uid: Math.max(0, Math.trunc(Number(entry?.uid) || 0)),
            title: clean(entry?.title, `UID ${Math.max(0, Math.trunc(Number(entry?.uid) || 0))}`),
        })).filter(entry => entry.book),
    }));
    return {
        ruleId: clean(input.ruleId, defaults.ruleId),
        title: clean(input.title, defaults.title),
        subtitle: clean(input.subtitle, defaults.subtitle),
        author: clean(input.author, defaults.author),
        model: cleanMultiline(input.model, defaults.model),
        preset: cleanMultiline(input.preset, defaults.preset),
        intro: cleanMultiline(input.intro, defaults.intro),
        theme: THEMES.has(input.theme) ? input.theme : defaults.theme,
        font: FONTS.has(input.font) ? input.font : defaults.font,
        accent: color(input.accent, defaults.accent),
        background: color(input.background, defaults.background),
        cardBackground: color(input.cardBackground, defaults.cardBackground),
        text: color(input.text, defaults.text),
        secondary: color(input.secondary, defaults.secondary),
        introBackground: color(input.introBackground, defaults.introBackground),
        buttonColor: color(input.buttonColor, defaults.buttonColor),
        worldlines: normalizedWorldlines,
        entries: entries.map((entry, index) => {
            const rawTarget = Number(entry?.target);
            return {
                number: clean(entry?.number, String(index + 1).padStart(2, '0')),
                title: clean(entry?.title, `开场白 ${index + 1}`),
                route: clean(entry?.route, '未分类线'),
                summary: clean(entry?.summary, '填写这条开场白的简介。'),
                target: Math.max(1, Math.trunc(Number.isFinite(rawTarget) ? rawTarget : index + 2)),
                worldlineId: clean(entry?.worldlineId),
            };
        }),
    };
}

export function buildOpeningHomeBlock(input) {
    normalizeOpeningHomeSettings(input);
    return '【主页】';
}

function replacementHtml(input) {
    const data = normalizeOpeningHomeSettings(input);
    const runtimePayload = encodeURIComponent(JSON.stringify({ entries: data.entries, worldlines: data.worldlines })).replace(/'/g, '%27');
    const rootStyle = `--zoh-accent:${data.accent};--zoh-bg:${data.background};--zoh-text:${data.text};--zoh-secondary:${data.secondary};--zoh-card:${data.cardBackground};--zoh-intro:${data.introBackground};--zoh-intro-text:${contrastColor(data.introBackground)};--zoh-button:${data.buttonColor}`;
    const staticWorldlines = data.worldlines.map(worldline => `<article class="zoh-worldline">
        <h3>${escapeHtmlText(worldline.name)}</h3>
        <p>${escapeHtmlText(worldline.description || '这条线路尚未填写介绍。')}</p>
      </article>`).join('\n      ');
    const worldlineSection = staticWorldlines ? `<section class="zoh-worldlines">
      <div class="zoh-worldlines-head"><h2>世界线介绍</h2><span>${data.worldlines.length} 条线路</span></div>
      <div class="zoh-worldline-list">${staticWorldlines}</div>
    </section>` : '';
    const staticEntries = data.entries.map((entry, index) => `<article class="zoh-entry" data-opening-index="${index}">
        <div class="zoh-number">${escapeHtmlText(entry.number)}</div>
        <div class="zoh-entry-copy"><div><h3 class="zoh-entry-title">${escapeHtmlText(entry.title)}</h3><span class="zoh-route">${escapeHtmlText(entry.route)}</span></div><p class="zoh-summary">${escapeHtmlText(entry.summary)}</p></div>
        <button class="zoh-jump" type="button">进入</button>
      </article>`).join('\n      ');
    const documentHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtmlText(data.title)}</title>
</head>
<body>
<div class="zoh-root" data-theme="${data.theme}" data-font="${data.font}" style="${rootStyle}">
  <section class="zoh-page">
    <header class="zoh-header">
      <h1 class="zoh-title">${escapeHtmlText(data.title)}</h1>
      <div class="zoh-subtitle">${escapeHtmlText(data.subtitle)}</div>
    </header>
    <div class="zoh-meta">
      <div><span>作者</span><strong class="zoh-author">${escapeHtmlText(data.author)}</strong></div>
      <div><span>推荐模型</span><strong class="zoh-model">${staticMultiline(data.model)}</strong></div>
      <div><span>推荐预设</span><strong class="zoh-preset">${staticMultiline(data.preset)}</strong></div>
    </div>
    <section class="zoh-intro"><h2>作品简介</h2><div class="zoh-intro-markdown">${staticIntro(data.intro)}</div></section>
    ${worldlineSection}
    <section class="zoh-directory">
      <div class="zoh-directory-head"><h2>开场白目录</h2><span class="zoh-count">共 ${data.entries.length} 条</span></div>
      <div class="zoh-list">${staticEntries}</div>
      <p class="zoh-notice" role="status" aria-live="polite"></p>
    </section>
  </section>
  <div class="zoh-switch-toast" role="status" aria-live="polite"></div>
</div>
<style>
.zoh-root,.zoh-root *{box-sizing:border-box}.zoh-root{--zoh-accent:#9b3f32;--zoh-bg:#f7f0df;--zoh-text:#3f3024;--zoh-secondary:#36526d;width:min(100%,680px);margin:14px auto;color:var(--zoh-text);font-family:"Noto Serif SC","Songti SC",serif;line-height:1.55}.zoh-root[data-font="sans"]{font-family:"Noto Sans SC","Microsoft YaHei",sans-serif}.zoh-root[data-font="kai"]{font-family:"LXGW WenKai","KaiTi","STKaiti",serif}.zoh-root[data-font="mono"]{font-family:"Noto Sans Mono CJK SC","Cascadia Mono",monospace}.zoh-page{position:relative;padding:18px;border:3px double var(--zoh-accent);background:var(--zoh-bg);box-shadow:0 12px 30px rgba(0,0,0,.2);overflow:hidden}.zoh-header{text-align:center;padding:10px 8px 16px;border-bottom:1px solid color-mix(in srgb,var(--zoh-accent) 45%,transparent)}.zoh-title{margin:0;font-size:clamp(1.8em,8vw,3.2em);line-height:1.12;letter-spacing:.12em}.zoh-subtitle{margin-top:6px;color:var(--zoh-accent);font:600 .76em/1.2 sans-serif;letter-spacing:.28em}.zoh-meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:13px 0}.zoh-meta>div{min-width:0;padding:10px;border:1px solid color-mix(in srgb,var(--zoh-accent) 30%,transparent);background:color-mix(in srgb,var(--zoh-bg) 88%,white)}.zoh-meta span,.zoh-meta strong{display:block}.zoh-meta span{color:var(--zoh-secondary);font-size:.72em;letter-spacing:.08em}.zoh-meta strong{margin-top:3px;overflow-wrap:anywhere;font-size:.92em}.zoh-intro{padding:16px;border:1px solid color-mix(in srgb,var(--zoh-secondary) 36%,transparent);background:color-mix(in srgb,var(--zoh-secondary) 8%,var(--zoh-bg))}.zoh-intro h2,.zoh-directory h2{margin:0;color:var(--zoh-accent);font-size:1.15em;letter-spacing:.14em}.zoh-intro p{margin:10px 0 0;white-space:pre-wrap}.zoh-directory{margin-top:18px}.zoh-directory-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-bottom:9px;border-bottom:1px solid color-mix(in srgb,var(--zoh-accent) 45%,transparent)}.zoh-count{color:var(--zoh-secondary);font-size:.84em}.zoh-list{display:grid;gap:9px;margin-top:10px}.zoh-entry{position:relative;display:grid;grid-template-columns:64px minmax(0,1fr) auto;gap:12px;align-items:center;padding:11px;border:1px solid color-mix(in srgb,var(--zoh-accent) 32%,transparent);background:color-mix(in srgb,var(--zoh-bg) 90%,white)}.zoh-number{font-size:1.85em;color:var(--zoh-accent);text-align:center}.zoh-entry-copy{min-width:0}.zoh-entry-title{display:inline;margin:0;font-size:1.08em}.zoh-summary{margin:5px 0 0;font-size:.85em;overflow-wrap:anywhere}.zoh-jump{min-width:64px;min-height:42px;padding:8px 12px;border:1px solid var(--zoh-accent);border-radius:7px;color:var(--zoh-bg);background:var(--zoh-accent);cursor:pointer;font:inherit;font-weight:700}.zoh-current{position:absolute;top:-1px;left:-1px;padding:2px 7px;color:var(--zoh-bg);background:var(--zoh-secondary);font-size:.68em}.zoh-notice{min-height:1.3em;margin:8px 0 0;color:var(--zoh-secondary);font-size:.8em;text-align:center}
.zoh-root[data-theme="newspaper"] .zoh-page{border:2px solid var(--zoh-text);background-image:radial-gradient(rgba(50,40,30,.055) .7px,transparent .7px);background-size:4px 4px}.zoh-root[data-theme="newspaper"] .zoh-header{border-top:5px double var(--zoh-text);border-bottom:5px double var(--zoh-text)}.zoh-root[data-theme="newspaper"] .zoh-title{letter-spacing:.04em}.zoh-root[data-theme="newspaper"] .zoh-meta>div{border-width:0 1px 0 0;background:transparent}.zoh-root[data-theme="newspaper"] .zoh-intro{border:1px dashed var(--zoh-text);background:transparent}.zoh-root[data-theme="newspaper"] .zoh-entry{border-radius:0;border-color:var(--zoh-text);background:transparent}.zoh-root[data-theme="newspaper"] .zoh-jump{border-radius:0}
.zoh-root[data-theme="timeline"] .zoh-page{border:1px solid color-mix(in srgb,var(--zoh-secondary) 55%,transparent);border-radius:22px}.zoh-root[data-theme="timeline"] .zoh-meta,.zoh-root[data-theme="timeline"] .zoh-intro,.zoh-root[data-theme="timeline"] .zoh-directory{position:relative;margin-left:24px}.zoh-root[data-theme="timeline"] .zoh-meta::before,.zoh-root[data-theme="timeline"] .zoh-intro::before,.zoh-root[data-theme="timeline"] .zoh-directory::before{content:"";position:absolute;left:-25px;top:-8px;bottom:-8px;width:1px;background:var(--zoh-secondary)}.zoh-root[data-theme="timeline"] .zoh-entry{border-radius:14px}.zoh-root[data-theme="timeline"] .zoh-entry::before{content:"";position:absolute;left:-18px;width:9px;height:9px;border:2px solid var(--zoh-bg);border-radius:50%;background:var(--zoh-secondary)}.zoh-root[data-theme="timeline"] .zoh-jump{border-radius:999px}
.zoh-root[data-theme="minimal"] .zoh-page{padding:24px;border:0;background:var(--zoh-bg);box-shadow:none}.zoh-root[data-theme="minimal"] .zoh-header{text-align:left}.zoh-root[data-theme="minimal"] .zoh-meta{grid-template-columns:1fr}.zoh-root[data-theme="minimal"] .zoh-meta>div{display:grid;grid-template-columns:100px minmax(0,1fr);padding:9px 0;border-width:0 0 1px;background:transparent}.zoh-root[data-theme="minimal"] .zoh-meta strong{margin:0}.zoh-root[data-theme="minimal"] .zoh-intro{border:0;border-left:2px solid var(--zoh-secondary);background:color-mix(in srgb,var(--zoh-secondary) 5%,var(--zoh-bg))}.zoh-root[data-theme="minimal"] .zoh-entry{border-width:0 0 1px;background:transparent}.zoh-root[data-theme="minimal"] .zoh-jump{border-radius:999px}
.zoh-root[data-theme="scroll"]{font-family:"FZKai-Z03","STKaiti","KaiTi",serif}.zoh-root[data-theme="scroll"] .zoh-page{padding:32px 24px;border:0;border-inline:14px solid color-mix(in srgb,var(--zoh-secondary) 70%,#4a301e);background:repeating-linear-gradient(90deg,transparent 0 31px,color-mix(in srgb,var(--zoh-accent) 8%,transparent) 31px 32px),var(--zoh-bg);box-shadow:inset 22px 0 30px -26px #4a301e,inset -22px 0 30px -26px #4a301e,0 16px 36px rgba(74,48,30,.22)}.zoh-root[data-theme="scroll"] .zoh-header{position:relative;padding:20px 52px 22px 12px;border:0;text-align:left}.zoh-root[data-theme="scroll"] .zoh-header::before{content:"卷首";position:absolute;left:12px;top:0;color:var(--zoh-secondary);font:700 .68em/1 "KaiTi",serif;letter-spacing:.5em}.zoh-root[data-theme="scroll"] .zoh-header::after{content:"印";position:absolute;right:4px;bottom:10px;display:grid;place-items:center;width:38px;height:38px;border:3px solid var(--zoh-accent);color:var(--zoh-accent);font:900 1.1em/1 "KaiTi",serif;transform:rotate(-8deg)}.zoh-root[data-theme="scroll"] .zoh-title{font-size:clamp(2em,8vw,3.8em);font-weight:500;line-height:1.05;letter-spacing:.24em}.zoh-root[data-theme="scroll"] .zoh-meta{grid-template-columns:repeat(3,1fr);gap:8px}.zoh-root[data-theme="scroll"] .zoh-meta>div{border:0;background:color-mix(in srgb,var(--zoh-card) 58%,transparent);box-shadow:inset 0 -5px var(--zoh-secondary);text-align:center}.zoh-root[data-theme="scroll"] .zoh-intro{border:0;background:color-mix(in srgb,var(--zoh-intro) 88%,transparent);box-shadow:8px 8px 0 color-mix(in srgb,var(--zoh-secondary) 50%,transparent);clip-path:polygon(2% 0,98% 0,100% 12%,100% 88%,98% 100%,2% 100%,0 88%,0 12%)}.zoh-root[data-theme="scroll"] .zoh-worldline{border:0;background:color-mix(in srgb,var(--zoh-card) 74%,transparent);box-shadow:inset 6px 0 var(--zoh-secondary)}.zoh-root[data-theme="scroll"] .zoh-entry{border:0;background:color-mix(in srgb,var(--zoh-card) 84%,transparent);box-shadow:inset 7px 0 var(--zoh-accent),4px 4px 0 color-mix(in srgb,var(--zoh-secondary) 20%,transparent)}.zoh-root[data-theme="scroll"] .zoh-number{font:500 2em/1 "STKaiti","KaiTi",serif}.zoh-root[data-theme="scroll"] .zoh-jump{border:0;border-radius:0;clip-path:polygon(12% 0,88% 0,100% 18%,100% 82%,88% 100%,12% 100%,0 82%,0 18%)}
.zoh-root[data-theme="editorial"]{font-family:"Aptos Display","Microsoft YaHei UI",sans-serif}.zoh-root[data-theme="editorial"] .zoh-page{padding:22px;border:7px solid var(--zoh-text);background:var(--zoh-bg);box-shadow:14px 14px 0 var(--zoh-accent)}.zoh-root[data-theme="editorial"] .zoh-header{padding:8px 0 18px;border:0;border-bottom:12px solid var(--zoh-text);text-align:left}.zoh-root[data-theme="editorial"] .zoh-title{max-width:8em;font-family:Impact,"Arial Black","Microsoft YaHei",sans-serif;font-size:clamp(2.6em,11vw,5.4em);font-weight:950;line-height:.78;letter-spacing:-.09em;text-transform:uppercase}.zoh-root[data-theme="editorial"] .zoh-subtitle{display:inline-block;margin-top:15px;padding:6px 11px;color:var(--zoh-bg);background:var(--zoh-accent);font-family:"Arial Black",sans-serif;letter-spacing:.12em;transform:skew(-8deg)}.zoh-root[data-theme="editorial"] .zoh-meta{grid-template-columns:1.2fr 1fr 1fr;gap:7px}.zoh-root[data-theme="editorial"] .zoh-meta>div{border:0;background:var(--zoh-text);color:var(--zoh-bg)}.zoh-root[data-theme="editorial"] .zoh-meta span{color:var(--zoh-secondary)}.zoh-root[data-theme="editorial"] .zoh-intro{display:grid;grid-template-columns:minmax(110px,.4fr) minmax(0,1fr);gap:16px;border:0;background:var(--zoh-intro);box-shadow:inset 12px 0 var(--zoh-accent);text-align:left}.zoh-root[data-theme="editorial"] .zoh-intro h2{font:950 1.9em/.85 Impact,"Arial Black",sans-serif;text-transform:uppercase}.zoh-root[data-theme="editorial"] .zoh-worldline{border:0;background:var(--zoh-card);box-shadow:6px 6px 0 var(--zoh-secondary)}.zoh-root[data-theme="editorial"] .zoh-entry{border:0;background:var(--zoh-card);box-shadow:inset 0 -6px var(--zoh-accent)}.zoh-root[data-theme="editorial"] .zoh-number{font:950 3em/.8 Impact,"Arial Black",sans-serif;color:var(--zoh-text)}.zoh-root[data-theme="editorial"] .zoh-entry-title{font-family:"Arial Black","Microsoft YaHei",sans-serif;font-weight:900}.zoh-root[data-theme="editorial"] .zoh-jump{border:0;border-radius:0;box-shadow:5px 5px 0 var(--zoh-secondary);font-family:"Arial Black",sans-serif}
.zoh-root[data-theme="collage"]{font-family:"Comic Sans MS","STKaiti","KaiTi",cursive}.zoh-root[data-theme="collage"] .zoh-page{padding:26px;border:0;background:radial-gradient(circle at 12% 9%,color-mix(in srgb,var(--zoh-secondary) 30%,transparent) 0 24px,transparent 25px),linear-gradient(15deg,transparent 0 67%,color-mix(in srgb,var(--zoh-accent) 14%,transparent) 67% 72%,transparent 72%),var(--zoh-bg);box-shadow:12px 12px 0 var(--zoh-secondary),-8px -8px 0 var(--zoh-intro)}.zoh-root[data-theme="collage"] .zoh-header{position:relative;margin:10px 24px 22px 5px;border:0;background:var(--zoh-card);box-shadow:9px 9px 0 var(--zoh-accent);text-align:left;transform:rotate(-1.5deg)}.zoh-root[data-theme="collage"] .zoh-header::before{content:"";position:absolute;left:38%;top:-13px;width:88px;height:24px;background:color-mix(in srgb,var(--zoh-secondary) 38%,transparent);transform:rotate(3deg)}.zoh-root[data-theme="collage"] .zoh-title{font-family:"Comic Sans MS","STKaiti","KaiTi",cursive;font-size:clamp(2em,9vw,4em);font-weight:800;letter-spacing:.08em}.zoh-root[data-theme="collage"] .zoh-subtitle{display:inline-block;padding:3px 9px;background:var(--zoh-intro);font-family:"Comic Sans MS",cursive;transform:rotate(2deg)}.zoh-root[data-theme="collage"] .zoh-meta{grid-template-columns:repeat(3,1fr);gap:13px}.zoh-root[data-theme="collage"] .zoh-meta>div{border:0;background:var(--zoh-card);box-shadow:5px 5px 0 color-mix(in srgb,var(--zoh-text) 30%,transparent);transform:rotate(-1deg)}.zoh-root[data-theme="collage"] .zoh-meta>div:nth-child(2){background:color-mix(in srgb,var(--zoh-intro) 82%,white);transform:rotate(2deg)}.zoh-root[data-theme="collage"] .zoh-meta>div:nth-child(3){background:color-mix(in srgb,var(--zoh-secondary) 26%,white);transform:rotate(-2deg)}.zoh-root[data-theme="collage"] .zoh-intro{margin:10px 8px 22px 22px;border:0;background:var(--zoh-intro);box-shadow:-10px 10px 0 var(--zoh-secondary);text-align:left;transform:rotate(.8deg);clip-path:polygon(0 4%,96% 0,100% 94%,4% 100%)}.zoh-root[data-theme="collage"] .zoh-worldline{border:0;background:var(--zoh-card);box-shadow:6px 6px 0 var(--zoh-accent);transform:rotate(-1deg)}.zoh-root[data-theme="collage"] .zoh-list{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.zoh-root[data-theme="collage"] .zoh-entry{grid-template-columns:42px minmax(0,1fr);border:0;background:var(--zoh-card);box-shadow:7px 7px 0 var(--zoh-accent);transform:rotate(-1deg);clip-path:polygon(0 0,97% 2%,100% 96%,3% 100%)}.zoh-root[data-theme="collage"] .zoh-entry:nth-child(even){background:color-mix(in srgb,var(--zoh-card) 80%,var(--zoh-intro));box-shadow:7px 7px 0 var(--zoh-secondary);transform:rotate(1deg)}.zoh-root[data-theme="collage"] .zoh-jump{grid-column:2;justify-self:end;border:0;border-radius:999px;font-family:"Comic Sans MS","Microsoft YaHei",sans-serif;font-weight:800}
.zoh-root[data-theme="dossier"]{font-family:Bahnschrift,"Cascadia Mono","Microsoft YaHei UI",monospace}.zoh-root[data-theme="dossier"] .zoh-page{padding:23px;border:0;background:repeating-linear-gradient(0deg,transparent 0 29px,rgba(255,255,255,.025) 29px 30px),var(--zoh-bg);box-shadow:0 0 0 9px #070707,14px 14px 0 var(--zoh-button)}.zoh-root[data-theme="dossier"] .zoh-header{position:relative;padding:13px 12px 17px;border:0;background:linear-gradient(90deg,var(--zoh-button) 0 12px,transparent 12px);text-align:left}.zoh-root[data-theme="dossier"] .zoh-header::before{content:"RESTRICTED / ARCHIVE";display:block;margin-bottom:10px;color:var(--zoh-accent);font:700 .68em/1 "Cascadia Mono",monospace;letter-spacing:.2em}.zoh-root[data-theme="dossier"] .zoh-title{font-family:Bahnschrift,"Arial Black","Microsoft YaHei UI",sans-serif;font-size:clamp(2em,9vw,4.2em);font-weight:900;line-height:.9;letter-spacing:.04em;text-shadow:3px 3px 0 var(--zoh-button)}.zoh-root[data-theme="dossier"] .zoh-meta{grid-template-columns:repeat(3,1fr);gap:8px;background:transparent}.zoh-root[data-theme="dossier"] .zoh-meta>div{border:0;background:var(--zoh-card);box-shadow:inset 0 5px var(--zoh-accent)}.zoh-root[data-theme="dossier"] .zoh-intro{border:0;border-left:12px solid var(--zoh-button);background:var(--zoh-intro);box-shadow:7px 7px 0 #090909;text-align:left}.zoh-root[data-theme="dossier"] .zoh-worldline{border:0;background:var(--zoh-card);box-shadow:inset 7px 0 var(--zoh-accent)}.zoh-root[data-theme="dossier"] .zoh-entry{border:0;background:var(--zoh-card);box-shadow:inset 8px 0 var(--zoh-accent)}.zoh-root[data-theme="dossier"] .zoh-entry:nth-child(even){box-shadow:inset 8px 0 var(--zoh-button)}.zoh-root[data-theme="dossier"] .zoh-number{font:900 1.8em/1 Bahnschrift,"Cascadia Mono",monospace}.zoh-root[data-theme="dossier"] .zoh-entry-title{font-family:Bahnschrift,"Microsoft YaHei UI",sans-serif;font-weight:900;letter-spacing:.04em}.zoh-root[data-theme="dossier"] .zoh-jump{border:0;border-radius:0;background:var(--zoh-button);font-family:"Cascadia Mono",monospace;text-transform:uppercase;clip-path:polygon(10% 0,100% 0,100% 82%,90% 100%,0 100%,0 18%)}
.zoh-root[data-theme="glass"]{font-family:"Segoe UI Variable Text","Microsoft YaHei UI",sans-serif}.zoh-root[data-theme="glass"] .zoh-page{padding:24px;border:0;border-radius:34px;background:linear-gradient(145deg,rgba(255,255,255,.62),rgba(255,255,255,.12)),var(--zoh-bg);box-shadow:0 24px 55px rgba(35,83,91,.24),inset 0 1px 0 rgba(255,255,255,.9);backdrop-filter:blur(16px)}.zoh-root[data-theme="glass"] .zoh-page::before{content:"";position:absolute;right:-70px;top:-60px;width:190px;height:190px;border-radius:50%;background:radial-gradient(circle at 35% 35%,rgba(255,255,255,.8),color-mix(in srgb,var(--zoh-secondary) 28%,transparent) 48%,transparent 70%);pointer-events:none}.zoh-root[data-theme="glass"] .zoh-page>*{position:relative}.zoh-root[data-theme="glass"] .zoh-header{border:0;border-radius:26px;background:linear-gradient(135deg,color-mix(in srgb,var(--zoh-card) 78%,transparent),rgba(255,255,255,.3));box-shadow:0 14px 32px rgba(40,96,105,.12),inset 0 1px rgba(255,255,255,.95)}.zoh-root[data-theme="glass"] .zoh-title{font-family:"Segoe UI Variable Display","Microsoft YaHei UI",sans-serif;font-size:clamp(2em,8vw,3.8em);font-weight:300;letter-spacing:.18em}.zoh-root[data-theme="glass"] .zoh-subtitle{font-weight:700}.zoh-root[data-theme="glass"] .zoh-meta{grid-template-columns:repeat(3,1fr);gap:10px}.zoh-root[data-theme="glass"] .zoh-meta>div{border:0;border-radius:18px;background:color-mix(in srgb,var(--zoh-card) 68%,transparent);box-shadow:0 12px 24px rgba(40,96,105,.1),inset 0 1px rgba(255,255,255,.95)}.zoh-root[data-theme="glass"] .zoh-intro{border:0;border-radius:24px;background:color-mix(in srgb,var(--zoh-intro) 64%,transparent);box-shadow:0 16px 30px rgba(40,96,105,.1),inset 0 1px rgba(255,255,255,.82);text-align:left}.zoh-root[data-theme="glass"] .zoh-worldline{border:0;border-radius:18px;background:color-mix(in srgb,var(--zoh-card) 68%,transparent);box-shadow:0 10px 22px rgba(40,96,105,.1)}.zoh-root[data-theme="glass"] .zoh-entry{border:0;border-radius:20px;background:color-mix(in srgb,var(--zoh-card) 70%,transparent);box-shadow:0 12px 26px rgba(40,96,105,.12),inset 0 1px rgba(255,255,255,.9)}.zoh-root[data-theme="glass"] .zoh-entry-title{font-weight:750}.zoh-root[data-theme="glass"] .zoh-jump{border:0;border-radius:999px;box-shadow:0 8px 18px rgba(40,96,105,.24)}
.zoh-root[data-theme="kinetic"]{font-family:"Arial Narrow","Microsoft YaHei UI",sans-serif}.zoh-root[data-theme="kinetic"] .zoh-page{display:grid;grid-template-columns:minmax(0,.78fr) minmax(0,1.22fr);gap:18px;padding:28px;border:0;background:linear-gradient(163deg,transparent 0 43%,color-mix(in srgb,var(--zoh-intro) 42%,transparent) 43% 57%,transparent 57%),var(--zoh-bg);box-shadow:0 18px 42px rgba(16,44,158,.18)}.zoh-root[data-theme="kinetic"] .zoh-header{grid-column:1/-1;position:relative;min-height:205px;padding:28px 58px 20px 18px;border:0;text-align:left}.zoh-root[data-theme="kinetic"] .zoh-header::before{content:"";position:absolute;left:-60px;right:12%;top:50%;height:4px;background:var(--zoh-accent);transform:rotate(8deg);transform-origin:left}.zoh-root[data-theme="kinetic"] .zoh-title{position:relative;max-width:9em;font-family:Impact,"Arial Black",sans-serif;font-size:clamp(3em,13vw,6.8em);font-style:italic;font-weight:950;line-height:.72;letter-spacing:-.07em;text-transform:uppercase;transform:rotate(-7deg);text-shadow:18px 22px 9px color-mix(in srgb,var(--zoh-secondary) 52%,transparent)}.zoh-root[data-theme="kinetic"] .zoh-subtitle{position:absolute;right:7px;bottom:28px;margin:0;writing-mode:vertical-rl;color:var(--zoh-text);font:700 .72em/1.1 Georgia,serif;letter-spacing:.18em}.zoh-root[data-theme="kinetic"] .zoh-meta{grid-column:1;grid-template-columns:1fr;align-self:start;margin:0}.zoh-root[data-theme="kinetic"] .zoh-meta>div{border:0;background:transparent;box-shadow:inset 5px 0 var(--zoh-accent)}.zoh-root[data-theme="kinetic"] .zoh-intro{grid-column:2;align-self:end;border:0;background:var(--zoh-card);box-shadow:10px 10px 0 var(--zoh-accent);text-align:left}.zoh-root[data-theme="kinetic"] :is(.zoh-worldlines,.zoh-directory){grid-column:1/-1}.zoh-root[data-theme="kinetic"] .zoh-directory-head{border:0;transform:skew(-8deg)}.zoh-root[data-theme="kinetic"] .zoh-list{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.zoh-root[data-theme="kinetic"] .zoh-entry{grid-template-columns:54px minmax(0,1fr);border:0;background:var(--zoh-card);box-shadow:inset 0 -5px var(--zoh-accent)}.zoh-root[data-theme="kinetic"] .zoh-number{font:900 2.7em/.8 Impact,"Arial Black",sans-serif;transform:skew(-9deg)}.zoh-root[data-theme="kinetic"] .zoh-jump{grid-column:2;justify-self:end;border:0;border-radius:0;transform:skew(-8deg)}
.zoh-root[data-theme="noir-poster"]{font-family:"Arial Narrow","Microsoft YaHei UI",sans-serif}.zoh-root[data-theme="noir-poster"] .zoh-page{display:grid;grid-template-columns:112px minmax(0,1fr);gap:15px;padding:0;border:0;background:linear-gradient(148deg,var(--zoh-bg) 0 36%,#0b0909 36% 39%,var(--zoh-card) 39% 100%);box-shadow:14px 14px 0 #090707}.zoh-root[data-theme="noir-poster"] .zoh-header{grid-column:1;grid-row:1/4;display:flex;align-items:center;justify-content:center;min-height:440px;padding:20px 10px;border:0;background:#0b0909;text-align:left}.zoh-root[data-theme="noir-poster"] .zoh-title{writing-mode:vertical-rl;font-family:Impact,"Arial Black","Microsoft YaHei",sans-serif;font-size:clamp(2.2em,7vw,4em);font-weight:950;line-height:.9;letter-spacing:.1em;text-transform:uppercase}.zoh-root[data-theme="noir-poster"] .zoh-subtitle{position:absolute;left:10px;bottom:14px;writing-mode:vertical-rl;color:var(--zoh-accent);font:700 .66em/1 monospace;letter-spacing:.16em}.zoh-root[data-theme="noir-poster"] .zoh-meta{grid-column:2;grid-template-columns:repeat(3,1fr);margin:22px 18px 0 0}.zoh-root[data-theme="noir-poster"] .zoh-meta>div{border:0;background:#0b0909;color:var(--zoh-text);box-shadow:inset 0 6px var(--zoh-accent)}.zoh-root[data-theme="noir-poster"] .zoh-intro{grid-column:2;margin-right:18px;border:0;background:var(--zoh-intro);box-shadow:inset 12px 0 var(--zoh-accent);text-align:left}.zoh-root[data-theme="noir-poster"] :is(.zoh-worldlines,.zoh-directory){grid-column:1/-1;margin:10px 20px 20px}.zoh-root[data-theme="noir-poster"] .zoh-worldline{border:0;background:#0b0909;box-shadow:inset 6px 0 var(--zoh-accent)}.zoh-root[data-theme="noir-poster"] .zoh-directory-head{border:0}.zoh-root[data-theme="noir-poster"] .zoh-list{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.zoh-root[data-theme="noir-poster"] .zoh-entry{grid-template-columns:56px minmax(0,1fr);border:0;background:#0b0909;box-shadow:inset 0 -7px var(--zoh-accent)}.zoh-root[data-theme="noir-poster"] .zoh-number{font:950 3.2em/.8 Impact,"Arial Black",sans-serif;color:var(--zoh-accent)}.zoh-root[data-theme="noir-poster"] .zoh-jump{grid-column:2;justify-self:end;border:0;border-radius:0;color:#0b0909;background:var(--zoh-text)}
.zoh-root[data-theme="negative-space"]{font-family:"Aptos","Microsoft YaHei UI",sans-serif}.zoh-root[data-theme="negative-space"] .zoh-page{display:grid;grid-template-columns:1fr 1fr minmax(150px,.65fr);gap:20px;padding:28px;border:3px solid var(--zoh-text);background:var(--zoh-bg);box-shadow:none}.zoh-root[data-theme="negative-space"] .zoh-header{grid-column:1/3;position:relative;display:flex;flex-direction:column;justify-content:flex-end;min-height:260px;padding:22px 20px;border:0;background:linear-gradient(90deg,var(--zoh-card) 0 42%,transparent 42%);text-align:left}.zoh-root[data-theme="negative-space"] .zoh-header::before{content:"LAYOUT / DESIGN";position:absolute;left:14px;top:14px;padding:4px 7px;color:var(--zoh-bg);background:var(--zoh-text);font:700 .64em/1 Arial,sans-serif;letter-spacing:.08em}.zoh-root[data-theme="negative-space"] .zoh-title{margin-left:38%;font-size:clamp(2.1em,8vw,4em);font-weight:500;line-height:.92;letter-spacing:.02em}.zoh-root[data-theme="negative-space"] .zoh-subtitle{margin-left:38%;color:var(--zoh-text);letter-spacing:.16em}.zoh-root[data-theme="negative-space"] .zoh-meta{grid-column:3;grid-row:1/3;grid-template-columns:1fr;align-content:start;margin:0}.zoh-root[data-theme="negative-space"] .zoh-meta>div{padding:14px 0;border:0;border-top:5px solid var(--zoh-text);background:transparent}.zoh-root[data-theme="negative-space"] .zoh-intro{grid-column:1/3;min-height:210px;border:0;background:linear-gradient(90deg,var(--zoh-intro) 0 35%,var(--zoh-card) 35% 100%);color:var(--zoh-bg);text-align:left}.zoh-root[data-theme="negative-space"] .zoh-intro h2{color:var(--zoh-bg)}.zoh-root[data-theme="negative-space"] :is(.zoh-worldlines,.zoh-directory){grid-column:1/-1}.zoh-root[data-theme="negative-space"] .zoh-directory-head{justify-content:flex-start;border:0}.zoh-root[data-theme="negative-space"] .zoh-count{margin-left:auto}.zoh-root[data-theme="negative-space"] .zoh-list{grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.zoh-root[data-theme="negative-space"] .zoh-entry{display:flex;min-height:190px;flex-direction:column;align-items:flex-start;border:0;background:transparent;box-shadow:inset 0 8px var(--zoh-text)}.zoh-root[data-theme="negative-space"] .zoh-entry:nth-child(3n+2){margin-top:42px;background:var(--zoh-intro)}.zoh-root[data-theme="negative-space"] .zoh-number{font:300 3.6em/1 Georgia,serif;color:var(--zoh-text)}.zoh-root[data-theme="negative-space"] .zoh-jump{margin-top:auto;border:0;border-radius:0}
.zoh-root:is([data-theme="scroll"],[data-theme="editorial"],[data-theme="collage"],[data-theme="dossier"],[data-theme="glass"],[data-theme="kinetic"],[data-theme="noir-poster"],[data-theme="negative-space"]) :is(.zoh-worldlines-head,.zoh-directory-head,.zoh-route){border:0}.zoh-root:is([data-theme="scroll"],[data-theme="editorial"],[data-theme="collage"],[data-theme="dossier"],[data-theme="glass"],[data-theme="kinetic"],[data-theme="noir-poster"],[data-theme="negative-space"]) .zoh-route{padding:3px 9px;background:color-mix(in srgb,var(--zoh-secondary) 18%,transparent);font-weight:700}
@media(max-width:560px){.zoh-page{padding:13px}.zoh-meta{grid-template-columns:1fr}.zoh-entry{grid-template-columns:48px minmax(0,1fr)}.zoh-number{font-size:1.45em}.zoh-jump{grid-column:2;justify-self:end;min-width:88px}.zoh-root[data-theme="minimal"] .zoh-meta>div{grid-template-columns:88px minmax(0,1fr)}.zoh-root[data-theme="scroll"] .zoh-page{padding:20px 13px;border-inline-width:7px}.zoh-root[data-theme="scroll"] .zoh-meta,.zoh-root[data-theme="editorial"] .zoh-meta,.zoh-root[data-theme="collage"] .zoh-meta,.zoh-root[data-theme="dossier"] .zoh-meta,.zoh-root[data-theme="glass"] .zoh-meta{grid-template-columns:1fr}.zoh-root[data-theme="editorial"] .zoh-page{padding:14px;box-shadow:6px 6px 0 var(--zoh-accent)}.zoh-root[data-theme="editorial"] .zoh-intro{grid-template-columns:1fr}.zoh-root[data-theme="collage"] .zoh-page{padding:15px}.zoh-root[data-theme="collage"] .zoh-list{grid-template-columns:1fr}.zoh-root[data-theme="collage"] .zoh-entry{grid-template-columns:42px minmax(0,1fr)}.zoh-root[data-theme="dossier"] .zoh-page,.zoh-root[data-theme="glass"] .zoh-page{padding:14px}.zoh-root:is([data-theme="kinetic"],[data-theme="noir-poster"],[data-theme="negative-space"]) .zoh-page{display:block;padding:14px}.zoh-root[data-theme="kinetic"] .zoh-header{min-height:180px;padding-inline:10px 45px}.zoh-root[data-theme="kinetic"] .zoh-meta{margin:12px 0}.zoh-root[data-theme="kinetic"] .zoh-list,.zoh-root[data-theme="noir-poster"] .zoh-list,.zoh-root[data-theme="negative-space"] .zoh-list{grid-template-columns:1fr}.zoh-root[data-theme="noir-poster"] .zoh-page{background:linear-gradient(155deg,var(--zoh-bg) 0 26%,var(--zoh-card) 26%)}.zoh-root[data-theme="noir-poster"] .zoh-header{display:block;min-height:0;margin:-14px -14px 14px;padding:22px;background:#0b0909}.zoh-root[data-theme="noir-poster"] .zoh-title,.zoh-root[data-theme="noir-poster"] .zoh-subtitle{position:static;writing-mode:horizontal-tb}.zoh-root[data-theme="noir-poster"] .zoh-meta,.zoh-root[data-theme="noir-poster"] .zoh-intro,.zoh-root[data-theme="noir-poster"] :is(.zoh-worldlines,.zoh-directory){margin:14px 0}.zoh-root[data-theme="negative-space"] .zoh-header{min-height:220px}.zoh-root[data-theme="negative-space"] .zoh-meta{margin:14px 0}.zoh-root[data-theme="negative-space"] .zoh-intro{min-height:0}.zoh-root[data-theme="negative-space"] .zoh-entry:nth-child(3n+2){margin-top:0}}@media(prefers-reduced-motion:reduce){.zoh-root *{scroll-behavior:auto!important}}
.zoh-root{--zoh-card:#fffaf0;--zoh-intro:#e8e0d0;--zoh-intro-text:#3f3024;--zoh-button:#1a3048}.zoh-model,.zoh-preset{white-space:pre-line}.zoh-meta>div,.zoh-entry{background:var(--zoh-card)}.zoh-intro{color:var(--zoh-intro-text);background:var(--zoh-intro)}.zoh-intro h2{color:inherit}.zoh-intro-markdown{margin-top:10px}.zoh-intro-markdown p,.zoh-intro-markdown ul,.zoh-intro-markdown h4,.zoh-intro-markdown h5,.zoh-intro-markdown h6{margin:.45em 0}.zoh-intro-markdown ul{padding-left:1.35em}.zoh-intro-markdown code{padding:.08em .3em;border-radius:4px;background:color-mix(in srgb,currentColor 9%,transparent)}.zoh-jump{background:var(--zoh-button)}
.zoh-worldlines{margin-top:18px}.zoh-worldlines h2{margin:0;color:var(--zoh-accent);font-size:1.15em;letter-spacing:.14em}.zoh-worldlines-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-bottom:9px;border-bottom:1px solid color-mix(in srgb,var(--zoh-accent) 45%,transparent)}.zoh-worldlines-head span{color:var(--zoh-secondary);font-size:.84em}.zoh-worldline-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:10px}.zoh-worldline{padding:12px;border-left:3px solid var(--zoh-secondary);background:color-mix(in srgb,var(--zoh-card) 88%,transparent)}.zoh-worldline h3{margin:0;color:var(--zoh-accent);font-size:1em}.zoh-worldline p{margin:6px 0 0;white-space:pre-wrap;font-size:.84em}.zoh-route{display:inline-block;margin-left:7px;padding:1px 7px;border-radius:999px;color:var(--zoh-secondary);background:color-mix(in srgb,var(--zoh-secondary) 10%,transparent);font-size:.7em}.zoh-switch-toast{position:fixed;z-index:20;right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));left:max(14px,env(safe-area-inset-left));max-width:620px;margin:auto;padding:11px 14px;border:1px solid var(--zoh-secondary);border-radius:10px;color:var(--zoh-bg);background:color-mix(in srgb,var(--zoh-text) 92%,transparent);box-shadow:0 8px 24px rgba(0,0,0,.28);opacity:0;pointer-events:none;transform:translateY(8px);transition:opacity .18s ease,transform .18s ease}.zoh-switch-toast.is-visible{opacity:1;transform:none}.zoh-switch-toast.is-error{border-color:#c75b55;background:#6f2722}
@media(max-width:560px){.zoh-worldline-list{grid-template-columns:1fr}}@media(prefers-reduced-motion:reduce){.zoh-switch-toast{transition:none!important}}
</style>
<script>
(function(script){
  var root=script.previousElementSibling.previousElementSibling;if(!root||!root.classList.contains('zoh-root'))return;
  var payload=JSON.parse(decodeURIComponent('${runtimePayload}'));var openings=payload.entries||[];var worldlines=payload.worldlines||[];
  var host=root.querySelector('.zoh-list');var notice=root.querySelector('.zoh-notice');var toast=root.querySelector('.zoh-switch-toast');var toastTimer;var topWindow=window.parent&&window.parent!==window?window.parent:window;var ctx=topWindow.SillyTavern?.getContext?.();var current=Number(ctx?.chat?.[0]?.swipe_id)+1;
  function make(tag,className,value){var el=document.createElement(tag);if(className)el.className=className;if(value!==undefined)el.textContent=String(value);return el;}
  function api(name){if(name==='getChatMessages'&&typeof getChatMessages==='function')return getChatMessages;if(name==='setChatMessages'&&typeof setChatMessages==='function')return setChatMessages;if(name==='updateWorldbookWith'&&typeof updateWorldbookWith==='function')return updateWorldbookWith;if(name==='setLorebookEntries'&&typeof setLorebookEntries==='function')return setLorebookEntries;var sources=[window,window.TavernHelper,topWindow,topWindow.TavernHelper];for(var i=0;i<sources.length;i++){var source=sources[i];if(source&&typeof source[name]==='function')return source[name].bind(source);}return null;}
  function bindingKey(item){return String(item.book||'')+'::'+String(item.uid??'');}function quote(value){return JSON.stringify(String(value||''));}
  function showSwitchToast(message,isError){var notifier=topWindow?.toastr;var method=isError?'error':'success';if(notifier&&typeof notifier[method]==='function'){notifier[method](message);return;}var topDoc=topWindow?.document;var persistent=topDoc?.getElementById?.('zoh-global-switch-toast');if(!persistent&&topDoc?.body?.append&&topDoc?.createElement){persistent=topDoc.createElement('div');persistent.id='zoh-global-switch-toast';persistent.setAttribute?.('role','status');persistent.setAttribute?.('aria-live','polite');persistent.style.cssText='position:fixed;z-index:100000;left:max(14px,env(safe-area-inset-left));right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));max-width:620px;margin:auto;padding:11px 14px;border-radius:10px;color:#fff;background:#26332f;box-shadow:0 8px 24px rgba(0,0,0,.3);font:14px/1.5 sans-serif';topDoc.body.append(persistent);}var target=persistent||toast;if(!target)return;if(typeof clearTimeout==='function')clearTimeout(toastTimer);target.textContent=message;if(target===toast){target.classList?.toggle?.('is-error',Boolean(isError));target.classList?.add?.('is-visible');}else{target.style.background=isError?'#6f2722':'#26332f';target.hidden=false;}if(typeof setTimeout==='function')toastTimer=setTimeout(function(){if(target===toast)target.classList?.remove?.('is-visible');else target.hidden=true;},6500);}
  function bindingLabel(item){return String(item.book||'世界书')+' · UID '+String(item.uid)+' · '+String(item.title||('UID '+item.uid));}
  async function applyWorldline(live,opening){if(!worldlines.length)return null;var selectedId=opening.worldlineId||'';if(!selectedId)return null;var selectedLine=worldlines.find(function(line){return line.id===selectedId;});if(!selectedLine||!Array.isArray(selectedLine.entries)||!selectedLine.entries.length)return null;var desired=new Map();worldlines.forEach(function(line){(Array.isArray(line.entries)?line.entries:[]).forEach(function(item){desired.set(bindingKey(item),{item:item,enabled:line.id===selectedId});});});var report={name:selectedLine.name||opening.route||'当前线路',enabled:[],disabled:[]};desired.forEach(function(value){(value.enabled?report.enabled:report.disabled).push(bindingLabel(value.item));});var grouped=new Map();desired.forEach(function(value){var item=value.item;if(!item.book||item.uid===undefined)return;if(!grouped.has(item.book))grouped.set(item.book,[]);grouped.get(item.book).push({uid:Number(item.uid),enabled:value.enabled});});var updateBook=api('updateWorldbookWith');if(updateBook){for(var group of grouped.entries()){var states=new Map(group[1].map(function(item){return [item.uid,item.enabled];}));await updateBook(group[0],function(entries){return entries.map(function(entry){var enabled=states.get(Number(entry.uid));return enabled===undefined?entry:Object.assign({},entry,{enabled:enabled});});});}return report;}var setEntries=api('setLorebookEntries');if(setEntries){for(var legacyGroup of grouped.entries())await setEntries(legacyGroup[0],legacyGroup[1]);return report;}if(live?.executeSlashCommandsWithOptions){for(var value of desired.values()){var item=value.item;if(!item.book||item.uid===undefined)continue;await live.executeSlashCommandsWithOptions('/setentryfield file='+quote(item.book)+' uid='+Number(item.uid)+' field=disable '+(value.enabled?'false':'true'));}return report;}throw new Error('酒馆助手没有提供世界书 UID 修改接口');}
  async function jump(oneBased,opening){try{notice.textContent='正在切换开场白…';var live=topWindow.SillyTavern?.getContext?.();var target=Math.max(0,Number(oneBased)-1);var getMessages=api('getChatMessages');if(getMessages){var rows=await getMessages('0',{include_swipes:true});var helperSwipes=rows?.[0]?.swipes;if(Array.isArray(helperSwipes)&&helperSwipes.length)target=Math.min(helperSwipes.length-1,target);}var bindingReport=null;try{bindingReport=await applyWorldline(live,opening);}catch(bindingError){console.warn('世界书线路绑定失败，继续切换开场白:',bindingError);showSwitchToast('世界书线路切换失败；开场白仍会继续跳转',true);}var setMessages=api('setChatMessages');if(setMessages){await setMessages([{message_id:0,swipe_id:target}]);}else{var message=live?.chat?.[0];var swipes=message?.swipes;if(!live?.swipe||!Array.isArray(swipes)||!swipes.length)throw new Error('当前环境没有可用的开场白切换接口');target=Math.min(swipes.length-1,target);var now=Math.max(0,Math.min(swipes.length-1,Number(message.swipe_id||0)));var messageEl=topWindow.document.querySelector('#chat .mes[mesid="0"]');if(!messageEl)throw new Error('聊天第1条尚未加载');var direction=target>now?'right':'left';for(var step=0;step<Math.abs(target-now);step++){await live.swipe[direction].call(messageEl,null,{source:'jiuyi-opening-home',message:message});}}if(bindingReport){showSwitchToast('已切换“'+bindingReport.name+'”｜启用：'+(bindingReport.enabled.join('；')||'无')+'｜关闭：'+(bindingReport.disabled.join('；')||'无'),false);}notice.textContent='已进入：'+String(opening.title||'当前开场白');topWindow.document.querySelector('#chat .mes[mesid="0"]')?.scrollIntoView({behavior:'smooth',block:'center'});}catch(error){notice.textContent=error?.message||'跳转失败';showSwitchToast(notice.textContent,true);}}
  var staticCards=host.querySelectorAll('.zoh-entry');openings.forEach(function(entry,index){var article=staticCards[index];if(!article)return;var target=Math.max(1,Number(entry.target)||index+2);if(target===current)article.prepend(make('span','zoh-current','当前'));var button=article.querySelector('.zoh-jump');if(button)button.addEventListener('click',async function(){await jump(target,entry);});});
})(document.currentScript);
</script>
</body>
</html>`.trim();
    return ['```html', documentHtml, '```'].join('\n');
}

export function buildOpeningHomeRegex(input = {}) {
    const data = normalizeOpeningHomeSettings(input);
    return {
        id: data.ruleId,
        scriptName: '九一 · 通用开场白主页',
        disabled: false,
        runOnEdit: true,
        findRegex: '/【主页】/s',
        trimStrings: [],
        replaceString: replacementHtml(data),
        placement: [1, 2],
        substituteRegex: 0,
        minDepth: null,
        maxDepth: null,
        markdownOnly: true,
        promptOnly: false,
    };
}

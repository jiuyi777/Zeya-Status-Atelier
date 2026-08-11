const THEMES = new Set(['classical', 'newspaper', 'timeline', 'minimal']);
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
    const runtimePayload = encodeURIComponent(JSON.stringify({ entries: data.entries, worldlines: data.worldlines }));
    const rootStyle = `--zoh-accent:${data.accent};--zoh-bg:${data.background};--zoh-text:${data.text};--zoh-secondary:${data.secondary};--zoh-card:${data.cardBackground};--zoh-intro:${data.introBackground};--zoh-intro-text:${contrastColor(data.introBackground)};--zoh-button:${data.buttonColor}`;
    const staticEntries = data.entries.map((entry, index) => `<article class="zoh-entry" data-opening-index="${index}">
        <div class="zoh-number">${escapeHtmlText(entry.number)}</div>
        <div class="zoh-entry-copy"><h3 class="zoh-entry-title">${escapeHtmlText(entry.title)}</h3><p class="zoh-summary">${escapeHtmlText(entry.summary)}</p></div>
        <button class="zoh-jump" type="button">进入</button>
      </article>`).join('\n      ');
    return `<div class="zoh-root" data-theme="${data.theme}" data-font="${data.font}" style="${rootStyle}">
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
    <section class="zoh-directory">
      <div class="zoh-directory-head"><h2>开场白目录</h2><span class="zoh-count">共 ${data.entries.length} 条</span></div>
      <div class="zoh-list">${staticEntries}</div>
      <p class="zoh-notice" role="status" aria-live="polite"></p>
    </section>
  </section>
</div>
<style>
.zoh-root,.zoh-root *{box-sizing:border-box}.zoh-root{--zoh-accent:#9b3f32;--zoh-bg:#f7f0df;--zoh-text:#3f3024;--zoh-secondary:#36526d;width:min(100%,680px);margin:14px auto;color:var(--zoh-text);font-family:"Noto Serif SC","Songti SC",serif;line-height:1.55}.zoh-root[data-font="sans"]{font-family:"Noto Sans SC","Microsoft YaHei",sans-serif}.zoh-root[data-font="kai"]{font-family:"LXGW WenKai","KaiTi","STKaiti",serif}.zoh-root[data-font="mono"]{font-family:"Noto Sans Mono CJK SC","Cascadia Mono",monospace}.zoh-page{position:relative;padding:18px;border:3px double var(--zoh-accent);background:var(--zoh-bg);box-shadow:0 12px 30px rgba(0,0,0,.2);overflow:hidden}.zoh-header{text-align:center;padding:10px 8px 16px;border-bottom:1px solid color-mix(in srgb,var(--zoh-accent) 45%,transparent)}.zoh-title{margin:0;font-size:clamp(1.8em,8vw,3.2em);line-height:1.12;letter-spacing:.12em}.zoh-subtitle{margin-top:6px;color:var(--zoh-accent);font:600 .76em/1.2 sans-serif;letter-spacing:.28em}.zoh-meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:13px 0}.zoh-meta>div{min-width:0;padding:10px;border:1px solid color-mix(in srgb,var(--zoh-accent) 30%,transparent);background:color-mix(in srgb,var(--zoh-bg) 88%,white)}.zoh-meta span,.zoh-meta strong{display:block}.zoh-meta span{color:var(--zoh-secondary);font-size:.72em;letter-spacing:.08em}.zoh-meta strong{margin-top:3px;overflow-wrap:anywhere;font-size:.92em}.zoh-intro{padding:16px;border:1px solid color-mix(in srgb,var(--zoh-secondary) 36%,transparent);background:color-mix(in srgb,var(--zoh-secondary) 8%,var(--zoh-bg))}.zoh-intro h2,.zoh-directory h2{margin:0;color:var(--zoh-accent);font-size:1.15em;letter-spacing:.14em}.zoh-intro p{margin:10px 0 0;white-space:pre-wrap}.zoh-directory{margin-top:18px}.zoh-directory-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-bottom:9px;border-bottom:1px solid color-mix(in srgb,var(--zoh-accent) 45%,transparent)}.zoh-count{color:var(--zoh-secondary);font-size:.84em}.zoh-list{display:grid;gap:9px;margin-top:10px}.zoh-entry{position:relative;display:grid;grid-template-columns:64px minmax(0,1fr) auto;gap:12px;align-items:center;padding:11px;border:1px solid color-mix(in srgb,var(--zoh-accent) 32%,transparent);background:color-mix(in srgb,var(--zoh-bg) 90%,white)}.zoh-number{font-size:1.85em;color:var(--zoh-accent);text-align:center}.zoh-entry-copy{min-width:0}.zoh-entry-title{display:inline;margin:0;font-size:1.08em}.zoh-summary{margin:5px 0 0;font-size:.85em;overflow-wrap:anywhere}.zoh-jump{min-width:64px;min-height:42px;padding:8px 12px;border:1px solid var(--zoh-accent);border-radius:7px;color:var(--zoh-bg);background:var(--zoh-accent);cursor:pointer;font:inherit;font-weight:700}.zoh-current{position:absolute;top:-1px;left:-1px;padding:2px 7px;color:var(--zoh-bg);background:var(--zoh-secondary);font-size:.68em}.zoh-notice{min-height:1.3em;margin:8px 0 0;color:var(--zoh-secondary);font-size:.8em;text-align:center}
.zoh-root[data-theme="newspaper"] .zoh-page{border:2px solid var(--zoh-text);background-image:radial-gradient(rgba(50,40,30,.055) .7px,transparent .7px);background-size:4px 4px}.zoh-root[data-theme="newspaper"] .zoh-header{border-top:5px double var(--zoh-text);border-bottom:5px double var(--zoh-text)}.zoh-root[data-theme="newspaper"] .zoh-title{letter-spacing:.04em}.zoh-root[data-theme="newspaper"] .zoh-meta>div{border-width:0 1px 0 0;background:transparent}.zoh-root[data-theme="newspaper"] .zoh-intro{border:1px dashed var(--zoh-text);background:transparent}.zoh-root[data-theme="newspaper"] .zoh-entry{border-radius:0;border-color:var(--zoh-text);background:transparent}.zoh-root[data-theme="newspaper"] .zoh-jump{border-radius:0}
.zoh-root[data-theme="timeline"] .zoh-page{border:1px solid color-mix(in srgb,var(--zoh-secondary) 55%,transparent);border-radius:22px}.zoh-root[data-theme="timeline"] .zoh-meta,.zoh-root[data-theme="timeline"] .zoh-intro,.zoh-root[data-theme="timeline"] .zoh-directory{position:relative;margin-left:24px}.zoh-root[data-theme="timeline"] .zoh-meta::before,.zoh-root[data-theme="timeline"] .zoh-intro::before,.zoh-root[data-theme="timeline"] .zoh-directory::before{content:"";position:absolute;left:-25px;top:-8px;bottom:-8px;width:1px;background:var(--zoh-secondary)}.zoh-root[data-theme="timeline"] .zoh-entry{border-radius:14px}.zoh-root[data-theme="timeline"] .zoh-entry::before{content:"";position:absolute;left:-18px;width:9px;height:9px;border:2px solid var(--zoh-bg);border-radius:50%;background:var(--zoh-secondary)}.zoh-root[data-theme="timeline"] .zoh-jump{border-radius:999px}
.zoh-root[data-theme="minimal"] .zoh-page{padding:24px;border:0;background:var(--zoh-bg);box-shadow:none}.zoh-root[data-theme="minimal"] .zoh-header{text-align:left}.zoh-root[data-theme="minimal"] .zoh-meta{grid-template-columns:1fr}.zoh-root[data-theme="minimal"] .zoh-meta>div{display:grid;grid-template-columns:100px minmax(0,1fr);padding:9px 0;border-width:0 0 1px;background:transparent}.zoh-root[data-theme="minimal"] .zoh-meta strong{margin:0}.zoh-root[data-theme="minimal"] .zoh-intro{border:0;border-left:2px solid var(--zoh-secondary);background:color-mix(in srgb,var(--zoh-secondary) 5%,var(--zoh-bg))}.zoh-root[data-theme="minimal"] .zoh-entry{border-width:0 0 1px;background:transparent}.zoh-root[data-theme="minimal"] .zoh-jump{border-radius:999px}
@media(max-width:560px){.zoh-page{padding:13px}.zoh-meta{grid-template-columns:1fr}.zoh-entry{grid-template-columns:48px minmax(0,1fr)}.zoh-number{font-size:1.45em}.zoh-jump{grid-column:2;justify-self:end;min-width:88px}.zoh-root[data-theme="minimal"] .zoh-meta>div{grid-template-columns:88px minmax(0,1fr)}}@media(prefers-reduced-motion:reduce){.zoh-root *{scroll-behavior:auto!important}}
.zoh-root{--zoh-card:#fffaf0;--zoh-intro:#e8e0d0;--zoh-intro-text:#3f3024;--zoh-button:#1a3048}.zoh-model,.zoh-preset{white-space:pre-line}.zoh-meta>div,.zoh-entry{background:var(--zoh-card)}.zoh-intro{color:var(--zoh-intro-text);background:var(--zoh-intro)}.zoh-intro h2{color:inherit}.zoh-intro-markdown{margin-top:10px}.zoh-intro-markdown p,.zoh-intro-markdown ul,.zoh-intro-markdown h4,.zoh-intro-markdown h5,.zoh-intro-markdown h6{margin:.45em 0}.zoh-intro-markdown ul{padding-left:1.35em}.zoh-intro-markdown code{padding:.08em .3em;border-radius:4px;background:color-mix(in srgb,currentColor 9%,transparent)}.zoh-jump{background:var(--zoh-button)}
</style>
<script>
(function(script){
  var root=script.previousElementSibling.previousElementSibling;if(!root||!root.classList.contains('zoh-root'))return;
  var payload=JSON.parse(decodeURIComponent('${runtimePayload}'));var openings=payload.entries||[];var worldlines=payload.worldlines||[];
  var host=root.querySelector('.zoh-list');var notice=root.querySelector('.zoh-notice');var topWindow=window.parent&&window.parent!==window?window.parent:window;var ctx=topWindow.SillyTavern?.getContext?.();var current=Number(ctx?.chat?.[0]?.swipe_id)+1;
  function make(tag,className,value){var el=document.createElement(tag);if(className)el.className=className;if(value!==undefined)el.textContent=String(value);return el;}
  function api(name){var sources=[window,window.TavernHelper,topWindow,topWindow.TavernHelper];for(var i=0;i<sources.length;i++){var source=sources[i];if(source&&typeof source[name]==='function')return source[name].bind(source);}return null;}
  function bindingKey(item){return String(item.book||'')+'::'+String(item.uid??'');}function quote(value){return JSON.stringify(String(value||''));}
  async function applyWorldline(live,opening){if(!worldlines.length)return;var selectedId=opening.worldlineId||'';if(!selectedId)return;var desired=new Map();worldlines.forEach(function(line){(Array.isArray(line.entries)?line.entries:[]).forEach(function(item){desired.set(bindingKey(item),{item:item,enabled:line.id===selectedId});});});var setEntries=api('setLorebookEntries');if(setEntries){var grouped=new Map();desired.forEach(function(value){var item=value.item;if(!item.book||item.uid===undefined)return;if(!grouped.has(item.book))grouped.set(item.book,[]);grouped.get(item.book).push({uid:Number(item.uid),enabled:value.enabled});});for(var group of grouped.entries())await setEntries(group[0],group[1]);return;}if(live?.executeSlashCommandsWithOptions){for(var value of desired.values()){var item=value.item;if(!item.book||item.uid===undefined)continue;await live.executeSlashCommandsWithOptions('/setentryfield file='+quote(item.book)+' uid='+Number(item.uid)+' field=disable '+(value.enabled?'false':'true'));}return;}throw new Error('酒馆助手没有提供世界书 UID 修改接口');}
  async function jump(oneBased,opening){try{notice.textContent='正在切换开场白…';var live=topWindow.SillyTavern?.getContext?.();var target=Math.max(0,Number(oneBased)-1);var getMessages=api('getChatMessages');if(getMessages){var rows=await getMessages('0',{include_swipes:true});var helperSwipes=rows?.[0]?.swipes;if(Array.isArray(helperSwipes)&&helperSwipes.length)target=Math.min(helperSwipes.length-1,target);}await applyWorldline(live,opening);var setMessages=api('setChatMessages');if(setMessages){await setMessages([{message_id:0,swipe_id:target}],{refresh:'affected'});}else{var message=live?.chat?.[0];var swipes=message?.swipes;if(!live?.swipe||!Array.isArray(swipes)||!swipes.length)throw new Error('当前环境没有可用的开场白切换接口');target=Math.min(swipes.length-1,target);var now=Math.max(0,Math.min(swipes.length-1,Number(message.swipe_id||0)));var messageEl=topWindow.document.querySelector('#chat .mes[mesid="0"]');if(!messageEl)throw new Error('聊天第1条尚未加载');var direction=target>now?'right':'left';for(var step=0;step<Math.abs(target-now);step++){await live.swipe[direction].call(messageEl,null,{source:'jiuyi-opening-home',message:message});}}topWindow.document.querySelector('#chat .mes[mesid="0"]')?.scrollIntoView({behavior:'smooth',block:'center'});}catch(error){notice.textContent=error?.message||'跳转失败';}}
  var staticCards=host.querySelectorAll('.zoh-entry');openings.forEach(function(entry,index){var article=staticCards[index];if(!article)return;var target=Math.max(1,Number(entry.target)||index+2);if(target===current)article.prepend(make('span','zoh-current','当前'));var button=article.querySelector('.zoh-jump');if(button)button.addEventListener('click',async function(){await jump(target,entry);});});
})(document.currentScript);
</script>`.trim();
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
        placement: [2],
        substituteRegex: 0,
        minDepth: null,
        maxDepth: null,
        markdownOnly: true,
        promptOnly: false,
    };
}

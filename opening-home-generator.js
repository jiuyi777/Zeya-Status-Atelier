const THEMES = new Set(['classical', 'newspaper', 'timeline', 'minimal']);
const FONTS = new Set(['serif', 'sans', 'kai', 'mono']);

export const OPENING_HOME_DEFAULTS = Object.freeze({
    ruleId: 'zeya-opening-home-v1',
    title: '作品导航',
    subtitle: 'STORY HOME',
    author: 'Zeya',
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
    introBackground: '#1a3048',
    buttonColor: '#1a3048',
    worldlines: [],
    entries: [
        { number: '01', title: '雨夜初遇', characters: '角色A · 角色B', summary: '第一次相遇的故事线。', target: 2, worldlineId: '', extraEntries: [] },
        { number: '02', title: '旧城重逢', characters: '角色A · 角色B', summary: '多年以后再次见面的故事线。', target: 3, worldlineId: '', extraEntries: [] },
        { number: '03', title: '另一种可能', characters: '角色A · 角色B', summary: '从不同选择开始的故事线。', target: 4, worldlineId: '', extraEntries: [] },
    ],
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
        .map(line => line.trim())
        .filter(Boolean)
        .join('\n');
    return normalized || fallback;
}

function escapeValue(value) {
    return clean(value)
        .replace(/\\/g, '\\\\')
        .replace(/\|/g, '\\|')
        .replace(/\]/g, '\\]');
}

function escapeMultilineValue(value) {
    return cleanMultiline(value)
        .replace(/\\/g, '\\\\')
        .replace(/\|/g, '\\|')
        .replace(/\]/g, '\\]');
}

export function normalizeOpeningHomeSettings(input = {}) {
    const defaults = clone(OPENING_HOME_DEFAULTS);
    const entries = Array.isArray(input.entries) ? input.entries : defaults.entries;
    const worldlines = Array.isArray(input.worldlines) ? input.worldlines : defaults.worldlines;
    const normalizedWorldlines = worldlines.map((worldline, index) => ({
        id: clean(worldline?.id, `line-${index + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_'),
        name: clean(worldline?.name, `世界线 ${index + 1}`),
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
                characters: clean(entry?.characters, '填写涉及人物'),
                summary: clean(entry?.summary, '填写这条开场白的简介。'),
                target: Math.max(1, Math.trunc(Number.isFinite(rawTarget) ? rawTarget : index + 2)),
                worldlineId: clean(entry?.worldlineId),
                extraEntries: (Array.isArray(entry?.extraEntries) ? entry.extraEntries : []).map(extra => ({
                    book: clean(extra?.book),
                    uid: Math.max(0, Math.trunc(Number(extra?.uid) || 0)),
                    title: clean(extra?.title, `UID ${Math.max(0, Math.trunc(Number(extra?.uid) || 0))}`),
                })).filter(extra => extra.book),
            };
        }),
    };
}

export function buildOpeningHomeBlock(input) {
    const data = normalizeOpeningHomeSettings(input);
    const lines = [
        '<opening_home>',
        `[Meta|${escapeValue(data.title)}|${escapeValue(data.subtitle)}|${escapeValue(data.author)}|${escapeMultilineValue(data.model)}|${escapeMultilineValue(data.preset)}]`,
        `[Style|${data.theme}|${data.font}|${data.accent}|${data.background}|${data.text}|${data.secondary}|${data.cardBackground}|${data.introBackground}|${data.buttonColor}]`,
        `[Intro|${escapeMultilineValue(data.intro)}]`,
        ...data.worldlines.map(worldline => `[Worldline|${escapeValue(worldline.id)}|${escapeValue(worldline.name)}|${encodeURIComponent(JSON.stringify(worldline.entries))}]`),
        ...data.entries.map(entry => `[Opening|${escapeValue(entry.number)}|${escapeValue(entry.title)}|${escapeValue(entry.characters)}|${escapeValue(entry.summary)}|${entry.target}|${escapeValue(entry.worldlineId)}|${encodeURIComponent(JSON.stringify(entry.extraEntries))}]`),
        '</opening_home>',
    ];
    return lines.join('\n');
}

function replacementHtml() {
    return `\`\`\`html
<div class="zoh-root">
  <textarea class="zoh-source" hidden>$1</textarea>
  <section class="zoh-page">
    <header class="zoh-header">
      <h1 class="zoh-title"></h1>
      <div class="zoh-subtitle"></div>
    </header>
    <div class="zoh-meta">
      <div><span>作者</span><strong class="zoh-author"></strong></div>
      <div><span>推荐模型</span><strong class="zoh-model"></strong></div>
      <div><span>推荐预设</span><strong class="zoh-preset"></strong></div>
    </div>
    <section class="zoh-intro"><h2>作品简介</h2><p></p></section>
    <section class="zoh-directory">
      <div class="zoh-directory-head"><h2>开场白目录</h2><span class="zoh-count"></span></div>
      <div class="zoh-list"></div>
      <p class="zoh-notice" role="status" aria-live="polite"></p>
    </section>
  </section>
</div>
<style>
.zoh-root,.zoh-root *{box-sizing:border-box}.zoh-root{--zoh-accent:#9b3f32;--zoh-bg:#f7f0df;--zoh-text:#3f3024;--zoh-secondary:#36526d;width:min(100%,680px);margin:14px auto;color:var(--zoh-text);font-family:"Noto Serif SC","Songti SC",serif;line-height:1.55}.zoh-root[data-font="sans"]{font-family:"Noto Sans SC","Microsoft YaHei",sans-serif}.zoh-root[data-font="kai"]{font-family:"LXGW WenKai","KaiTi","STKaiti",serif}.zoh-root[data-font="mono"]{font-family:"Noto Sans Mono CJK SC","Cascadia Mono",monospace}.zoh-page{position:relative;padding:18px;border:3px double var(--zoh-accent);background:var(--zoh-bg);box-shadow:0 12px 30px rgba(0,0,0,.2);overflow:hidden}.zoh-header{text-align:center;padding:10px 8px 16px;border-bottom:1px solid color-mix(in srgb,var(--zoh-accent) 45%,transparent)}.zoh-title{margin:0;font-size:clamp(1.8em,8vw,3.2em);line-height:1.12;letter-spacing:.12em}.zoh-subtitle{margin-top:6px;color:var(--zoh-accent);font:600 .76em/1.2 sans-serif;letter-spacing:.28em}.zoh-meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:13px 0}.zoh-meta>div{min-width:0;padding:10px;border:1px solid color-mix(in srgb,var(--zoh-accent) 30%,transparent);background:color-mix(in srgb,var(--zoh-bg) 88%,white)}.zoh-meta span,.zoh-meta strong{display:block}.zoh-meta span{color:var(--zoh-secondary);font-size:.72em;letter-spacing:.08em}.zoh-meta strong{margin-top:3px;overflow-wrap:anywhere;font-size:.92em}.zoh-intro{padding:16px;border:1px solid color-mix(in srgb,var(--zoh-secondary) 36%,transparent);background:color-mix(in srgb,var(--zoh-secondary) 8%,var(--zoh-bg))}.zoh-intro h2,.zoh-directory h2{margin:0;color:var(--zoh-accent);font-size:1.15em;letter-spacing:.14em}.zoh-intro p{margin:10px 0 0;white-space:pre-wrap}.zoh-directory{margin-top:18px}.zoh-directory-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-bottom:9px;border-bottom:1px solid color-mix(in srgb,var(--zoh-accent) 45%,transparent)}.zoh-count{color:var(--zoh-secondary);font-size:.84em}.zoh-list{display:grid;gap:9px;margin-top:10px}.zoh-entry{position:relative;display:grid;grid-template-columns:64px minmax(0,1fr) auto;gap:12px;align-items:center;padding:11px;border:1px solid color-mix(in srgb,var(--zoh-accent) 32%,transparent);background:color-mix(in srgb,var(--zoh-bg) 90%,white)}.zoh-number{font-size:1.85em;color:var(--zoh-accent);text-align:center}.zoh-entry-copy{min-width:0}.zoh-entry-title{margin:0;font-size:1.08em}.zoh-characters{display:block;margin-top:2px;color:var(--zoh-secondary);font-size:.82em}.zoh-summary{margin:5px 0 0;font-size:.85em;overflow-wrap:anywhere}.zoh-jump{min-width:64px;min-height:42px;padding:8px 12px;border:1px solid var(--zoh-accent);border-radius:7px;color:var(--zoh-bg);background:var(--zoh-accent);cursor:pointer;font:inherit;font-weight:700}.zoh-current{position:absolute;top:-1px;left:-1px;padding:2px 7px;color:var(--zoh-bg);background:var(--zoh-secondary);font-size:.68em}.zoh-notice{min-height:1.3em;margin:8px 0 0;color:var(--zoh-secondary);font-size:.8em;text-align:center}
.zoh-root[data-theme="newspaper"] .zoh-page{border:2px solid var(--zoh-text);background-image:radial-gradient(rgba(50,40,30,.055) .7px,transparent .7px);background-size:4px 4px}.zoh-root[data-theme="newspaper"] .zoh-header{border-top:5px double var(--zoh-text);border-bottom:5px double var(--zoh-text)}.zoh-root[data-theme="newspaper"] .zoh-title{letter-spacing:.04em}.zoh-root[data-theme="newspaper"] .zoh-meta>div{border-width:0 1px 0 0;background:transparent}.zoh-root[data-theme="newspaper"] .zoh-intro{border:1px dashed var(--zoh-text);background:transparent}.zoh-root[data-theme="newspaper"] .zoh-entry{border-radius:0;border-color:var(--zoh-text);background:transparent}.zoh-root[data-theme="newspaper"] .zoh-jump{border-radius:0}
.zoh-root[data-theme="timeline"] .zoh-page{border:1px solid color-mix(in srgb,var(--zoh-secondary) 55%,transparent);border-radius:22px}.zoh-root[data-theme="timeline"] .zoh-meta,.zoh-root[data-theme="timeline"] .zoh-intro,.zoh-root[data-theme="timeline"] .zoh-directory{position:relative;margin-left:24px}.zoh-root[data-theme="timeline"] .zoh-meta::before,.zoh-root[data-theme="timeline"] .zoh-intro::before,.zoh-root[data-theme="timeline"] .zoh-directory::before{content:"";position:absolute;left:-25px;top:-8px;bottom:-8px;width:1px;background:var(--zoh-secondary)}.zoh-root[data-theme="timeline"] .zoh-entry{border-radius:14px}.zoh-root[data-theme="timeline"] .zoh-entry::before{content:"";position:absolute;left:-18px;width:9px;height:9px;border:2px solid var(--zoh-bg);border-radius:50%;background:var(--zoh-secondary)}.zoh-root[data-theme="timeline"] .zoh-jump{border-radius:999px}
.zoh-root[data-theme="minimal"] .zoh-page{padding:24px;border:0;background:var(--zoh-bg);box-shadow:none}.zoh-root[data-theme="minimal"] .zoh-header{text-align:left}.zoh-root[data-theme="minimal"] .zoh-meta{grid-template-columns:1fr}.zoh-root[data-theme="minimal"] .zoh-meta>div{display:grid;grid-template-columns:100px minmax(0,1fr);padding:9px 0;border-width:0 0 1px;background:transparent}.zoh-root[data-theme="minimal"] .zoh-meta strong{margin:0}.zoh-root[data-theme="minimal"] .zoh-intro{border:0;border-left:2px solid var(--zoh-secondary);background:color-mix(in srgb,var(--zoh-secondary) 5%,var(--zoh-bg))}.zoh-root[data-theme="minimal"] .zoh-entry{border-width:0 0 1px;background:transparent}.zoh-root[data-theme="minimal"] .zoh-jump{border-radius:999px}
@media(max-width:560px){.zoh-page{padding:13px}.zoh-meta{grid-template-columns:1fr}.zoh-entry{grid-template-columns:48px minmax(0,1fr)}.zoh-number{font-size:1.45em}.zoh-jump{grid-column:2;justify-self:end;min-width:88px}.zoh-root[data-theme="minimal"] .zoh-meta>div{grid-template-columns:88px minmax(0,1fr)}}@media(prefers-reduced-motion:reduce){.zoh-root *{scroll-behavior:auto!important}}
.zoh-root{--zoh-card:#fffaf0;--zoh-intro:#1a3048;--zoh-intro-text:#fffaf0;--zoh-button:#1a3048}.zoh-model,.zoh-preset{white-space:pre-line}.zoh-meta>div,.zoh-entry{background:var(--zoh-card)}.zoh-intro{color:var(--zoh-intro-text);background:var(--zoh-intro)}.zoh-intro h2{color:inherit}.zoh-jump{background:var(--zoh-button)}
</style>
<script>
(function(script){
  var root=script.previousElementSibling.previousElementSibling;if(!root||!root.classList.contains('zoh-root'))return;
  var raw=root.querySelector('.zoh-source').value||'';
  function split(value){var out=[],part='',escaped=false;for(var i=0;i<value.length;i++){var ch=value[i];if(escaped){part+=ch;escaped=false;}else if(ch==='\\\\'){escaped=true;}else if(ch==='|'){out.push(part.trim());part='';}else{part+=ch;}}out.push(part.trim());return out;}
  var records=[];var re=/\\[((?:\\\\.|[^\\]])*)\\]/g;var match;while((match=re.exec(raw))!==null){records.push(split(match[1]));}
  function first(name){for(var i=0;i<records.length;i++)if(records[i][0]===name)return records[i];return [];}
  var meta=first('Meta'),style=first('Style'),intro=first('Intro');var openings=records.filter(function(r){return r[0]==='Opening';});var worldlines=records.filter(function(r){return r[0]==='Worldline';});
  var theme=['classical','newspaper','timeline','minimal'].includes(style[1])?style[1]:'classical';var font=['serif','sans','kai','mono'].includes(style[2])?style[2]:'serif';root.dataset.theme=theme;root.dataset.font=font;
  function validColor(value,fallback){return /^#[0-9a-f]{6}$/i.test(value||'')?value:fallback;}function contrast(value){var n=parseInt(value.slice(1),16),r=n>>16,g=n>>8&255,b=n&255;return r*299+g*587+b*114>150000?'#3f3024':'#fffaf0';}root.style.setProperty('--zoh-accent',validColor(style[3],'#9b3f32'));root.style.setProperty('--zoh-bg',validColor(style[4],'#f7f0df'));root.style.setProperty('--zoh-text',validColor(style[5],'#3f3024'));root.style.setProperty('--zoh-secondary',validColor(style[6],'#36526d'));root.style.setProperty('--zoh-card',validColor(style[7],'#fffaf0'));var introColor=validColor(style[8],'#1a3048');root.style.setProperty('--zoh-intro',introColor);root.style.setProperty('--zoh-intro-text',contrast(introColor));root.style.setProperty('--zoh-button',validColor(style[9],'#1a3048'));
  function text(selector,value,fallback){var el=root.querySelector(selector);if(el)el.textContent=value||fallback||'';}text('.zoh-title',meta[1],'作品导航');text('.zoh-subtitle',meta[2],'STORY HOME');text('.zoh-author',meta[3],'—');text('.zoh-model',meta[4],'—');text('.zoh-preset',meta[5],'—');text('.zoh-intro p',intro[1],'—');text('.zoh-count','共 '+openings.length+' 条');
  var host=root.querySelector('.zoh-list');var notice=root.querySelector('.zoh-notice');var topWindow=window.parent&&window.parent!==window?window.parent:window;var ctx=topWindow.SillyTavern?.getContext?.();var current=Number(ctx?.chat?.[0]?.swipe_id)+1;
  function make(tag,className,value){var el=document.createElement(tag);if(className)el.className=className;if(value!==undefined)el.textContent=String(value);return el;}
  function decodeEntries(value){try{var parsed=JSON.parse(decodeURIComponent(value||''));return Array.isArray(parsed)?parsed:[];}catch(_){return [];}}function bindingKey(item){return String(item.book||'')+'::'+String(item.uid??'');}function quote(value){return JSON.stringify(String(value||''));}
  async function applyWorldline(live,opening){if(!live?.executeSlashCommandsWithOptions||!worldlines.length)return;var selectedId=opening[6]||'';var desired=new Map();worldlines.forEach(function(line){decodeEntries(line[3]).forEach(function(item){desired.set(bindingKey(item),{item:item,enabled:line[1]===selectedId});});});decodeEntries(opening[7]).forEach(function(item){desired.set(bindingKey(item),{item:item,enabled:true});});for(var value of desired.values()){var item=value.item;if(!item.book&&item.uid===undefined)continue;await live.executeSlashCommandsWithOptions('/setentryfield file='+quote(item.book)+' uid='+Number(item.uid||0)+' field=disable '+(value.enabled?'false':'true'));}}
  async function jump(oneBased,opening){try{var live=topWindow.SillyTavern?.getContext?.();var message=live?.chat?.[0];var swipes=message?.swipes;if(!live?.swipe||!Array.isArray(swipes)||!swipes.length)throw new Error('当前聊天没有可跳转的备用开场白');await applyWorldline(live,opening);var target=Math.max(0,Math.min(swipes.length-1,Number(oneBased)-1));var now=Math.max(0,Math.min(swipes.length-1,Number(message.swipe_id||0)));var messageEl=topWindow.document.querySelector('#chat .mes[mesid="0"]');if(!messageEl)throw new Error('聊天第1条尚未加载');var direction=target>now?'right':'left';for(var step=0;step<Math.abs(target-now);step++){await live.swipe[direction].call(messageEl,null,{source:'zeya-opening-home',message:message});}topWindow.document.querySelector('#chat .mes[mesid="0"]')?.scrollIntoView({behavior:'smooth',block:'center'});}catch(error){notice.textContent=error?.message||'跳转失败';}}
  openings.forEach(function(entry,index){var article=make('article','zoh-entry');var target=Math.max(1,Number(entry[5])||index+2);if(target===current)article.append(make('span','zoh-current','当前'));article.append(make('div','zoh-number',entry[1]||String(index+1).padStart(2,'0')));var copy=make('div','zoh-entry-copy');copy.append(make('h3','zoh-entry-title',entry[2]||'未命名开场白'),make('span','zoh-characters',entry[3]||'未填写人物'),make('p','zoh-summary',entry[4]||'未填写简介'));var button=make('button','zoh-jump','进入');button.type='button';button.addEventListener('click',function(){jump(target,entry);});article.append(copy,button);host.append(article);});
})(document.currentScript);
</script>
\`\`\``;
}

export function buildOpeningHomeRegex(input = {}) {
    const data = normalizeOpeningHomeSettings(input);
    return {
        id: data.ruleId,
        scriptName: 'Zeya · 通用开场白主页',
        disabled: false,
        runOnEdit: true,
        findRegex: '/<opening_home>\\s*([\\s\\S]*?)\\s*<\\/opening_home>/i',
        trimStrings: [],
        replaceString: replacementHtml(),
        placement: [2],
        substituteRegex: 0,
        minDepth: null,
        maxDepth: null,
        markdownOnly: true,
        promptOnly: false,
    };
}

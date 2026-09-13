import { compactComposition, compactRuntime, resolveStoryScene } from './status-beauty-35-41.js';
const STATUS_BEAUTY_32_41_STYLESHEET_URL = new URL('./status-beauty-32-41.css', import.meta.url).href;

const field = (label, instruction, kind, id) => [label, instruction, kind, id];

const CONTRACTS = Object.freeze({
    moment: [
        field('时刻', '填写当前剧情日期与时间', 'text', 'time'),
        field('地点', '具体填写角色当前所在地点', 'text', 'location'),
        field('天气', '填写当前天气、温度与体感', 'text', 'weather'),
        field('当前行动', '具体填写角色此刻正在做什么', 'long', 'action'),
        field('下一步', '填写角色接下来最想完成的事', 'long', 'plan'),
        field('关系温度', '概括角色与当前同行者的关系变化', 'text', 'relationship'),
        field('情绪', '填写角色当前最准确的情绪', 'text', 'mood'),
        field('未说出口', '第一人称填写角色没有说出口的真实想法', 'long', 'inner_voice'),
    ],
    route: [
        field('发车时刻', '填写当前日期与发车或启程时间', 'text', 'time'),
        field('当前站点', '填写角色目前停留的地点', 'text', 'location'),
        field('下一站', '填写下一处目的地', 'text', 'next_stop'),
        field('同行者', '填写当前同行人物及关系', 'text', 'companion'),
        field('路线进度', '填写0到100之间的整数，只写数字', 'progress', 'progress'),
        field('途中发现', '填写本轮路途中新增的关键发现', 'long', 'discovery'),
        field('风险提示', '填写当前路线最需要警惕的风险', 'long', 'risk'),
        field('心底方向', '第一人称填写角色真正想去的地方或目标', 'long', 'inner_voice'),
    ],
    dossier: [
        field('章节', '概括当前剧情章节或事件标题', 'text', 'chapter'),
        field('核心目标', '填写角色眼下最重要的目标', 'long', 'goal'),
        field('阻碍', '填写阻碍目标的主要问题', 'long', 'obstacle'),
        field('新线索', '填写本轮出现的新线索', 'long', 'clue'),
        field('持有物', '列出当前关键物品或资源', 'long', 'inventory'),
        field('状态', '概括角色的身体与精神状态', 'text', 'condition'),
        field('关系变化', '填写本轮最重要的人际变化', 'long', 'relationship'),
        field('真实想法', '第一人称填写角色未公开的真实想法', 'long', 'inner_voice'),
    ],
    broadcast: [
        field('频道', '填写当前频道、频率或通讯主题', 'text', 'channel'),
        field('信号', '填写当前联络质量或信号状态', 'text', 'signal'),
        field('时间地点', '填写当前时间与地点', 'text', 'time_location'),
        field('公开播报', '填写当前所有人都能听到的消息', 'long', 'broadcast'),
        field('私密留言', '填写只对特定人物保留的留言', 'long', 'private_message'),
        field('环境声', '填写当前环境中的声音与氛围', 'long', 'ambience'),
        field('情绪波段', '填写角色当前情绪及变化', 'text', 'mood'),
        field('静音心声', '第一人称填写角色不愿播出的心声', 'long', 'inner_voice'),
    ],
    ensemble: [
        field('角色名', '填写这一位人物的准确姓名', 'text', 'character_name'),
        field('外在状态', '填写此刻能被旁人观察到的状态', 'long', 'visible_state'),
        field('当前动作', '填写此刻正在进行的动作', 'long', 'action'),
        field('对他人态度', '填写此刻对场上其他人的真实态度', 'long', 'attitude'),
        field('内心想法', '第一人称填写没有说出口的想法', 'long', 'inner_voice'),
    ],
});

const DESIGNS = Object.freeze([
    { id: 'beauty-folded-herbarium-32', name: '32 · 潮痕植物册', title: '潮痕植物册', subtitle: 'TIDELINE HERBARIUM / 032', layout: 'herbarium', interaction: 'accordion', contract: 'moment', glyph: 'H-32', description: '素色纸页、浅青细框与逐条翻阅的状态记录', palette: ['#f1eee4', '#c8d8cf', '#789688', '#36564f', '#a15d57'], font: '朱雀仿宋 / 宋体', motif: '浅青双线、折角细框' },
    { id: 'beauty-radar-watch-33', name: '33 · 雾港航行笺', title: '雾港航行笺', subtitle: 'FOG HARBOR WATCH / 033', layout: 'radar', interaction: 'focus', contract: 'route', glyph: 'R-33', description: '雾蓝航程手册、陶红站点与旅人侧写', palette: ['#f4f1e9', '#d7e4e6', '#8faeb4', '#365661', '#b9624d'], font: '宋体 / 黑体', motif: '航线、页签、横向手册' },
    { id: 'beauty-specimen-drawers-34', name: '34 · 奶油青笺', title: '奶油青笺', subtitle: 'CREAM & SAGE / 034', layout: 'drawers', interaction: 'drawer', contract: 'dossier', glyph: 'C-34', description: '奶油纸色、青绿人物签与紧凑的随身状态记录', palette: ['#faf7ee', '#e7e4d4', '#a6ad96', '#74836a', '#ca9656'], font: '宋体 / 黑体', motif: '圆润纸框、青绿页签' },
    { id: 'beauty-lunar-orbit-35', name: '35 · 月相观测簿', title: '月相观测簿', subtitle: 'LUNAR FIELD LOG / 035', layout: 'lunar', interaction: 'tabs', contract: 'moment', glyph: '☾35', description: '完整月面与纸页手记，行动和心声直接展开', palette: ['#eee9df', '#bfc4d3', '#6d7695', '#303954', '#151827'], font: 'Noto Serif SC / 宋体', motif: '月相、轨道、银墨' },
    { id: 'beauty-ticket-reveal-36', name: '36 · 旧影院票根', title: '旧影院票根', subtitle: 'LAST SCREENING / ADMIT 036', layout: 'ticket', interaction: 'reveal', contract: 'dossier', glyph: 'T-36', description: '胶片盘与票纸场记，目标和私密记录直接阅读', palette: ['#f4dec9', '#d9a48d', '#9d4e4f', '#4d2635', '#25202a'], font: '宋体 / 系统衬线', motif: '票根、撕线、胶片' },
    { id: 'beauty-voices-carousel-37', name: '37 · 同行耳语室', title: '同行耳语室', subtitle: 'THREE VOICES / ROOM 037', layout: 'voices', interaction: 'pager', contract: 'ensemble', glyph: 'V-37', description: '人物随场景增减，逐人翻阅行动与独立心声', palette: ['#f4efe8', '#d6c5bd', '#9a6b72', '#59434f', '#272530'], font: '黑体 / 系统字体', motif: '人物页签、翻页、耳语' , pagesText: '角色一|填写当前场景第一位重要人物\n角色二|填写当前场景第二位重要人物\n角色三|填写当前场景第三位重要人物' },
    { id: 'beauty-telegraph-strip-38', name: '38 · 雨港电报码', title: '雨港电报码', subtitle: 'RAIN PORT TELEGRAPH / 038', layout: 'telegraph', interaction: 'signal', contract: 'broadcast', glyph: 'TG38', description: '电报机与连续纸带，消息和心声完整铺开', palette: ['#dce3df', '#abbdb7', '#466c69', '#243e43', '#bb5d4b'], font: 'IBM Plex Mono / 等宽体', motif: '纸带、报码、信号灯' },
    { id: 'beauty-perfume-wheel-39', name: '39 · 暮色线索簿', title: '暮色线索簿', subtitle: 'DUSK CASEBOOK / 039', layout: 'perfume', interaction: 'dial', contract: 'dossier', glyph: 'P-39', description: '纸页档案、线索便签与完整展开的人物记录', palette: ['#f3e9d6', '#d6c4a8', '#806855', '#544b44', '#8b4f40'], font: '宋体 / Georgia 数字', motif: '档案夹、回形针、线索纸页' },
    { id: 'beauty-radio-tuner-40', name: '40 · 潮汐点唱机', title: '潮汐点唱机', subtitle: 'TIDE FM / CHANNEL 040', layout: 'vinyl', interaction: 'tuner', contract: 'broadcast', glyph: 'FM40', description: '完整黑胶唱机，播报、留言和心声连续阅读', palette: ['#f5f0df', '#c9ded7', '#68a4a2', '#274f5c', '#d66f59'], font: '黑体 / 系统字体', motif: '黑胶、调频窗、海浪' },
    { id: 'beauty-train-route-41', name: '41 · 黄昏列车图', title: '黄昏列车图', subtitle: 'SUNSET LINE / CAR 041', layout: 'train', interaction: 'route', contract: 'route', glyph: 'L-41', description: '四时窗景随记录时间变化，计划与进展直接展开', palette: ['#f3e2c3', '#dca968', '#b6634b', '#5d3b3b', '#263945'], font: '思源宋体 / 黑体', motif: '车窗、路线、落日' },
]);

export const STATUS_BEAUTY_32_41_PRESETS = Object.freeze(DESIGNS.map(item => ({
    ...item,
    dynamicRoster: item.layout !== 'herbarium',
    compact: Number(item.name.slice(0, 2)) >= 35,
    fields: ['radar', 'train'].includes(item.layout) ? [
        field('记录时间', '从本轮正文提取当前场景日期与时间，优先填写24小时制HH:mm；正文只有清晨、午后、黄昏或夜晚时保留该时段。所有人物填写同一场景时间；承接正文当前时间，忽略回忆、计划、引用中的时间，不使用现实系统时间', 'text', 'time'),
        field('当前计划', '填写角色目前正在推进的具体计划或任务', 'long', 'current_plan'),
        field('下一步', '填写接下来准备采取的具体行动', 'long', 'next_action'),
        CONTRACTS.route[3],
        field('计划进度', '填写当前计划完成度，0到100之间的整数', 'progress', 'progress'),
        field('新的发现', '填写本轮与当前计划相关的新发现或线索', 'long', 'discovery'),
        field('注意事项', '填写执行计划时需要注意的问题', 'long', 'risk'),
        field('内心想法', '第一人称填写角色没有说出口的真实想法', 'long', 'inner_voice'),
    
    ] : item.layout === 'drawers' ? [
        field('心情', '简短填写角色当前心情', 'text', 'mood'),
        field('当前计划', '填写当前正在推进的具体计划', 'long', 'current_plan'),
        field('信任', '填写角色对当前对话对象的信任程度，0到100之间整数', 'text', 'trust'),
        field('新的发现', '填写本轮获得的新发现或线索', 'long', 'discovery'),
        field('随身物品', '填写当前携带的关键物品', 'long', 'inventory'),
        field('精力', '填写当前精力，0到100之间整数', 'text', 'energy'),
        field('关系变化', '简述本轮关系的变化', 'long', 'relationship'),
        field('内心想法', '第一人称填写没有说出口的想法', 'long', 'inner_voice'),
    ] : ['telegraph', 'vinyl'].includes(item.layout) ? CONTRACTS.broadcast.map((entry, index) => index === 2 ? field('记录时间', '从本轮正文提取当前场景日期与时间，优先填写24小时制HH:mm；正文只有清晨、午后、黄昏或夜晚时保留该时段。所有人物填写同一场景时间；承接正文当前时间，忽略回忆、计划、引用中的时间，不使用现实系统时间', 'text', 'time') : index === 3 ? field('当前计划', '填写角色正在推进的具体计划', 'long', 'current_plan') : entry) : item.layout === 'lunar' ? CONTRACTS.moment.map((entry, index) => index === 1 ? field('当前计划', '填写角色正在推进的计划', 'long', 'current_plan') : entry) : CONTRACTS[item.contract],
    pagesText: item.pagesText || '当前角色|填写当前主要角色或视角',
})));

export const STATUS_BEAUTY_32_41_IDS = Object.freeze(STATUS_BEAUTY_32_41_PRESETS.map(item => item.id));

function fieldBlock(index, className = '') {
    return `<section class="sa32-field ${className}" data-field="${index}"><span data-label="${index}"></span><strong data-value="${index}"></strong></section>`;
}

function portrait(className = '') {
    return `<figure class="sa32-avatar ${className}"><div><img data-st-avatar alt="当前角色头像"><i aria-hidden="true"></i></div><figcaption>PORTRAIT / LIVE RECORD</figcaption></figure>`;
}

function group(start, end, className = '') {
    return `<div class="sa32-group ${className}" data-group="${start / 2}">${Array.from({ length: end - start }, (_, offset) => fieldBlock(start + offset)).join('')}</div>`;
}

function ensemblePerson(index) {
    const fieldMarkup = [1, 2, 3].map(fieldIndex => `<section class="sa32-person-field" data-person="${index}" data-person-field="${fieldIndex}"><span data-person-label="${fieldIndex}"></span><strong data-person-value="${fieldIndex}"></strong></section>`).join('');
    return `<article class="sa32-person${index === 0 ? ' is-current' : ''}" data-person-card="${index}"><figure><img data-person-avatar="${index}" alt=""><i data-person-initial="${index}">0${index + 1}</i></figure><div class="person-copy"><header><small>VOICE 0${index + 1}</small><h2 data-person-name="${index}"></h2></header><div class="person-facts">${fieldMarkup}</div><blockquote data-person="${index}" data-person-field="4"><span data-person-label="4"></span><strong data-person-value="4"></strong></blockquote></div></article>`;
}

function sageIcon(name) {
    const paths = {
        leaf: '<path d="M12 21V8m0 7C3 15 3 10 3 10s8-2 9 5Zm0-5c8 0 9-6 9-6s-9-1-9 6Zm0-3C6 7 6 2 6 2s6 0 6 5Z"/>',
        heart: '<path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z"/>',
        bolt: '<path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z"/>',
        plan: '<rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 11h6m-6 5h6"/>',
        search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
    };
    return `<svg class="sage-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}

function sageDrawer(index, order, icon, open, extra = '') {
    return `<section class="sage-drawer${open ? ' is-open' : ''}" data-drawer-panel="${order}"><button type="button" data-drawer="${order}" aria-expanded="${open}">${sageIcon(icon)}<span data-label-copy="${index}"></span><i class="sage-chevron" aria-hidden="true"></i></button><div class="sage-content">${fieldBlock(index)}${extra}</div></section>`;
}

function composition(preset) {
    if (preset.compact) return compactComposition(preset);
    const f = Array.from({ length: 8 }, (_, index) => fieldBlock(index));
    switch (preset.layout) {
        case 'herbarium':
            return `<div class="sa32-scene scene-herbarium"><div class="herbarium-photo">${portrait('portrait-herbarium')}</div><div class="herbarium-index"><nav class="herbarium-people" aria-label="选择人物"></nav><div class="herbarium-meta">${f[0]}${f[1]}${f[2]}</div><div class="herbarium-accordion">${[3, 4, 5, 6, 7].map((index, order) => `<button type="button" data-drawer="${order}"><b>${String(order + 1).padStart(2, '0')}</b><span data-label-copy="${index}"></span></button>${fieldBlock(index, order === 0 ? 'is-open' : '')}`).join('')}</div></div></div>`;
        case 'radar':
            return `<div class="sa32-scene scene-radar"><div class="radar-scope"><div class="radar-traveller"><small class="radar-kicker">同行名录 / TRAVELLERS</small><nav class="radar-people" aria-label="选择人物"></nav><div class="radar-readout">${f[0]}${f[4]}</div>${f[3]}</div>${portrait('portrait-radar')}</div><div class="radar-ledger"><div class="radar-route">${f[1]}<i aria-hidden="true"></i>${f[2]}</div><div class="radar-notes">${f[5]}${f[6]}</div><div class="radar-thought">${f[7]}</div><nav class="sa32-focus-controls" aria-label="切换关注条目"><button type="button" data-focus-prev>−</button><span>逐项关注</span><button type="button" data-focus-next>＋</button></nav></div></div>`;
        case 'drawers':
            return `<div class="sa32-scene scene-drawers"><div class="sage-header">${portrait('portrait-cabinet')}<nav class="cabinet-people" aria-label="选择人物"></nav></div><div class="sage-metrics">${[0,2,5].map((index, order) => `<div>${sageIcon(['leaf','heart','bolt'][order])}${f[index]}</div>`).join('')}</div><div class="sage-plan">${sageDrawer(1,0,'plan',true)}</div><div class="sage-bottom">${sageDrawer(3,1,'search',false, f[4])}${sageDrawer(7,2,'heart',false,f[6])}</div></div>`;
        default:
            return '';
    }
}

function safeJson(value) {
    return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

function sourceMarkup(value) {
    return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildDocument(rule, source) {
    const preset = STATUS_BEAUTY_32_41_PRESETS.find(item => item.id === rule.structure);
    if (!preset) return '';
    const fields = rule.pages?.[0]?.fields || rule.pageFields || [];
    const pages = (rule.pages?.length ? rule.pages : [{ id: 'View1', label: '当前角色', fields }]).map((page, index) => ({
        id: page.id || `View${index + 1}`,
        label: page.label || `角色${index + 1}`,
        labels: (page.fields || fields).map(item => item.label),
    }));
    const config = safeJson({
        title: rule.title || preset.title,
        subtitle: rule.subtitle || preset.subtitle,
        pageId: pages[0]?.id || 'View1',
        labels: fields.map(item => item.label),
        kinds: fields.map(item => item.kind || 'text'),
        layout: preset.layout,
        compact: preset.compact,
        ensemble: preset.contract === 'ensemble',
        pages,
        avatarUrl: rule.media?.avatarUrl || '',
        avatarAlt: rule.media?.imageAlt || '当前角色头像',
        ensembleAvatarUrls: Array.isArray(rule.media?.ensembleAvatarUrls) ? rule.media.ensembleAvatarUrls : [],
    });
    const compactValue = preset.contract === 'ensemble' ? 0 : Math.min(7, Math.max(0, fields.length - 1));
    return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="${STATUS_BEAUTY_32_41_STYLESHEET_URL}"></head>
<body class="sa32-page"><article class="sa32-card ${preset.id}" data-layout="${preset.layout}"${preset.compact ? ' data-compact="true"' : ''}><button class="sa32-fold" type="button" ${preset.layout === 'drawers' ? 'aria-label="展开或收起状态栏"' : ''} aria-expanded="true"><span>收起</span><i></i></button><div class="sa32-compact"><b data-design-title></b><span data-value="1"></span><em data-value="${compactValue}"></em></div><div class="sa32-expanded"><header class="sa32-heading"><div class="sa32-glyph">${preset.glyph}</div><div><small data-design-subtitle></small><h1 data-design-title></h1><p>${preset.description}</p></div></header>${composition(preset)}</div></article><textarea class="sa32-source" hidden>${sourceMarkup(source)}</textarea><script>
(function(){var root=document.querySelector('.sa32-card');if(!root)return;var config=${config};var raw=document.querySelector('.sa32-source').value||'';var records={};raw.split(/\\r?\\n/).forEach(function(line){var text=line.trim();if(text.charAt(0)!=='['||text.charAt(text.length-1)!==']')return;var parts=text.slice(1,-1).split('|').map(function(item){return item.trim();});var key=parts.shift();records[key]=parts;});if(config.compact){(${compactRuntime.toString()})(root,config,records,${resolveStoryScene.toString()});return;}if((config.layout==='radar'||config.layout==='drawers')){var activePages=Object.keys(records).filter(function(key){return /^View[1-9][0-9]*$/.test(key)&&records[key].length>=config.labels.length;}).map(function(key,index){var known=config.pages.find(function(page){return page.id===key;});return {id:key,label:records[key][config.labels.length]||(known&&known.label)||('角色'+(index+1)),labels:config.labels};});if(activePages.length){config.pages=activePages;config.pageId=activePages[0].id;}}var values=records[config.pageId]||[];root.querySelectorAll('[data-design-title]').forEach(function(node){node.textContent=config.title;});root.querySelectorAll('[data-design-subtitle]').forEach(function(node){node.textContent=config.subtitle;});root.querySelectorAll('[data-label]').forEach(function(node){node.textContent=config.labels[Number(node.dataset.label)]||'';});root.querySelectorAll('[data-label-copy]').forEach(function(node){node.textContent=config.labels[Number(node.dataset.labelCopy)]||'';});root.querySelectorAll('[data-value]').forEach(function(node){var index=Number(node.dataset.value);node.textContent=values[index]||'—';node.dataset.kind=config.kinds[index]||'text';});if((config.layout==='herbarium'||config.layout==='radar'||config.layout==='drawers')){var people=root.querySelector('.herbarium-people,.radar-people,.cabinet-people');config.pages.forEach(function(page,index){var button=document.createElement('button');button.type='button';button.textContent=page.label;button.setAttribute('aria-selected',String(index===0));button.addEventListener('click',function(){var personValues=records[page.id]||[];people.querySelectorAll('button').forEach(function(item){item.setAttribute('aria-selected',String(item===button));});root.querySelectorAll('[data-value]').forEach(function(node){node.textContent=personValues[Number(node.dataset.value)]||'—';});root.querySelectorAll('[data-label],[data-label-copy]').forEach(function(node){node.textContent=page.labels[Number(node.dataset.label||node.dataset.labelCopy)]||'';});var img=root.querySelector('img[data-st-avatar]');var url=config.ensembleAvatarUrls[index]||((config.layout==='herbarium'||index===0)?config.avatarUrl:'');if(url)img.src=url;else img.removeAttribute('src');requestAnimationFrame(syncHeight);});people.appendChild(button);});people.hidden=config.layout==='herbarium'&&config.pages.length<2;}var topWindow=window;try{if(window.parent&&window.parent!==window)topWindow=window.parent;}catch(error){}var ctx=null;try{ctx=topWindow.SillyTavern&&topWindow.SillyTavern.getContext?topWindow.SillyTavern.getContext():null;}catch(error){}var character=ctx&&ctx.characters?ctx.characters[ctx.characterId]:null;function thumb(target){try{return target&&target.avatar?(ctx&&typeof ctx.getThumbnailUrl==='function'?ctx.getThumbnailUrl('avatar',target.avatar):'/thumbnail?type=avatar&file='+encodeURIComponent(target.avatar)):'';}catch(error){return '';}}var avatar=((config.layout==='herbarium'||config.layout==='radar'||config.layout==='drawers')&&config.ensembleAvatarUrls[0])||config.avatarUrl||thumb(character);root.querySelectorAll('img[data-st-avatar]').forEach(function(image){if(avatar){image.src=avatar;image.alt=config.avatarAlt;image.referrerPolicy='no-referrer';}image.addEventListener('error',function(){image.removeAttribute('src');});});if(config.ensemble){root.querySelectorAll('[data-person-card]').forEach(function(card){var index=Number(card.dataset.personCard);var page=config.pages[index]||config.pages[0];var personValues=records[page.id]||[];var name=personValues[0]||page.label||('角色'+(index+1));var heading=card.querySelector('[data-person-name]');if(heading)heading.textContent=name;card.querySelectorAll('[data-person-label]').forEach(function(node){node.textContent=page.labels[Number(node.dataset.personLabel)]||'';});card.querySelectorAll('[data-person-value]').forEach(function(node){node.textContent=personValues[Number(node.dataset.personValue)]||'—';});var image=card.querySelector('[data-person-avatar]');var initial=card.querySelector('[data-person-initial]');var url=config.ensembleAvatarUrls[index]||'';if(url){image.src=url;image.alt=name;image.addEventListener('load',function(){initial.hidden=true;});image.addEventListener('error',function(){image.removeAttribute('src');initial.hidden=false;});}});}
function syncHeight(){var height=Math.ceil((config.layout==='herbarium'||config.layout==='radar'||config.layout==='drawers')?root.getBoundingClientRect().height+parseFloat(getComputedStyle(document.body).paddingTop||0)+parseFloat(getComputedStyle(document.body).paddingBottom||0)+2:document.documentElement.scrollHeight);try{window.parent.postMessage({type:'status-atelier:resize',height:height},'*');}catch(error){}try{var frame=window.frameElement;if(frame)frame.style.height=height+'px';}catch(error){}}function activate(selector,index){root.querySelectorAll(selector).forEach(function(node){node.classList.toggle('is-active',Number(node.dataset.group||node.dataset.personTab||node.dataset.route||node.dataset.tab)===index);});requestAnimationFrame(syncHeight);}var fold=root.querySelector('.sa32-fold');fold.addEventListener('click',function(){var collapsed=root.classList.toggle('is-collapsed');fold.setAttribute('aria-expanded',String(!collapsed));fold.querySelector('span').textContent=collapsed?'展开':'收起';requestAnimationFrame(syncHeight);});root.querySelectorAll('[data-drawer]').forEach(function(button){button.addEventListener('click',function(){var index=Number(button.dataset.drawer);if(config.layout==='drawers'){var target=root.querySelector('[data-drawer-panel="'+index+'"]');var opening=!target.classList.contains('is-open');root.querySelectorAll('[data-drawer-panel]').forEach(function(item){item.classList.toggle('is-open',item===target&&opening);var trigger=item.querySelector('[data-drawer]');trigger.setAttribute('aria-expanded',String(item===target&&opening));});requestAnimationFrame(syncHeight);return;}root.querySelectorAll('.is-open').forEach(function(node){node.classList.remove('is-open');});button.classList.add('is-open');var sibling=button.nextElementSibling;if(sibling)sibling.classList.add('is-open');var panel=root.querySelector('[data-drawer-panel="'+index+'"]');if(panel)panel.classList.add('is-open');requestAnimationFrame(syncHeight);});});root.querySelectorAll('[data-tab]').forEach(function(button){button.addEventListener('click',function(){var index=Number(button.dataset.tab);root.querySelectorAll('[data-tab]').forEach(function(node){node.classList.toggle('is-active',node===button);});activate('[data-group]',index);});});root.querySelectorAll('[data-person-tab]').forEach(function(button){button.addEventListener('click',function(){var index=Number(button.dataset.personTab);root.querySelectorAll('[data-person-tab]').forEach(function(node){node.classList.toggle('is-active',node===button);});root.querySelectorAll('[data-person-card]').forEach(function(node){node.classList.toggle('is-current',Number(node.dataset.personCard)===index);});requestAnimationFrame(syncHeight);});});root.querySelectorAll('[data-route]').forEach(function(button){button.addEventListener('click',function(){var index=Number(button.dataset.route);root.querySelectorAll('[data-route]').forEach(function(node){node.classList.toggle('is-active',node===button);});activate('[data-group]',index);});});var reveal=root.querySelector('[data-reveal]');if(reveal)reveal.addEventListener('click',function(){root.classList.toggle('is-revealed');reveal.querySelector('span').textContent=root.classList.contains('is-revealed')?'返回正面':'翻看背面场记';requestAnimationFrame(syncHeight);});var focusIndex=0;function setFocus(next){var fields=[].slice.call(root.querySelectorAll('.radar-ledger .sa32-field'));if(!fields.length)return;focusIndex=(next+fields.length)%fields.length;fields.forEach(function(node,index){node.classList.toggle('is-current',index===focusIndex);});}var prev=root.querySelector('[data-focus-prev]');var next=root.querySelector('[data-focus-next]');if(prev)prev.addEventListener('click',function(){setFocus(focusIndex-1);});if(next)next.addEventListener('click',function(){setFocus(focusIndex+1);});var signal=root.querySelector('[data-signal]');if(signal)signal.addEventListener('click',function(){root.dataset.signal=root.dataset.signal==='private'?'public':'private';});var dial=root.querySelector('[data-dial]');if(dial)dial.addEventListener('click',function(){root.style.setProperty('--turn',String((Number(root.style.getPropertyValue('--turn'))||0)+1));});var tuner=root.querySelector('[data-tuner]');if(tuner)tuner.addEventListener('click',function(){root.style.setProperty('--station',String(((Number(root.style.getPropertyValue('--station'))||0)+1)%4));});root.querySelectorAll('img').forEach(function(image){image.addEventListener('load',syncHeight);});requestAnimationFrame(syncHeight);if(window.ResizeObserver)new ResizeObserver(function(){requestAnimationFrame(syncHeight);}).observe(root);window.addEventListener('resize',syncHeight);})();
</script></body></html>`;
}

export function isStatusBeauty32To41(structure) {
    return STATUS_BEAUTY_32_41_IDS.includes(structure);
}

export function buildStatusBeauty32To41Replacement(rule) {
    return `\`\`\`html\n${buildDocument(rule, '$1')}\n\`\`\``;
}

export function buildStatusBeauty32To41Preview(rule, rawValues = []) {
    const sanitize = value => String(value || '—').replace(/[|[\]<>]/g, ' ');
    const preset = STATUS_BEAUTY_32_41_PRESETS.find(item => item.id === rule.structure);
    if (preset?.dynamicRoster && Array.isArray(rawValues[0])) {
        return buildDocument(rule, rawValues.map((values, index) => `[View${index + 1}|${values.map(sanitize).join('|')}]`).join('\n'));
    }
    if (preset?.contract === 'ensemble' || Array.isArray(rawValues[0])) {
        const nested = Array.isArray(rawValues[0]) ? rawValues : (rule.pages || []).map((_, index) => rawValues.slice(index * preset.fields.length, (index + 1) * preset.fields.length));
        const source = (rule.pages || []).map((page, index) => `[${page.id}|${(nested[index] || []).map(sanitize).join('|')}]`).join('\n');
        return buildDocument(rule, source);
    }
    const pageId = rule.pages?.[0]?.id || 'View1';
    return buildDocument(rule, `[${pageId}|${rawValues.map(sanitize).join('|')}]`);
}

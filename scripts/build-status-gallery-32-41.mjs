import { readFile, writeFile } from 'node:fs/promises';
import { STATUS_BEAUTY_32_41_PRESETS, buildStatusBeauty32To41Preview } from '../status-beauty-32-41.js';
import { normalizeRule } from '../rule-generator.js';

const rootUrl = 'http://127.0.0.1:4196/';
const css = await readFile(new URL('../status-beauty-32-41.css', import.meta.url), 'utf8');
const outputUrl = new URL('../status-bar-candidates-32-41-preview.html', import.meta.url);

const samples = {
    moment: ['第二年 · 初夏 · 22:40', '旧港北侧 · 临海旅店', '小雨 · 海风三级', '重新检查了所有窗锁，又把湿外套挂到门边。', '天亮前整理完那封始终没有寄出的信。', '暂时同行 · 默契正在变深', '疲惫、警觉，又有一点舍不得', '如果明天真的放晴，我也许会问他愿不愿继续同行。'],
    route: ['初夏 22:40', '旧港北侧', '白塔观星台', '艾登 · 暂时同行', '46', '在废弃站台发现一张被雨打湿的旧车票。', '东侧隧道仍在封锁，夜间可能再次停电。', '我说想去白塔，其实只是想把这段旅程延长一点。'],
    dossier: ['雨季来信 / 第四章', '在天亮前找到失踪邮差留下的第二本账册。', '港务局封锁了旧仓库，守卫正在逐层排查。', '车票背面出现了与灯塔守夜记录相同的日期。', '铜钥匙、半张潮汐表、未寄出的信与一枚旧徽章。', '轻度失温 · 精神清醒', '沉默被打破了一次，关系却比之前更谨慎。', '我已经猜到答案，只是不确定自己是否真的想揭开它。'],
    broadcast: ['TIDE FM · 40.7', '四格 · 偶有杂讯', '22:40 · 旧港旅店', '港口将在午夜后封航，请所有小艇立即返回内湾。', '如果你还醒着，就把窗边那盏灯留到我回来。', '雨点敲击铁皮屋檐，远处汽笛每隔七分钟响一次。', '克制 · 仍在等待', '我播了所有人的归航通知，却不敢说最想等的人是你。'],
    ensemble: [
        ['林赛', '抱着手臂站在门边，看起来并不在意。', '反复摩挲袖口的旧纽扣。', '表面冷淡，却一直留意另外两人的反应。', '只要他们再问一次，我也许就会留下。'],
        ['艾登', '神色轻松，语速却比平时更快。', '低头整理桌上已经整齐的信件。', '努力维持气氛，不想让沉默变得难堪。', '我知道她在等一句挽留，可我不敢先说。'],
        ['米娅', '靠在窗边看雨，像是一个局外人。', '用指尖在雾气上画了一条短线。', '看穿了两个人的犹豫，暂时不准备拆穿。', '他们怎么总把最简单的话藏得这么深。'],
    ],
};

const avatarByContract = {
    moment: `${rootUrl}assets/status-beauty/candidates-22-31/avatars/aier-card.png`,
    route: `${rootUrl}assets/status-beauty/candidates-22-31/avatars/field-card.png`,
    dossier: `${rootUrl}assets/status-beauty/candidates-22-31/avatars/futa-card.png`,
    broadcast: `${rootUrl}assets/status-beauty/candidates-22-31/avatars/aier-card.png`,
};
const ensembleAvatarUrls = [
    `${rootUrl}assets/status-beauty/candidates-22-31/avatars/aier-card.png`,
    `${rootUrl}assets/status-beauty/candidates-22-31/avatars/field-card.png`,
    `${rootUrl}assets/status-beauty/candidates-22-31/avatars/futa-card.png`,
];

function ruleFor(preset) {
    const rule = normalizeRule({
        structure: preset.id,
        title: preset.title,
        subtitle: preset.subtitle,
        pagesText: preset.layout === 'herbarium' ? '林赛|填写林赛当前状态与独立心声\n艾登|填写艾登当前状态与独立心声' : preset.pagesText,
        pageFieldsText: preset.fields.map(item => item.join('|')).join('\n'),
        media: { avatarUrl: avatarByContract[preset.contract] || '', imageAlt: '角色头像', ensembleAvatarUrls },
    });
    rule.media = { ...rule.media, avatarUrl: avatarByContract[preset.contract] || '', ensembleAvatarUrls };
    return rule;
}

function compactSamples(preset) {
    if (preset.contract === 'ensemble') return samples.ensemble.map(row => [...row, row[0]]);
    const original = [...samples[preset.contract]];
    if (preset.contract === 'broadcast') { original[2] = '初夏 22:40'; original[3] = '整理未寄出的信，核对照片中的线索。'; }
    if (preset.layout === 'lunar') original[1] = '整理未寄出的信';
    if (preset.layout === 'train') { original[1] = '整理未寄出的信'; original[2] = '核对信中日期'; }
    return ['林赛', '艾登', '伊诺'].map((name, index) => {
        const row = [...original];
        if (index) {
            row[7] = index === 1 ? '这一次，我想和他一起把事情做完。' : '等他们商量好，我再说出自己的发现。';
            const planIndex = ['lunar', 'ticket', 'perfume', 'train'].includes(preset.layout) ? 1 : 3;
            row[planIndex] = index === 1 ? '核对信上的署名，整理照片中的线索。' : '把明日要用的物品放好，等同伴回来。';
        }
        return [...row, name];
    });
}

function iframeDocument(preset) {
    return buildStatusBeauty32To41Preview(ruleFor(preset), preset.compact ? compactSamples(preset) : preset.layout === 'herbarium' ? [samples.moment, ['第二年 · 初夏 · 22:40','旧港北侧 · 临海旅店','小雨 · 海风三级','把两封信分开放好，替门边的人留了一条干毛巾。','等雨小一些，再去查看停泊的小船。','彼此牵挂 · 仍未挑明','平静中藏着期待','我想留下来，但希望这一次是他先开口。']] : preset.layout === 'radar' ? [[samples.route[0], '整理未寄出的信', '核对信中日期', ...samples.route.slice(3), '林赛'], ['初夏 22:40','读完航海日志','找出缺失的记录','林赛 · 暂时同行','46','船舱里有一份尚未拆封的航海日志。','雨势正在加重，准备沿岸等到天亮。','我希望他问的下一站，也包括我。','艾登'], ['初夏 22:40','收拾同行行李','交出保管的信','林赛、艾登 · 同行','46','灯塔值班室还亮着灯，可以先去借宿。','石阶湿滑，靠海的一侧已经积水。','等他们收好行李，我再把那封信拿出来。','诺拉']] : preset.layout === 'drawers' ? [['平静','寻找遗失的信件','68','一枚旧钥匙，齿痕与信中的图案吻合。','旧钥匙、折叠信件','82','开始愿意交换线索。','等待他的答复。','林赛'],['期待','核对信上的署名','74','信封里还夹着半张照片。','照片、笔记本','76','比昨天多了一点默契。','这次我想和他一起去。','艾登'],['专注','整理明日的计划','61','邮戳比信中日期晚了一天。','钢笔、旧信','90','仍在观察两人的态度。','有些话，等明天再问。','伊诺']] : samples[preset.contract])
        .replaceAll(new URL('../', import.meta.url).href, rootUrl)
        .replace(/<link rel="stylesheet" href="[^"]+">/, `<style>${css}</style>`);
}

function attr(value) {
    return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const overviewCards = STATUS_BEAUTY_32_41_PRESETS.map((preset, index) => `
    <button type="button" class="mood-card${index === 0 ? ' is-active' : ''}" data-target="${preset.id}" aria-selected="${index === 0}">
        <span class="mood-number">${32 + index}</span>
        <span class="mood-copy"><b>${preset.title}</b><small>${preset.description}</small><em>${preset.compact ? (preset.layout === 'train' ? '四时窗景 · 直接阅读' : '完整展开 · 人物切换') : preset.layout + ' · ' + preset.interaction}</em></span>
        <span class="mini-palette">${preset.palette.map(color => `<i style="background:${color}"></i>`).join('')}</span>
    </button>`).join('');

const panels = STATUS_BEAUTY_32_41_PRESETS.map((preset, index) => {
    const source = attr(iframeDocument(preset));
    return `<section class="design-panel${index === 0 ? ' is-active' : ''}" data-panel="${preset.id}"${index === 0 ? '' : ' hidden'}>
        <header class="panel-head">
            <div><p>STATUS BAR ${32 + index}</p><h2>${preset.title}</h2><span>${preset.description}</span></div>
            <div class="specs"><dl><dt>构图</dt><dd>${preset.layout}</dd><dt>交互</dt><dd>${preset.interaction}</dd><dt>字体</dt><dd>${preset.font}</dd><dt>装饰</dt><dd>${preset.motif}</dd></dl><div class="palette">${preset.palette.map(color => `<i style="background:${color}" title="${color}"></i>`).join('')}</div></div>
        </header>
        <div class="views"><article><div class="view-label"><b>电脑</b><span>完整横向构图 · 可点击交互</span></div><iframe style="min-height:0;${preset.compact ? 'border:0;background:transparent' : ''}" title="${preset.title}电脑预览" srcdoc="${source}"></iframe></article><article class="phone"><div class="view-label"><b>手机</b><span>390px · 自然高度</span></div><iframe style="min-height:0;${preset.compact ? 'border:0;background:transparent' : ''}" title="${preset.title}手机预览" srcdoc="${source}"></iframe></article></div>
    </section>`;
}).join('');

const page = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>状态栏 32—41 色卡拼贴总览</title><style>
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#dedbd4;color:#24211f;font-family:system-ui,-apple-system,"Microsoft YaHei",sans-serif}body{padding:22px}.shell{max-width:1480px;margin:auto}.hero{display:grid;grid-template-columns:1fr auto;gap:30px;align-items:end;padding:10px 0 20px;border-bottom:1px solid #aaa49a}.hero p{margin:0 0 5px;color:#746d64;font:700 11px/1.2 monospace;letter-spacing:.18em}.hero h1{margin:0;font:600 clamp(28px,4vw,48px)/1.04 Georgia,"Noto Serif SC",serif}.hero span{max-width:38em;color:#716960;font-size:13px;line-height:1.6}.moodboard{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:16px 0}.mood-card{position:relative;display:grid;grid-template-columns:auto 1fr;gap:10px;min-width:0;min-height:116px;padding:13px;border:1px solid #b8b0a6;background:#f0ede7;color:#292520;text-align:left;cursor:pointer}.mood-card:hover,.mood-card.is-active{border-color:#27231e;background:#28241f;color:#fff}.mood-number{font:700 11px/1 monospace;color:#8f857b}.mood-copy{min-width:0}.mood-copy b{display:block;margin-bottom:5px;font:600 17px/1.15 Georgia,"Noto Serif SC",serif}.mood-copy small{display:block;color:#766e65;font-size:11px;line-height:1.4}.mood-card.is-active .mood-copy small,.mood-card:hover .mood-copy small{color:#d4ccc3}.mood-copy em{display:block;margin-top:7px;color:#998d81;font:400 9px/1.2 monospace;font-style:normal}.mini-palette{grid-column:1/-1;display:flex;height:12px}.mini-palette i{flex:1}.design-panel{padding:24px;border:1px solid #aaa39a;background:#f5f2ec;box-shadow:0 20px 55px #4f463a1c}.design-panel[hidden]{display:none}.panel-head{display:grid;grid-template-columns:1fr minmax(440px,.75fr);gap:30px;align-items:end;margin-bottom:19px}.panel-head p{margin:0 0 4px;color:#7a7269;font:700 10px/1.2 monospace;letter-spacing:.18em}.panel-head h2{margin:0 0 5px;font:600 clamp(26px,3vw,39px)/1 Georgia,"Noto Serif SC",serif}.panel-head>div>span{color:#6e665e;font-size:13px}.specs{display:flex;align-items:flex-end;justify-content:flex-end;gap:18px}.specs dl{display:grid;grid-template-columns:auto auto auto auto;gap:4px 8px;margin:0;font-size:10px}.specs dt{color:#8d847a}.specs dd{margin:0;color:#39342f}.palette{display:flex;padding:6px;border:1px solid #c0b8ae;background:#fff}.palette i{display:block;width:28px;height:28px}.views{display:grid;grid-template-columns:minmax(0,1fr) 430px;gap:17px;align-items:start}.view-label{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;color:#6c645c}.view-label b{color:#292520}.view-label span{font-size:11px}.views iframe{display:block;width:100%;min-height:730px;border:1px solid #b8b0a7;background:#fff}.phone iframe{width:390px;max-width:100%;min-height:980px;margin:auto}
@media(max-width:1050px){.moodboard{grid-template-columns:repeat(2,minmax(0,1fr))}.views{grid-template-columns:1fr}.phone{max-width:430px}.panel-head{grid-template-columns:1fr}.specs{justify-content:flex-start}}@media(max-width:600px){body{padding:10px}.hero{grid-template-columns:1fr}.moodboard{grid-template-columns:1fr}.design-panel{padding:12px}.specs{align-items:flex-start;flex-direction:column}.specs dl{grid-template-columns:auto 1fr}.views iframe{min-height:720px}.phone iframe{min-height:1000px}}
</style></head><body><main class="shell"><header class="hero"><div><p>STATUS ATELIER / DAILY STUDY 02</p><h1>32—41 色卡拼贴总览</h1></div><span>十款保留同一真实字段契约，但重新设计了构图与操作方式。点击情绪板卡片后，可在电脑和 390px 手机里直接试展开、收起与款式专属交互。</span></header><nav class="moodboard" aria-label="选择状态栏">${overviewCards}</nav>${panels}</main><script>
document.querySelectorAll('.mood-card').forEach(function(button){button.addEventListener('click',function(){var target=button.dataset.target;document.querySelectorAll('.mood-card').forEach(function(item){var active=item===button;item.classList.toggle('is-active',active);item.setAttribute('aria-selected',String(active));});document.querySelectorAll('.design-panel').forEach(function(panel){var active=panel.dataset.panel===target;panel.classList.toggle('is-active',active);panel.hidden=!active;});window.scrollTo({top:document.querySelector('.moodboard').offsetHeight+120,behavior:'smooth'});});});
</script></body></html>`;

await writeFile(outputUrl, page, 'utf8');
console.log(outputUrl.pathname);

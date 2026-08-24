const BUNDLE_ROOT = new URL('./assets/status-beauty/regexes/', import.meta.url);

const COMMON_10_15_FIELDS = Object.freeze([
    ['情愫', '填写角色当前情愫数值或简短阶段', 'text', 'affection'],
    ['欲念', '填写角色当前欲念数值或简短状态', 'text', 'desire'],
    ['衣冠', '具体描述角色当前衣着、配饰与可见细节', 'long', 'attire'],
    ['身处', '具体描述角色当前地点与周围环境', 'long', 'location'],
    ['心语', '第一人称填写角色没有说出口的真实想法', 'long', 'inner_voice'],
    ['书信', '以角色口吻填写此刻最想传达的话', 'long', 'letter'],
    ['双手', '具体填写角色双手正在做什么', 'long', 'hands'],
    ['腹部', '具体填写角色腹部或核心身体状态', 'long', 'abdomen'],
    ['身体', '具体填写角色当前整体身体状况与体感', 'long', 'body'],
    ['思绪', '概括角色此刻反复盘旋的思绪', 'long', 'thoughts'],
    ['计划', '填写角色接下来最可能执行的计划', 'long', 'plan'],
    ['目的地一', '填写第一个可能前往或关注的地点', 'text', 'destination_1'],
    ['目的地二', '填写第二个可能前往或关注的地点', 'text', 'destination_2'],
    ['目的地三', '填写第三个可能前往或关注的地点', 'text', 'destination_3'],
    ['秘密', '填写角色当前隐藏且未说出口的秘密', 'long', 'secret'],
]);

function preset(id, name, description, title, subtitle, fields) {
    return { id, name, description, title, subtitle, layout: 'stack', pagesText: '当前角色|填写当前主要角色或视角', fields };
}

export const STATUS_BEAUTY_01_04_10_15_PRESETS = Object.freeze([
    preset('beauty-crimson-letter-01', '01 · 绛幕雪信', '绛红帷幕、雪信与角色八项状态', '绛幕雪信', 'CRIMSON SNOW LETTER', [
        ['情愫', '填写角色当前情愫数值或简短阶段', 'text', 'affection'],
        ['欲念', '填写角色当前欲念数值或简短状态', 'text', 'desire'],
        ['衣冠', '具体描述角色当前衣着、配饰与可见细节', 'long', 'attire'],
        ['身处', '具体描述角色当前地点与周围环境', 'long', 'location'],
        ['心语', '第一人称填写角色没有说出口的真实想法', 'long', 'inner_voice'],
        ['书信', '以角色口吻填写此刻最想传达的话', 'long', 'letter'],
        ['情愫注', '概括本轮情愫变化及原因', 'long', 'affection_note'],
        ['欲念注', '概括欲念当前的克制、动摇或变化', 'long', 'desire_note'],
        ['时间', '填写当前剧情时间', 'text', 'time'],
        ['当前章节', '填写当前剧情章节或阶段', 'text', 'chapter'],
    ]),
    preset('beauty-burgundy-album-02', '02 · 酒红交换相簿', '相簿式隐秘行动、计划、去向与心声', '酒红交换相簿', 'BURGUNDY EXCHANGE ALBUM', [
        ['隐秘行动', '填写角色正在暗中进行或刚完成的行动', 'long', 'hidden_actions'],
        ['小计划一', '填写角色近期第一个小计划', 'long', 'small_plan_1'],
        ['小计划二', '填写角色近期第二个小计划', 'long', 'small_plan_2'],
        ['去向一', '填写第一个可能前往或关注的地点', 'text', 'destination_1'],
        ['去向二', '填写第二个可能前往或关注的地点', 'text', 'destination_2'],
        ['去向三', '填写第三个可能前往或关注的地点', 'text', 'destination_3'],
        ['去向四', '填写第四个可能前往或关注的地点', 'text', 'destination_4'],
        ['去向五', '填写第五个可能前往或关注的地点', 'text', 'destination_5'],
        ['去向六', '填写第六个可能前往或关注的地点', 'text', 'destination_6'],
        ['心声', '第一人称填写角色没有说出口的真实想法', 'long', 'musings'],
    ]),
    preset('beauty-dossier-04', '04 · 人物剪报卷宗', '剪报卷宗式时间、地点、宜忌、广播与签文', '人物剪报卷宗', 'CHARACTER DOSSIER', [
        ['时间', '填写当前剧情时间', 'text', 'time'],
        ['地点', '填写角色当前所在地点', 'text', 'location'],
        ['今日宜', '填写此刻适合角色做的一件事', 'text', 'recommended'],
        ['今日忌', '填写此刻不适合角色做的一件事', 'text', 'avoid'],
        ['广播', '用一句简短广播概括当前状态或场景', 'long', 'broadcast'],
        ['当前章节', '填写当前剧情章节或阶段', 'text', 'chapter'],
        ['心声', '第一人称填写角色没有说出口的真实想法', 'long', 'inner_voice'],
        ['御神签', '填写与当前剧情对应的签位与简短签意', 'long', 'fortune'],
    ]),
    preset('beauty-flower-echo-10', '10 · 花冠回声簿', '花冠与回声书页式十五项人物状态', '花冠回声簿', 'FLOWER CROWN ECHO', COMMON_10_15_FIELDS),
    preset('beauty-clock-travel-11', '11 · 时针旅页', '时针与旅行书页式十五项人物状态', '时针旅页', 'CLOCKWORK TRAVEL PAGE', COMMON_10_15_FIELDS),
    preset('beauty-flower-reader-12', '12 · 花间读者札', '花间读者札记式十五项人物状态', '花间读者札', 'FLOWER READER NOTE', COMMON_10_15_FIELDS),
    preset('beauty-olive-ticket-13', '13 · 橄榄票根簿', '橄榄票根与旅页式十五项人物状态', '橄榄票根簿', 'OLIVE TICKET BOOK', COMMON_10_15_FIELDS),
    preset('beauty-cat-rabbit-14', '14 · 猫兔夜话', '猫兔夜谈式十五项人物状态', '猫兔夜话', 'CAT & RABBIT NIGHT TALK', COMMON_10_15_FIELDS),
    preset('beauty-rabbit-track-15', '15 · 兔子计划跑道', '兔子计划跑道式十五项人物状态', '兔子计划跑道', 'RABBIT PLAN TRACK', COMMON_10_15_FIELDS),
]);
export const STATUS_BEAUTY_01_02_PRESETS = Object.freeze(STATUS_BEAUTY_01_04_10_15_PRESETS.slice(0, 2));
export const STATUS_BEAUTY_04_PRESETS = Object.freeze(STATUS_BEAUTY_01_04_10_15_PRESETS.slice(2, 3));
export const STATUS_BEAUTY_10_15_PRESETS = Object.freeze(STATUS_BEAUTY_01_04_10_15_PRESETS.slice(3));

const commonLines10To15 = Object.freeze([
    ['Affection', [0]], ['Desire', [1]], ['Attire', [2]], ['Location', [3]], ['InnerVoice', [4]],
    ['Letter', [5]], ['Hands', [6]], ['Abdomen', [7]], ['Body', [8]], ['Thoughts', [9]],
    ['Plan', [10]], ['Destination1', [11]], ['Destination2', [12]], ['Destination3', [13]], ['Secret', [14]],
]);

const BUNDLED = Object.freeze({
    'beauty-crimson-letter-01': { file: '状态栏01-绛幕雪信.json', tag: 'qingshan_status', lines: [['Affection',[0]],['Desire',[1]],['Attire',[2]],['Location',[3]],['InnerVoice',[4]],['Letter',[5]],['AffectionNote',[6]],['DesireNote',[7]],['Time',[8]],['Chapter',[9]]] },
    'beauty-burgundy-album-02': { file: '状态栏02-酒红交换相簿.json', tag: 'aier_status', lines: [['HiddenActions',[0]],['SmallPlans',[1,2]],['Destinations',[3,4,5,6,7,8]],['Musings',[9]]] },
    'moon-collage': { file: '状态栏03-月下蝶影.json', tag: 'qingshan_status', lines: [['Affection',[0]],['Desire',[1]],['Attire',[2]],['Location',[3]],['InnerVoice',[4]],['Letter',[5]],['AffectionNote',[6]],['DesireNote',[7]]] },
    'beauty-dossier-04': { file: '状态栏04-人物剪报卷宗.json', tag: 'dossier_status', lines: [['Time',[0]],['Location',[1]],['Recommended',[2]],['Avoid',[3]],['Broadcast',[4]],['Chapter',[5]],['InnerVoice',[6]],['Fortune',[7]]] },
    'beauty-current-status-05': { file: '状态栏05-角色当前状态.json', tag: 'status_p05', lines: [['Time',[0]],['Location',[1]],['Affection',[2,3]],['Body',[4]],['Hands',[5]],['Action',[6]],['Spoken',[7]],['InnerVoice',[8]]] },
    'beauty-card-status-06': { file: '状态栏06-牌面角色状态.json', tag: 'status_p06', lines: [['Time',[0]],['Location',[1]],['Affection',[2,3]],['Body',[4,5]],['Hands',[6,7]],['Mood',[8,9]],['Attire',[10]],['Desire',[11,12]],['InnerVoice',[13]]] },
    'beauty-letter-status-07': { file: '状态栏07-角色此刻来信.json', tag: 'status_p07', lines: [['Time',[0]],['Location',[1]],['Affection',[2,3]],['Body',[4]],['Hands',[5]],['Action',[6]],['InnerVoice',[7]],['Postscript',[8]]] },
    'beauty-record-status-08': { file: '状态栏08-唱片角色状态.json', tag: 'status_p08', lines: [['Time',[0]],['Location',[1]],['Affection',[2]],['Body',[3]],['Hands',[4]],['HiddenAction',[5]],['Plan',[6]],['InnerVoice',[7]]] },
    'beauty-archive-status-09': { file: '状态栏09-角色档案.json', tag: 'status_p09', lines: [['Time',[0]],['Location',[1]],['Affection',[2,3]],['Whisper',[4]],['Temperature',[5]],['Breathing',[6]],['Shoulders',[7]],['Palms',[8]],['Sensation',[9]],['Chapter',[10]],['Fortune',[11]],['InnerVoice',[12]]] },
    'beauty-flower-echo-10': { file: '状态栏10-花冠回声簿.json', tag: 'status_panel', lines: commonLines10To15 },
    'beauty-clock-travel-11': { file: '状态栏11-时针旅页.json', tag: 'status_panel', lines: commonLines10To15 },
    'beauty-flower-reader-12': { file: '状态栏12-花间读者札.json', tag: 'status_panel', lines: commonLines10To15 },
    'beauty-olive-ticket-13': { file: '状态栏13-橄榄票根簿.json', tag: 'status_panel', lines: commonLines10To15 },
    'beauty-cat-rabbit-14': { file: '状态栏14-猫兔夜话.json', tag: 'status_panel', lines: commonLines10To15 },
    'beauty-rabbit-track-15': { file: '状态栏15-兔子计划跑道.json', tag: 'status_panel', lines: commonLines10To15 },
});

export const STATUS_BEAUTY_01_15_IDS = Object.freeze(Object.keys(BUNDLED));
const cache = new Map();

export function isStatusBeauty01To15(structure) {
    return Object.hasOwn(BUNDLED, structure);
}

export function statusBeautyBundleMeta(structure) {
    return BUNDLED[structure] || null;
}

function adaptBundledRegex(structure, script) {
    if (structure === 'beauty-crimson-letter-01') {
        return {
            ...script,
            findRegex: '/<(?:qingshan_status|status_qingshan)>\\s*\\[(?:Affection|情愫)\\|(.*?)\\]\\s*\\[(?:Desire|欲念)\\|(.*?)\\]\\s*\\[(?:Attire|衣冠)\\|(.*?)\\]\\s*\\[(?:Location|身处)\\|(.*?)\\]\\s*\\[(?:InnerVoice|心语)\\|(.*?)\\]\\s*\\[(?:Letter|书信)\\|(.*?)\\]\\s*\\[(?:AffectionNote|情愫注)\\|(.*?)\\]\\s*\\[(?:DesireNote|欲念注)\\|(.*?)\\]\\s*\\[(?:Time|时间)\\|(.*?)\\]\\s*\\[(?:Chapter|当前章节)\\|(.*?)\\]\\s*<\\/(?:qingshan_status|status_qingshan)>/s',
            replaceString: String(script.replaceString || '')
                .replaceAll('雪 后 · 第 三 回', '$10')
                .replaceAll('山寺西廊', '$4')
                .replaceAll('SNOW / 17:20', '$9'),
        };
    }
    if (structure === 'moon-collage') {
        const replacements = [
            ['<strong class="value label-value label-1" data-capture="3">$3</strong>', '<strong class="value label-value label-1" data-label="2">衣冠</strong>'],
            ['<strong class="value value-3 long-value" data-capture="4">$4</strong>', '<strong class="value value-3 long-value" data-capture="3">$3</strong>'],
            ['<strong class="value label-value label-2" data-capture="5">$5</strong>', '<strong class="value label-value label-2" data-label="3">身处</strong>'],
            ['<strong class="value value-4 long-value" data-capture="6">$6</strong>', '<strong class="value value-4 long-value" data-capture="4">$4</strong>'],
            ['<strong class="value label-value label-3" data-capture="7">$7</strong>', '<strong class="value label-value label-3" data-label="4">心语</strong>'],
            ['<strong class="value value-5 long-value" data-capture="8">$8</strong>', '<strong class="value value-5 long-value" data-capture="5">$5</strong>'],
            ['<strong class="value label-value label-4" data-capture="9">$9</strong>', '<strong class="value label-value label-4" data-label="5">书信</strong>'],
            ['<strong class="value value-6 long-value" data-capture="10">$10</strong>', '<strong class="value value-6 long-value" data-capture="6">$6</strong>'],
            ['<strong class="value value-7 note-value" data-capture="11">$11</strong>', '<strong class="value value-7 note-value" data-capture="7">$7</strong>'],
            ['<strong class="value value-8 note-value" data-capture="12">$12</strong>', '<strong class="value value-8 note-value" data-capture="8">$8</strong>'],
        ];
        let replaceString = String(script.replaceString || '');
        replacements.forEach(([before, after]) => { replaceString = replaceString.replaceAll(before, after); });
        return {
            ...script,
            findRegex: '/<(?:qingshan_status|status_qingshan)>\\s*\\[(?:Affection|情愫)\\|(.*?)\\]\\s*\\[(?:Desire|欲念)\\|(.*?)\\]\\s*\\[(?:Attire|衣冠)\\|(.*?)\\]\\s*\\[(?:Location|身处)\\|(.*?)\\]\\s*\\[(?:InnerVoice|心语)\\|(.*?)\\]\\s*\\[(?:Letter|书信)\\|(.*?)\\]\\s*\\[(?:AffectionNote|情愫注)\\|(.*?)\\]\\s*\\[(?:DesireNote|欲念注)\\|(.*?)\\]\\s*<\\/(?:qingshan_status|status_qingshan)>/s',
            replaceString,
        };
    }
    return script;
}

export async function loadStatusBeautyBundledRegex(structure) {
    const meta = statusBeautyBundleMeta(structure);
    if (!meta) throw new Error('当前模板没有对应的原始正则成品');
    if (!cache.has(structure)) {
        cache.set(structure, fetch(new URL(meta.file, BUNDLE_ROOT)).then(response => {
            if (!response.ok) throw new Error(`无法读取原始正则成品：${response.status}`);
            return response.json();
        }).then(script => adaptBundledRegex(structure, script)));
    }
    return cache.get(structure);
}

function fieldPlaceholder(field, pageLabel) {
    return `{{${pageLabel}·${field?.label || '状态'}：${field?.instruction || '根据当前剧情动态填写'}}}`;
}

export function buildStatusBeautyBundledInstruction(rule) {
    const meta = statusBeautyBundleMeta(rule?.structure);
    if (!meta) return '';
    const page = rule.pages?.[0];
    const fields = page?.fields || rule.pageFields || [];
    const pageLabel = page?.label || '当前角色';
    const outputLines = meta.lines.map(([key, indexes]) => `[${key}|${indexes.map(index => fieldPlaceholder(fields[index], pageLabel)).join('|')}]`);
    const fieldGuide = fields.map((field, index) => `- 第${index + 1}项“${field.label}”：${field.instruction}`).join('\n');
    return [
        `<${meta.tag}_rules>`,
        `每次正文结束后，必须追加一个 <${meta.tag}> 状态区块。`,
        '所有值必须根据当前剧情动态生成；模板中的双花括号只是填写说明，回复时不得原样保留。',
        '方括号内严格使用英文竖线分隔；值中不得出现英文竖线、方括号、尖括号或 Markdown 加粗。',
        '不要输出 HTML，不要把状态区块放入 Markdown 代码块，不要遗漏或改变字段顺序。',
        '',
        '动态字段说明：',
        fieldGuide,
        '',
        '严格输出模板：',
        `<${meta.tag}>`,
        ...outputLines,
        `</${meta.tag}>`,
        `</${meta.tag}_rules>`,
    ].join('\n');
}

export function parseStatusBeautyBundledOutput(rule, rawOutput) {
    const meta = statusBeautyBundleMeta(rule?.structure);
    if (!meta) return null;
    const source = String(rawOutput || '');
    const block = source.match(new RegExp(`<${meta.tag}>\\s*([\\s\\S]*?)\\s*<\\/${meta.tag}>`, 'i'))?.[1] || source;
    const records = {};
    for (const match of block.matchAll(/[\[【]([^\]】\r\n]+)[\]】]/g)) {
        const parts = match[1].replace(/｜/g, '|').split('|').map(value => value.trim());
        const key = parts.shift();
        if (key) records[key] = parts;
    }
    const values = [];
    const missing = [];
    for (const [key, indexes] of meta.lines) {
        const record = records[key] || [];
        if (record.length < indexes.length) missing.push(key);
        indexes.forEach((index, valueIndex) => { values[index] = record[valueIndex] || ''; });
    }
    if (missing.length) throw new Error(`AI 状态区块缺少完整记录：${missing.join('、')}`);
    return { rule, shared: [], pages: [{ page: rule.pages[0], values }], raw: source };
}

export function buildStatusBeautyBundledPreviewDocument(regexScript) {
    let html = String(regexScript?.replaceString || '').trim();
    html = html.replace(/^```html\s*/i, '').replace(/\s*```$/, '');
    const previewPatch = `<script>(function(){var root=document.body;if(!root)return;var pending=[];var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(walker.nextNode()){var node=walker.currentNode;var parent=node.parentElement;if(!parent||parent.closest('script,style,[data-capture]'))continue;if(/\\$\\d{1,2}/.test(node.nodeValue||''))pending.push(node);}pending.forEach(function(node){var parts=(node.nodeValue||'').split(/(\\$\\d{1,2})/g);var fragment=document.createDocumentFragment();parts.forEach(function(part){var match=part.match(/^\\$(\\d{1,2})$/);if(match){var span=document.createElement('span');span.dataset.capture=match[1];span.textContent='X';fragment.appendChild(span);}else if(part){fragment.appendChild(document.createTextNode(part));}});node.replaceWith(fragment);});root.querySelectorAll('[data-capture]').forEach(function(node){node.textContent='X';});root.querySelectorAll('*').forEach(function(node){Array.from(node.attributes||[]).forEach(function(attribute){if(/\\$\\d{1,2}/.test(attribute.value))node.setAttribute(attribute.name,attribute.value.replace(/\\$\\d{1,2}/g,'X'));});});})();</script>`;
    return /<\/body>/i.test(html)
        ? html.replace(/<\/body>/i, `${previewPatch}</body>`)
        : `${html}${previewPatch}`;
}

export function applyStatusBeautyTextOverrides(regexScript, overrides = {}) {
    const entries = Object.entries(overrides || {}).filter(([, value]) => String(value || '').trim());
    if (!entries.length) return regexScript;
    const payload = JSON.stringify(Object.fromEntries(entries)).replace(/</g, '\\u003c');
    const patch = `<script>(function(){var edits=${payload};var root=document.querySelector('.status-card')||Array.from(document.body.children).find(function(node){return node.matches&&node.matches('details,section,article,main,div');})||document.body.firstElementChild;if(!root)return;var nodes=Array.from(root.querySelectorAll('h1,h2,h3,h4,h5,h6,span,strong,small,em,b,p,label')).filter(function(node){var text=(node.textContent||'').trim();return text&&text.length<=80&&/[A-Za-z0-9\\u3400-\\u9fff]/.test(text)&&!node.closest('button')&&!node.matches('[data-capture],[data-value],[data-label],[data-design-title]')&&!node.querySelector('[data-capture],[data-value],[data-label]')&&node.children.length===0;});Object.keys(edits).forEach(function(key){var node=nodes[Number(key)];if(node)node.textContent=edits[key];});})();</script>`;
    const replacement = String(regexScript?.replaceString || '');
    return {
        ...regexScript,
        replaceString: /<\/body>/i.test(replacement)
            ? replacement.replace(/<\/body>/i, `${patch}</body>`)
            : `${replacement}${patch}`,
    };
}

export function applyStatusBeautyMediaSettings(regexScript, media = {}) {
    const payload = JSON.stringify({
        avatarSource: ['none', 'character', 'user', 'url'].includes(media.avatarSource) ? media.avatarSource : 'character',
        avatarUrl: String(media.avatarUrl || ''),
        imageAlt: String(media.imageAlt || '当前角色头像').slice(0, 80),
    }).replace(/</g, '\\u003c');
    const patch = `<script>(function(){var media=${payload};var root=document.querySelector('.status-card')||Array.from(document.body.children).find(function(node){return node.matches&&node.matches('details,section,article,main,div');})||document.body.firstElementChild;if(!root)return;var images=Array.from(root.querySelectorAll('img[data-st-avatar],img[alt*="角色头像"],img.avatar,img.art-photo'));images.forEach(function(image){image.setAttribute('data-st-avatar','');if(media.avatarSource==='none'||!media.avatarUrl){image.removeAttribute('src');image.hidden=true;return;}image.src=media.avatarUrl;image.alt=media.imageAlt;image.hidden=false;});})();</script>`;
    const replacement = String(regexScript?.replaceString || '');
    return {
        ...regexScript,
        replaceString: /<\/body>/i.test(replacement)
            ? replacement.replace(/<\/body>/i, `${patch}</body>`)
            : `${replacement}${patch}`,
    };
}

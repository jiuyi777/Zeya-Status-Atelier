const FIELD_KINDS = new Set(['text', 'long', 'number', 'progress', 'currency']);

const DEFAULT_SHARED_FIELDS = [
    { label: '日期', instruction: '填写当前剧情日期', kind: 'text' },
    { label: '时间', instruction: '填写当前剧情时间', kind: 'text' },
    { label: '天气', instruction: '填写当前天气与体感', kind: 'text' },
];

const DEFAULT_PAGE_FIELDS = [
    { label: '当前位置', instruction: '填写该角色当前所在地点', kind: 'text' },
    { label: '关系值', instruction: '填写0到100之间的整数，只写数字', kind: 'progress' },
    { label: '关系变化', instruction: '填写本轮变化，例如+3或-1', kind: 'number' },
    { label: '当前状态', instruction: '填写该角色当前身体与情绪状态', kind: 'text' },
    { label: '内心想法', instruction: '第一人称填写该角色此刻没有说出口的真实想法', kind: 'long' },
    { label: '对用户观察', instruction: '填写该角色对用户本轮言行的观察', kind: 'long' },
    { label: '近期记忆', instruction: '填写与当前剧情最相关的一段近期记忆', kind: 'long' },
    { label: '下一步打算', instruction: '填写该角色最可能采取的下一步行动', kind: 'long' },
];

export const RULE_PRESETS = Object.freeze({
    relationship: {
        ruleName: '攻略关系状态栏',
        tagName: 'zeya_relationship',
        title: '关系状态记录',
        subtitle: 'RELATIONSHIP NOTE',
        theme: 'classical',
        layout: 'grid',
        pagesText: '当前攻略对象|填写当前主要攻略对象的姓名与身份',
        sharedFieldsText: '日期时间|填写当前剧情日期与时间|text|datetime\n当前位置|填写当前场景地点|text|location',
        pageFieldsText: '当前关系|填写双方目前的关系阶段|text|relation\n好感度|填写0到100之间的整数，只写数字|progress|affection\n变化原因|填写本轮关系变化的具体原因|long|change_reason\n内心独白|第一人称填写没有说出口的真实想法|long|inner_voice',
    },
    openingInfo: {
        ruleName: '开局信息状态栏',
        tagName: 'zeya_opening_info',
        title: '序章情报页',
        subtitle: 'OPENING DOSSIER',
        theme: 'newspaper',
        layout: 'grid',
        pagesText: '当前开局|填写当前开局路线或视角',
        sharedFieldsText: '日期时间|填写当前剧情日期与时间|text|datetime\n当前位置|填写当前地点|text|location\n玩家身份|填写用户在本路线中的身份|text|player_identity',
        pageFieldsText: '世界前提|概括本路线必须知道的世界设定|long|world_intro\n当前目标|填写用户目前最需要完成的目标|long|objective\n阅读提示|填写本路线当前重要提示|long|reading_tip',
    },
    worldNpc: {
        ruleName: '大世界NPC状态栏',
        tagName: 'zeya_world_npc',
        title: '大陆动态档案',
        subtitle: 'WORLD & NPC ARCHIVE',
        theme: 'timeline',
        layout: 'grid',
        pagesText: '当前区域|填写当前所在地区或主要观察区域',
        sharedFieldsText: '区域|填写当前地区|text|region\n天气|填写天气与环境变化|text|weather\n世界事件|填写正在发生的重要世界事件|long|world_event',
        pageFieldsText: '阵营态势|填写当前主要阵营关系|long|faction_state\nNPC动态|列出当前重要NPC及其最新动向|long|npc_list\n声望|填写用户在当前区域的声望数值或级别|number|reputation\n威胁等级|填写当前区域威胁等级|text|threat',
    },
    survival: {
        ruleName: '生存探索状态栏',
        tagName: 'zeya_survival',
        title: '探索记录',
        subtitle: 'EXPEDITION LOG',
        theme: 'obsidian',
        layout: 'grid',
        pagesText: '当前探索|填写当前探索者或队伍名称',
        sharedFieldsText: '时间|填写当前时间|text|time\n区域|填写当前探索区域|text|region\n环境危险|填写即将发生或正在发生的环境危险|long|environment_danger',
        pageFieldsText: '生命值|填写0到100之间的整数，只写数字|progress|health\n补给|填写剩余水、食物与关键资源|text|supply\n背包摘要|列出当前关键物品|long|inventory\n当前任务|填写当前任务目标与进度|long|quest',
    },
    universalClassical: {
        ruleName: '通用状态栏01·古典对称',
        tagName: 'zeya_status',
        title: '人物状态记录',
        subtitle: 'STORY STATUS',
        theme: 'classical',
        layout: 'grid',
        pagesText: '角色一|填写第一个角色或视角的名称与身份\n角色二|填写第二个角色或视角的名称与身份',
        sharedFieldsText: DEFAULT_SHARED_FIELDS.map(field => `${field.label}|${field.instruction}|${field.kind}`).join('\n'),
        pageFieldsText: DEFAULT_PAGE_FIELDS.map(field => `${field.label}|${field.instruction}|${field.kind}`).join('\n'),
    },
    universalNewspaper: {
        ruleName: '通用状态栏03·复古报刊',
        tagName: 'zeya_status',
        title: '剧情人物档案',
        subtitle: 'DAILY CHARACTER FILE',
        theme: 'newspaper',
        layout: 'grid',
        pagesText: '角色一|填写第一个角色或视角的名称与身份\n角色二|填写第二个角色或视角的名称与身份',
        sharedFieldsText: DEFAULT_SHARED_FIELDS.map(field => `${field.label}|${field.instruction}|${field.kind}`).join('\n'),
        pageFieldsText: DEFAULT_PAGE_FIELDS.map(field => `${field.label}|${field.instruction}|${field.kind}`).join('\n'),
    },
    universalTimeline: {
        ruleName: '通用状态栏04·中轴时间线',
        tagName: 'zeya_status',
        title: '人物轨迹',
        subtitle: 'CHARACTER TIMELINE',
        theme: 'timeline',
        layout: 'stack',
        pagesText: '角色一|填写第一个角色或视角的名称与身份\n角色二|填写第二个角色或视角的名称与身份',
        sharedFieldsText: DEFAULT_SHARED_FIELDS.map(field => `${field.label}|${field.instruction}|${field.kind}`).join('\n'),
        pageFieldsText: DEFAULT_PAGE_FIELDS.map(field => `${field.label}|${field.instruction}|${field.kind}`).join('\n'),
    },
    universalMinimal: {
        ruleName: '通用状态栏05·极简留白',
        tagName: 'zeya_status',
        title: '当前状态',
        subtitle: 'CURRENT STATUS',
        theme: 'minimal',
        layout: 'grid',
        pagesText: '角色一|填写第一个角色或视角的名称与身份\n角色二|填写第二个角色或视角的名称与身份',
        sharedFieldsText: DEFAULT_SHARED_FIELDS.map(field => `${field.label}|${field.instruction}|${field.kind}`).join('\n'),
        pageFieldsText: DEFAULT_PAGE_FIELDS.map(field => `${field.label}|${field.instruction}|${field.kind}`).join('\n'),
    },
    richTwins: {
        ruleName: '双页剧情状态',
        tagName: 'zeya_status',
        title: '人物状态记录',
        subtitle: 'STORY STATUS',
        theme: 'newspaper',
        layout: 'grid',
        pagesText: '角色一|填写第一个角色或视角的名称与身份\n角色二|填写第二个角色或视角的名称与身份',
        sharedFieldsText: DEFAULT_SHARED_FIELDS.map(field => `${field.label}|${field.instruction}|${field.kind}`).join('\n'),
        pageFieldsText: DEFAULT_PAGE_FIELDS.map(field => `${field.label}|${field.instruction}|${field.kind}`).join('\n'),
    },
    twinsDiary: {
        ruleName: '双页信封日记',
        tagName: 'zeya_diary',
        title: '私密日记',
        subtitle: 'PRIVATE DIARY',
        theme: 'envelope',
        layout: 'stack',
        pagesText: '角色一|填写第一位日记书写者的姓名与性格要求\n角色二|填写第二位日记书写者的姓名与性格要求',
        sharedFieldsText: '日期|填写本轮剧情日期|text',
        pageFieldsText: '可用资金|填写具体金额并带货币符号|currency\n日记正文|第一人称、紧扣最近剧情，填写50到150字的真实日记|long',
    },
    singleStatus: {
        ruleName: '单页通用状态',
        tagName: 'zeya_status',
        title: '角色状态',
        subtitle: 'STATUS',
        theme: 'glass',
        layout: 'grid',
        pagesText: '当前角色|填写当前主要角色的姓名与身份',
        sharedFieldsText: DEFAULT_SHARED_FIELDS.map(field => `${field.label}|${field.instruction}|${field.kind}`).join('\n'),
        pageFieldsText: DEFAULT_PAGE_FIELDS.slice(0, 6).map(field => `${field.label}|${field.instruction}|${field.kind}`).join('\n'),
    },
});

function splitLine(line) {
    const values = [];
    let current = '';
    let escaped = false;
    for (const character of String(line)) {
        if (escaped) {
            current += character;
            escaped = false;
        } else if (character === '\\') {
            escaped = true;
        } else if (character === '|') {
            values.push(current.trim());
            current = '';
        } else {
            current += character;
        }
    }
    values.push(current.trim());
    return values;
}

function meaningfulLines(value) {
    return String(value ?? '')
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
}

export function parsePages(value) {
    return meaningfulLines(value).map((line, index) => {
        const [label, instruction = ''] = splitLine(line);
        return {
            id: `View${index + 1}`,
            label: label || `角色${index + 1}`,
            instruction: instruction || `填写${label || `角色${index + 1}`}的身份与视角要求`,
        };
    });
}

export function parseFields(value) {
    return meaningfulLines(value).map((line, index) => {
        const [label, instruction = '', rawKind = 'text', rawKey = ''] = splitLine(line);
        const kind = FIELD_KINDS.has(rawKind.toLowerCase()) ? rawKind.toLowerCase() : 'text';
        const stableKey = String(rawKey || `field_${index + 1}`).trim().replace(/[^a-zA-Z0-9_-]/g, '_') || `field_${index + 1}`;
        return {
            id: stableKey,
            label: label || `字段${index + 1}`,
            instruction: instruction || `根据当前剧情填写${label || `字段${index + 1}`}`,
            kind,
        };
    });
}

export function sanitizeTagName(value) {
    const cleaned = String(value ?? '').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    return cleaned || 'zeya_status';
}

export function normalizeRule(input = {}) {
    const pages = parsePages(input.pagesText);
    const sharedFields = parseFields(input.sharedFieldsText);
    const pageFields = parseFields(input.pageFieldsText);
    return {
        ruleId: String(input.ruleId || 'zeya-status-rule'),
        ruleName: String(input.ruleName || '双页剧情状态').trim() || '双页剧情状态',
        tagName: sanitizeTagName(input.tagName),
        title: String(input.title || '人物状态记录'),
        subtitle: String(input.subtitle || 'STORY STATUS'),
        theme: ['classical', 'newspaper', 'timeline', 'minimal', 'envelope', 'glass', 'obsidian'].includes(input.theme) ? input.theme : 'newspaper',
        layout: input.layout === 'stack' ? 'stack' : 'grid',
        pages: pages.length ? pages : parsePages(RULE_PRESETS.relationship.pagesText),
        sharedFields,
        pageFields: pageFields.length ? pageFields : DEFAULT_PAGE_FIELDS,
    };
}

function placeholder(field, pageLabel = '') {
    const subject = pageLabel ? `${pageLabel}·` : '';
    return `{{${subject}${field.label}：${field.instruction}}}`;
}

export function buildAiInstruction(input) {
    const rule = normalizeRule(input);
    const records = [];
    if (rule.sharedFields.length) {
        records.push(`[Shared|${rule.sharedFields.map(field => placeholder(field)).join('|')}]`);
    }
    for (const page of rule.pages) {
        records.push(`[${page.id}|${rule.pageFields.map(field => placeholder(field, page.label)).join('|')}]`);
    }

    const pageGuide = rule.pages.map(page => `- ${page.id} 对应“${page.label}”：${page.instruction}`).join('\n');
    const fieldGuide = rule.pageFields.map((field, index) => `- 第${index + 1}项“${field.label}”：${field.instruction}`).join('\n');
    return [
        `<${rule.tagName}_rules>`,
        `每次正文结束后，必须追加一个 <${rule.tagName}> 状态区块。`,
        '区块中的所有值都必须根据当前剧情动态生成；模板中的双花括号只是填写说明，回复时不得原样保留。',
        '方括号内严格使用英文竖线分隔。值中不得出现英文竖线、方括号、尖括号或 Markdown 加粗。',
        '不要把状态区块放进 Markdown 代码块，不要输出 HTML，不要遗漏记录，也不要附加同类的第二套状态格式。',
        '',
        '切换页对应关系：',
        pageGuide,
        '',
        '每个切换页的动态字段顺序：',
        fieldGuide,
        '',
        '严格输出模板：',
        `<${rule.tagName}>`,
        ...records,
        `</${rule.tagName}>`,
        `</${rule.tagName}_rules>`,
    ].join('\n');
}

export function buildWorldbookJson(input) {
    const rule = normalizeRule(input);
    return {
        entries: {
            0: {
                uid: 0,
                key: [],
                keysecondary: [],
                comment: `Zeya · ${rule.ruleName} · AI动态输出规则`,
                content: buildAiInstruction(input),
                constant: true,
                vectorized: false,
                selective: true,
                selectiveLogic: 0,
                addMemo: true,
                order: 100,
                position: 0,
                disable: false,
                ignoreBudget: false,
                excludeRecursion: false,
                preventRecursion: false,
                matchPersonaDescription: false,
                matchCharacterDescription: false,
                matchCharacterPersonality: false,
                matchCharacterDepthPrompt: false,
                matchScenario: false,
                matchCreatorNotes: false,
                delayUntilRecursion: 0,
                probability: 100,
                useProbability: true,
                depth: 4,
                outletName: '',
                group: '',
                groupOverride: false,
                groupWeight: 100,
                scanDepth: null,
                caseSensitive: null,
                matchWholeWords: null,
                useGroupScoring: null,
                automationId: '',
                role: 0,
                sticky: null,
                cooldown: null,
                delay: null,
                triggers: [],
            },
        },
    };
}

function safeJsonForScript(value) {
    return JSON.stringify(value)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026');
}

function generatedReplacement(rule) {
    const renderConfig = {
        title: rule.title,
        subtitle: rule.subtitle,
        theme: rule.theme,
        layout: rule.layout,
        pages: rule.pages,
        sharedFields: rule.sharedFields,
        pageFields: rule.pageFields,
    };
    const configJson = safeJsonForScript(renderConfig);
    return `\`\`\`html
<div class="zeya-regex-status" data-theme="${rule.theme}" data-layout="${rule.layout}">
  <textarea class="zrs-source" hidden>$1</textarea>
  <section class="zrs-card">
    <header class="zrs-header">
      <div><h3 class="zrs-title"></h3><p class="zrs-subtitle"></p></div>
      <button class="zrs-collapse" type="button" aria-label="展开或收起">⌄</button>
    </header>
    <div class="zrs-content">
      <div class="zrs-shared"></div>
      <nav class="zrs-tabs" aria-label="状态页切换"></nav>
      <div class="zrs-fields"></div>
    </div>
  </section>
</div>
<style>
.zeya-regex-status,.zeya-regex-status *{box-sizing:border-box}.zeya-regex-status{--z-accent:#9b6849;--z-bg:#f2e5c5;--z-card:#f8efd7;--z-text:#493a2b;--z-muted:#7a6954;width:min(100%,620px);margin:14px auto;color:var(--z-text);font-family:"Noto Serif SC","Songti SC",serif}.zeya-regex-status[data-theme="envelope"]{--z-accent:#9b4b58;--z-bg:#4a566e;--z-card:#faf6ed;--z-text:#2a3242;--z-muted:#687185}.zeya-regex-status[data-theme="glass"]{--z-accent:#6ec7d9;--z-bg:#102631;--z-card:#173844;--z-text:#e9f8fb;--z-muted:#9dbdc5}.zeya-regex-status[data-theme="obsidian"]{--z-accent:#d7d7d7;--z-bg:#090909;--z-card:#141414;--z-text:#f3f3f3;--z-muted:#a7a7a7}.zrs-card{overflow:hidden;border:2px solid var(--z-accent);border-radius:14px;background:linear-gradient(145deg,color-mix(in srgb,var(--z-accent) 8%,transparent),transparent 44%),var(--z-card);box-shadow:0 12px 28px rgba(0,0,0,.22)}.zeya-regex-status[data-theme="newspaper"] .zrs-card{border:4px double var(--z-accent);border-radius:2px}.zeya-regex-status[data-theme="timeline"] .zrs-card{border-radius:22px;border-color:color-mix(in srgb,var(--z-muted) 60%,transparent)}.zeya-regex-status[data-theme="timeline"] .zrs-content{margin-left:18px;border-left:1px solid var(--z-muted)}.zeya-regex-status[data-theme="timeline"] .zrs-shared-item,.zeya-regex-status[data-theme="timeline"] .zrs-field{position:relative;border-radius:12px}.zeya-regex-status[data-theme="timeline"] .zrs-shared-item::before,.zeya-regex-status[data-theme="timeline"] .zrs-field::before{content:"";position:absolute;left:-20px;top:17px;width:7px;height:7px;border:2px solid var(--z-card);border-radius:50%;background:var(--z-accent)}.zeya-regex-status[data-theme="minimal"] .zrs-card{border:0;border-radius:0;box-shadow:none}.zeya-regex-status[data-theme="minimal"] .zrs-header{padding-inline:0;background:transparent}.zeya-regex-status[data-theme="minimal"] .zrs-content{padding-inline:0}.zeya-regex-status[data-theme="minimal"] .zrs-shared-item,.zeya-regex-status[data-theme="minimal"] .zrs-field{border-width:0 0 1px;background:transparent}.zeya-regex-status[data-theme="minimal"] .zrs-tab{border-width:0 0 1px;border-radius:0}.zrs-header{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid color-mix(in srgb,var(--z-accent) 45%,transparent);background:color-mix(in srgb,var(--z-bg) 18%,var(--z-card))}.zrs-title{margin:0;font-size:1.12em;letter-spacing:.16em}.zrs-subtitle{margin:3px 0 0;color:var(--z-muted);font:600 .68em/1.2 sans-serif;letter-spacing:.2em}.zrs-collapse{min-width:36px;min-height:36px;border:1px solid color-mix(in srgb,var(--z-accent) 50%,transparent);border-radius:50%;color:var(--z-text);background:transparent;cursor:pointer}.zrs-content{padding:13px}.zrs-shared{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:7px;margin-bottom:11px}.zrs-shared-item,.zrs-field{min-width:0;padding:9px 10px;border:1px solid color-mix(in srgb,var(--z-accent) 26%,transparent);background:color-mix(in srgb,var(--z-bg) 7%,transparent)}.zrs-label{display:block;margin-bottom:3px;color:var(--z-muted);font:600 .72em/1.35 sans-serif;letter-spacing:.08em}.zrs-value{display:block;white-space:pre-wrap;overflow-wrap:anywhere}.zrs-tabs{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 11px}.zrs-tab{flex:1 1 90px;padding:8px 10px;border:1px solid color-mix(in srgb,var(--z-accent) 38%,transparent);border-radius:999px;color:var(--z-text);background:transparent;cursor:pointer}.zrs-tab.is-active{color:var(--z-card);background:var(--z-accent)}.zrs-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.zeya-regex-status[data-layout="stack"] .zrs-fields{grid-template-columns:1fr}.zrs-field[data-kind="long"]{grid-column:1/-1}.zrs-meter{height:7px;margin-top:7px;overflow:hidden;border-radius:999px;background:color-mix(in srgb,var(--z-accent) 16%,transparent)}.zrs-meter>i{display:block;width:0;height:100%;background:var(--z-accent);transition:width .35s ease}.zeya-regex-status.is-collapsed .zrs-content{display:none}.zeya-regex-status.is-collapsed .zrs-collapse{transform:rotate(-90deg)}@media(max-width:520px){.zrs-fields{grid-template-columns:1fr}.zrs-field{grid-column:1}.zrs-header{padding:12px}.zrs-content{padding:10px}}
</style>
<script>
(function(script){
  var root=script.previousElementSibling.previousElementSibling;
  if(!root||!root.classList.contains('zeya-regex-status'))return;
  var config=${configJson};
  var raw=root.querySelector('.zrs-source').value||'';
  var records={};
  var lines=raw.split(/\\r?\\n/);
  for(var i=0;i<lines.length;i++){
    var line=lines[i].trim();
    if(line.charAt(0)!=='['||line.charAt(line.length-1)!==']')continue;
    var parts=line.slice(1,-1).split('|').map(function(value){return value.trim();});
    var key=parts.shift();if(key)records[key]=parts;
  }
  var title=root.querySelector('.zrs-title');var subtitle=root.querySelector('.zrs-subtitle');
  title.textContent=config.title;subtitle.textContent=config.subtitle;
  function make(tag,className,text){var el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=String(text);return el;}
  function addValue(host,field,value){var item=make('div',host.classList.contains('zrs-shared')?'zrs-shared-item':'zrs-field');item.dataset.kind=field.kind;item.append(make('span','zrs-label',field.label),make('span','zrs-value',value||'—'));if(field.kind==='progress'){var n=Number(String(value||'').match(/-?\\d+(?:\\.\\d+)?/)?.[0]);if(!Number.isFinite(n))n=0;n=Math.max(0,Math.min(100,n));var meter=make('span','zrs-meter');var fill=make('i');fill.style.width=n+'%';meter.append(fill);item.append(meter);}host.append(item);}
  var shared=root.querySelector('.zrs-shared');var sharedValues=records.Shared||[];
  config.sharedFields.forEach(function(field,index){addValue(shared,field,sharedValues[index]);});
  if(!config.sharedFields.length)shared.remove();
  var tabs=root.querySelector('.zrs-tabs');var fields=root.querySelector('.zrs-fields');
  function showPage(index){var page=config.pages[index];var values=records[page.id]||[];fields.replaceChildren();config.pageFields.forEach(function(field,fieldIndex){addValue(fields,field,values[fieldIndex]);});root.querySelectorAll('.zrs-tab').forEach(function(button,buttonIndex){button.classList.toggle('is-active',buttonIndex===index);});}
  config.pages.forEach(function(page,index){var button=make('button','zrs-tab',page.label);button.type='button';button.addEventListener('click',function(){showPage(index);});tabs.append(button);});
  if(config.pages.length<2)tabs.style.display='none';showPage(0);
  root.querySelector('.zrs-collapse').addEventListener('click',function(){root.classList.toggle('is-collapsed');});
})(document.currentScript);
</script>
\`\`\``;
}

export function buildRegexScript(input) {
    const rule = normalizeRule(input);
    return {
        id: rule.ruleId,
        scriptName: `Zeya · ${rule.ruleName}`,
        disabled: false,
        runOnEdit: true,
        findRegex: `/<${rule.tagName}>\\s*([\\s\\S]*?)\\s*<\\/${rule.tagName}>/i`,
        trimStrings: [],
        replaceString: generatedReplacement(rule),
        placement: [2],
        substituteRegex: 0,
        minDepth: null,
        maxDepth: null,
        markdownOnly: true,
        promptOnly: false,
    };
}

export function makePreviewRecords(input) {
    const rule = normalizeRule(input);
    const sampleFor = field => {
        if (field.kind === 'progress') return 'AI动态数值';
        if (field.kind === 'currency') return 'AI动态金额';
        if (field.kind === 'long') return '这里显示 AI 根据当前剧情生成的长文本。';
        return 'AI动态填写';
    };
    return {
        rule,
        shared: rule.sharedFields.map(sampleFor),
        pages: rule.pages.map(page => ({ page, values: rule.pageFields.map(sampleFor) })),
    };
}

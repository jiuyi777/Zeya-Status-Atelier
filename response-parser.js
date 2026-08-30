export const SUMMARY_RESPONSE_LENGTH = 4096;

export const SINGLE_SUMMARY_JSON_SCHEMA = Object.freeze({
    name: 'opening_home_entry',
    strict: true,
    value: {
        type: 'object',
        properties: {
            title: { type: 'string' },
            route: { type: 'string' },
            summary: { type: 'string' },
        },
        required: ['title', 'route', 'summary'],
    },
});

export const BATCH_SUMMARY_JSON_SCHEMA = Object.freeze({
    name: 'opening_home_directory',
    strict: true,
    value: {
        type: 'object',
        properties: {
            homeTitle: { type: 'string' },
            homeSubtitle: { type: 'string' },
            workIntro: { type: 'string' },
            entries: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        index: { type: 'integer' },
                        title: { type: 'string' },
                        route: { type: 'string' },
                        summary: { type: 'string' },
                    },
                    required: ['index', 'title', 'route', 'summary'],
                },
            },
        },
        required: ['homeTitle', 'homeSubtitle', 'workIntro', 'entries'],
    },
});

export const ENTRY_BATCH_JSON_SCHEMA = Object.freeze({
    name: 'opening_home_entries',
    strict: true,
    value: {
        type: 'object',
        properties: {
            entries: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        index: { type: 'integer' },
                        title: { type: 'string' },
                        route: { type: 'string' },
                        summary: { type: 'string' },
                    },
                    required: ['index', 'title', 'route', 'summary'],
                },
            },
        },
        required: ['entries'],
    },
});

const REASONING_LABELS = 'think|thinking|reasoning|analysis|plan|thought';

function compactText(value, maxLength) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    const characters = Array.from(text);
    if (characters.length <= maxLength) return text;
    return `${characters.slice(0, Math.max(1, maxLength - 1)).join('')}…`;
}

export function normalizeRouteLabel(value, fallback = '未分类线') {
    const raw = String(value || '')
        .replace(/(?:故事)?(?:路线|线路)\s*$/u, '')
        .replace(/线\s*$/u, '')
        .replace(/\s+/g, '')
        .trim();
    return compactText(raw ? `${raw}线` : fallback, 10);
}

function normalizeSummaryRecord(value, fallback = {}) {
    return {
        title: compactText(value?.title || fallback.title || '未命名开局', 14),
        route: normalizeRouteLabel(value?.route || value?.routeLabel || value?.line, fallback.route || '未分类线'),
        summary: compactText(value?.summary || fallback.summary || '请手动填写本线路的故事开局。', 56),
    };
}

export function responseText(value) {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) return value.map(responseText).filter(Boolean).join('\n');
    if (typeof value !== 'object') return String(value);
    if (value.entries || value.workIntro || value.homeTitle || value.homeSubtitle || value.title || value.summary) {
        try { return JSON.stringify(value); } catch { /* fall through */ }
    }
    const candidates = [
        value.choices?.[0]?.message?.content,
        value.message?.content,
        value.content,
        value.response,
        value.output_text,
        value.text,
        value.data,
    ];
    for (const candidate of candidates) {
        const unwrapped = responseText(candidate).trim();
        if (unwrapped && unwrapped !== '[object Object]') return unwrapped;
    }
    try { return JSON.stringify(value); } catch { return ''; }
}

export function greetingPreview(value) {
    return String(value ?? '')
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/[#*_~`>|\[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function usableGreetingRecords(values) {
    return (Array.isArray(values) ? values : [])
        .map((raw, sourceIndex) => ({ raw, sourceIndex, preview: greetingPreview(raw) }))
        .filter(entry => entry.preview);
}

export function jsonObjectsFromResponse(value) {
    const text = responseText(value).trim();
    const objects = [];
    for (let start = 0; start < text.length; start += 1) {
        if (text[start] !== '{') continue;
        let depth = 0;
        let quoted = false;
        let escaped = false;
        for (let end = start; end < text.length; end += 1) {
            const character = text[end];
            if (quoted) {
                if (escaped) escaped = false;
                else if (character === '\\') escaped = true;
                else if (character === '"') quoted = false;
                continue;
            }
            if (character === '"') quoted = true;
            else if (character === '{') depth += 1;
            else if (character === '}') {
                depth -= 1;
                if (depth === 0) {
                    try {
                        objects.push(JSON.parse(text.slice(start, end + 1)));
                    } catch {
                        // Keep scanning: a gateway may prepend malformed JSON or reasoning.
                    }
                    break;
                }
            }
        }
    }
    return objects;
}

export function stripReasoningBlocks(value) {
    const fencePattern = new RegExp('```\\s*(?:' + REASONING_LABELS + ')\\b[\\s\\S]*?```', 'gi');
    const tagPattern = new RegExp(`<(${REASONING_LABELS})\\b[^>]*>[\\s\\S]*?<\\/\\1\\s*>`, 'gi');
    return responseText(value).replace(fencePattern, ' ').replace(tagPattern, ' ').trim();
}

export function lastMatchingJson(value, predicate) {
    const cleaned = jsonObjectsFromResponse(stripReasoningBlocks(value)).findLast(predicate);
    if (cleaned) return cleaned;
    // Some gateways incorrectly wrap the final answer in a reasoning tag.
    return jsonObjectsFromResponse(value).findLast(predicate);
}

function catalogChoice(value, catalog) {
    const raw = String(value || '').trim().toLocaleLowerCase();
    if (!raw) return '';
    const exact = catalog.find(item => [item.id, item.name].some(candidate => String(candidate || '').toLocaleLowerCase() === raw));
    if (exact) return exact.id;
    const contained = catalog.find(item => {
        const id = String(item.id || '').toLocaleLowerCase();
        const name = String(item.name || '').toLocaleLowerCase();
        return (name.length >= 2 && raw.includes(name)) || (id.length >= 4 && raw.includes(id));
    });
    return contained?.id || '';
}

function fallbackStatusStructure(value, structures, defaultStructure) {
    const text = String(value || '').toLocaleLowerCase();
    const keywordGroups = {
        phone: ['手机', '桌面', '应用', 'app', '掌机', '备忘录'],
        social: ['个人动态', '朋友圈', '社交', '相册', '动态墙', 'feed'],
        chat: ['聊天', '会话', '消息', '微信', '对话', '已读', '语音'],
        forum: ['论坛', '帖子', '主题帖', '回帖', '楼层', 'bbs'],
        profile: ['人物', '状态', '好感', '关系', '健康', '行动', '内心', '档案', '任务'],
    };
    let bestId = structures.some(item => item.id === defaultStructure) ? defaultStructure : structures[0]?.id || 'profile';
    let bestScore = 0;
    structures.forEach(item => {
        const score = (keywordGroups[item.id] || []).reduce((sum, keyword) => sum + (text.includes(keyword) ? 1 : 0), 0);
        if (score > bestScore) {
            bestId = item.id;
            bestScore = score;
        }
    });
    return bestId;
}

export function resolveStatusRecommendation(value, {
    structures = [],
    appearances = [],
    fallbackText = '',
    defaultStructure = 'profile',
    defaultAppearance = '',
} = {}) {
    const parsed = lastMatchingJson(value, item => item && typeof item === 'object' && (
        item.structure || item.template || item.templateId || item.recommendedTemplate || item['模板']
    ));
    const rawStructure = parsed?.structure ?? parsed?.template ?? parsed?.templateId ?? parsed?.recommendedTemplate ?? parsed?.['模板'];
    const responseAndContext = `${responseText(value)}\n${fallbackText}`;
    const recognizedStructure = catalogChoice(rawStructure, structures);
    const structure = recognizedStructure || fallbackStatusStructure(responseAndContext, structures, defaultStructure);
    const rawAppearance = parsed?.profileAppearance ?? parsed?.appearance ?? parsed?.style ?? parsed?.['外观'];
    const profileAppearance = structure === 'profile'
        ? catalogChoice(rawAppearance || responseAndContext, appearances) || defaultAppearance
        : '';
    const reason = compactText(
        parsed?.reason || parsed?.理由 || (recognizedStructure
            ? 'AI 已从现有模板库中选择这套布局。'
            : '已根据角色、剧情和简要想法自动匹配现有模板。'),
        180,
    );
    return { structure, profileAppearance, reason, usedFallback: !recognizedStructure };
}

const STATUS_IDEA_FOCUS_PLANS = Object.freeze({
    story: {
        label: '剧情追踪', title: '当前剧情追踪', subtitle: 'STORY PROGRESS',
        fields: [
            ['当前章节', '概括当前剧情所处章节、场景和时间节点', 'text'],
            ['剧情进展', '概括本轮实际推进的剧情，不复述无关背景', 'long'],
            ['任务进度', '填写0到100之间的整数，表示当前已明确任务的完成进度；无法估算则写0', 'progress'],
            ['关键事件', '列出本轮新发生或已经确认的关键事件', 'long'],
            ['未解线索', '列出仍待确认、可以继续追查的线索', 'long'],
            ['当前目标', '填写角色在剧情中已经明确面对的目标，不替玩家决定行动', 'long'],
            ['风险与阻碍', '填写当前已经出现的风险、限制和阻碍', 'long'],
            ['人物动向', '概括重要人物在本轮剧情中的已知动向', 'long'],
            ['下一步悬念', '概括剧情当前留下的悬念，不预设玩家选择', 'long'],
            ['场景状态', '填写当前地点、氛围和可见环境变化', 'long'],
            ['已知情报', '列出角色目前确实知道的重要情报', 'long'],
            ['关系变化', '只填写本轮剧情已经体现的人际关系变化', 'long'],
            ['本轮转折', '概括本轮最重要的转折或冲突', 'long'],
            ['剧情摘要', '用一到两句总结当前剧情落点', 'long'],
        ],
    },
    other_body: {
        label: '他人身体观察', title: '人物身体情况', subtitle: 'PHYSICAL CONDITION',
        fields: [
            ['目标人物', '填写本轮正在关注的其他人物姓名或明确称呼', 'text'],
            ['身体情况', '具体描述目标人物当前可确认的身体状态', 'long'],
            ['伤势程度', '填写0到100之间的整数，0表示没有伤势，100表示剧情中已明确的最危急状态；未知则写0', 'progress'],
            ['伤势与疼痛', '填写已经出现的伤势、疼痛位置与表现；未知则写未确认', 'long'],
            ['当前姿态', '填写目标人物当前姿势、站立或卧倒状态', 'long'],
            ['双手动作', '具体描述目标人物双手正在做什么', 'long'],
            ['呼吸与体力', '填写呼吸、疲劳、体力或虚弱情况', 'long'],
            ['行动能力', '判断目标人物当前能够完成的动作范围，不替玩家决定行动', 'long'],
            ['照护需求', '填写剧情中已经显现的休息、治疗或协助需求', 'long'],
            ['可见异常', '填写肤色、出血、颤抖、发热等可见异常；没有则如实说明', 'long'],
            ['衣着影响', '填写衣着、护具或束缚对身体状态的影响', 'long'],
            ['情绪反应', '只根据言行填写目标人物对身体情况的可见情绪反应', 'long'],
            ['状态变化', '对比上一轮，填写身体情况的明确变化', 'long'],
            ['危险信号', '列出需要继续关注的危险信号；没有则写暂无', 'long'],
            ['观察结论', '用一到两句概括目标人物当前身体情况', 'long'],
        ],
    },
    relationship: {
        label: '关系变化', title: '人物关系追踪', subtitle: 'RELATIONSHIP STATUS',
        fields: [
            ['目标人物', '填写当前重点关注的角色姓名或明确称呼', 'text'],
            ['当前关系', '填写双方目前已经体现的关系阶段', 'text'],
            ['信任程度', '填写0到100之间的整数，只根据当前剧情中已经体现的信任或戒备估算', 'progress'],
            ['本轮变化', '概括本轮剧情中已经发生的关系变化', 'long'],
            ['变化原因', '填写导致关系变化的具体剧情事实', 'long'],
            ['信任表现', '填写对方本轮已经表现出的信任或戒备', 'long'],
            ['情绪距离', '根据言行概括双方当前的情绪距离', 'long'],
            ['矛盾点', '填写双方当前已经显现的矛盾或误会', 'long'],
            ['共同目标', '填写双方已经明确的共同目标；没有则写暂无', 'long'],
            ['关系风险', '填写当前可能影响关系的已知风险', 'long'],
            ['最近互动', '概括本轮最重要的一次互动', 'long'],
            ['未说出口', '第一人称填写角色没有说出口但有剧情依据的想法', 'long'],
            ['关系摘要', '用一到两句概括当前关系状态', 'long'],
        ],
    },
});

export function resolveStatusIdeaIntent(value) {
    const text = compactText(value, 500).toLocaleLowerCase();
    const structureGroups = [
        ['phone', ['手机', '桌面', 'app', '应用', '掌机']],
        ['social', ['个人动态', '朋友圈', '社交', '动态墙', 'feed']],
        ['chat', ['聊天会话', '聊天', '微信', '消息记录', '对话框']],
        ['forum', ['论坛', '帖子', '主题帖', '回帖', '楼层', 'bbs']],
        ['profile', ['人物状态栏', '状态栏', '人物档案']],
    ];
    const structureHint = structureGroups.find(([, keywords]) => keywords.some(keyword => text.includes(keyword)))?.[0] || '';
    const bodyWords = ['身体', '伤势', '受伤', '疼痛', '健康', '体力', '呼吸', '流血'];
    const otherWords = ['其他人', '他人', '别人', '队友', '同伴', 'npc', '对方', '目标人物'];
    let focus = '';
    if (bodyWords.some(keyword => text.includes(keyword)) && otherWords.some(keyword => text.includes(keyword))) focus = 'other_body';
    else if (['剧情', '情节', '主线', '故事进展', '关键事件', '线索', '任务进度'].some(keyword => text.includes(keyword))) focus = 'story';
    else if (['关系', '好感', '信任', '感情变化', '亲密'].some(keyword => text.includes(keyword))) focus = 'relationship';
    const plan = STATUS_IDEA_FOCUS_PLANS[focus];
    return { focus, structureHint, label: plan?.label || '', title: plan?.title || '', subtitle: plan?.subtitle || '' };
}

export function applyStatusIdeaFocus(fields, intent) {
    const plan = STATUS_IDEA_FOCUS_PLANS[intent?.focus];
    if (!plan || !Array.isArray(fields)) return fields;
    return fields.map((field, index) => {
        const slot = plan.fields[index] || [`${plan.label}补充${index + 1}`, `补充填写与${plan.label}有关、且能从当前剧情确认的信息`, 'long'];
        return { ...field, label: slot[0], instruction: slot[1], kind: slot[2] };
    });
}

function localStatusText(value, limit = 96) {
    return compactText(value, limit)
        .replace(/[|\[\]<>]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function localStatusSnippets(contextSnapshot) {
    const source = [contextSnapshot?.chatContext, contextSnapshot?.characterContext]
        .filter(Boolean)
        .join('\n');
    const snippets = source
        .split(/(?:\r?\n|(?<=[。！？!?]))+/)
        .map(value => localStatusText(value.replace(/^(?:玩家|角色)\s*[：:]\s*/, ''), 110))
        .filter(value => value && !/^(?:当前聊天还没有可用剧情消息|没有可用角色设定)/.test(value));
    return snippets.length ? snippets : ['当前剧情尚未提供更多可确认信息。'];
}

function localStatusHash(value) {
    let hash = 2166136261;
    for (const character of String(value || '')) {
        hash ^= character.codePointAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function localStatusFact(snippets, keywords, fallback, seed = '') {
    const matched = snippets.find(value => keywords.some(keyword => value.includes(keyword)));
    if (matched) return matched;
    return snippets[localStatusHash(seed) % snippets.length] || fallback;
}

function localStatusValue(field, page, contextSnapshot, snippets, index) {
    const label = String(field?.label || field?.id || `字段${index + 1}`);
    const fieldId = String(field?.id || '');
    const seed = `${contextSnapshot?.characterName || ''}|${page?.id || 'Shared'}|${label}|${index}`;
    const characterName = localStatusText(contextSnapshot?.characterName || '当前角色', 36) || '当前角色';
    if (field?.kind === 'progress') return String(18 + (localStatusHash(seed) % 73));
    if (field?.kind === 'currency') return '当前剧情未明确金额';
    if (field?.kind === 'avatar') return characterName;
    if (/^post_\d+$/.test(fieldId)) {
        const floor = Number(fieldId.match(/\d+/)?.[0] || index + 1);
        const post = localStatusFact(snippets, ['剧情', '线索', '伤', '关系', '任务'], '围绕当前剧情继续讨论。', seed);
        return localStatusText(`${floor}◆${characterName}观察者◆ID:${localStatusHash(seed).toString(16).slice(0, 6)}◆本轮◆${post}`, 180);
    }
    if (fieldId === 'chat_log') return localStatusText(snippets.slice(-3).join(' ↔ '), 220);
    if (/(?:姓名|角色名|聊天对象|档案主角|当前角色)/.test(label)) return characterName;
    if (/(?:目标人物|对方|他人)/.test(label)) return '当前剧情中的关注对象';
    if (/(?:时间|日期|章节|场景|位置|地点)/.test(label)) {
        return localStatusFact(snippets, ['时间', '日期', '夜', '晨', '地点', '位置', '街', '港', '室', '医院'], '当前剧情尚未明确时间或地点。', seed);
    }
    if (/(?:身体|伤势|疼痛|呼吸|体力|行动能力|危险信号|异常|姿态)/.test(label)) {
        return localStatusFact(snippets, ['身体', '伤', '疼', '呼吸', '血', '疲', '倒下', '站立'], '当前剧情尚未确认明显身体异常。', seed);
    }
    if (/(?:关系|信任|好感|情绪|矛盾|互动)/.test(label)) {
        return localStatusFact(snippets, ['关系', '信任', '怀疑', '情绪', '靠近', '争执', '合作'], '当前剧情尚未确认新的关系变化。', seed);
    }
    if (/(?:剧情|事件|线索|任务|目标|风险|情报|悬念|摘要|进展|转折)/.test(label)) {
        return localStatusFact(snippets, ['剧情', '事件', '线索', '任务', '目标', '风险', '情报'], '当前剧情尚未确认新的推进。', seed);
    }
    return localStatusFact(snippets, [label], '当前剧情尚未提供可确认内容。', seed);
}

export function buildLocalStatusRecords(rule, contextSnapshot = {}) {
    const snippets = localStatusSnippets(contextSnapshot);
    const valuesFor = (fields, page) => fields.map((field, index) => localStatusValue(field, page, contextSnapshot, snippets, index));
    return {
        rule,
        shared: valuesFor(rule.sharedFields || [], null),
        pages: (rule.pages || []).map(page => ({ page, values: valuesFor(page.fields || rule.pageFields || [], page) })),
        raw: '',
        source: 'local-card-context',
    };
}

export function parseSummaryResponse(value, fallbackTitle, fallbackSummary, fallbackRoute = '未分类线') {
    const text = responseText(value).trim();
    const parsed = lastMatchingJson(text, item => item && (item.title || item.summary));
    if (parsed) {
        return normalizeSummaryRecord(parsed, { title: fallbackTitle, route: fallbackRoute, summary: fallbackSummary });
    }
    const cleaned = stripReasoningBlocks(text).replace(/```(?:json)?/gi, '').slice(-160).trim();
    return normalizeSummaryRecord({}, { title: fallbackTitle, route: fallbackRoute, summary: cleaned || fallbackSummary });
}

export function parseBatchSummaryResponse(value, requestedEntries) {
    const text = responseText(value);
    const parsed = lastMatchingJson(text, item => item && (Array.isArray(item.entries) || item.workIntro || item.homeTitle || item.homeSubtitle));
    const rows = Array.isArray(parsed?.entries) ? parsed.entries : [];
    let homeTitle = compactText(parsed?.homeTitle, 18);
    let homeSubtitle = compactText(parsed?.homeSubtitle, 30);
    let workIntro = compactText(parsed?.workIntro, 160);
    const requestedIndexes = new Set(requestedEntries.map(entry => entry.index));
    const entries = new Map();
    rows.forEach(row => {
        const index = Math.trunc(Number(row?.index)) - 1;
        const title = String(row?.title || '').trim();
        const route = String(row?.route || row?.routeLabel || row?.line || '').trim();
        const summary = String(row?.summary || '').trim();
        if (requestedIndexes.has(index) && title && route && summary) entries.set(index, normalizeSummaryRecord({ title, route, summary }));
    });

    const cleaned = stripReasoningBlocks(text).replace(/```(?:json)?/gi, '').trim();
    if (!homeTitle) homeTitle = cleaned.match(/(?:主页标题|作品标题)\s*[:：]\s*([^\n]+)/i)?.[1]?.trim() || '';
    if (!homeSubtitle) homeSubtitle = cleaned.match(/(?:小副标题|主页副标题)\s*[:：]\s*([^\n]+)/i)?.[1]?.trim() || '';
    if (!workIntro) {
        workIntro = cleaned.match(/\[(?:WorkIntro|作品简介)\s*\|\s*([^\]\n]+)\]/i)?.[1]?.trim()
            || cleaned.match(/(?:作品简介|总简介)\s*[:：]\s*([^\n]+)/i)?.[1]?.trim()
            || '';
    }
    workIntro = compactText(workIntro, 160);
    homeTitle = compactText(homeTitle, 18);
    homeSubtitle = compactText(homeSubtitle, 30);
    const addEntry = (rawIndex, rawTitle, rawRoute, rawSummary) => {
        const index = Math.trunc(Number(rawIndex)) - 1;
        const title = String(rawTitle || '').trim();
        const route = String(rawRoute || '').trim();
        const summary = String(rawSummary || '').trim();
        if (requestedIndexes.has(index) && title && route && summary && !entries.has(index)) entries.set(index, normalizeSummaryRecord({ title, route, summary }));
    };
    for (const match of cleaned.matchAll(/\[(?:Entry|Opening|条目)\s*\|\s*(\d+)\s*\|\s*([^|\]\n]+)\s*\|\s*([^|\]\n]+)\s*\|\s*([^\]\n]+)\]/gi)) {
        addEntry(match[1], match[2], match[3], match[4]);
    }
    for (const match of cleaned.matchAll(/(?:^|\n)\s*#?(\d+)\s*[.、)）-]\s*(?:标题\s*[:：]\s*)?([^\n]+)\n\s*(?:线路|路线|线路标签)\s*[:：]\s*([^\n]+)\n\s*(?:简介|摘要|线路简介)\s*[:：]\s*([^\n]+)/gi)) {
        addEntry(match[1], match[2], match[3], match[4]);
    }
    if (!entries.size && !workIntro && !homeTitle && !homeSubtitle) throw new Error('AI 返回了内容，但没有生成任何有效主页资料');
    return { entries, homeTitle, homeSubtitle, workIntro };
}

export function generationErrorMessage(error) {
    const message = String(error?.message || error || '');
    if (/(?:524|timeout|timed out|超时)/i.test(message)) {
        return `接口生成目录时发生超时或 524；插件已保留当前模型与预设，并把本次后台回复限制为 ${SUMMARY_RESPONSE_LENGTH}`;
    }
    if (/\b502\b/i.test(message)) {
        return '酒馆生成接口返回 502；502 不一定是超时，请先检查当前接口地址、反向代理和上游服务状态';
    }
    if (/no message generated|empty (?:message|response)|空正文|没有给出可用正文/i.test(message)) {
        return '模型没有返回可用正文；已读取的开场白会保留，失败项会明确标为待编辑，不会再截抄正文冒充简介';
    }
    return '';
}

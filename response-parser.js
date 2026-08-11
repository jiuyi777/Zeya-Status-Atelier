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
        required: ['workIntro', 'entries'],
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
    if (value.entries || value.workIntro || value.title || value.summary) {
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
    const parsed = lastMatchingJson(text, item => item && (Array.isArray(item.entries) || item.workIntro));
    const rows = Array.isArray(parsed?.entries) ? parsed.entries : [];
    let workIntro = compactText(parsed?.workIntro, 110);
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
    if (!workIntro) {
        workIntro = cleaned.match(/\[(?:WorkIntro|作品简介)\s*\|\s*([^\]\n]+)\]/i)?.[1]?.trim()
            || cleaned.match(/(?:作品简介|总简介)\s*[:：]\s*([^\n]+)/i)?.[1]?.trim()
            || '';
    }
    workIntro = compactText(workIntro, 110);
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
    if (!entries.size && !workIntro) throw new Error('AI 返回了内容，但没有生成任何有效简介');
    return { entries, workIntro };
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

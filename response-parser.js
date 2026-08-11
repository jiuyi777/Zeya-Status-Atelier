export const SUMMARY_RESPONSE_LENGTH = 4096;

const REASONING_LABELS = 'think|thinking|reasoning|analysis|plan|thought';

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
    const text = String(value || '').trim();
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
    return String(value || '').replace(fencePattern, ' ').replace(tagPattern, ' ').trim();
}

export function lastMatchingJson(value, predicate) {
    const cleaned = jsonObjectsFromResponse(stripReasoningBlocks(value)).findLast(predicate);
    if (cleaned) return cleaned;
    // Some gateways incorrectly wrap the final answer in a reasoning tag.
    return jsonObjectsFromResponse(value).findLast(predicate);
}

export function parseSummaryResponse(value, fallbackTitle, fallbackSummary) {
    const text = String(value || '').trim();
    const parsed = lastMatchingJson(text, item => item && (item.title || item.summary));
    if (parsed) {
        return {
            title: String(parsed.title || fallbackTitle).trim(),
            summary: String(parsed.summary || fallbackSummary).trim(),
        };
    }
    const cleaned = stripReasoningBlocks(text).replace(/```(?:json)?/gi, '').slice(-160).trim();
    return { title: fallbackTitle, summary: cleaned || fallbackSummary };
}

export function parseBatchSummaryResponse(value, requestedEntries) {
    const parsed = lastMatchingJson(value, item => item && (Array.isArray(item.entries) || item.workIntro));
    if (!parsed) throw new Error('模型有返回内容，但其中没有可识别的标题与简介 JSON');
    const rows = Array.isArray(parsed.entries) ? parsed.entries : [];
    const workIntro = String(parsed.workIntro || '').trim();
    const requestedIndexes = new Set(requestedEntries.map(entry => entry.index));
    const entries = new Map();
    rows.forEach(row => {
        const index = Math.trunc(Number(row?.index)) - 1;
        const title = String(row?.title || '').trim();
        const summary = String(row?.summary || '').trim();
        if (requestedIndexes.has(index) && title && summary) entries.set(index, { title, summary });
    });
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
    return '';
}

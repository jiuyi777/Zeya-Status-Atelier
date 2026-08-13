const TENSION_TERMS = [
    '吻', '拥抱', '抱住', '枪', '血', '死', '杀', '审讯', '秘密', '真相', '危险', '威胁',
    '颤', '哭', '笑', '怒', '怕', '痛', '爱', '恨', '贪', '欲', '逃', '抓', '抵', '逼',
    '雨', '夜', '火', '门', '锁', '心跳', '呼吸', '脉搏', '沉默', '盯', '看着', '贴着',
];

function exactParagraphs(raw) {
    return String(raw ?? '')
        .replace(/\r\n?/g, '\n')
        .split(/\n\s*\n+/)
        .map((text, index) => ({ text: text.trim(), index }))
        .filter(item => item.text
            && item.text !== '【主页】'
            && !/^```/.test(item.text)
            && !/^<!--/.test(item.text)
            && !/^\[(?:Meta|Title|Route|Summary|标题|线路|简介)\b/i.test(item.text));
}

function tensionScore(paragraph) {
    const text = paragraph.text;
    const length = [...text].length;
    let score = 0;
    if (length >= 45 && length <= 420) score += 12;
    else if (length >= 24 && length <= 620) score += 5;
    if (/[“”"「」『』]/.test(text)) score += 8;
    if (/[？！!?]/.test(text)) score += 5;
    if (/—{1,2}|……|\.\.\./.test(text)) score += 4;
    score += TENSION_TERMS.reduce((total, term) => total + (text.includes(term) ? 2 : 0), 0);
    if (/^\s*<(?:div|style|script|details|section|body|html)\b/i.test(text)) score -= 40;
    return score;
}

export function selectTensionExcerpts(raw, maxParagraphs = 2) {
    const candidates = exactParagraphs(raw);
    if (!candidates.length) return [];
    const count = Math.max(1, Math.min(3, Math.trunc(Number(maxParagraphs) || 2)));
    return candidates
        .map(item => ({ ...item, score: tensionScore(item) }))
        .sort((left, right) => right.score - left.score || left.index - right.index)
        .slice(0, count)
        .sort((left, right) => left.index - right.index)
        .map(item => item.text);
}

function headingText(value, fallback) {
    return String(value || fallback).replace(/[\r\n]+/g, ' ').trim();
}

export function buildOpeningOverview(sourceEntries, generatedEntries, { excerptsPerOpening = 2 } = {}) {
    const source = Array.isArray(sourceEntries) ? sourceEntries : [];
    const generated = Array.isArray(generatedEntries) ? generatedEntries : [];
    const sections = source.map((entry, index) => {
        const metadata = generated[index] || {};
        const title = headingText(metadata.title || entry?.title, `未命名开场 ${index + 1}`);
        const summary = headingText(metadata.summary || entry?.summary, '这条开场白尚未生成简介。');
        const excerpts = selectTensionExcerpts(entry?.raw, excerptsPerOpening);
        const quoted = excerpts.length
            ? excerpts.map(paragraph => paragraph.split('\n').map(line => `-# ${line}`).join('\n')).join('\n\n')
            : '-# （没有找到可摘录的正文段落）';
        return `> **开场白${index + 1}:${title}**\n> ${summary}\n${quoted}`;
    });
    return ['## :book: 开场白一览', ...sections].join('\n\n');
}

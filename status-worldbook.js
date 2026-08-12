export const STATUS_WORLDBOOK_ENTRY_ID = 'jiuyi-status-output-rule-v1';

function stableHash(value) {
    let hash = 2166136261;
    for (const character of String(value || '')) {
        hash ^= character.codePointAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36).slice(0, 7);
}

function safeBookPart(value) {
    return String(value || '角色')
        .replace(/\.[^.]+$/, '')
        .replace(/[\\/:*?"<>|\x00-\x1f]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 28) || '角色';
}

export function buildStatusWorldbookName(character = {}, storageKey = '') {
    const identity = character.avatar || character.name || storageKey || '角色';
    return `九一-状态栏-${safeBookPart(character.name || identity)}-${stableHash(identity)}`;
}

export function upsertStatusWorldbookData(data, generatedEntry) {
    const next = data && typeof data === 'object' ? structuredClone(data) : { entries: {} };
    if (!next.entries || typeof next.entries !== 'object' || Array.isArray(next.entries)) next.entries = {};
    const entries = Object.values(next.entries);
    const existing = entries.find(entry => entry?.automationId === STATUS_WORLDBOOK_ENTRY_ID)
        || entries.find(entry => /^九一\s*·.*AI动态输出规则$/.test(String(entry?.comment || '')));
    const used = new Set(entries.map(entry => Number(entry?.uid)).filter(Number.isInteger));
    let uid = Number(existing?.uid);
    if (!Number.isInteger(uid)) {
        uid = 0;
        while (used.has(uid)) uid += 1;
    }
    next.entries[uid] = {
        ...(existing || {}),
        ...structuredClone(generatedEntry || {}),
        uid,
        automationId: STATUS_WORLDBOOK_ENTRY_ID,
        constant: true,
        disable: false,
    };
    return { data: next, uid, created: !existing };
}

function clean(value) {
    return String(value ?? '').replace(/\s+/g, ' ').trim();
}

export function keepOnlyOpenGreetingCard(openedCard, cards) {
    if (!openedCard?.open) return;
    for (const card of cards || []) {
        if (card !== openedCard) card.open = false;
    }
}

export function greetingBindingSummary(worldline) {
    if (!worldline) {
        return {
            state: 'missing',
            text: '尚未识别到可自动匹配的世界书线路',
            detail: '可以继续使用当前目录；需要精确控制时再进入高级工坊设置线路。',
        };
    }
    const entries = Array.isArray(worldline.entries) ? worldline.entries : [];
    if (!entries.length) {
        return {
            state: 'empty',
            text: `已识别“${clean(worldline.name)}”，尚未匹配具体条目`,
            detail: '需要精确控制时，可在高级入口中手动选择世界书条目。',
        };
    }
    return {
        state: 'bound',
        text: `世界书已自动匹配（${entries.length} 项）`,
        detail: entries.map(item => `${clean(item.book)} · UID ${item.uid} · ${clean(item.title || `UID ${item.uid}`)}`).join('；'),
    };
}

export function mergeLocalGreetingEntries(entries, previousEntries) {
    const previous = Array.isArray(previousEntries) ? previousEntries : [];
    return (Array.isArray(entries) ? entries : []).map((entry, index) => {
        const saved = previous[index] || {};
        return {
            number: String(index + 1).padStart(2, '0'),
            title: clean(entry?.title || saved.title || `未命名开局 ${index + 1}`),
            route: clean(entry?.route || saved.route || ''),
            summary: clean(entry?.summary || saved.summary || ''),
            target: Math.max(1, Math.trunc(Number(entry?.target) || index + 2)),
            worldlineId: clean(saved.worldlineId || ''),
        };
    });
}

function clean(value) {
    return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

const REUSABLE_HOME_KEYS = [
    'ruleId', 'author', 'model', 'preset', 'theme', 'font', 'accent', 'background',
    'cardBackground', 'text', 'secondary', 'introBackground', 'buttonColor',
];

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

export function planOpeningHomeCharacterUpdate(firstMessage, alternateGreetings, marker = '【主页】') {
    const primary = String(firstMessage ?? '');
    const targetMarker = String(marker || '【主页】').trim() || '【主页】';
    const existing = Array.isArray(alternateGreetings) ? alternateGreetings.map(value => String(value ?? '')) : [];
    const alreadyPrepared = primary.trim() === targetMarker;
    const hasPrimaryCopy = existing.some(value => value.trim() === primary.trim());
    const shouldPreservePrimary = !alreadyPrepared && Boolean(primary.trim()) && !hasPrimaryCopy;
    return {
        marker: targetMarker,
        originalFirstMessage: primary,
        alternateGreetings: shouldPreservePrimary ? [primary, ...existing] : existing,
        movedPrimary: shouldPreservePrimary,
        alreadyPrepared,
    };
}

export function shouldReplaceCurrentChatGreeting(message, originalFirstMessage, marker = '【主页】') {
    if (!message || message.is_user || message.is_system) return false;
    const current = String(message.mes ?? '').trim();
    const original = String(originalFirstMessage ?? '').trim();
    const targetMarker = String(marker || '【主页】').trim();
    return current === targetMarker || (Boolean(original) && current === original);
}

export function freshOpeningHomeForCharacter(defaultHome, previousHome = {}) {
    const fresh = clone(defaultHome || {});
    for (const key of REUSABLE_HOME_KEYS) {
        if (previousHome?.[key] !== undefined) fresh[key] = clone(previousHome[key]);
    }
    fresh.title = '';
    fresh.subtitle = '';
    fresh.intro = '';
    fresh.worldlines = [];
    fresh.entries = [];
    return fresh;
}

export function switchOpeningHomeProfile({ profiles, previousKey, nextKey, currentHome, defaultHome }) {
    const nextProfiles = clone(profiles || {});
    if (previousKey) nextProfiles[previousKey] = clone(currentHome || defaultHome || {});
    const existing = nextKey && nextProfiles[nextKey];
    const home = existing
        ? clone(existing)
        : freshOpeningHomeForCharacter(defaultHome, currentHome);
    if (nextKey && !existing) nextProfiles[nextKey] = clone(home);
    return { profiles: nextProfiles, home };
}

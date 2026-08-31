function compact(value, limit) {
    const text = String(value ?? '').replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    return [...text].slice(0, limit).join('');
}

function bookEntries(book) {
    const source = book?.data?.entries ?? book?.entries ?? [];
    return Array.isArray(source) ? source : Object.values(source || {});
}

function currentChatId(context) {
    if (context?.chatId !== undefined && context?.chatId !== null && context.chatId !== '') {
        return String(context.chatId);
    }
    try {
        const value = context?.getCurrentChatId?.();
        return value === undefined || value === null ? '' : String(value);
    } catch {
        return '';
    }
}

export function resolveCurrentCharacterContext(context) {
    if (!context) return { context: null, characterId: null, character: null, state: 'unavailable' };

    const characters = Array.isArray(context.characters) ? context.characters : [];
    let characterId = context.characterId;
    let character = characterId !== undefined && characterId !== null ? characters[characterId] : null;

    if (!character) {
        const chatId = currentChatId(context);
        if (chatId) {
            const matchedId = characters.findIndex(item => String(item?.chat ?? '') === chatId);
            if (matchedId >= 0) {
                characterId = matchedId;
                character = characters[matchedId];
            }
        }
    }

    if (!character) {
        const currentName = String(context.name2 ?? '').trim();
        const matches = currentName
            ? characters.map((item, index) => ({ item, index })).filter(({ item }) => String(item?.name ?? '').trim() === currentName)
            : [];
        if (matches.length === 1) {
            characterId = matches[0].index;
            character = matches[0].item;
        }
    }

    if (!character) return { context, characterId: null, character: null, state: 'character-missing' };
    const normalizedContext = String(context.characterId) === String(characterId)
        ? context
        : { ...context, characterId };
    return { context: normalizedContext, characterId, character, state: 'character' };
}

export function describeCurrentCharacterContext(context) {
    const resolved = resolveCurrentCharacterContext(context);
    if (resolved.state === 'unavailable') return '酒馆聊天尚未载入完成，请稍候。';
    if (resolved.state !== 'character') return '当前没有定位到单人角色聊天，请先打开一个角色。';
    const rawName = resolved.character?.name || resolved.character?.data?.name || '当前角色';
    const characterName = [...String(rawName).trim()].slice(0, 80).join('') || '当前角色';
    return `已定位当前角色“${characterName}”。点击按钮后将读取角色卡、当前剧情与启用世界书。`;
}

export function selectCurrentSillyTavernContext(candidates = []) {
    const resolved = candidates.filter(Boolean).map(resolveCurrentCharacterContext);
    return resolved.find(item => item.state === 'character')?.context
        || resolved[0]?.context
        || null;
}

export function buildCharacterHomepageContext(character, worldbooks = [], { includeCreatorNotes = true } = {}) {
    const data = character?.data || character || {};
    const sections = [
        ['角色名称', data.name || character?.name, 120],
        ['角色设定', data.description, 1800],
        ['性格', data.personality, 900],
        ['故事场景', data.scenario, 1400],
        ['创作者说明', includeCreatorNotes ? data.creator_notes || data.creatorcomment : '', 900],
        ['主开场白', data.first_mes || character?.first_mes, 1400],
    ].map(([label, value, limit]) => {
        const text = compact(value, limit);
        return text ? `【${label}】\n${text}` : '';
    }).filter(Boolean);

    const lore = [];
    for (const book of Array.isArray(worldbooks) ? worldbooks : []) {
        const bookName = compact(book?.name || book?.data?.name || '当前角色卡世界书', 80);
        for (const entry of bookEntries(book)) {
            const content = compact(entry?.content, 700);
            if (!content) continue;
            const title = compact(entry?.comment || entry?.name || '背景条目', 100);
            lore.push(`【${bookName} · ${title}】\n${content}`);
            if (lore.join('\n').length >= 4200) break;
        }
        if (lore.join('\n').length >= 4200) break;
    }
    if (lore.length) sections.push(`【世界书背景】\n${lore.join('\n\n')}`);
    return compact(sections.join('\n\n'), 7200);
}

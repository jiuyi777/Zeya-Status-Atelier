function compact(value, limit) {
    const text = String(value ?? '').replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    return [...text].slice(0, limit).join('');
}

function bookEntries(book) {
    const source = book?.data?.entries ?? book?.entries ?? [];
    return Array.isArray(source) ? source : Object.values(source || {});
}

export function buildCharacterHomepageContext(character, worldbooks = []) {
    const data = character?.data || character || {};
    const sections = [
        ['角色名称', data.name || character?.name, 120],
        ['角色设定', data.description, 1800],
        ['性格', data.personality, 900],
        ['故事场景', data.scenario, 1400],
        ['创作者说明', data.creator_notes || data.creatorcomment, 900],
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

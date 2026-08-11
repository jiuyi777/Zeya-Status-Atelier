function clean(value) {
    return String(value ?? '').replace(/\s+/g, ' ').trim();
}

export function canonicalWorldbookRouteLabel(value) {
    const source = clean(value);
    if (!source) return '';
    const prefixed = source.match(/(?:路线|线路|route|line)\s*[:：=_-]\s*[【[(（]?([\p{Script=Han}A-Za-z0-9·_-]{1,12})/iu)?.[1];
    if (prefixed) return `${prefixed.replace(/(?:路线|线路|线)$/u, '')}线`;
    const match = source.match(/([\p{Script=Han}A-Za-z0-9·_-]{1,12}?)(?:路线|线路|线)(?=\s|[：:（(【[]|nsfw|NSFW|$)/u);
    return match?.[1] ? `${clean(match[1])}线` : '';
}

function routeEntryTitle(entry) {
    const keys = Array.isArray(entry?.keys) ? entry.keys : Array.isArray(entry?.key) ? entry.key : [];
    return clean(entry?.comment || entry?.name || keys.join('、'));
}

function routeEntryLabels(entry) {
    const keys = Array.isArray(entry?.keys) ? entry.keys : Array.isArray(entry?.key) ? entry.key : [];
    return [...new Set([entry?.comment, entry?.name, ...keys].map(canonicalWorldbookRouteLabel).filter(Boolean))];
}

export function extractWorldbookRouteCatalog(books) {
    const catalog = new Map();
    for (const book of Array.isArray(books) ? books : []) {
        const bookName = clean(book?.name || '当前角色卡世界书');
        const sourceEntries = book?.data?.entries ?? book?.entries ?? [];
        const entries = Array.isArray(sourceEntries) ? sourceEntries : Object.values(sourceEntries || {});
        for (const entry of entries) {
            for (const label of routeEntryLabels(entry)) {
                const record = catalog.get(label) || { label, variants: [] };
                const uid = entry?.uid ?? entry?.id ?? '';
                const title = routeEntryTitle(entry) || (uid !== '' ? `UID ${uid}` : label);
                const content = clean(entry?.content).slice(0, 900);
                const key = `${bookName}\u0000${uid}\u0000${title}`;
                if (!record.variants.some(variant => variant.key === key)) {
                    record.variants.push({ key, book: bookName, uid, title, content });
                }
                catalog.set(label, record);
            }
        }
    }
    return [...catalog.values()];
}

export function worldbookRouteLabels(catalog) {
    return [...new Set((Array.isArray(catalog) ? catalog : []).map(item => canonicalWorldbookRouteLabel(item?.label)).filter(Boolean))];
}

export function routeCatalogPrompt(catalog) {
    const records = Array.isArray(catalog) ? catalog : [];
    if (!records.length) return '当前角色卡世界书中没有识别到线路条目；route 固定填写“未分类线”，不要自创线路名。';
    const evidenceLimit = Math.max(90, Math.min(420, Math.floor(5200 / Math.max(1, records.length * 2))));
    const lines = records.map(record => {
        const variants = record.variants.slice(0, 2).map(variant => {
            const evidence = variant.content ? `：${variant.content.slice(0, evidenceLimit)}` : '';
            return `- ${variant.title}${evidence}`;
        }).join('\n');
        return `【${record.label}】\n${variants}`;
    });
    return `以下线路来自当前角色卡绑定的世界书条目。route 必须逐字选择其中一个方括号内的线路名；同一线路可以对应多条开场，禁止自创、改写或为了避免重复而换名。\n${lines.join('\n')}`;
}

export function constrainRouteToCatalog(value, catalog) {
    const labels = worldbookRouteLabels(catalog);
    if (!labels.length) return '未分类线';
    const normalized = canonicalWorldbookRouteLabel(value) || clean(value);
    return labels.find(label => label === normalized) || labels.find(label => normalized.includes(label) || label.includes(normalized)) || '';
}

function stableAutoWorldlineId(label) {
    let hash = 2166136261;
    for (const character of String(label || '')) hash = Math.imul(hash ^ character.codePointAt(0), 16777619);
    return `auto-route-${(hash >>> 0).toString(36)}`;
}

export function syncRouteCatalogWorldlines(worldlines, catalog) {
    const lines = Array.isArray(worldlines) ? worldlines : [];
    const ids = {};
    for (const record of Array.isArray(catalog) ? catalog : []) {
        const bindings = record.variants.map(variant => ({
            book: String(variant.book || '').trim(),
            uid: Math.max(0, Math.trunc(Number(variant.uid) || 0)),
            title: String(variant.title || `UID ${variant.uid}`).trim(),
        })).filter(binding => binding.book);
        let worldline = lines.find(line => String(line.name || '').trim() === record.label);
        if (!worldline) {
            worldline = lines.find(line => bindings.some(binding => (line.entries || []).some(item => item.book === binding.book && Number(item.uid) === binding.uid)));
        }
        if (!worldline) {
            worldline = lines.find(line => /^世界线\s*\d+$/u.test(String(line.name || '').trim()) && !(line.entries || []).length);
        }
        if (!worldline) {
            worldline = { id: stableAutoWorldlineId(record.label), name: record.label, description: '', entries: [] };
            lines.push(worldline);
        } else if (/^世界线\s*\d+$/u.test(String(worldline.name || '').trim())) {
            worldline.name = record.label;
        }
        worldline.entries ??= [];
        for (const binding of bindings) {
            if (!worldline.entries.some(item => item.book === binding.book && Number(item.uid) === binding.uid)) worldline.entries.push(binding);
        }
        ids[record.label] = worldline.id;
    }
    return ids;
}

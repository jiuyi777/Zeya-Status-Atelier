export const ENTRY_DIALOG_PAGE_SIZE = 100;

function clean(value) {
    return String(value ?? '').replace(/\s+/g, ' ').trim();
}

export function entryDialogBindingKey(book, uid) {
    return `${clean(book)}\u0000${clean(uid)}`;
}

export function entryDialogEntryTitle(entry) {
    const keys = Array.isArray(entry?.keys) ? entry.keys : Array.isArray(entry?.key) ? entry.key : [];
    return clean(entry?.comment || entry?.name || keys.join(', ') || `UID ${entry?.uid ?? ''}`);
}

export function mountAndShowEntryDialog(dialog, body = globalThis.document?.body) {
    if (!dialog) throw new Error('找不到 UID 编辑器');
    if (!body) throw new Error('找不到页面主体，无法打开 UID 编辑器');
    if (dialog.parentElement !== body) body.append(dialog);
    if (!dialog.open) dialog.showModal();
    return dialog;
}

export function paginateEntryDialogEntries(entries, {
    book = '',
    selectedKeys = [],
    query = '',
    page = 0,
    pageSize = ENTRY_DIALOG_PAGE_SIZE,
} = {}) {
    const selected = selectedKeys instanceof Set ? selectedKeys : new Set(selectedKeys);
    const normalizedQuery = clean(query).toLocaleLowerCase();
    const safePageSize = Math.max(1, Math.min(ENTRY_DIALOG_PAGE_SIZE, Math.trunc(Number(pageSize)) || ENTRY_DIALOG_PAGE_SIZE));
    const records = (Array.isArray(entries) ? entries : []).map((entry, sourceIndex) => {
        const uid = entry?.uid ?? entry?.id ?? '';
        const title = entryDialogEntryTitle({ ...entry, uid });
        return {
            entry,
            uid,
            title,
            selected: selected.has(entryDialogBindingKey(book, uid)),
            sourceIndex,
        };
    }).filter(record => {
        if (!normalizedQuery) return true;
        return `uid ${record.uid}`.toLocaleLowerCase().includes(normalizedQuery)
            || clean(record.uid).toLocaleLowerCase().includes(normalizedQuery)
            || record.title.toLocaleLowerCase().includes(normalizedQuery);
    }).sort((left, right) => {
        if (left.selected !== right.selected) return left.selected ? -1 : 1;
        const uidOrder = Number(left.uid) - Number(right.uid);
        return Number.isFinite(uidOrder) && uidOrder !== 0 ? uidOrder : left.sourceIndex - right.sourceIndex;
    });
    const total = records.length;
    const pageCount = Math.max(1, Math.ceil(total / safePageSize));
    const safePage = Math.max(0, Math.min(pageCount - 1, Math.trunc(Number(page)) || 0));
    const start = safePage * safePageSize;
    return {
        items: records.slice(start, start + safePageSize),
        total,
        page: safePage,
        pageCount,
        pageSize: safePageSize,
        start: total ? start + 1 : 0,
        end: Math.min(start + safePageSize, total),
    };
}

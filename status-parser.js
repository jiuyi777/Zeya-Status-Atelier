const DEFAULT_TAG = 'status_bar';

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function unescapeToken(value) {
    return String(value)
        .replace(/\\([|\]\\])/g, '$1')
        .trim();
}

export function splitEscaped(value, separator = '|') {
    const result = [];
    let current = '';
    let escaped = false;

    for (const character of String(value)) {
        if (escaped) {
            current += `\\${character}`;
            escaped = false;
            continue;
        }
        if (character === '\\') {
            escaped = true;
            continue;
        }
        if (character === separator) {
            result.push(unescapeToken(current));
            current = '';
            continue;
        }
        current += character;
    }

    if (escaped) {
        current += '\\';
    }
    result.push(unescapeToken(current));
    return result;
}

export function extractStatusBlock(message, tagName = DEFAULT_TAG) {
    const source = String(message ?? '');
    const safeTag = escapeRegex(tagName || DEFAULT_TAG);
    const matcher = new RegExp(`<${safeTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${safeTag}>`, 'gi');
    let match;
    let selected = null;

    while ((match = matcher.exec(source)) !== null) {
        selected = match;
    }
    if (!selected) {
        return null;
    }

    let start = selected.index;
    let end = selected.index + selected[0].length;
    const before = source.slice(0, start);
    const after = source.slice(end);
    const fenceBefore = before.match(/```(?:html)?\s*$/i);
    const fenceAfter = after.match(/^\s*```/);

    if (fenceBefore && fenceAfter) {
        start -= fenceBefore[0].length;
        end += fenceAfter[0].length;
    }

    return {
        raw: selected[0],
        body: selected[1].trim(),
        start,
        end,
        messageWithoutStatus: `${source.slice(0, start)}${source.slice(end)}`.trimEnd(),
    };
}

export function parseStatusSections(statusBody) {
    const source = String(statusBody ?? '');
    const sections = [];
    let index = 0;

    while (index < source.length) {
        if (source[index] !== '[') {
            index += 1;
            continue;
        }

        let cursor = index + 1;
        let escaped = false;
        let content = '';
        let closed = false;

        while (cursor < source.length) {
            const character = source[cursor];
            if (escaped) {
                content += `\\${character}`;
                escaped = false;
            } else if (character === '\\') {
                escaped = true;
            } else if (character === ']') {
                closed = true;
                break;
            } else {
                content += character;
            }
            cursor += 1;
        }

        if (!closed) {
            break;
        }

        const tokens = splitEscaped(content);
        const key = tokens.shift()?.trim();
        if (key && tokens.length) {
            sections.push({ key, values: tokens });
        }
        index = cursor + 1;
    }

    return sections;
}

export function parseSchema(schemaText) {
    return String(schemaText ?? '')
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .map(line => {
            const tokens = splitEscaped(line);
            const key = tokens.shift()?.trim();
            return key ? { key, labels: tokens.filter(Boolean) } : null;
        })
        .filter(Boolean);
}

export function parseAliases(aliasText) {
    const aliases = new Map();
    for (const line of String(aliasText ?? '').split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
            continue;
        }
        const divider = trimmed.indexOf('=');
        if (divider < 1) {
            continue;
        }
        const key = trimmed.slice(0, divider).trim().toLowerCase();
        const label = trimmed.slice(divider + 1).trim();
        if (key && label) {
            aliases.set(key, label);
        }
    }
    return aliases;
}

export function schemaToStatusExample(schemaText) {
    const lines = parseSchema(schemaText).map(section => {
        const values = section.labels.length ? section.labels.map(label => `{{${label}}}`) : ['{{内容}}'];
        return `[${section.key}|${values.join('|')}]`;
    });
    return `<status_bar>\n${lines.join('\n')}\n</status_bar>`;
}

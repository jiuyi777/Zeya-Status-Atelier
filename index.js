import {
    extractStatusBlock,
    parseAliases,
    parseSchema,
    parseStatusSections,
    schemaToStatusExample,
} from './status-parser.js';

const MODULE_NAME = 'status_atelier';
const PROMPT_KEY = 'status_atelier_schema';
const LONG_SECTION_KEYS = new Set(['thoughts', 'innerthoughts', 'diary', 'review']);

const PALETTES = Object.freeze({
    aqua: { accent: '#6ec7d9', surface: '#102631', text: '#e9f8fb', muted: '#9dbdc5' },
    night: { accent: '#6aa9e8', surface: '#0b1830', text: '#edf5ff', muted: '#9db7d2' },
    cream: { accent: '#b98256', surface: '#f6edda', text: '#403127', muted: '#816c5b' },
});

const PRESETS = Object.freeze({
    universal: {
        layout: 'grid',
        palette: 'aqua',
        title: '角色状态',
        subtitle: 'REAL-TIME STATUS',
        schema: [
            'DateTime|日期|时间',
            'Location|当前位置',
            'Weather|天气图标|天气|温度',
            'Affection|好感等级|好感数值|本次变化',
            'Thoughts|内心想法',
        ].join('\n'),
        aliases: [
            'DateTime=日期与时间',
            'Location=所在位置',
            'Weather=天气',
            'Affection=好感度',
            'Thoughts=内心想法',
        ].join('\n'),
    },
    aqua: {
        layout: 'grid',
        palette: 'aqua',
        title: '水色状态栏',
        subtitle: 'AQUA STATUS',
        schema: [
            'DateTime|日期|时间',
            'Weather|天气图标|天气描述|温度',
            'Affection|好感等级|好感数值|好感变化',
            'Thoughts|内心想法',
        ].join('\n'),
        aliases: [
            'DateTime=日期与时间',
            'Weather=天气',
            'Affection=好感度',
            'Thoughts=INNER VOICE',
        ].join('\n'),
    },
    ticket: {
        layout: 'stack',
        palette: 'night',
        title: '状态记录',
        subtitle: 'STATUS REPORT',
        schema: [
            'DateTime|日期|时间',
            'Location|当前位置',
            'Affection|好感数值|好感等级|好感描述',
            'InnerThoughts|想法一|想法二|想法三',
        ].join('\n'),
        aliases: [
            'DateTime=日期与时间',
            'Location=当前位置',
            'Affection=好感度',
            'InnerThoughts=内心想法',
        ].join('\n'),
    },
});

const DEFAULT_SETTINGS = Object.freeze({
    enabled: true,
    promptEnabled: false,
    preset: 'universal',
    layout: 'grid',
    palette: 'aqua',
    title: '角色状态',
    subtitle: 'REAL-TIME STATUS',
    schema: PRESETS.universal.schema,
    aliases: PRESETS.universal.aliases,
    accent: PALETTES.aqua.accent,
    surface: PALETTES.aqua.surface,
    text: PALETTES.aqua.text,
    muted: PALETTES.aqua.muted,
    maxWidth: 560,
    fontSize: 13,
    radius: 18,
    density: 14,
    collapseLong: false,
    showOpening: true,
    openingNotes: {},
});

const SECTION_META = Object.freeze({
    datetime: { title: '日期与时间', icon: 'fa-regular fa-clock' },
    location: { title: '当前位置', icon: 'fa-solid fa-location-dot' },
    weather: { title: '天气', icon: 'fa-solid fa-cloud-sun' },
    affection: { title: '好感度', icon: 'fa-regular fa-heart' },
    thoughts: { title: '内心想法', icon: 'fa-regular fa-comment-dots' },
    innerthoughts: { title: '内心想法', icon: 'fa-regular fa-comment-dots' },
    diary: { title: '日记', icon: 'fa-solid fa-book-open' },
    review: { title: '章节回顾', icon: 'fa-solid fa-feather-pointed' },
});

let settingsRoot;
let modal;
let chatObserver;
let renderTimer;
let settingsSaveTimer;
let isRestoring = false;

function context() {
    return globalThis.SillyTavern?.getContext?.();
}

function clone(value) {
    return globalThis.structuredClone ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function clamp(value, minimum, maximum, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(maximum, Math.max(minimum, number)) : fallback;
}

function validColor(value, fallback) {
    return /^#[0-9a-f]{6}$/i.test(String(value)) ? String(value) : fallback;
}

function notify(level, message) {
    if (globalThis.toastr?.[level]) {
        globalThis.toastr[level](message);
        return;
    }
    console[level === 'error' ? 'error' : 'log'](`[状态工坊] ${message}`);
}

function settings() {
    const ctx = context();
    if (!ctx?.extensionSettings) {
        return clone(DEFAULT_SETTINGS);
    }

    ctx.extensionSettings[MODULE_NAME] ??= {};
    const stored = ctx.extensionSettings[MODULE_NAME];
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        if (!Object.hasOwn(stored, key)) {
            stored[key] = clone(value);
        }
    }
    if (!stored.openingNotes || typeof stored.openingNotes !== 'object' || Array.isArray(stored.openingNotes)) {
        stored.openingNotes = {};
    }
    return stored;
}

function saveSettingsSoon() {
    clearTimeout(settingsSaveTimer);
    settingsSaveTimer = setTimeout(() => context()?.saveSettingsDebounced?.(), 120);
}

function setText(element, value) {
    element.textContent = String(value ?? '');
    return element;
}

function makeElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) {
        element.className = className;
    }
    if (text !== undefined) {
        setText(element, text);
    }
    return element;
}

function stableHash(value) {
    let hash = 2166136261;
    for (const character of String(value)) {
        hash ^= character.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
}

function buildPrompt(schemaText) {
    const example = schemaToStatusExample(schemaText);
    if (!parseSchema(schemaText).length) {
        return '';
    }
    return [
        '[状态工坊输出规则]',
        '每次角色回复的正文结束后，追加且只追加一个状态栏区块。',
        '必须严格保持下面的字段顺序和竖线分隔；根据当前剧情填写所有双花括号字段。',
        '状态栏不要放进 Markdown 代码块，不要在标签内部输出 HTML。',
        example,
    ].join('\n');
}

function updatePrompt() {
    const ctx = context();
    if (!ctx?.setExtensionPrompt) {
        return;
    }
    const stored = settings();
    const value = stored.enabled && stored.promptEnabled ? buildPrompt(stored.schema) : '';
    ctx.setExtensionPrompt(PROMPT_KEY, value, 1, 0, false, 0);
}

function normalizedSectionKey(key) {
    return String(key ?? '').replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function schemaMap(schemaText) {
    return new Map(parseSchema(schemaText).map(item => [normalizedSectionKey(item.key), item]));
}

function applyPanelStyle(panel, stored) {
    panel.dataset.layout = ['grid', 'stack', 'compact'].includes(stored.layout) ? stored.layout : 'grid';
    panel.style.setProperty('--sa-accent', validColor(stored.accent, DEFAULT_SETTINGS.accent));
    panel.style.setProperty('--sa-surface', validColor(stored.surface, DEFAULT_SETTINGS.surface));
    panel.style.setProperty('--sa-text', validColor(stored.text, DEFAULT_SETTINGS.text));
    panel.style.setProperty('--sa-muted', validColor(stored.muted, DEFAULT_SETTINGS.muted));
    panel.style.setProperty('--sa-max-width', `${clamp(stored.maxWidth, 260, 900, 560)}px`);
    panel.style.setProperty('--sa-font-size', `${clamp(stored.fontSize, 11, 20, 13)}px`);
    panel.style.setProperty('--sa-radius', `${clamp(stored.radius, 0, 36, 18)}px`);
    panel.style.setProperty('--sa-density', `${clamp(stored.density, 6, 24, 14)}px`);
}

function findAffectionPercentage(values) {
    for (const value of values) {
        const match = String(value).match(/(?:^|\s)(\d{1,3})(?:\s*\/\s*100|\s*%|\s|$)/);
        if (match) {
            const number = Number(match[1]);
            if (number >= 0 && number <= 100) {
                return number;
            }
        }
    }
    return null;
}

function buildFields(section, labels, sectionKey) {
    const fields = makeElement('div', 'status-atelier-fields');
    section.values.forEach((value, index) => {
        const row = makeElement('div', 'status-atelier-field');
        const label = labels[index] || `项目 ${index + 1}`;
        row.append(
            makeElement('span', 'status-atelier-field-label', label),
            makeElement('span', 'status-atelier-field-value', value),
        );
        fields.append(row);
    });

    if (sectionKey === 'affection') {
        const percentage = findAffectionPercentage(section.values);
        if (percentage !== null) {
            const meter = makeElement('div', 'status-atelier-meter');
            meter.setAttribute('role', 'progressbar');
            meter.setAttribute('aria-valuemin', '0');
            meter.setAttribute('aria-valuemax', '100');
            meter.setAttribute('aria-valuenow', String(percentage));
            const fill = document.createElement('span');
            fill.style.setProperty('--sa-meter', `${percentage}%`);
            meter.append(fill);
            fields.append(meter);
        }
    }
    return fields;
}

function buildSection(section, stored, definitions, aliases) {
    const key = normalizedSectionKey(section.key);
    const meta = SECTION_META[key] || { title: section.key, icon: 'fa-solid fa-diamond' };
    const labels = definitions.get(key)?.labels || [];
    const title = aliases.get(key) || meta.title;
    const collapsible = stored.collapseLong && LONG_SECTION_KEYS.has(key);
    const sectionElement = makeElement(collapsible ? 'details' : 'section', 'status-atelier-section');
    sectionElement.dataset.section = key || 'unknown';

    const heading = makeElement(collapsible ? 'summary' : 'h4', 'status-atelier-section-heading');
    const icon = makeElement('i', `status-atelier-section-icon ${meta.icon}`);
    icon.setAttribute('aria-hidden', 'true');
    heading.append(icon, makeElement('span', '', title));

    const fields = buildFields(section, labels, key);
    sectionElement.append(heading, fields);
    return sectionElement;
}

function characterStorageKey(ctx = context()) {
    if (!ctx || ctx.groupId || ctx.characterId === undefined || ctx.characterId === null) {
        return '';
    }
    const character = ctx.characters?.[ctx.characterId];
    if (!character) {
        return '';
    }
    return `character:${character.avatar || character.name || ctx.characterId}`;
}

function stripForSummary(value) {
    const withoutStatus = extractStatusBlock(value)?.messageWithoutStatus ?? String(value ?? '');
    return withoutStatus
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/[#*_~`>|\[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function greetingData() {
    const ctx = context();
    const key = characterStorageKey(ctx);
    if (!ctx || !key || !ctx.chat?.length) {
        return { key, entries: [], current: 0 };
    }

    const first = ctx.chat[0];
    const rawEntries = Array.isArray(first?.swipes) && first.swipes.length ? first.swipes : [first?.mes].filter(Boolean);
    const current = Math.max(0, Math.min(rawEntries.length - 1, Number(first?.swipe_id ?? 0)));
    const notes = settings().openingNotes[key] || {};
    const entries = rawEntries.map((raw, index) => {
        const saved = notes[index] || {};
        const preview = stripForSummary(raw);
        return {
            index,
            raw,
            title: saved.title || `开场白 ${index + 1}`,
            summary: saved.summary || (preview.length > 92 ? `${preview.slice(0, 92)}…` : preview),
            preview: preview.length > 180 ? `${preview.slice(0, 180)}…` : preview,
        };
    });
    return { key, entries, current };
}

function buildOpeningStrip() {
    const data = greetingData();
    const current = data.entries[data.current];
    if (!current) {
        return null;
    }

    const strip = makeElement('div', 'status-atelier-opening-strip');
    strip.append(
        makeElement('span', 'status-atelier-opening-title', current.title),
        makeElement('span', 'status-atelier-opening-summary', current.summary || '还没有填写简介'),
    );
    const button = makeElement('button', 'status-atelier-opening-button', '↗');
    button.type = 'button';
    button.title = '查看、切换或跳回开场白';
    button.setAttribute('aria-label', button.title);
    button.addEventListener('click', openGreetingModal);
    strip.append(button);
    return strip;
}

function buildStatusPanel(sections, { includeOpening = false } = {}) {
    const stored = settings();
    const panel = makeElement('aside', 'status-atelier-panel');
    panel.setAttribute('aria-label', stored.title || '角色状态');
    applyPanelStyle(panel, stored);

    const shell = makeElement('div', 'status-atelier-shell');
    const header = makeElement('header', 'status-atelier-header');
    header.append(
        makeElement('h3', 'status-atelier-title', stored.title || '角色状态'),
        makeElement('span', 'status-atelier-subtitle', stored.subtitle || ''),
    );
    shell.append(header);

    const definitions = schemaMap(stored.schema);
    const aliases = parseAliases(stored.aliases);
    const grid = makeElement('div', 'status-atelier-grid');
    sections.forEach(section => grid.append(buildSection(section, stored, definitions, aliases)));
    shell.append(grid);

    if (includeOpening && stored.showOpening) {
        const opening = buildOpeningStrip();
        if (opening) {
            shell.append(opening);
        }
    }

    panel.append(shell);
    return panel;
}

function latestAssistantMessageId(ctx) {
    for (let index = (ctx?.chat?.length ?? 0) - 1; index >= 0; index -= 1) {
        const message = ctx.chat[index];
        if (message && !message.is_user && !message.is_system) {
            return index;
        }
    }
    return -1;
}

function restoreMessage(messageId, message) {
    const ctx = context();
    const messageElement = document.querySelector(`#chat .mes[mesid="${messageId}"]`);
    const textElement = messageElement?.querySelector('.mes_text');
    if (!ctx?.updateMessageBlock || !textElement?.dataset.statusAtelierHash) {
        return;
    }
    delete textElement.dataset.statusAtelierHash;
    ctx.updateMessageBlock(messageId, message);
}

function renderMessage(messageId, includeOpening) {
    const ctx = context();
    const message = ctx?.chat?.[messageId];
    const messageElement = document.querySelector(`#chat .mes[mesid="${messageId}"]`);
    const textElement = messageElement?.querySelector('.mes_text');
    if (!message || !textElement || message.is_user || message.is_system) {
        return;
    }

    const extracted = extractStatusBlock(message.mes);
    const sections = extracted ? parseStatusSections(extracted.body) : [];
    if (!extracted || !sections.length) {
        restoreMessage(messageId, message);
        return;
    }

    const stored = settings();
    const opening = includeOpening ? greetingData() : null;
    const signature = stableHash(JSON.stringify({
        raw: extracted.raw,
        title: stored.title,
        subtitle: stored.subtitle,
        schema: stored.schema,
        aliases: stored.aliases,
        layout: stored.layout,
        colors: [stored.accent, stored.surface, stored.text, stored.muted],
        sizes: [stored.maxWidth, stored.fontSize, stored.radius, stored.density],
        collapseLong: stored.collapseLong,
        showOpening: stored.showOpening,
        opening,
    }));

    if (textElement.dataset.statusAtelierHash === signature && textElement.querySelector(':scope > .status-atelier-panel')) {
        return;
    }

    const displayMessage = {
        ...message,
        mes: extracted.messageWithoutStatus,
        extra: { ...(message.extra || {}), display_text: extracted.messageWithoutStatus },
    };
    ctx.updateMessageBlock?.(messageId, displayMessage);
    const refreshedText = document.querySelector(`#chat .mes[mesid="${messageId}"] .mes_text`);
    if (!refreshedText) {
        return;
    }
    refreshedText.append(buildStatusPanel(sections, { includeOpening }));
    refreshedText.dataset.statusAtelierHash = signature;
}

function renderAll() {
    clearTimeout(renderTimer);
    const ctx = context();
    if (!ctx?.chat) {
        return;
    }
    updatePrompt();

    if (!settings().enabled) {
        isRestoring = true;
        ctx.chat.forEach((message, index) => restoreMessage(index, message));
        queueMicrotask(() => { isRestoring = false; });
        return;
    }

    const latest = latestAssistantMessageId(ctx);
    ctx.chat.forEach((_, index) => renderMessage(index, index === latest));
}

function scheduleRender(delay = 35) {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderAll, delay);
}

function sampleValue(label, index) {
    const value = String(label || '').toLowerCase();
    if (value.includes('日期')) return '9月14日 星期六';
    if (value.includes('时间')) return '21:40';
    if (value.includes('图标')) return '🌧️';
    if (value.includes('温度')) return '22°C';
    if (value.includes('天气')) return '细雨微凉';
    if (value.includes('位置') || value.includes('地点')) return '旧城区 · 临河书店';
    if (value.includes('等级')) return '牵绊';
    if (value.includes('数值')) return '55 / 100';
    if (value.includes('变化')) return '+3';
    if (value.includes('想法')) return '她刚才那句话，似乎比雨声更难忘。';
    return `示例内容 ${index + 1}`;
}

function updatePreview() {
    const preview = settingsRoot?.querySelector('#status-atelier-preview');
    if (!preview) {
        return;
    }
    const sections = parseSchema(settings().schema).map(section => ({
        key: section.key,
        values: (section.labels.length ? section.labels : ['内容']).map(sampleValue),
    }));
    preview.replaceChildren(buildStatusPanel(sections.length ? sections : [{ key: 'Status', values: ['请填写字段格式'] }]));
}

function applyPalette(name) {
    const stored = settings();
    const palette = PALETTES[name];
    stored.palette = palette ? name : 'custom';
    if (palette) {
        Object.assign(stored, palette);
    }
}

function applyPreset(name) {
    const preset = PRESETS[name];
    if (!preset) {
        settings().preset = 'custom';
        return;
    }
    const stored = settings();
    Object.assign(stored, clone(preset), { preset: name });
    applyPalette(preset.palette);
    loadSettingsUI();
    saveSettingsSoon();
    scheduleRender();
}

function fieldValue(id) {
    return settingsRoot?.querySelector(`#${id}`);
}

function loadSettingsUI() {
    if (!settingsRoot) {
        return;
    }
    const stored = settings();
    const values = {
        'status-atelier-enabled': stored.enabled,
        'status-atelier-prompt-enabled': stored.promptEnabled,
        'status-atelier-preset': stored.preset,
        'status-atelier-layout': stored.layout,
        'status-atelier-palette': stored.palette,
        'status-atelier-collapse-long': String(Boolean(stored.collapseLong)),
        'status-atelier-title': stored.title,
        'status-atelier-subtitle': stored.subtitle,
        'status-atelier-schema': stored.schema,
        'status-atelier-aliases': stored.aliases,
        'status-atelier-accent': stored.accent,
        'status-atelier-surface': stored.surface,
        'status-atelier-text': stored.text,
        'status-atelier-muted': stored.muted,
        'status-atelier-max-width': stored.maxWidth,
        'status-atelier-font-size': stored.fontSize,
        'status-atelier-radius': stored.radius,
        'status-atelier-density': stored.density,
        'status-atelier-show-opening': stored.showOpening,
    };
    for (const [id, value] of Object.entries(values)) {
        const element = fieldValue(id);
        if (!element) continue;
        if (element.type === 'checkbox') element.checked = Boolean(value);
        else element.value = String(value ?? '');
    }
    updatePreview();
}

function readSettingsUI(changedElement) {
    const stored = settings();
    stored.enabled = fieldValue('status-atelier-enabled').checked;
    stored.promptEnabled = fieldValue('status-atelier-prompt-enabled').checked;
    stored.layout = fieldValue('status-atelier-layout').value;
    stored.collapseLong = fieldValue('status-atelier-collapse-long').value === 'true';
    stored.title = fieldValue('status-atelier-title').value.trim();
    stored.subtitle = fieldValue('status-atelier-subtitle').value.trim();
    stored.schema = fieldValue('status-atelier-schema').value.trim();
    stored.aliases = fieldValue('status-atelier-aliases').value.trim();
    stored.accent = validColor(fieldValue('status-atelier-accent').value, stored.accent);
    stored.surface = validColor(fieldValue('status-atelier-surface').value, stored.surface);
    stored.text = validColor(fieldValue('status-atelier-text').value, stored.text);
    stored.muted = validColor(fieldValue('status-atelier-muted').value, stored.muted);
    stored.maxWidth = clamp(fieldValue('status-atelier-max-width').value, 260, 900, 560);
    stored.fontSize = clamp(fieldValue('status-atelier-font-size').value, 11, 20, 13);
    stored.radius = clamp(fieldValue('status-atelier-radius').value, 0, 36, 18);
    stored.density = clamp(fieldValue('status-atelier-density').value, 6, 24, 14);
    stored.showOpening = fieldValue('status-atelier-show-opening').checked;

    if (changedElement?.matches('input[type="color"]')) {
        stored.palette = 'custom';
        fieldValue('status-atelier-palette').value = 'custom';
    }
    if (changedElement && !changedElement.matches('#status-atelier-enabled, #status-atelier-prompt-enabled, #status-atelier-show-opening, #status-atelier-palette')) {
        stored.preset = 'custom';
        fieldValue('status-atelier-preset').value = 'custom';
    }
    saveSettingsSoon();
    updatePrompt();
    updatePreview();
    scheduleRender();
}

function latestDetectedSchema() {
    const ctx = context();
    for (let index = (ctx?.chat?.length ?? 0) - 1; index >= 0; index -= 1) {
        const extracted = extractStatusBlock(ctx.chat[index]?.mes);
        const sections = extracted ? parseStatusSections(extracted.body) : [];
        if (sections.length) {
            const existing = schemaMap(settings().schema);
            return sections.map(section => {
                const labels = existing.get(normalizedSectionKey(section.key))?.labels || [];
                const padded = section.values.map((_, fieldIndex) => labels[fieldIndex] || `项目${fieldIndex + 1}`);
                return `${section.key}|${padded.join('|')}`;
            }).join('\n');
        }
    }
    return '';
}

async function copyText(value) {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.append(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
}

function downloadSettings() {
    const exportData = clone(settings());
    delete exportData.openingNotes;
    const blob = new Blob([JSON.stringify({ format: 'status-atelier-profile', version: 1, settings: exportData }, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'status-atelier-profile.json';
    document.body.append(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
}

async function importSettings(file) {
    const data = JSON.parse(await file.text());
    if (data?.format !== 'status-atelier-profile' || !data.settings || typeof data.settings !== 'object') {
        throw new Error('这不是状态工坊配置文件');
    }
    const notes = settings().openingNotes;
    Object.assign(settings(), clone(DEFAULT_SETTINGS), data.settings, { openingNotes: notes, preset: 'custom' });
    loadSettingsUI();
    updatePrompt();
    saveSettingsSoon();
    scheduleRender();
}

function buildModal() {
    modal = document.createElement('div');
    modal.id = 'status-atelier-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
        <div class="status-atelier-modal-backdrop" data-status-atelier-close></div>
        <section class="status-atelier-dialog" role="dialog" aria-modal="true" aria-labelledby="status-atelier-dialog-title">
            <header class="status-atelier-dialog-header">
                <h3 id="status-atelier-dialog-title">开场白导航与简介</h3>
                <button type="button" class="menu_button" data-status-atelier-close aria-label="关闭">×</button>
            </header>
            <div class="status-atelier-dialog-body">
                <p class="status-atelier-dialog-note">标题和简介只影响本插件的导航显示，不会写进角色卡。切换会调用酒馆原生的开场白 swipe；在长对话中切换，也会改变当前聊天的第 1 条消息。</p>
                <div class="status-atelier-greeting-list"></div>
            </div>
            <footer class="status-atelier-dialog-footer">
                <button type="button" class="menu_button" id="status-atelier-jump-first">只定位到聊天第 1 条</button>
                <button type="button" class="menu_button" data-status-atelier-close>完成</button>
            </footer>
        </section>`;
    modal.querySelectorAll('[data-status-atelier-close]').forEach(button => button.addEventListener('click', closeGreetingModal));
    modal.querySelector('#status-atelier-jump-first').addEventListener('click', () => {
        jumpToFirstMessage();
        closeGreetingModal();
    });
    document.body.append(modal);
}

function saveGreetingNote(key, index, title, summary) {
    if (!key) return;
    const stored = settings();
    stored.openingNotes[key] ??= {};
    stored.openingNotes[key][index] = { title: title.trim(), summary: summary.trim() };
    saveSettingsSoon();
    scheduleRender();
}

function renderGreetingList() {
    const list = modal.querySelector('.status-atelier-greeting-list');
    const data = greetingData();
    list.replaceChildren();

    if (!data.entries.length) {
        list.append(makeElement('div', 'status-atelier-empty', '当前没有可管理的角色开场白。请先打开一个单人角色聊天。'));
        return;
    }

    data.entries.forEach(entry => {
        const card = makeElement('article', 'status-atelier-greeting-card');
        card.dataset.current = String(entry.index === data.current);
        const fields = makeElement('div', 'status-atelier-greeting-fields');
        const titleLabel = makeElement('label', '', '导航标题');
        const titleInput = makeElement('input', 'text_pole');
        titleInput.type = 'text';
        titleInput.maxLength = 80;
        titleInput.value = entry.title;
        titleLabel.append(titleInput);
        const summaryLabel = makeElement('label', '', '开场白简介');
        const summaryInput = makeElement('textarea', 'text_pole');
        summaryInput.maxLength = 360;
        summaryInput.value = entry.summary;
        summaryLabel.append(summaryInput);
        fields.append(titleLabel, summaryLabel, makeElement('p', 'status-atelier-greeting-preview', `原文预览：${entry.preview || '（空）'}`));

        const actions = makeElement('div', 'status-atelier-greeting-actions');
        if (entry.index === data.current) {
            actions.append(makeElement('span', 'status-atelier-current-badge', '当前'));
        }
        const switchButton = makeElement('button', 'menu_button', entry.index === data.current ? '定位到这条' : '切换并定位');
        switchButton.type = 'button';
        switchButton.addEventListener('click', async () => {
            switchButton.disabled = true;
            try {
                if (entry.index !== greetingData().current) {
                    await switchGreeting(entry.index);
                }
                jumpToFirstMessage();
                renderGreetingList();
            } catch (error) {
                console.error('[状态工坊] 切换开场白失败', error);
                notify('error', error?.message || '切换开场白失败');
            } finally {
                switchButton.disabled = false;
            }
        });
        actions.append(switchButton);

        const persist = () => saveGreetingNote(data.key, entry.index, titleInput.value, summaryInput.value);
        titleInput.addEventListener('input', persist);
        summaryInput.addEventListener('input', persist);
        card.append(fields, actions);
        list.append(card);
    });
}

function openGreetingModal() {
    if (!modal) buildModal();
    renderGreetingList();
    modal.classList.add('status-atelier-modal-open');
    modal.setAttribute('aria-hidden', 'false');
}

function closeGreetingModal() {
    modal?.classList.remove('status-atelier-modal-open');
    modal?.setAttribute('aria-hidden', 'true');
}

function jumpToFirstMessage() {
    document.querySelector('#chat .mes[mesid="0"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function switchGreeting(targetIndex) {
    const ctx = context();
    const message = ctx?.chat?.[0];
    const swipes = message?.swipes;
    if (!ctx?.swipe || !Array.isArray(swipes) || !swipes.length) {
        throw new Error('当前聊天没有可切换的备用开场白');
    }
    const target = Math.max(0, Math.min(swipes.length - 1, Number(targetIndex)));
    let current = Math.max(0, Math.min(swipes.length - 1, Number(message.swipe_id ?? 0)));
    if (current === target) return;

    // Do not wrap past the right edge in an existing long chat: SillyTavern may
    // interpret that as a request to generate a brand-new swipe. Moving in the
    // direct numeric direction always stays inside the saved greeting list.
    const direction = target > current ? 'right' : 'left';
    const steps = Math.abs(target - current);
    const messageElement = document.querySelector('#chat .mes[mesid="0"]');
    if (!messageElement) {
        throw new Error('聊天第 1 条消息尚未加载');
    }

    for (let index = 0; index < steps; index += 1) {
        await ctx.swipe[direction].call(messageElement, null, { source: MODULE_NAME, message });
        current = Number(message.swipe_id ?? current);
    }
    scheduleRender(80);
}

function addExtensionsMenuItem() {
    const menu = document.querySelector('#extensionsMenu');
    if (!menu || document.querySelector('#status-atelier-menu-item')) {
        return;
    }
    const item = makeElement('div', 'list-group-item flex-container flexGap5');
    item.id = 'status-atelier-menu-item';
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', '打开状态工坊与开场白导航');
    const icon = makeElement('div', 'fa-solid fa-layer-group extensionsMenuExtensionButton');
    icon.setAttribute('aria-hidden', 'true');
    item.append(icon, makeElement('span', '', '状态 / 开场白工坊'));
    const open = () => openGreetingModal();
    item.addEventListener('click', open);
    item.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            open();
        }
    });
    menu.append(item);
}

async function addSettingsPanel() {
    const host = document.querySelector('#extensions_settings2, #extensions_settings');
    if (!host || document.querySelector('#status-atelier-settings')) {
        return false;
    }
    const response = await fetch(new URL('./settings.html', import.meta.url));
    if (!response.ok) {
        throw new Error(`无法读取设置面板：${response.status}`);
    }
    const template = document.createElement('template');
    template.innerHTML = await response.text();
    settingsRoot = template.content.firstElementChild;
    host.append(settingsRoot);

    fieldValue('status-atelier-preset').addEventListener('change', event => applyPreset(event.target.value));
    fieldValue('status-atelier-palette').addEventListener('change', event => {
        applyPalette(event.target.value);
        settings().preset = 'custom';
        loadSettingsUI();
        saveSettingsSoon();
        scheduleRender();
    });

    settingsRoot.addEventListener('input', event => {
        if (event.target.matches('#status-atelier-preset, #status-atelier-palette')) return;
        readSettingsUI(event.target);
    });
    settingsRoot.addEventListener('change', event => {
        if (event.target.matches('#status-atelier-preset, #status-atelier-palette, #status-atelier-import-file')) return;
        readSettingsUI(event.target);
    });

    fieldValue('status-atelier-open-greetings').addEventListener('click', openGreetingModal);
    fieldValue('status-atelier-detect-schema').addEventListener('click', () => {
        const detected = latestDetectedSchema();
        if (!detected) {
            notify('warning', '当前聊天里没有找到 <status_bar> 数据');
            return;
        }
        settings().schema = detected;
        settings().preset = 'custom';
        loadSettingsUI();
        saveSettingsSoon();
        scheduleRender();
        notify('success', '已读取当前状态栏字段');
    });
    fieldValue('status-atelier-copy-prompt').addEventListener('click', async () => {
        await copyText(buildPrompt(settings().schema));
        notify('success', '状态栏输出指令已复制');
    });
    fieldValue('status-atelier-export').addEventListener('click', downloadSettings);
    fieldValue('status-atelier-import').addEventListener('click', () => fieldValue('status-atelier-import-file').click());
    fieldValue('status-atelier-import-file').addEventListener('change', async event => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        try {
            await importSettings(file);
            notify('success', '配置已导入');
        } catch (error) {
            notify('error', error?.message || '配置导入失败');
        }
    });
    fieldValue('status-atelier-reset').addEventListener('click', () => {
        const notes = settings().openingNotes;
        Object.assign(settings(), clone(DEFAULT_SETTINGS), { openingNotes: notes });
        loadSettingsUI();
        updatePrompt();
        saveSettingsSoon();
        scheduleRender();
        notify('success', '显示配置已恢复默认，开场白简介已保留');
    });

    loadSettingsUI();
    return true;
}

function observeChat() {
    const chat = document.querySelector('#chat');
    if (!chat || chatObserver) {
        return;
    }
    chatObserver = new MutationObserver(records => {
        if (isRestoring) return;
        const relevant = records.some(record => [...record.addedNodes, ...record.removedNodes].some(node => {
            if (node.nodeType === Node.TEXT_NODE) return true;
            return node.nodeType === Node.ELEMENT_NODE && !node.matches?.('.status-atelier-panel');
        }));
        if (relevant) scheduleRender(60);
    });
    chatObserver.observe(chat, { childList: true, subtree: true });
}

function bindEvents() {
    const ctx = context();
    const events = ctx?.eventTypes || ctx?.event_types;
    const source = ctx?.eventSource;
    if (!events || !source?.on) {
        return;
    }
    [
        events.CHAT_CHANGED,
        events.CHARACTER_MESSAGE_RENDERED,
        events.MESSAGE_EDITED,
        events.MESSAGE_UPDATED,
        events.MESSAGE_SWIPED,
        events.MORE_MESSAGES_LOADED,
        events.GENERATION_ENDED,
    ].filter(Boolean).forEach(eventName => source.on(eventName, () => scheduleRender()));
}

async function initialize() {
    settings();
    buildModal();
    addExtensionsMenuItem();
    observeChat();
    bindEvents();
    updatePrompt();

    for (let attempt = 0; attempt < 20; attempt += 1) {
        if (await addSettingsPanel()) break;
        await new Promise(resolve => setTimeout(resolve, 250));
    }
    scheduleRender(100);
    console.info('[状态工坊] Status Atelier 0.1.0 已加载');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
} else {
    initialize();
}

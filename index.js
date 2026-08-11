import {
    RULE_PRESETS,
    buildAiInstruction,
    buildRegexScript,
    buildWorldbookJson,
    makePreviewRecords,
    normalizeRule,
    parseFields,
} from './rule-generator.js?v=0.8.4';
import {
    OPENING_HOME_DEFAULTS,
    appendOpeningWorldline,
    buildOpeningHomeBlock,
    buildOpeningHomeRegex,
    normalizeOpeningHomeSettings,
} from './opening-home-generator.js?v=0.8.4';
import {
    BATCH_SUMMARY_JSON_SCHEMA,
    ENTRY_BATCH_JSON_SCHEMA,
    SUMMARY_RESPONSE_LENGTH,
    SINGLE_SUMMARY_JSON_SCHEMA,
    generationErrorMessage,
    greetingPreview,
    parseBatchSummaryResponse,
    parseSummaryResponse,
    responseText,
    usableGreetingRecords,
} from './response-parser.js?v=0.8.4';
import {
    constrainRouteToCatalog,
    extractWorldbookRouteCatalog,
    routeCatalogPrompt,
    worldbookRouteLabels,
} from './worldbook-routes.js?v=0.8.4';
import {
    SCRIPT_TYPES,
    allowScopedScripts,
    getScriptsByType,
    saveScriptsByType,
} from '../../regex/engine.js';
import { loadWorldInfo, world_names } from '../../../world-info.js';
import { saveSettings } from '../../../../script.js';

const MODULE_NAME = 'status_atelier';
const PROMPT_KEY = 'status_atelier_generated_rule';
const VERSION = '0.8.4';
const OPENING_HOME_SCHEMA_VERSION = 2;

const HOME_TEMPLATES = Object.freeze([
    { id: 'classical', name: '01 古典徽章', description: '双层雕花框 · 海军蓝金箔' },
    { id: 'newspaper', name: '03 复古报刊', description: '报头分栏 · 印章与粗细线' },
    { id: 'timeline', name: '04 中轴时间线', description: '粉青节点 · 立体柔边卡片' },
    { id: 'minimal', name: '05 构成编辑', description: '米白纸张 · 黑色网格 · 暗红索引' },
]);

const STATUS_TEMPLATES = Object.freeze([
    { id: 'relationship', name: '攻略关系型', description: '关系阶段、好感度、变化原因与内心独白' },
    { id: 'openingInfo', name: '开局信息型', description: '时间、地点、身份、世界前提与目标' },
    { id: 'worldNpc', name: '大世界 NPC 型', description: '地区、事件、阵营、NPC、声望与威胁' },
    { id: 'survival', name: '生存探索型', description: '生命、资源、危险、背包与任务' },
]);

const KIND_LABELS = Object.freeze({ text: '短文本', long: '长文本', number: '数字', progress: '数值 0–100', currency: '金额' });

const OPENING_PALETTES = Object.freeze({
    navy: { background: '#f5ead7', cardBackground: '#fffaf0', text: '#2f261e', accent: '#914538', secondary: '#7d6a56', introBackground: '#e8e0d0', buttonColor: '#1a3048' },
    sage: { background: '#e4e5d8', cardBackground: '#f4f1e8', text: '#343331', accent: '#71877a', secondary: '#66756c', introBackground: '#d5dfd7', buttonColor: '#b96f54' },
    berry: { background: '#eadcda', cardBackground: '#f8efeb', text: '#3b3835', accent: '#95676b', secondary: '#7a6868', introBackground: '#ded0d2', buttonColor: '#7d626c' },
    aqua: { background: '#dce8e5', cardBackground: '#f2f6f3', text: '#303536', accent: '#678584', secondary: '#5f7776', introBackground: '#cfdfdc', buttonColor: '#577472' },
});

const DEFAULT_SETTINGS = Object.freeze({
    ...RULE_PRESETS.relationship,
    preset: 'relationship',
    statusTemplate: 'relationship',
    promptEnabled: false,
    installScope: 'scoped',
    ruleId: 'zeya-status-rule-v2',
    activeWorkspace: 'opening',
    favoriteHomeTemplates: ['classical', 'newspaper', 'timeline'],
    favoriteStatusTemplates: ['relationship', 'worldNpc'],
    openingNotes: {},
    openingReadStatus: '',
    openingReadState: '',
    openingHome: OPENING_HOME_DEFAULTS,
    openingSummary: { source: 'main', endpoint: '', apiKey: '', model: '' },
});

const OPENING_HOME_FIELDS = Object.freeze({
    'status-atelier-opening-home-title': 'title',
    'status-atelier-opening-home-subtitle': 'subtitle',
    'status-atelier-opening-home-author': 'author',
    'status-atelier-opening-home-model': 'model',
    'status-atelier-opening-home-preset': 'preset',
    'status-atelier-opening-home-intro': 'intro',
    'status-atelier-opening-home-theme': 'theme',
    'status-atelier-opening-home-font': 'font',
    'status-atelier-opening-home-accent': 'accent',
    'status-atelier-opening-home-background': 'background',
    'status-atelier-opening-home-card-background': 'cardBackground',
    'status-atelier-opening-home-text': 'text',
    'status-atelier-opening-home-secondary': 'secondary',
    'status-atelier-opening-home-intro-background': 'introBackground',
    'status-atelier-opening-home-button-color': 'buttonColor',
});

const SETTING_FIELDS = Object.freeze({
    'status-atelier-rule-name': 'ruleName',
    'status-atelier-tag-name': 'tagName',
    'status-atelier-title': 'title',
    'status-atelier-subtitle': 'subtitle',
    'status-atelier-theme': 'theme',
    'status-atelier-layout': 'layout',
    'status-atelier-pages': 'pagesText',
    'status-atelier-shared-fields': 'sharedFieldsText',
    'status-atelier-page-fields': 'pageFieldsText',
    'status-atelier-install-scope': 'installScope',
    'status-atelier-prompt-enabled': 'promptEnabled',
});

const OPENING_SUMMARY_FIELDS = Object.freeze({
    'status-atelier-opening-summary-source': 'source',
    'status-atelier-opening-summary-endpoint': 'endpoint',
    'status-atelier-opening-summary-key': 'apiKey',
    'status-atelier-opening-summary-model': 'model',
});

let settingsRoot;
let greetingModal;
let saveTimer;
let entryDialogWorldlineIndex = null;
let openingReadToast = null;

function context() {
    return globalThis.SillyTavern?.getContext?.();
}

function clone(value) {
    return globalThis.structuredClone ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function notify(level, message) {
    if (globalThis.toastr?.[level]) {
        globalThis.toastr[level](message);
    } else {
        console[level === 'error' ? 'error' : 'log'](`[久一 正则状态工坊] ${message}`);
    }
}

function showOpeningReadProgress(message) {
    if (!globalThis.toastr?.info) return;
    if (openingReadToast) globalThis.toastr.clear?.(openingReadToast);
    openingReadToast = globalThis.toastr.info(message, '久一 · AI 正在生成', {
        timeOut: 0,
        extendedTimeOut: 0,
        tapToDismiss: false,
        closeButton: false,
    });
}

function hideOpeningReadProgress() {
    if (openingReadToast) globalThis.toastr?.clear?.(openingReadToast);
    openingReadToast = null;
}

function settings() {
    const ctx = context();
    if (!ctx?.extensionSettings) return clone(DEFAULT_SETTINGS);
    ctx.extensionSettings[MODULE_NAME] ??= {};
    const stored = ctx.extensionSettings[MODULE_NAME];
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        if (!Object.hasOwn(stored, key)) stored[key] = clone(value);
    }
    if (!stored.openingNotes || typeof stored.openingNotes !== 'object' || Array.isArray(stored.openingNotes)) {
        stored.openingNotes = {};
    }
    if (!stored.openingSummary || typeof stored.openingSummary !== 'object' || Array.isArray(stored.openingSummary)) {
        stored.openingSummary = clone(DEFAULT_SETTINGS.openingSummary);
    }
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS.openingSummary)) {
        if (!Object.hasOwn(stored.openingSummary, key)) stored.openingSummary[key] = value;
    }
    if (stored.openingSummary.source === 'manual') stored.openingSummary.source = 'main';
    if (!['opening', 'status'].includes(stored.activeWorkspace)) stored.activeWorkspace = 'opening';
    if (!Array.isArray(stored.favoriteHomeTemplates)) stored.favoriteHomeTemplates = clone(DEFAULT_SETTINGS.favoriteHomeTemplates);
    if (!Array.isArray(stored.favoriteStatusTemplates)) stored.favoriteStatusTemplates = clone(DEFAULT_SETTINGS.favoriteStatusTemplates);
    if (stored.statusFieldsUnified !== true) {
        const definitions = [...parseFields(stored.sharedFieldsText), ...parseFields(stored.pageFieldsText)];
        const used = new Set();
        stored.pageFieldsText = definitions.map((item, index) => {
            let key = item.id || `field_${index + 1}`;
            if (/^field_\d+$/.test(key)) key = `field_${index + 1}`;
            let suffix = 2;
            while (used.has(key)) key = `${item.id}_${suffix++}`;
            used.add(key);
            return `${item.label}|${item.instruction}|${item.kind}|${key}`;
        }).join('\n');
        stored.sharedFieldsText = '';
        stored.statusFieldsUnified = true;
    }
    if (stored.openingIntroContrastV051 !== true) {
        if (String(stored.openingHome?.introBackground || '').toLowerCase() === '#1a3048') {
            stored.openingHome.introBackground = '#e8e0d0';
        }
        stored.openingIntroContrastV051 = true;
    }
    // Only normalize/migrate once. Replacing this object during every UI read makes
    // input handlers keep stale worldline references and can erase edited routes.
    if (stored.openingHomeSchemaVersion !== OPENING_HOME_SCHEMA_VERSION) {
        stored.openingHome = normalizeOpeningHomeSettings(stored.openingHome);
        stored.openingHomeSchemaVersion = OPENING_HOME_SCHEMA_VERSION;
    }
    return stored;
}

function saveSettingsSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => context()?.saveSettingsDebounced?.(), 120);
}

async function saveSettingsNow() {
    clearTimeout(saveTimer);
    saveTimer = null;
    await saveSettings();
}

function setText(element, value) {
    element.textContent = String(value ?? '');
    return element;
}

function makeElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) setText(element, text);
    return element;
}

function appendInlineMarkdown(host, value) {
    const source = String(value || '');
    const tokenPattern = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    let offset = 0;
    for (const match of source.matchAll(tokenPattern)) {
        if (match.index > offset) host.append(document.createTextNode(source.slice(offset, match.index)));
        const token = match[0];
        const element = token.startsWith('**')
            ? makeElement('strong', '', token.slice(2, -2))
            : token.startsWith('`')
                ? makeElement('code', '', token.slice(1, -1))
                : makeElement('em', '', token.slice(1, -1));
        host.append(element);
        offset = match.index + token.length;
    }
    if (offset < source.length) host.append(document.createTextNode(source.slice(offset)));
}

function renderSafeMarkdown(host, value) {
    host.replaceChildren();
    let list = null;
    const flushList = () => { list = null; };
    String(value || '—').replace(/\r\n?/g, '\n').split('\n').forEach(line => {
        const heading = line.match(/^(#{1,3})\s+(.+)$/);
        const bullet = line.match(/^[-*]\s+(.+)$/);
        if (heading) {
            flushList();
            const node = makeElement(`h${Math.min(6, heading[1].length + 3)}`, 'status-atelier-markdown-heading');
            appendInlineMarkdown(node, heading[2]);
            host.append(node);
        } else if (bullet) {
            if (!list) {
                list = makeElement('ul', 'status-atelier-markdown-list');
                host.append(list);
            }
            const item = makeElement('li');
            appendInlineMarkdown(item, bullet[1]);
            list.append(item);
        } else if (line.trim()) {
            flushList();
            const paragraph = makeElement('p');
            appendInlineMarkdown(paragraph, line.trim());
            host.append(paragraph);
        } else {
            flushList();
        }
    });
}

function field(id) {
    return settingsRoot?.querySelector(`#${id}`);
}

function setWorkspace(name, { persist = true } = {}) {
    const active = name === 'status' ? 'status' : 'opening';
    settingsRoot?.querySelectorAll('[data-status-workspace]').forEach(button => {
        const selected = button.dataset.statusWorkspace === active;
        button.classList.toggle('is-active', selected);
        button.setAttribute('aria-pressed', String(selected));
    });
    settingsRoot?.querySelectorAll('[data-status-workspace-panel]').forEach(panel => {
        panel.hidden = panel.dataset.statusWorkspacePanel !== active;
    });
    if (persist) {
        settings().activeWorkspace = active;
        saveSettingsSoon();
    }
}

function makeTemplateCard(template, type, selected, favorites) {
    const wrap = makeElement('div', 'status-atelier-template-wrap');
    const card = makeElement('button', 'status-atelier-template-card');
    card.type = 'button';
    card.setAttribute('aria-pressed', String(template.id === selected));
    card.append(makeElement('strong', '', template.name), makeElement('small', '', template.description));
    card.addEventListener('click', () => {
        if (type === 'home') {
            settings().openingHome.theme = template.id;
            field('status-atelier-opening-home-theme').value = template.id;
            renderTemplateLibraries();
            updateOpeningHomePreview();
            saveSettingsSoon();
        } else {
            applyPreset(template.id);
        }
    });
    const favorite = makeElement('button', 'status-atelier-favorite', favorites.includes(template.id) ? '★' : '☆');
    favorite.type = 'button';
    favorite.title = favorites.includes(template.id) ? '取消收藏' : '加入收藏';
    favorite.setAttribute('aria-pressed', String(favorites.includes(template.id)));
    favorite.addEventListener('click', event => {
        event.stopPropagation();
        const key = type === 'home' ? 'favoriteHomeTemplates' : 'favoriteStatusTemplates';
        const list = settings()[key];
        const index = list.indexOf(template.id);
        if (index >= 0) list.splice(index, 1);
        else list.push(template.id);
        renderTemplateLibraries();
        saveSettingsSoon();
    });
    wrap.append(card, favorite);
    return wrap;
}

function fillTemplateLibrary(templates, favorites, selected, type, favoriteHost, otherHost) {
    favoriteHost.replaceChildren();
    otherHost.replaceChildren();
    templates.forEach(template => {
        const host = favorites.includes(template.id) ? favoriteHost : otherHost;
        host.append(makeTemplateCard(template, type, selected, favorites));
    });
    if (!favoriteHost.children.length) favoriteHost.append(makeElement('small', 'status-atelier-empty', '还没有收藏模板。'));
    if (!otherHost.children.length) otherHost.append(makeElement('small', 'status-atelier-empty', '所有模板都已收藏。'));
}

function renderTemplateLibraries() {
    if (!settingsRoot) return;
    const stored = settings();
    fillTemplateLibrary(HOME_TEMPLATES, stored.favoriteHomeTemplates, stored.openingHome.theme, 'home', field('status-atelier-home-favorites'), field('status-atelier-home-others'));
    fillTemplateLibrary(STATUS_TEMPLATES, stored.favoriteStatusTemplates, stored.statusTemplate || stored.preset, 'status', field('status-atelier-status-favorites'), field('status-atelier-status-others'));
}

function renderPaletteButtons() {
    const names = { navy: '奶油海军蓝', sage: '秋杏染青', berry: '燕麦莓果', aqua: '雾灰水色' };
    settingsRoot?.querySelectorAll('[data-opening-palette]').forEach(button => {
        const palette = OPENING_PALETTES[button.dataset.openingPalette];
        if (!palette) return;
        const dots = makeElement('span', 'status-atelier-palette-dots');
        [palette.background, palette.cardBackground, palette.accent, palette.introBackground, palette.buttonColor].forEach(colorValue => {
            const dot = makeElement('i');
            dot.style.background = colorValue;
            dots.append(dot);
        });
        button.replaceChildren(dots, document.createTextNode(names[button.dataset.openingPalette]));
    });
}

function fieldDefinitions() {
    const stored = settings();
    const shared = parseFields(stored.sharedFieldsText).map((item, index) => ({ ...item, scope: 'page', id: item.id === `field_${index + 1}` ? `shared_${index + 1}` : item.id }));
    const page = parseFields(stored.pageFieldsText).map((item, index) => ({ ...item, scope: 'page', id: item.id === `field_${index + 1}` ? `field_${index + 1}` : item.id }));
    const used = new Set();
    return [...shared, ...page].map((item, index) => {
        let key = item.id || `field_${index + 1}`;
        let suffix = 2;
        while (used.has(key)) key = `${item.id}_${suffix++}`;
        used.add(key);
        return { ...item, id: key };
    });
}

function serializeFieldDefinitions(definitions) {
    settings().sharedFieldsText = '';
    settings().pageFieldsText = definitions.map(item => `${item.label}|${item.instruction}|${item.kind}|${item.id}`).join('\n');
    field('status-atelier-shared-fields').value = settings().sharedFieldsText;
    field('status-atelier-page-fields').value = settings().pageFieldsText;
    settings().preset = 'custom';
    field('status-atelier-preset').value = 'custom';
    updatePrompt();
    updatePreview();
    saveSettingsSoon();
}

function renderStatusSchema() {
    const host = field('status-atelier-status-schema');
    if (!host) return;
    const definitions = fieldDefinitions();
    host.replaceChildren();
    definitions.forEach((definition, index) => {
        const row = makeElement('article', 'status-atelier-schema-row');
        row.append(makeElement('span', 'status-atelier-schema-drag', '⠿'));
        const label = makeElement('input', 'text_pole');
        label.value = definition.label;
        label.title = '可修改：显示名称';
        const kind = makeElement('select', 'text_pole');
        Object.entries(KIND_LABELS).forEach(([value, text]) => {
            const option = makeElement('option', '', text);
            option.value = value;
            kind.append(option);
        });
        kind.value = definition.kind;
        const actions = makeElement('div', 'status-atelier-schema-actions');
        const up = makeElement('button', 'status-atelier-schema-remove', '↑');
        const down = makeElement('button', 'status-atelier-schema-remove', '↓');
        const remove = makeElement('button', 'status-atelier-schema-remove', '×');
        [up, down, remove].forEach(button => { button.type = 'button'; });
        up.disabled = index === 0;
        down.disabled = index === definitions.length - 1;
        up.addEventListener('click', () => { [definitions[index - 1], definitions[index]] = [definitions[index], definitions[index - 1]]; serializeFieldDefinitions(definitions); renderStatusSchema(); });
        down.addEventListener('click', () => { [definitions[index + 1], definitions[index]] = [definitions[index], definitions[index + 1]]; serializeFieldDefinitions(definitions); renderStatusSchema(); });
        remove.addEventListener('click', () => { definitions.splice(index, 1); serializeFieldDefinitions(definitions); renderStatusSchema(); });
        actions.append(up, down, remove);
        const key = makeElement('span', 'status-atelier-schema-key', `🔒 ${definition.id}`);
        const details = makeElement('details');
        details.append(makeElement('summary', '', 'AI 填写要求'));
        const instruction = makeElement('textarea', 'text_pole');
        instruction.value = definition.instruction;
        details.append(instruction);
        label.addEventListener('input', () => { definition.label = label.value; serializeFieldDefinitions(definitions); });
        kind.addEventListener('change', () => { definition.kind = kind.value; serializeFieldDefinitions(definitions); });
        instruction.addEventListener('input', () => { definition.instruction = instruction.value; serializeFieldDefinitions(definitions); });
        row.append(label, kind, actions, key, details);
        host.append(row);
    });
    if (!definitions.length) host.append(makeElement('p', 'status-atelier-empty', '当前没有字段，点击“新增字段”开始。'));
}

function addStatusField() {
    const definitions = fieldDefinitions();
    let index = definitions.length + 1;
    let key = `custom_${index}`;
    const used = new Set(definitions.map(item => item.id));
    while (used.has(key)) key = `custom_${++index}`;
    definitions.push({ id: key, label: `自定义字段 ${index}`, instruction: '根据当前剧情动态填写', kind: 'text', scope: 'page' });
    serializeFieldDefinitions(definitions);
    renderStatusSchema();
}

function updateSummarySourceVisibility() {
    const host = field('status-atelier-opening-summary-extra');
    if (host) host.hidden = settings().openingSummary.source !== 'extra';
}

function updatePrompt() {
    const ctx = context();
    if (!ctx?.setExtensionPrompt) return;
    const stored = settings();
    ctx.setExtensionPrompt(
        PROMPT_KEY,
        stored.promptEnabled ? buildAiInstruction(stored) : '',
        1,
        0,
        false,
        0,
    );
}

function applyPreset(name) {
    const preset = RULE_PRESETS[name];
    if (!preset) return;
    const stored = settings();
    const preserved = {
        openingNotes: stored.openingNotes,
        promptEnabled: stored.promptEnabled,
        installScope: stored.installScope,
        ruleId: stored.ruleId,
        openingHome: stored.openingHome,
        openingSummary: stored.openingSummary,
        activeWorkspace: stored.activeWorkspace,
        favoriteHomeTemplates: stored.favoriteHomeTemplates,
        favoriteStatusTemplates: stored.favoriteStatusTemplates,
    };
    Object.assign(stored, clone(preset), preserved, { preset: name, statusTemplate: name });
    const mergedFields = [...parseFields(stored.sharedFieldsText), ...parseFields(stored.pageFieldsText)];
    stored.sharedFieldsText = '';
    stored.pageFieldsText = mergedFields.map((item, index) => `${item.label}|${item.instruction}|${item.kind}|${item.id || `field_${index + 1}`}`).join('\n');
    stored.statusFieldsUnified = true;
    loadSettingsUI();
    updatePrompt();
    updatePreview();
    saveSettingsSoon();
}

function loadSettingsUI() {
    if (!settingsRoot) return;
    const stored = settings();
    field('status-atelier-preset').value = stored.preset || 'custom';
    for (const [id, key] of Object.entries(SETTING_FIELDS)) {
        const control = field(id);
        if (!control) continue;
        if (control.type === 'checkbox') control.checked = Boolean(stored[key]);
        else control.value = String(stored[key] ?? '');
    }
    for (const [id, key] of Object.entries(OPENING_HOME_FIELDS)) {
        const control = field(id);
        if (control) control.value = String(stored.openingHome[key] ?? '');
    }
    for (const [id, key] of Object.entries(OPENING_SUMMARY_FIELDS)) {
        const control = field(id);
        if (control) control.value = String(stored.openingSummary[key] ?? '');
    }
    setWorkspace(stored.activeWorkspace, { persist: false });
    renderTemplateLibraries();
    renderPaletteButtons();
    renderStatusSchema();
    updateSummarySourceVisibility();
    renderOpeningWorldlines();
    const readStatus = field('status-atelier-opening-read-status');
    if (readStatus) {
        readStatus.textContent = stored.openingReadStatus || '尚未读取当前角色卡。';
        readStatus.dataset.state = stored.openingReadState || 'idle';
    }
}

function setOpeningReadStatus(message, state = 'idle', persistNow = false) {
    const stored = settings();
    stored.openingReadStatus = String(message || '');
    stored.openingReadState = state;
    const status = field('status-atelier-opening-read-status');
    if (status) {
        status.textContent = stored.openingReadStatus;
        status.dataset.state = state;
    }
    if (persistNow) return saveSettingsNow();
    saveSettingsSoon();
    return Promise.resolve();
}

function readOpeningHomeControl(control) {
    const key = OPENING_HOME_FIELDS[control.id];
    if (!key) return;
    settings().openingHome[key] = control.value;
    updateOpeningHomePreview();
    saveSettingsSoon();
}

function readOpeningSummaryControl(control) {
    const key = OPENING_SUMMARY_FIELDS[control.id];
    if (!key) return;
    settings().openingSummary[key] = control.value;
    updateSummarySourceVisibility();
    saveSettingsSoon();
}

function updateOpeningHomePreview() {
    const host = field('status-atelier-opening-live-preview');
    if (!host) return;
    const data = normalizeOpeningHomeSettings(settings().openingHome);
    const root = makeElement('section', 'status-atelier-opening-live');
    root.dataset.theme = data.theme;
    root.style.setProperty('--zop-accent', data.accent);
    root.style.setProperty('--zop-bg', data.background);
    root.style.setProperty('--zop-card', data.cardBackground);
    root.style.setProperty('--zop-text', data.text);
    root.style.setProperty('--zop-secondary', data.secondary);
    root.style.setProperty('--zop-intro', data.introBackground);
    root.style.setProperty('--zop-button', data.buttonColor);
    const header = makeElement('header', 'status-atelier-opening-live-header');
    header.append(makeElement('h3', '', data.title), makeElement('small', '', data.subtitle));
    const meta = makeElement('div', 'status-atelier-opening-live-meta');
    [['作者', data.author], ['推荐模型', data.model], ['推荐预设', data.preset]].forEach(([label, value]) => {
        const item = makeElement('div');
        item.append(makeElement('span', '', label), makeElement('strong', '', value));
        meta.append(item);
    });
    const intro = makeElement('div', 'status-atelier-opening-live-intro');
    const introMarkdown = makeElement('div', 'status-atelier-opening-live-intro-markdown');
    renderSafeMarkdown(introMarkdown, data.intro);
    intro.append(makeElement('h4', '', '作品简介'), introMarkdown);
    if (data.worldlines.length) {
        const routes = makeElement('div', 'status-atelier-opening-live-routes');
        data.worldlines.forEach(worldline => {
            const route = makeElement('div');
            route.append(makeElement('strong', '', worldline.name), makeElement('small', '', worldline.description || '尚未填写线路简介。'));
            routes.append(route);
        });
        intro.append(routes);
    }
    const directory = makeElement('div', 'status-atelier-opening-live-directory');
    directory.append(makeElement('h4', '', `开场白目录 · 共 ${data.entries.length} 条`));
    data.entries.forEach((entry, index) => {
        const item = makeElement('div', 'status-atelier-opening-live-entry');
        item.append(makeElement('b', '', entry.number || String(index + 1).padStart(2, '0')));
        const copy = makeElement('div');
        const heading = makeElement('div', 'status-atelier-opening-live-entry-heading');
        heading.append(makeElement('strong', '', entry.title), makeElement('span', 'status-atelier-opening-live-route', entry.route));
        copy.append(heading, makeElement('small', '', entry.summary));
        item.append(copy, makeElement('span', '', '进入'));
        directory.append(item);
    });
    root.append(header, meta, intro, directory);
    host.replaceChildren(root);
}

function openingEntryInput(labelText, value, key, index, { type = 'text', min, maxLength = 180 } = {}) {
    const label = makeElement('label', '', labelText);
    const input = makeElement('input', 'text_pole');
    input.type = type;
    input.value = String(value ?? '');
    input.dataset.openingEntryKey = key;
    input.dataset.openingEntryIndex = String(index);
    if (min !== undefined) input.min = String(min);
    if (maxLength) input.maxLength = maxLength;
    label.append(input);
    return label;
}

function openingWorldlineSelect(value, index) {
    const label = makeElement('label', '', '绑定世界线');
    const select = makeElement('select', 'text_pole');
    select.dataset.openingEntryKey = 'worldlineId';
    select.dataset.openingEntryIndex = String(index);
    const empty = makeElement('option', '', '不绑定世界线');
    empty.value = '';
    select.append(empty);
    settings().openingHome.worldlines.forEach(worldline => {
        const option = makeElement('option', '', worldline.name);
        option.value = worldline.id;
        select.append(option);
    });
    select.value = value || '';
    label.append(select);
    return label;
}

function openingExtraEntryPicker(openingEntry, index) {
    openingEntry.extraEntries ??= [];
    const host = makeElement('div', 'status-atelier-opening-extra');
    const label = makeElement('strong', '', '本条开场白额外启用的条目（可选）');
    const controls = makeElement('div', 'status-atelier-opening-extra-controls');
    const book = makeElement('select', 'text_pole');
    const blank = makeElement('option', '', '选择世界书');
    blank.value = '';
    book.append(blank);
    (world_names || []).forEach(worldName => { const option = makeElement('option', '', worldName); option.value = worldName; book.append(option); });
    const entry = makeElement('select', 'text_pole');
    loadEntryOptions('', entry);
    book.addEventListener('change', () => loadEntryOptions(book.value, entry).catch(error => notify('error', error?.message || '读取世界书条目失败')));
    const add = makeElement('button', 'menu_button', '添加额外条目');
    add.type = 'button';
    add.addEventListener('click', () => {
        if (!book.value || !entry.value) return notify('warning', '请先选择世界书和具体条目');
        const uid = Number(entry.value);
        const title = entry.selectedOptions[0]?.dataset.entryTitle || `UID ${uid}`;
        if (!openingEntry.extraEntries.some(item => item.book === book.value && Number(item.uid) === uid)) openingEntry.extraEntries.push({ book: book.value, uid, title });
        renderOpeningHomeEntries();
        saveSettingsSoon();
    });
    controls.append(book, entry, add);
    const chips = makeElement('div', 'status-atelier-opening-worldline-chips');
    openingEntry.extraEntries.forEach((binding, bindingIndex) => {
        const chip = makeElement('button', 'menu_button', `${binding.book} · UID ${binding.uid} · ${binding.title} ×`);
        chip.type = 'button';
        chip.addEventListener('click', () => { openingEntry.extraEntries.splice(bindingIndex, 1); renderOpeningHomeEntries(); saveSettingsSoon(); });
        chips.append(chip);
    });
    host.append(label, controls, chips);
    host.dataset.openingIndex = String(index);
    return host;
}

async function loadEntryOptions(bookName, select) {
    select.replaceChildren();
    if (!bookName) {
        const option = makeElement('option', '', '先选择世界书');
        option.value = '';
        select.append(option);
        return;
    }
    const data = await loadWorldInfo(bookName);
    const entries = Object.values(data?.entries || {}).sort((a, b) => Number(a.uid) - Number(b.uid));
    if (!entries.length) {
        const option = makeElement('option', '', '这本世界书没有条目');
        option.value = '';
        select.append(option);
        return;
    }
    entries.forEach(entry => {
        const option = makeElement('option', '', `UID ${entry.uid} · ${entry.comment || entry.key?.join?.(', ') || '未命名条目'}`);
        option.value = String(entry.uid);
        option.dataset.entryTitle = entry.comment || entry.key?.join?.(', ') || `UID ${entry.uid}`;
        select.append(option);
    });
}

function currentLinkedWorldbooks() {
    const ctx = context();
    const character = ctx?.characters?.[ctx.characterId];
    const data = character?.data || character || {};
    const candidates = [data?.extensions?.world, character?.extensions?.world, data?.world, character?.world].flatMap(value => Array.isArray(value) ? value : [value]);
    return [...new Set(candidates.map(value => String(value || '').trim()).filter(value => value && (world_names || []).includes(value)))];
}

function currentEmbeddedWorldbooks() {
    const ctx = context();
    const character = ctx?.characters?.[ctx?.characterId];
    const data = character?.data || character || {};
    const candidates = [data?.character_book, data?.data?.character_book, character?.character_book, ctx?.character?.data?.character_book];
    return candidates.filter(book => book && (Array.isArray(book.entries) || book.entries));
}

async function currentWorldbookRouteCatalog() {
    const books = currentEmbeddedWorldbooks().map(book => ({ name: book.name || '当前角色卡世界书', data: book }));
    for (const bookName of currentLinkedWorldbooks()) {
        try {
            books.push({ name: bookName, data: await loadWorldInfo(bookName) });
        } catch (error) {
            console.warn(`[${MODULE_NAME}] 读取世界书线路失败：${bookName}`, error);
        }
    }
    return extractWorldbookRouteCatalog(books);
}

function schemaWithRouteCatalog(schema, catalog, batch = false) {
    const copy = JSON.parse(JSON.stringify(schema));
    const labels = worldbookRouteLabels(catalog);
    const allowed = labels.length ? labels : ['未分类线'];
    const routeSchema = batch
        ? copy?.value?.properties?.entries?.items?.properties?.route
        : copy?.value?.properties?.route;
    if (routeSchema) routeSchema.enum = allowed;
    return copy;
}

async function renderEntryDialogOptions() {
    const list = field('status-atelier-entry-dialog-list');
    const book = field('status-atelier-entry-dialog-book')?.value;
    list.replaceChildren();
    if (!book) {
        list.append(makeElement('p', 'status-atelier-empty', '先选择一本世界书。'));
        return;
    }
    const worldline = settings().openingHome.worldlines[entryDialogWorldlineIndex];
    if (!worldline) return;
    const data = await loadWorldInfo(book);
    const entries = Object.values(data?.entries || {}).sort((a, b) => Number(a.uid) - Number(b.uid));
    entries.forEach(entry => {
        const label = makeElement('label', 'status-atelier-entry-option');
        const checkbox = makeElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = String(entry.uid);
        checkbox.dataset.entryTitle = entry.comment || entry.key?.join?.(', ') || `UID ${entry.uid}`;
        checkbox.checked = worldline.entries.some(item => item.book === book && Number(item.uid) === Number(entry.uid));
        label.append(checkbox, makeElement('b', '', `UID ${entry.uid}`), makeElement('span', '', checkbox.dataset.entryTitle));
        list.append(label);
    });
    if (!entries.length) list.append(makeElement('p', 'status-atelier-empty', '这本世界书没有条目。'));
}

async function openEntryDialog(worldlineIndex) {
    entryDialogWorldlineIndex = worldlineIndex;
    const dialog = field('status-atelier-entry-dialog');
    const book = field('status-atelier-entry-dialog-book');
    book.replaceChildren();
    const blank = makeElement('option', '', '选择世界书');
    blank.value = '';
    book.append(blank);
    const linked = currentLinkedWorldbooks();
    (world_names || []).forEach(worldName => {
        const option = makeElement('option', '', linked.includes(worldName) ? `当前角色卡 · ${worldName}` : worldName);
        option.value = worldName;
        book.append(option);
    });
    book.value = linked[0] || '';
    await renderEntryDialogOptions();
    dialog.showModal();
}

function closeEntryDialog() {
    field('status-atelier-entry-dialog')?.close();
    entryDialogWorldlineIndex = null;
}

function confirmEntryDialog() {
    const worldline = settings().openingHome.worldlines[entryDialogWorldlineIndex];
    const book = field('status-atelier-entry-dialog-book')?.value;
    if (!worldline || !book) return notify('warning', '请先选择世界书');
    field('status-atelier-entry-dialog-list').querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        const uid = Number(checkbox.value);
        if (!worldline.entries.some(item => item.book === book && Number(item.uid) === uid)) {
            worldline.entries.push({ book, uid, title: checkbox.dataset.entryTitle || `UID ${uid}` });
        }
    });
    closeEntryDialog();
    renderOpeningWorldlines();
    saveSettingsSoon();
}

function renderOpeningWorldlines() {
    const host = field('status-atelier-opening-worldline-list');
    if (!host) return;
    host.replaceChildren();
    const lines = settings().openingHome.worldlines;
    const clearButton = field('status-atelier-opening-clear-worldlines');
    if (clearButton) clearButton.hidden = !lines.length;
    if (!lines.length) {
        host.append(makeElement('p', 'status-atelier-empty', '没有世界线。主页只显示作品简介和额外问候语目录。'));
        renderOpeningHomeEntries();
        return;
    }
    lines.forEach((worldline, index) => {
        worldline.entries ??= [];
        const row = makeElement('article', 'status-atelier-opening-worldline');
        const main = makeElement('div', 'status-atelier-worldline-main');
        const name = makeElement('input', 'text_pole');
        name.value = worldline.name;
        name.placeholder = '世界线名称';
        name.maxLength = 80;
        const description = makeElement('textarea', 'text_pole');
        description.value = worldline.description || '';
        description.placeholder = '介绍这条路线讲什么、适合怎样阅读。';
        description.maxLength = 600;
        const actions = makeElement('div', 'status-atelier-worldline-actions');
        const pick = makeElement('button', 'menu_button', '选择条目');
        const remove = makeElement('button', 'menu_button', '删除');
        pick.type = remove.type = 'button';
        pick.addEventListener('click', () => openEntryDialog(index).catch(error => notify('error', error?.message || '读取世界书条目失败')));
        remove.addEventListener('click', () => { lines.splice(index, 1); renderOpeningWorldlines(); saveSettingsSoon(); });
        actions.append(pick, remove);
        name.addEventListener('input', () => { worldline.name = name.value; renderOpeningHomeEntries(); saveSettingsSoon(); });
        description.addEventListener('input', () => { worldline.description = description.value; updateOpeningHomePreview(); saveSettingsSoon(); });
        main.append(name, description, actions);
        const chips = makeElement('div', 'status-atelier-opening-worldline-chips');
        worldline.entries.forEach((binding, bindingIndex) => {
            const chip = makeElement('button', 'status-atelier-binding-chip', `${binding.book} · UID ${binding.uid} · ${binding.title}  ×`);
            chip.type = 'button';
            chip.title = '点击取消绑定';
            chip.addEventListener('click', () => { worldline.entries.splice(bindingIndex, 1); renderOpeningWorldlines(); saveSettingsSoon(); });
            chips.append(chip);
        });
        if (!worldline.entries.length) chips.append(makeElement('small', 'status-atelier-hint', '尚未绑定条目；可绑定多个世界书中的多个 UID。'));
        row.append(main, chips);
        host.append(row);
    });
    renderOpeningHomeEntries();
}

function renderOpeningHomeEntries() {
    const host = field('status-atelier-opening-entry-list');
    if (!host) return;
    host.replaceChildren();
    settings().openingHome.entries.forEach((entry, index) => {
        const card = makeElement('article', 'status-atelier-opening-entry-editor');
        card.append(makeElement('span', 'status-atelier-opening-entry-number', String(index + 1).padStart(2, '0')));
        const title = makeElement('input', 'text_pole status-atelier-entry-title');
        title.value = entry.title;
        title.placeholder = '标题';
        title.dataset.openingEntryKey = 'title';
        title.dataset.openingEntryIndex = String(index);
        const route = makeElement('input', 'text_pole status-atelier-entry-route');
        route.value = entry.route || '';
        route.placeholder = '线路标签（如：密室线）';
        route.maxLength = 10;
        route.dataset.openingEntryKey = 'route';
        route.dataset.openingEntryIndex = String(index);
        const summary = makeElement('input', 'text_pole status-atelier-entry-summary');
        summary.value = entry.summary;
        summary.placeholder = '简介';
        summary.dataset.openingEntryKey = 'summary';
        summary.dataset.openingEntryIndex = String(index);
        const worldline = openingWorldlineSelect(entry.worldlineId, index).querySelector('select');
        worldline.classList.add('status-atelier-entry-worldline');
        const regenerate = makeElement('button', 'menu_button status-atelier-entry-regenerate', 'AI');
        regenerate.type = 'button';
        regenerate.title = '重新生成本条标题、线路标签与简介';
        regenerate.addEventListener('click', async () => {
            regenerate.disabled = true;
            try { await regenerateOpeningEntry(index); }
            catch (error) { notify('error', error?.message || '生成标题与简介失败'); }
            finally { regenerate.disabled = false; }
        });
        card.append(title, route, summary, worldline, regenerate);
        host.append(card);
    });
    if (!host.children.length) {
        host.append(makeElement('p', 'status-atelier-empty', '还没有读取额外问候语。主开场白会留给作品主页。'));
    }
    updateOpeningHomePreview();
}

function updateOpeningEntry(control) {
    const index = Number(control.dataset.openingEntryIndex);
    const key = control.dataset.openingEntryKey;
    const entries = settings().openingHome.entries;
    if (!Number.isInteger(index) || !entries[index] || !key) return;
    entries[index][key] = key === 'target' ? Math.max(1, Math.trunc(Number(control.value) || 1)) : control.value;
    updateOpeningHomePreview();
    saveSettingsSoon();
}

function readSettingsControl(control) {
    const key = SETTING_FIELDS[control.id];
    if (!key) return;
    settings()[key] = control.type === 'checkbox' ? control.checked : control.value;
    if (!['promptEnabled', 'installScope'].includes(key)) {
        settings().preset = 'custom';
        field('status-atelier-preset').value = 'custom';
    }
    updatePrompt();
    updatePreview();
    saveSettingsSoon();
}

function previewValue(fieldDefinition) {
    if (fieldDefinition.kind === 'progress') return 'AI动态数值';
    if (fieldDefinition.kind === 'currency') return 'AI动态金额';
    if (fieldDefinition.kind === 'long') return '这里显示 AI 根据当前剧情生成的长文本。';
    return 'AI动态填写';
}

function appendPreviewField(host, definition, value, shared = false) {
    const item = makeElement('div', shared ? 'status-atelier-preview-shared-item' : 'status-atelier-preview-field');
    item.dataset.kind = definition.kind;
    item.append(
        makeElement('span', 'status-atelier-preview-label', definition.label),
        makeElement('span', 'status-atelier-preview-value', value),
    );
    if (definition.kind === 'progress') {
        const meter = makeElement('span', 'status-atelier-preview-meter');
        meter.append(makeElement('i'));
        item.append(meter);
    }
    host.append(item);
}

function updatePreview() {
    const host = field('status-atelier-preview');
    if (!host) return;
    const { rule, shared, pages } = makePreviewRecords(settings());
    const root = makeElement('section', 'status-atelier-rule-preview');
    root.dataset.theme = rule.theme;
    root.dataset.layout = rule.layout;

    const chrome = makeElement('div', 'status-atelier-preview-chrome');
    chrome.append(
        makeElement('span', 'status-atelier-preview-glyph', rule.glyph),
        makeElement('span', 'status-atelier-preview-style-name', rule.styleName),
    );
    root.append(chrome);

    const header = makeElement('header', 'status-atelier-rule-preview-header');
    const heading = makeElement('div');
    heading.append(
        makeElement('h3', 'status-atelier-rule-preview-title', rule.title),
        makeElement('p', 'status-atelier-rule-preview-subtitle', rule.subtitle),
    );
    header.append(heading, makeElement('span', 'status-atelier-preview-dynamic-badge', '动态数据'));
    root.append(header);

    const body = makeElement('div', 'status-atelier-rule-preview-body');
    if (rule.sharedFields.length) {
        const sharedHost = makeElement('div', 'status-atelier-preview-shared');
        rule.sharedFields.forEach((definition, index) => appendPreviewField(sharedHost, definition, shared[index], true));
        body.append(sharedHost);
    }

    const tabs = makeElement('div', 'status-atelier-preview-tabs');
    const pageHost = makeElement('div', 'status-atelier-preview-fields');
    const showPage = index => {
        pageHost.replaceChildren();
        rule.pageFields.forEach((definition, fieldIndex) => {
            appendPreviewField(pageHost, definition, pages[index]?.values[fieldIndex] || previewValue(definition));
        });
        [...tabs.children].forEach((button, buttonIndex) => button.classList.toggle('is-active', buttonIndex === index));
    };
    pages.forEach(({ page }, index) => {
        const button = makeElement('button', 'status-atelier-preview-tab', page.label);
        button.type = 'button';
        button.addEventListener('click', () => showPage(index));
        tabs.append(button);
    });
    if (pages.length > 1) body.append(tabs);
    body.append(pageHost);
    root.append(body);
    host.replaceChildren(root);
    showPage(0);
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

function downloadJson(fileName, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.append(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
}

function safeFileName(value) {
    return String(value || 'zeya-status').replace(/[\\/:*?"<>|\x00-\x1f]/g, '_').trim() || 'zeya-status';
}

function downloadRegex() {
    const script = buildRegexScript(settings());
    downloadJson(`regex-${safeFileName(settings().ruleName)}.json`, script);
    notify('success', '正则 JSON 已生成；里面没有写死剧情数值');
}

function downloadWorldbook() {
    downloadJson(`世界书-${safeFileName(settings().ruleName)}.json`, buildWorldbookJson(settings()));
    notify('success', '世界书 JSON 已生成；导入后会要求 AI 每轮动态填写状态');
}

async function installGeneratedRegex(script, requestedScope = settings().installScope) {
    const type = requestedScope === 'global' ? SCRIPT_TYPES.GLOBAL : SCRIPT_TYPES.SCOPED;
    const ctx = context();
    if (type === SCRIPT_TYPES.SCOPED && (ctx?.characterId === undefined || ctx?.characterId === null || ctx?.groupId)) {
        throw new Error('请先打开一个单人角色聊天，再安装到当前角色');
    }

    const scripts = [...getScriptsByType(type)];
    const existingIndex = scripts.findIndex(item => item.id === script.id || item.scriptName === script.scriptName);
    if (existingIndex >= 0) scripts[existingIndex] = script;
    else scripts.push(script);
    await saveScriptsByType(scripts, type);

    if (type === SCRIPT_TYPES.SCOPED) {
        allowScopedScripts(ctx?.characters?.[ctx.characterId]);
    }
    notify('success', `${existingIndex >= 0 ? '已更新' : '已安装'}正则：${script.scriptName}`);
}

async function installRegex(scope) {
    await installGeneratedRegex(buildRegexScript(settings()), scope);
}

async function installOpeningHomeRegex(scope) {
    await installGeneratedRegex(buildOpeningHomeRegex(settings().openingHome), scope);
}

async function runInstallButton(button, installer, scope, errorMessage) {
    button.disabled = true;
    try {
        settings().installScope = scope;
        await installer(scope);
        saveSettingsSoon();
    } catch (error) {
        notify('error', error?.message || errorMessage);
    } finally {
        button.disabled = false;
    }
}

function exportProfile() {
    const exported = clone(settings());
    delete exported.openingNotes;
    if (exported.openingSummary) delete exported.openingSummary.apiKey;
    downloadJson('zeya-regex-status-profile.json', { format: 'zeya-regex-status-profile', version: 2, settings: exported });
}

async function importProfile(fileToImport) {
    const data = JSON.parse(await fileToImport.text());
    if (data?.format !== 'zeya-regex-status-profile' || !data.settings || typeof data.settings !== 'object') {
        throw new Error('这不是久一正则状态工坊配置');
    }
    const notes = settings().openingNotes;
    const apiKey = settings().openingSummary?.apiKey || '';
    const stored = settings();
    Object.assign(stored, clone(DEFAULT_SETTINGS), data.settings, { openingNotes: notes, preset: 'custom' });
    stored.openingHome = normalizeOpeningHomeSettings(stored.openingHome);
    stored.openingHomeSchemaVersion = OPENING_HOME_SCHEMA_VERSION;
    stored.openingSummary ??= clone(DEFAULT_SETTINGS.openingSummary);
    stored.openingSummary.apiKey = apiKey;
    loadSettingsUI();
    updatePrompt();
    updatePreview();
    saveSettingsSoon();
}

function characterStorageKey(ctx = context()) {
    if (!ctx || ctx.groupId || ctx.characterId === undefined || ctx.characterId === null) return '';
    const character = ctx.characters?.[ctx.characterId];
    if (!character) return '';
    return `character:${character.avatar || character.name || ctx.characterId}`;
}

function parseGreetingMetadata(raw) {
    const source = String(raw || '');
    const title = source.match(/<!--\s*(?:title|标题)\s*[:：]\s*([\s\S]*?)-->/i)?.[1]?.trim() || '';
    const route = source.match(/<!--\s*(?:route|line|路线|线路)\s*[:：]\s*([\s\S]*?)-->/i)?.[1]?.trim() || '';
    const summary = source.match(/<!--\s*(?:desc|description|summary|简介)\s*[:：]\s*([\s\S]*?)-->/i)?.[1]?.trim() || '';
    return { title, route, summary };
}

function alternateGreetingData() {
    const ctx = context();
    const key = characterStorageKey(ctx);
    const character = ctx?.characters?.[ctx?.characterId];
    const data = character?.data || character || {};
    const rawEntries = [
        data?.alternate_greetings,
        data?.data?.alternate_greetings,
        character?.alternate_greetings,
        ctx?.character?.data?.alternate_greetings,
        ctx?.character?.alternate_greetings,
    ].find(Array.isArray) || [];
    const notes = settings().openingNotes[key] || {};
    const entries = usableGreetingRecords(rawEntries)
        .map(({ raw, sourceIndex, preview }, index) => {
            const saved = notes[sourceIndex] || notes[index] || {};
            const metadata = parseGreetingMetadata(raw);
            return {
                index,
                sourceIndex,
                raw: String(raw || ''),
                title: saved.title || metadata.title,
                route: saved.route || metadata.route,
                summary: saved.summary || metadata.summary,
                preview: preview.length > 220 ? `${preview.slice(0, 220)}…` : preview,
                target: sourceIndex + 2,
                hasMetadata: Boolean(metadata.title && metadata.route && metadata.summary),
            };
        });
    return { key, entries };
}

function greetingData() {
    const data = alternateGreetingData();
    const current = Math.max(0, Number(context()?.chat?.[0]?.swipe_id ?? 0) - 1);
    return { ...data, current };
}

async function generateWithCurrentPreset(prompt, jsonSchema = null) {
    const ctx = context();
    const rawGenerator = ctx?.generateRaw;
    const quietGenerator = ctx?.generateQuietPrompt;
    if (typeof rawGenerator !== 'function' && typeof quietGenerator !== 'function') {
        throw new Error('当前酒馆版本没有提供携带当前模型与预设的后台生成接口');
    }
    let response;
    try {
        if (typeof rawGenerator === 'function') {
            // Keep the active model, provider, proxy and generation preset, but
            // send only the directory task. A quiet generation also injects the
            // full character, chat, World Info and Author's Note; large cards can
            // exhaust a reasoning model before it produces visible JSON.
            response = await rawGenerator({
                prompt: [{ role: 'user', content: prompt }],
                responseLength: SUMMARY_RESPONSE_LENGTH,
                trimNames: false,
                jsonSchema,
            });
        } else {
            // Compatibility fallback for older SillyTavern builds.
            response = await quietGenerator({
                quietPrompt: prompt,
                quietToLoud: false,
                skipWIAN: true,
                responseLength: SUMMARY_RESPONSE_LENGTH,
                removeReasoning: true,
                jsonSchema,
            });
        }
    } catch (error) {
        const friendlyMessage = generationErrorMessage(error);
        if (friendlyMessage) throw new Error(friendlyMessage);
        throw error;
    }
    const unwrapped = responseText(response).trim();
    if (unwrapped) return unwrapped;
    throw new Error('酒馆已经发出请求，但模型没有给出可用正文；请检查当前预设的最大回复长度与推理设置');
}

function externalApiBases(value) {
    const endpoint = String(value || '').trim().replace(/\/+$/, '');
    if (!endpoint) return [];
    if (/\/v1$/i.test(endpoint)) return [endpoint];
    return [`${endpoint}/v1`, endpoint];
}

async function requestExternalSummary(prompt, maxTokens) {
    const config = settings().openingSummary;
    if (!config.endpoint || !config.model) throw new Error('请填写额外 API 地址和模型名称');
    let lastError;
    for (const base of externalApiBases(config.endpoint)) {
        const response = await fetch(`${base}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}) },
            body: JSON.stringify({ model: config.model, messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: Math.max(4096, maxTokens) }),
        });
        if (response.ok) {
            const responseData = await response.json();
            const content = responseText(responseData);
            if (!String(content).trim()) throw new Error('API 已连通，但模型只返回了空正文；请提高模型回复上限或换用非纯推理模型');
            return content;
        }
        lastError = new Error(`额外 API 请求失败：${response.status}`);
        if (response.status !== 404) break;
    }
    throw lastError || new Error('额外 API 请求失败');
}

async function summarizeGreeting(raw, entry, index) {
    const config = settings().openingSummary;
    if (config.source === 'manual') return { title: entry.title, route: entry.route, summary: entry.summary };
    const routeCatalog = await currentWorldbookRouteCatalog();
    const prompt = `你是互动故事的目录编辑。请阅读下面的开场白，只输出一个 JSON 对象：{"title":"短标题","route":"世界书线路名","summary":"路线简介"}。\n\n世界书线路：\n${routeCatalogPrompt(routeCatalog)}\n\n写作标准：\n1. title 是 4 到 12 个汉字的文学化短标题，只概括这一开局的基调或核心事件，禁止照抄正文长句；\n2. route 只能选择上面世界书中已经存在的线路名，同一线路允许对应多条开场；\n3. summary 只写 28 到 50 个汉字，用一句话说明“谁处于什么情境、正在做什么、发生了什么”，不抄原文，不剧透后续；\n4. 不要 Markdown，不要引号外的解释。\n\n开场白：\n${String(raw).slice(0, 6000)}`;
    let generated;
    if (config.source === 'main') {
        const response = await generateWithCurrentPreset(prompt, schemaWithRouteCatalog(SINGLE_SUMMARY_JSON_SCHEMA, routeCatalog));
        generated = parseSummaryResponse(response, entry.title || `未命名开局 ${index + 1}`, entry.summary, entry.route);
    } else {
        generated = parseSummaryResponse(await requestExternalSummary(prompt, 4096), entry.title || `未命名开局 ${index + 1}`, entry.summary, entry.route);
    }
    generated.route = constrainRouteToCatalog(generated.route, routeCatalog) || '未分类线';
    return generated;
}

function needsGeneratedWorkIntro() {
    const intro = String(settings().openingHome.intro || '').trim();
    return !intro || intro === OPENING_HOME_DEFAULTS.intro;
}

function fallbackGreetingMetadata(entry) {
    const number = (entry?.index ?? 0) + 1;
    return {
        title: `未命名开局 ${number}`,
        route: '未分类线',
        summary: 'AI 未返回有效路线简介，请重写本条或手动填写。',
    };
}

async function summarizeGreetingsBatch(entries, { overwrite = false } = {}) {
    const config = settings().openingSummary;
    const routeCatalog = await currentWorldbookRouteCatalog();
    const requested = overwrite ? entries : entries.filter(entry => !entry.title || !entry.route || !entry.summary);
    const makeWorkIntro = overwrite || needsGeneratedWorkIntro();
    if (!requested.length && !makeWorkIntro) return { entries: new Map(), workIntro: '' };
    const sourceEntries = makeWorkIntro ? entries : requested;
    const chunks = [];
    for (let index = 0; index < sourceEntries.length; index += 4) chunks.push(sourceEntries.slice(index, index + 4));
    const parsed = { entries: new Map(), workIntro: '' };
    const warnings = [];
    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
        const chunk = chunks[chunkIndex];
        const includeIntro = makeWorkIntro && chunkIndex === 0;
        const source = chunk.map(entry => `--- 额外问候语 #${entry.index + 1} ---\n${String(entry.raw).slice(0, 900)}`).join('\n\n');
        const introContext = includeIntro
            ? `\n\n全篇开局线索（只用于作品总简介）：\n${sourceEntries.map(entry => `#${entry.index + 1} ${String(entry.raw).slice(0, 260)}`).join('\n').slice(0, 2600)}`
            : '';
        const outputExample = includeIntro
            ? '{"workIntro":"作品总简介","entries":[{"index":1,"title":"短标题","route":"世界书线路名","summary":"路线简介"}]}'
            : '{"entries":[{"index":1,"title":"短标题","route":"世界书线路名","summary":"路线简介"}]}';
        const introRule = includeIntro
            ? '1. workIntro 为 60 到 100 个汉字，只介绍核心背景、主要人物关系与互动故事的总体开局，不堆砌使用说明，不照抄任一开场正文；\n'
            : '';
        const prompt = `你是互动故事的目录编辑。请制作${includeIntro ? '“作品简介 + ' : '“'}开局路线目录”。\n\n严格只输出 JSON，不要 Markdown，不要思考过程：\n${outputExample}\n\n世界书线路：\n${routeCatalogPrompt(routeCatalog)}\n\n写作标准：\n${introRule}2. title 为 4 到 12 个汉字的文学化短标题，体现该开局的基调或核心事件，禁止把正文第一句截断后当标题；\n3. route 只能逐字选择上面世界书中已经存在的线路名；同一线路允许对应多条开场，禁止自创或为了避免重复而改名；\n4. summary 为 28 到 50 个汉字的一句话，明确写出“谁处于什么情境、正在做什么、发生了什么”，只介绍本开局，不剧透后续；\n5. 本批每个输入编号都必须返回，index 必须使用输入中的数字；短标题不能重复。\n\n${source}${introContext}`;
        let responseText = '';
        try {
            if (config.source === 'main') {
                responseText = await generateWithCurrentPreset(prompt, schemaWithRouteCatalog(includeIntro ? BATCH_SUMMARY_JSON_SCHEMA : ENTRY_BATCH_JSON_SCHEMA, routeCatalog, true));
            } else {
                responseText = await requestExternalSummary(prompt, 4096);
            }
        } catch (error) {
            warnings.push(generationErrorMessage(error) || error?.message || `第 ${chunkIndex + 1} 批没有返回可用正文`);
        }
        if (!responseText) continue;
        try {
            const chunkParsed = parseBatchSummaryResponse(responseText, chunk);
            if (!parsed.workIntro && chunkParsed.workIntro) parsed.workIntro = chunkParsed.workIntro;
            chunkParsed.entries.forEach((value, key) => {
                value.route = constrainRouteToCatalog(value.route, routeCatalog) || '未分类线';
                parsed.entries.set(key, value);
            });
        } catch (error) {
            warnings.push(error?.message || `第 ${chunkIndex + 1} 批返回格式无法识别`);
        }
    }
    const missing = requested.filter(entry => !parsed.entries.has(entry.index));
    missing.forEach(entry => parsed.entries.set(entry.index, fallbackGreetingMetadata(entry)));
    return { ...parsed, routeLabels: worldbookRouteLabels(routeCatalog), fallbackCount: missing.length, formatWarning: warnings.join('；') };
}

async function readGreetingsIntoOpeningHome({ overwrite = false } = {}) {
    const data = alternateGreetingData();
    if (!data.entries.length) throw new Error('当前角色卡没有额外问候语；主开场白会保留给作品主页');
    const previousEntries = settings().openingHome.entries || [];
    const generated = data.entries.map((entry, index) => {
        const previous = previousEntries[index] || {};
        return {
            number: String(index + 1).padStart(2, '0'),
            title: overwrite ? `未命名开局 ${index + 1}` : entry.title || previous.title || `未命名开局 ${index + 1}`,
            route: overwrite ? '' : entry.route || previous.route || '',
            summary: overwrite ? '等待 AI 重新生成。' : entry.summary || previous.summary || '等待 AI 补全。',
            target: entry.target,
            worldlineId: previous.worldlineId || '',
        };
    });
    settings().openingHome.entries = generated;
    renderOpeningHomeEntries();
    renderGreetingList();
    saveSettingsSoon();

    const batch = await summarizeGreetingsBatch(data.entries, { overwrite });
    if (batch.workIntro && (overwrite || needsGeneratedWorkIntro())) {
        settings().openingHome.intro = batch.workIntro;
        const introControl = field('status-atelier-opening-home-intro');
        if (introControl) introControl.value = batch.workIntro;
    }
    for (let index = 0; index < data.entries.length; index += 1) {
        const entry = data.entries[index];
        const ai = batch.entries.get(index);
        generated[index].title = overwrite ? ai?.title || generated[index].title : entry.title || ai?.title || generated[index].title;
        generated[index].route = overwrite ? ai?.route || generated[index].route : entry.route || ai?.route || generated[index].route;
        generated[index].summary = overwrite ? ai?.summary || generated[index].summary : entry.summary || ai?.summary || generated[index].summary;
        if (data.key) {
            settings().openingNotes[data.key] ??= {};
            settings().openingNotes[data.key][entry.sourceIndex ?? index] = { title: generated[index].title, route: generated[index].route, summary: generated[index].summary };
        }
        renderOpeningHomeEntries();
        renderGreetingList();
    }
    saveSettingsSoon();
    const fallbackNotice = batch.fallbackCount ? `；其中 ${batch.fallbackCount} 条未取得有效 AI 目录，已保留为明确的待编辑项` : '';
    const routeNotice = batch.routeLabels?.length ? `；线路取自世界书：${batch.routeLabels.join('、')}` : '；世界书中未识别到线路条目';
    notify(batch.fallbackCount ? 'warning' : 'success', `已读取 ${data.entries.length} 条额外问候语${batch.entries.size ? `，生成 ${batch.entries.size} 组标题、线路标签与简介` : ''}${batch.workIntro ? '，作品简介也已生成' : ''}${routeNotice}${fallbackNotice}`);
    return batch;
}

async function regenerateOpeningEntry(index) {
    const source = alternateGreetingData().entries[index];
    const target = settings().openingHome.entries[index];
    if (!source || !target) throw new Error('找不到对应的额外问候语，请重新读取');
    const generated = await summarizeGreeting(source.raw, { title: `未命名开局 ${index + 1}`, route: target.route || '未分类线', summary: '' }, index);
    target.title = generated.title;
    target.route = generated.route;
    target.summary = generated.summary;
    renderOpeningHomeEntries();
    saveSettingsSoon();
    const data = alternateGreetingData();
    saveGreetingNote(data.key, source.sourceIndex ?? index, { title: target.title, route: target.route, summary: target.summary });
    notify('success', `已重新生成第 ${index + 1} 条标题、线路标签与简介`);
}

function buildGreetingModal() {
    greetingModal = document.createElement('div');
    greetingModal.id = 'status-atelier-modal';
    greetingModal.setAttribute('aria-hidden', 'true');
    greetingModal.innerHTML = `
        <div class="status-atelier-modal-backdrop" data-status-atelier-close></div>
        <section class="status-atelier-dialog" role="dialog" aria-modal="true" aria-labelledby="status-atelier-dialog-title">
            <header class="status-atelier-dialog-header">
                <h3 id="status-atelier-dialog-title">读取当前角色卡的额外问候语</h3>
                <button type="button" class="menu_button" data-status-atelier-close aria-label="关闭">×</button>
            </header>
            <div class="status-atelier-dialog-body">
                <details class="status-atelier-dialog-note">
                    <summary>读取说明</summary>
                    <p>不需要填写角色卡路径。插件自动定位酒馆当前打开的单人角色聊天；主开场白保留给作品主页，这里只读取该角色卡的额外问候语。有标题与简介注释就直接使用，没有才调用工坊选择的 AI。</p>
                </details>
                <div class="status-atelier-greeting-read-status" role="status" aria-live="polite"></div>
                <div class="status-atelier-greeting-list"></div>
            </div>
            <footer class="status-atelier-dialog-footer">
                <button type="button" class="menu_button" id="status-atelier-read-current-card">补全缺失项</button>
                <button type="button" class="menu_button status-atelier-regenerate-all" id="status-atelier-regenerate-all">全部重新生成</button>
                <button type="button" class="menu_button" id="status-atelier-modal-copy-home">复制主页模板</button>
                <button type="button" class="menu_button" id="status-atelier-modal-download-regex">下载正则</button>
                <button type="button" class="menu_button" id="status-atelier-open-full-workbench">更多样式与世界线</button>
                <button type="button" class="menu_button" data-status-atelier-close>完成</button>
            </footer>
        </section>`;
    greetingModal.querySelectorAll('[data-status-atelier-close]').forEach(button => button.addEventListener('click', closeGreetingModal));
    greetingModal.querySelector('#status-atelier-read-current-card').addEventListener('click', event => {
        refreshGreetingModal(event.currentTarget, false);
    });
    greetingModal.querySelector('#status-atelier-regenerate-all').addEventListener('click', event => {
        refreshGreetingModal(event.currentTarget, true);
    });
    greetingModal.querySelector('#status-atelier-modal-copy-home').addEventListener('click', async () => {
        await copyText(buildOpeningHomeBlock(settings().openingHome));
        notify('success', '已复制包含当前填写内容的主页模板');
    });
    greetingModal.querySelector('#status-atelier-modal-download-regex').addEventListener('click', () => {
        downloadJson('regex-久一-通用开场白主页.json', buildOpeningHomeRegex(settings().openingHome));
        notify('success', '已下载包含当前填写内容的主页正则');
    });
    greetingModal.querySelector('#status-atelier-open-full-workbench').addEventListener('click', openFullWorkbench);
    document.body.append(greetingModal);
}

function openFullWorkbench() {
    closeGreetingModal();
    const extensionsDrawer = document.querySelector('#extensions-settings-button');
    const drawerContent = document.querySelector('#rm_extensions_block');
    if (drawerContent?.classList.contains('closedDrawer')) {
        extensionsDrawer?.querySelector(':scope > .drawer-toggle')?.click();
    }
    setTimeout(() => {
        setWorkspace('opening');
        const toggle = settingsRoot?.querySelector('.inline-drawer-toggle');
        const content = settingsRoot?.querySelector('.inline-drawer-content');
        if (content && getComputedStyle(content).display === 'none') toggle?.click();
        settingsRoot?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 180);
}

function saveGreetingNote(key, index, values) {
    if (!key) return;
    const stored = settings();
    stored.openingNotes[key] ??= {};
    stored.openingNotes[key][index] = Object.fromEntries(
        Object.entries(values).map(([name, value]) => [name, String(value).trim()]),
    );
    saveSettingsSoon();
}

function labeledInput(labelText, value, { multiline = false, maxLength = 160 } = {}) {
    const label = makeElement('label', '', labelText);
    const input = makeElement(multiline ? 'textarea' : 'input', 'text_pole');
    if (!multiline) input.type = 'text';
    input.maxLength = maxLength;
    input.value = value;
    label.append(input);
    return { label, input };
}

function updateOpeningHomeContent(key, value) {
    settings().openingHome[key] = value;
    const controlId = Object.entries(OPENING_HOME_FIELDS).find(([, fieldKey]) => fieldKey === key)?.[0];
    const control = controlId ? field(controlId) : null;
    if (control && control.value !== value) control.value = value;
    updateOpeningHomePreview();
    saveSettingsSoon();
}

function buildGreetingHomeQuickEditor() {
    const panel = makeElement('details', 'status-atelier-dialog-note status-atelier-home-quick-editor');
    panel.open = true;
    panel.append(makeElement('summary', '', '主页资料（可直接编辑）'));
    const grid = makeElement('div', 'status-atelier-home-quick-grid');
    const definitions = [
        ['主页标题', 'title', false, 80],
        ['小副标题', 'subtitle', false, 100],
        ['作者', 'author', false, 80],
        ['推荐模型（每行一个）', 'model', true, 400],
        ['推荐预设（每行一个）', 'preset', true, 400],
        ['作品总简介', 'intro', true, 1600],
    ];
    definitions.forEach(([labelText, key, multiline, maxLength]) => {
        const { label, input } = labeledInput(labelText, settings().openingHome[key] || '', { multiline, maxLength });
        label.classList.add(`status-atelier-home-quick-${key}`);
        input.addEventListener('input', () => updateOpeningHomeContent(key, input.value));
        grid.append(label);
    });
    panel.append(grid);
    return panel;
}

function renderGreetingList() {
    if (!greetingModal) return;
    const list = greetingModal.querySelector('.status-atelier-greeting-list');
    const status = greetingModal.querySelector('.status-atelier-greeting-read-status');
    const data = greetingData();
    const ctx = context();
    const character = ctx?.characters?.[ctx?.characterId];
    const characterName = character?.name || character?.data?.name || '当前角色卡';
    list.replaceChildren();
    list.append(buildGreetingHomeQuickEditor());
    if (!data.entries.length) {
        status.textContent = `已定位当前角色卡：${characterName}。但没有读取到额外问候语；请确认当前是单人角色聊天，并已在角色卡“额外问候语”中添加内容。`;
        list.append(makeElement('div', 'status-atelier-empty', '主开场白不会计入目录；需要至少一条额外问候语。'));
        return;
    }
    status.textContent = `已定位当前角色卡：${characterName}（单人聊天），读取到 ${data.entries.length} 条额外问候语。`;
    data.entries.forEach(entry => {
        const card = makeElement('details', 'status-atelier-greeting-card');
        card.dataset.current = String(entry.index === data.current);
        const generated = settings().openingHome.entries[entry.index];
        const heading = makeElement('summary', 'status-atelier-greeting-card-heading');
        const headingCopy = makeElement('div', 'status-atelier-greeting-heading-copy');
        const headingTitle = makeElement('strong', '', entry.title || generated?.title || `未命名开局 ${entry.index + 1}`);
        const headingRoute = makeElement('small', 'status-atelier-greeting-route', entry.route || generated?.route || '未分类线');
        headingCopy.append(headingTitle, headingRoute);
        const headingState = makeElement('span', '', entry.hasMetadata ? '已有注释' : generated?.summary && !/^等待 AI/.test(generated.summary) ? '已生成' : '待生成');
        heading.append(
            makeElement('b', '', `#${entry.index + 1}`),
            headingCopy,
            headingState,
        );
        const titleField = labeledInput('短标题（4–12字）', entry.title || generated?.title || `未命名开局 ${entry.index + 1}`, { maxLength: 14 });
        const routeField = labeledInput('线路标签（从角色卡世界书读取，如：罪人线）', entry.route || generated?.route || '', { maxLength: 10 });
        const summaryField = labeledInput('路线简介（1句话，谁在做什么、发生了什么）', entry.summary || generated?.summary || '', { multiline: true, maxLength: 56 });
        const fields = makeElement('div', 'status-atelier-greeting-fields');
        fields.append(titleField.label, routeField.label, summaryField.label);
        const actions = makeElement('div', 'status-atelier-greeting-actions');
        const regenerate = makeElement('button', 'menu_button', '让 AI 重写本条');
        regenerate.type = 'button';
        regenerate.addEventListener('click', async () => {
            regenerate.disabled = true;
            try { await regenerateOpeningEntry(entry.index); renderGreetingList(); }
            catch (error) { notify('error', error?.message || '生成标题与简介失败'); }
            finally { regenerate.disabled = false; }
        });
        actions.append(regenerate);
        const updateEntry = () => {
            const target = settings().openingHome.entries[entry.index];
            if (!target) return;
            target.title = titleField.input.value.trim() || `未命名开局 ${entry.index + 1}`;
            target.route = routeField.input.value.trim() || '未分类线';
            target.summary = summaryField.input.value.trim();
            headingTitle.textContent = target.title;
            headingRoute.textContent = target.route;
            headingState.textContent = target.summary ? '已编辑' : '待生成';
            saveGreetingNote(data.key, entry.sourceIndex ?? entry.index, { title: target.title, route: target.route, summary: target.summary });
            renderOpeningHomeEntries();
            saveSettingsSoon();
        };
        titleField.input.addEventListener('input', updateEntry);
        routeField.input.addEventListener('input', updateEntry);
        summaryField.input.addEventListener('input', updateEntry);
        const original = makeElement('details', 'status-atelier-greeting-original');
        original.append(
            makeElement('summary', '', '查看原文预览'),
            makeElement('small', 'status-atelier-greeting-preview', entry.preview || '（空）'),
        );
        card.append(
            heading,
            fields,
            actions,
            original,
        );
        list.append(card);
    });
}

async function refreshGreetingModal(button, overwrite = false) {
    renderGreetingList();
    const status = greetingModal?.querySelector('.status-atelier-greeting-read-status');
    const generationButtons = greetingModal?.querySelectorAll('#status-atelier-read-current-card, #status-atelier-regenerate-all') || [];
    if (!alternateGreetingData().entries.length) {
        await setOpeningReadStatus('失败：当前角色卡没有读取到额外问候语。', 'error', true);
        return;
    }
    generationButtons.forEach(item => { item.disabled = true; });
    const originalLabel = button?.textContent || '';
    if (button) button.textContent = overwrite ? '正在全部重写…' : '正在补全缺失项…';
    const actionText = overwrite ? '覆盖生成全部短标题、线路标签、路线简介与作品简介' : '补全缺少的短标题、线路标签与路线简介';
    if (status) status.textContent = `已读取 ${alternateGreetingData().entries.length} 条，AI 正在${actionText}……`;
    setOpeningReadStatus(`已读取 ${alternateGreetingData().entries.length} 条，AI 正在${actionText}……`, 'loading');
    showOpeningReadProgress(`已读取角色卡内容，正在${actionText}。返回聊天页也可以继续等待。`);
    try {
        const result = await readGreetingsIntoOpeningHome({ overwrite });
        renderGreetingList();
        const fallbackStatus = result?.fallbackCount ? `；其中 ${result.fallbackCount} 条没有取得有效 AI 结果，已标为待编辑` : '';
        await setOpeningReadStatus(`完成：已读取 ${alternateGreetingData().entries.length} 条额外问候语并生成目录资料${fallbackStatus}。`, 'success', true);
    } catch (error) {
        renderGreetingList();
        if (status) status.textContent = error?.message || '读取或补全失败';
        await setOpeningReadStatus(`失败：${error?.message || '读取或补全失败'}`, 'error', true);
        notify('error', error?.message || '读取或补全失败');
    } finally {
        hideOpeningReadProgress();
        generationButtons.forEach(item => { item.disabled = false; });
        if (button) button.textContent = originalLabel;
    }
}

function openGreetingModal() {
    if (!greetingModal) buildGreetingModal();
    renderGreetingList();
    greetingModal.classList.add('status-atelier-modal-open');
    greetingModal.setAttribute('aria-hidden', 'false');
}

function closeGreetingModal() {
    greetingModal?.classList.remove('status-atelier-modal-open');
    greetingModal?.setAttribute('aria-hidden', 'true');
}

function jumpToFirstMessage() {
    document.querySelector('#chat .mes[mesid="0"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function switchGreeting(targetIndex) {
    const ctx = context();
    const message = ctx?.chat?.[0];
    const swipes = message?.swipes;
    if (!ctx?.swipe || !Array.isArray(swipes) || !swipes.length) throw new Error('当前聊天没有可切换的备用开场白');
    const target = Math.max(0, Math.min(swipes.length - 1, Number(targetIndex)));
    let current = Math.max(0, Math.min(swipes.length - 1, Number(message.swipe_id ?? 0)));
    if (current === target) return;
    const direction = target > current ? 'right' : 'left';
    const steps = Math.abs(target - current);
    const messageElement = document.querySelector('#chat .mes[mesid="0"]');
    if (!messageElement) throw new Error('聊天第 1 条消息尚未加载');
    for (let index = 0; index < steps; index += 1) {
        await ctx.swipe[direction].call(messageElement, null, { source: MODULE_NAME, message });
        current = Number(message.swipe_id ?? current);
    }
}

function addExtensionsMenuItem() {
    const menu = document.querySelector('#extensionsMenu');
    if (!menu || document.querySelector('#status-atelier-menu-item')) return;
    const item = makeElement('div', 'list-group-item flex-container flexGap5');
    item.id = 'status-atelier-menu-item';
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', '读取当前角色卡的额外问候语');
    const icon = makeElement('div', 'fa-solid fa-wand-magic-sparkles extensionsMenuExtensionButton');
    icon.setAttribute('aria-hidden', 'true');
    item.append(icon, makeElement('span', '', '读取额外问候语 · 久一'));
    item.addEventListener('click', openGreetingModal);
    item.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openGreetingModal();
        }
    });
    menu.append(item);
}

async function addSettingsPanel() {
    const host = document.querySelector('#extensions_settings2, #extensions_settings');
    if (!host || document.querySelector('#status-atelier-settings')) return false;
    const response = await fetch(new URL('./settings.html', import.meta.url));
    if (!response.ok) throw new Error(`无法读取设置面板：${response.status}`);
    const template = document.createElement('template');
    template.innerHTML = await response.text();
    settingsRoot = template.content.firstElementChild;
    host.append(settingsRoot);

    settingsRoot.querySelectorAll('[data-status-workspace]').forEach(button => button.addEventListener('click', () => setWorkspace(button.dataset.statusWorkspace)));

    field('status-atelier-preset').addEventListener('change', event => {
        if (event.target.value !== 'custom') applyPreset(event.target.value);
    });
    settingsRoot.addEventListener('input', event => readSettingsControl(event.target));
    settingsRoot.addEventListener('input', event => {
        readOpeningHomeControl(event.target);
        readOpeningSummaryControl(event.target);
        updateOpeningEntry(event.target);
    });
    settingsRoot.addEventListener('change', event => {
        if (event.target.id !== 'status-atelier-preset' && event.target.id !== 'status-atelier-import-file') {
            readSettingsControl(event.target);
            readOpeningHomeControl(event.target);
            readOpeningSummaryControl(event.target);
            updateOpeningEntry(event.target);
        }
    });
    settingsRoot.addEventListener('click', event => {
        const paletteButton = event.target.closest('[data-opening-palette]');
        if (paletteButton) {
            const palette = OPENING_PALETTES[paletteButton.dataset.openingPalette];
            if (!palette) return;
            Object.assign(settings().openingHome, palette);
            loadSettingsUI();
            saveSettingsSoon();
            return;
        }
    });
    field('status-atelier-copy-prompt').addEventListener('click', async () => {
        await copyText(buildAiInstruction(settings()));
        notify('success', 'AI 输出规则已复制');
    });
    field('status-atelier-download-regex').addEventListener('click', downloadRegex);
    field('status-atelier-download-worldbook').addEventListener('click', downloadWorldbook);
    field('status-atelier-install-scoped').addEventListener('click', event => runInstallButton(event.currentTarget, installRegex, 'scoped', '安装正则失败'));
    field('status-atelier-install-global').addEventListener('click', event => runInstallButton(event.currentTarget, installRegex, 'global', '安装正则失败'));
    field('status-atelier-export').addEventListener('click', exportProfile);
    field('status-atelier-import').addEventListener('click', () => field('status-atelier-import-file').click());
    field('status-atelier-import-file').addEventListener('change', async event => {
        const fileToImport = event.target.files?.[0];
        event.target.value = '';
        if (!fileToImport) return;
        try {
            await importProfile(fileToImport);
            notify('success', '工坊配置已导入');
        } catch (error) {
            notify('error', error?.message || '导入失败');
        }
    });
    field('status-atelier-reset').addEventListener('click', () => applyPreset(settings().statusTemplate || 'relationship'));
    field('status-atelier-add-field').addEventListener('click', addStatusField);
    field('status-atelier-opening-add-worldline').addEventListener('click', () => {
        appendOpeningWorldline(settings().openingHome);
        renderOpeningWorldlines();
        saveSettingsSoon();
    });
    field('status-atelier-opening-clear-worldlines').addEventListener('click', () => {
        settings().openingHome.worldlines.splice(0);
        settings().openingHome.entries.forEach(entry => { entry.worldlineId = ''; });
        renderOpeningWorldlines();
        saveSettingsSoon();
    });
    field('status-atelier-opening-read-greetings').addEventListener('click', async event => {
        const button = event.currentTarget;
        const originalLabel = button.textContent;
        button.disabled = true;
        button.textContent = '正在读取并生成…';
        const count = alternateGreetingData().entries.length;
        setOpeningReadStatus(count ? `已读取 ${count} 条额外问候语，AI 正在生成标题与简介……` : '正在读取当前角色卡的额外问候语……', 'loading');
        showOpeningReadProgress('已读取角色卡内容，正在生成作品简介、标题和线路简介。返回聊天页也可以继续等待。');
        try {
            await readGreetingsIntoOpeningHome();
            await setOpeningReadStatus(`完成：已读取 ${alternateGreetingData().entries.length} 条额外问候语并生成目录资料。`, 'success', true);
        } catch (error) {
            await setOpeningReadStatus(`失败：${error?.message || '读取开场白失败'}`, 'error', true);
            notify('error', error?.message || '读取开场白失败');
        } finally {
            hideOpeningReadProgress();
            button.disabled = false;
            button.textContent = originalLabel;
        }
    });
    field('status-atelier-entry-dialog-book').addEventListener('change', () => renderEntryDialogOptions().catch(error => notify('error', error?.message || '读取世界书条目失败')));
    field('status-atelier-entry-dialog-close').addEventListener('click', closeEntryDialog);
    field('status-atelier-entry-dialog-cancel').addEventListener('click', closeEntryDialog);
    field('status-atelier-entry-dialog-confirm').addEventListener('click', confirmEntryDialog);
    field('status-atelier-opening-copy-block').addEventListener('click', async () => {
        await copyText(buildOpeningHomeBlock(settings().openingHome));
        notify('success', '开场白主页模板已复制');
    });
    field('status-atelier-opening-download-regex').addEventListener('click', () => {
        downloadJson('regex-久一-通用开场白主页.json', buildOpeningHomeRegex(settings().openingHome));
        notify('success', '开场白主页正则 JSON 已生成');
    });
    field('status-atelier-opening-install-scoped').addEventListener('click', event => runInstallButton(event.currentTarget, installOpeningHomeRegex, 'scoped', '安装开场白主页正则失败'));
    field('status-atelier-opening-install-global').addEventListener('click', event => runInstallButton(event.currentTarget, installOpeningHomeRegex, 'global', '安装开场白主页正则失败'));
    loadSettingsUI();
    updatePreview();
    return true;
}

function bindEvents() {
    const ctx = context();
    const events = ctx?.eventTypes || ctx?.event_types;
    const source = ctx?.eventSource;
    if (!events || !source?.on) return;
    [events.CHAT_CHANGED, events.MESSAGE_SWIPED].filter(Boolean).forEach(eventName => source.on(eventName, () => {
        if (greetingModal?.classList.contains('status-atelier-modal-open')) renderGreetingList();
    }));
}

async function initialize() {
    settings();
    updatePrompt();
    for (let attempt = 0; attempt < 20; attempt += 1) {
        if (await addSettingsPanel()) break;
        await new Promise(resolve => setTimeout(resolve, 250));
    }
    for (let attempt = 0; attempt < 20; attempt += 1) {
        addExtensionsMenuItem();
        if (document.querySelector('#status-atelier-menu-item')) break;
        await new Promise(resolve => setTimeout(resolve, 250));
    }
    console.info(`[久一 正则状态工坊] v${VERSION} 已加载`);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
} else {
    initialize();
}

export { normalizeRule };

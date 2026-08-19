import {
    RULE_PRESETS,
    STATUS_PALETTE_PRESETS,
    STATUS_STYLE_PRESETS,
    STATUS_STRUCTURE_PRESETS,
    STATUS_THEME_CSS,
    STATUS_PHONE_CSS,
    buildAiInstruction,
    buildRegexScript,
    buildWorldbookJson,
    makePreviewRecords,
    normalizePhoneDesktop,
    normalizeRule,
    parseStatusOutput,
    parseFields,
} from './rule-generator.js?v=0.10.0';
import {
    OPENING_HOME_DEFAULTS,
    appendOpeningWorldline,
    buildOpeningHomeBlock,
    buildOpeningHomeRegex,
    normalizeOpeningHomeSettings,
} from './opening-home-generator.js?v=0.10.0';
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
} from './response-parser.js?v=0.10.0';
import {
    constrainRouteToCatalog,
    extractWorldbookRouteCatalog,
    routeCatalogPrompt,
    syncRouteCatalogWorldlines,
    worldbookRouteLabels,
} from './worldbook-routes.js?v=0.10.0';
import {
    entryDialogBindingKey,
    mountAndShowEntryDialog,
    paginateEntryDialogEntries,
} from './entry-dialog.js?v=0.10.0';
import {
    greetingBindingSummary,
    keepOnlyOpenGreetingCard,
    mergeLocalGreetingEntries,
    planOpeningHomeCharacterUpdate,
    shouldReplaceCurrentChatGreeting,
    freshOpeningHomeForCharacter,
    switchOpeningHomeProfile,
} from './greeting-workflow.js?v=0.10.0';
import { buildOpeningOverview, mergeOpeningOverviewMetadata } from './opening-overview.js?v=0.10.0';
import { buildCharacterHomepageContext } from './opening-context.js?v=0.10.0';
import {
    STATUS_WORLDBOOK_ENTRY_ID,
    buildStatusWorldbookName,
    upsertStatusWorldbookData,
} from './status-worldbook.js?v=0.10.0';
import {
    SCRIPT_TYPES,
    allowScopedScripts,
    getScriptsByType,
    saveScriptsByType,
} from '../../regex/engine.js';
import {
    charUpdateAddAuxWorld,
    createNewWorldInfo,
    loadWorldInfo,
    saveWorldInfo,
    selected_world_info,
    world_info,
    world_names,
} from '../../../world-info.js';
import { createOrEditCharacter, getThumbnailUrl, saveSettings, user_avatar } from '../../../../script.js';
import { getCharaFilename } from '../../../utils.js';

const MODULE_NAME = 'status_atelier';
const PROMPT_KEY = 'status_atelier_generated_rule';
const VERSION = '0.10.0';
const OPENING_HOME_SCHEMA_VERSION = 2;

const HOME_TEMPLATES = Object.freeze([
    {
        id: 'classical', name: '01 古典徽章', description: '双层雕花框 · 海军蓝金箔',
        values: { theme: 'classical', font: 'serif', background: '#f5ead7', cardBackground: '#fffaf0', text: '#2f261e', accent: '#914538', secondary: '#7d6a56', introBackground: '#e8e0d0', buttonColor: '#1a3048' },
    },
    {
        id: 'newspaper', name: '03 复古报刊', description: '报头分栏 · 印章与粗细线',
        values: { theme: 'newspaper', font: 'serif', background: '#f3eddc', cardBackground: '#eee4ce', text: '#201d19', accent: '#8d2d23', secondary: '#5a5348', introBackground: '#e1d5b9', buttonColor: '#201d19' },
    },
    {
        id: 'timeline', name: '04 中轴时间线', description: '粉青节点 · 立体柔边卡片',
        values: { theme: 'timeline', font: 'kai', background: '#fffaf1', cardBackground: '#fffaf0', text: '#3c3330', accent: '#b46662', secondary: '#6d9799', introBackground: '#e6efeb', buttonColor: '#6d9799' },
    },
    {
        id: 'minimal', name: '05 构成编辑', description: '米白纸张 · 黑色网格 · 暗红索引',
        values: { theme: 'minimal', font: 'sans', background: '#f6f4ee', cardBackground: '#fffaf0', text: '#2c322f', accent: '#9b332c', secondary: '#a98763', introBackground: '#e8e0d0', buttonColor: '#171717' },
    },
    {
        id: 'scroll', name: '06 古风卷轴', description: '宣纸卷轴 · 朱印题签 · 竖线笺格',
        values: { theme: 'scroll', font: 'kai', background: '#ead9b8', cardBackground: '#f7edcf', text: '#3f2d20', accent: '#9a3e2f', secondary: '#6f7251', introBackground: '#dfc99e', buttonColor: '#8a3329' },
    },
    {
        id: 'editorial', name: '07 美式杂志', description: '超大报头 · 不对称分栏 · 黑红索引',
        values: { theme: 'editorial', font: 'sans', background: '#f4ead5', cardBackground: '#fffaf0', text: '#162c3a', accent: '#b32d25', secondary: '#d29b35', introBackground: '#e9d4ad', buttonColor: '#162c3a' },
    },
    {
        id: 'collage', name: '08 拼贴手账', description: '胶带便签 · 错位卡片 · 手作纸纹',
        values: { theme: 'collage', font: 'kai', background: '#efe6d7', cardBackground: '#fff8ea', text: '#31302c', accent: '#d55445', secondary: '#3d8190', introBackground: '#f2cc63', buttonColor: '#3d8190' },
    },
    {
        id: 'dossier', name: '09 黑银档案', description: '机密卷宗 · 红色标签 · 工业编号',
        values: { theme: 'dossier', font: 'mono', background: '#1b1d1f', cardBackground: '#292d31', text: '#f0eadf', accent: '#c6aa68', secondary: '#a9afb3', introBackground: '#34383d', buttonColor: '#8e2631' },
    },
    {
        id: 'glass', name: '10 水色玻璃', description: '雾面玻璃 · 漂浮胶囊 · 柔光渐变',
        values: { theme: 'glass', font: 'sans', background: '#dbecef', cardBackground: '#f1f8f7', text: '#24444d', accent: '#45999b', secondary: '#667ca0', introBackground: '#c8e2df', buttonColor: '#397f83' },
    },
    {
        id: 'kinetic', name: '11 动态字构', description: '斜向超大字 · 蓝白动势 · 竖排侧题',
        values: { theme: 'kinetic', font: 'sans', background: '#f1f1ef', cardBackground: '#ffffff', text: '#102c9e', accent: '#1438c2', secondary: '#7187df', introBackground: '#dce3ff', buttonColor: '#1438c2' },
    },
    {
        id: 'noir-poster', name: '12 赤黑电影海报', description: '深红片头 · 横向海报 · 高对比字幕',
        values: { theme: 'noir-poster', font: 'sans', background: '#b83a30', cardBackground: '#171313', text: '#fff8ed', accent: '#ef5a49', secondary: '#d6c6b5', introBackground: '#302725', buttonColor: '#fff8ed' },
    },
    {
        id: 'negative-space', name: '13 立绘分割', description: '大图 / 立绘区 · 左右切换 · 自定义比例',
        values: { theme: 'negative-space', font: 'sans', background: '#f4f1ea', cardBackground: '#fffdfa', text: '#201b1b', accent: '#6c463b', secondary: '#81746b', introBackground: '#ded7cd', buttonColor: '#201b1b', imagePosition: 'left', imageWidth: 42 },
    },
]);

const STATUS_TEMPLATES = Object.freeze([
    { id: 'custom', name: '自由组件版', description: '默认空白画布，自由增加字段、数值和组件' },
    { id: 'relationship', name: '攻略关系型', description: '关系阶段、好感度、变化原因与内心独白' },
    { id: 'openingInfo', name: '开局信息型', description: '时间、地点、身份、世界前提与目标' },
    { id: 'worldNpc', name: '大世界 NPC 型', description: '地区、事件、阵营、NPC、声望与威胁' },
    { id: 'survival', name: '生存探索型', description: '生命、资源、危险、背包与任务' },
]);

const KIND_LABELS = Object.freeze({ text: '短文本', long: '长文本', number: '数字', progress: '数值 0–100', currency: '金额', avatar: '头像' });
const PHONE_STRUCTURE_IDS = Object.freeze(['phone', 'profile', 'social', 'forum', 'chat', 'music', 'casefile', 'quest']);
const PHONE_DESKTOP_DEFAULTS = Object.freeze({
    wallpaperUrl: '', wallpaperPositionX: 50, wallpaperPositionY: 50,
    petalsEnabled: true,
    widgetX: 15, widgetY: 58,
    widgetOrder: ['current_location', 'current_time', 'current_weather'],
    personalAvatarSource: 'character', personalAvatarUrl: '', personalAvatarPositionX: 50, personalAvatarPositionY: 50, personalAvatarScale: 1,
    personalFields: [
        { id: 'favor', label: '好感度', instruction: '填写0到100之间的整数，只写数字', kind: 'progress' },
        { id: 'desire', label: '欲望度', instruction: '填写0到100之间的整数，只写数字', kind: 'progress' },
        { id: 'cloth', label: '当前衣着', instruction: '具体描述当前角色的衣着与明显细节', kind: 'long' },
        { id: 'thought', label: '实时想法', instruction: '第一人称填写角色此刻没有说出口的真实想法', kind: 'long' },
    ],
    apps: [
        { id: 'Personal', name: '个人', iconUrl: '' },
        { id: 'Memo', name: '备忘录', iconUrl: '' },
        { id: 'Wechat', name: '微信', iconUrl: '' },
        { id: 'Shop', name: '购物', iconUrl: '' },
    ],
});
const PHONE_APP_ICON_PATHS = Object.freeze({
    Personal: '<circle cx="12" cy="8" r="3.1"></circle><path d="M5.7 19.2c.8-3.4 3-5.3 6.3-5.3s5.5 1.9 6.3 5.3"></path>',
    Memo: '<rect x="5.5" y="3.5" width="13" height="17" rx="3"></rect><path d="M9 8h6M9 12h6M9 16h4"></path>',
    Wechat: '<path d="M4.2 10.1c0-3.1 3-5.6 6.7-5.6s6.7 2.5 6.7 5.6-3 5.6-6.7 5.6c-.8 0-1.6-.1-2.3-.4l-3.3 1.6.8-3.1a5.1 5.1 0 0 1-1.9-3.7Z"></path><path d="M13.4 14.8c.5 2.1 2.6 3.7 5.1 3.7.6 0 1.1-.1 1.6-.3l2.1 1-.5-2c.8-.7 1.3-1.7 1.3-2.8 0-2-1.7-3.7-4.1-4.1"></path>',
    Shop: '<path d="M5.2 8.5h13.6l-1 11H6.2l-1-11Z"></path><path d="M8.6 9V7.1a3.4 3.4 0 0 1 6.8 0V9"></path>',
});
const phoneAppIconMarkup = id => `<svg class="zrs-app-glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${PHONE_APP_ICON_PATHS[id] || PHONE_APP_ICON_PATHS.Personal}</svg>`;
const PHONE_STRUCTURE_DEFAULT = STATUS_STRUCTURE_PRESETS.find(item => item.id === 'phone');

const OPENING_PALETTES = Object.freeze({
    navy: { background: '#f5ead7', cardBackground: '#fffaf0', text: '#2f261e', accent: '#914538', secondary: '#7d6a56', introBackground: '#e8e0d0', buttonColor: '#1a3048' },
    sage: { background: '#e4e5d8', cardBackground: '#f4f1e8', text: '#343331', accent: '#71877a', secondary: '#66756c', introBackground: '#d5dfd7', buttonColor: '#b96f54' },
    berry: { background: '#eadcda', cardBackground: '#f8efeb', text: '#3b3835', accent: '#95676b', secondary: '#7a6868', introBackground: '#ded0d2', buttonColor: '#7d626c' },
    aqua: { background: '#dce8e5', cardBackground: '#f2f6f3', text: '#303536', accent: '#678584', secondary: '#5f7776', introBackground: '#cfdfdc', buttonColor: '#577472' },
});

const DEFAULT_SETTINGS = Object.freeze({
    ...RULE_PRESETS.custom,
    preset: 'custom',
    statusTemplate: 'custom',
    promptEnabled: false,
    installScope: 'scoped',
    ruleId: 'zeya-status-rule-v2',
    activeWorkspace: 'opening',
    favoriteHomeTemplates: ['classical', 'newspaper', 'timeline'],
    favoriteStatusTemplates: ['relationship', 'worldNpc'],
    structure: 'phone',
    title: PHONE_STRUCTURE_DEFAULT.title,
    subtitle: PHONE_STRUCTURE_DEFAULT.subtitle,
    layout: PHONE_STRUCTURE_DEFAULT.layout,
    pagesText: PHONE_STRUCTURE_DEFAULT.pagesText,
    sharedFieldsText: PHONE_STRUCTURE_DEFAULT.shared.map(item => item.join('|')).join('\n'),
    pageFieldsText: PHONE_STRUCTURE_DEFAULT.fields.map(item => item.join('|')).join('\n'),
    variant: 'auto',
    paletteId: 'ice-blue',
    media: { avatarSource: 'character', avatarUrl: '', imageUrl: '', audioUrl: '', imageAlt: '状态栏配图' },
    phoneDesktop: PHONE_DESKTOP_DEFAULTS,
    openingNotes: {},
    openingProfiles: {},
    openingProfilesMigrated: false,
    statusWorldbookBindings: {},
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
    'status-atelier-opening-home-image-url': 'imageUrl',
    'status-atelier-opening-home-image-alt': 'imageAlt',
    'status-atelier-opening-home-image-position': 'imagePosition',
    'status-atelier-opening-home-image-width': 'imageWidth',
});

const SETTING_FIELDS = Object.freeze({
    'status-atelier-rule-name': 'ruleName',
    'status-atelier-tag-name': 'tagName',
    'status-atelier-title': 'title',
    'status-atelier-subtitle': 'subtitle',
    'status-atelier-theme': 'theme',
    'status-atelier-structure': 'structure',
    'status-atelier-palette': 'paletteId',
    'status-atelier-layout': 'layout',
    'status-atelier-pages': 'pagesText',
    'status-atelier-shared-fields': 'sharedFieldsText',
    'status-atelier-page-fields': 'pageFieldsText',
    'status-atelier-install-scope': 'installScope',
    'status-atelier-prompt-enabled': 'promptEnabled',
});

const STATUS_MEDIA_FIELDS = Object.freeze({
    'status-atelier-avatar-source': 'avatarSource',
    'status-atelier-avatar-url': 'avatarUrl',
    'status-atelier-image-url': 'imageUrl',
    'status-atelier-audio-url': 'audioUrl',
    'status-atelier-image-alt': 'imageAlt',
});

const PHONE_DESKTOP_FIELDS = Object.freeze({
    'status-atelier-phone-wallpaper-url': 'wallpaperUrl',
    'status-atelier-phone-petals-enabled': 'petalsEnabled',
    'status-atelier-phone-avatar-source': 'personalAvatarSource',
    'status-atelier-phone-avatar-url': 'personalAvatarUrl',
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
let statusPreviewFrame;
let entryDialogWorldlineIndex = null;
let entryDialogEntries = [];
let entryDialogPage = 0;
let entryDialogQuery = '';
let entryDialogLoadVersion = 0;
let entryDialogDraftSelections = new Map();
let greetingBindingPromise = null;
let openingReadToast = null;
let statusAiTestRecords = null;
let activeOpeningProfileKey = '';

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
        console[level === 'error' ? 'error' : 'log'](`[九一 正则状态工坊] ${message}`);
    }
}

function showOpeningReadProgress(message) {
    if (!globalThis.toastr?.info) return;
    if (openingReadToast) globalThis.toastr.clear?.(openingReadToast);
    openingReadToast = globalThis.toastr.info(message, '九一 · AI 正在生成', {
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
    if (!stored.openingProfiles || typeof stored.openingProfiles !== 'object' || Array.isArray(stored.openingProfiles)) {
        stored.openingProfiles = {};
    }
    if (!stored.statusWorldbookBindings || typeof stored.statusWorldbookBindings !== 'object' || Array.isArray(stored.statusWorldbookBindings)) {
        stored.statusWorldbookBindings = {};
    }
    if (stored.openingProfilesMigrated !== true) {
        stored.openingLegacyBackup = clone(stored.openingHome || OPENING_HOME_DEFAULTS);
        stored.openingHome = freshOpeningHomeForCharacter(OPENING_HOME_DEFAULTS, stored.openingHome);
        stored.openingProfiles = {};
        stored.openingProfilesMigrated = true;
    }
    if (!stored.openingSummary || typeof stored.openingSummary !== 'object' || Array.isArray(stored.openingSummary)) {
        stored.openingSummary = clone(DEFAULT_SETTINGS.openingSummary);
    }
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS.openingSummary)) {
        if (!Object.hasOwn(stored.openingSummary, key)) stored.openingSummary[key] = value;
    }
    if (!stored.media || typeof stored.media !== 'object' || Array.isArray(stored.media)) stored.media = clone(DEFAULT_SETTINGS.media);
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS.media)) {
        if (!Object.hasOwn(stored.media, key)) stored.media[key] = value;
    }
    if (!stored.phoneDesktop || typeof stored.phoneDesktop !== 'object' || Array.isArray(stored.phoneDesktop)) {
        stored.phoneDesktop = clone(DEFAULT_SETTINGS.phoneDesktop);
    }
    if (stored.phoneDesktopSchemaVersion !== 2) {
        stored.phoneDesktop = normalizePhoneDesktop({ phoneDesktop: stored.phoneDesktop, media: stored.media });
        stored.phoneDesktopSchemaVersion = 2;
    }
    if (!PHONE_STRUCTURE_IDS.includes(stored.structure)) {
        stored.structure = PHONE_STRUCTURE_DEFAULT.id;
        stored.title = PHONE_STRUCTURE_DEFAULT.title;
        stored.subtitle = PHONE_STRUCTURE_DEFAULT.subtitle;
        stored.layout = PHONE_STRUCTURE_DEFAULT.layout;
        stored.pagesText = PHONE_STRUCTURE_DEFAULT.pagesText;
        stored.sharedFieldsText = PHONE_STRUCTURE_DEFAULT.shared.map(item => item.join('|')).join('\n');
        stored.pageFieldsText = PHONE_STRUCTURE_DEFAULT.fields.map(item => item.join('|')).join('\n');
    }
    if (stored.openingSummary.source === 'manual') stored.openingSummary.source = 'main';
    if (!['opening', 'status'].includes(stored.activeWorkspace)) stored.activeWorkspace = 'opening';
    if (!Array.isArray(stored.favoriteHomeTemplates)) stored.favoriteHomeTemplates = clone(DEFAULT_SETTINGS.favoriteHomeTemplates);
    if (!Array.isArray(stored.favoriteStatusTemplates)) stored.favoriteStatusTemplates = clone(DEFAULT_SETTINGS.favoriteStatusTemplates);
    if (stored.statusFieldsUnified !== true && stored.structure !== 'phone') {
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
    if (stored.structure === 'phone') stored.statusFieldsUnified = true;
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

function saveSettingsSoon({ snapshotOpening = true } = {}) {
    if (snapshotOpening) snapshotCurrentOpeningProfile();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => context()?.saveSettingsDebounced?.(), 120);
}

function scheduleStatusPreviewUpdate() {
    if (statusPreviewFrame) return;
    statusPreviewFrame = requestAnimationFrame(() => {
        statusPreviewFrame = null;
        updatePrompt();
        updatePreview();
        saveSettingsSoon({ snapshotOpening: false });
    });
}

async function saveSettingsNow() {
    snapshotCurrentOpeningProfile();
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
    return settingsRoot?.querySelector(`#${id}`) || globalThis.document?.getElementById(id);
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
    card.dataset.templateId = template.id;
    card.dataset.templateType = type;
    card.setAttribute('aria-pressed', String(template.id === selected));
    card.append(makeElement('strong', '', template.name), makeElement('small', '', template.description));
    card.addEventListener('click', () => {
        if (type === 'home') {
            Object.assign(settings().openingHome, template.values);
            loadSettingsUI();
            updateOpeningHomePreview();
            saveSettingsSoon();
        } else {
            applyPreset(template.id);
        }
    });
    const favorite = makeElement('button', 'status-atelier-favorite', favorites.includes(template.id) ? '★ 已收藏' : '☆ 收藏');
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

function renderStatusDesignControls() {
    const structureSelect = field('status-atelier-structure');
    if (structureSelect && !structureSelect.options.length) {
        STATUS_STRUCTURE_PRESETS.filter(item => PHONE_STRUCTURE_IDS.includes(item.id)).forEach(item => {
            const option = makeElement('option', '', item.name);
            option.value = item.id;
            structureSelect.append(option);
        });
    }
    if (structureSelect) structureSelect.value = settings().structure || 'custom';
    const styleHost = field('status-atelier-status-styles');
    if (styleHost && styleHost.children.length !== STATUS_STYLE_PRESETS.length) {
        styleHost.replaceChildren();
        STATUS_STYLE_PRESETS.forEach(style => {
            const button = makeElement('button', 'status-atelier-status-style');
            button.type = 'button';
            button.dataset.statusStyle = style.id;
            button.title = `${style.code} ${style.name}`;
            button.append(
                makeElement('b', '', style.code),
                makeElement('span', 'status-atelier-status-style-glyph', style.glyph || '✦'),
                makeElement('small', '', style.name),
            );
            styleHost.append(button);
        });
    }
    styleHost?.querySelectorAll('[data-status-style]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.statusStyle === settings().theme));
    });
    const paletteHost = field('status-atelier-status-palettes');
    if (paletteHost && paletteHost.children.length !== STATUS_PALETTE_PRESETS.length) {
        paletteHost.replaceChildren();
        STATUS_PALETTE_PRESETS.forEach(palette => {
            const button = makeElement('button', 'status-atelier-status-palette');
            button.type = 'button';
            button.dataset.statusPalette = palette.id;
            button.title = palette.name;
            button.setAttribute('aria-pressed', String(settings().paletteId === palette.id));
            const dots = makeElement('span', 'status-atelier-palette-dots');
            [palette.background, palette.card, palette.accent, palette.text].forEach(colorValue => {
                const dot = makeElement('i');
                dot.style.background = colorValue;
                dots.append(dot);
            });
            button.append(dots, makeElement('small', '', palette.name));
            paletteHost.append(button);
        });
    }
    paletteHost?.querySelectorAll('[data-status-palette]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.statusPalette === settings().paletteId));
    });
    const media = settings().media || DEFAULT_SETTINGS.media;
    for (const [id, key] of Object.entries(STATUS_MEDIA_FIELDS)) {
        const control = field(id);
        if (control) control.value = String(media[key] ?? '');
    }
    const avatarUrlLabel = field('status-atelier-avatar-url-wrap');
    if (avatarUrlLabel) avatarUrlLabel.hidden = media.avatarSource !== 'url';
    renderPhoneDesktopControls();
}

function renderPhoneDesktopControls() {
    const stored = settings();
    const phone = stored.phoneDesktop || DEFAULT_SETTINGS.phoneDesktop;
    const section = field('status-atelier-phone-diy');
    if (section) section.hidden = stored.structure !== 'phone';
    const appearanceSection = field('status-atelier-appearance-section');
    if (appearanceSection) appearanceSection.hidden = stored.structure === 'phone';
    renderTemplateMediaControls();
    for (const [id, key] of Object.entries(PHONE_DESKTOP_FIELDS)) {
        const control = field(id);
        if (!control) continue;
        if (control.type === 'checkbox') control.checked = phone[key] !== false;
        else control.value = String(phone[key] ?? '');
    }
    const avatarUrlWrap = field('status-atelier-phone-avatar-url-wrap');
    if (avatarUrlWrap) avatarUrlWrap.hidden = phone.personalAvatarSource !== 'url';
    phone.apps.forEach(app => {
        const name = field(`status-atelier-phone-app-${app.id.toLowerCase()}-name`);
        const icon = field(`status-atelier-phone-app-${app.id.toLowerCase()}-icon`);
        if (name) name.value = app.name;
        if (icon) icon.value = app.iconUrl;
    });
}

function renderTemplateMediaControls() {
    const structure = settings().structure;
    const section = field('status-atelier-template-media');
    if (!section) return;
    const usesAvatar = ['profile', 'social', 'forum', 'chat', 'casefile'].includes(structure);
    const usesImage = ['social', 'collage', 'music'].includes(structure);
    const usesAudio = structure === 'music';
    section.hidden = structure === 'phone' || (!usesAvatar && !usesImage && !usesAudio);
    const title = field('status-atelier-template-media-title');
    const help = field('status-atelier-template-media-help');
    if (title) title.textContent = usesAudio ? '播放界面素材' : usesImage ? '当前模板配图' : '当前模板头像';
    if (help) help.textContent = usesAudio
        ? '封面与音频只会进入播放界面，音频不会自动播放。'
        : usesImage
            ? '这些图片只会进入当前选中的模板。'
            : '头像会绑定当前角色、当前 user 或图片 URL。';
    const avatarSourceWrap = field('status-atelier-media-avatar-source-wrap');
    const avatarUrlWrap = field('status-atelier-avatar-url-wrap');
    const imageUrlWrap = field('status-atelier-image-url-wrap');
    const audioUrlWrap = field('status-atelier-audio-url-wrap');
    const altWrap = field('status-atelier-image-alt-wrap');
    if (avatarSourceWrap) avatarSourceWrap.hidden = !usesAvatar;
    if (avatarUrlWrap) avatarUrlWrap.hidden = !usesAvatar || settings().media?.avatarSource !== 'url';
    if (imageUrlWrap) imageUrlWrap.hidden = !usesImage;
    if (audioUrlWrap) audioUrlWrap.hidden = !usesAudio;
    if (altWrap) altWrap.hidden = !usesAvatar && !usesImage;
}

function applyStatusStructure(structureId) {
    const structure = STATUS_STRUCTURE_PRESETS.find(item => item.id === structureId);
    if (!structure) return;
    const stored = settings();
    stored.structure = structure.id;
    stored.variant = 'auto';
    stored.title = structure.title;
    stored.subtitle = structure.subtitle;
    stored.layout = structure.layout;
    stored.pagesText = structure.pagesText;
    stored.sharedFieldsText = (structure.shared || []).map(field => field.join('|')).join('\n');
    stored.pageFieldsText = structure.fields.map(field => field.join('|')).join('\n');
    stored.preset = 'custom';
    stored.statusTemplate = 'custom';
    statusAiTestRecords = null;
    const structureControl = field('status-atelier-structure');
    if (structureControl) structureControl.value = stored.structure;
    const titleControl = field('status-atelier-title');
    if (titleControl) titleControl.value = stored.title;
    const subtitleControl = field('status-atelier-subtitle');
    if (subtitleControl) subtitleControl.value = stored.subtitle;
    const layoutControl = field('status-atelier-layout');
    if (layoutControl) layoutControl.value = stored.layout;
    const pagesControl = field('status-atelier-pages');
    if (pagesControl) pagesControl.value = stored.pagesText;
    const sharedControl = field('status-atelier-shared-fields');
    if (sharedControl) sharedControl.value = stored.sharedFieldsText;
    const pageControl = field('status-atelier-page-fields');
    if (pageControl) pageControl.value = stored.pageFieldsText;
    renderStatusSchema();
    renderModalStatusSchema();
    renderPhoneDesktopControls();
    scheduleStatusPreviewUpdate();
}

function fieldDefinitions() {
    const stored = settings();
    const shared = parseFields(stored.sharedFieldsText).map((item, index) => ({ ...item, scope: 'shared', id: item.id === `field_${index + 1}` ? `shared_${index + 1}` : item.id }));
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
    statusAiTestRecords = null;
    const serialize = items => items.map(item => `${item.label}|${item.instruction}|${item.kind}|${item.id}`).join('\n');
    settings().sharedFieldsText = serialize(definitions.filter(item => item.scope === 'shared'));
    settings().pageFieldsText = serialize(definitions.filter(item => item.scope !== 'shared'));
    const sharedControl = field('status-atelier-shared-fields');
    const pageControl = field('status-atelier-page-fields');
    if (sharedControl) sharedControl.value = settings().sharedFieldsText;
    if (pageControl) pageControl.value = settings().pageFieldsText;
    settings().preset = 'custom';
    const presetControl = field('status-atelier-preset');
    if (presetControl) presetControl.value = 'custom';
    scheduleStatusPreviewUpdate();
}

function renderStatusSchema() {
    const host = field('status-atelier-status-schema');
    if (!host) return;
    const phoneMode = settings().structure === 'phone';
    const addButton = field('status-atelier-add-field');
    if (addButton) addButton.hidden = phoneMode;
    const editLegend = field('status-atelier-edit-legend');
    if (editLegend) editLegend.hidden = phoneMode;
    const editorTitle = field('status-atelier-status-editor-title');
    const editorHelp = field('status-atelier-status-editor-help');
    if (editorTitle) editorTitle.textContent = phoneMode ? '个人页显示与 AI 规则' : '字段显示与 AI 规则';
    if (editorHelp) editorHelp.textContent = phoneMode
        ? '字段名称在右侧“个人”页双击修改；这里只设置显示类型和 AI 填写要求。'
        : '名称和顺序直接在预览修改；这里只设置显示类型和 AI 填写要求。';
    if (phoneMode) {
        const phone = settings().phoneDesktop;
        phone.personalFields ??= clone(PHONE_DESKTOP_DEFAULTS.personalFields);
        host.replaceChildren();
        phone.personalFields.forEach(definition => {
            const row = makeElement('article', 'status-atelier-schema-row status-atelier-phone-rule-row');
            const label = makeElement('strong', 'status-atelier-phone-rule-label', definition.label);
            const kind = makeElement('select', 'text_pole');
            Object.entries(KIND_LABELS).forEach(([value, text]) => {
                const option = makeElement('option', '', text);
                option.value = value;
                kind.append(option);
            });
            kind.value = definition.kind;
            kind.setAttribute('aria-label', `${definition.label}显示类型`);
            const instruction = makeElement('textarea', 'text_pole');
            instruction.value = definition.instruction;
            instruction.rows = 2;
            instruction.setAttribute('aria-label', `${definition.label}的 AI 填写要求`);
            kind.addEventListener('change', () => {
                definition.kind = kind.value;
                statusAiTestRecords = null;
                scheduleStatusPreviewUpdate();
                saveSettingsSoon({ snapshotOpening: false });
            });
            instruction.addEventListener('input', () => {
                definition.instruction = instruction.value.slice(0, 300);
                statusAiTestRecords = null;
                scheduleStatusPreviewUpdate();
            });
            instruction.addEventListener('change', () => saveSettingsSoon({ snapshotOpening: false }));
            row.append(label, kind, instruction);
            host.append(row);
        });
        return;
    }
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
        const scopedDefinitions = definitions.filter(item => item.scope === definition.scope);
        const scopedPosition = scopedDefinitions.findIndex(item => item.id === definition.id);
        up.disabled = scopedPosition <= 0;
        down.disabled = scopedPosition < 0 || scopedPosition >= scopedDefinitions.length - 1;
        up.setAttribute('aria-label', `${definition.label}上移`);
        down.setAttribute('aria-label', `${definition.label}下移`);
        remove.setAttribute('aria-label', `删除${definition.label}`);
        up.addEventListener('click', () => moveFieldDefinition(definitions, index, -1));
        down.addEventListener('click', () => moveFieldDefinition(definitions, index, 1));
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
    renderModalStatusSchema();
}

function updateSummarySourceVisibility() {
    const host = field('status-atelier-opening-summary-extra');
    if (host) host.hidden = settings().openingSummary.source !== 'extra';
}

function statusRegexAppliesToCurrentContext() {
    const stored = settings();
    const targetId = String(stored.ruleId || 'zeya-status-rule');
    const targetName = `九一 · ${String(stored.ruleName || '双页剧情状态').trim() || '双页剧情状态'}`;
    const matches = script => script?.id === targetId || script?.scriptName === targetName;
    try {
        return getScriptsByType(SCRIPT_TYPES.SCOPED).some(matches)
            || getScriptsByType(SCRIPT_TYPES.GLOBAL).some(matches);
    } catch (error) {
        console.warn(`[${MODULE_NAME}] 无法确认当前角色的状态栏正则`, error);
        return false;
    }
}

function updatePrompt() {
    const ctx = context();
    if (!ctx?.setExtensionPrompt) return;
    const stored = settings();
    ctx.setExtensionPrompt(
        PROMPT_KEY,
        stored.promptEnabled && statusRegexAppliesToCurrentContext() ? buildAiInstruction(stored) : '',
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
        structure: stored.structure,
        paletteId: stored.paletteId,
        media: stored.media,
    };
    Object.assign(stored, clone(preset), preserved, { preset: name, statusTemplate: name });
    statusAiTestRecords = null;
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
    renderStatusDesignControls();
    renderStatusSchema();
    updateSummarySourceVisibility();
    renderOpeningWorldlines();
    const readStatus = field('status-atelier-opening-read-status');
    if (readStatus) {
        readStatus.textContent = stored.openingReadStatus || '尚未读取当前角色卡。';
        readStatus.dataset.state = stored.openingReadState || 'idle';
    }
}

function setGreetingModalStatus(message, state = 'idle', operation = '') {
    const status = greetingModal?.querySelector('.status-atelier-greeting-read-status');
    if (!status) return;
    status.textContent = String(message || '');
    status.dataset.state = state;
    status.dataset.operation = operation;
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
    setGreetingModalStatus(stored.openingReadStatus, state, 'generate');
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

function renderOpeningHomePreview(host) {
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
    root.style.setProperty('--zop-intro-text', data.introText);
    root.style.setProperty('--zop-button', data.buttonColor);
    root.style.setProperty('--zop-media-width', `${data.imageWidth}%`);
    root.dataset.mediaPosition = data.imagePosition;
    const header = makeElement('header', 'status-atelier-opening-live-header');
    header.append(makeElement('h3', '', data.title), makeElement('small', '', data.subtitle));
    const media = makeElement('figure', `status-atelier-opening-live-media${data.imageUrl ? '' : ' is-empty'}`);
    if (data.imageUrl) {
        const image = makeElement('img');
        image.src = data.imageUrl;
        image.alt = data.imageAlt;
        image.loading = 'lazy';
        media.append(image);
    } else {
        media.setAttribute('aria-label', '预留立绘或图片位置');
        media.append(makeElement('span', '', 'IMAGE / PORTRAIT'));
    }
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
            route.append(makeElement('strong', '', worldline.name));
            if (worldline.description) route.append(makeElement('small', '', worldline.description));
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
    root.append(header, media, meta, intro, directory);
    host.replaceChildren(root);
}

function updateOpeningHomePreview() {
    const hosts = [
        field('status-atelier-opening-live-preview'),
        greetingModal?.querySelector('.status-atelier-greeting-live-preview'),
    ].filter(Boolean);
    [...new Set(hosts)].forEach(renderOpeningHomePreview);
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
    const fileName = character?.avatar ? getCharaFilename(null, { manualAvatarKey: character.avatar }) : '';
    const auxiliary = fileName ? world_info?.charLore?.find(item => item?.name === fileName)?.extraBooks : [];
    const candidates = [data?.extensions?.world, character?.extensions?.world, data?.world, character?.world, auxiliary].flatMap(value => Array.isArray(value) ? value : [value]);
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
    const books = currentEmbeddedWorldbooks().map(book => ({ name: book.name || '当前角色卡内嵌世界书', data: book, switchable: false }));
    for (const bookName of currentLinkedWorldbooks()) {
        try {
            books.push({ name: bookName, data: await loadWorldInfo(bookName), switchable: true });
        } catch (error) {
            console.warn(`[${MODULE_NAME}] 读取世界书线路失败：${bookName}`, error);
        }
    }
    return extractWorldbookRouteCatalog(books);
}

async function currentCharacterHomepageContext() {
    const ctx = context();
    const character = ctx?.characters?.[ctx?.characterId];
    if (!character) return '';
    const books = currentEmbeddedWorldbooks().map(book => ({ name: book.name || '当前角色卡内嵌世界书', data: book }));
    for (const bookName of currentLinkedWorldbooks()) {
        try {
            books.push({ name: bookName, data: await loadWorldInfo(bookName) });
        } catch (error) {
            console.warn(`[${MODULE_NAME}] 读取主页背景资料失败：${bookName}`, error);
        }
    }
    return buildCharacterHomepageContext(character, books);
}

function schemaWithRouteCatalog(schema, catalog, batch = false, homepageFields = null) {
    const copy = JSON.parse(JSON.stringify(schema));
    const labels = worldbookRouteLabels(catalog);
    const allowed = labels.length ? labels : ['未分类线'];
    const routeSchema = batch
        ? copy?.value?.properties?.entries?.items?.properties?.route
        : copy?.value?.properties?.route;
    if (routeSchema) routeSchema.enum = allowed;
    if (batch && homepageFields && copy?.value?.properties) {
        for (const key of ['homeTitle', 'homeSubtitle', 'workIntro']) {
            if (!homepageFields.includes(key)) delete copy.value.properties[key];
        }
        copy.value.required = [...homepageFields, 'entries'];
    }
    return copy;
}

function syncWorldbookRouteBindings(catalog) {
    const home = settings().openingHome;
    home.worldlines ??= [];
    return syncRouteCatalogWorldlines(home.worldlines, catalog);
}

function nextEntryDialogPaint() {
    return new Promise(resolve => {
        if (typeof globalThis.requestAnimationFrame === 'function') {
            globalThis.requestAnimationFrame(() => resolve());
        } else {
            setTimeout(resolve, 0);
        }
    });
}

function setEntryDialogNavigation(view = null) {
    const status = field('status-atelier-entry-dialog-status');
    const page = field('status-atelier-entry-dialog-page');
    const previous = field('status-atelier-entry-dialog-prev');
    const next = field('status-atelier-entry-dialog-next');
    if (!view) {
        if (page) page.textContent = '第 1 / 1 页';
        if (previous) previous.disabled = true;
        if (next) next.disabled = true;
        return;
    }
    const book = field('status-atelier-entry-dialog-book')?.value || '';
    const selectedCount = [...entryDialogDraftSelections.values()].filter(item => item.book === book).length;
    if (status) status.textContent = `匹配 ${view.total} 条；当前显示 ${view.start}–${view.end}；本书已绑定 ${selectedCount} 条`;
    if (page) page.textContent = `第 ${view.page + 1} / ${view.pageCount} 页`;
    if (previous) previous.disabled = view.page <= 0;
    if (next) next.disabled = view.page >= view.pageCount - 1;
}

function renderEntryDialogNotice(message, state = '') {
    const list = field('status-atelier-entry-dialog-list');
    const status = field('status-atelier-entry-dialog-status');
    const confirm = field('status-atelier-entry-dialog-confirm');
    if (!list) return;
    const notice = makeElement('p', `status-atelier-empty${state ? ` is-${state}` : ''}`, message);
    notice.setAttribute('role', state === 'error' ? 'alert' : 'status');
    list.setAttribute('aria-busy', String(state === 'loading'));
    list.replaceChildren(notice);
    if (status) status.textContent = message;
    if (confirm) confirm.disabled = state === 'loading' || state === 'error' || !field('status-atelier-entry-dialog-book')?.value;
    setEntryDialogNavigation();
}

function renderEntryDialogPage() {
    const list = field('status-atelier-entry-dialog-list');
    const book = field('status-atelier-entry-dialog-book')?.value || '';
    if (!list || !book) {
        renderEntryDialogNotice('先选择一本世界书。');
        return;
    }
    const view = paginateEntryDialogEntries(entryDialogEntries, {
        book,
        selectedKeys: new Set(entryDialogDraftSelections.keys()),
        query: entryDialogQuery,
        page: entryDialogPage,
    });
    entryDialogPage = view.page;
    list.setAttribute('aria-busy', 'false');
    const fragment = document.createDocumentFragment();
    view.items.forEach(record => {
        const label = makeElement('label', 'status-atelier-entry-option');
        const checkbox = makeElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = String(record.uid);
        checkbox.checked = record.selected;
        checkbox.addEventListener('change', () => {
            const key = entryDialogBindingKey(book, record.uid);
            if (checkbox.checked) {
                entryDialogDraftSelections.set(key, { book, uid: record.uid, title: record.title });
            } else {
                entryDialogDraftSelections.delete(key);
            }
            setEntryDialogNavigation(view);
        });
        label.append(checkbox, makeElement('b', '', `UID ${record.uid}`), makeElement('span', '', record.title));
        fragment.append(label);
    });
    if (!view.items.length) fragment.append(makeElement('p', 'status-atelier-empty', entryDialogQuery ? '没有匹配的 UID 或标题。' : '这本世界书没有条目。'));
    list.replaceChildren(fragment);
    field('status-atelier-entry-dialog-confirm').disabled = false;
    setEntryDialogNavigation(view);
}

async function renderEntryDialogOptions() {
    const requestVersion = ++entryDialogLoadVersion;
    const dialog = field('status-atelier-entry-dialog');
    const book = field('status-atelier-entry-dialog-book')?.value || '';
    entryDialogEntries = [];
    entryDialogPage = 0;
    if (!book) {
        const search = field('status-atelier-entry-dialog-search');
        if (search) search.disabled = true;
        renderEntryDialogNotice('先选择一本世界书。');
        return;
    }
    const search = field('status-atelier-entry-dialog-search');
    if (search) search.disabled = true;
    renderEntryDialogNotice('正在读取世界书条目…', 'loading');
    await nextEntryDialogPaint();
    try {
        const data = await loadWorldInfo(book);
        if (requestVersion !== entryDialogLoadVersion || !dialog?.open || field('status-atelier-entry-dialog-book')?.value !== book) return;
        if (!data) throw new Error('世界书不存在或无法读取');
        entryDialogEntries = Object.values(data.entries || {});
        if (search) search.disabled = false;
        renderEntryDialogPage();
    } catch (error) {
        if (requestVersion !== entryDialogLoadVersion || !dialog?.open) return;
        if (search) search.disabled = true;
        renderEntryDialogNotice(`读取失败：${error?.message || '无法读取世界书条目'}`, 'error');
    }
}

async function openEntryDialog(worldlineIndex) {
    entryDialogWorldlineIndex = worldlineIndex;
    const openVersion = ++entryDialogLoadVersion;
    const worldline = settings().openingHome.worldlines[worldlineIndex];
    if (!worldline) throw new Error('找不到要调整的世界线');
    entryDialogDraftSelections = new Map((worldline.entries || []).map(item => [entryDialogBindingKey(item.book, item.uid), { ...item }]));
    entryDialogEntries = [];
    entryDialogPage = 0;
    entryDialogQuery = '';

    const dialog = field('status-atelier-entry-dialog');
    const book = field('status-atelier-entry-dialog-book');
    const search = field('status-atelier-entry-dialog-search');
    if (book) book.disabled = true;
    if (search) {
        search.value = '';
        search.disabled = true;
    }
    renderEntryDialogNotice('正在准备 UID 编辑器…', 'loading');
    mountAndShowEntryDialog(dialog, document.body);
    await nextEntryDialogPaint();
    if (openVersion !== entryDialogLoadVersion || !dialog.open) return;

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
    book.disabled = false;
    await renderEntryDialogOptions();
}

function closeEntryDialog() {
    entryDialogLoadVersion += 1;
    const dialog = field('status-atelier-entry-dialog');
    if (dialog?.open) dialog.close();
    entryDialogWorldlineIndex = null;
    entryDialogEntries = [];
    entryDialogDraftSelections = new Map();
}

function confirmEntryDialog() {
    const worldline = settings().openingHome.worldlines[entryDialogWorldlineIndex];
    if (!worldline) return notify('warning', '找不到要调整的世界线');
    worldline.entries = [...entryDialogDraftSelections.values()];
    closeEntryDialog();
    renderOpeningWorldlines();
    renderGreetingList();
    saveSettingsSoon();
}

function updateOpeningWorldlineName(worldline, nextName) {
    const previousName = String(worldline.name || '');
    worldline.name = nextName;
    settings().openingHome.entries.forEach(entry => {
        if (entry.worldlineId === worldline.id || entry.route === previousName) {
            entry.route = nextName;
            entry.worldlineId = worldline.id;
        }
    });
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
        name.addEventListener('input', () => { updateOpeningWorldlineName(worldline, name.value); renderOpeningHomeEntries(); saveSettingsSoon(); });
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
    if (key === 'structure') {
        if (settings().structure !== control.value) applyStatusStructure(control.value);
        return;
    }
    settings()[key] = control.type === 'checkbox' ? control.checked : control.value;
    statusAiTestRecords = null;
    if (!['promptEnabled', 'installScope'].includes(key)) {
        settings().preset = 'custom';
        field('status-atelier-preset').value = 'custom';
    }
    if (key === 'theme') {
        field('status-atelier-status-styles')?.querySelectorAll('[data-status-style]').forEach(button => {
            button.setAttribute('aria-pressed', String(button.dataset.statusStyle === settings().theme));
        });
    }
    if (['promptEnabled', 'installScope'].includes(key)) {
        updatePrompt();
        saveSettingsSoon({ snapshotOpening: false });
    } else {
        scheduleStatusPreviewUpdate();
    }
}

function readStatusMediaControl(control) {
    const key = STATUS_MEDIA_FIELDS[control.id];
    if (!key) return;
    settings().media ??= clone(DEFAULT_SETTINGS.media);
    settings().media[key] = control.value;
    statusAiTestRecords = null;
    if (key === 'avatarSource') {
        const avatarUrlLabel = field('status-atelier-avatar-url-wrap');
        if (avatarUrlLabel) avatarUrlLabel.hidden = control.value !== 'url';
    }
    scheduleStatusPreviewUpdate();
}

function moveFieldDefinition(definitions, index, direction) {
    const definition = definitions[index];
    if (!definition) return;
    const scopedIndexes = definitions
        .map((item, itemIndex) => item.scope === definition.scope ? itemIndex : -1)
        .filter(itemIndex => itemIndex >= 0);
    const position = scopedIndexes.indexOf(index);
    const targetPosition = position + direction;
    if (position < 0 || targetPosition < 0 || targetPosition >= scopedIndexes.length) return;
    const targetIndex = scopedIndexes[targetPosition];
    [definitions[targetIndex], definitions[index]] = [definitions[index], definitions[targetIndex]];
    serializeFieldDefinitions(definitions);
    renderStatusSchema();
    renderModalStatusSchema();
    saveSettingsSoon({ snapshotOpening: false });
}

function readPhoneDesktopControl(control) {
    const stored = settings();
    stored.phoneDesktop ??= clone(DEFAULT_SETTINGS.phoneDesktop);
    const key = PHONE_DESKTOP_FIELDS[control.id];
    if (key) {
        stored.phoneDesktop[key] = control.type === 'checkbox' ? control.checked : control.type === 'range' ? Number(control.value) : control.value;
        if (key === 'personalAvatarSource') {
            const urlWrap = field('status-atelier-phone-avatar-url-wrap');
            if (urlWrap) urlWrap.hidden = control.value !== 'url';
        }
        statusAiTestRecords = null;
        scheduleStatusPreviewUpdate();
        return;
    }
    const appId = control.dataset?.phoneAppId;
    const appKey = control.dataset?.phoneAppKey;
    if (!appId || !['name', 'iconUrl'].includes(appKey)) return;
    const app = stored.phoneDesktop.apps.find(item => item.id === appId);
    if (!app) return;
    app[appKey] = control.value;
    statusAiTestRecords = null;
    scheduleStatusPreviewUpdate();
}

function resolvedStatusInput(source = settings()) {
    const output = {
        ruleId: source.ruleId,
        ruleName: source.ruleName,
        tagName: source.tagName,
        title: source.title,
        subtitle: source.subtitle,
        theme: source.theme,
        structure: source.structure,
        variant: source.variant,
        paletteId: source.paletteId,
        palette: source.palette && typeof source.palette === 'object' ? { ...source.palette } : undefined,
        layout: source.layout,
        pagesText: source.pagesText,
        sharedFieldsText: source.sharedFieldsText,
        pageFieldsText: source.pageFieldsText,
        media: { ...DEFAULT_SETTINGS.media, ...(source.media || {}) },
        phoneDesktop: clone(source.phoneDesktop || DEFAULT_SETTINGS.phoneDesktop),
    };
    const ctx = context();
    const thumbnail = ctx?.getThumbnailUrl || getThumbnailUrl;
    try {
        if (output.media.avatarSource === 'character') {
            const avatar = ctx?.characters?.[ctx?.characterId]?.avatar;
            output.media.avatarUrl = avatar && avatar !== 'none' ? thumbnail('avatar', avatar) : '';
        } else if (output.media.avatarSource === 'user') {
            output.media.avatarUrl = user_avatar ? thumbnail('persona', user_avatar) : '';
        } else if (output.media.avatarSource === 'none') {
            output.media.avatarUrl = '';
        }
    } catch {
        output.media.avatarUrl = output.media.avatarSource === 'url' ? output.media.avatarUrl : '';
    }
    try {
        if (output.phoneDesktop.personalAvatarSource === 'character') {
            const avatar = ctx?.characters?.[ctx?.characterId]?.avatar;
            output.phoneDesktop.personalAvatarUrl = avatar && avatar !== 'none' ? thumbnail('avatar', avatar) : '';
        } else if (output.phoneDesktop.personalAvatarSource === 'user') {
            output.phoneDesktop.personalAvatarUrl = user_avatar ? thumbnail('persona', user_avatar) : '';
        } else if (output.phoneDesktop.personalAvatarSource === 'none') {
            output.phoneDesktop.personalAvatarUrl = '';
        }
    } catch {
        output.phoneDesktop.personalAvatarUrl = output.phoneDesktop.personalAvatarSource === 'url' ? output.phoneDesktop.personalAvatarUrl : '';
    }
    return output;
}

function previewValue(fieldDefinition) {
    if (fieldDefinition.kind === 'progress') return 'AI动态数值';
    if (fieldDefinition.kind === 'currency') return 'AI动态金额';
    if (fieldDefinition.kind === 'avatar') return '当前角色';
    if (fieldDefinition.kind === 'long') return '这里显示 AI 根据当前剧情生成的长文本。';
    return 'AI动态填写';
}

function paintRuleLogo(element, rule, fallback = '✦') {
    element.textContent = rule?.glyph || fallback;
}

function updatePreviewFieldLabel(definition, scope, nextLabel) {
    const label = String(nextLabel || '').trim().slice(0, 30);
    if (!label) return false;
    const definitions = fieldDefinitions();
    const target = definitions.find(item => item.id === definition.id && item.scope === scope);
    if (!target || target.label === label) return Boolean(target);
    target.label = label;
    serializeFieldDefinitions(definitions);
    renderStatusSchema();
    renderModalStatusSchema();
    saveSettingsSoon({ snapshotOpening: false });
    return true;
}

function bindPreviewFieldLabelEditor(label, definition, scope) {
    const originalLabel = definition.label;
    let editing = false;
    let cancelled = false;
    const finish = () => {
        if (!editing) return;
        editing = false;
        label.contentEditable = 'false';
        label.classList.remove('is-editing');
        const nextLabel = cancelled ? originalLabel : label.textContent;
        cancelled = false;
        if (!updatePreviewFieldLabel(definition, scope, nextLabel)) label.textContent = originalLabel;
    };
    const begin = () => {
        if (editing) return;
        editing = true;
        label.contentEditable = 'true';
        label.classList.add('is-editing');
        label.focus();
        const selection = window.getSelection?.();
        if (selection && document.createRange) {
            const range = document.createRange();
            range.selectNodeContents(label);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };
    label.tabIndex = 0;
    label.title = '双击修改字段名称；按 Enter 保存，Esc 取消';
    label.setAttribute('aria-label', `${definition.label}，双击或按 Enter 修改字段名称`);
    label.addEventListener('pointerdown', event => event.stopPropagation());
    label.addEventListener('dblclick', event => {
        event.preventDefault();
        event.stopPropagation();
        begin();
    });
    label.addEventListener('keydown', event => {
        if (!editing && (event.key === 'Enter' || event.key === 'F2')) {
            event.preventDefault();
            begin();
            return;
        }
        if (!editing) return;
        if (event.key === 'Enter') {
            event.preventDefault();
            label.blur();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            cancelled = true;
            label.blur();
        }
    });
    label.addEventListener('blur', finish);
}

function bindPhonePersonalFieldLabelEditor(label, definition) {
    const originalLabel = definition.label;
    let editing = false;
    let cancelled = false;
    const finish = () => {
        if (!editing) return;
        editing = false;
        label.contentEditable = 'false';
        label.classList.remove('is-editing');
        const nextLabel = String(cancelled ? originalLabel : label.textContent || '').trim().slice(0, 30);
        cancelled = false;
        const target = settings().phoneDesktop.personalFields?.find(item => item.id === definition.id);
        if (!target || !nextLabel) {
            label.textContent = originalLabel;
            return;
        }
        target.label = nextLabel;
        statusAiTestRecords = null;
        renderStatusSchema();
        scheduleStatusPreviewUpdate();
        saveSettingsSoon({ snapshotOpening: false });
    };
    const begin = () => {
        if (editing) return;
        editing = true;
        label.contentEditable = 'true';
        label.classList.add('is-editing');
        label.focus();
        const selection = window.getSelection?.();
        if (selection && document.createRange) {
            const range = document.createRange();
            range.selectNodeContents(label);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };
    label.tabIndex = 0;
    label.title = '双击修改名称；按 Enter 保存，Esc 取消';
    label.setAttribute('aria-label', `${definition.label}，双击或按 Enter 修改名称`);
    label.addEventListener('pointerdown', event => event.stopPropagation());
    label.addEventListener('dblclick', event => {
        event.preventDefault();
        event.stopPropagation();
        begin();
    });
    label.addEventListener('keydown', event => {
        if (!editing && (event.key === 'Enter' || event.key === 'F2')) {
            event.preventDefault();
            begin();
            return;
        }
        if (!editing) return;
        if (event.key === 'Enter') {
            event.preventDefault();
            label.blur();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            cancelled = true;
            label.blur();
        }
    });
    label.addEventListener('blur', finish);
}

function bindPreviewTitleEditor(title) {
    const originalTitle = settings().title;
    let editing = false;
    let cancelled = false;
    const finish = () => {
        if (!editing) return;
        editing = false;
        title.contentEditable = 'false';
        title.classList.remove('is-editing');
        const nextTitle = String(cancelled ? originalTitle : title.textContent || '').trim().slice(0, 80);
        cancelled = false;
        if (!nextTitle) {
            title.textContent = originalTitle;
            return;
        }
        settings().title = nextTitle;
        const titleControl = field('status-atelier-title');
        if (titleControl) titleControl.value = nextTitle;
        statusAiTestRecords = null;
        saveSettingsSoon({ snapshotOpening: false });
        scheduleStatusPreviewUpdate();
    };
    const begin = () => {
        if (editing) return;
        editing = true;
        title.contentEditable = 'true';
        title.classList.add('is-editing');
        title.focus();
        const selection = window.getSelection?.();
        if (selection && document.createRange) {
            const range = document.createRange();
            range.selectNodeContents(title);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };
    title.tabIndex = 0;
    title.title = '双击修改状态栏标题；按 Enter 保存，Esc 取消';
    title.setAttribute('aria-label', `${originalTitle}，双击或按 Enter 修改状态栏标题`);
    title.addEventListener('dblclick', event => {
        event.preventDefault();
        begin();
    });
    title.addEventListener('keydown', event => {
        if (!editing && (event.key === 'Enter' || event.key === 'F2')) {
            event.preventDefault();
            begin();
            return;
        }
        if (!editing) return;
        if (event.key === 'Enter') {
            event.preventDefault();
            title.blur();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            cancelled = true;
            title.blur();
        }
    });
    title.addEventListener('blur', finish);
}

function persistPreviewFieldOrder(host, rule, scope) {
    const orderedIds = [...host.children]
        .filter(item => item.dataset?.field && item.dataset.previewScope === scope)
        .map(item => item.dataset.field);
    if (!orderedIds.length) return;
    if (rule.structure === 'phone' && scope === 'shared') {
        settings().phoneDesktop.widgetOrder = orderedIds.filter(id => PHONE_DESKTOP_DEFAULTS.widgetOrder.includes(id));
        renderPhoneDesktopControls();
    } else {
        const definitions = fieldDefinitions();
        const byId = new Map(definitions.filter(item => item.scope === scope).map(item => [item.id, item]));
        const ordered = orderedIds.map(id => byId.get(id)).filter(Boolean);
        byId.forEach(item => { if (!ordered.includes(item)) ordered.push(item); });
        let scopedIndex = 0;
        const merged = definitions.map(item => item.scope === scope ? ordered[scopedIndex++] : item);
        serializeFieldDefinitions(merged);
        renderStatusSchema();
        renderModalStatusSchema();
    }
    statusAiTestRecords = null;
    saveSettingsSoon({ snapshotOpening: false });
}

function bindPreviewFieldReorder(host, rule, scope) {
    const items = [...host.children].filter(item => item.dataset?.previewScope === scope);
    items.forEach(item => {
        const handle = item.querySelector('.status-atelier-preview-field-drag');
        if (!handle) return;
        handle.addEventListener('pointerdown', event => {
            if (event.button !== 0) return;
            event.preventDefault();
            event.stopPropagation();
            let changed = false;
            let dragging = false;
            const startX = event.clientX;
            const startY = event.clientY;
            handle.setPointerCapture?.(event.pointerId);
            const move = moveEvent => {
                moveEvent.preventDefault();
                if (!dragging && Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) < 6) return;
                if (!dragging) {
                    dragging = true;
                    item.classList.add('is-preview-dragging');
                }
                const candidates = [...host.children].filter(candidate => candidate !== item && candidate.dataset?.previewScope === scope);
                let nearest = null;
                let nearestDistance = Number.POSITIVE_INFINITY;
                candidates.forEach(candidate => {
                    const rect = candidate.getBoundingClientRect();
                    const dx = moveEvent.clientX - (rect.left + rect.width / 2);
                    const dy = moveEvent.clientY - (rect.top + rect.height / 2);
                    const distance = dx * dx + dy * dy;
                    if (distance < nearestDistance) {
                        nearest = candidate;
                        nearestDistance = distance;
                    }
                });
                if (!nearest) return;
                const rect = nearest.getBoundingClientRect();
                const after = Math.abs(moveEvent.clientY - (rect.top + rect.height / 2)) > rect.height * .35
                    ? moveEvent.clientY > rect.top + rect.height / 2
                    : moveEvent.clientX > rect.left + rect.width / 2;
                const anchor = after ? nearest.nextSibling : nearest;
                if (anchor !== item && item.nextSibling !== anchor) {
                    host.insertBefore(item, anchor);
                    changed = true;
                }
            };
            const finish = () => {
                handle.removeEventListener('pointermove', move);
                handle.removeEventListener('pointerup', finish);
                handle.removeEventListener('pointercancel', finish);
                item.classList.remove('is-preview-dragging');
                if (changed) persistPreviewFieldOrder(host, rule, scope);
            };
            handle.addEventListener('pointermove', move);
            handle.addEventListener('pointerup', finish);
            handle.addEventListener('pointercancel', finish);
        });
    });
}

function appendPreviewField(host, definition, value, shared = false, glyph = '✦', rule = null) {
    const item = makeElement('div', shared ? 'status-atelier-preview-shared-item zrs-shared-item' : 'status-atelier-preview-field zrs-field');
    const scope = shared ? 'shared' : 'page';
    item.dataset.kind = definition.kind;
    item.dataset.field = definition.id || '';
    item.dataset.previewScope = scope;
    if (rule?.structure === 'forum' && definition.id === 'floor_user') {
        const avatar = rule.media.avatarUrl
            ? makeElement('img', 'status-atelier-preview-forum-avatar zrs-forum-avatar')
            : makeElement('span', 'status-atelier-preview-forum-avatar zrs-forum-avatar is-placeholder', glyph);
        if (rule.media.avatarUrl) {
            avatar.src = rule.media.avatarUrl;
            avatar.alt = rule.media.imageAlt || '当前角色头像';
            avatar.loading = 'lazy';
            avatar.addEventListener('error', () => {
                avatar.removeAttribute('src');
                avatar.classList.add('is-placeholder');
                avatar.textContent = glyph;
            });
        }
        item.append(avatar);
    }
    const label = makeElement('span', 'status-atelier-preview-label zrs-label', definition.label);
    const dragHandle = makeElement('button', 'status-atelier-preview-field-drag', '⋮⋮');
    dragHandle.type = 'button';
    dragHandle.setAttribute('aria-label', `拖动${definition.label}调整顺序；也可在字段设置中使用上移和下移`);
    dragHandle.title = '拖动调整顺序';
    bindPreviewFieldLabelEditor(label, definition, scope);
    item.append(label);
    if (definition.kind === 'avatar') {
        const avatar = rule?.media?.avatarUrl
            ? makeElement('img', 'status-atelier-preview-field-avatar zrs-field-avatar')
            : makeElement('span', 'status-atelier-preview-field-avatar zrs-field-avatar is-placeholder', glyph);
        if (rule?.media?.avatarUrl) {
            avatar.src = rule.media.avatarUrl;
            avatar.alt = rule.media.imageAlt || String(value || definition.label);
            avatar.loading = 'lazy';
            avatar.addEventListener('error', () => {
                avatar.removeAttribute('src');
                avatar.classList.add('is-placeholder');
                avatar.textContent = glyph;
            });
        }
        item.append(avatar, makeElement('span', 'status-atelier-preview-value zrs-value zrs-avatar-caption', value));
    } else {
        item.append(makeElement('span', 'status-atelier-preview-value zrs-value', value));
    }
    if (definition.kind === 'progress') {
        const meter = makeElement('span', 'status-atelier-preview-meter zrs-meter');
        const parsed = Number(String(value || '').match(/-?\d+(?:\.\d+)?/)?.[0]);
        const percent = Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : 68;
        const fill = makeElement('i');
        fill.style.width = `${percent}%`;
        meter.append(fill);
        item.append(meter);
    }
    item.append(dragHandle);
    host.append(item);
}

function bindPhoneDiyDrag(root, sharedHost, wallpaperImage) {
    if (!root || !sharedHost) return;
    const stored = settings();
    const phone = stored.phoneDesktop;
    const bindDrag = (target, onMove, onFinish) => {
        if (!target) return;
        target.addEventListener('pointerdown', event => {
            if (event.button !== 0) return;
            if (event.target.closest?.('.status-atelier-preview-field-drag, .status-atelier-preview-label')) return;
            event.preventDefault();
            const startX = event.clientX;
            const startY = event.clientY;
            target.setPointerCapture?.(event.pointerId);
            const move = moveEvent => onMove(moveEvent.clientX - startX, moveEvent.clientY - startY);
            const finish = () => {
                target.removeEventListener('pointermove', move);
                target.removeEventListener('pointerup', finish);
                target.removeEventListener('pointercancel', finish);
                onFinish?.();
            };
            target.addEventListener('pointermove', move);
            target.addEventListener('pointerup', finish);
            target.addEventListener('pointercancel', finish);
        });
    };
    sharedHost.classList.add('is-diy-draggable');
    sharedHost.title = '拖动调整桌面信息组件位置';
    const widgetStart = { x: Number(phone.widgetX), y: Number(phone.widgetY) };
    bindDrag(sharedHost, (deltaX, deltaY) => {
        phone.widgetX = Math.max(8, Math.min(42, widgetStart.x + deltaX));
        phone.widgetY = Math.max(45, Math.min(300, widgetStart.y + deltaY));
        sharedHost.style.left = `${phone.widgetX}px`;
        sharedHost.style.top = `${phone.widgetY}px`;
    }, () => saveSettingsSoon({ snapshotOpening: false }));
    if (wallpaperImage) {
        wallpaperImage.classList.add('is-diy-draggable');
        wallpaperImage.title = '拖动调整壁纸取景';
        const wallpaperStart = { x: Number(phone.wallpaperPositionX), y: Number(phone.wallpaperPositionY) };
        bindDrag(wallpaperImage, (deltaX, deltaY) => {
            phone.wallpaperPositionX = Math.max(0, Math.min(100, wallpaperStart.x - deltaX / 2));
            phone.wallpaperPositionY = Math.max(0, Math.min(100, wallpaperStart.y - deltaY / 3));
            wallpaperImage.style.objectPosition = `${phone.wallpaperPositionX}% ${phone.wallpaperPositionY}%`;
            const xControl = field('status-atelier-phone-wallpaper-x');
            const yControl = field('status-atelier-phone-wallpaper-y');
            if (xControl) xControl.value = String(Math.round(phone.wallpaperPositionX));
            if (yControl) yControl.value = String(Math.round(phone.wallpaperPositionY));
        }, () => saveSettingsSoon({ snapshotOpening: false }));
    }
}

function bindPhoneAvatarDiy(avatarHolder, avatarImage) {
    if (!avatarHolder || !avatarImage) return;
    const phone = settings().phoneDesktop;
    const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
    const apply = () => {
        avatarImage.style.objectPosition = `${phone.personalAvatarPositionX}% ${phone.personalAvatarPositionY}%`;
        avatarImage.style.transform = `scale(${phone.personalAvatarScale})`;
    };
    const pointers = new Map();
    let dragStart = null;
    let pinchStart = null;
    const pointerDistance = () => {
        const [first, second] = [...pointers.values()];
        return first && second ? Math.hypot(second.x - first.x, second.y - first.y) : 0;
    };
    avatarHolder.classList.add('is-diy-draggable');
    avatarHolder.title = '拖动移动取景；滚轮或双指缩放';
    avatarImage.draggable = false;
    apply();
    avatarHolder.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        event.preventDefault();
        avatarHolder.setPointerCapture?.(event.pointerId);
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (pointers.size === 1) {
            dragStart = {
                x: event.clientX,
                y: event.clientY,
                positionX: Number(phone.personalAvatarPositionX),
                positionY: Number(phone.personalAvatarPositionY),
            };
        } else if (pointers.size === 2) {
            pinchStart = { distance: pointerDistance(), scale: Number(phone.personalAvatarScale) };
        }
    });
    avatarHolder.addEventListener('pointermove', event => {
        if (!pointers.has(event.pointerId)) return;
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (pointers.size >= 2 && pinchStart?.distance) {
            phone.personalAvatarScale = clamp(pinchStart.scale * pointerDistance() / pinchStart.distance, 1, 3);
        } else if (dragStart) {
            phone.personalAvatarPositionX = clamp(dragStart.positionX - (event.clientX - dragStart.x) * 0.9, 0, 100);
            phone.personalAvatarPositionY = clamp(dragStart.positionY - (event.clientY - dragStart.y) * 0.9, 0, 100);
        }
        apply();
    });
    const finishPointer = event => {
        if (!pointers.has(event.pointerId)) return;
        pointers.delete(event.pointerId);
        if (pointers.size === 1) {
            const [remaining] = pointers.values();
            dragStart = {
                x: remaining.x,
                y: remaining.y,
                positionX: Number(phone.personalAvatarPositionX),
                positionY: Number(phone.personalAvatarPositionY),
            };
            pinchStart = null;
        } else if (!pointers.size) {
            dragStart = null;
            pinchStart = null;
            saveSettingsSoon({ snapshotOpening: false });
        }
    };
    avatarHolder.addEventListener('pointerup', finishPointer);
    avatarHolder.addEventListener('pointercancel', finishPointer);
    avatarHolder.addEventListener('wheel', event => {
        event.preventDefault();
        phone.personalAvatarScale = clamp(Number(phone.personalAvatarScale) + (event.deltaY < 0 ? 0.1 : -0.1), 1, 3);
        apply();
        saveSettingsSoon({ snapshotOpening: false });
    }, { passive: false });
}

function renderStatusPreview(host) {
    if (!host) return;
    if (!document.querySelector('#status-atelier-exported-theme-css')) {
        const style = document.createElement('style');
        style.id = 'status-atelier-exported-theme-css';
        style.textContent = `${STATUS_THEME_CSS}\n${STATUS_PHONE_CSS}`;
        document.head.append(style);
    }
    if (!document.querySelector('#status-atelier-phone-font')) {
        const phoneFont = document.createElement('link');
        phoneFont.id = 'status-atelier-phone-font';
        phoneFont.rel = 'stylesheet';
        phoneFont.href = 'https://fontsapi.zeoseven.com/813/main/result.css';
        phoneFont.crossOrigin = 'anonymous';
        document.head.append(phoneFont);
    }
    const previewInput = resolvedStatusInput();
    const previewRecords = statusAiTestRecords || makePreviewRecords(previewInput);
    const { rule, shared, pages } = previewRecords;
    const root = makeElement('section', 'status-atelier-rule-preview zeya-regex-status');
    root.dataset.theme = rule.theme;
    root.dataset.structure = rule.structure;
    root.dataset.variant = rule.variant;
    root.dataset.layout = rule.layout;
    root.dataset.hasImage = rule.media.imageUrl ? 'true' : 'false';
    if (rule.palette) {
        root.style.setProperty('--sap-accent', rule.palette.accent);
        root.style.setProperty('--sap-layer', rule.palette.background);
        root.style.setProperty('--sap-card', rule.palette.card);
        root.style.setProperty('--sap-text', rule.palette.text);
        root.style.setProperty('--sap-muted', rule.palette.muted);
        root.style.setProperty('--z-accent', rule.palette.accent);
        root.style.setProperty('--z-bg', rule.palette.background);
        root.style.setProperty('--z-card', rule.palette.card);
        root.style.setProperty('--z-text', rule.palette.text);
        root.style.setProperty('--z-muted', rule.palette.muted);
    }

    const card = makeElement('section', 'status-atelier-preview-card zrs-card');
    const chrome = makeElement('div', 'status-atelier-preview-chrome zrs-chrome');
    const previewGlyph = makeElement('span', 'status-atelier-preview-glyph zrs-glyph');
    paintRuleLogo(previewGlyph, rule);
    chrome.append(
        previewGlyph,
        makeElement('span', 'status-atelier-preview-style-name zrs-style-name', rule.styleName),
        makeElement('i'),
        makeElement('i'),
        makeElement('i'),
    );
    card.append(chrome);

    const header = makeElement('header', 'status-atelier-rule-preview-header zrs-header');
    const heading = makeElement('div');
    const previewTitle = makeElement('h3', 'status-atelier-rule-preview-title zrs-title', rule.title);
    bindPreviewTitleEditor(previewTitle);
    heading.append(previewTitle, makeElement('p', 'status-atelier-rule-preview-subtitle zrs-subtitle', rule.subtitle));
    header.append(heading, makeElement('span', 'status-atelier-preview-dynamic-badge', 'AI 动态数值'));
    card.append(header);

    const body = makeElement('div', 'status-atelier-rule-preview-body zrs-content');
    const structureArt = makeElement('div', 'status-atelier-preview-structure-art zrs-structure-art');
    structureArt.setAttribute('aria-hidden', 'true');
    for (let index = 0; index < 12; index += 1) structureArt.append(makeElement('i'));
    body.append(structureArt);
    if (rule.structure === 'music') {
        structureArt.removeAttribute('aria-hidden');
        const pianoKeys = [...structureArt.querySelectorAll('i')];
        pianoKeys.forEach((key, index) => {
            key.classList.add('zrs-piano-key');
            key.tabIndex = 0;
            key.setAttribute('role', 'button');
            key.setAttribute('aria-label', `琴键 ${index + 1}`);
            const activate = () => {
                pianoKeys.forEach(item => item.classList.toggle('is-active', item === key));
                window.setTimeout(() => key.classList.remove('is-active'), 180);
            };
            key.addEventListener('click', activate);
            key.addEventListener('keydown', event => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                activate();
            });
        });
    }
    if (rule.structure === 'quest') {
        structureArt.removeAttribute('aria-hidden');
        const questValues = pages[0]?.values || [];
        [['当前区域', questValues[0]], ['下一节点', questValues[3]], ['任务目标', questValues[1]]].forEach(([label, value]) => {
            const node = makeElement('button', 'zrs-map-node', label);
            node.type = 'button';
            node.title = String(value || label);
            node.addEventListener('click', () => {
                structureArt.querySelectorAll('.zrs-map-node').forEach(button => button.classList.toggle('is-active', button === node));
            });
            structureArt.append(node);
        });
    }
    let phoneWallpaperImage = null;
    if (rule.structure === 'phone') {
        const wallpaper = makeElement('div', 'zrs-phone-wallpaper');
        wallpaper.setAttribute('aria-hidden', 'true');
        if (rule.phoneDesktop.wallpaperUrl) {
            phoneWallpaperImage = makeElement('img');
            phoneWallpaperImage.src = rule.phoneDesktop.wallpaperUrl;
            phoneWallpaperImage.alt = '';
            phoneWallpaperImage.draggable = false;
            phoneWallpaperImage.style.objectPosition = `${rule.phoneDesktop.wallpaperPositionX}% ${rule.phoneDesktop.wallpaperPositionY}%`;
            phoneWallpaperImage.addEventListener('error', () => phoneWallpaperImage.remove());
            wallpaper.append(phoneWallpaperImage);
        }
        body.append(wallpaper);
        if (rule.phoneDesktop.petalsEnabled !== false) {
            const petals = makeElement('div', 'zrs-phone-petals');
            petals.setAttribute('aria-hidden', 'true');
            for (let index = 0; index < 15; index += 1) petals.append(makeElement('i'));
            body.append(petals);
        }
    }
    const mediaHost = makeElement('div', 'status-atelier-preview-media zrs-structure-head');
    const hasAvatarField = rule.sharedFields.some(item => item.kind === 'avatar')
        || rule.pageFields.some(item => item.kind === 'avatar')
        || rule.pages.some(page => page.fields?.some(item => item.kind === 'avatar'));
    const addPreviewImage = (url, className, alt) => {
        if (!url) return;
        const image = makeElement('img', className);
        image.src = url;
        image.alt = alt || '';
        image.loading = 'lazy';
        image.addEventListener('error', () => image.remove());
        mediaHost.append(image);
    };
    if (rule.structure !== 'forum' && !hasAvatarField) addPreviewImage(rule.media.avatarUrl, 'status-atelier-preview-avatar zrs-avatar', rule.media.imageAlt);
    addPreviewImage(rule.media.imageUrl, 'status-atelier-preview-cover zrs-cover', rule.media.imageAlt);
    if (rule.media.audioUrl) {
        const audio = makeElement('audio', 'status-atelier-preview-audio zrs-audio');
        audio.controls = true;
        audio.preload = 'metadata';
        audio.src = rule.media.audioUrl;
        mediaHost.append(audio);
    }
    if (mediaHost.children.length) body.append(mediaHost);
    let phoneSharedHost = null;
    if (rule.sharedFields.length) {
        const sharedHost = makeElement('div', 'status-atelier-preview-shared zrs-shared');
        const definitions = rule.sharedFields.map((definition, index) => ({ definition, value: shared[index] }));
        if (rule.structure === 'phone') {
            definitions.sort((a, b) => rule.phoneDesktop.widgetOrder.indexOf(a.definition.id) - rule.phoneDesktop.widgetOrder.indexOf(b.definition.id));
            sharedHost.style.left = `${rule.phoneDesktop.widgetX}px`;
            sharedHost.style.top = `${rule.phoneDesktop.widgetY}px`;
            phoneSharedHost = sharedHost;
        }
        definitions.forEach(item => appendPreviewField(sharedHost, item.definition, item.value, true, rule.glyph, rule));
        bindPreviewFieldReorder(sharedHost, rule, 'shared');
        body.append(sharedHost);
    }

    const tabs = makeElement('div', 'status-atelier-preview-tabs zrs-tabs');
    const phonePagebar = makeElement('div', 'zrs-phone-pagebar');
    const phoneBack = makeElement('button', 'zrs-phone-back', '‹');
    phoneBack.type = 'button';
    phoneBack.setAttribute('aria-label', '返回状态主页');
    const phoneTitle = makeElement('h4', 'zrs-phone-page-title');
    phonePagebar.append(phoneBack, phoneTitle);
    const pageHost = makeElement('div', 'status-atelier-preview-fields zrs-fields');
    const phoneMode = rule.structure === 'phone';
    const phoneText = (value, fallback = '') => {
        const text = String(value || '').trim();
        return !text || text === '无' ? fallback : text;
    };
    const phoneDataCard = (definition, value, extraClass = '') => {
        const progress = definition?.kind === 'progress';
        const card = makeElement('div', `zrs-phone-data-card${extraClass ? ` ${extraClass}` : ''}`);
        const head = makeElement('div', 'zrs-phone-data-head');
        const label = makeElement('span', 'zrs-phone-data-label', definition?.label || '未命名字段');
        bindPhonePersonalFieldLabelEditor(label, definition);
        head.append(label);
        if (progress) head.append(makeElement('span', '', `${phoneText(value, '68')}/100`));
        card.append(head);
        if (progress) {
            const bar = makeElement('div', 'zrs-phone-bar');
            const fill = makeElement('i');
            const parsed = Number(String(value || '').match(/-?\d+(?:\.\d+)?/)?.[0]);
            fill.style.width = `${Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : 68}%`;
            bar.append(fill);
            card.append(bar);
        } else {
            card.append(makeElement('div', 'zrs-phone-copy', phoneText(value, '暂无记录')));
        }
        return card;
    };
    const renderPhonePage = (page, values) => {
        pageHost.replaceChildren();
        root.dataset.phonePage = page.id;
        phoneTitle.textContent = page.label;
        if (page.id === 'Personal') {
            const personalFields = page.fields || rule.phoneDesktop.personalFields || [];
            const hero = makeElement('div', 'zrs-phone-personal-hero');
            const avatarUrl = rule.phoneDesktop.personalAvatarUrl || rule.media.avatarUrl;
            const avatar = makeElement('div', `zrs-phone-avatar${avatarUrl ? '' : ' is-placeholder'}`);
            if (avatarUrl) {
                const avatarImage = makeElement('img');
                avatarImage.src = avatarUrl;
                avatarImage.alt = rule.media.imageAlt || '当前角色头像';
                avatarImage.style.objectPosition = `${rule.phoneDesktop.personalAvatarPositionX}% ${rule.phoneDesktop.personalAvatarPositionY}%`;
                avatarImage.style.transform = `scale(${rule.phoneDesktop.personalAvatarScale})`;
                avatarImage.addEventListener('error', () => {
                    avatarImage.remove();
                    avatar.classList.add('is-placeholder');
                });
                avatar.append(avatarImage);
                bindPhoneAvatarDiy(avatar, avatarImage);
            }
            hero.append(avatar);
            pageHost.append(
                hero,
                phoneDataCard(personalFields[0], values[0]),
                phoneDataCard(personalFields[1], values[1], 'is-desire'),
                phoneDataCard(personalFields[2], values[2], 'is-wide'),
                phoneDataCard(personalFields[3], values[3], 'is-wide is-thought'),
            );
            return;
        }
        if (page.id === 'Memo') {
            values.filter(value => phoneText(value)).forEach(value => pageHost.append(makeElement('div', 'zrs-phone-list-card', value)));
            if (!pageHost.children.length) pageHost.append(makeElement('div', 'zrs-phone-empty', '暂无备忘事项'));
            return;
        }
        if (page.id === 'Wechat') {
            phoneTitle.textContent = phoneText(values[0], '未知');
            values.slice(1).forEach((value, index) => {
                if (phoneText(value)) pageHost.append(makeElement('div', `zrs-phone-chat ${index % 2 === 0 ? 'is-left' : 'is-right'}`, value));
            });
            if (!pageHost.children.length) pageHost.append(makeElement('div', 'zrs-phone-empty', '暂无聊天记录'));
            return;
        }
        for (let index = 0; index < values.length; index += 2) {
            const itemName = phoneText(values[index]);
            if (!itemName) continue;
            const detail = makeElement('details', 'zrs-phone-shop');
            detail.append(
                makeElement('summary', '', itemName),
                makeElement('div', 'zrs-phone-shop-desc', phoneText(values[index + 1], '暂无说明')),
            );
            pageHost.append(detail);
        }
        if (!pageHost.children.length) pageHost.append(makeElement('div', 'zrs-phone-empty', '购物车空空如也'));
    };
    const showPage = index => {
        pageHost.replaceChildren();
        const page = pages[index]?.page;
        const values = pages[index]?.values || [];
        if (phoneMode) renderPhonePage(page, values);
        else (page?.fields || rule.pageFields).forEach((definition, fieldIndex) => {
            appendPreviewField(pageHost, definition, values[fieldIndex] || previewValue(definition), false, rule.glyph, rule);
        });
        if (!phoneMode) bindPreviewFieldReorder(pageHost, rule, 'page');
        [...tabs.children].forEach((button, buttonIndex) => button.classList.toggle('is-active', buttonIndex === index));
        if (phoneMode) {
            root.classList.remove('is-phone-home');
        }
    };
    pages.forEach(({ page }, index) => {
        const button = makeElement('button', 'status-atelier-preview-tab zrs-tab');
        button.type = 'button';
        if (phoneMode) {
            const app = rule.phoneDesktop.apps.find(item => item.id === page.id);
            const icon = makeElement('span', 'zrs-app-icon');
            icon.dataset.appId = page.id;
            icon.innerHTML = phoneAppIconMarkup(page.id);
            if (app?.iconUrl) {
                const image = makeElement('img', 'zrs-app-icon-image');
                image.src = app.iconUrl;
                image.alt = '';
                image.addEventListener('error', () => {
                    image.remove();
                    icon.classList.remove('has-custom-icon');
                });
                icon.classList.add('has-custom-icon');
                icon.append(image);
            }
            button.append(icon, makeElement('span', 'zrs-app-label', app?.name || page.label));
        } else {
            button.textContent = page.label;
        }
        button.addEventListener('click', () => showPage(index));
        tabs.append(button);
    });
    phoneBack.addEventListener('click', () => {
        root.classList.add('is-phone-home');
        [...tabs.children].forEach(button => button.classList.remove('is-active'));
    });
    if (pages.length > 1 || phoneMode) body.append(tabs);
    body.append(phonePagebar);
    body.append(pageHost);
    card.append(body);
    root.append(card);
    host.replaceChildren(root);
    if (phoneMode) {
        root.classList.add('is-phone-home');
        pageHost.replaceChildren();
        bindPhoneDiyDrag(root, phoneSharedHost, phoneWallpaperImage);
    } else {
        showPage(0);
    }
}

function updatePreview() {
    renderStatusPreview(field('status-atelier-preview'));
    renderStatusPreview(greetingModal?.querySelector('#status-atelier-modal-status-preview'));
}

function refreshStatusAppearancePreview() {
    const rule = normalizeRule(resolvedStatusInput());
    const roots = [
        field('status-atelier-preview')?.querySelector('.status-atelier-rule-preview'),
        greetingModal?.querySelector('#status-atelier-modal-status-preview .status-atelier-rule-preview'),
    ].filter(Boolean);
    if (!roots.length) return updatePreview();
    roots.forEach(root => {
        root.dataset.theme = rule.theme;
        root.dataset.layout = rule.layout;
        const glyph = root.querySelector('.status-atelier-preview-glyph');
        if (glyph) paintRuleLogo(glyph, rule);
        root.querySelector('.status-atelier-preview-style-name')?.replaceChildren(document.createTextNode(rule.styleName));
    });
}

function refreshStatusPalettePreview() {
    const palette = normalizeRule(resolvedStatusInput()).palette;
    const roots = [
        field('status-atelier-preview')?.querySelector('.status-atelier-rule-preview'),
        greetingModal?.querySelector('#status-atelier-modal-status-preview .status-atelier-rule-preview'),
    ].filter(Boolean);
    if (!roots.length) return updatePreview();
    roots.forEach(root => {
        root.style.setProperty('--sap-accent', palette.accent);
        root.style.setProperty('--sap-layer', palette.background);
        root.style.setProperty('--sap-card', palette.card);
        root.style.setProperty('--sap-text', palette.text);
        root.style.setProperty('--sap-muted', palette.muted);
        root.style.setProperty('--z-accent', palette.accent);
        root.style.setProperty('--z-bg', palette.background);
        root.style.setProperty('--z-card', palette.card);
        root.style.setProperty('--z-text', palette.text);
        root.style.setProperty('--z-muted', palette.muted);
    });
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
    return String(value || 'jiuyi-status').replace(/[\\/:*?"<>|\x00-\x1f]/g, '_').trim() || 'jiuyi-status';
}

function downloadRegex() {
    const script = buildRegexScript(resolvedStatusInput());
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

async function installStatusWorldbookRule() {
    const ctx = context();
    const characterId = ctx?.characterId;
    const character = ctx?.characters?.[characterId];
    if (!ctx || ctx.groupId || characterId === undefined || characterId === null || !character) {
        throw new Error('请先打开一个单人角色聊天，再写入状态栏世界书');
    }
    if (!character.avatar) throw new Error('当前角色缺少可绑定世界书的角色标识');

    const stored = settings();
    const storageKey = characterStorageKey(ctx);
    const bindings = stored.statusWorldbookBindings;
    const bookName = String(bindings[storageKey] || buildStatusWorldbookName(character, storageKey));
    if (!(world_names || []).includes(bookName)) {
        const created = await createNewWorldInfo(bookName, { interactive: false });
        if (!created) throw new Error('无法创建当前角色的状态栏世界书');
    }

    const current = await loadWorldInfo(bookName);
    const generatedEntry = buildWorldbookJson(resolvedStatusInput()).entries[0];
    const result = upsertStatusWorldbookData(current, generatedEntry);
    await saveWorldInfo(bookName, result.data, true);
    await charUpdateAddAuxWorld(character.avatar, bookName);

    const fileName = getCharaFilename(null, { manualAvatarKey: character.avatar });
    const linked = world_info?.charLore?.find(item => item?.name === fileName)?.extraBooks || [];
    if (!linked.includes(bookName)) throw new Error('世界书输出规则已保存，但没有绑定到当前角色');

    const confirmed = await loadWorldInfo(bookName);
    const entry = Object.values(confirmed?.entries || {}).find(item => item?.automationId === STATUS_WORLDBOOK_ENTRY_ID);
    if (!entry || entry.disable || !entry.constant || entry.content !== generatedEntry.content) {
        throw new Error('世界书没有确认状态栏输出规则已保存');
    }
    bindings[storageKey] = bookName;
    return { bookName, uid: Number(entry.uid), created: result.created };
}

async function installGlobalStatusWorldbookRule() {
    const bookName = '九一-状态栏-全局输出规则';
    if (!(world_names || []).includes(bookName)) {
        const created = await createNewWorldInfo(bookName, { interactive: false });
        if (!created) throw new Error('无法创建全局状态栏世界书');
    }

    const current = await loadWorldInfo(bookName);
    const generatedEntry = buildWorldbookJson(resolvedStatusInput()).entries[0];
    const result = upsertStatusWorldbookData(current, generatedEntry);
    await saveWorldInfo(bookName, result.data, true);
    if (!selected_world_info.includes(bookName)) selected_world_info.push(bookName);
    world_info.globalSelect = [...selected_world_info];
    await saveSettings();

    const confirmed = await loadWorldInfo(bookName);
    const entry = Object.values(confirmed?.entries || {}).find(item => item?.automationId === STATUS_WORLDBOOK_ENTRY_ID);
    if (!selected_world_info.includes(bookName) || !entry || entry.disable || !entry.constant || entry.content !== generatedEntry.content) {
        throw new Error('全局世界书没有确认启用状态栏输出规则');
    }
    return { bookName, uid: Number(entry.uid), created: result.created };
}

async function installRegex(scope) {
    const worldbook = scope === 'scoped'
        ? await installStatusWorldbookRule()
        : await installGlobalStatusWorldbookRule();
    await installGeneratedRegex(buildRegexScript(resolvedStatusInput()), scope);
    settings().promptEnabled = false;
    const promptToggle = field('status-atelier-prompt-enabled');
    if (promptToggle) promptToggle.checked = settings().promptEnabled;
    updatePrompt();
    notify('success', scope === 'scoped'
        ? `当前角色状态栏已完整启用：世界书“${worldbook.bookName}”与局部正则均已更新`
        : `全局状态栏已完整启用：世界书“${worldbook.bookName}”与全局正则均已更新`);
    return worldbook;
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
    delete exported.openingProfiles;
    delete exported.openingLegacyBackup;
    delete exported.statusWorldbookBindings;
    if (exported.openingSummary) delete exported.openingSummary.apiKey;
    downloadJson('jiuyi-regex-status-profile.json', { format: 'jiuyi-regex-status-profile', version: 2, settings: exported });
}

async function importProfile(fileToImport) {
    const data = JSON.parse(await fileToImport.text());
    if (!['jiuyi-regex-status-profile', 'zeya-regex-status-profile'].includes(data?.format) || !data.settings || typeof data.settings !== 'object') {
        throw new Error('这不是九一正则状态工坊配置');
    }
    const notes = settings().openingNotes;
    const profiles = settings().openingProfiles;
    const legacyBackup = settings().openingLegacyBackup;
    const statusWorldbookBindings = settings().statusWorldbookBindings;
    const apiKey = settings().openingSummary?.apiKey || '';
    const stored = settings();
    Object.assign(stored, clone(DEFAULT_SETTINGS), data.settings, {
        openingNotes: notes,
        openingProfiles: profiles,
        openingLegacyBackup: legacyBackup,
        statusWorldbookBindings,
        openingProfilesMigrated: true,
        preset: 'custom',
    });
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

function snapshotCurrentOpeningProfile() {
    if (!activeOpeningProfileKey) return;
    const stored = settings();
    stored.openingProfiles[activeOpeningProfileKey] = clone(stored.openingHome);
}

function switchOpeningProfileForCurrentCharacter() {
    const nextKey = characterStorageKey();
    if (nextKey === activeOpeningProfileKey) return false;
    const stored = settings();
    const switched = switchOpeningHomeProfile({
        profiles: stored.openingProfiles,
        previousKey: activeOpeningProfileKey,
        nextKey,
        currentHome: stored.openingHome,
        defaultHome: OPENING_HOME_DEFAULTS,
    });
    stored.openingProfiles = switched.profiles;
    stored.openingHome = switched.home;
    stored.openingReadStatus = nextKey ? '已切换到当前角色的独立主页草稿。' : '请先打开一个单人角色聊天。';
    stored.openingReadState = 'idle';
    activeOpeningProfileKey = nextKey;
    return true;
}

function parseGreetingMetadata(raw) {
    const source = String(raw || '');
    const title = source.match(/<!--\s*(?:title|标题)\s*[:：]\s*([\s\S]*?)-->/i)?.[1]?.trim() || '';
    const route = source.match(/<!--\s*(?:route|line|路线|线路)\s*[:：]\s*([\s\S]*?)-->/i)?.[1]?.trim() || '';
    const summary = source.match(/<!--\s*(?:desc|description|summary|简介)\s*[:：]\s*([\s\S]*?)-->/i)?.[1]?.trim() || '';
    return { title, route, summary };
}

function alternateGreetingData(rawEntriesOverride = null) {
    const ctx = context();
    const key = characterStorageKey(ctx);
    const character = ctx?.characters?.[ctx?.characterId];
    const data = character?.data || character || {};
    const rawEntries = Array.isArray(rawEntriesOverride)
        ? rawEntriesOverride
        : [
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

function currentOpeningHomeCharacterPlan() {
    switchOpeningProfileForCurrentCharacter();
    const ctx = context();
    if (!ctx || ctx.groupId || ctx.characterId === undefined || ctx.characterId === null) {
        throw new Error('请先打开一个单人角色聊天');
    }
    const character = ctx.characters?.[ctx.characterId];
    if (!character) throw new Error('没有找到当前角色卡');
    const data = character.data || character;
    const alternateGreetings = [
        data?.alternate_greetings,
        character?.alternate_greetings,
    ].find(Array.isArray) || [];
    return planOpeningHomeCharacterUpdate(
        character.first_mes ?? data?.first_mes ?? '',
        alternateGreetings,
        buildOpeningHomeBlock(settings().openingHome),
    );
}

async function applyOpeningHomeCharacterPlan(plan) {
    const ctx = context();
    const characterId = ctx?.characterId;
    const character = ctx?.characters?.[characterId];
    if (!ctx || ctx.groupId || characterId === undefined || characterId === null || !character) {
        throw new Error('请先打开一个单人角色聊天');
    }
    const form = document.querySelector('#form_create');
    const firstMessageField = document.querySelector('#firstmessage_textarea');
    if (!form || form.getAttribute('actiontype') !== 'editcharacter' || !firstMessageField) {
        throw new Error('当前角色编辑器尚未准备好，请重新打开角色聊天后再试');
    }
    const alternateControl = document.querySelector('.open_alternate_greetings');
    const jq = globalThis.jQuery || globalThis.$;
    const boundCharacterId = jq && alternateControl ? jq(alternateControl).data('chid') : alternateControl?.dataset?.chid;
    if (String(boundCharacterId) !== String(characterId)) {
        throw new Error('角色编辑器与当前聊天不是同一角色，请重新打开当前角色后再试');
    }

    character.data ??= {};
    const originalAlternateGreetings = Array.isArray(character.data.alternate_greetings) ? [...character.data.alternate_greetings] : [];
    const hadLegacyAlternateGreetings = Object.hasOwn(character, 'alternate_greetings');
    const originalLegacyAlternateGreetings = hadLegacyAlternateGreetings && Array.isArray(character.alternate_greetings)
        ? [...character.alternate_greetings]
        : [];
    character.data.alternate_greetings = [...plan.alternateGreetings];
    if (hadLegacyAlternateGreetings) character.alternate_greetings = [...plan.alternateGreetings];
    firstMessageField.value = plan.marker;

    await createOrEditCharacter(new Event('submit'));
    const updatedCharacter = context()?.characters?.[characterId];
    const savedFirstMessage = String(updatedCharacter?.first_mes ?? updatedCharacter?.data?.first_mes ?? '').trim();
    const savedAlternateGreetings = updatedCharacter?.data?.alternate_greetings ?? updatedCharacter?.alternate_greetings;
    const alternateGreetingsConfirmed = Array.isArray(savedAlternateGreetings)
        && savedAlternateGreetings.length === plan.alternateGreetings.length
        && savedAlternateGreetings.every((value, index) => String(value) === plan.alternateGreetings[index]);
    if (savedFirstMessage !== plan.marker || !alternateGreetingsConfirmed) {
        character.data.alternate_greetings = originalAlternateGreetings;
        if (hadLegacyAlternateGreetings) character.alternate_greetings = originalLegacyAlternateGreetings;
        firstMessageField.value = plan.originalFirstMessage;
        throw new Error('酒馆没有确认主开场白已保存；请重新打开角色卡核对，插件不会自动重试');
    }

    const currentContext = context();
    const currentGreeting = currentContext?.chat?.[0];
    if (shouldReplaceCurrentChatGreeting(currentGreeting, plan.originalFirstMessage, plan.marker)) {
        currentGreeting.mes = plan.marker;
        if (currentGreeting.extra && Object.hasOwn(currentGreeting.extra, 'display_text')) delete currentGreeting.extra.display_text;
        currentContext.updateMessageBlock?.(0, currentGreeting);
        await currentContext.saveChat?.();
    }
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

async function testStatusAiGeneration(button) {
    const status = field('status-atelier-ai-test-status');
    const original = button.textContent;
    button.disabled = true;
    button.textContent = '正在调用当前模型…';
    if (status) {
        status.textContent = '正在使用酒馆当前模型、Key 与预设生成一份状态数据；不会读取或显示 Key。';
        status.dataset.state = 'loading';
    }
    try {
        const input = resolvedStatusInput();
        const rule = normalizeRule(input);
        const prompt = [
            '请做一次状态栏生成连通测试。根据当前对话能够判断的信息填写；无法确定的内容可以合理概括。',
            '只输出一份完整状态区块，不要解释，不要代码块。',
            buildAiInstruction(input),
        ].join('\n\n');
        const response = await generateWithCurrentPreset(prompt);
        statusAiTestRecords = parseStatusOutput(input, response);
        updatePreview();
        if (status) {
            status.textContent = `测试通过：模型返回了 ${rule.pages.length} 个页面、每页 ${rule.pageFields.length} 个完整动态字段，右侧预览已换成真实生成结果。`;
            status.dataset.state = 'success';
        }
        notify('success', '状态栏 AI 生成测试通过');
    } catch (error) {
        statusAiTestRecords = null;
        updatePreview();
        if (status) {
            status.textContent = `测试失败：${error?.message || '模型没有返回可解析的完整状态区块'}`;
            status.dataset.state = 'error';
        }
        notify('error', error?.message || '状态栏 AI 生成测试失败');
    } finally {
        button.disabled = false;
        button.textContent = original;
    }
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

function needsGeneratedHomeTitle() {
    const title = String(settings().openingHome.title || '').trim();
    return !title || title === OPENING_HOME_DEFAULTS.title;
}

function needsGeneratedHomeSubtitle() {
    const subtitle = String(settings().openingHome.subtitle || '').trim();
    return !subtitle || subtitle === OPENING_HOME_DEFAULTS.subtitle;
}

function fallbackGreetingMetadata(entry) {
    const number = (entry?.index ?? 0) + 1;
    return {
        title: `未命名开局 ${number}`,
        route: '未分类线',
        summary: 'AI 未返回有效路线简介，请重写本条或手动填写。',
    };
}

async function summarizeGreetingsBatch(entries, { overwrite = false, includeHomepage = true, syncBindings = true } = {}) {
    const config = settings().openingSummary;
    const routeCatalog = await currentWorldbookRouteCatalog();
    const routeWorldlineIds = syncBindings ? syncWorldbookRouteBindings(routeCatalog) : {};
    const requested = overwrite ? entries : entries.filter(entry => !entry.title || !entry.route || !entry.summary);
    const homepageFields = includeHomepage ? [
        ...(needsGeneratedHomeTitle() ? ['homeTitle'] : []),
        ...(needsGeneratedHomeSubtitle() ? ['homeSubtitle'] : []),
        ...(needsGeneratedWorkIntro() ? ['workIntro'] : []),
    ] : [];
    const makeHomepage = Boolean(homepageFields.length);
    if (!requested.length && !makeHomepage) return { entries: new Map(), homeTitle: '', homeSubtitle: '', workIntro: '', routeLabels: worldbookRouteLabels(routeCatalog), routeWorldlineIds };
    const sourceEntries = makeHomepage ? entries : requested;
    const homepageContext = makeHomepage ? await currentCharacterHomepageContext() : '';
    const chunks = [];
    for (let index = 0; index < sourceEntries.length; index += 4) chunks.push(sourceEntries.slice(index, index + 4));
    const parsed = { entries: new Map(), homeTitle: '', homeSubtitle: '', workIntro: '' };
    const warnings = [];
    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
        const chunk = chunks[chunkIndex];
        const includeHomepage = makeHomepage && chunkIndex === 0;
        const source = chunk.map(entry => `--- 额外问候语 #${entry.index + 1} ---\n${String(entry.raw).slice(0, 900)}`).join('\n\n');
        const introContext = includeHomepage
            ? `\n\n角色卡与世界观资料（只用于补全缺失的主页资料）：\n${homepageContext || '角色卡没有提供额外背景字段，请只依据开场白概括。'}\n\n全篇开局线索：\n${sourceEntries.map(entry => `#${entry.index + 1} ${String(entry.raw).slice(0, 260)}`).join('\n').slice(0, 2600)}`
            : '';
        const homepageExample = homepageFields.map(key => `"${key}":"${key === 'homeTitle' ? '作品短标题' : key === 'homeSubtitle' ? '小副标题' : '作品总简介'}"`).join(',');
        const outputExample = includeHomepage
            ? `{${homepageExample}${homepageExample ? ',' : ''}"entries":[{"index":1,"title":"短标题","route":"世界书线路名","summary":"路线简介"}]}`
            : '{"entries":[{"index":1,"title":"短标题","route":"世界书线路名","summary":"路线简介"}]}';
        const homepageRules = includeHomepage ? [
            homepageFields.includes('homeTitle') ? 'homeTitle 为 4 到 10 个汉字的作品主页短标题；' : '',
            homepageFields.includes('homeSubtitle') ? 'homeSubtitle 为简短的小副标题，可用中文或英文，不超过 24 字；' : '',
            homepageFields.includes('workIntro') ? 'workIntro 为 80 到 160 个汉字，综合角色设定、世界观背景、主要人物关系与总体开局；若资料中没有明确世界观，不得凭空编造；' : '',
        ].filter(Boolean).join('\n') : '';
        const prompt = `你是互动故事的目录编辑。请补全缺失的主页资料并制作开场目录。已经由用户填写的主页资料不会发送给你，也绝不能改写。\n\n严格只输出 JSON，不要 Markdown，不要思考过程：\n${outputExample}\n\n世界书线路：\n${routeCatalogPrompt(routeCatalog)}\n\n写作标准：\n${homepageRules}\n1. title 为 4 到 12 个汉字的文学化短标题，体现该开局的基调或核心事件，禁止把正文第一句截断后当标题；\n2. route 只能逐字选择上面世界书中已经存在的线路名；同一线路允许对应多条开场，禁止自创或为了避免重复而改名；\n3. summary 为 28 到 50 个汉字的一句话，明确写出“谁处于什么情境、正在做什么、发生了什么”，只介绍本开局，不剧透后续；\n4. 本批每个输入编号都必须返回，index 必须使用输入中的数字；短标题不能重复。\n\n${source}${introContext}`;
        let responseText = '';
        try {
            if (config.source === 'main') {
                responseText = await generateWithCurrentPreset(prompt, schemaWithRouteCatalog(includeHomepage ? BATCH_SUMMARY_JSON_SCHEMA : ENTRY_BATCH_JSON_SCHEMA, routeCatalog, true, includeHomepage ? homepageFields : null));
            } else {
                responseText = await requestExternalSummary(prompt, 4096);
            }
        } catch (error) {
            warnings.push(generationErrorMessage(error) || error?.message || `第 ${chunkIndex + 1} 批没有返回可用正文`);
        }
        if (!responseText) continue;
        try {
            const chunkParsed = parseBatchSummaryResponse(responseText, chunk);
            if (!parsed.homeTitle && chunkParsed.homeTitle) parsed.homeTitle = chunkParsed.homeTitle;
            if (!parsed.homeSubtitle && chunkParsed.homeSubtitle) parsed.homeSubtitle = chunkParsed.homeSubtitle;
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
    return { ...parsed, routeLabels: worldbookRouteLabels(routeCatalog), routeWorldlineIds, fallbackCount: missing.length, formatWarning: warnings.join('；') };
}

async function readGreetingsIntoOpeningHome({ overwrite = false, rawEntries = null, includeHomepage = true } = {}) {
    const data = alternateGreetingData(rawEntries);
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

    const batch = await summarizeGreetingsBatch(data.entries, { overwrite, includeHomepage });
    if (batch.homeTitle && needsGeneratedHomeTitle()) {
        settings().openingHome.title = batch.homeTitle;
        const titleControl = field('status-atelier-opening-home-title');
        if (titleControl) titleControl.value = batch.homeTitle;
    }
    if (batch.homeSubtitle && needsGeneratedHomeSubtitle()) {
        settings().openingHome.subtitle = batch.homeSubtitle;
        const subtitleControl = field('status-atelier-opening-home-subtitle');
        if (subtitleControl) subtitleControl.value = batch.homeSubtitle;
    }
    if (batch.workIntro && needsGeneratedWorkIntro()) {
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
        generated[index].worldlineId = batch.routeWorldlineIds?.[generated[index].route] || generated[index].worldlineId || '';
        if (data.key) {
            settings().openingNotes[data.key] ??= {};
            settings().openingNotes[data.key][entry.sourceIndex ?? index] = { title: generated[index].title, route: generated[index].route, summary: generated[index].summary };
        }
        renderOpeningHomeEntries();
        renderGreetingList();
    }
    renderOpeningWorldlines();
    saveSettingsSoon();
    const fallbackNotice = batch.fallbackCount ? `；其中 ${batch.fallbackCount} 条未取得有效 AI 目录，已保留为明确的待编辑项` : '';
    const routeNotice = batch.routeLabels?.length ? `；线路取自世界书：${batch.routeLabels.join('、')}` : '；世界书中未识别到线路条目';
    const homepageNotice = [batch.homeTitle && '主页标题', batch.homeSubtitle && '小副标题', batch.workIntro && '作品简介'].filter(Boolean);
    notify(batch.fallbackCount ? 'warning' : 'success', `已读取 ${data.entries.length} 条额外问候语${batch.entries.size ? `，生成 ${batch.entries.size} 组短标题与简介` : ''}${homepageNotice.length ? `；补全${homepageNotice.join('、')}` : ''}${routeNotice}${fallbackNotice}`);
    return batch;
}

async function generateOpeningOverview(button) {
    const data = alternateGreetingData();
    if (!data.entries.length) {
        notify('warning', '当前角色卡没有可制作一览的额外问候语');
        return;
    }
    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = '正在生成一览…';
    await setOpeningReadStatus(`正在为 ${data.entries.length} 条开场白生成标题、简介并摘录原文……`, 'loading');
    showOpeningReadProgress('已有标题、线路和简介会直接使用；AI 只补缺失项，摘录段落从角色卡原文逐字选取。');
    try {
        const prepared = mergeOpeningOverviewMetadata(data.entries, settings().openingHome.entries);
        const batch = await summarizeGreetingsBatch(prepared, { overwrite: false, includeHomepage: true, syncBindings: false });
        const generated = prepared.map((entry, index) => ({
            title: entry.title || batch.entries.get(index)?.title || fallbackGreetingMetadata(entry).title,
            route: entry.route || batch.entries.get(index)?.route || fallbackGreetingMetadata(entry).route,
            summary: entry.summary || batch.entries.get(index)?.summary || fallbackGreetingMetadata(entry).summary,
        }));
        const overview = buildOpeningOverview(prepared, generated, {
            excerptsPerOpening: 2,
            homepage: {
                title: needsGeneratedHomeTitle() ? batch.homeTitle : settings().openingHome.title,
                subtitle: needsGeneratedHomeSubtitle() ? batch.homeSubtitle : settings().openingHome.subtitle,
                intro: needsGeneratedWorkIntro() ? batch.workIntro : settings().openingHome.intro,
            },
        });
        await copyText(overview);
        await setOpeningReadStatus(`完成：已生成 ${data.entries.length} 条开场白一览并复制；没有写入主页、正则或角色卡。`, 'success', true);
        notify('success', '开场白一览已生成并复制，摘录原文未改写');
    } catch (error) {
        await setOpeningReadStatus(`生成一览失败：${error?.message || '请稍后重试'}`, 'error', true);
        notify('error', error?.message || '生成开场白一览失败');
    } finally {
        hideOpeningReadProgress();
        button.disabled = false;
        button.textContent = originalLabel;
    }
}

async function regenerateOpeningEntry(index) {
    const source = alternateGreetingData().entries[index];
    const target = settings().openingHome.entries[index];
    if (!source || !target) throw new Error('找不到对应的额外问候语，请重新读取');
    const generated = await summarizeGreeting(source.raw, { title: `未命名开局 ${index + 1}`, route: target.route || '未分类线', summary: '' }, index);
    target.title = generated.title;
    target.route = generated.route;
    target.summary = generated.summary;
    const routeCatalog = await currentWorldbookRouteCatalog();
    const routeWorldlineIds = syncWorldbookRouteBindings(routeCatalog);
    target.worldlineId = routeWorldlineIds[target.route] || target.worldlineId || '';
    renderOpeningWorldlines();
    renderOpeningHomeEntries();
    saveSettingsSoon();
    const data = alternateGreetingData();
    saveGreetingNote(data.key, source.sourceIndex ?? index, { title: target.title, route: target.route, summary: target.summary });
    notify('success', `已重新生成第 ${index + 1} 条标题、线路标签与简介`);
}

function syncOpeningHomeControls() {
    for (const [id, key] of Object.entries(OPENING_HOME_FIELDS)) {
        const control = field(id);
        if (control && control.value !== String(settings().openingHome[key] ?? '')) control.value = String(settings().openingHome[key] ?? '');
    }
    renderTemplateLibraries();
    renderPaletteButtons();
}

function renderGreetingThemeChooser() {
    const favoriteHost = greetingModal?.querySelector('.status-atelier-greeting-theme-favorites');
    const otherHost = greetingModal?.querySelector('.status-atelier-greeting-theme-others');
    if (!favoriteHost || !otherHost) return;
    favoriteHost.replaceChildren();
    otherHost.replaceChildren();
    const favorites = settings().favoriteHomeTemplates || [];
    HOME_TEMPLATES.forEach(template => {
        const button = makeElement('button', 'menu_button status-atelier-greeting-theme-button');
        button.type = 'button';
        button.dataset.greetingTheme = template.id;
        button.dataset.templateId = template.id;
        button.setAttribute('aria-pressed', String(settings().openingHome.theme === template.id));
        button.append(makeElement('strong', '', template.name), makeElement('small', '', template.description));
        button.addEventListener('click', () => {
            Object.assign(settings().openingHome, template.values);
            syncOpeningHomeControls();
            renderGreetingThemeChooser();
            updateOpeningHomePreview();
            saveSettingsSoon();
            setGreetingModalStatus(`已切换为“${template.name}”，预览已更新。`, 'success', 'theme');
        });
        (favorites.includes(template.id) ? favoriteHost : otherHost).append(button);
    });
    if (!favoriteHost.children.length) favoriteHost.append(makeElement('small', 'status-atelier-empty', '还没有收藏主页外观；可在完整工坊收藏。'));
    if (!otherHost.children.length) otherHost.append(makeElement('small', 'status-atelier-empty', '所有主页外观都已收藏。'));
}

function renderGreetingStatusChooser() {
    const select = greetingModal?.querySelector('#status-atelier-modal-status-style');
    const structureSelect = greetingModal?.querySelector('#status-atelier-modal-status-structure');
    const paletteHost = greetingModal?.querySelector('#status-atelier-modal-status-palettes');
    const state = greetingModal?.querySelector('.status-atelier-modal-status-state');
    if (!select) return;
    if (!select.options.length) {
        STATUS_STYLE_PRESETS.forEach(style => {
            const option = makeElement('option', '', `${style.code} · ${style.name}`);
            option.value = style.id;
            select.append(option);
        });
    }
    select.value = settings().theme || 'classical';
    if (structureSelect && !structureSelect.options.length) {
        STATUS_STRUCTURE_PRESETS.filter(structure => PHONE_STRUCTURE_IDS.includes(structure.id)).forEach(structure => {
            const option = makeElement('option', '', structure.name);
            option.value = structure.id;
            structureSelect.append(option);
        });
    }
    if (structureSelect) structureSelect.value = settings().structure || 'custom';
    if (paletteHost && paletteHost.children.length !== STATUS_PALETTE_PRESETS.length) {
        paletteHost.replaceChildren();
        STATUS_PALETTE_PRESETS.forEach(palette => {
            const button = makeElement('button', 'status-atelier-status-palette');
            button.type = 'button';
            button.dataset.modalStatusPalette = palette.id;
            const dots = makeElement('span', 'status-atelier-palette-dots');
            [palette.background, palette.card, palette.accent, palette.text].forEach(colorValue => {
                const dot = makeElement('i');
                dot.style.background = colorValue;
                dots.append(dot);
            });
            button.append(dots, makeElement('small', '', palette.name));
            paletteHost.append(button);
        });
    }
    paletteHost?.querySelectorAll('[data-modal-status-palette]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.modalStatusPalette === settings().paletteId));
    });
    if (state) {
        const installed = statusRegexAppliesToCurrentContext();
        state.textContent = installed
            ? '当前角色已启用状态栏；再次点击会直接覆盖为当前编辑结果。'
            : `当前角色尚未安装状态栏；点击后直接写入局部正则，不需要下载。`;
        state.dataset.state = installed ? 'success' : 'idle';
    }
    renderModalStatusSchema();
    const previewHost = greetingModal?.querySelector('#status-atelier-modal-status-preview');
    if (previewHost && !previewHost.firstElementChild) renderStatusPreview(previewHost);
}

function renderModalStatusSchema() {
    const host = greetingModal?.querySelector('#status-atelier-modal-status-schema');
    if (!host) return;
    const definitions = fieldDefinitions();
    host.replaceChildren();
    definitions.forEach((definition, index) => {
        const row = makeElement('article', 'status-atelier-modal-schema-row');
        const main = makeElement('div', 'status-atelier-modal-schema-main');
        const label = makeElement('input', 'text_pole');
        label.value = definition.label;
        label.setAttribute('aria-label', `字段 ${index + 1} 名称`);
        const kind = makeElement('select', 'text_pole');
        kind.setAttribute('aria-label', `字段 ${index + 1} 类型`);
        Object.entries(KIND_LABELS).forEach(([value, text]) => {
            const option = makeElement('option', '', text);
            option.value = value;
            kind.append(option);
        });
        kind.value = definition.kind;
        const remove = makeElement('button', 'menu_button status-atelier-modal-schema-remove', '删除');
        remove.type = 'button';
        main.append(label, kind, remove);
        const details = makeElement('details', 'status-atelier-modal-schema-instruction');
        details.append(makeElement('summary', '', 'AI 动态填写要求'));
        const instruction = makeElement('textarea', 'text_pole');
        instruction.value = definition.instruction;
        instruction.setAttribute('aria-label', `字段 ${index + 1} AI 填写要求`);
        details.append(instruction);
        label.addEventListener('input', () => {
            definition.label = label.value;
            serializeFieldDefinitions(definitions);
        });
        kind.addEventListener('change', () => {
            definition.kind = kind.value;
            serializeFieldDefinitions(definitions);
        });
        instruction.addEventListener('input', () => {
            definition.instruction = instruction.value;
            serializeFieldDefinitions(definitions);
        });
        remove.addEventListener('click', () => {
            definitions.splice(index, 1);
            serializeFieldDefinitions(definitions);
            renderStatusSchema();
            renderModalStatusSchema();
        });
        row.append(main, details);
        host.append(row);
    });
    if (!definitions.length) host.append(makeElement('p', 'status-atelier-empty', '还没有字段，点击上面的“新增字段”。'));
}

function setGreetingModalWorkspace(target = 'opening') {
    const workspace = target === 'status' ? 'status' : 'opening';
    if (!greetingModal) return;
    greetingModal.dataset.workspace = workspace;
    const title = greetingModal.querySelector('#status-atelier-dialog-title');
    if (title) title.textContent = workspace === 'status' ? '制作状态栏' : '制作开场白主页';
    if (workspace === 'status') {
        renderGreetingStatusChooser();
        renderStatusPreview(greetingModal.querySelector('#status-atelier-modal-status-preview'));
    }
}

async function applyModalStatus(button) {
    const select = greetingModal?.querySelector('#status-atelier-modal-status-style');
    const style = STATUS_STYLE_PRESETS.find(item => item.id === select?.value);
    if (!style) return notify('warning', '请选择一个状态栏外观');
    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = '正在写入当前角色…';
    try {
        Object.assign(settings(), {
            theme: style.id,
            layout: style.layout,
            preset: 'custom',
            statusTemplate: 'custom',
        });
        const worldbook = await installRegex('scoped');
        await saveSettingsNow();
        loadSettingsUI();
        renderGreetingStatusChooser();
        const state = greetingModal?.querySelector('.status-atelier-modal-status-state');
        const recipe = statusRecipe();
        if (state) state.textContent = `已完成：世界书“${worldbook.bookName}”已写入 AI 输出规则，局部正则已更新为“${recipe.name}”。`;
        notify('success', `已完整启用当前角色状态栏：世界书输出规则 + ${recipe.name} 局部正则`);
    } catch (error) {
        notify('error', error?.message || '状态栏写入失败');
    } finally {
        button.disabled = false;
        button.textContent = originalLabel;
    }
}

async function applyGreetingModal(button) {
    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = '正在生成…';
    showOpeningReadProgress('正在读取当前角色卡、生成目录并应用局部正则。');
    try {
        const plan = currentOpeningHomeCharacterPlan();
        if (!plan.alternateGreetings.length) {
            throw new Error('当前角色卡没有可制作目录的开场白');
        }
        await setOpeningReadStatus(`已读取 ${plan.alternateGreetings.length} 条开场白，AI 正在补全缺失资料……`, 'loading');
        await readGreetingsIntoOpeningHome({ rawEntries: plan.alternateGreetings });
        if (greetingBindingPromise) {
            button.textContent = '正在完成匹配…';
            await setOpeningReadStatus('正在完成世界书自动匹配……', 'loading');
            await greetingBindingPromise;
        }
        button.textContent = '正在保存…';
        await setOpeningReadStatus('目录已生成，正在保存并更新当前角色的局部正则……', 'loading');
        await saveSettingsNow();
        settings().installScope = 'scoped';
        await installOpeningHomeRegex('scoped');
        button.textContent = '正在写入角色卡…';
        await setOpeningReadStatus('局部正则已更新，正在把主开场白设为【主页】……', 'loading');
        await applyOpeningHomeCharacterPlan(plan);
        await saveSettingsNow();
        const preservedNotice = plan.movedPrimary ? '；原主开场白已保留到额外问候语' : '';
        await setOpeningReadStatus(`完成：主页已生成，当前角色局部正则已更新，主开场白已设为【主页】${preservedNotice}。`, 'success', true);
        notify('success', '开场白主页已一键生成并应用到当前角色');
    } catch (error) {
        await setOpeningReadStatus(`失败：${error?.message || '请确认当前是单人角色聊天后重试'}`, 'error', true);
        notify('error', error?.message || '一键生成开场白主页失败');
    } finally {
        hideOpeningReadProgress();
        button.disabled = false;
        button.textContent = originalLabel;
    }
}

function buildGreetingModal() {
    greetingModal = document.createElement('div');
    greetingModal.id = 'status-atelier-modal';
    greetingModal.setAttribute('aria-hidden', 'true');
    greetingModal.innerHTML = `
        <div class="status-atelier-modal-backdrop" data-status-atelier-close></div>
        <section class="status-atelier-dialog" role="dialog" aria-modal="true" aria-labelledby="status-atelier-dialog-title">
            <header class="status-atelier-dialog-header">
                <h3 id="status-atelier-dialog-title">制作开场白主页</h3>
                <button type="button" class="menu_button" data-status-atelier-close aria-label="关闭">×</button>
            </header>
            <div class="status-atelier-dialog-body">
                <details class="status-atelier-dialog-note status-atelier-opening-only">
                    <summary>读取说明</summary>
                    <p>不需要填写角色卡路径。插件自动定位酒馆当前打开的单人角色聊天；主开场白保留给作品主页，这里只读取该角色卡的额外问候语。有标题与简介注释就直接使用，没有才调用工坊选择的 AI。</p>
                </details>
                <div class="status-atelier-greeting-read-status status-atelier-opening-only" role="status" aria-live="polite"></div>
                <div class="status-atelier-greeting-generate-step status-atelier-opening-only">
                    <div class="status-atelier-greeting-quick-actions">
                        <button type="button" class="menu_button" id="status-atelier-read-current-card">补全缺失项</button>
                        <button type="button" class="menu_button" id="status-atelier-generate-overview">生成并复制开场白一览</button>
                    </div>
                    <small>补全会写入当前主页草稿；“生成并复制”只是临时工具，不保存、不改角色卡。</small>
                </div>
                <div class="status-atelier-greeting-list status-atelier-opening-only"></div>
                <details class="status-atelier-greeting-theme-step status-atelier-opening-only">
                    <summary class="status-atelier-greeting-step-heading"><strong id="status-atelier-greeting-theme-title">选择主页外观</strong><small>默认折叠；快捷区先显示收藏。</small></summary>
                    <div class="status-atelier-greeting-theme-list status-atelier-greeting-theme-favorites"></div>
                    <details class="status-atelier-library-more status-atelier-greeting-theme-more">
                        <summary>展开未收藏主页外观</summary>
                        <div class="status-atelier-greeting-theme-list status-atelier-greeting-theme-others"></div>
                    </details>
                    <details class="status-atelier-greeting-preview-panel" open>
                        <summary>实时预览</summary>
                        <div class="status-atelier-greeting-live-preview"></div>
                    </details>
                </details>
                <section class="status-atelier-greeting-status-step">
                    <div class="status-atelier-greeting-step-heading"><strong>制作状态栏</strong><small>直接选择结构、字段和色卡；预览满意后再一键应用。</small></div>
                    <details class="status-atelier-modal-status-advanced">
                        <summary><strong>调整状态栏</strong><small>结构、字段与色卡</small></summary>
                        <div class="status-atelier-modal-status-controls">
                            <label>状态栏模板<select id="status-atelier-modal-status-structure" class="text_pole"></select></label>
                            <label>外观版式<select id="status-atelier-modal-status-style" class="text_pole"></select></label>
                        </div>
                        <details class="status-atelier-modal-schema-editor">
                            <summary><strong>字段与 AI 动态数值</strong><small>增加、改名、改类型或删除</small></summary>
                            <button type="button" class="menu_button" id="status-atelier-modal-add-field">＋ 新增字段</button>
                            <div id="status-atelier-modal-status-schema" class="status-atelier-modal-schema-list"></div>
                        </details>
                        <details class="status-atelier-status-palette-library">
                            <summary><strong>色卡</strong><small>只改变颜色</small></summary>
                            <div id="status-atelier-modal-status-palettes" class="status-atelier-status-palettes"></div>
                        </details>
                    </details>
                    <div class="status-atelier-modal-status-preview-wrap">
                        <small>当前方案预览</small>
                        <div id="status-atelier-modal-status-preview"></div>
                    </div>
                    <button type="button" class="menu_button status-atelier-primary-action" id="status-atelier-modal-apply-status">一键生成并应用</button>
                    <p class="status-atelier-modal-status-state" role="status" aria-live="polite"></p>
                </section>
                <details class="status-atelier-greeting-more status-atelier-opening-only">
                    <summary>更多操作</summary>
                    <div class="status-atelier-greeting-more-actions">
                        <button type="button" class="menu_button status-atelier-regenerate-all" id="status-atelier-regenerate-all">全部重新生成</button>
                        <button type="button" class="menu_button" id="status-atelier-modal-copy-home">复制主页标记</button>
                        <button type="button" class="menu_button" id="status-atelier-open-full-workbench">打开完整工坊</button>
                    </div>
                    <small>高级工坊会保留 API、世界线、颜色和现有编辑内容。</small>
                </details>
            </div>
            <footer class="status-atelier-dialog-footer status-atelier-opening-only">
                <button type="button" class="menu_button status-atelier-primary-action" id="status-atelier-modal-apply">一键生成并应用</button>
            </footer>
        </section>`;
    greetingModal.querySelectorAll('[data-status-atelier-close]').forEach(button => button.addEventListener('click', closeGreetingModal));
    greetingModal.querySelector('#status-atelier-read-current-card').addEventListener('click', event => {
        refreshGreetingModal(event.currentTarget, false);
    });
    greetingModal.querySelector('#status-atelier-regenerate-all').addEventListener('click', event => {
        refreshGreetingModal(event.currentTarget, true);
    });
    greetingModal.querySelector('#status-atelier-generate-overview').addEventListener('click', event => {
        generateOpeningOverview(event.currentTarget);
    });
    greetingModal.querySelector('#status-atelier-modal-copy-home').addEventListener('click', async () => {
        await copyText(buildOpeningHomeBlock(settings().openingHome));
        setGreetingModalStatus('已复制主页标记【主页】；可以粘贴到主开场白。', 'success', 'copy');
        notify('success', '已复制主页标记【主页】；请放进主开场白');
    });
    greetingModal.querySelector('#status-atelier-open-full-workbench').addEventListener('click', openFullWorkbench);
    greetingModal.querySelector('#status-atelier-modal-status-structure').addEventListener('change', event => {
        applyStatusStructure(event.currentTarget.value);
    });
    greetingModal.querySelector('#status-atelier-modal-status-style').addEventListener('change', event => {
        const style = STATUS_STYLE_PRESETS.find(item => item.id === event.currentTarget.value);
        if (!style) return;
        Object.assign(settings(), { theme: style.id, layout: style.layout, preset: 'custom', statusTemplate: 'custom' });
        refreshStatusAppearancePreview();
        saveSettingsSoon({ snapshotOpening: false });
    });
    greetingModal.querySelector('#status-atelier-modal-status-palettes').addEventListener('click', event => {
        const button = event.target.closest('[data-modal-status-palette]');
        const palette = STATUS_PALETTE_PRESETS.find(item => item.id === button?.dataset.modalStatusPalette);
        if (!palette) return;
        settings().paletteId = palette.id;
        refreshStatusPalettePreview();
        greetingModal.querySelectorAll('[data-modal-status-palette]').forEach(item => {
            item.setAttribute('aria-pressed', String(item === button));
        });
        saveSettingsSoon({ snapshotOpening: false });
    });
    greetingModal.querySelector('#status-atelier-modal-add-field').addEventListener('click', addStatusField);
    greetingModal.querySelector('#status-atelier-modal-apply-status').addEventListener('click', event => applyModalStatus(event.currentTarget));
    greetingModal.querySelector('#status-atelier-modal-apply').addEventListener('click', event => applyGreetingModal(event.currentTarget));
    document.body.append(greetingModal);
    setGreetingModalWorkspace('opening');
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
    panel.append(makeElement('summary', '', '作品简介与线路介绍（可编辑）'));
    const grid = makeElement('div', 'status-atelier-home-quick-grid');
    const definitions = [
        ['主页标题', 'title', false, 80],
        ['小副标题', 'subtitle', false, 100],
        ['作者', 'author', false, 80],
        ['推荐模型（每行一个）', 'model', true, 400],
        ['推荐预设（每行一个）', 'preset', true, 400],
        ['作品总简介（含世界观 / 背景）', 'intro', true, 1600],
    ];
    definitions.forEach(([labelText, key, multiline, maxLength]) => {
        const { label, input } = labeledInput(labelText, settings().openingHome[key] || '', { multiline, maxLength });
        label.classList.add(`status-atelier-home-quick-${key}`);
        input.addEventListener('input', () => updateOpeningHomeContent(key, input.value));
        grid.append(label);
    });
    panel.append(grid);
    const routeEditor = makeElement('div', 'status-atelier-home-quick-routes');
    routeEditor.append(makeElement('h4', '', '世界线介绍（可选）'));
    const worldlines = settings().openingHome.worldlines;
    if (!worldlines.length) {
        routeEditor.append(makeElement('small', 'status-atelier-hint', '尚未从当前角色世界书识别到线路；点击补全后会显示在这里。'));
    }
    worldlines.forEach(worldline => {
        const row = makeElement('div', 'status-atelier-home-quick-route');
        const nameField = labeledInput('线路名称', worldline.name || '', { maxLength: 80 });
        const descriptionField = labeledInput('线路介绍', worldline.description || '', { multiline: true, maxLength: 600 });
        nameField.input.addEventListener('input', () => {
            updateOpeningWorldlineName(worldline, nameField.input.value);
            updateOpeningHomePreview();
            saveSettingsSoon();
        });
        descriptionField.input.addEventListener('input', () => {
            worldline.description = descriptionField.input.value;
            updateOpeningHomePreview();
            saveSettingsSoon();
        });
        row.append(nameField.label, descriptionField.label);
        routeEditor.append(row);
    });
    panel.append(routeEditor);
    return panel;
}

function ensureLocalGreetingDrafts() {
    const data = alternateGreetingData();
    if (!data.entries.length) return data;
    const current = settings().openingHome.entries || [];
    const merged = mergeLocalGreetingEntries(data.entries, current);
    if (JSON.stringify(merged) !== JSON.stringify(current)) {
        settings().openingHome.entries = merged;
        renderOpeningHomeEntries();
        saveSettingsSoon();
    }
    return data;
}

function renderGreetingBindingBox(bindingBox, entry, generated) {
    bindingBox.replaceChildren();
    const routeName = entry.route || generated?.route || '';
    const boundWorldline = settings().openingHome.worldlines.find(line => line.id === generated?.worldlineId)
        || settings().openingHome.worldlines.find(line => line.name === routeName);
    const summary = greetingBindingSummary(boundWorldline);
    bindingBox.dataset.state = summary.state;
    const overview = makeElement('div', 'status-atelier-greeting-binding-overview');
    overview.append(makeElement('span', 'status-atelier-greeting-binding-dot', ''), makeElement('small', '', summary.text));
    const advanced = makeElement('details', 'status-atelier-greeting-binding-advanced');
    advanced.append(makeElement('summary', '', '高级：调整世界书绑定'));
    const detail = makeElement('small', 'status-atelier-greeting-binding-detail', summary.detail);
    const action = makeElement('button', 'menu_button', boundWorldline ? '手动调整绑定' : '打开高级工坊');
    action.type = 'button';
    action.addEventListener('click', () => {
        if (!boundWorldline) return openFullWorkbench();
        const worldlineIndex = settings().openingHome.worldlines.indexOf(boundWorldline);
        openEntryDialog(worldlineIndex).catch(error => notify('error', error?.message || '读取世界书条目失败'));
    });
    advanced.append(detail, action);
    bindingBox.append(overview, advanced);
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
        setGreetingModalStatus(`读取失败：已定位当前角色卡“${characterName}”，但没有额外问候语。请添加后重新打开。`, 'error', 'read');
        list.append(makeElement('div', 'status-atelier-empty', '主开场白不会计入目录；需要至少一条额外问候语。'));
        return;
    }
    if (!status.textContent) setGreetingModalStatus(`本地读取完成：${characterName}，共 ${data.entries.length} 条额外问候语。`, 'success', 'read');
    data.entries.forEach(entry => {
        const card = makeElement('details', 'status-atelier-greeting-card');
        card.dataset.current = String(entry.index === data.current);
        card.dataset.entryIndex = String(entry.index);
        card.addEventListener('toggle', () => {
            keepOnlyOpenGreetingCard(card, list.querySelectorAll('.status-atelier-greeting-card'));
        });
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
        const routeField = labeledInput('线路标签（通常会自动匹配）', entry.route || generated?.route || '', { maxLength: 10 });
        const summaryField = labeledInput('路线简介（1句话，谁在做什么、发生了什么）', entry.summary || generated?.summary || '', { multiline: true, maxLength: 56 });
        const fields = makeElement('div', 'status-atelier-greeting-fields');
        fields.append(titleField.label, routeField.label, summaryField.label);
        const bindingBox = makeElement('div', 'status-atelier-greeting-binding');
        renderGreetingBindingBox(bindingBox, entry, generated);
        const actions = makeElement('div', 'status-atelier-greeting-actions');
        const regenerate = makeElement('button', 'menu_button', '让 AI 重写本条');
        regenerate.type = 'button';
        regenerate.addEventListener('click', async () => {
            regenerate.disabled = true;
            setGreetingModalStatus(`正在重新生成第 ${entry.index + 1} 条的标题、线路和简介…`, 'loading', 'generate-entry');
            try {
                await regenerateOpeningEntry(entry.index);
                renderGreetingList();
                setGreetingModalStatus(`完成：第 ${entry.index + 1} 条已重新生成并自动保存。`, 'success', 'generate-entry');
            } catch (error) {
                setGreetingModalStatus(`生成失败：${error?.message || '可以重试或直接手动填写'}`, 'error', 'generate-entry');
                notify('error', error?.message || '生成标题与简介失败');
            }
            finally { regenerate.disabled = false; }
        });
        actions.append(regenerate);
        const updateEntry = () => {
            const target = settings().openingHome.entries[entry.index];
            if (!target) return;
            target.title = titleField.input.value.trim() || `未命名开局 ${entry.index + 1}`;
            target.route = routeField.input.value.trim() || '未分类线';
            target.worldlineId = settings().openingHome.worldlines.find(line => line.name === target.route)?.id || target.worldlineId || '';
            target.summary = summaryField.input.value.trim();
            headingTitle.textContent = target.title;
            headingRoute.textContent = target.route;
            headingState.textContent = target.summary ? '已编辑 · 自动保存' : '待生成';
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
            bindingBox,
            actions,
            original,
        );
        list.append(card);
    });
    updateOpeningHomePreview();
}

async function refreshGreetingModal(button, overwrite = false) {
    renderGreetingList();
    const status = greetingModal?.querySelector('.status-atelier-greeting-read-status');
    const generationButtons = greetingModal?.querySelectorAll('#status-atelier-read-current-card, #status-atelier-regenerate-all, #status-atelier-modal-apply') || [];
    if (!alternateGreetingData().entries.length) {
        await setOpeningReadStatus('失败：当前角色卡没有读取到额外问候语。', 'error', true);
        return;
    }
    generationButtons.forEach(item => { item.disabled = true; });
    const originalLabel = button?.textContent || '';
    if (button) button.textContent = overwrite ? '正在全部重写…' : '正在补全缺失项…';
    const actionText = overwrite ? '覆盖生成全部开场目录，并仅补全缺失的主页标题资料' : '补全缺少的主页资料、短标题与路线简介';
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

function openGreetingModal(target = 'opening') {
    if (!greetingModal) buildGreetingModal();
    if (target === 'status') {
        setGreetingModalWorkspace('status');
        greetingModal.classList.add('status-atelier-modal-open');
        greetingModal.setAttribute('aria-hidden', 'false');
        requestAnimationFrame(() => {
            greetingModal?.querySelector('#status-atelier-modal-status-structure')?.focus();
        });
        return;
    }
    switchOpeningProfileForCurrentCharacter();
    const localData = ensureLocalGreetingDrafts();
    setGreetingModalStatus('', 'idle', '');
    renderGreetingList();
    renderGreetingThemeChooser();
    updateOpeningHomePreview();
    setGreetingModalWorkspace('opening');
    greetingModal.classList.add('status-atelier-modal-open');
    greetingModal.setAttribute('aria-hidden', 'false');
    const localEntries = localData.entries;
    if (!localEntries.length) return;
    setGreetingModalStatus(`本地读取完成：共 ${localEntries.length} 条额外问候语；正在自动匹配世界书…`, 'loading', 'binding');
    const bindingTask = currentWorldbookRouteCatalog().then(catalog => {
        const routeWorldlineIds = syncWorldbookRouteBindings(catalog);
        settings().openingHome.entries.forEach(entry => {
            entry.worldlineId = routeWorldlineIds[entry.route] || entry.worldlineId || '';
        });
        renderOpeningWorldlines();
        renderGreetingList();
        updateOpeningHomePreview();
        saveSettingsSoon();
        const status = greetingModal?.querySelector('.status-atelier-greeting-read-status');
        if (status?.dataset.operation === 'binding') {
            setGreetingModalStatus(`准备完成：已读取 ${localEntries.length} 条额外问候语，并完成世界书自动匹配。`, 'success', 'binding');
        }
    }).catch(error => {
        console.warn(`[${MODULE_NAME}] 自动绑定世界书 UID 失败`, error);
        const status = greetingModal?.querySelector('.status-atelier-greeting-read-status');
        if (status?.dataset.operation === 'binding') {
            setGreetingModalStatus('已读取额外问候语，但世界书自动匹配失败；可以继续编辑，或在高级入口中手动调整。', 'error', 'binding');
        }
    });
    greetingBindingPromise = bindingTask;
    bindingTask.finally(() => {
        if (greetingBindingPromise === bindingTask) greetingBindingPromise = null;
    });
}

function closeGreetingModal() {
    snapshotCurrentOpeningProfile();
    context()?.saveSettingsDebounced?.();
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
    if (!menu) return;
    document.querySelector('#status-atelier-menu-item')?.remove();
    const addItem = ({ id, iconClass, label, target }) => {
        if (document.querySelector(`#${id}`)) return;
        const item = makeElement('div', 'list-group-item flex-container flexGap5');
        item.id = id;
        item.tabIndex = 0;
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', label);
        const icon = makeElement('div', `${iconClass} extensionsMenuExtensionButton`);
        icon.setAttribute('aria-hidden', 'true');
        item.append(icon, makeElement('span', '', label));
        const open = () => openGreetingModal(target);
        item.addEventListener('click', open);
        item.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                open();
            }
        });
        menu.append(item);
    };
    addItem({ id: 'status-atelier-opening-menu-item', iconClass: 'fa-solid fa-book-open', label: '制作开场白 · 九一', target: 'opening' });
    addItem({ id: 'status-atelier-status-menu-item', iconClass: 'fa-solid fa-table-list', label: '制作状态栏 · 九一', target: 'status' });
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
    settingsRoot.addEventListener('input', event => {
        readSettingsControl(event.target);
        readStatusMediaControl(event.target);
        readPhoneDesktopControl(event.target);
    });
    settingsRoot.addEventListener('input', event => {
        readOpeningHomeControl(event.target);
        readOpeningSummaryControl(event.target);
        updateOpeningEntry(event.target);
    });
    settingsRoot.addEventListener('change', event => {
        if (event.target.id !== 'status-atelier-preset' && event.target.id !== 'status-atelier-import-file') {
            const isStatusControl = Boolean(SETTING_FIELDS[event.target.id] || STATUS_MEDIA_FIELDS[event.target.id] || PHONE_DESKTOP_FIELDS[event.target.id] || event.target.dataset?.phoneAppId);
            if (!isStatusControl) {
                readSettingsControl(event.target);
                readStatusMediaControl(event.target);
                readPhoneDesktopControl(event.target);
            }
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
        const statusPaletteButton = event.target.closest('[data-status-palette]');
        if (statusPaletteButton) {
            const palette = STATUS_PALETTE_PRESETS.find(item => item.id === statusPaletteButton.dataset.statusPalette);
            if (!palette) return;
            settings().paletteId = palette.id;
            statusAiTestRecords = null;
            field('status-atelier-status-palettes')?.querySelectorAll('[data-status-palette]').forEach(button => {
                button.setAttribute('aria-pressed', String(button === statusPaletteButton));
            });
            refreshStatusPalettePreview();
            saveSettingsSoon({ snapshotOpening: false });
            return;
        }
        const statusStyleButton = event.target.closest('[data-status-style]');
        if (statusStyleButton) {
            const style = STATUS_STYLE_PRESETS.find(item => item.id === statusStyleButton.dataset.statusStyle);
            if (!style) return;
            settings().theme = style.id;
            const themeControl = field('status-atelier-theme');
            if (themeControl) themeControl.value = style.id;
            settings().layout = style.layout;
            const layoutControl = field('status-atelier-layout');
            if (layoutControl) layoutControl.value = style.layout;
            settings().preset = 'custom';
            field('status-atelier-preset').value = 'custom';
            statusAiTestRecords = null;
            field('status-atelier-status-styles')?.querySelectorAll('[data-status-style]').forEach(button => {
                button.setAttribute('aria-pressed', String(button === statusStyleButton));
            });
            refreshStatusAppearancePreview();
            saveSettingsSoon({ snapshotOpening: false });
        }
    });
    field('status-atelier-test-ai').addEventListener('click', event => testStatusAiGeneration(event.currentTarget));
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
    field('status-atelier-reset').addEventListener('click', () => applyPreset(settings().statusTemplate || 'custom'));
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
    field('status-atelier-entry-dialog-book').addEventListener('change', () => {
        entryDialogQuery = '';
        entryDialogPage = 0;
        const search = field('status-atelier-entry-dialog-search');
        if (search) search.value = '';
        renderEntryDialogOptions().catch(error => renderEntryDialogNotice(`读取失败：${error?.message || '无法读取世界书条目'}`, 'error'));
    });
    field('status-atelier-entry-dialog-search').addEventListener('input', event => {
        entryDialogQuery = event.currentTarget.value;
        entryDialogPage = 0;
        renderEntryDialogPage();
    });
    field('status-atelier-entry-dialog-prev').addEventListener('click', () => {
        entryDialogPage -= 1;
        renderEntryDialogPage();
    });
    field('status-atelier-entry-dialog-next').addEventListener('click', () => {
        entryDialogPage += 1;
        renderEntryDialogPage();
    });
    field('status-atelier-entry-dialog-close').addEventListener('click', closeEntryDialog);
    field('status-atelier-entry-dialog-cancel').addEventListener('click', closeEntryDialog);
    field('status-atelier-entry-dialog-confirm').addEventListener('click', confirmEntryDialog);
    field('status-atelier-opening-copy-block').addEventListener('click', async () => {
        await copyText(buildOpeningHomeBlock(settings().openingHome));
        notify('success', '已复制主页标记【主页】；请放进主开场白');
    });
    field('status-atelier-opening-download-regex').addEventListener('click', () => {
        downloadJson('regex-九一-通用开场白主页.json', buildOpeningHomeRegex(settings().openingHome));
        notify('success', '开场白主页正则 JSON 已生成');
    });
    field('status-atelier-opening-install-scoped').addEventListener('click', event => applyGreetingModal(event.currentTarget));
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
    if (events.CHAT_CHANGED) source.on(events.CHAT_CHANGED, () => {
        const switched = switchOpeningProfileForCurrentCharacter();
        if (switched) {
            loadSettingsUI();
            updateOpeningHomePreview();
            saveSettingsSoon();
        }
        updatePrompt();
        if (greetingModal?.classList.contains('status-atelier-modal-open')) renderGreetingList();
    });
    if (events.MESSAGE_SWIPED) source.on(events.MESSAGE_SWIPED, () => {
        if (greetingModal?.classList.contains('status-atelier-modal-open')) renderGreetingList();
    });
}

async function initialize() {
    settings();
    switchOpeningProfileForCurrentCharacter();
    updatePrompt();
    for (let attempt = 0; attempt < 20; attempt += 1) {
        if (await addSettingsPanel()) break;
        await new Promise(resolve => setTimeout(resolve, 250));
    }
    for (let attempt = 0; attempt < 20; attempt += 1) {
        addExtensionsMenuItem();
        if (document.querySelector('#status-atelier-opening-menu-item') && document.querySelector('#status-atelier-status-menu-item')) break;
        await new Promise(resolve => setTimeout(resolve, 250));
    }
    console.info(`[九一 正则状态工坊] v${VERSION} 已加载`);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
} else {
    initialize();
}

export { normalizeRule };

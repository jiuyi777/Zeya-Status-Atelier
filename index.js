import {
    RULE_PRESETS,
    buildAiInstruction,
    buildRegexScript,
    buildWorldbookJson,
    makePreviewRecords,
    normalizeRule,
} from './rule-generator.js';
import {
    OPENING_HOME_DEFAULTS,
    buildOpeningHomeBlock,
    buildOpeningHomeRegex,
    normalizeOpeningHomeSettings,
} from './opening-home-generator.js';
import {
    SCRIPT_TYPES,
    allowScopedScripts,
    getScriptsByType,
    saveScriptsByType,
} from '../../regex/engine.js';

const MODULE_NAME = 'status_atelier';
const PROMPT_KEY = 'status_atelier_generated_rule';
const VERSION = '0.3.0';

const DEFAULT_SETTINGS = Object.freeze({
    ...RULE_PRESETS.richTwins,
    preset: 'richTwins',
    promptEnabled: false,
    installScope: 'scoped',
    ruleId: 'zeya-status-rule-v2',
    openingNotes: {},
    openingHome: OPENING_HOME_DEFAULTS,
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
    'status-atelier-opening-home-text': 'text',
    'status-atelier-opening-home-secondary': 'secondary',
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

let settingsRoot;
let greetingModal;
let saveTimer;

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
        console[level === 'error' ? 'error' : 'log'](`[Zeya 正则状态工坊] ${message}`);
    }
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
    stored.openingHome = normalizeOpeningHomeSettings(stored.openingHome);
    return stored;
}

function saveSettingsSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => context()?.saveSettingsDebounced?.(), 120);
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

function field(id) {
    return settingsRoot?.querySelector(`#${id}`);
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
    };
    Object.assign(stored, clone(preset), preserved, { preset: name });
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
    renderOpeningHomeEntries();
}

function readOpeningHomeControl(control) {
    const key = OPENING_HOME_FIELDS[control.id];
    if (!key) return;
    settings().openingHome[key] = control.value;
    saveSettingsSoon();
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

function renderOpeningHomeEntries() {
    const host = field('status-atelier-opening-entry-list');
    if (!host) return;
    host.replaceChildren();
    settings().openingHome.entries.forEach((entry, index) => {
        const card = makeElement('article', 'status-atelier-opening-entry-editor');
        const heading = makeElement('div', 'status-atelier-opening-entry-heading');
        heading.append(makeElement('strong', '', `目录条目 ${index + 1}`));
        const removeButton = makeElement('button', 'menu_button status-atelier-opening-remove', '删除');
        removeButton.type = 'button';
        removeButton.dataset.openingRemoveIndex = String(index);
        heading.append(removeButton);

        const grid = makeElement('div', 'status-atelier-opening-entry-grid');
        grid.append(
            openingEntryInput('显示编号', entry.number, 'number', index, { maxLength: 20 }),
            openingEntryInput('导航标题', entry.title, 'title', index, { maxLength: 100 }),
            openingEntryInput('涉及人物 / 视角', entry.characters, 'characters', index, { maxLength: 180 }),
            openingEntryInput('简介', entry.summary, 'summary', index, { maxLength: 320 }),
            openingEntryInput('跳转到第几个开场白', entry.target, 'target', index, { type: 'number', min: 1, maxLength: 0 }),
        );
        card.append(heading, grid);
        host.append(card);
    });
    if (!host.children.length) {
        host.append(makeElement('p', 'status-atelier-empty', '当前目录为空。点击“新增目录条目”即可开始。'));
    }
}

function updateOpeningEntry(control) {
    const index = Number(control.dataset.openingEntryIndex);
    const key = control.dataset.openingEntryKey;
    const entries = settings().openingHome.entries;
    if (!Number.isInteger(index) || !entries[index] || !key) return;
    entries[index][key] = key === 'target' ? Math.max(1, Math.trunc(Number(control.value) || 1)) : control.value;
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

async function installGeneratedRegex(script) {
    const stored = settings();
    const type = stored.installScope === 'global' ? SCRIPT_TYPES.GLOBAL : SCRIPT_TYPES.SCOPED;
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

async function installRegex() {
    await installGeneratedRegex(buildRegexScript(settings()));
}

async function installOpeningHomeRegex() {
    await installGeneratedRegex(buildOpeningHomeRegex(settings().openingHome));
}

function exportProfile() {
    const exported = clone(settings());
    delete exported.openingNotes;
    downloadJson('zeya-regex-status-profile.json', { format: 'zeya-regex-status-profile', version: 2, settings: exported });
}

async function importProfile(fileToImport) {
    const data = JSON.parse(await fileToImport.text());
    if (data?.format !== 'zeya-regex-status-profile' || !data.settings || typeof data.settings !== 'object') {
        throw new Error('这不是 Zeya 正则状态工坊配置');
    }
    const notes = settings().openingNotes;
    Object.assign(settings(), clone(DEFAULT_SETTINGS), data.settings, { openingNotes: notes, preset: 'custom' });
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

function stripForSummary(value) {
    return String(value ?? '')
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/[#*_~`>|\[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function greetingData() {
    const ctx = context();
    const key = characterStorageKey(ctx);
    if (!ctx || !key || !ctx.chat?.length) return { key, entries: [], current: 0 };
    const first = ctx.chat[0];
    const rawEntries = Array.isArray(first?.swipes) && first.swipes.length ? first.swipes : [first?.mes].filter(Boolean);
    const current = Math.max(0, Math.min(rawEntries.length - 1, Number(first?.swipe_id ?? 0)));
    const notes = settings().openingNotes[key] || {};
    const entries = rawEntries.map((raw, index) => {
        const saved = notes[index] || {};
        const preview = stripForSummary(raw);
        return {
            index,
            title: saved.title || `开场白 ${index + 1}`,
            characters: saved.characters || '',
            summary: saved.summary || (preview.length > 120 ? `${preview.slice(0, 120)}…` : preview),
            note: saved.note || '',
            preview: preview.length > 220 ? `${preview.slice(0, 220)}…` : preview,
        };
    });
    return { key, entries, current };
}

function buildGreetingModal() {
    greetingModal = document.createElement('div');
    greetingModal.id = 'status-atelier-modal';
    greetingModal.setAttribute('aria-hidden', 'true');
    greetingModal.innerHTML = `
        <div class="status-atelier-modal-backdrop" data-status-atelier-close></div>
        <section class="status-atelier-dialog" role="dialog" aria-modal="true" aria-labelledby="status-atelier-dialog-title">
            <header class="status-atelier-dialog-header">
                <h3 id="status-atelier-dialog-title">开场白跳转与固定资料</h3>
                <button type="button" class="menu_button" data-status-atelier-close aria-label="关闭">×</button>
            </header>
            <div class="status-atelier-dialog-body">
                <p class="status-atelier-dialog-note">这里编辑的才是固定内容：这条开场白叫什么、涉及谁、故事从哪里开始。不会改写角色卡原文。</p>
                <div class="status-atelier-greeting-list"></div>
            </div>
            <footer class="status-atelier-dialog-footer">
                <button type="button" class="menu_button" id="status-atelier-jump-first">只定位到聊天第 1 条</button>
                <button type="button" class="menu_button" data-status-atelier-close>完成</button>
            </footer>
        </section>`;
    greetingModal.querySelectorAll('[data-status-atelier-close]').forEach(button => button.addEventListener('click', closeGreetingModal));
    greetingModal.querySelector('#status-atelier-jump-first').addEventListener('click', () => {
        jumpToFirstMessage();
        closeGreetingModal();
    });
    document.body.append(greetingModal);
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

function renderGreetingList() {
    const list = greetingModal.querySelector('.status-atelier-greeting-list');
    const data = greetingData();
    list.replaceChildren();
    if (!data.entries.length) {
        list.append(makeElement('div', 'status-atelier-empty', '当前没有可管理的开场白。请先打开一个单人角色聊天。'));
        return;
    }

    data.entries.forEach(entry => {
        const card = makeElement('article', 'status-atelier-greeting-card');
        card.dataset.current = String(entry.index === data.current);
        const fields = makeElement('div', 'status-atelier-greeting-fields');
        const title = labeledInput('导航标题', entry.title, { maxLength: 80 });
        const characters = labeledInput('涉及人物 / 视角', entry.characters, { maxLength: 160 });
        const summary = labeledInput('故事简介', entry.summary, { multiline: true, maxLength: 500 });
        const note = labeledInput('备注 / 关键词', entry.note, { multiline: true, maxLength: 300 });
        fields.append(
            title.label,
            characters.label,
            summary.label,
            note.label,
            makeElement('p', 'status-atelier-greeting-preview', `原文预览：${entry.preview || '（空）'}`),
        );

        const actions = makeElement('div', 'status-atelier-greeting-actions');
        if (entry.index === data.current) actions.append(makeElement('span', 'status-atelier-current-badge', '当前'));
        const switchButton = makeElement('button', 'menu_button', entry.index === data.current ? '定位到这条' : '切换并定位');
        switchButton.type = 'button';
        switchButton.addEventListener('click', async () => {
            switchButton.disabled = true;
            try {
                if (entry.index !== greetingData().current) await switchGreeting(entry.index);
                jumpToFirstMessage();
                renderGreetingList();
            } catch (error) {
                console.error('[Zeya 正则状态工坊] 切换开场白失败', error);
                notify('error', error?.message || '切换开场白失败');
            } finally {
                switchButton.disabled = false;
            }
        });
        actions.append(switchButton);

        const persist = () => saveGreetingNote(data.key, entry.index, {
            title: title.input.value,
            characters: characters.input.value,
            summary: summary.input.value,
            note: note.input.value,
        });
        [title.input, characters.input, summary.input, note.input].forEach(input => input.addEventListener('input', persist));
        card.append(fields, actions);
        list.append(card);
    });
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
    item.setAttribute('aria-label', '打开开场白跳转');
    const icon = makeElement('div', 'fa-solid fa-book-open extensionsMenuExtensionButton');
    icon.setAttribute('aria-hidden', 'true');
    item.append(icon, makeElement('span', '', '开场白跳转 · Zeya'));
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

    field('status-atelier-preset').addEventListener('change', event => {
        if (event.target.value !== 'custom') applyPreset(event.target.value);
    });
    settingsRoot.addEventListener('input', event => readSettingsControl(event.target));
    settingsRoot.addEventListener('input', event => {
        readOpeningHomeControl(event.target);
        updateOpeningEntry(event.target);
    });
    settingsRoot.addEventListener('change', event => {
        if (event.target.id !== 'status-atelier-preset' && event.target.id !== 'status-atelier-import-file') {
            readSettingsControl(event.target);
            readOpeningHomeControl(event.target);
            updateOpeningEntry(event.target);
        }
    });
    settingsRoot.addEventListener('click', event => {
        const removeButton = event.target.closest('[data-opening-remove-index]');
        if (!removeButton) return;
        const index = Number(removeButton.dataset.openingRemoveIndex);
        if (!Number.isInteger(index)) return;
        settings().openingHome.entries.splice(index, 1);
        renderOpeningHomeEntries();
        saveSettingsSoon();
    });
    field('status-atelier-copy-prompt').addEventListener('click', async () => {
        await copyText(buildAiInstruction(settings()));
        notify('success', 'AI 输出规则已复制');
    });
    field('status-atelier-download-regex').addEventListener('click', downloadRegex);
    field('status-atelier-download-worldbook').addEventListener('click', downloadWorldbook);
    field('status-atelier-install-regex').addEventListener('click', async event => {
        event.currentTarget.disabled = true;
        try {
            await installRegex();
        } catch (error) {
            notify('error', error?.message || '安装正则失败');
        } finally {
            event.currentTarget.disabled = false;
        }
    });
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
    field('status-atelier-reset').addEventListener('click', () => applyPreset('richTwins'));
    field('status-atelier-open-greetings').addEventListener('click', openGreetingModal);
    field('status-atelier-opening-add-entry').addEventListener('click', () => {
        const entries = settings().openingHome.entries;
        const position = entries.length + 1;
        entries.push({
            number: String(position).padStart(2, '0'),
            title: `开场白 ${position}`,
            characters: '填写涉及人物',
            summary: '填写这条开场白的简介。',
            target: position + 1,
        });
        renderOpeningHomeEntries();
        saveSettingsSoon();
    });
    field('status-atelier-opening-copy-block').addEventListener('click', async () => {
        await copyText(buildOpeningHomeBlock(settings().openingHome));
        notify('success', '开场白主页模板已复制');
    });
    field('status-atelier-opening-download-regex').addEventListener('click', () => {
        downloadJson('regex-Zeya-通用开场白主页.json', buildOpeningHomeRegex(settings().openingHome));
        notify('success', '开场白主页正则 JSON 已生成');
    });
    field('status-atelier-opening-install-regex').addEventListener('click', async event => {
        event.currentTarget.disabled = true;
        try {
            await installOpeningHomeRegex();
        } catch (error) {
            notify('error', error?.message || '安装开场白主页正则失败');
        } finally {
            event.currentTarget.disabled = false;
        }
    });
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
    buildGreetingModal();
    addExtensionsMenuItem();
    bindEvents();
    updatePrompt();
    for (let attempt = 0; attempt < 20; attempt += 1) {
        if (await addSettingsPanel()) break;
        await new Promise(resolve => setTimeout(resolve, 250));
    }
    console.info(`[Zeya 正则状态工坊] v${VERSION} 已加载`);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
} else {
    initialize();
}

export { normalizeRule };

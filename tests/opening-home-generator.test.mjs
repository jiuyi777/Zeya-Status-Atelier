import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {
    OPENING_HOME_DEFAULTS,
    appendOpeningWorldline,
    buildOpeningHomeBlock,
    buildOpeningHomeRegex,
    normalizeOpeningHomeSettings,
} from '../opening-home-generator.js';

test('adding a worldline appends without replacing existing edited routes', () => {
    const openingHome = {
        worldlines: [
            { id: 'rain', name: '雨夜线', description: '已经写好的雨夜简介', entries: [{ book: '旧城', uid: 12, title: '规则' }] },
            { id: 'city', name: '旧城线', description: '已经写好的旧城简介', entries: [] },
        ],
    };
    const first = openingHome.worldlines[0];
    appendOpeningWorldline(openingHome, 123456);
    assert.equal(openingHome.worldlines.length, 3);
    assert.equal(openingHome.worldlines[0], first);
    assert.equal(openingHome.worldlines[0].description, '已经写好的雨夜简介');
    assert.equal(openingHome.worldlines[1].description, '已经写好的旧城简介');
    assert.equal(openingHome.worldlines[2].id, 'line-123456-3');
});

test('opening homepage accepts any number of directory entries', () => {
    const entries = Array.from({ length: 10 }, (_, index) => ({
        number: String(index + 1).padStart(2, '0'),
        title: `开场白 ${index + 1}`,
        route: `线路 ${index + 1} 线`,
        summary: `简介 ${index + 1}`,
        target: index + 2,
    }));
    const block = buildOpeningHomeBlock({ ...OPENING_HOME_DEFAULTS, entries });
    assert.equal(block.match(/^\[Opening\|/gm)?.length, 10);
    assert.match(block, /\[Opening\|10\|开场白 10\|线路 10 线\|简介 10\|11\|\]/);
});

test('opening homepage keeps multiline recommendations and binds concrete worldbook entries', () => {
    const input = {
        ...OPENING_HOME_DEFAULTS,
        model: 'Gemini 3.1\nClaude 4.5',
        preset: '沉浸剧情预设\n长篇稳定预设',
        worldlines: [{ id: 'rain', name: '雨夜线', description: '雨夜相遇路线。', entries: [{ book: '旧城总设', uid: 12, title: '雨夜规则' }] }],
        entries: [{ number: '01', title: '雨夜初遇', route: '旧城雨夜线', summary: '简介', target: 1, worldlineId: 'rain' }],
    };
    const normalized = normalizeOpeningHomeSettings(input);
    const block = buildOpeningHomeBlock(input);
    assert.equal(normalized.model, 'Gemini 3.1\nClaude 4.5');
    assert.equal(normalized.preset, '沉浸剧情预设\n长篇稳定预设');
    assert.match(block, /\[Worldline\|rain\|雨夜线\|/);
    assert.match(block, /\[Worldline\|rain\|雨夜线\|雨夜相遇路线。\|/);
    assert.match(block, /\[Opening\|01\|雨夜初遇\|旧城雨夜线\|简介\|1\|rain\]/);
});

test('opening homepage normalizes editable theme, font, colors and jump targets', () => {
    const normalized = normalizeOpeningHomeSettings({
        theme: 'timeline',
        font: 'kai',
        accent: '#112233',
        entries: [{ title: '测试', target: 0 }],
    });
    assert.equal(normalized.theme, 'timeline');
    assert.equal(normalized.font, 'kai');
    assert.equal(normalized.accent, '#112233');
    assert.equal(normalized.entries[0].target, 1);
});

test('opening homepage regex renders four selected themes and uses native swipe', () => {
    const script = buildOpeningHomeRegex(OPENING_HOME_DEFAULTS);
    assert.match(script.findRegex, /【主页】/);
    assert.match(script.findRegex, /opening_home/);
    assert.match(script.replaceString, /classical','newspaper','timeline','minimal/);
    assert.match(script.replaceString, /swipe\[direction\]\.call/);
    assert.match(script.replaceString, /setChatMessages/);
    assert.match(script.replaceString, /message_id:0,swipe_id:target/);
    assert.match(script.replaceString, /setLorebookEntries/);
    assert.match(script.replaceString, /enabled:value\.enabled/);
    assert.match(script.replaceString, /textContent/);
    assert.match(script.replaceString, /openings\.forEach/);
    assert.match(script.replaceString, /zoh-intro-markdown/);
    assert.match(script.replaceString, /function markdown/);
    assert.ok(script.replaceString.startsWith('<div class="zoh-root"'));
    assert.doesNotMatch(script.replaceString, /```html/);
    assert.doesNotMatch(script.replaceString, /\$1/);
    assert.match(script.replaceString, /\[Meta\|作品导航\|STORY HOME\|九一\|/);
});

test('generated opening homepage browser script is syntactically valid', () => {
    const replacement = buildOpeningHomeRegex(OPENING_HOME_DEFAULTS).replaceString;
    const match = replacement.match(/<script>\n([\s\S]*?)\n<\/script>/);
    assert.ok(match, 'generated script block is present');
    assert.doesNotThrow(() => new Function(match[1]));
});

test('enter button switches the greeting and applies the selected UID worldline through TavernHelper', async () => {
    const input = {
        ...OPENING_HOME_DEFAULTS,
        worldlines: [
            { id: 'sinner', name: '罪人线', entries: [{ book: '谈论爱之生', uid: 2, title: '罪人线 NSFW' }] },
            { id: 'god', name: '神明线', entries: [{ book: '谈论爱之生', uid: 10, title: '神明线设定' }] },
        ],
        entries: [{ number: '01', title: '赦免', route: '罪人线', summary: '简介', target: 2, worldlineId: 'sinner' }],
    };
    const replacement = buildOpeningHomeRegex(input).replaceString;
    const scriptSource = replacement.match(/<script>\n([\s\S]*?)\n<\/script>/)?.[1];
    assert.ok(scriptSource);

    const node = () => ({
        children: [],
        dataset: {},
        style: { setProperty() {} },
        classList: { contains: () => true },
        listeners: {},
        append(...items) { this.children.push(...items); },
        prepend(...items) { this.children.unshift(...items); },
        replaceChildren(...items) { this.children = items; },
        remove() { this.removed = true; },
        addEventListener(type, listener) { this.listeners[type] = listener; },
        scrollIntoView() {},
    });
    const button = node();
    const article = { ...node(), querySelector: selector => selector === '.zoh-jump' ? button : null };
    const list = { ...node(), querySelectorAll: selector => selector === '.zoh-entry' ? [article] : [] };
    const routes = node();
    const source = { ...node(), value: buildOpeningHomeBlock(input) };
    const generic = node();
    const root = {
        ...node(),
        querySelector(selector) {
            if (selector === '.zoh-source') return source;
            if (selector === '.zoh-list') return list;
            if (selector === '.zoh-routes') return routes;
            return generic;
        },
    };
    const style = { previousElementSibling: root };
    const currentScript = { previousElementSibling: style };
    const worldbookCalls = [];
    const chatCalls = [];
    const document = {
        currentScript,
        createElement: () => node(),
        createTextNode: value => ({ textContent: value }),
        querySelector: () => generic,
    };
    const TavernHelper = {
        getChatMessages: async () => [{ swipe_id: 0, swipes: ['主页', '罪人线开场', '神明线开场'] }],
        setChatMessages: async (messages, options) => chatCalls.push({ messages, options }),
        setLorebookEntries: async (book, entries) => worldbookCalls.push({ book, entries }),
    };
    const window = { document, TavernHelper, parent: null };
    window.parent = window;
    vm.runInNewContext(scriptSource, { window, document, Map, JSON, Number, String, Array, Math, decodeURIComponent, console });

    await button.listeners.click();
    assert.deepEqual(JSON.parse(JSON.stringify(chatCalls)), [{ messages: [{ message_id: 0, swipe_id: 1 }], options: { refresh: 'affected' } }]);
    assert.deepEqual(JSON.parse(JSON.stringify(worldbookCalls)), [{
        book: '谈论爱之生',
        entries: [{ uid: 2, enabled: true }, { uid: 10, enabled: false }],
    }]);
});

test('downloaded opening regex embeds current edited content instead of an empty capture', () => {
    const script = buildOpeningHomeRegex({
        ...OPENING_HOME_DEFAULTS,
        author: '酒疫',
        model: 'gemini3.1Pro\nClaude4.6',
        preset: '弥生春\n蛇果',
        intro: '这里是已经填写的作品简介。',
        entries: [{ number: '01', title: '雨夜重逢', route: '旧识重逢线', summary: '一条已经编辑的线路简介。', target: 2 }],
    });
    assert.doesNotMatch(script.replaceString, /\$1/);
    assert.match(script.replaceString, /酒疫/);
    assert.match(script.replaceString, /gemini3\.1Pro/);
    assert.match(script.replaceString, /这里是已经填写的作品简介/);
    assert.match(script.replaceString, /雨夜重逢/);
    assert.match(script.replaceString, /旧识重逢线/);
    assert.match(script.replaceString, /<h1 class="zoh-title">作品导航<\/h1>/);
    assert.match(script.replaceString, /<h3 class="zoh-entry-title">雨夜重逢<\/h3>/);
    assert.match(script.replaceString, /\.zoh-source,.zoh-routes,.zoh-route-tag\{display:none!important\}/);
});

test('embedded opening data cannot break the textarea or html fence', () => {
    const script = buildOpeningHomeRegex({ ...OPENING_HOME_DEFAULTS, intro: '```html\n</textarea><script>bad()</script>' });
    assert.doesNotMatch(script.replaceString, /<textarea class="zoh-source" hidden>[\s\S]*<script>bad/);
    assert.match(script.replaceString, /&lt;\/textarea&gt;/);
    assert.equal((script.replaceString.match(/```/g) || []).length, 0);
});

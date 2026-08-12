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

function embeddedPayload(replacement) {
    const encoded = replacement.match(/JSON\.parse\(decodeURIComponent\('([^']+)'\)\)/)?.[1];
    assert.ok(encoded, 'runtime payload is embedded in the exported regex');
    return JSON.parse(decodeURIComponent(encoded));
}

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
    const script = buildOpeningHomeRegex({ ...OPENING_HOME_DEFAULTS, entries });
    assert.equal(block, '【主页】');
    assert.equal(script.replaceString.match(/class="zoh-entry"/g)?.length, 10);
    assert.equal(embeddedPayload(script.replaceString).entries.length, 10);
    assert.equal(embeddedPayload(script.replaceString).entries[9].target, 11);
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
    const payload = embeddedPayload(buildOpeningHomeRegex(input).replaceString);
    assert.equal(normalized.model, 'Gemini 3.1\nClaude 4.5');
    assert.equal(normalized.preset, '沉浸剧情预设\n长篇稳定预设');
    assert.deepEqual(payload.worldlines, normalizeOpeningHomeSettings(input).worldlines);
    assert.equal(payload.entries[0].title, '雨夜初遇');
    assert.equal(payload.entries[0].worldlineId, 'rain');
});

test('downloaded homepage visibly renders worldline names, descriptions and route labels', () => {
    const script = buildOpeningHomeRegex({
        ...OPENING_HOME_DEFAULTS,
        worldlines: [{ id: 'sinner', name: '罪人线', description: '在审判与赦免之间作出选择。', entries: [] }],
        entries: [{ number: '01', title: '银庭审判', route: '罪人线', summary: '审判已经开始。', target: 2, worldlineId: 'sinner' }],
    });
    assert.match(script.replaceString, /<h2>世界线介绍<\/h2>/);
    assert.match(script.replaceString, /<h3>罪人线<\/h3>/);
    assert.match(script.replaceString, /在审判与赦免之间作出选择。/);
    assert.match(script.replaceString, /class="zoh-route">罪人线<\/span>/);
});

test('blank optional worldline descriptions do not render fake placeholder copy', () => {
    const script = buildOpeningHomeRegex({
        worldlines: [{ id: 'single', name: '单线', description: '', entries: [] }],
        entries: [{ number: '01', title: '唯一开局', route: '单线', summary: '故事从这里开始。', target: 2, worldlineId: 'single' }],
    });
    assert.doesNotMatch(script.replaceString, /<h3>单线<\/h3>|世界线介绍/);
    assert.doesNotMatch(script.replaceString, /这条线路尚未填写介绍|尚未填写线路简介/);
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

test('all twelve homepage templates produce genuinely themed exported HTML', () => {
    const themes = ['classical', 'newspaper', 'timeline', 'minimal', 'scroll', 'editorial', 'collage', 'dossier', 'glass', 'kinetic', 'noir-poster', 'negative-space'];
    for (const theme of themes) {
        const script = buildOpeningHomeRegex({ ...OPENING_HOME_DEFAULTS, theme });
        assert.match(script.replaceString, new RegExp(`data-theme="${theme}"`));
        if (theme !== 'classical') assert.match(script.replaceString, new RegExp(`zoh-root\\[data-theme="${theme}"\\]`));
    }
    const kinetic = buildOpeningHomeRegex({ ...OPENING_HOME_DEFAULTS, theme: 'kinetic' }).replaceString;
    const noir = buildOpeningHomeRegex({ ...OPENING_HOME_DEFAULTS, theme: 'noir-poster' }).replaceString;
    const negativeSpace = buildOpeningHomeRegex({ ...OPENING_HOME_DEFAULTS, theme: 'negative-space' }).replaceString;
    assert.match(kinetic, /writing-mode:vertical-rl/);
    assert.match(kinetic, /transform:rotate\(-7deg\)/);
    assert.match(noir, /grid-template-columns:112px minmax\(0,1fr\)/);
    assert.match(noir, /background:linear-gradient\(148deg/);
    assert.match(negativeSpace, /grid-template-columns:1fr 1fr minmax\(150px,.65fr\)/);
    assert.match(negativeSpace, /content:"LAYOUT \/ DESIGN"/);
});

test('opening homepage regex directly replaces one marker and keeps real navigation APIs', () => {
    const script = buildOpeningHomeRegex(OPENING_HOME_DEFAULTS);
    assert.equal(script.findRegex, '/【主页】/s');
    assert.match(script.replaceString, /swipe\[direction\]\.call/);
    assert.match(script.replaceString, /setChatMessages/);
    assert.match(script.replaceString, /typeof setChatMessages==='function'/);
    assert.match(script.replaceString, /message_id:0,swipe_id:target/);
    assert.match(script.replaceString, /setLorebookEntries/);
    assert.match(script.replaceString, /selectedLine[\s\S]*?!selectedLine\.entries\.length\)return/);
    assert.match(script.replaceString, /enabled:value\.enabled/);
    assert.match(script.replaceString, /世界书线路绑定失败，继续切换开场白/);
    assert.match(script.replaceString, /已切换“/);
    assert.match(script.replaceString, /启用：/);
    assert.match(script.replaceString, /关闭：/);
    assert.match(script.replaceString, /class="zoh-switch-toast"/);
    assert.match(script.replaceString, /textContent/);
    assert.match(script.replaceString, /openings\.forEach/);
    assert.match(script.replaceString, /zoh-intro-markdown/);
    assert.ok(script.replaceString.startsWith('```html\n<!DOCTYPE html>\n<html lang="zh-CN">'));
    assert.ok(script.replaceString.endsWith('\n```'));
    assert.match(script.replaceString, /<body>[\s\S]*<\/body>/);
    assert.deepEqual(script.placement, [1, 2]);
    assert.doesNotMatch(script.replaceString, /\$1/);
    assert.doesNotMatch(script.replaceString, /opening_home|zoh-source|zoh-routes|zoh-route-tag/);
    assert.match(script.replaceString, /JSON\.parse\(decodeURIComponent/);
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
    const generic = node();
    const root = {
        ...node(),
        querySelector(selector) {
            if (selector === '.zoh-list') return list;
            return generic;
        },
    };
    const style = { previousElementSibling: root };
    const currentScript = { previousElementSibling: style };
    const worldbookCalls = [];
    const legacyWorldbookCalls = [];
    const chatCalls = [];
    const document = {
        currentScript,
        createElement: () => node(),
        createTextNode: value => ({ textContent: value }),
        querySelector: () => generic,
    };
    let rejectWorldbook = false;
    const getChatMessages = async () => [{ swipe_id: 0, swipes: ['主页', '罪人线开场', '神明线开场'] }];
    const setChatMessages = async (...args) => chatCalls.push(args);
    const updateWorldbookWith = async (book, updater) => {
        if (rejectWorldbook) throw new Error('模拟旧版世界书接口失败');
        const entries = await updater([
            { uid: 2, name: '罪人线', enabled: false },
            { uid: 10, name: '神明线', enabled: true },
            { uid: 99, name: '其他条目', enabled: true },
        ]);
        worldbookCalls.push({ book, entries });
    };
    const setLorebookEntries = async (book, entries) => legacyWorldbookCalls.push({ book, entries });
    const window = { document, parent: null };
    window.parent = window;
    const sandbox = { window, document, Map, JSON, Number, String, Array, Math, decodeURIComponent, console: { warn() {} }, getChatMessages, setChatMessages, updateWorldbookWith, setLorebookEntries };
    vm.runInNewContext(scriptSource, sandbox);

    await button.listeners.click();
    assert.deepEqual(JSON.parse(JSON.stringify(chatCalls)), [[[ { message_id: 0, swipe_id: 1 } ]]]);
    assert.deepEqual(JSON.parse(JSON.stringify(worldbookCalls)), [{
        book: '谈论爱之生',
        entries: [
            { uid: 2, name: '罪人线', enabled: true },
            { uid: 10, name: '神明线', enabled: false },
            { uid: 99, name: '其他条目', enabled: true },
        ],
    }]);
    assert.deepEqual(legacyWorldbookCalls, [], 'current Worldbook API must be preferred over the deprecated Lorebook API');

    sandbox.updateWorldbookWith = undefined;
    chatCalls.length = 0;
    await button.listeners.click();
    assert.deepEqual(JSON.parse(JSON.stringify(legacyWorldbookCalls)), [{
        book: '谈论爱之生',
        entries: [{ uid: 2, enabled: true }, { uid: 10, enabled: false }],
    }], 'deprecated Lorebook API remains available for older TavernHelper versions');
    assert.deepEqual(JSON.parse(JSON.stringify(chatCalls)), [[[ { message_id: 0, swipe_id: 1 } ]]]);

    sandbox.updateWorldbookWith = updateWorldbookWith;
    rejectWorldbook = true;
    chatCalls.length = 0;
    await button.listeners.click();
    assert.deepEqual(JSON.parse(JSON.stringify(chatCalls)), [[[ { message_id: 0, swipe_id: 1 } ]]], 'UID binding failure must not block greeting navigation');
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
    assert.match(script.replaceString, /<h1 class="zoh-title">作品导航<\/h1>/);
    assert.match(script.replaceString, /<h3 class="zoh-entry-title">雨夜重逢<\/h3>/);
    assert.doesNotMatch(script.replaceString, /opening_home|zoh-source|zoh-routes|zoh-route-tag/);
    assert.equal(embeddedPayload(script.replaceString).entries[0].route, '旧识重逢线');
});

test('embedded opening data cannot break out of static html or executable payload', () => {
    const script = buildOpeningHomeRegex({
        ...OPENING_HOME_DEFAULTS,
        intro: '```html\n</textarea><script>bad()</script>',
        worldlines: [{ id: "route'one", name: "审判'线", description: "不能打断'运行数据", entries: [] }],
    });
    assert.doesNotMatch(script.replaceString, /<script>bad\(\)<\/script>/);
    assert.match(script.replaceString, /&lt;\/textarea&gt;/);
    assert.match(script.replaceString, /&lt;script&gt;bad\(\)&lt;\/script&gt;/);
    assert.doesNotThrow(() => embeddedPayload(script.replaceString));
    const scriptSource = script.replaceString.match(/<script>\n([\s\S]*?)\n<\/script>/)?.[1];
    assert.doesNotThrow(() => new Function(scriptSource));
    assert.equal((script.replaceString.match(/```/g) || []).length, 2);
});

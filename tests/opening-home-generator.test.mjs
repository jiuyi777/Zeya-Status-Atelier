import test from 'node:test';
import assert from 'node:assert/strict';
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
        summary: `简介 ${index + 1}`,
        target: index + 2,
    }));
    const block = buildOpeningHomeBlock({ ...OPENING_HOME_DEFAULTS, entries });
    assert.equal(block.match(/^\[Opening\|/gm)?.length, 10);
    assert.match(block, /\[Opening\|10\|开场白 10\|简介 10\|11\|\]/);
});

test('opening homepage keeps multiline recommendations and binds concrete worldbook entries', () => {
    const input = {
        ...OPENING_HOME_DEFAULTS,
        model: 'Gemini 3.1\nClaude 4.5',
        preset: '沉浸剧情预设\n长篇稳定预设',
        worldlines: [{ id: 'rain', name: '雨夜线', description: '雨夜相遇路线。', entries: [{ book: '旧城总设', uid: 12, title: '雨夜规则' }] }],
        entries: [{ number: '01', title: '雨夜初遇', summary: '简介', target: 1, worldlineId: 'rain' }],
    };
    const normalized = normalizeOpeningHomeSettings(input);
    const block = buildOpeningHomeBlock(input);
    assert.equal(normalized.model, 'Gemini 3.1\nClaude 4.5');
    assert.equal(normalized.preset, '沉浸剧情预设\n长篇稳定预设');
    assert.match(block, /\[Worldline\|rain\|雨夜线\|/);
    assert.match(block, /\[Worldline\|rain\|雨夜线\|雨夜相遇路线。\|/);
    assert.match(block, /\[Opening\|01\|雨夜初遇\|简介\|1\|rain\]/);
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
    assert.match(script.replaceString, /textContent/);
    assert.match(script.replaceString, /openings\.forEach/);
    assert.match(script.replaceString, /zoh-intro-markdown/);
    assert.match(script.replaceString, /function markdown/);
    assert.ok(script.replaceString.startsWith('<div class="zoh-root">'));
    assert.doesNotMatch(script.replaceString, /```html/);
    assert.doesNotMatch(script.replaceString, /\$1/);
    assert.match(script.replaceString, /\[Meta\|作品导航\|STORY HOME\|Zeya\|/);
});

test('generated opening homepage browser script is syntactically valid', () => {
    const replacement = buildOpeningHomeRegex(OPENING_HOME_DEFAULTS).replaceString;
    const match = replacement.match(/<script>\n([\s\S]*?)\n<\/script>/);
    assert.ok(match, 'generated script block is present');
    assert.doesNotThrow(() => new Function(match[1]));
});

test('downloaded opening regex embeds current edited content instead of an empty capture', () => {
    const script = buildOpeningHomeRegex({
        ...OPENING_HOME_DEFAULTS,
        author: '酒疫',
        model: 'gemini3.1Pro\nClaude4.6',
        preset: '弥生春\n蛇果',
        intro: '这里是已经填写的作品简介。',
        entries: [{ number: '01', title: '雨夜重逢', summary: '一条已经编辑的线路简介。', target: 2 }],
    });
    assert.doesNotMatch(script.replaceString, /\$1/);
    assert.match(script.replaceString, /酒疫/);
    assert.match(script.replaceString, /gemini3\.1Pro/);
    assert.match(script.replaceString, /这里是已经填写的作品简介/);
    assert.match(script.replaceString, /雨夜重逢/);
});

test('embedded opening data cannot break the textarea or html fence', () => {
    const script = buildOpeningHomeRegex({ ...OPENING_HOME_DEFAULTS, intro: '```html\n</textarea><script>bad()</script>' });
    assert.doesNotMatch(script.replaceString, /<textarea class="zoh-source" hidden>[\s\S]*<script>bad/);
    assert.match(script.replaceString, /&lt;\/textarea&gt;/);
    assert.equal((script.replaceString.match(/```/g) || []).length, 0);
});

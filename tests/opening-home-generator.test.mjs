import test from 'node:test';
import assert from 'node:assert/strict';
import {
    OPENING_HOME_DEFAULTS,
    buildOpeningHomeBlock,
    buildOpeningHomeRegex,
    normalizeOpeningHomeSettings,
} from '../opening-home-generator.js';

test('opening homepage accepts any number of directory entries', () => {
    const entries = Array.from({ length: 10 }, (_, index) => ({
        number: String(index + 1).padStart(2, '0'),
        title: `开场白 ${index + 1}`,
        characters: `人物 ${index + 1}`,
        summary: `简介 ${index + 1}`,
        target: index + 2,
    }));
    const block = buildOpeningHomeBlock({ ...OPENING_HOME_DEFAULTS, entries });
    assert.equal(block.match(/^\[Opening\|/gm)?.length, 10);
    assert.match(block, /\[Opening\|10\|开场白 10\|人物 10\|简介 10\|11\]/);
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
    assert.equal(script.findRegex, '/<opening_home>\\s*([\\s\\S]*?)\\s*<\\/opening_home>/i');
    assert.match(script.replaceString, /classical','newspaper','timeline','minimal/);
    assert.match(script.replaceString, /swipe\[direction\]\.call/);
    assert.match(script.replaceString, /textContent/);
    assert.match(script.replaceString, /openings\.forEach/);
});

test('generated opening homepage browser script is syntactically valid', () => {
    const replacement = buildOpeningHomeRegex(OPENING_HOME_DEFAULTS).replaceString;
    const match = replacement.match(/<script>\n([\s\S]*?)\n<\/script>/);
    assert.ok(match, 'generated script block is present');
    assert.doesNotThrow(() => new Function(match[1]));
});

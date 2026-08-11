import test from 'node:test';
import assert from 'node:assert/strict';
import {
    RULE_PRESETS,
    STATUS_PALETTE_PRESETS,
    STATUS_STRUCTURE_PRESETS,
    STATUS_STYLE_PRESETS,
    buildAiInstruction,
    buildRegexScript,
    buildWorldbookJson,
    normalizeRule,
    parseStatusOutput,
    parseFields,
    parsePages,
} from '../rule-generator.js';

test('parses any number of switch pages without storing story values', () => {
    const pages = parsePages('喻生|谨慎克制\n喻黎|老城区生活\n旁观者|第三视角');
    assert.deepEqual(pages.map(page => page.id), ['View1', 'View2', 'View3']);
    assert.deepEqual(pages.map(page => page.label), ['喻生', '喻黎', '旁观者']);
});

test('registers genuinely different component structures and composable palettes', () => {
    assert.equal(STATUS_STRUCTURE_PRESETS.length, 9);
    assert.equal(new Set(STATUS_STRUCTURE_PRESETS.map(item => item.id)).size, 9);
    assert.equal(STATUS_PALETTE_PRESETS.length, 12);
    assert.equal(new Set(STATUS_PALETTE_PRESETS.map(item => item.id)).size, 12);
    for (const structure of STATUS_STRUCTURE_PRESETS) {
        assert.ok(structure.fields.length >= 3, `${structure.name} has an editable schema`);
        assert.ok(structure.fields.every(field => field.length === 4), `${structure.name} keeps stable field keys`);
    }
});

test('normalizes safe media and rejects executable URLs', () => {
    const rule = normalizeRule({
        ...RULE_PRESETS.universalClassical,
        structure: 'music',
        paletteId: 'porcelain',
        media: {
            avatarSource: 'url',
            avatarUrl: 'javascript:alert(1)',
            imageUrl: 'https://example.com/cover.jpg',
            audioUrl: 'https://example.com/theme.mp3',
        },
    });
    assert.equal(rule.structure, 'music');
    assert.equal(rule.palette.id, 'porcelain');
    assert.equal(rule.media.avatarUrl, '');
    assert.equal(rule.media.imageUrl, 'https://example.com/cover.jpg');
    assert.equal(rule.media.audioUrl, 'https://example.com/theme.mp3');
});

test('generated renderer contains real media components without autoplay', () => {
    const script = buildRegexScript({
        ...RULE_PRESETS.universalClassical,
        structure: 'music',
        paletteId: 'jade-gold',
        media: {
            avatarSource: 'character',
            avatarUrl: '/thumbnail?type=avatar&file=character.png',
            imageUrl: 'https://example.com/cover.jpg',
            audioUrl: 'https://example.com/theme.mp3',
            imageAlt: '剧情配图',
        },
    });
    assert.match(script.replaceString, /data-structure="music"/);
    assert.match(script.replaceString, /class="zrs-structure-head"/);
    assert.match(script.replaceString, /make\('audio','zrs-audio'\)/);
    assert.match(script.replaceString, /audio\.controls=true/);
    assert.doesNotMatch(script.replaceString, /autoplay/i);
    assert.match(script.replaceString, /--z-accent:#c9a54c/);
});

test('parses a complete AI status block and rejects incomplete output', () => {
    const input = {
        ...RULE_PRESETS.relationship,
        pagesText: '当前角色|测试角色',
        sharedFieldsText: '',
        pageFieldsText: '地点|填写地点|text|location\n好感度|填写数值|progress|affection',
    };
    const parsed = parseStatusOutput(input, '<zeya_relationship>\n[View1|图书馆|72]\n</zeya_relationship>');
    assert.deepEqual(parsed.pages[0].values, ['图书馆', '72']);
    assert.throws(() => parseStatusOutput(input, '<zeya_relationship>\n[View1|图书馆]\n</zeya_relationship>'), /缺少完整记录/);
});

test('parses editable field names, AI instructions and display kinds', () => {
    const fields = parseFields('好感度|填写0到100整数|progress\n日记|第一人称写作|long');
    assert.deepEqual(fields[0], {
        id: 'field_1',
        label: '好感度',
        instruction: '填写0到100整数',
        kind: 'progress',
    });
    assert.equal(fields[1].kind, 'long');
});

test('builds AI instructions with dynamic placeholders for every page', () => {
    const instruction = buildAiInstruction({
        ...RULE_PRESETS.twinsDiary,
        pagesText: '喻生|克制\n喻黎|困顿',
    });
    assert.match(instruction, /所有值都必须根据当前剧情动态生成/);
    assert.match(instruction, /\[View1\|\{\{喻生·可用资金/);
    assert.match(instruction, /\[View2\|\{\{喻黎·可用资金/);
    assert.doesNotMatch(instruction, /￥3,500,000\.00/);
});

test('generates an importable regex JSON with a full-block capture and switch UI', () => {
    const script = buildRegexScript({
        ...RULE_PRESETS.richTwins,
        ruleId: 'stable-id',
        pagesText: '角色甲|说明甲\n角色乙|说明乙',
    });
    assert.equal(script.id, 'stable-id');
    assert.equal(script.scriptName, '九一 · 双页剧情状态');
    assert.equal(script.findRegex, '/<zeya_status>\\s*([\\s\\S]*?)\\s*<\\/zeya_status>/i');
    assert.deepEqual(script.placement, [2]);
    assert.match(script.replaceString, /zrs-tab/);
    assert.match(script.replaceString, /textContent/);
    assert.match(script.replaceString, /\$1/);
});

test('normalization never treats a dynamic value as a setting', () => {
    const rule = normalizeRule(RULE_PRESETS.richTwins);
    assert.equal(Object.hasOwn(rule, 'value'), false);
    assert.equal(Object.hasOwn(rule, 'affection'), false);
    assert.equal(rule.pages.length, 2);
    assert.ok(rule.pageFields.length >= 8);
});

test('builds an importable constant worldbook entry containing the dynamic output rule', () => {
    const worldbook = buildWorldbookJson({
        ...RULE_PRESETS.universalClassical,
        tagName: 'zeya_status_classical',
    });
    const entry = worldbook.entries[0];
    assert.equal(entry.uid, 0);
    assert.equal(entry.constant, true);
    assert.deepEqual(entry.key, []);
    assert.match(entry.content, /<zeya_status_classical_rules>/);
    assert.match(entry.content, /所有值都必须根据当前剧情动态生成/);
    assert.equal(Object.hasOwn(entry, 'affection'), false);
});

test('registers 50 editable mobile themes with unique codes and ids', () => {
    assert.equal(STATUS_STYLE_PRESETS.length, 50);
    assert.equal(new Set(STATUS_STYLE_PRESETS.map(style => style.code)).size, 50);
    assert.equal(new Set(STATUS_STYLE_PRESETS.map(style => style.id)).size, 50);
    assert.deepEqual(STATUS_STYLE_PRESETS.map(style => style.code), Array.from({ length: 50 }, (_, index) => String(index + 1).padStart(2, '0')));
});

test('editorial theme keeps the reference composition while consuming dynamic records', () => {
    const style = STATUS_STYLE_PRESETS.find(item => item.id === 'minimal');
    assert.equal(style?.name, '构成编辑');
    const script = buildRegexScript({
        ...RULE_PRESETS.universalClassical,
        theme: style.id,
        title: style.title,
        subtitle: style.subtitle,
    });
    assert.match(script.replaceString, /LIVE \/ WORLD INFO/);
    assert.match(script.replaceString, /--z-accent:#a7312e/);
    assert.match(script.replaceString, /var records=\{\}/);
    assert.doesNotMatch(script.replaceString, /参考人物|示例人物/);
});

test('every status theme generates syntactically valid mobile renderer code', () => {
    for (const style of STATUS_STYLE_PRESETS) {
        const script = buildRegexScript({
            ...RULE_PRESETS.universalClassical,
            theme: style.id,
            layout: style.layout,
            title: style.title,
            subtitle: style.subtitle,
        });
        assert.match(script.replaceString, new RegExp(`data-theme="${style.id}"`));
        assert.match(script.replaceString, /zrs-chrome/);
        assert.match(script.replaceString, /@media\(max-width:520px\)/);
        const browserScript = script.replaceString.match(/<script>\n([\s\S]*?)\n<\/script>/);
        assert.ok(browserScript, `${style.code} ${style.name} includes browser script`);
        assert.doesNotThrow(() => new Function(browserScript[1]), `${style.code} ${style.name} browser script parses`);
    }
});

test('30 mini-web themes have dedicated palettes, glyphs and editable schemas', () => {
    const miniWebThemes = STATUS_STYLE_PRESETS.slice(20);
    assert.equal(miniWebThemes.length, 30);
    for (const style of miniWebThemes) {
        assert.ok(style.glyph, `${style.code} ${style.name} has a visual glyph`);
        assert.ok(style.shared?.length >= 3, `${style.code} ${style.name} has shared fields`);
        assert.ok(style.fields?.length >= 4, `${style.code} ${style.name} has page fields`);
        const script = buildRegexScript({
            ...RULE_PRESETS.universalClassical,
            theme: style.id,
            title: style.title,
            subtitle: style.subtitle,
        });
        assert.match(script.replaceString, new RegExp(`data-theme="${style.id}"\\]\\{--z-accent:`));
    }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    RULE_PRESETS,
    STATUS_CUSTOM_VARIANTS,
    STATUS_LOGO_PRESETS,
    STATUS_PALETTE_PRESETS,
    STATUS_RECIPE_PRESETS,
    STATUS_STRUCTURE_PRESETS,
    STATUS_STYLE_PRESETS,
    STATUS_THEME_CSS,
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
    assert.equal(STATUS_STRUCTURE_PRESETS.length, 29);
    assert.equal(new Set(STATUS_STRUCTURE_PRESETS.map(item => item.id)).size, 29);
    assert.equal(STATUS_PALETTE_PRESETS.length, 24);
    assert.equal(new Set(STATUS_PALETTE_PRESETS.map(item => item.id)).size, 24);
    assert.ok(STATUS_PALETTE_PRESETS.every(item => ['accent', 'background', 'card', 'text', 'muted'].every(key => /^#[0-9a-f]{6}$/i.test(item[key]))));
    for (const structure of STATUS_STRUCTURE_PRESETS) {
        assert.ok(structure.fields.length >= 3, `${structure.name} has an editable schema`);
        assert.ok(structure.fields.every(field => field.length === 4), `${structure.name} keeps stable field keys`);
    }
});

test('decorative logos are independent from appearance and survive into generated renderer', () => {
    assert.ok(STATUS_LOGO_PRESETS.length >= 18);
    assert.ok(STATUS_LOGO_PRESETS.some(item => item.id === 'leaf-cut' && item.effect === 'slice'));
    assert.equal(STATUS_LOGO_PRESETS.filter(item => item.family === 'apple').length, 5);
    assert.ok(new Set(STATUS_LOGO_PRESETS.filter(item => item.family === 'apple').map(item => item.effect)).size >= 5);
    assert.ok(STATUS_LOGO_PRESETS.filter(item => item.family === 'object').length >= 10);
    const apple = normalizeRule({ ...RULE_PRESETS.universalClassical, theme: 'vinyl-mag', logoId: 'apple-halftone' });
    const automatic = normalizeRule({ ...RULE_PRESETS.universalClassical, theme: 'vinyl-mag', logoId: 'auto' });
    assert.equal(apple.logoFamily, 'apple');
    assert.equal(apple.logoEffect, 'halftone');
    assert.equal(automatic.glyph, '♪');
    const generated = buildRegexScript({ ...RULE_PRESETS.universalClassical, logoId: 'leaf-cut' }).replaceString;
    assert.match(generated, /data-logo="leaf-cut"/);
    assert.match(generated, /"logoEffect":"slice"/);
    assert.match(generated, /zrs-meter-marker/);
    assert.match(generated, /marker\.style\.left='clamp\(12px,'\+n\+'%,calc\(100% - 12px\)\)'/);
    assert.match(generated, /AI 动态数值位置/);
});

test('the workbench can reuse every exported theme instead of showing a color-only mockup', () => {
    for (const style of STATUS_STYLE_PRESETS) {
        assert.match(STATUS_THEME_CSS, new RegExp(`data-theme="${style.id}"`), `${style.name} has exported theme CSS`);
    }
    assert.match(STATUS_THEME_CSS, /data-theme="vinyl-mag"[^}]*[\s\S]*?\.zrs-header::before/);
    assert.match(STATUS_THEME_CSS, /data-theme="cafe-receipt"[^}]*[\s\S]*?clip-path:polygon/);
    for (const structure of ['custom', 'profile', 'social', 'forum', 'chat', 'collage', 'music', 'quest', 'casefile']) {
        assert.match(STATUS_THEME_CSS, new RegExp(`data-structure="${structure}"`), `${structure} has a distinct exported skeleton`);
    }
    assert.match(STATUS_THEME_CSS, /data-structure="music"[^}]*[\s\S]*?repeating-radial-gradient/);
    assert.match(STATUS_THEME_CSS, /data-structure="forum"[^}]*[\s\S]*?grid-template-columns:110px/);
    assert.match(STATUS_THEME_CSS, /data-structure="forum"[^}]*[\s\S]*?zrs-field:nth-child\(4\)/);
    assert.match(STATUS_THEME_CSS, /data-structure="collage"[^}]*[\s\S]*?grid-template-columns:repeat\(12/);
    assert.match(STATUS_THEME_CSS, /data-structure="collage"[^}]*[\s\S]*?zrs-structure-art i:nth-child\(3\)/);
    assert.match(STATUS_THEME_CSS, /data-structure="custom"[^}]*[\s\S]*?border:3px inset/);
    assert.match(STATUS_THEME_CSS, /data-structure="social"[^}]*[\s\S]*?data-field="post_body"/);
    assert.match(STATUS_THEME_CSS, /data-structure="forum"[^}]*[\s\S]*?zrs-forum-avatar/);
    assert.match(STATUS_THEME_CSS, /data-structure="music"[^}]*[\s\S]*?33⅓/);
    assert.match(STATUS_THEME_CSS, /data-structure="quest"[^}]*[\s\S]*?drop-shadow/);
    assert.match(STATUS_THEME_CSS, /data-structure="casefile"[^}]*[\s\S]*?rotate\(-5deg\)/);
    assert.match(STATUS_THEME_CSS, /data-structure="music"[^}]*[\s\S]*?box-shadow:7px 8px 0/);
    assert.match(STATUS_THEME_CSS, /data-structure="quest"[^}]*[\s\S]*?clip-path:none/);
    assert.match(STATUS_THEME_CSS, /data-logo="apple-halftone"/);
});

test('registers twenty custom panels and twenty one-click type recipes', () => {
    assert.equal(STATUS_CUSTOM_VARIANTS.length, 20);
    assert.equal(new Set(STATUS_CUSTOM_VARIANTS.map(item => item.id)).size, 20);
    assert.equal(STATUS_RECIPE_PRESETS.filter(item => item.group === 'custom').length, 20);
    assert.equal(STATUS_RECIPE_PRESETS.filter(item => item.group === 'type').length, 20);
    assert.equal(new Set(STATUS_RECIPE_PRESETS.map(item => item.id)).size, 40);
    for (const variant of STATUS_CUSTOM_VARIANTS) {
        assert.match(STATUS_THEME_CSS, new RegExp(`data-variant="${variant.id}"`), `${variant.name} has exported material CSS`);
    }
    for (const recipe of STATUS_RECIPE_PRESETS.filter(item => item.group === 'type')) {
        assert.match(STATUS_THEME_CSS, new RegExp(`data-structure="${recipe.structure}"`), `${recipe.name} has exported type CSS`);
    }
    for (const recipe of STATUS_RECIPE_PRESETS) {
        const structure = STATUS_STRUCTURE_PRESETS.find(item => item.id === recipe.structure);
        const variant = STATUS_CUSTOM_VARIANTS.find(item => item.id === recipe.variant);
        const fields = variant?.fields || structure.fields;
        const rendered = buildRegexScript({
            ...RULE_PRESETS.custom,
            structure: recipe.structure,
            variant: recipe.variant,
            theme: recipe.theme,
            paletteId: recipe.paletteId,
            logoId: recipe.logoId,
            layout: recipe.layout,
            pageFieldsText: fields.map(field => field.join('|')).join('\n'),
        }).replaceString;
        assert.match(rendered, new RegExp(`data-structure="${recipe.structure}"`));
        assert.match(rendered, new RegExp(`data-variant="${recipe.variant}"`));
        const browserScript = rendered.match(/<script>\n([\s\S]*?)\n<\/script>/);
        assert.ok(browserScript, `${recipe.name} includes browser script`);
        assert.doesNotThrow(() => new Function(browserScript[1]), `${recipe.name} browser script parses`);
    }
    const generated = buildRegexScript({ ...RULE_PRESETS.custom, variant: 'glass-orbit' }).replaceString;
    assert.match(generated, /data-variant="glass-orbit"/);
    assert.match(generated, /"variant":"glass-orbit"/);
    const navigationRecipe = STATUS_RECIPE_PRESETS.find(item => item.variant === 'glass-orbit');
    assert.equal(navigationRecipe.name, '章节分镜台');
    assert.equal(navigationRecipe.pagesText.split('\n').length, 3);
    assert.match(navigationRecipe.title, /可切换/);
    const ceramicRecipe = STATUS_RECIPE_PRESETS.find(item => item.variant === 'ceramic-plaque');
    const memoryRecipe = STATUS_RECIPE_PRESETS.find(item => item.structure === 'memory');
    assert.equal(ceramicRecipe.avatarSource, 'character');
    assert.equal(memoryRecipe.avatarSource, 'user');
    assert.match(STATUS_THEME_CSS, /data-variant="editorial-cut"[\s\S]*?white-space:nowrap/);
    assert.match(STATUS_THEME_CSS, /data-variant="botanical-press"[\s\S]*?粘贴图片 URL/);
    assert.doesNotMatch(STATUS_THEME_CSS, /data-variant="botanical-press"[\s\S]*?data:image\/svg\+xml/);

    const typeRecipes = STATUS_RECIPE_PRESETS.filter(item => item.group === 'type');
    const typeCopy = STATUS_STRUCTURE_PRESETS
        .filter(item => typeRecipes.some(recipe => recipe.structure === item.id))
        .flatMap(item => [item.name, item.title, item.description, ...item.fields.flat()])
        .join('\n');
    for (const fixedBusinessCopy of ['精选商品', '商品名', '价格', '库存', '销量', '目的地', '出发日', '含水量', '主队', '客队', '比分']) {
        assert.doesNotMatch(typeCopy, new RegExp(fixedBusinessCopy), `type layouts stay generic instead of fixing ${fixedBusinessCopy}`);
    }
    assert.equal(STATUS_STRUCTURE_PRESETS.find(item => item.id === 'shop').name, '包豪斯主视觉');
    assert.equal(STATUS_STRUCTURE_PRESETS.find(item => item.id === 'specimen').fields[3][0], '图像标题');
    assert.equal(typeRecipes.find(item => item.structure === 'shop').paletteId, 'cream-navy');
    assert.equal(typeRecipes.find(item => item.structure === 'travel').paletteId, 'sakura-paper');
    assert.match(STATUS_THEME_CSS, /data-variant="star-map"[\s\S]*?border-radius:22px/);
    assert.doesNotMatch(STATUS_THEME_CSS, /data-variant="star-map"[^\n]*?border-radius:50% 50%/);
    assert.match(STATUS_THEME_CSS, /data-variant="cream-inset"[\s\S]*?彩色网点/);
    assert.match(STATUS_THEME_CSS, /data-variant="archive-drawer"[\s\S]*?SUPPLY MANIFEST/);
});

test('free component canvas is the fallback instead of a hard-coded relationship card', () => {
    assert.equal(normalizeRule({}).structure, 'custom');
    assert.equal(RULE_PRESETS.custom.structure, 'custom');
    assert.equal(RULE_PRESETS.custom.pageFieldsText.split('\n').length, 3);
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

test('generated fields keep semantic ids and forum binds a real avatar into the author rail', () => {
    const script = buildRegexScript({
        ...RULE_PRESETS.universalClassical,
        structure: 'forum',
        media: {
            avatarSource: 'character',
            avatarUrl: '/thumbnail?type=avatar&file=character.png',
        },
    });
    assert.match(script.replaceString, /item\.dataset\.field=field\.id/);
    assert.match(script.replaceString, /field\.id==='floor_user'/);
    assert.match(script.replaceString, /zrs-forum-avatar/);
    assert.match(script.replaceString, /当前角色头像/);
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
    const fullWidth = parseStatusOutput(input, '<zeya_relationship>【View1｜钟楼｜86】</zeya_relationship>');
    assert.deepEqual(fullWidth.pages[0].values, ['钟楼', '86']);
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

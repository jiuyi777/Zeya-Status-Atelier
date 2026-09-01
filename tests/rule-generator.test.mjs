import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
    PHONE_APP_ICON_ASSETS,
    PHONE_PAGE_SCHEMAS,
    PHONE_SHELL_VISUAL_DEFAULTS,
    CHAT_APPEARANCE_PRESETS,
    CHAT_FRAME_ASSET_URLS,
    CHAT_REFERENCE_CSS,
    CHAT_SAMPLE_LOG,
    RULE_PRESETS,
    SOCIAL_APPEARANCE_PRESETS,
    PHONE_SHELL_STYLES,
    STATUS_PALETTE_PRESETS,
    STATUS_STRUCTURE_PRESETS,
    STATUS_STYLE_PRESETS,
    STATUS_THEME_CSS,
    STATUS_PHONE_CSS,
    FORUM_THEME_CSS,
    FORUM_SKIN_PRESETS,
    buildAiInstruction,
    buildRegexScript,
    buildWorldbookJson,
    makePreviewRecords,
    normalizePhoneDesktop,
    normalizeRule,
    parseChatConversationLog,
    parseStatusOutput,
    parseFields,
    parsePages,
    mergeStatusRegexScripts,
    statusRegexInstallId,
} from '../rule-generator.js';
import {
    STATUS_BEAUTY_01_15_IDS,
    applyStatusBeautyControlChrome,
    applyStatusBeautyFieldLayout,
    applyStatusBeautyMediaSettings,
    applyStatusBeautyTextOverrides,
    applyStatusBeautyTitle,
    applyStatusBeautyMobileTypography,
    buildStatusBeautyBundledPreviewDocument,
    statusBeautyBundleMeta,
} from '../status-beauty-01-15-bundle.js';

const statusBeauty16To20Css = readFileSync(new URL('../status-beauty-16-20.css', import.meta.url), 'utf8');
const statusBeauty05To09Css = readFileSync(new URL('../status-beauty-05-09.css', import.meta.url), 'utf8');
const statusBeautyBundleSource = readFileSync(new URL('../status-beauty-01-15-bundle.js', import.meta.url), 'utf8');

test('parses any number of switch pages without storing story values', () => {
    const pages = parsePages('喻生|谨慎克制\n喻黎|老城区生活\n旁观者|第三视角');
    assert.deepEqual(pages.map(page => page.id), ['View1', 'View2', 'View3']);
    assert.deepEqual(pages.map(page => page.label), ['喻生', '喻黎', '旁观者']);
});

test('registers genuinely different component structures and composable palettes', () => {
    assert.equal(STATUS_STRUCTURE_PRESETS.length, 33);
    assert.equal(new Set(STATUS_STRUCTURE_PRESETS.map(item => item.id)).size, 33);
    assert.equal(STATUS_PALETTE_PRESETS.length, 26);
    assert.equal(new Set(STATUS_PALETTE_PRESETS.map(item => item.id)).size, 26);
    assert.ok(STATUS_PALETTE_PRESETS.every(item => ['accent', 'background', 'card', 'text', 'muted'].every(key => /^#[0-9a-f]{6}$/i.test(item[key]))));
    assert.deepEqual(STATUS_PALETTE_PRESETS.slice(-8).map(item => item.name), [
        '咖啡薄荷',
        '梅紫鎏金',
        '薄荷珊瑚',
        '冰川浅蓝',
        '柠檬樱粉',
        '牛血石灰',
        '黑白钢蓝档案',
        '粉蓝黑莓像素',
    ]);
    for (const structure of STATUS_STRUCTURE_PRESETS) {
        assert.ok(structure.fields.length >= 3, `${structure.name} has an editable schema`);
        assert.ok(structure.fields.every(field => field.length === 4), `${structure.name} keeps stable field keys`);
    }
});

test('personal feed exports a two-sided paper dossier with DIY photos and story-filled records', () => {
    const social = STATUS_STRUCTURE_PRESETS.find(item => item.id === 'social');
    assert.equal(social.name, '个人档案');
    assert.deepEqual(social.fields.map(field => field[3]), [
        'full_name',
        'identity',
        'birthday',
        'age',
        'physical_state',
        'current_location',
        'record_date',
        'record_channel',
        'current_thought',
        'current_state',
        'introduction',
    ]);
    const input = {
        ...RULE_PRESETS.custom,
        structure: 'social',
        title: social.title,
        subtitle: social.subtitle,
        layout: social.layout,
        themeAssetUrl: 'https://cdn.example.com/blue-fabric.jpg',
        pagesText: social.pagesText,
        pageFieldsText: social.fields.map(field => field.join('|')).join('\n'),
        media: {
            avatarSource: 'character',
            avatarUrl: 'https://example.com/avatar.webp',
            imageUrl: 'https://example.com/archive.webp',
            imageAlt: '人物档案附图',
        },
    };
    const replacement = buildRegexScript(input).replaceString;
    assert.match(replacement, /zrs-social-photo/);
    assert.match(replacement, /zrs-social-archive-photo/);
    assert.match(replacement, /zrs-social-switcher/);
    assert.match(replacement, /zrs-social-theme-art/);
    assert.match(replacement, /https:\/\/cdn\.example\.com\/blue-fabric\.jpg/);
    assert.match(replacement, /身体状态/);
    assert.match(replacement, /当前想法/);
    assert.doesNotMatch(replacement, /国籍 \/ 所属|签发人 \/ 机构/);
    assert.match(replacement, /zrs-social-scraps/);
    assert.match(replacement, /scraps\.setAttribute\('aria-hidden','true'\)/);
    assert.match(replacement, /aria-selected/);
    assert.match(replacement, /showSocialSheet/);
    assert.doesNotMatch(replacement, /zrs-social-actions|精选评论|点赞/);
    for (const demoText of ['林澈', '旧港调查员', '雾港公署', '旧港北站', '旧港档案室', '第七码头办事处']) {
        assert.doesNotMatch(replacement, new RegExp(demoText));
    }
    assert.match(STATUS_THEME_CSS, /zrs-social-switch[^}]*min-height:44px/);
    assert.match(STATUS_THEME_CSS, /data-theme="personal-dossier"[^}]*--z-paper:#f4ecdc/);
    assert.match(STATUS_THEME_CSS, /zrs-social-theme-art[^}]*object-fit:cover/);
    assert.match(STATUS_THEME_CSS, /data-theme="personal-dossier"[^}]*zrs-social-scraps[^}]*display:none/);
    assert.match(STATUS_THEME_CSS, /zrs-social-photo img\{filter:none\}/);
    assert.match(STATUS_THEME_CSS, /data-theme="dossier-clipping"[^}]*--z-paper:#efe2c9/);
    assert.match(STATUS_THEME_CSS, /data-theme="dossier-clipping"[^}]*zrs-social-theme-art[^}]*object-fit:cover/);
    assert.match(STATUS_THEME_CSS, /data-theme="dossier-clipping"[^}]*zrs-social-intro-head[^}]*border-left:9px solid #c65b32/);
    const instruction = buildAiInstruction(input);
    assert.match(instruction, /记录日期/);
    assert.match(instruction, /个人介绍 \/ 当前记录/);
    assert.doesNotMatch(instruction, /图片 URL|头像来源/);
    const preview = makePreviewRecords(input);
    assert.equal(preview.pages[0].values.length, 11);
    assert.equal(preview.pages[0].values[0], '姓名');
    assert.equal(preview.pages[0].values[1], '身份 / 职位');
    assert.deepEqual(preview.pages[0].values.slice(2), Array(9).fill('X'));
    assert.doesNotMatch(preview.pages[0].values.join(' '), /AI：|点赞|评论/);
});

test('personal feed keeps every appearance on the same editable dossier format', () => {
    assert.equal(SOCIAL_APPEARANCE_PRESETS.length, 3);
    assert.equal(new Set(SOCIAL_APPEARANCE_PRESETS.map(item => item.id)).size, 3);
    assert.deepEqual(SOCIAL_APPEARANCE_PRESETS.slice(1).map(item => item.name), [
        '人物剪报卷宗',
        '镜中记',
    ]);
    const social = STATUS_STRUCTURE_PRESETS.find(item => item.id === 'social');
    for (const appearance of SOCIAL_APPEARANCE_PRESETS) {
        const normalized = normalizeRule({
            ...RULE_PRESETS.custom,
            structure: 'social',
            theme: appearance.id,
            pagesText: social.pagesText,
            pageFieldsText: social.fields.map(field => field.join('|')).join('\n'),
        });
        assert.equal(normalized.theme, appearance.id);
        assert.equal(normalized.styleName, appearance.name);
        const replacement = buildRegexScript(normalized).replaceString;
        assert.match(replacement, new RegExp(`data-theme="${appearance.id}"`));
        assert.match(replacement, /function renderSocialPage/);
        assert.match(replacement, /zrs-social-file/);
        assert.doesNotMatch(replacement, /renderArchiveDossierPage|zrs-storyboard/);
    }
    assert.doesNotMatch(STATUS_THEME_CSS, /zrs-storyboard|zrs-archive-file/);
});

test('personal feed preview uses neutral placeholders and never exports a concrete demo identity', () => {
    const social = STATUS_STRUCTURE_PRESETS.find(item => item.id === 'social');
    const input = {
        ...RULE_PRESETS.custom,
        structure: social.id,
        pagesText: social.pagesText,
        pageFieldsText: social.fields.map(field => field.join('|')).join('\n'),
    };
    assert.equal(makePreviewRecords(input).pages[0].values[0], '姓名');
    assert.doesNotMatch(makePreviewRecords(input).pages[0].values.join(' '), /林澈|旧港调查员|雾港公署|旧港北站|旧港档案室|第七码头办事处/);
    assert.doesNotMatch(buildRegexScript(input).replaceString, /林澈|旧港调查员|雾港公署|旧港北站|旧港档案室|第七码头办事处/);
});

test('dynamic progress always uses a solid fill without selectable objects', () => {
    const normalized = normalizeRule({ ...RULE_PRESETS.universalClassical, structure: 'music', theme: 'vinyl-mag', logoId: 'slider-apple', fillMode: 'object' });
    assert.equal(normalized.glyph, '♪');
    assert.equal(normalized.theme, 'piano-player');
    assert.equal('logoId' in normalized, false);
    assert.equal('fillMode' in normalized, false);
    const generated = buildRegexScript({ ...RULE_PRESETS.universalClassical, logoId: 'slider-leaf', fillMode: 'object' }).replaceString;
    assert.doesNotMatch(generated, /data-fill-mode=/);
    assert.doesNotMatch(generated, /data-logo=/);
    assert.match(generated, /meter\.append\(fill\)/);
    assert.doesNotMatch(generated, /meter\.append\(fill,trail,marker\)/);
});

test('the workbench can reuse every exported theme instead of showing a color-only mockup', () => {
    for (const style of STATUS_STYLE_PRESETS) {
        assert.match(STATUS_THEME_CSS, new RegExp(`data-theme="${style.id}"`), `${style.name} has exported theme CSS`);
    }
    assert.match(STATUS_THEME_CSS, /data-theme="vinyl-mag"[^}]*[\s\S]*?\.zrs-header::before/);
    assert.match(STATUS_THEME_CSS, /data-theme="cafe-receipt"[^}]*[\s\S]*?clip-path:polygon/);
    for (const structure of ['custom', 'profile', 'social', 'chat', 'collage', 'music', 'quest', 'casefile']) {
        assert.match(STATUS_THEME_CSS, new RegExp(`data-structure="${structure}"`), `${structure} has a distinct exported skeleton`);
    }
    assert.match(FORUM_THEME_CSS, /\.forum-2ch/);
    assert.match(FORUM_THEME_CSS, /--pixel-size:4px/);
    assert.match(FORUM_THEME_CSS, /image-rendering:pixelated/);
    assert.match(FORUM_THEME_CSS, /\.forum-title[^}]*text-shadow:4px 4px 0/);
    assert.match(FORUM_THEME_CSS, /box-shadow:8px 8px 0/);
    assert.match(FORUM_THEME_CSS, /\.forum-tabs[^}]*overflow-x:auto/);
    assert.match(FORUM_THEME_CSS, /\.forum-post-meta/);
    assert.deepEqual(FORUM_SKIN_PRESETS.map(item => item.id), ['mist-bbs', 'ao3-archive', 'jj-forum', 'tieba-thread', 'douban-group', 'paranormal-case']);
    assert.match(FORUM_THEME_CSS, /data-forum-skin="mist-bbs"/);
    assert.match(FORUM_THEME_CSS, /data-forum-skin="ao3-archive"/);
    assert.match(FORUM_THEME_CSS, /data-forum-skin="jj-forum"/);
    assert.match(FORUM_THEME_CSS, /data-forum-skin="tieba-thread"/);
    assert.match(FORUM_THEME_CSS, /data-forum-skin="douban-group"/);
    assert.match(FORUM_THEME_CSS, /data-forum-skin="paranormal-case"/);
    assert.match(FORUM_THEME_CSS, /forum-post-avatar/);
    for (const tianyaColor of ['#f5e8d2', '#d2d9e5', '#dd9650', '#a14924', '#432714']) {
        assert.match(FORUM_THEME_CSS.toLowerCase(), new RegExp(tianyaColor), `tianya uses color-card swatch ${tianyaColor}`);
    }
    assert.match(FORUM_THEME_CSS, /backdrop-filter:blur\(14px\)/);
    assert.match(FORUM_THEME_CSS, /data-forum-skin="mist-bbs"[^\n]*\.forum-tab\{color:#dce8ff!important/);
    assert.match(FORUM_THEME_CSS, /grid-template-columns:132px minmax\(0,1fr\)/);
    for (const winterNightBlue of ['#07080c', '#333c50', '#546282', '#9cb2e8', '#cad9f5']) {
        assert.match(FORUM_THEME_CSS, new RegExp(winterNightBlue), `forum uses winter-night-blue swatch ${winterNightBlue}`);
    }
    for (const rejectedClash of ['#f3cf4d', '#78e08f', '#79a7ff', '#ff6b9a']) {
        assert.doesNotMatch(FORUM_THEME_CSS, new RegExp(rejectedClash), `forum removes rejected mixed color ${rejectedClash}`);
    }
    assert.match(STATUS_PHONE_CSS, /data-structure="phone"/);
    assert.match(STATUS_PHONE_CSS, /is-phone-home/);
    assert.match(STATUS_PHONE_CSS, /--z-phone-accent:var\(--z-accent/);
    assert.match(STATUS_PHONE_CSS, /--z-phone-bg:var\(--z-bg/);
    assert.match(STATUS_PHONE_CSS, /zrs-phone-chat\.is-left[^}]*var\(--z-phone-accent\)/);
    assert.match(STATUS_THEME_CSS, /data-structure="music"[^}]*[\s\S]*?repeating-radial-gradient/);
    assert.match(STATUS_THEME_CSS, /data-structure="collage"[^}]*[\s\S]*?grid-template-columns:repeat\(12/);
    assert.match(STATUS_THEME_CSS, /data-structure="collage"[^}]*[\s\S]*?zrs-structure-art i:nth-child\(3\)/);
    assert.match(STATUS_THEME_CSS, /data-structure="custom"[^}]*[\s\S]*?border:3px inset/);
    assert.match(STATUS_THEME_CSS, /data-structure="social"[^}]*[\s\S]*?data-field="post_body"/);
    assert.match(STATUS_THEME_CSS, /data-structure="music"[^}]*[\s\S]*?33⅓/);
    assert.match(STATUS_THEME_CSS, /data-structure="quest"[^}]*[\s\S]*?drop-shadow/);
    assert.match(STATUS_THEME_CSS, /data-structure="casefile"[^}]*[\s\S]*?rotate\(-5deg\)/);
    assert.match(STATUS_THEME_CSS, /data-structure="music"[^}]*[\s\S]*?box-shadow:7px 8px 0/);
    assert.match(STATUS_THEME_CSS, /data-structure="quest"[^}]*[\s\S]*?clip-path:none/);
    assert.doesNotMatch(buildRegexScript({ ...RULE_PRESETS.universalClassical, logoId: 'slider-apple' }).replaceString, /data-logo=/);
});

test('removes the rejected 40-card recipe collection from selectable structures', () => {
    const ids = STATUS_STRUCTURE_PRESETS.map(item => item.id);
    assert.deepEqual(ids, [
        'phone', 'profile', 'archive-status', 'pixel-chat', 'pixel-handheld', 'social', 'forum', 'chat', 'collage', 'music', 'quest', 'casefile',
        'beauty-crimson-letter-01', 'beauty-burgundy-album-02', 'moon-collage', 'beauty-dossier-04',
        'beauty-current-status-05', 'beauty-card-status-06', 'beauty-letter-status-07', 'beauty-record-status-08', 'beauty-archive-status-09',
        'beauty-flower-echo-10', 'beauty-clock-travel-11', 'beauty-flower-reader-12', 'beauty-olive-ticket-13', 'beauty-cat-rabbit-14', 'beauty-rabbit-track-15',
        'beauty-mailbox-16', 'beauty-double-heart-17', 'beauty-checklist-18', 'beauty-broadcast-19', 'beauty-wallet-20',
        'custom',
    ]);
    for (const removedId of ['shop', 'travel', 'weather', 'holo', 'specimen', 'memory', 'livestream']) {
        assert.equal(ids.includes(removedId), false, `${removedId} is no longer selectable`);
    }
    const generated = buildRegexScript({ ...RULE_PRESETS.custom, variant: 'glass-orbit', structure: 'shop' }).replaceString;
    assert.match(generated, /data-structure="custom"/);
    assert.match(generated, /data-variant="auto"/);
});

test('status beauty 01 to 15 map every bundled original regex to its exact AI output contract', () => {
    assert.equal(STATUS_BEAUTY_01_15_IDS.length, 15);
    assert.equal(new Set(STATUS_BEAUTY_01_15_IDS).size, 15);
    const expectedFiles = Array.from({ length: 15 }, (_, index) => String(index + 1).padStart(2, '0'));
    assert.deepEqual(STATUS_BEAUTY_01_15_IDS.map(id => statusBeautyBundleMeta(id).file.slice(3, 5)), expectedFiles);
    assert.deepEqual(
        STATUS_STRUCTURE_PRESETS.find(item => item.id === 'beauty-crimson-letter-01').fields.map(field => field[0]),
        ['情愫', '欲念', '衣冠', '身处', '心语', '书信', '情愫注', '欲念注', '时间', '当前章节'],
    );
    assert.deepEqual(
        STATUS_STRUCTURE_PRESETS.find(item => item.id === 'moon-collage').fields.map(field => field[0]),
        ['情愫', '欲念', '衣冠', '身处', '心语', '书信', '情愫注', '欲念注'],
    );
    for (const id of STATUS_BEAUTY_01_15_IDS) {
        const preset = STATUS_STRUCTURE_PRESETS.find(item => item.id === id);
        assert.ok(preset, `${id} is selectable`);
        const input = {
            ...RULE_PRESETS.custom,
            structure: id,
            title: preset.title,
            pagesText: preset.pagesText,
            pageFieldsText: preset.fields.map(field => field.join('|')).join('\n'),
        };
        const instruction = buildAiInstruction(input);
        const meta = statusBeautyBundleMeta(id);
        assert.match(instruction, new RegExp(`<${meta.tag}>`));
        assert.match(instruction, new RegExp(`<\\/${meta.tag}>`));
        for (const [key] of meta.lines) assert.match(instruction, new RegExp(`\\[${key}\\|`));
        const values = preset.fields.map((_, index) => `值${index + 1}`);
        const body = meta.lines.map(([key, indexes]) => `[${key}|${indexes.map(index => values[index]).join('|')}]`).join('\n');
        const parsed = parseStatusOutput(input, `<${meta.tag}>\n${body}\n</${meta.tag}>`);
        assert.deepEqual(parsed.pages[0].values, values);
    }
    const previewDocument = buildStatusBeautyBundledPreviewDocument({ replaceString: '```html\n<body>$1 / $12</body>\n```' }, ['生成值一']);
    assert.match(previewDocument, /span\.dataset\.capture=match\[1\]/);
    assert.match(previewDocument, /span\.textContent=valueFor/);
    assert.match(previewDocument, /生成值一/);
    assert.match(previewDocument, /root\.querySelectorAll\('\[data-capture\]'\)/);
});

test('status regex installation preserves different structures and only updates the same identity', () => {
    const baseId = 'zeya-status-rule-v2';
    const dossierRule = { structure: 'beauty-dossier-04', tagName: 'dossier_status' };
    const flowerRule = { structure: 'beauty-flower-echo-10', tagName: 'flower_echo_status' };
    const dossierScript = { id: 'source-04', scriptName: '九一 · 状态栏04 · 人物剪报卷宗', findRegex: '/<dossier_status>/' };
    const flowerScript = { id: 'source-10', scriptName: '九一 · 状态栏10 · 花冠回声簿', findRegex: '/<flower_echo_status>/' };

    const first = mergeStatusRegexScripts([], dossierScript, dossierRule, baseId);
    const second = mergeStatusRegexScripts(first.scripts, flowerScript, flowerRule, baseId);
    assert.equal(second.scripts.length, 2);
    assert.equal(second.replaced.length, 0);
    assert.notEqual(statusRegexInstallId(dossierRule, baseId), statusRegexInstallId(flowerRule, baseId));

    const updated = mergeStatusRegexScripts(second.scripts, { ...dossierScript, replaceString: 'new' }, dossierRule, baseId);
    assert.equal(updated.scripts.length, 2);
    assert.equal(updated.replaced.length, 1);
    assert.equal(updated.scripts.find(item => item.id === statusRegexInstallId(dossierRule, baseId))?.replaceString, 'new');
    assert.ok(updated.scripts.some(item => item.id === statusRegexInstallId(flowerRule, baseId)));
});

test('bundled status regexes fit the current viewport without a dark padded stage', () => {
    const runtime = statusBeautyBundleSource.match(/const fitRuntime = `([\s\S]*?)`;/)?.[1] || '';
    assert.match(runtime, /document\.documentElement\.clientWidth/);
    assert.match(runtime, /background','transparent','important'/);
    assert.match(runtime, /padding','0','important'/);
    assert.match(runtime, /var targetHeight=Math\.ceil\(baseHeight\*scale\)/);
    assert.match(runtime, /window\.frameElement/);
    assert.match(runtime, /frame\.style\.height=targetHeight\+'px'/);
    assert.match(runtime, /syncAdaptiveText\(\)/);
    assert.match(runtime, /textLength>48\?0\.56/);
    assert.match(runtime, /minimum=Math\.min\(state\.fontSize,12\)/);
    assert.match(runtime, /target\*\.92/);
    assert.doesNotMatch(runtime, /maxBoost|state\.fontSize\*scale<8/);
    assert.match(runtime, /Math\.max\(card\.offsetHeight\|\|0,card\.scrollHeight\|\|0,1\)/);
    assert.match(runtime, /setProperty\('zoom','1','important'\)/);
    assert.doesNotMatch(statusBeautyBundleSource, /font-size:max\(var\(--sta-readable-font/);
    assert.doesNotMatch(statusBeauty05To09Css, /font-size:\s*max\(var\(--sta-readable-font/);
    assert.doesNotMatch(statusBeauty16To20Css, /font-size:\s*max\(var\(--sta-readable-font/);
    assert.doesNotMatch(runtime, /Math\.max\(240|clientWidth-20|\+20\)+'px'/);
    assert.match(statusBeautyBundleSource, /data-status-atelier-responsive-layout/);
    for (const id of ['beauty-crimson-letter-01', 'beauty-burgundy-album-02', 'beauty-current-status-05', 'beauty-card-status-06', 'beauty-letter-status-07', 'beauty-record-status-08', 'beauty-archive-status-09']) {
        assert.match(statusBeautyBundleSource, new RegExp(`'${id}'`));
    }
});

test('status beauty visible copy edits are injected into the exported regex', () => {
    const script = {
        scriptName: 'preview',
        replaceString: '```html\n<html><body><article class="status-card"><span>情愫</span><em>渐深</em></article></body></html>\n```',
    };
    const edited = applyStatusBeautyTextOverrides(script, { 0: '关系温度', 1: '靠近中' });
    assert.notEqual(edited, script);
    assert.match(edited.replaceString, /var edits=\{"0":"关系温度","1":"靠近中"\}/);
    assert.match(edited.replaceString, /document\.querySelector\('\.status-card'\)\|\|Array\.from\(document\.body\.children\)/);
    assert.match(edited.replaceString, /root\.querySelectorAll\('h1,h2,h3,h4,h5,h6,span,strong,small,em,b,p,label,figcaption,dt,dd,li'\)/);
    assert.match(edited.replaceString, /<\/script><\/body>/);
});

test('status beauty bundled title follows the idea-adjusted title without rewriting unrelated copy', () => {
    const script = {
        scriptName: '九一 · 状态栏05 · 角色当前状态',
        replaceString: '```html\n<html><head><title>05 · 角色当前状态</title></head><body><header><h1>角色当前状态</h1><p>角色当前状态只是正文说明</p></header></body></html>\n```',
    };
    const rule = { structure: 'beauty-current-status-05', title: '人物身体情况' };
    const titled = applyStatusBeautyTitle(script, rule);
    assert.notEqual(titled, script);
    assert.equal(titled.scriptName, script.scriptName);
    assert.match(titled.replaceString, /var heading=\{"defaultTitle":"角色当前状态","title":"人物身体情况"\}/);
    assert.match(titled.replaceString, /document\.title=heading\.title/);
    assert.match(titled.replaceString, /\.trim\(\)===heading\.defaultTitle/);
    assert.match(titled.replaceString, /角色当前状态只是正文说明/);
    const titlePatch = [...titled.replaceString.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1);
    assert.ok(titlePatch);
    assert.doesNotThrow(() => new Function(titlePatch[1]));
    assert.equal(applyStatusBeautyTitle(script, { structure: rule.structure, title: '角色当前状态' }), script);
});

test('status beauty bundled collapse control stays inside the artwork layer', () => {
    const script = {
        scriptName: 'collapse-preview',
        replaceString: '```html\n<html><head></head><body><details><summary aria-label="展开或收起状态栏"></summary></details></body></html>\n```',
    };
    const edited = applyStatusBeautyControlChrome(script);
    assert.match(edited.replaceString, /data-status-atelier-control-chrome/);
    assert.match(edited.replaceString, /right:8px!important;top:8px!important/);
    assert.match(edited.replaceString, /border-radius:7px!important/);
    assert.equal(applyStatusBeautyControlChrome(edited), edited);
});

test('all bundled status previews avoid double mobile scaling and keep a readable collapsed bar', () => {
    assert.match(statusBeautyBundleSource, /status-atelier-beauty-preview-frame/);
    assert.match(statusBeautyBundleSource, /--sta-readable-font/);
    assert.match(statusBeautyBundleSource, /data-collapsed-label/);
    assert.match(statusBeautyBundleSource, /已收起 · 点击展开/);
});

test('status beauty 01 to 15 export the edited field order into their bundled layouts', () => {
    const script = {
        scriptName: 'position-preview',
        replaceString: '```html\n<html><body><article class="status-card"><section><span>时间</span><strong data-capture="1">$1</strong></section><section><span>位置</span><strong data-capture="2">$2</strong></section></article></body></html>\n```',
    };
    const preset = STATUS_STRUCTURE_PRESETS.find(item => item.id === 'beauty-current-status-05');
    const originalRule = normalizeRule({
        ...RULE_PRESETS.custom,
        structure: preset.id,
        pagesText: preset.pagesText,
        pageFieldsText: preset.fields.map(field => field.join('|')).join('\n'),
    });
    assert.equal(applyStatusBeautyFieldLayout(script, originalRule), script);

    const movedFields = [preset.fields[1], preset.fields[0], ...preset.fields.slice(2)];
    const movedRule = normalizeRule({
        ...RULE_PRESETS.custom,
        structure: preset.id,
        pagesText: preset.pagesText,
        pageFieldsText: movedFields.map(field => field.join('|')).join('\n'),
    });
    const moved = applyStatusBeautyFieldLayout(script, movedRule);
    assert.notEqual(moved, script);
    assert.match(moved.replaceString, /var slots=\[\{"slot":1,"id":"location","label":"位置"\},\{"slot":2,"id":"time","label":"时间"\}/);
    assert.match(moved.replaceString, /class="sta-layout-capture" data-capture="1">\$1<\/span>/);
    assert.match(moved.replaceString, /node\.dataset\.staFieldSlot=String\(slot\.slot\)/);
    assert.match(moved.replaceString, /labels\[0\]\.textContent=slot\.label/);
    assert.match(moved.replaceString, /<\/script><\/body>/);
    const browserScripts = [...moved.replaceString.matchAll(/<script>([\s\S]*?)<\/script>/g)];
    assert.ok(browserScripts.length);
    browserScripts.forEach(match => assert.doesNotThrow(() => new Function(match[1])));

    for (const id of STATUS_BEAUTY_01_15_IDS) {
        const bundledPreset = STATUS_STRUCTURE_PRESETS.find(item => item.id === id);
        const meta = statusBeautyBundleMeta(id);
        const bundledScript = JSON.parse(readFileSync(new URL(`../assets/status-beauty/regexes/${meta.file}`, import.meta.url), 'utf8'));
        const reorderedFields = [bundledPreset.fields[1], bundledPreset.fields[0], ...bundledPreset.fields.slice(2)];
        const reorderedRule = normalizeRule({
            ...RULE_PRESETS.custom,
            structure: id,
            pagesText: bundledPreset.pagesText,
            pageFieldsText: reorderedFields.map(field => field.join('|')).join('\n'),
        });
        const reorderedScript = applyStatusBeautyFieldLayout(bundledScript, reorderedRule);
        assert.notEqual(reorderedScript.replaceString, bundledScript.replaceString, `${id} exports its changed order`);
        assert.equal(reorderedScript.findRegex, bundledScript.findRegex, `${id} keeps its accepted capture contract`);
        assert.deepEqual(reorderedScript.placement, bundledScript.placement, `${id} keeps its accepted placement`);
        assert.match(reorderedScript.replaceString, new RegExp(`"slot":1,"id":"${reorderedFields[0][3]}"`));
        assert.match(reorderedScript.replaceString, /sta-layout-capture/);
        assert.match(reorderedScript.replaceString, /<\/body>/i);
        const reorderedInstruction = buildAiInstruction({
            ...RULE_PRESETS.custom,
            structure: id,
            pagesText: bundledPreset.pagesText,
            pageFieldsText: reorderedFields.map(field => field.join('|')).join('\n'),
        });
        assert.match(reorderedInstruction, new RegExp(`\\{\\{当前角色·${reorderedFields[0][0]}`));
        const layoutPatch = [...reorderedScript.replaceString.matchAll(/<script>([\s\S]*?)<\/script>/g)]
            .find(match => match[1].includes('var slots='));
        assert.ok(layoutPatch, `${id} includes the layout patch`);
        assert.doesNotThrow(() => new Function(layoutPatch[1]), `${id} layout patch parses`);
    }
});

test('status beauty bundled portraits use the selected character, user or URL image', () => {
    const script = {
        scriptName: 'portrait-preview',
        replaceString: '```html\n<html><body><article class="status-card"><img class="avatar" src="data:image/png;base64,old" alt="角色头像"></article></body></html>\n```',
    };
    const edited = applyStatusBeautyMediaSettings(script, {
        avatarSource: 'user',
        avatarUrl: '/User%20Avatars/user.png',
        avatarFallbackUrl: '/thumbnail?type=persona&file=user.png',
        imageAlt: '当前 User 头像',
    });
    assert.match(edited.replaceString, /img\[data-st-avatar\],img\[alt\*="角色头像"\],img\.avatar,img\.art-photo/);
    assert.match(edited.replaceString, /thumbnail\?type=persona&file=user\.png/);
    assert.match(edited.replaceString, /avatarFallbackUrl/);
    assert.match(edited.replaceString, /fallbackAttempted/);
    assert.match(edited.replaceString, /image\.setAttribute\('data-st-avatar',''\)/);
});

test('status beauty 05 to 09 keep the approved field contracts and export their real layouts', () => {
    const expected = new Map([
        ['beauty-current-status-05', ['时间', '位置', '好感度', '好感变化', '身体情况', '双手动作', '当前动作', '对白', '心声']],
        ['beauty-card-status-06', ['时间', '位置', '情愫', '情愫状态', '身体情况', '身体细节', '双手动作', '双手细节', '心情', '心情细节', '衣着', '欲念', '欲念状态', '心声']],
        ['beauty-letter-status-07', ['时间', '位置', '好感度', '好感状态', '身体情况', '双手动作', '正在做', '心声', '附言']],
        ['beauty-record-status-08', ['时间', '位置', '好感度', '身体情况', '双手动作', '隐秘行动', '近期计划', '心声']],
        ['beauty-archive-status-09', ['时间', '位置', '好感度', '好感状态', '对白', '体温', '呼吸', '肩颈', '掌心', '此刻体感', '当前章节', '御神签', '心声']],
    ]);
    for (const [id, labels] of expected) {
        const preset = STATUS_STRUCTURE_PRESETS.find(item => item.id === id);
        assert.ok(preset, `${id} is registered`);
        assert.deepEqual(preset.fields.map(field => field[0]), labels);
        const input = {
            ...RULE_PRESETS.custom,
            structure: id,
            title: preset.title,
            pagesText: preset.pagesText,
            pageFieldsText: preset.fields.map(field => field.join('|')).join('\n'),
            media: { avatarSource: 'url', avatarUrl: 'https://example.com/character.png', imageAlt: '当前角色头像' },
        };
        const instruction = buildAiInstruction(input);
        const replacement = buildRegexScript(input).replaceString;
        assert.match(instruction, new RegExp(`\\{\\{当前角色·${labels[0]}`));
        assert.match(replacement, /^```html\n<!doctype html>/);
        assert.match(replacement, /<body class="design-page beauty-/);
        assert.match(replacement, /status-beauty-05-09\.css/);
        assert.match(replacement, /status-beauty-05-09\.css\?v=0\.11\.11/);
        assert.match(replacement, /https:\/\/example\.com\/character\.png/);
        assert.match(replacement, /\$1/);
        assert.match(replacement, /classList\.toggle\('is-collapsed'\)/);
        assert.match(replacement, /--sta-readable-font/);
        assert.match(replacement, /syncAdaptiveText/);
        assert.match(replacement, /textLength>48\?0\.56/);
        assert.match(replacement, /target\*\.92/);
        assert.match(replacement, /Math\.max\(root\.offsetHeight\|\|0,root\.scrollHeight\|\|0,1\)/);
        assert.match(replacement, /status-atelier-beauty-preview-frame/);
        assert.match(replacement, /requestAnimationFrame\(syncHostFrameHeight\)/);
        assert.match(replacement, /<\/body><\/html>\n```$/);
        const browserScript = replacement.match(/<script>\n([\s\S]*?)\n<\/script>/);
        assert.ok(browserScript, `${id} includes browser script`);
        assert.doesNotThrow(() => new Function(browserScript[1]), `${id} browser script parses`);
    }
    const cardReplacement = buildRegexScript({
        ...RULE_PRESETS.custom,
        structure: 'beauty-card-status-06',
        pagesText: STATUS_STRUCTURE_PRESETS.find(item => item.id === 'beauty-card-status-06').pagesText,
        pageFieldsText: STATUS_STRUCTURE_PRESETS.find(item => item.id === 'beauty-card-status-06').fields.map(field => field.join('|')).join('\n'),
    }).replaceString;
    assert.match(cardReplacement, /status-hand/);
    const archiveReplacement = buildRegexScript({
        ...RULE_PRESETS.custom,
        structure: 'beauty-archive-status-09',
        pagesText: STATUS_STRUCTURE_PRESETS.find(item => item.id === 'beauty-archive-status-09').pagesText,
        pageFieldsText: STATUS_STRUCTURE_PRESETS.find(item => item.id === 'beauty-archive-status-09').fields.map(field => field.join('|')).join('\n'),
    }).replaceString;
    assert.match(archiveReplacement, /pointerdown/);
    assert.match(archiveReplacement, /showCard/);
    assert.match(archiveReplacement, /frame-mirror-botanical-generated-alpha\.png/);
});

test('status beauty 16 to 20 keep their own field contracts and export complete interactive documents', () => {
    assert.match(statusBeauty16To20Css, /header\{position:absolute;z-index:3\}/);
    assert.match(statusBeauty16To20Css, /@media\(max-width:560px\)/);
    assert.match(statusBeauty16To20Css, /\.status-card\{width:100%;max-width:100%;height:auto!important/);
    assert.match(statusBeauty16To20Css, /\.design-17 \.window-layout\{display:block/);
    assert.match(statusBeauty16To20Css, /\.design-18 \.traveler-note\{position:relative/);
    assert.match(statusBeauty16To20Css, /\.design-19 \.broadcast-main\{position:relative/);
    assert.match(statusBeauty16To20Css, /\.design-20 \.status-wallet-layout\{display:block/);
    assert.match(statusBeauty16To20Css, /\.status-card \[data-label\]\{font-size:clamp\(12px,3\.4vw,14px\)!important;font-weight:600!important/);
    assert.match(statusBeauty16To20Css, /\[data-value\]\[data-sta-kind="long"\][^{]*\{font-family:[^}]*font-weight:400!important/);
    const expected = new Map([
        ['beauty-mailbox-16', ['时间', '位置', '衣冠', '情愫', '欲念', '来信', '心声']],
        ['beauty-double-heart-17', ['时间', '位置', '衣冠', '情愫', '欲念', '内心状态', '来信']],
        ['beauty-checklist-18', ['时间', '位置', '身体状态', '双手动作', '当前姿态', '心绪', '好感度', '关系状态']],
        ['beauty-broadcast-19', ['时间', '位置', '今日播报', '今日宜', '今日忌', '章节', '角色心声', '御神签', '签文']],
        ['beauty-wallet-20', ['时间', '位置', '身体状态', '双手动作', '当前姿态', '心绪', '好感度', '关系状态']],
    ]);
    for (const id of ['beauty-checklist-18', 'beauty-wallet-20']) {
        const affection = STATUS_STRUCTURE_PRESETS.find(item => item.id === id).fields.find(field => field[3] === 'affection');
        assert.deepEqual(affection.slice(1, 3), ['填写0到100之间的整数，只写数字', 'progress']);
    }
    for (const [id, labels] of expected) {
        const preset = STATUS_STRUCTURE_PRESETS.find(item => item.id === id);
        assert.ok(preset, `${id} is registered`);
        assert.deepEqual(preset.fields.map(field => field[0]), labels);
        const input = {
            ...RULE_PRESETS.custom,
            structure: id,
            title: preset.title,
            pagesText: preset.pagesText,
            pageFieldsText: preset.fields.map(field => field.join('|')).join('\n'),
            media: { avatarSource: 'url', avatarUrl: 'https://example.com/character.png', imageAlt: '当前角色头像' },
        };
        const instruction = buildAiInstruction(input);
        const replacement = buildRegexScript(input).replaceString;
        assert.match(instruction, new RegExp(`\\[View1\\|\\{\\{当前角色·${labels[0]}`));
        assert.match(replacement, /^```html\n<!doctype html>/);
        assert.match(replacement, /<body class="design-page beauty-/);
        assert.match(replacement, /status-beauty-16-20\.css/);
        assert.match(replacement, /status-beauty-16-20\.css\?v=0\.11\.11/);
        assert.match(replacement, /https:\/\/example\.com\/character\.png/);
        assert.match(replacement, /\$1/);
        assert.match(replacement, /classList\.toggle\('is-collapsed'\)/);
        assert.match(replacement, /--sta-readable-font/);
        assert.match(replacement, /syncAdaptiveText/);
        assert.match(replacement, /textLength>48\?0\.56/);
        assert.match(replacement, /minimum=Math\.min\(state\.fontSize,12\)/);
        assert.match(replacement, /target\*\.92/);
        assert.match(replacement, /Math\.max\(root\.offsetHeight\|\|0,root\.scrollHeight\|\|0,1\)/);
        assert.match(replacement, /status-atelier-beauty-preview-frame/);
        assert.match(replacement, /requestAnimationFrame\(syncHostFrameHeight\)/);
        assert.match(replacement, /<\/body><\/html>\n```$/);
        const browserScript = replacement.match(/<script>\n([\s\S]*?)\n<\/script>/);
        assert.ok(browserScript, `${id} includes browser script`);
        assert.doesNotThrow(() => new Function(browserScript[1]), `${id} browser script parses`);
    }
});

test('generic status generator keeps mobile text at a readable floor', () => {
    const preset = STATUS_STRUCTURE_PRESETS.find(item => item.id === 'profile');
    const replacement = buildRegexScript({
        ...RULE_PRESETS.custom,
        structure: preset.id,
        pagesText: preset.pagesText,
        pageFieldsText: preset.fields.map(field => field.join('|')).join('\n'),
    }).replaceString;
    assert.match(replacement, /--sta-mobile-text-floor/);
    assert.match(replacement, /--sta-mobile-text-floor:12px/);
    assert.match(replacement, /\.zrs-label\{font-size:clamp\(12px,3\.4vw,14px\)!important;font-weight:600!important/);
    assert.match(replacement, /\.zrs-value\{font-size:clamp\(15px,4\.5vw,18px\)!important;font-weight:400!important/);
});

test('all bundled status regexes receive the same readable mobile title and body hierarchy', () => {
    const script = {
        replaceString: '```html\n<html><head></head><body><article class="status-card"><section><span>身体状态</span><strong>$1</strong></section></article></body></html>\n```',
    };
    const rule = { pageFields: [{ kind: 'long' }] };
    const result = applyStatusBeautyMobileTypography(script, rule);
    assert.match(result.replaceString, /data-status-atelier-mobile-typography/);
    assert.match(result.replaceString, /data-capture="1">\$1<\/span>/);
    assert.match(result.replaceString, /data-sta-typography-label/);
    assert.match(result.replaceString, /font-weight:400!important/);
    assert.match(result.replaceString, /var kinds=\["long"\]/);
    assert.equal(applyStatusBeautyMobileTypography(result, rule), result);

    for (const id of STATUS_BEAUTY_01_15_IDS) {
        const preset = STATUS_STRUCTURE_PRESETS.find(item => item.id === id);
        const bundled = JSON.parse(readFileSync(new URL(`../assets/status-beauty/regexes/${statusBeautyBundleMeta(id).file}`, import.meta.url), 'utf8'));
        const normalized = normalizeRule({
            ...RULE_PRESETS.custom,
            structure: id,
            title: preset.title,
            pagesText: preset.pagesText,
            pageFieldsText: preset.fields.map(field => field.join('|')).join('\n'),
        });
        const readable = applyStatusBeautyMobileTypography(bundled, normalized);
        assert.match(readable.replaceString, /data-status-atelier-mobile-typography/, `${id} has the shared mobile typography`);
        assert.match(readable.replaceString, /data-capture="\d+"/, `${id} exposes dynamic values to the typography layer`);
        assert.match(readable.replaceString, /font-weight:400!important/, `${id} uses regular mobile body text`);
        if (id === 'beauty-dossier-04') {
            assert.doesNotMatch(readable.replaceString, /data-status-atelier-mobile-typography[^<]*\.design-04-page/);
        }
    }
});

test('three original role-card regex layouts keep separate fields, interactions and dynamic X preview', () => {
    const cases = [
        {
            id: 'archive-status', theme: 'bw-archive', paletteId: 'archive-mono',
            shared: ['scene_time', 'location', 'good_omen', 'bad_omen', 'scene_title', 'broadcast'],
            fields: ['front_chapter', 'front_thought', 'back_chapter', 'back_thought', 'letter_to', 'letter_body', 'letter_from', 'photo_location', 'fortune_level', 'fortune_text'],
            markers: [/bw-archive-system/, /fb-card/, /fb-letter-toggle/, /fb-omikuji-cylinder/],
            avatar: true,
        },
        {
            id: 'pixel-chat', theme: 'pixel-handheld', paletteId: 'pixel-candy',
            shared: [],
            fields: ['chat_title', 'chat_subtitle', 'chat_1', 'chat_2', 'chat_3'],
            markers: [/status-container/, /js-pixel-chats/, /chat-message/, /current-character\.png/],
            avatar: true,
        },
        {
            id: 'pixel-handheld', theme: 'pixel-handheld', paletteId: 'pixel-candy',
            shared: ['scene_date', 'scene_time', 'location'],
            fields: ['weather', 'weather_feel', 'outfit', 'diary', 'todo_1', 'todo_2', 'todo_3'],
            markers: [/blackberry-phone/, /panel-weather/, /data-target/, /navigator\.getBattery/],
            avatar: false,
        },
    ];
    for (const item of cases) {
        const preset = STATUS_STRUCTURE_PRESETS.find(candidate => candidate.id === item.id);
        assert.ok(preset);
        assert.equal(preset.theme, item.theme);
        assert.equal(preset.paletteId, item.paletteId);
        assert.equal(preset.avatarSource === 'character', item.avatar);
        assert.deepEqual((preset.shared || []).map(field => field[3]), item.shared);
        assert.deepEqual(preset.fields.map(field => field[3]), item.fields);
        const input = {
            ...RULE_PRESETS.custom,
            structure: preset.id,
            theme: preset.theme,
            paletteId: preset.paletteId,
            title: preset.title,
            subtitle: preset.subtitle,
            layout: preset.layout,
            pagesText: preset.pagesText,
            sharedFieldsText: (preset.shared || []).map(field => field.join('|')).join('\n'),
            pageFieldsText: preset.fields.map(field => field.join('|')).join('\n'),
            media: { avatarSource: 'character', avatarUrl: 'https://example.com/current-character.png' },
        };
        const preview = makePreviewRecords(input);
        assert.ok(preview.shared.every(value => value === 'X'));
        assert.ok(preview.pages.flatMap(page => page.values).every(value => value === 'X'));
        const instruction = buildAiInstruction(input);
        assert.ok(instruction.length < 600, `${item.id} worldbook rule stays below the 600-token ceiling with a stricter character limit`);
        assert.match(instruction, /把字段名替换为实际值/);
        assert.match(instruction, /以此类推/);
        const generated = buildRegexScript(input).replaceString;
        for (const marker of item.markers) assert.match(generated, marker);
        if (item.avatar) assert.match(generated, /current-character\.png/);
        assert.doesNotMatch(generated, /佐藤原野|小久风太/);
        const browserScript = generated.match(/<script>\n([\s\S]*?)\n<\/script>/);
        assert.ok(browserScript);
        assert.doesNotThrow(() => new Function(browserScript[1]));
    }
    const archivePalette = STATUS_PALETTE_PRESETS.find(item => item.id === 'archive-mono');
    assert.deepEqual(
        { name: archivePalette?.name, muted: archivePalette?.muted },
        { name: '黑白钢蓝档案', muted: '#4a6582' },
    );
    const pixelPalette = STATUS_PALETTE_PRESETS.find(item => item.id === 'pixel-candy');
    assert.deepEqual(
        { name: pixelPalette?.name, accent: pixelPalette?.accent, card: pixelPalette?.card, text: pixelPalette?.text },
        { name: '粉蓝黑莓像素', accent: '#ff9aa2', card: '#fff9fa', text: '#5d576b' },
    );
    assert.match(buildRegexScript({
        ...RULE_PRESETS.custom,
        structure: 'pixel-handheld',
        theme: 'pixel-handheld',
        pagesText: STATUS_STRUCTURE_PRESETS.find(item => item.id === 'pixel-handheld').pagesText,
        sharedFieldsText: STATUS_STRUCTURE_PRESETS.find(item => item.id === 'pixel-handheld').shared.map(field => field.join('|')).join('\n'),
        pageFieldsText: STATUS_STRUCTURE_PRESETS.find(item => item.id === 'pixel-handheld').fields.map(field => field.join('|')).join('\n'),
    }).replaceString, /blackberry-phone/);
});

test('phone desktop is editable and exports real app navigation with a back action', () => {
    const preset = STATUS_STRUCTURE_PRESETS.find(item => item.id === 'phone');
    assert.ok(preset);
    assert.equal(parsePages(preset.pagesText).length, 4);
    assert.equal(preset.shared.length, 3);
    const phoneRule = normalizeRule({
        ...RULE_PRESETS.custom,
        structure: 'phone',
        sharedFieldsText: preset.shared.map(field => field.join('|')).join('\n'),
    });
    assert.deepEqual(phoneRule.pages.map(page => page.label), ['个人', '备忘录', '微信', '购物']);
    assert.deepEqual(phoneRule.pages.map(page => page.fields.length), [4, 3, 5, 6]);
    assert.deepEqual(phoneRule.pages.map(page => page.fields[0].id), ['favor', 'memo_1', 'chat_target', 'item_1']);
    const phoneInput = {
        ...RULE_PRESETS.custom,
        structure: 'phone',
        sharedFieldsText: preset.shared.map(field => field.join('|')).join('\n'),
    };
    const parsed = parseStatusOutput(phoneInput, `<zeya_status>
[PhoneApps|档案|航行日志|密谈|补给站]
[Shared|旧港钟楼|22:10|细雨]
[Personal|68|47|深色外套|我会等他回来]
[Memo|取回钥匙|调查信封|赴约]
[Wechat|温瑟|到家了吗|刚到|我等你|马上来]
[Shop|旧城通行证|进入封锁区|银柄折叠伞|藏有便笺|蓝花信纸|十二张]
</zeya_status>`);
    assert.deepEqual(parsed.pages.map(page => page.values.length), [4, 3, 5, 6]);
    assert.deepEqual(parsed.phoneApps, ['档案', '航行日志', '密谈', '补给站']);
    assert.deepEqual(parsed.rule.pages.map(page => page.label), parsed.phoneApps);
    const phoneInstruction = buildAiInstruction(phoneInput);
    assert.match(phoneInstruction, /\[PhoneApps\|/);
    assert.match(phoneInstruction, /不要机械照抄“个人、备忘录、微信、购物”/);
    for (const page of PHONE_PAGE_SCHEMAS) assert.match(phoneInstruction, new RegExp(`\\[${page.id}\\|`));
    assert.throws(() => parseStatusOutput(phoneInput, `<zeya_status>
[Shared|旧港钟楼|22:10|细雨]
[Personal|68|47|深色外套|我会等他回来]
[Memo|取回钥匙|调查信封|赴约]
[Wechat|温瑟|到家了吗|刚到|我等你|马上来]
[Shop|旧城通行证|进入封锁区|银柄折叠伞|藏有便笺|蓝花信纸|十二张]
</zeya_status>`), /PhoneApps/);
    const generated = buildRegexScript({
        ...RULE_PRESETS.custom,
        structure: 'phone',
        theme: 'glass',
        pagesText: preset.pagesText,
        sharedFieldsText: preset.shared.map(field => field.join('|')).join('\n'),
        pageFieldsText: preset.fields.map(field => field.join('|')).join('\n'),
    }).replaceString;
    assert.match(generated, /class="zrs-phone-back"/);
    assert.match(generated, /classList\.add\('is-phone-home'\)/);
    assert.match(generated, /classList\.remove\('is-phone-home'\)/);
    assert.match(generated, /zrs-app-icon/);
    assert.match(generated, /icon\.dataset\.appId=page\.id/);
    assert.match(generated, /phoneIconMarkup/);
    assert.match(generated, /records\.PhoneApps/);
    assert.match(generated, /page\.label=name/);
    assert.match(generated, /zrs-app-glyph/);
    assert.match(STATUS_PHONE_CSS, /data-app-id="Personal"/);
    assert.match(STATUS_PHONE_CSS, /data-app-id="Memo"/);
    assert.match(STATUS_PHONE_CSS, /data-app-id="Wechat"/);
    assert.match(STATUS_PHONE_CSS, /data-app-id="Shop"/);
    assert.match(generated, /zrs-phone-chat/);
    assert.match(generated, /zrs-phone-shop/);
    assert.match(generated, /zrs-phone-personal-hero/);
    assert.match(generated, /zrs-phone-petals/);
    assert.match(generated, /phoneDesktop\.petalsEnabled===false/);
    assert.match(generated, /zrs-phone-wallpaper/);
    assert.doesNotMatch(generated, /img\.remit\.ee/);
    assert.match(STATUS_PHONE_CSS, /data-phone-page="Personal"/);
    assert.match(STATUS_PHONE_CSS, /data-phone-page="Wechat"/);
    assert.deepEqual(PHONE_SHELL_STYLES, ['classic', 'handheld', 'handheld-pink', 'handheld-white', 'bandage-pop', 'mint-archive', 'blackberry']);
    for (const shellStyle of PHONE_SHELL_STYLES) {
        const shellRule = normalizeRule({ ...phoneInput, phoneDesktop: { shellStyle } });
        assert.equal(shellRule.phoneDesktop.shellStyle, shellStyle);
        assert.deepEqual(shellRule.pages.map(page => page.id), ['Personal', 'Memo', 'Wechat', 'Shop']);
        const shellOutput = buildRegexScript({ ...phoneInput, phoneDesktop: { shellStyle } }).replaceString;
        assert.match(shellOutput, new RegExp(`data-phone-shell="${shellStyle}"`));
    }
    assert.match(generated, /<\/section>\s*<nav class="zrs-tabs"/);
    assert.match(generated, /while\(root&&!root\.classList\.contains\('zeya-regex-status'\)\)/);
    assert.doesNotMatch(generated, /script\.previousElementSibling\.previousElementSibling/);
    assert.match(STATUS_PHONE_CSS, /data-phone-layout="handheld"/);
    assert.match(STATUS_PHONE_CSS, /--z-snow-duration/);
    assert.match(STATUS_PHONE_CSS, /focus-visible/);
    assert.match(STATUS_PHONE_CSS, /prefers-reduced-motion:reduce/);
    assert.doesNotMatch(STATUS_PHONE_CSS, /data-phone-shell="classic"\]\{width:min\(94vw,360px\)/);
    assert.match(STATUS_PHONE_CSS, /data-phone-shell="handheld-white"\]\)\{width:min\(96vw,430px\);height:480px/);
});

test('the original phone, three handheld shells, two touch phone styles, and blackberry are selectable', () => {
    const preset = STATUS_STRUCTURE_PRESETS.find(item => item.id === 'phone');
    const input = {
        ...RULE_PRESETS.custom,
        structure: 'phone',
        sharedFieldsText: preset.shared.map(field => field.join('|')).join('\n'),
    };
    const original = buildRegexScript({ ...input, phoneDesktop: { shellStyle: 'classic' } }).replaceString;
    assert.match(original, /data-phone-shell="classic"/);
    assert.doesNotMatch(original, /class="zrs-phone-frame"/);
    for (const removedStyle of ['clamshell', 'orbit', 'slider']) {
        assert.equal(normalizePhoneDesktop({ shellStyle: removedStyle }).shellStyle, 'classic');
    }
    const handheld = buildRegexScript({
        ...input,
        phoneDesktop: {
            shellStyle: 'handheld',
            apps: [
                { id: 'Personal', enabled: true, desktopX: 24, desktopY: 50 },
                { id: 'Memo', enabled: false, desktopX: 50, desktopY: 80 },
            ],
        },
    }).replaceString;
    assert.match(handheld, /data-phone-shell="handheld"/);
    assert.match(handheld, /class="zrs-phone-frame"/);
    assert.match(handheld, /class="zrs-phone-controls"/);
    assert.match(handheld, /zrs-phone-home-guide/);
    assert.match(handheld, /zrs-phone-diary/);
    assert.match(handheld, /desktopX/);
    assert.match(handheld, /app\.enabled===false/);
    const pink = buildRegexScript({ ...input, phoneDesktop: { shellStyle: 'handheld-pink' } }).replaceString;
    assert.match(pink, /frame-handheld-pink-02-alpha\.png/);
    assert.match(pink, /app-personal-glossy\.png/);
    assert.match(pink, /app-diary-glossy\.png/);
    assert.match(pink, /data-phone-decoration="sakura"/);
    assert.match(pink, /--z-phone-icon-scale:1\.38/);
    assert.match(pink, /data-phone-control="Personal"/);
    assert.match(pink, /data-phone-control="Back"/);
    const white = buildRegexScript({ ...input, phoneDesktop: { shellStyle: 'handheld-white' } }).replaceString;
    assert.match(white, /frame-handheld-white-03-alpha\.png/);
    assert.match(white, /app-shop-glossy\.png/);
    assert.match(white, /data-phone-decoration="petals"/);
    assert.match(white, /data-phone-control="Shop"/);
    assert.match(white, /data-phone-layout="handheld"/);
    const bandage = buildRegexScript({
        ...input,
        phoneDesktop: {
            shellStyle: 'bandage-pop',
            stickerPhotoOneUrl: 'https://example.com/sticker-one.png',
            stickerPhotoTwoUrl: 'https://example.com/sticker-two.png',
        },
    }).replaceString;
    assert.match(bandage, /data-phone-shell="bandage-pop"/);
    assert.match(bandage, /Loading\.\.\./);
    assert.match(bandage, /zrs-phone-sticker-photo/);
    assert.match(bandage, /https:\/\/example\.com\/sticker-one\.png/);
    assert.match(bandage, /https:\/\/example\.com\/sticker-two\.png/);
    assert.doesNotMatch(bandage, /frame-handheld-[^"']+\.png/);
    const mint = buildRegexScript({ ...input, phoneDesktop: { shellStyle: 'mint-archive' } }).replaceString;
    assert.match(mint, /data-phone-shell="mint-archive"/);
    assert.match(mint, /good things/);
    assert.match(mint, /finishEvent\.type==='pointerup'/);
    assert.match(mint, /ownerDocument\.addEventListener\('pointermove',moveIcon,\{passive:false\}\)/);
    assert.match(mint, /moveEvent\.pointerId!==event\.pointerId/);
    assert.match(STATUS_PHONE_CSS, /zrs-phone-home-key \*\{pointer-events:none/);
    assert.match(mint, /config\.phoneDesktop\.widgetOffsets\[item\.dataset\.field\]/);
    assert.match(mint, /ownerDocument\.addEventListener\('pointermove',moveWidget,\{passive:false\}\)/);
    assert.match(STATUS_PHONE_CSS, /--z-phone-widget-x/);
    const blackberry = buildRegexScript({ ...input, phoneDesktop: { shellStyle: 'blackberry' } }).replaceString;
    assert.match(blackberry, /data-phone-shell="blackberry"/);
    assert.match(blackberry, /Q  W  E  R  T  Y/);
});

test('phone DIY settings are normalized separately from AI story values', () => {
    const phone = normalizePhoneDesktop({
        phoneDesktop: {
            shellStyle: 'handheld',
            shellColor: '#e6a5c4',
            wallpaperUrl: 'https://example.com/wallpaper.jpg',
            stickerPhotoOneUrl: 'https://example.com/photo-one.jpg',
            stickerPhotoTwoUrl: 'javascript:alert(1)',
            wallpaperPositionX: 140,
            wallpaperPositionY: -10,
            wallpaperScale: 8,
            widgetX: 30,
            widgetY: 180,
            widgetOrder: ['current_weather', 'current_location'],
            widgetOffsets: {
                current_location: { x: 24, y: -18 },
                current_time: { x: 999, y: -999 },
            },
            personalAvatarSource: 'url',
            personalAvatarUrl: 'https://example.com/avatar.png',
            personalAvatarFallbackUrl: '/thumbnail?type=avatar&file=avatar.png',
            personalAvatarPositionX: 22,
            personalAvatarPositionY: 74,
            personalAvatarScale: 9,
            personalFields: [
                { id: 'favor', label: '信赖度', kind: 'text', instruction: '填写当前信赖阶段' },
                { id: 'desire', label: '牵挂度', kind: 'progress', instruction: '填写0到100的数字' },
            ],
            pageFields: {
                Memo: [{ id: 'memo_1', label: '首要日记', kind: 'long', instruction: '写成一整篇完整日记' }],
                Wechat: [{ id: 'chat_target', label: '联系人', kind: 'text', instruction: '填写当前聊天联系人' }],
                Shop: [{ id: 'item_1', label: '首件商品', kind: 'text', instruction: '填写第一件剧情商品' }],
            },
            apps: [
                { id: 'Personal', name: '档案', iconUrl: 'https://example.com/me.png' },
                { id: 'Memo', name: '线索', iconUrl: 'javascript:alert(1)' },
            ],
        },
    });
    assert.equal(phone.shellStyle, 'handheld');
    assert.equal(phone.shellColor, '#e6a5c4');
    assert.equal(phone.wallpaperPositionX, 100);
    assert.equal(phone.wallpaperPositionY, 0);
    assert.equal(phone.wallpaperScale, 3);
    assert.equal(phone.stickerPhotoOneUrl, 'https://example.com/photo-one.jpg');
    assert.equal(phone.stickerPhotoTwoUrl, '');
    assert.equal(phone.petalsEnabled, true);
    assert.equal(phone.personalAvatarScale, 3);
    assert.equal(phone.personalAvatarFallbackUrl, '/thumbnail?type=avatar&file=avatar.png');
    assert.deepEqual(phone.widgetOrder, ['current_weather', 'current_location', 'current_time']);
    assert.deepEqual(phone.widgetOffsets.current_location, { x: 24, y: -18 });
    assert.deepEqual(phone.widgetOffsets.current_time, { x: 180, y: -300 });
    assert.deepEqual(phone.widgetOffsets.current_weather, { x: 0, y: 0 });
    assert.deepEqual(phone.apps.map(app => app.name), ['档案', '线索', '微信', '购物']);
    assert.equal(phone.apps[1].iconUrl, '');
    assert.deepEqual(phone.personalFields.map(field => field.label), ['信赖度', '牵挂度', '当前衣着', '实时想法']);
    assert.deepEqual(phone.personalFields.map(field => field.kind), ['text', 'progress', 'long', 'long']);
    assert.equal(phone.pageFields.Memo[0].label, '首要日记');
    assert.equal(phone.pageFields.Wechat[0].label, '联系人');
    assert.equal(phone.pageFields.Shop[0].label, '首件商品');
    const input = {
        ...RULE_PRESETS.custom,
        structure: 'phone',
        sharedFieldsText: STATUS_STRUCTURE_PRESETS.find(item => item.id === 'phone').shared.map(item => item.join('|')).join('\n'),
        phoneDesktop: phone,
    };
    const rule = normalizeRule(input);
    assert.deepEqual(rule.pages.map(page => page.label), ['档案', '线索', '微信', '购物']);
    const instruction = buildAiInstruction(input);
    assert.match(instruction, /当前时间/);
    assert.match(instruction, /信赖度/);
    assert.match(instruction, /填写当前信赖阶段/);
    assert.match(instruction, /首要日记/);
    assert.match(instruction, /写成一整篇完整日记/);
    assert.match(instruction, /联系人/);
    assert.match(instruction, /首件商品/);
    assert.doesNotMatch(instruction, /wallpaper|iconUrl|壁纸图片 URL/);
    assert.doesNotMatch(instruction, /shellStyle|slider/);
    const generated = buildRegexScript(input).replaceString;
    assert.match(generated, /https:\/\/example\.com\/wallpaper\.jpg/);
    assert.match(generated, /https:\/\/example\.com\/me\.png/);
    assert.match(generated, /widgetOrder/);
    assert.match(generated, /style\.transform='scale\('\+config\.phoneDesktop\.personalAvatarScale\+'\)'/);
    assert.match(generated, /fallbackAttempted/);
    assert.match(STATUS_PHONE_CSS, /data-phone-page="Personal"\] \.zrs-phone-pagebar\{[^}]*pointer-events:none/);
    assert.match(STATUS_PHONE_CSS, /data-phone-page="Personal"\] \.zrs-phone-back\{pointer-events:auto/);
    assert.match(generated, /style\.transform='scale\('\+config\.phoneDesktop\.wallpaperScale\+'\)'/);
    assert.match(generated, /field&&field\.kind==='progress'/);
    assert.match(generated, /personalFields\[0\]/);
    assert.doesNotMatch(generated, /phoneDataCard\('好感度'/);
    assert.equal(buildRegexScript({ ...input, displayOnlyRegex: true }).markdownOnly, true);
    assert.equal(buildRegexScript({ ...input, displayOnlyRegex: false }).markdownOnly, false);
});

test('phone shell style falls back to the original classic phone', () => {
    assert.equal(normalizePhoneDesktop().shellStyle, 'classic');
    assert.equal(normalizePhoneDesktop({ phoneDesktop: { shellStyle: 'unknown-shell' } }).shellStyle, 'classic');
});

test('phone falling decoration can be disabled without exposing the general appearance library', () => {
    const phone = normalizePhoneDesktop({ phoneDesktop: { petalsEnabled: false } });
    assert.equal(phone.petalsEnabled, false);
    const generated = buildRegexScript({
        ...RULE_PRESETS.custom,
        structure: 'phone',
        phoneDesktop: phone,
    }).replaceString;
    assert.match(generated, /phoneDesktop\.petalsEnabled===false/);
    assert.match(generated, /phonePetals\.remove\(\)/);
});

test('phone shells provide distinct palettes, decorations, icon assets and scalable app icons', () => {
    assert.equal(PHONE_SHELL_VISUAL_DEFAULTS['handheld-pink'].paletteId, 'berry-milk');
    assert.equal(PHONE_SHELL_VISUAL_DEFAULTS['handheld-pink'].decorationStyle, 'sakura');
    assert.equal(PHONE_SHELL_VISUAL_DEFAULTS['handheld-white'].decorationStyle, 'petals');
    assert.match(PHONE_APP_ICON_ASSETS['handheld-pink'].Personal, /app-personal-glossy\.png$/);
    assert.match(PHONE_APP_ICON_ASSETS['handheld-white'].Wechat, /app-wechat-glossy\.png$/);
    const phone = normalizePhoneDesktop({ shellStyle: 'handheld-pink', iconScale: 9, decorationStyle: 'stars' });
    assert.equal(phone.iconScale, 1.7);
    assert.equal(phone.decorationStyle, 'stars');
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
            avatarFallbackUrl: '/thumbnail?type=avatar&file=character.png',
            userAvatarFallbackUrl: '/thumbnail?type=persona&file=user.png',
            imageUrl: 'https://example.com/cover.jpg',
            archiveImageUrls: 'https://example.com/photo-a.jpg\njavascript:alert(2)\nhttps://example.com/photo-a.jpg\n/player-photo-b.png',
            audioUrl: 'https://example.com/theme.mp3',
        },
    });
    assert.equal(rule.structure, 'music');
    assert.equal(rule.palette.id, 'porcelain');
    assert.equal(rule.media.avatarUrl, '');
    assert.equal(rule.media.avatarFallbackUrl, '/thumbnail?type=avatar&file=character.png');
    assert.equal(rule.media.userAvatarFallbackUrl, '/thumbnail?type=persona&file=user.png');
    assert.equal(rule.media.imageUrl, 'https://example.com/cover.jpg');
    assert.deepEqual(rule.media.archiveImageUrls, ['https://example.com/photo-a.jpg', '/player-photo-b.png']);
    assert.equal(rule.media.audioUrl, 'https://example.com/theme.mp3');
});

test('archive polaroid uses one random player image and exports no fixed original photo', () => {
    const preset = STATUS_STRUCTURE_PRESETS.find(item => item.id === 'archive-status');
    const generated = buildRegexScript({
        ...RULE_PRESETS.custom,
        structure: preset.id,
        theme: preset.theme,
        paletteId: preset.paletteId,
        pagesText: preset.pagesText,
        sharedFieldsText: preset.shared.map(field => field.join('|')).join('\n'),
        pageFieldsText: preset.fields.map(field => field.join('|')).join('\n'),
        media: {
            avatarSource: 'character',
            avatarUrl: '/thumbnails/Assistant.png',
            archiveImageUrls: ['https://example.com/photo-a.jpg', 'https://example.com/photo-b.jpg'],
            imageAlt: '玩家拍立得',
        },
    }).replaceString;
    assert.match(generated, /archiveImageUrls/);
    assert.match(generated, /Math\.floor\(Math\.random\(\) \* archiveImages\.length\)/);
    assert.match(generated, /https:\/\/example\.com\/photo-a\.jpg/);
    assert.match(generated, /https:\/\/example\.com\/photo-b\.jpg/);
    assert.doesNotMatch(generated, /pe9JZE4\.jpg|pep3ywj\.png/);
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

test('generated fields keep semantic ids in the exported renderer', () => {
    const script = buildRegexScript({
        ...RULE_PRESETS.universalClassical,
        structure: 'profile',
    });
    assert.match(script.replaceString, /item\.dataset\.field=field\.id/);
});

test('forum keeps six purposeful boards, twelve replies per board and only confirms the deep archive', () => {
    const preset = STATUS_STRUCTURE_PRESETS.find(item => item.id === 'forum');
    assert.ok(preset);
    assert.equal(parsePages(preset.pagesText).length, 6);
    assert.deepEqual(preset.shared.map(field => field[3]), ['forum_title', 'forum_notice']);
    assert.deepEqual(
        preset.fields.map(field => field[3]),
        ['board_title', 'thread_title', 'tags', 'post_1', 'post_2', 'post_3', 'post_4', 'post_5', 'post_6', 'post_7', 'post_8', 'post_9', 'post_10', 'post_11', 'post_12'],
    );

    const input = {
        ...RULE_PRESETS.custom,
        structure: 'forum',
        theme: 'retro-bbs',
        pagesText: preset.pagesText,
        sharedFieldsText: preset.shared.map(field => field.join('|')).join('\n'),
        pageFieldsText: preset.fields.map(field => field.join('|')).join('\n'),
        forumSkin: 'ao3-archive',
    };
    const instruction = buildAiInstruction(input);
    const generated = buildRegexScript(input);
    const script = generated.replaceString;

    assert.deepEqual(generated.placement, [2]);
    assert.equal(generated.runOnEdit, true);
    assert.equal(generated.markdownOnly, true);
    assert.match(instruction, /◆/);
    assert.match(instruction, />>数字/);
    assert.match(instruction, /主楼4-6句铺场景与冲突/);
    assert.match(instruction, /其余每楼1-3句接话推进/);
    assert.match(instruction, /至少4种立场/);
    assert.match(instruction, /接梗、误会、反驳、嗑点、脑洞、预测/);
    assert.match(instruction, /禁止情报摘要/);
    assert.match(instruction, /把\{\{char\}\}与\{\{user\}\}当本轮故事主角/);
    assert.match(instruction, /预览中的X不是昵称，禁止照搬/);
    assert.match(instruction, /N=1至6/);
    assert.match(instruction, /R1\|R2\|R3/);
    assert.ok(instruction.length < 600, `forum worldbook instruction stays compact: ${instruction.length} chars`);
    assert.match(script, /<!DOCTYPE html>/i);
    assert.match(script, /<body>/i);
    assert.match(script, /<\/body>/i);
    assert.match(script, /class="forum-2ch"/);
    assert.match(script, /data-forum-skin="ao3-archive"/);
    assert.match(script, /class="forum-header"/);
    assert.match(script, /class="forum-tabs"/);
    assert.match(script, /class="forum-board-panel"/);
    assert.doesNotMatch(script, /class="forum-2ch" style=/);
    assert.doesNotMatch(script, /class="zrs-card"/);
    assert.doesNotMatch(script, /class="zrs-chrome"/);
    assert.doesNotMatch(script, /class="zrs-collapse"/);
    assert.doesNotMatch(script, /class="zrs-fields"/);
    assert.match(script, /function parseForumPost/);
    assert.match(script, /function forumAvatar/);
    assert.match(script, /avatarNode\.dataset\.avatarTone/);
    assert.match(script, /function renderForumPage/);
    assert.match(script, /function syncHostFrameHeight/);
    assert.match(script, /Math\.max\(root\.offsetHeight\|\|0,root\.scrollHeight\|\|0,1\)/);
    assert.match(script, /function queueHostFrameHeight/);
    assert.match(script, /showPage\(index\).*queueHostFrameHeight\(\)/);
    assert.match(script, /new ResizeObserver\(queueHostFrameHeight\)\.observe\(root\)/);
    assert.match(script, /window\.addEventListener\('resize',queueHostFrameHeight\)/);
    assert.match(script, /forum-post/);
    assert.match(script, /forum-post-num/);
    assert.match(script, /forum-post-author/);
    assert.match(script, /forum-post-id/);
    assert.match(script, /forum-post-time/);
    assert.match(script, /forum-post-field/);
    assert.match(script, /forum-quote-ref/);
    assert.match(script, /forum-confirm/);
    assert.match(script, /aria-modal/);
    assert.match(script, /var unlocked=/);
    assert.match(script, /function isRestrictedPage/);
    assert.match(script, /深\(\?:页\|夜\)档案/);
    assert.match(script, /if\(restricted\)button\.append\(make\('span','forum-tab-lock','确认进入'\)\)/);
    assert.doesNotMatch(script, /if\(index>0\)button\.append\(make\('span','forum-tab-lock'/);
    assert.match(FORUM_THEME_CSS, /forum-board-meta/);
    assert.match(FORUM_THEME_CSS, /forum-post/);
    assert.match(FORUM_THEME_CSS, /forum-quote-ref/);
    assert.match(FORUM_THEME_CSS, /forum-confirm-box/);
    assert.match(FORUM_THEME_CSS, /forum-2ch\[data-forum-skin\] \.forum-post-list\{max-height:none;overflow-y:visible\}/);
    assert.match(FORUM_THEME_CSS, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
    assert.match(FORUM_THEME_CSS, /\.forum-tab[^}]*min-width:0!important[^}]*white-space:normal/);
    assert.match(FORUM_THEME_CSS, /\.forum-post[^}]*grid-template-columns:minmax\(0,1fr\)!important/);
    assert.match(FORUM_THEME_CSS, /\.forum-post-body[^}]*font-size:clamp\(14px,4vw,15px\)/);
    assert.match(FORUM_THEME_CSS, /\.forum-confirm\{position:absolute;inset:8px 6px auto/);
    assert.equal(normalizeRule(input).forumSkin, 'ao3-archive');
    assert.equal(normalizeRule({ ...input, forumSkin: 'unknown-forum' }).forumSkin, 'mist-bbs');
    for (const skin of FORUM_SKIN_PRESETS) {
        const themedScript = buildRegexScript({ ...input, forumSkin: skin.id }).replaceString;
        assert.match(themedScript, new RegExp(`data-forum-skin="${skin.id}"`));
        assert.match(themedScript, new RegExp(skin.kicker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }

    const previewTitles = FORUM_SKIN_PRESETS.map(skin => makePreviewRecords({ ...input, forumSkin: skin.id }).shared[0]);
    assert.equal(new Set(previewTitles).size, FORUM_SKIN_PRESETS.length);
    const mistPreview = makePreviewRecords({ ...input, forumSkin: 'mist-bbs' });
    const archivePreview = makePreviewRecords({ ...input, forumSkin: 'ao3-archive' });
    const jjPreview = makePreviewRecords({ ...input, forumSkin: 'jj-forum' });
    const tiebaPreview = makePreviewRecords({ ...input, forumSkin: 'tieba-thread' });
    const doubanPreview = makePreviewRecords({ ...input, forumSkin: 'douban-group' });
    const paranormalPreview = makePreviewRecords({ ...input, forumSkin: 'paranormal-case' });
    assert.equal(archivePreview.pages[5].values[0], '深页档案');
    assert.match(archivePreview.shared[0], /同人作品库/);
    assert.equal(archivePreview.pages[0].values[1], 'X');
    assert.equal(archivePreview.pages[0].values[2], 'X');
    assert.equal(archivePreview.pages[0].values.filter(value => /◆/.test(value)).length, 12);
    assert.equal(jjPreview.pages[0].values.filter(value => /◆/.test(value)).length, 12);
    assert.equal(jjPreview.shared[0], '江水港旧论坛');
    assert.match(jjPreview.shared[1], /角色与user当连载小说主角/);
    assert.equal(jjPreview.pages[0].values[1], 'X');
    assert.equal(jjPreview.pages[0].values[2], 'X');
    assert.equal(jjPreview.pages[0].values[3], '1◆X◆ID:X◆X◆X');
    assert.match(tiebaPreview.shared[0], /事件吧/);
    assert.match(doubanPreview.shared[0], /小组/);
    assert.match(paranormalPreview.shared[0], /天涯社区/);
    assert.deepEqual(paranormalPreview.rule.sharedFields.map(field => field.id), ['forum_title', 'forum_notice', 'forum_presence']);
    assert.equal(paranormalPreview.shared[2], 'X');
    const paranormalInstruction = buildAiInstruction({ ...input, forumSkin: 'paranormal-case' });
    const paranormalScript = buildRegexScript({ ...input, forumSkin: 'paranormal-case' }).replaceString;
    assert.match(paranormalInstruction, /\[Shared\|论坛名\|公告\|在线人数\]/);
    assert.match(paranormalInstruction, /在线 X 人/);
    assert.match(paranormalScript, /shared\[2\]\|\|config\.presenceFallback/);
    assert.doesNotMatch(paranormalScript, /<div class="forum-presence">在线 2187 人<\/div>/);
    assert.deepEqual(tiebaPreview.rule.pages.map(page => page.label), ['实时吃瓜楼', '角色扒皮楼', 'CP脑洞楼', '后续押注楼', '名场面改写', '深页档案']);
    assert.deepEqual(doubanPreview.rule.pages.map(page => page.label), ['今日名场面', '关系显微镜', '如果我是TA', '脑洞放映厅', '小组投票', '深页档案']);
    assert.deepEqual(paranormalPreview.rule.pages.map(page => page.label), ['今夜怪谈', '楼主续更', '众说纷纭', '天涯神回复', '民间旧闻', '深页档案']);
    for (const preview of [mistPreview, archivePreview, jjPreview, tiebaPreview, doubanPreview, paranormalPreview]) {
        assert.equal(preview.rule.pages.length, 6);
        assert.equal(preview.rule.pages.at(-1).label, '深页档案');
        for (const page of preview.pages) {
            assert.equal(page.values[1], 'X');
            assert.equal(page.values[2], 'X');
            const posts = page.values.filter(value => /◆/.test(value));
            assert.equal(posts.length, 12);
            assert.ok(posts.every(value => /^\d+◆X◆ID:X◆X◆X$/.test(value)));
        }
    }
    assert.match(FORUM_THEME_CSS, /data-avatar-tone="5"/);
    assert.match(FORUM_SKIN_PRESETS.find(skin => skin.id === 'ao3-archive').aiGuide, /同人档案小剧场/);
    for (const skin of FORUM_SKIN_PRESETS) {
        assert.equal(skin.sections.length, 6);
        assert.ok(buildAiInstruction({ ...input, forumSkin: skin.id }).length < 600, `${skin.id} compact worldbook`);
    }

    const fixedTitleInstruction = buildAiInstruction({
        ...input,
        forumPreviewDrafts: { 'ao3-archive': { title: '我改过的同人站' } },
    });
    assert.match(fixedTitleInstruction, /论坛名=我改过的同人站/);

    const postValues = [
        '1◆匿名用户◆ID:a7K2◆08/22 19:42◆第一楼正文',
        '2◆路过◆ID:m91Q◆08/22 19:45◆>>1 引用第一楼',
        '3◆考据党◆ID:x4pL◆08/22 19:51◆第三楼正文',
        '4◆匿名用户◆ID:b20N◆08/22 20:03◆>>2 继续回复',
        '5◆围观者◆ID:c31P◆08/22 20:08◆第五楼正文',
        '6◆补充证言◆ID:d42Q◆08/22 20:11◆>>5 补充第五楼',
        '7◆时间线整理◆ID:e53R◆08/22 20:16◆第七楼正文',
        '8◆匿名备份◆ID:f64S◆08/22 20:22◆第八楼正文',
        '9◆催更读者◆ID:g75T◆08/22 20:28◆第九楼正文',
        '10◆补档用户◆ID:h86U◆08/22 20:33◆>>9 补充第九楼',
        '11◆长评用户◆ID:i97V◆08/22 20:39◆第十一楼正文',
        '12◆楼主◆ID:j08W◆08/22 20:45◆第十二楼总结',
    ];
    const pageLine = (id, board) => `[${id}|${board}|当前主题|#剧情 #讨论|${postValues.join('|')}]`;
    const parsed = parseStatusOutput(input, [
        '<zeya_status>',
        '[Shared|匿名剧情站|请遵守版规]',
        pageLine('View1', '公开讨论'),
        pageLine('View2', '角色闲谈'),
        pageLine('View3', '事件追踪'),
        pageLine('View4', '脑洞改写'),
        pageLine('View5', '后续押注'),
        pageLine('View6', '深夜档案'),
        '</zeya_status>',
    ].join('\n'));
    assert.equal(parsed.pages.length, 6);
    assert.equal(parsed.pages[1].values[0], '角色闲谈');
    assert.equal(parsed.pages[0].values[4], postValues[1]);
});

test('chat session exports a scrollable variable-length phone-literature conversation with both avatars', () => {
    const preset = STATUS_STRUCTURE_PRESETS.find(item => item.id === 'chat');
    assert.ok(preset);
    assert.deepEqual(preset.fields.map(field => field[3]), ['chat_name', 'online', 'chat_log']);
    assert.match(preset.fields[2][1], /12到24条/);
    assert.match(preset.fields[2][1], /时间¦发送方¦类型¦状态¦时长¦内容/);
    const input = {
        ...RULE_PRESETS.custom,
        structure: 'chat',
        title: preset.title,
        subtitle: preset.subtitle,
        layout: preset.layout,
        pagesText: preset.pagesText,
        pageFieldsText: preset.fields.map(field => field.join('|')).join('\n'),
        media: {
            avatarSource: 'character',
            avatarUrl: '/characters/character.png',
            avatarFallbackUrl: '/thumbnail?type=avatar&file=character.png',
            userAvatarUrl: '/User%20Avatars/user.png',
            userAvatarFallbackUrl: '/thumbnail?type=persona&file=user.png',
            imageAlt: '聊天对象头像',
        },
    };
    const preview = makePreviewRecords(input);
    assert.deepEqual(preview.pages[0].values, ['当前聊天对象', '在线 · 正在输入', CHAT_SAMPLE_LOG]);
    const messages = parseChatConversationLog(preview.pages[0].values[2]);
    assert.equal(messages.length, 17);
    assert.deepEqual(messages[0], {
        time: '21:58', side: 'left', type: 'text', state: '', duration: '', message: 'X',
    });
    assert.deepEqual(messages.map(item => item.message), Array(17).fill('X'));
    assert.equal(messages[7].type, 'voice');
    assert.equal(messages[7].duration, '0:09');
    assert.equal(messages.at(-1).side, 'right');
    assert.equal(messages.at(-1).state, '已读');
    const instruction = buildAiInstruction(input);
    assert.match(instruction, /12到24条/);
    assert.match(instruction, /每条用§分隔/);
    assert.doesNotMatch(CHAT_SAMPLE_LOG, /\|/);
    const parsed = parseStatusOutput(input, `<zeya_status>
[View1|当前聊天对象|在线 · 正在输入|${CHAT_SAMPLE_LOG}]
</zeya_status>`);
    assert.equal(parseChatConversationLog(parsed.pages[0].values[2]).length, 17);
    const script = buildRegexScript(input).replaceString;
    assert.match(script, /function renderChatConversation/);
    assert.match(script, /zrs-chat-window/);
    assert.match(script, /zrs-chat-conversation/);
    assert.match(script, /zrs-chat-contact/);
    assert.match(script, /zrs-chat-row is-/);
    assert.match(script, /is-voice-message/);
    assert.match(script, /zrs-chat-message-meta/);
    assert.match(script, /zrs-chat-voice-play/);
    assert.match(script, /zrs-chat-menu/);
    assert.match(script, /zrs-chat-sidebar/);
    assert.match(script, /zrs-chat-statusbar/);
    assert.match(script, /aria-expanded/);
    assert.match(script, /聊天记录，可上下滑动/);
    assert.match(script, /function parseChatMessages/);
    assert.match(script, /config\.media\.userAvatarUrl/);
    assert.match(script, /side==='right'\?config\.media\.userAvatarUrl:config\.media\.avatarUrl/);
    assert.match(script, /side==='right'\?config\.media\.userAvatarFallbackUrl:config\.media\.avatarFallbackUrl/);
    assert.match(script, /function setAvatarBackground/);
    assert.match(script, /DIY：六套外观、会话标题与左侧头像/);
    assert.match(script, /头像：左侧角色 · 右侧当前 User/);
    assert.match(script, /AI：对象、在线、消息、时间、语音与已读/);
    assert.doesNotMatch(script, /DIY：头像来源、标题、外观与配色/);
    assert.doesNotMatch(script, /their_message_1|user_message_3|AI · 七轮会话/);
    assert.match(script, /messages\.forEach/);
    assert.match(script, /fields\.append\(menu,windowBody\)/);
    assert.match(CHAT_REFERENCE_CSS, /data-structure="chat"[^}]*width:min\(100%,620px\)/);
    assert.match(CHAT_REFERENCE_CSS, /zrs-chat-window[^}]*grid-template-columns:174px/);
    assert.match(CHAT_REFERENCE_CSS, /zrs-chat-menu[^}]*display:flex!important/);
    assert.match(CHAT_REFERENCE_CSS, /zrs-chat-sidebar[^}]*display:flex!important/);
    assert.match(CHAT_REFERENCE_CSS, /zrs-chat-transcript[^}]*height:520px[^}]*overflow-y:auto/);
    assert.match(CHAT_REFERENCE_CSS, /zrs-chat-transcript[^}]*touch-action:pan-y/);
    assert.match(CHAT_REFERENCE_CSS, /zrs-chat-mini-avatar[^}]*width:30px;height:30px/);
    assert.match(CHAT_REFERENCE_CSS, /zrs-chat-bubble[^}]*font-size:\.78rem/);
    assert.doesNotMatch(CHAT_REFERENCE_CSS, /zrs-chat-bubble\{[^}]*border:[^;}]*(?:dashed|dotted)/);
    assert.doesNotMatch(CHAT_REFERENCE_CSS, /zrs-chat-bubble::after\{[^}]*border-(?:left|bottom):[^;}]*(?:dashed|dotted)/);
    assert.match(CHAT_REFERENCE_CSS, /zrs-chat-voice-play[^}]*width:32px;height:32px/);
    assert.match(CHAT_REFERENCE_CSS, /@media\(max-width:520px\)[\s\S]*zrs-chat-transcript\{height:430px/);
    assert.equal(CHAT_APPEARANCE_PRESETS.length, 7);
    assert.deepEqual(CHAT_APPEARANCE_PRESETS.map(item => item.id), [
        'kitty-pink', 'meow-mono', 'cloud-blue', 'notepad-pink', 'lace-ivory', 'velvet-wine', 'retro-pink-pc',
    ]);
    for (const appearance of CHAT_APPEARANCE_PRESETS) {
        const appearanceInput = { ...input, chatAppearance: appearance.id };
        const normalized = normalizeRule(appearanceInput);
        const appearanceScript = buildRegexScript(appearanceInput).replaceString;
        assert.equal(normalized.chatAppearance, appearance.id);
        assert.match(appearanceScript, new RegExp(`data-chat-appearance="${appearance.id}"`));
        assert.doesNotMatch(appearanceScript, /url\(&quot;undefined/);
    }
    assert.match(CHAT_REFERENCE_CSS, /data-chat-appearance="meow-mono"/);
    assert.match(CHAT_REFERENCE_CSS, /data-chat-appearance="cloud-blue"/);
    assert.match(CHAT_REFERENCE_CSS, /data-chat-appearance="notepad-pink"/);
    assert.match(CHAT_REFERENCE_CSS, /data-chat-appearance="lace-ivory"/);
    assert.match(CHAT_REFERENCE_CSS, /data-chat-appearance="velvet-wine"/);
    assert.match(CHAT_REFERENCE_CSS, /data-chat-appearance="retro-pink-pc"/);
    assert.match(CHAT_REFERENCE_CSS, /05\/06 are standalone tactile chat cards/);
    assert.match(CHAT_REFERENCE_CSS, /:is\(\[data-chat-appearance="lace-ivory"\],\[data-chat-appearance="velvet-wine"\]\)[^{]*\.zrs-header[^}]*display:none!important/);
    assert.match(CHAT_REFERENCE_CSS, /:is\(\[data-chat-appearance="lace-ivory"\],\[data-chat-appearance="velvet-wine"\]\)[^{]*\.zrs-chat-window\{[^}]*height:930px[^}]*overflow:hidden/);
    assert.match(CHAT_REFERENCE_CSS, /:is\(\[data-chat-appearance="lace-ivory"\],\[data-chat-appearance="velvet-wine"\]\)[^{]*\.zrs-chat-transcript\{[^}]*height:714px[^}]*overflow-y:auto/);
    assert.match(CHAT_REFERENCE_CSS, /:is\(\[data-chat-appearance="lace-ivory"\],\[data-chat-appearance="velvet-wine"\]\)[^{]*\.zrs-chat-mini-avatar\{[^}]*width:46px;height:46px/);
    assert.match(CHAT_REFERENCE_CSS, /preview-character\.svg/);
    assert.match(CHAT_REFERENCE_CSS, /preview-user\.svg/);
    assert.match(CHAT_REFERENCE_CSS, /zrs-chat-row\.is-voice-message\{display:none!important/);
    assert.match(CHAT_REFERENCE_CSS, /zrs-chat-contact[^)]*zrs-chat-statusbar/);
    assert.match(CHAT_FRAME_ASSET_URLS['lace-ivory'], /assets\/chat\/lace-frame\.png$/);
    assert.match(CHAT_FRAME_ASSET_URLS['velvet-wine'], /assets\/chat\/velvet-frame\.png$/);
    const laceScript = buildRegexScript({ ...input, chatAppearance: 'lace-ivory' }).replaceString;
    const velvetScript = buildRegexScript({ ...input, chatAppearance: 'velvet-wine' }).replaceString;
    assert.match(laceScript, new RegExp(CHAT_FRAME_ASSET_URLS['lace-ivory'].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(velvetScript, new RegExp(CHAT_FRAME_ASSET_URLS['velvet-wine'].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(script, /cat-mascot\.png/);
    assert.doesNotMatch(script, /url\(&quot;undefined/);
});

test('avatar is a real field kind that binds the configured character or user image', () => {
    const [field] = parseFields('角色头像|只填写对应角色姓名|avatar|portrait');
    assert.equal(field.id, 'portrait');
    assert.equal(field.kind, 'avatar');
    const script = buildRegexScript({
        ...RULE_PRESETS.universalClassical,
        pageFieldsText: '角色头像|只填写对应角色姓名|avatar|portrait',
        media: {
            avatarSource: 'character',
            avatarUrl: '/thumbnail?type=avatar&file=character.png',
            imageAlt: '当前角色头像',
        },
    });
    assert.match(script.replaceString, /zrs-field-avatar/);
    assert.match(script.replaceString, /zrs-avatar-caption/);
    assert.match(script.replaceString, /hasAvatarField/);
    assert.match(STATUS_THEME_CSS, /zrs-field-avatar/);
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
    assert.equal(entry.position, 4);
    assert.equal(entry.depth, 1);
    assert.deepEqual(entry.key, []);
    assert.match(entry.content, /<zeya_status_classical_rules>/);
    assert.match(entry.content, /所有值都必须根据当前剧情动态生成/);
    assert.equal(Object.hasOwn(entry, 'affection'), false);
});

test('registers 22 distinct editable mobile themes with unique codes and ids', () => {
    assert.equal(STATUS_STYLE_PRESETS.length, 22);
    assert.equal(new Set(STATUS_STYLE_PRESETS.map(style => style.code)).size, 22);
    assert.equal(new Set(STATUS_STYLE_PRESETS.map(style => style.id)).size, 22);
    assert.deepEqual(STATUS_STYLE_PRESETS.map(style => style.code), Array.from({ length: 22 }, (_, index) => String(index + 1).padStart(2, '0')));
    for (const removed of ['glass', 'ocean', 'bauhaus-shop', 'nouveau-tarot', 'holo-terminal']) {
        assert.equal(STATUS_STYLE_PRESETS.some(style => style.id === removed), false);
    }
    assert.equal(STATUS_STYLE_PRESETS.find(style => style.id === 'ink-diary')?.glyph, '○');
});

test('a real template overrides the removed generic appearance layer', () => {
    const social = STATUS_STRUCTURE_PRESETS.find(item => item.id === 'social');
    const script = buildRegexScript({
        ...RULE_PRESETS.universalClassical,
        structure: social.id,
        theme: 'minimal',
        title: social.title,
        subtitle: social.subtitle,
        pagesText: social.pagesText,
        pageFieldsText: social.fields.map(field => field.join('|')).join('\n'),
    });
    assert.match(script.replaceString, /data-theme="personal-dossier"/);
    assert.match(script.replaceString, /LIVE \/ WORLD INFO/);
    assert.match(script.replaceString, /var records=\{\}/);
    assert.doesNotMatch(script.replaceString, /林澈|旧港调查员|参考人物|示例人物/);
});

test('every selectable status template generates syntactically valid mobile renderer code', () => {
    const selectableIds = ['phone', 'profile', 'social', 'forum', 'chat', 'music', 'quest', 'casefile'];
    for (const structure of STATUS_STRUCTURE_PRESETS.filter(item => selectableIds.includes(item.id))) {
        const script = buildRegexScript({
            ...RULE_PRESETS.custom,
            structure: structure.id,
            layout: structure.layout,
            title: structure.title,
            subtitle: structure.subtitle,
            pagesText: structure.pagesText,
            sharedFieldsText: (structure.shared || []).map(field => field.join('|')).join('\n'),
            pageFieldsText: structure.fields.map(field => field.join('|')).join('\n'),
        });
        assert.doesNotMatch(script.replaceString, /data-theme="undefined"/);
        assert.match(script.replaceString, /zrs-chrome|forum-2ch|zrs-chat-window/);
        assert.match(script.replaceString, /@media\s*\(max-width:/);
        const browserScript = script.replaceString.match(/<script>\n([\s\S]*?)\n<\/script>/);
        assert.ok(browserScript, `${structure.id} ${structure.name} includes browser script`);
        assert.doesNotThrow(() => new Function(browserScript[1]), `${structure.id} ${structure.name} browser script parses`);
    }
});

test('the retained appearance library keeps visibly dedicated treatments', () => {
    assert.equal(STATUS_STYLE_PRESETS.length, 22);
    for (const style of STATUS_STYLE_PRESETS.filter(item => item.id !== 'classical')) {
        assert.match(STATUS_THEME_CSS, new RegExp(`data-theme="${style.id}"`), `${style.code} ${style.name} has dedicated CSS`);
    }
});

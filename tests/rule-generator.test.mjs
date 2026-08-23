import test from 'node:test';
import assert from 'node:assert/strict';
import {
    RULE_PRESETS,
    SOCIAL_APPEARANCE_PRESETS,
    STATUS_PALETTE_PRESETS,
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
    parsePages,
} from '../rule-generator.js';

test('parses any number of switch pages without storing story values', () => {
    const pages = parsePages('喻生|谨慎克制\n喻黎|老城区生活\n旁观者|第三视角');
    assert.deepEqual(pages.map(page => page.id), ['View1', 'View2', 'View3']);
    assert.deepEqual(pages.map(page => page.label), ['喻生', '喻黎', '旁观者']);
});

test('registers genuinely different component structures and composable palettes', () => {
    assert.equal(STATUS_STRUCTURE_PRESETS.length, 10);
    assert.equal(new Set(STATUS_STRUCTURE_PRESETS.map(item => item.id)).size, 10);
    assert.equal(STATUS_PALETTE_PRESETS.length, 32);
    assert.equal(new Set(STATUS_PALETTE_PRESETS.map(item => item.id)).size, 32);
    assert.ok(STATUS_PALETTE_PRESETS.every(item => ['accent', 'background', 'card', 'text', 'muted'].every(key => /^#[0-9a-f]{6}$/i.test(item[key]))));
    assert.deepEqual(STATUS_PALETTE_PRESETS.slice(-8).map(item => item.name), [
        '敦煌橙青',
        '土星复古',
        '春芽柠檬',
        '橙蓝碰撞',
        '夜蓝蜜桃',
        '雾灰森林',
        '炭红旧书',
        '冬夜霜蓝',
    ]);
    for (const structure of STATUS_STRUCTURE_PRESETS) {
        assert.ok(structure.fields.length >= 3, `${structure.name} has an editable schema`);
        assert.ok(structure.fields.every(field => field.length === 4), `${structure.name} keeps stable field keys`);
    }
});

test('personal feed exports a two-sided paper dossier with DIY photos and story-filled records', () => {
    const social = STATUS_STRUCTURE_PRESETS.find(item => item.id === 'social');
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

test('the workbench renders dedicated structure compositions instead of a color-only mockup', () => {
    const exposed = STATUS_STRUCTURE_PRESETS.filter(item => ['phone', 'profile', 'social', 'forum', 'chat', 'music', 'quest', 'casefile'].includes(item.id));
    assert.equal(exposed.length, 8);
    assert.equal(new Set(exposed.map(item => item.appearanceId)).size, 8);
    for (const structure of ['custom', 'profile', 'social', 'forum', 'chat', 'collage', 'music', 'quest', 'casefile']) {
        assert.match(STATUS_THEME_CSS, new RegExp(`data-structure="${structure}"`), `${structure} has a distinct exported skeleton`);
    }
    assert.match(STATUS_PHONE_CSS, /data-structure="phone"/);
    assert.match(STATUS_PHONE_CSS, /is-phone-home/);
    assert.match(STATUS_PHONE_CSS, /--z-phone-accent:var\(--z-accent/);
    assert.match(STATUS_PHONE_CSS, /--z-phone-bg:var\(--z-bg/);
    assert.match(STATUS_PHONE_CSS, /zrs-phone-chat\.is-left[^}]*var\(--z-phone-accent\)/);
    assert.match(STATUS_THEME_CSS, /data-structure="music"[^}]*[\s\S]*?repeating-radial-gradient/);
    assert.match(STATUS_THEME_CSS, /data-structure="forum"[^}]*[\s\S]*?grid-template-columns:110px/);
    assert.match(STATUS_THEME_CSS, /data-structure="forum"[^}]*[\s\S]*?zrs-field:nth-child\(4\)/);
    assert.match(STATUS_THEME_CSS, /data-structure="collage"[^}]*[\s\S]*?grid-template-columns:repeat\(12/);
    assert.match(STATUS_THEME_CSS, /data-structure="collage"[^}]*[\s\S]*?zrs-structure-art i:nth-child\(3\)/);
    assert.match(STATUS_THEME_CSS, /data-structure="custom"[^}]*[\s\S]*?border:3px inset/);
    assert.match(STATUS_THEME_CSS, /data-structure="social"[^}]*[\s\S]*?zrs-social-intro-copy/);
    assert.match(STATUS_THEME_CSS, /data-structure="forum"[^}]*[\s\S]*?zrs-forum-avatar/);
    assert.match(STATUS_THEME_CSS, /data-structure="music"[^}]*[\s\S]*?33⅓/);
    assert.match(STATUS_THEME_CSS, /data-structure="quest"[^}]*[\s\S]*?drop-shadow/);
    assert.match(STATUS_THEME_CSS, /data-structure="casefile"[^}]*[\s\S]*?rotate\(-5deg\)/);
    assert.match(STATUS_THEME_CSS, /data-structure="music"[^}]*[\s\S]*?box-shadow:7px 8px 0/);
    assert.match(STATUS_THEME_CSS, /data-structure="quest"[^}]*[\s\S]*?clip-path:none/);
    assert.doesNotMatch(buildRegexScript({ ...RULE_PRESETS.universalClassical, logoId: 'slider-apple' }).replaceString, /data-logo=/);
});

test('removes the rejected 40-card recipe collection from selectable structures', () => {
    const ids = STATUS_STRUCTURE_PRESETS.map(item => item.id);
    assert.deepEqual(ids, ['phone', 'profile', 'social', 'forum', 'chat', 'collage', 'music', 'quest', 'casefile', 'custom']);
    for (const removedId of ['shop', 'travel', 'weather', 'holo', 'specimen', 'memory', 'livestream']) {
        assert.equal(ids.includes(removedId), false, `${removedId} is no longer selectable`);
    }
    const generated = buildRegexScript({ ...RULE_PRESETS.custom, variant: 'glass-orbit', structure: 'shop' }).replaceString;
    assert.match(generated, /data-structure="custom"/);
    assert.match(generated, /data-variant="auto"/);
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
[Shared|旧港钟楼|22:10|细雨]
[Personal|68|47|深色外套|我会等他回来]
[Memo|取回钥匙|调查信封|赴约]
[Wechat|温瑟|到家了吗|刚到|我等你|马上来]
[Shop|旧城通行证|进入封锁区|银柄折叠伞|藏有便笺|蓝花信纸|十二张]
</zeya_status>`);
    assert.deepEqual(parsed.pages.map(page => page.values.length), [4, 3, 5, 6]);
    assert.match(buildAiInstruction(phoneInput), /\[Personal\|/);
    assert.match(buildAiInstruction(phoneInput), /\[Shop\|/);
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
});

test('phone DIY settings are normalized separately from AI story values', () => {
    const phone = normalizePhoneDesktop({
        phoneDesktop: {
            wallpaperUrl: 'https://example.com/wallpaper.jpg',
            wallpaperPositionX: 140,
            wallpaperPositionY: -10,
            widgetX: 30,
            widgetY: 180,
            widgetOrder: ['current_weather', 'current_location'],
            personalAvatarSource: 'url',
            personalAvatarUrl: 'https://example.com/avatar.png',
            personalAvatarPositionX: 22,
            personalAvatarPositionY: 74,
            personalAvatarScale: 9,
            personalFields: [
                { id: 'favor', label: '信赖度', kind: 'text', instruction: '填写当前信赖阶段' },
                { id: 'desire', label: '牵挂度', kind: 'progress', instruction: '填写0到100的数字' },
            ],
            apps: [
                { id: 'Personal', name: '档案', iconUrl: 'https://example.com/me.png' },
                { id: 'Memo', name: '线索', iconUrl: 'javascript:alert(1)' },
            ],
        },
    });
    assert.equal(phone.wallpaperPositionX, 100);
    assert.equal(phone.wallpaperPositionY, 0);
    assert.equal(phone.petalsEnabled, true);
    assert.equal(phone.personalAvatarScale, 3);
    assert.deepEqual(phone.widgetOrder, ['current_weather', 'current_location', 'current_time']);
    assert.deepEqual(phone.apps.map(app => app.name), ['档案', '线索', '微信', '购物']);
    assert.equal(phone.apps[1].iconUrl, '');
    assert.deepEqual(phone.personalFields.map(field => field.label), ['信赖度', '牵挂度', '当前衣着', '实时想法']);
    assert.deepEqual(phone.personalFields.map(field => field.kind), ['text', 'progress', 'long', 'long']);
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
    assert.doesNotMatch(instruction, /wallpaper|iconUrl|壁纸图片 URL/);
    const generated = buildRegexScript(input).replaceString;
    assert.match(generated, /https:\/\/example\.com\/wallpaper\.jpg/);
    assert.match(generated, /https:\/\/example\.com\/me\.png/);
    assert.match(generated, /widgetOrder/);
    assert.match(generated, /style\.transform='scale\('\+config\.phoneDesktop\.personalAvatarScale\+'\)'/);
    assert.match(generated, /field&&field\.kind==='progress'/);
    assert.match(generated, /personalFields\[0\]/);
    assert.doesNotMatch(generated, /phoneDataCard\('好感度'/);
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
    assert.deepEqual(entry.key, []);
    assert.match(entry.content, /<zeya_status_classical_rules>/);
    assert.match(entry.content, /所有值都必须根据当前剧情动态生成/);
    assert.equal(Object.hasOwn(entry, 'affection'), false);
});

test('the eight selectable templates own unique appearances', () => {
    const selectableIds = ['phone', 'profile', 'social', 'forum', 'chat', 'music', 'quest', 'casefile'];
    const selectable = STATUS_STRUCTURE_PRESETS.filter(item => selectableIds.includes(item.id));
    assert.equal(selectable.length, 8);
    assert.equal(new Set(selectable.map(item => item.appearanceId)).size, 8);
    assert.ok(selectable.every(item => item.appearanceName && item.glyph));
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
        assert.match(script.replaceString, new RegExp(`data-theme="${structure.appearanceId}"`));
        assert.match(script.replaceString, /zrs-chrome/);
        assert.match(script.replaceString, /@media\(max-width:520px\)/);
        const browserScript = script.replaceString.match(/<script>\n([\s\S]*?)\n<\/script>/);
        assert.ok(browserScript, `${structure.name} includes browser script`);
        assert.doesNotThrow(() => new Function(browserScript[1]), `${structure.name} browser script parses`);
    }
});

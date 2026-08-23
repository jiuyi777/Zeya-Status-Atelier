import test from 'node:test';
import assert from 'node:assert/strict';
import {
    RULE_PRESETS,
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
    assert.equal(STATUS_STRUCTURE_PRESETS.length, 13);
    assert.equal(new Set(STATUS_STRUCTURE_PRESETS.map(item => item.id)).size, 13);
    assert.equal(STATUS_PALETTE_PRESETS.length, 26);
    assert.equal(new Set(STATUS_PALETTE_PRESETS.map(item => item.id)).size, 26);
    assert.ok(STATUS_PALETTE_PRESETS.every(item => ['accent', 'background', 'card', 'text', 'muted'].every(key => /^#[0-9a-f]{6}$/i.test(item[key]))));
    for (const structure of STATUS_STRUCTURE_PRESETS) {
        assert.ok(structure.fields.length >= 3, `${structure.name} has an editable schema`);
        assert.ok(structure.fields.every(field => field.length === 4), `${structure.name} keeps stable field keys`);
    }
});

test('dynamic progress always uses a solid fill without selectable objects', () => {
    const normalized = normalizeRule({ ...RULE_PRESETS.universalClassical, theme: 'vinyl-mag', logoId: 'slider-apple', fillMode: 'object' });
    assert.equal(normalized.glyph, '♪');
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
    assert.deepEqual(ids, ['phone', 'profile', 'archive-status', 'pixel-chat', 'pixel-handheld', 'social', 'forum', 'chat', 'collage', 'music', 'quest', 'casefile', 'custom']);
    for (const removedId of ['shop', 'travel', 'weather', 'holo', 'specimen', 'memory', 'livestream']) {
        assert.equal(ids.includes(removedId), false, `${removedId} is no longer selectable`);
    }
    const generated = buildRegexScript({ ...RULE_PRESETS.custom, variant: 'glass-orbit', structure: 'shop' }).replaceString;
    assert.match(generated, /data-structure="custom"/);
    assert.match(generated, /data-variant="auto"/);
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
            archiveImageUrls: 'https://example.com/photo-a.jpg\njavascript:alert(2)\nhttps://example.com/photo-a.jpg\n/player-photo-b.png',
            audioUrl: 'https://example.com/theme.mp3',
        },
    });
    assert.equal(rule.structure, 'music');
    assert.equal(rule.palette.id, 'porcelain');
    assert.equal(rule.media.avatarUrl, '');
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

test('the retained appearance library keeps visibly dedicated treatments', () => {
    assert.equal(STATUS_STYLE_PRESETS.length, 22);
    for (const style of STATUS_STYLE_PRESETS.filter(item => item.id !== 'classical')) {
        assert.match(STATUS_THEME_CSS, new RegExp(`data-theme="${style.id}"`), `${style.code} ${style.name} has dedicated CSS`);
    }
});

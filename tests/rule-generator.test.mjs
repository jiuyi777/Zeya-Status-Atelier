import test from 'node:test';
import assert from 'node:assert/strict';
import {
    CHAT_APPEARANCE_PRESETS,
    CHAT_FRAME_ASSET_URLS,
    CHAT_REFERENCE_CSS,
    CHAT_SAMPLE_LOG,
    RULE_PRESETS,
    STATUS_PALETTE_PRESETS,
    STATUS_STRUCTURE_PRESETS,
    STATUS_STYLE_PRESETS,
    STATUS_THEME_CSS,
    STATUS_PHONE_CSS,
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
} from '../rule-generator.js';

test('parses any number of switch pages without storing story values', () => {
    const pages = parsePages('喻生|谨慎克制\n喻黎|老城区生活\n旁观者|第三视角');
    assert.deepEqual(pages.map(page => page.id), ['View1', 'View2', 'View3']);
    assert.deepEqual(pages.map(page => page.label), ['喻生', '喻黎', '旁观者']);
});

test('registers genuinely different component structures and composable palettes', () => {
    assert.equal(STATUS_STRUCTURE_PRESETS.length, 10);
    assert.equal(new Set(STATUS_STRUCTURE_PRESETS.map(item => item.id)).size, 10);
    assert.equal(STATUS_PALETTE_PRESETS.length, 24);
    assert.equal(new Set(STATUS_PALETTE_PRESETS.map(item => item.id)).size, 24);
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
    assert.match(STATUS_THEME_CSS, /data-structure="social"[^}]*[\s\S]*?data-field="post_body"/);
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
            avatarUrl: '/thumbnail?type=avatar&file=character.png',
            userAvatarUrl: '/thumbnail?type=persona&file=user.png',
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
    assert.equal(CHAT_APPEARANCE_PRESETS.length, 6);
    assert.deepEqual(CHAT_APPEARANCE_PRESETS.map(item => item.id), [
        'kitty-pink', 'meow-mono', 'cloud-blue', 'notepad-pink', 'lace-ivory', 'velvet-wine',
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
    assert.deepEqual(entry.key, []);
    assert.match(entry.content, /<zeya_status_classical_rules>/);
    assert.match(entry.content, /所有值都必须根据当前剧情动态生成/);
    assert.equal(Object.hasOwn(entry, 'affection'), false);
});

test('registers 20 distinct editable mobile themes with unique codes and ids', () => {
    assert.equal(STATUS_STYLE_PRESETS.length, 20);
    assert.equal(new Set(STATUS_STYLE_PRESETS.map(style => style.code)).size, 20);
    assert.equal(new Set(STATUS_STYLE_PRESETS.map(style => style.id)).size, 20);
    assert.deepEqual(STATUS_STYLE_PRESETS.map(style => style.code), Array.from({ length: 20 }, (_, index) => String(index + 1).padStart(2, '0')));
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
    assert.equal(STATUS_STYLE_PRESETS.length, 20);
    for (const style of STATUS_STYLE_PRESETS.filter(item => item.id !== 'classical')) {
        assert.match(STATUS_THEME_CSS, new RegExp(`data-theme="${style.id}"`), `${style.code} ${style.name} has dedicated CSS`);
    }
});

import { resolveStoryScene } from '../status-beauty-35-41.js';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
    STATUS_BEAUTY_32_41_IDS,
    STATUS_BEAUTY_32_41_PRESETS,
    buildStatusBeauty32To41Preview,
    buildStatusBeauty32To41Replacement,
    isStatusBeauty32To41,
} from '../status-beauty-32-41.js';
import { buildAiInstruction, parseStatusOutput, buildRegexScript, normalizeRule } from '../rule-generator.js';

const css = (await readFile(new URL('../status-beauty-32-41.css', import.meta.url), 'utf8')).replace(/\s+/g, '').replace(/;}/g, '}');

function normalizedRule(preset) {
    return normalizeRule({
        structure: preset.id,
        title: preset.title,
        subtitle: preset.subtitle,
        pagesText: preset.pagesText,
        pageFieldsText: preset.fields.map(item => item.join('|')).join('\n'),
        displayOnlyRegex: true,
        media: { avatarUrl: '', imageAlt: '当前角色头像', ensembleAvatarUrls: [] },
    });
}

const sample = [
    '第二年 · 初夏 · 22:40',
    '旧港北侧的临海旅店，窗外正在下很长的雨',
    '海风三级，潮湿而微凉',
    '重新检查了所有窗锁，又把湿透的外套挂到门边',
    '天亮前整理完这封始终没有寄出的信',
    '暂时同行，沉默里的默契正在缓慢变深',
    '疲惫、警觉，又有一点舍不得',
    '如果明天真的放晴，我也许会问他愿不愿意继续同行。',
];

test('adds candidates 32 through 41 without replacing the retained batch', () => {
    assert.equal(STATUS_BEAUTY_32_41_PRESETS.length, 10);
    assert.equal(new Set(STATUS_BEAUTY_32_41_IDS).size, 10);
    assert.deepEqual(STATUS_BEAUTY_32_41_PRESETS.map(item => Number(item.name.slice(0, 2))), [32, 33, 34, 35, 36, 37, 38, 39, 40, 41]);
    for (const preset of STATUS_BEAUTY_32_41_PRESETS) {
        assert.equal(isStatusBeauty32To41(preset.id), true);
        assert.ok(preset.fields.length >= 5, preset.id);
        assert.equal(new Set(preset.fields.map(item => item[3])).size, preset.fields.length, preset.id);
    }
});

test('each candidate has a genuinely distinct layout and interaction contract', () => {
    assert.equal(new Set(STATUS_BEAUTY_32_41_PRESETS.map(item => item.layout)).size, 10);
    assert.equal(new Set(STATUS_BEAUTY_32_41_PRESETS.map(item => item.interaction)).size, 10);
    assert.equal(new Set(STATUS_BEAUTY_32_41_PRESETS.map(item => item.palette.join(':'))).size, 10);
    assert.equal(new Set(STATUS_BEAUTY_32_41_PRESETS.map(item => `${item.font}:${item.motif}`)).size, 10);
});

test('all generated regexes retain AI output placement and complete executable HTML', () => {
    for (const preset of STATUS_BEAUTY_32_41_PRESETS) {
        const rule = normalizedRule(preset);
        const script = buildRegexScript(rule);
        assert.deepEqual(script.placement, [2], preset.id);
        assert.equal(script.markdownOnly, true, preset.id);
        assert.equal(script.disabled, false, preset.id);
        assert.doesNotThrow(() => new RegExp(script.findRegex.slice(1, script.findRegex.lastIndexOf('/')), script.findRegex.slice(script.findRegex.lastIndexOf('/') + 1)), preset.id);
        assert.match(script.findRegex, /status/i, preset.id);
        assert.match(script.replaceString, /^```html\n<!doctype html>/, preset.id);
        assert.match(script.replaceString, /<body class="sa32-page">/, preset.id);
        assert.match(script.replaceString, /ResizeObserver/, preset.id);
        assert.match(script.replaceString, /status-atelier:resize/, preset.id);
        assert.match(script.replaceString, /<\/body><\/html>\n```$/, preset.id);
    }
});

test('every field remains bound to a label and a real source value', () => {
    for (const preset of STATUS_BEAUTY_32_41_PRESETS.filter(item => item.contract !== 'ensemble')) {
        const output = buildStatusBeauty32To41Replacement(normalizedRule(preset));
        for (let index = 0; index < preset.fields.length; index += 1) {
            assert.match(output, new RegExp(`data-label="${index}"|data-label-copy="${index}"`), `${preset.id} label ${index}`);
            assert.match(output, new RegExp(`data-value="${index}"`), `${preset.id} value ${index}`);
        }
    }
});

test('the multi-person candidate keeps three independent pages and inner voices', () => {
    const preset = STATUS_BEAUTY_32_41_PRESETS.find(item => item.contract === 'ensemble');
    const rule = normalizedRule(preset);
    rule.media.ensembleAvatarUrls = ['', '', ''];
    const preview = buildStatusBeauty32To41Preview(rule, [
        ['林赛', '站在门边', '摩挲袖口', '仍在观察两个人', '只要他们再问一次，我就留下。'],
        ['艾登', '装得很轻松', '整理信件', '努力维持气氛', '为什么先开口的人不能是我。'],
        ['米娅', '靠窗看雨', '画下一条线', '暂时不拆穿他们', '他们把最简单的话藏得太深。'],
    ]);
    for (const text of ['林赛', '艾登', '米娅', '只要他们再问一次，我就留下。', '为什么先开口的人不能是我。', '他们把最简单的话藏得太深。']) assert.ok(preview.includes(text));
    assert.match(preview, /pocket-people/);
    assert.match(preview, /data-person-next/);
});

test('interaction controls exist for all ten candidates', () => {
    const expected = [
        'data-drawer=', 'data-focus-next', 'data-drawer-panel=', 'pocket-people', 'pocket-people',
        'data-person-next', 'pocket-people', 'pocket-people', 'pocket-people', 'data-window-scene=',
    ];
    STATUS_BEAUTY_32_41_PRESETS.forEach((preset, index) => {
        const preview = buildStatusBeauty32To41Preview(normalizedRule(preset), preset.contract === 'ensemble' ? [] : sample);
        assert.match(preview, new RegExp(expected[index]), preset.id);
    });
});

test('mobile rules use natural height and readable wrapping for every design', () => {
    assert.match(css, /@media\(max-width:600px\)/);
    assert.match(css, /html,body\{height:auto;min-height:0;overflow:visible\}/);
    assert.match(css, /\.sa32-card\{width:100%;min-height:0/);
    assert.match(css, /overflow-wrap:anywhere/);
    assert.match(css, /font-size:clamp\(13px,3\.9vw,16px\)/);
    assert.doesNotMatch(css, /@media\(max-width:600px\)[\s\S]*\.sa32-card\{[^}]*height:\d+px/);
    for (const id of STATUS_BEAUTY_32_41_IDS) assert.match(css, new RegExp(`\\.${id}\\{`), id);
});


for (const layout of ['radar', 'drawers', 'lunar', 'ticket', 'telegraph', 'perfume', 'vinyl', 'train']) test(`${layout} follows the current roster with one or three independent people`, () => {
    const rule = normalizedRule(STATUS_BEAUTY_32_41_PRESETS.find(item => item.layout === layout));
    for (const count of [1, 3]) {
        const records = Array.from({ length: count }, (_, index) => `[View${index + 1}|夜晚|港口|灯塔|同行|46|发现${index}|风险${index}|心声${index}|人物${index}]`).join('\n');
        const parsed = parseStatusOutput(rule, records);
        assert.equal(parsed.pages.length, count);
        parsed.pages.forEach(({ page, values }, index) => {
            assert.equal(page.label, `人物${index}`);
            assert.equal(values[7], `心声${index}`);
        });
        const html = buildStatusBeauty32To41Preview(rule, parsed.pages.map(({ page, values }) => [...values, page.label]));
        assert.ok(html.includes(`心声${count - 1}|人物${count - 1}]`));
    }
    assert.match(buildAiInstruction(rule), /人物进入或离开/);
});


test('compact people count and values survive preview generation beyond configured pages', () => {
    for (const preset of STATUS_BEAUTY_32_41_PRESETS.filter(item => item.compact)) {
        const rule = normalizedRule(preset);
        for (const count of [1, 4]) {
            const rows = Array.from({length: count}, (_, person) =>
                [...preset.fields.map((_, index) => `人物${person}字段${index}`), `人物${person}`]);
            const raw = rows.map((row,index) => `[View${index + 1}|${row.join('|')}]`).join('\n');
            const parsed = parseStatusOutput(rule, raw);
            assert.equal(parsed.pages.length, count, preset.id);
            const html = buildStatusBeauty32To41Preview(rule, rows);
            assert.ok(html.includes(`[View${count}|${rows[count - 1].join('|')}]`), preset.id);
            assert.doesNotThrow(() => new Function(html.match(/<script>([\s\S]*?)<\/script>/)[1]), preset.id);
        }
    }
});

// Reading status should not require opening a second or third content level.
test('35 through 41 expose every status field without nested disclosure controls', () => {
    for (const preset of STATUS_BEAUTY_32_41_PRESETS.filter(p => p.compact)) {
        const markup = buildStatusBeauty32To41Preview(normalizedRule(preset), sample).split('<script>')[0];
        assert.doesNotMatch(markup, /<details|data-pocket-tab|data-pocket-panel|data-dial|data-reveal/, preset.id);
        preset.fields.forEach((_, index) => assert.match(markup, new RegExp(`data-value="${index}"`), preset.id));
        assert.match(markup, /aria-expanded="true"/, preset.id);
    }
});

test('train resolves narrative time across Chinese periods and clock formats', () => {
    for (const [time, scene] of [['22:40','night'],['清晨六点','dawn'],['下午三点','day'],['晚上八点','night'],['凌晨十二点','night'],['傍晚','dusk'],['18：30','dusk'],['上午十一点','day'],['午后','day'],['未明确',null]]) assert.equal(resolveStoryScene(time), scene, time);
});

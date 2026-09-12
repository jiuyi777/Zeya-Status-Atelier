import test from 'node:test';
import assert from 'node:assert/strict';
import { Script } from 'node:vm';
import { BUNDLED_HOME_TEMPLATES } from '../opening-bundled-themes.js';
import { buildOpeningHomeRegex, normalizeOpeningHomeSettings } from '../opening-home-generator.js';
import { homeSwipeIndex, returnToOpeningHome } from '../opening-return-navigation.js';

for (const theme of BUNDLED_HOME_TEMPLATES) test(`${theme.name}: production layout keeps actual targets and worldbook binding`, async () => {
    const data = { ...theme.values, title: '用户作品', intro: '真实背景', entries: [{ title: '第四条', summary: '真实摘要', target: 4, worldlineId: 'route-a' }], worldlines: [{ id: 'route-a', name: '甲线', description: '线路说明', entries: [{ book: '故事', uid: 7 }] }] };
    const regex = buildOpeningHomeRegex(data);
    assert.match(regex.replaceString, /^```html\n<!DOCTYPE html>/);
    assert.match(regex.replaceString, /<body>[\s\S]*<\/body>[\s\S]*<\/html>\n```$/);
    assert.match(regex.replaceString, /用户作品/);
    assert.match(regex.replaceString, /线路说明/);
    assert.equal((regex.replaceString.match(/class="zoh-jump"/g) || []).length, 1);
    assert.equal((regex.replaceString.match(/<article class="zoh-entry /g) || []).length, 1);
    const calls = [], bookCalls = [];
    let click;
    const button = { addEventListener: (_type, fn) => { click = fn; } };
    const article = { querySelector: () => button, prepend() {} };
    const notice = { textContent: '' };
    const root = { classList: { contains: () => true }, querySelector: selector => selector === '.zoh-list' ? { querySelectorAll: () => [article] } : notice };
    const parent = { SillyTavern: { getContext: () => ({ chat: [{ swipe_id: 0 }] }) }, toastr: { success() {}, error() {} }, document: { querySelector: () => null } };
    const scripts = [...regex.replaceString.matchAll(/<script>([\s\S]*?)<\/script>/g)];
    assert.equal(scripts.length, 1);
    new Script(scripts[0][1]).runInNewContext({ document: { querySelector: () => root, currentScript: {} }, window: { parent }, console,
        getChatMessages: async () => [{ swipes: ['【主页】', '一', '二', '三'] }],
        setChatMessages: async rows => calls.push(JSON.parse(JSON.stringify(rows))),
        updateWorldbookWith: async (book, update) => bookCalls.push({ book, entries: update([{ uid: 7, enabled: false }, { uid: 8, enabled: false }]) }),
    });
    await click();
    assert.deepEqual(calls, [[{ message_id: 0, swipe_id: 3 }]]);
    assert.equal(bookCalls[0].book, '故事');
    assert.equal(bookCalls[0].entries[0].enabled, true);
    assert.equal(bookCalls[0].entries[1].enabled, false);
});

test('extra font selections survive production normalization', () => {
    for (const font of ['fangsong', 'rounded', 'clerical']) assert.equal(normalizeOpeningHomeSettings({ font }).font, font);
});

test('return finds a reordered unique homepage and never replaces greeting text', async () => {
    const ctx = { chat: [{ swipes: ['正文', '另一篇', '【主页】'], swipe_id: 0 }] };
    const before = JSON.stringify(ctx);
    let write;
    await returnToOpeningHome(ctx, {}, { setChatMessages: async (...args) => { write = args; } });
    assert.deepEqual(write, [[{ message_id: 0, swipe_id: 2 }], { refresh: 'affected' }]);
    assert.equal(JSON.stringify(ctx), before);
    assert.equal(homeSwipeIndex(['【主页】', '【主页】']), -1);
    await assert.rejects(returnToOpeningHome({ chat: [{ swipes: ['正文'] }] }, {}, {}), /唯一主页/);
});

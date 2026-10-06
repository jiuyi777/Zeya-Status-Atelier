import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { buildOpeningHomeRegexPack } from '../opening-home-generator.js';
import { buildOpeningReturnRegex } from '../opening-return-navigation.js';

async function loadReturn(row, floor = 0, fail = false, frame = null) {
    const button = { hidden: true, addEventListener(_, fn) { this.click = fn; } };
    const note = { hidden: true };
    const writes = [];
    const script = buildOpeningReturnRegex().replaceString.match(/<script>([\s\S]*?)<\/script>/)[1];
    await vm.runInNewContext(script, {
        document: { body: { scrollHeight: 64 }, getElementById: id => id.endsWith('-note') ? note : button },
        ...(frame ? { window: { frameElement: frame } } : {}),
        getCurrentMessageId: () => floor,
        getChatMessages: async () => [row],
        setChatMessages: async (items, options) => {
            if (fail) throw new Error('保存失败');
            writes.push(JSON.parse(JSON.stringify({items, options})));
            row.swipe_id = items[0].swipe_id;
        },
        // No workshop plugin, parent document, or plugin settings. Only the owned iframe is optional.
    });
    return {button, note, writes};
}

test('serialized export appends one return document after the complete opening text', () => {
    const pack = JSON.parse(JSON.stringify(buildOpeningHomeRegexPack()));
    assert.equal(pack.length, 2);
    assert.notEqual(pack[0].id, pack[1].id);
    const [_, source, flags] = pack[1].findRegex.match(/^\/(.*)\/([a-z]*)$/);
    const pattern = new RegExp(source, flags);
    for (const home of ['【主页】', ' \r\n【主页】\n', '']) {
        assert.equal(home.replace(pattern, pack[1].replaceString), home);
    }
    for (const original of [
        '这是原来的正文。\n```html\n<body>已有前端</body>\n```',
        '保留 $1、$&、$$ 与 $<name>。\r\n\r\n落款\r\n',
        '长文段落。\n\n'.repeat(40000) + '正文最后一句。',
    ]) {
        const result = original.replace(pattern, pack[1].replaceString);
        assert.equal(result.slice(0, original.length), original);
        const footer = result.slice(original.length);
        assert.match(footer, /^\n\n```html\n<!DOCTYPE html>/);
        assert.match(footer, /<body>[\s\S]*<\/body><\/html>\n```\n?$/);
        assert.equal((footer.match(/id="sta-opening-return"/g) || []).length, 1);
    }
    assert.equal(pack[1].markdownOnly, true);
    assert.deepEqual(pack[1].placement, [2]);
});

test('the ordered home and return rules never append an empty return frame to a generated homepage', () => {
    for (const theme of ['classic', 'pixel-dusk', 'soft-clock', 'bloom-letter', 'dossier']) {
        const [home, back] = JSON.parse(JSON.stringify(buildOpeningHomeRegexPack({ theme })));
        const pattern = rule => { const [, source, flags] = rule.findRegex.match(/^\/(.*)\/([a-z]*)$/); return new RegExp(source, flags); };
        const renderedHome = '【主页】'.replace(pattern(home), home.replaceString);
        assert.equal(renderedHome.replace(pattern(back), back.replaceString), renderedHome, theme);
    }
});

test('an inapplicable return control collapses its own host frame instead of leaving the default 150px box', async () => {
    for (const [row, floor] of [
        [{ swipe_id: 0, swipes: ['【主页】', '正文'] }, 0],
        [{ swipe_id: 0, swipes: ['独立开场白'] }, 0],
        [{ swipe_id: 1, swipes: ['【主页】', '正文'] }, 2],
    ]) {
        const frame = { hidden: false, style: { height: '150px' } };
        await loadReturn(row, floor, false, frame);
        assert.equal(frame.hidden, true);
        assert.equal(frame.style.display, 'none');
        assert.equal(frame.style.height, '0px');
    }
    const frame = { hidden: false, style: { height: '150px' } };
    const ready = await loadReturn({ swipe_id: 1, swipes: ['【主页】', '正文'] }, 0, false, frame);
    assert.equal(ready.button.hidden, false);
    assert.equal(frame.hidden, false);
    assert.equal(frame.style.display, 'block');
    assert.equal(frame.style.height, '64px');
    await ready.button.click();
    assert.equal(ready.writes.length, 1);
});

test('recipient without workshop can return, including after reopening on a non-home swipe', async () => {
    const row = { swipe_id: 0, swipes: ['正文 A', '正文 B', '【主页】'] };
    const original = [...row.swipes];
    const first = await loadReturn(row);
    assert.equal(first.button.hidden, false);
    await first.button.click();
    assert.equal(row.swipe_id, 2);
    assert.deepEqual(row.swipes, original);
    assert.deepEqual(first.writes, [{ items: [{ message_id: 0, swipe_id: 2 }], options: { refresh: 'affected' } }]);
    row.swipe_id = 1;
    const reopened = await loadReturn(JSON.parse(JSON.stringify(row)));
    assert.equal(reopened.button.hidden, false);
    await reopened.button.click();
    assert.equal(reopened.writes.length, 1);
});

test('return rechecks reordered swipes, refuses ambiguous home and permits retry on save failure', async () => {
    const row = { swipe_id: 1, swipes: ['【主页】', '正文'] };
    const active = await loadReturn(row);
    row.swipes = ['正文', '第二篇', '【主页】'];
    await active.button.click();
    assert.equal(active.writes[0].items[0].swipe_id, 2);
    const failing = await loadReturn({ swipe_id: 1, swipes: ['【主页】', '正文'] }, 0, true);
    await failing.button.click();
    assert.equal(failing.button.disabled, false);
    assert.equal(failing.note.textContent, '保存失败');
    for (const candidate of [[], ['正文'], ['【主页】', '【主页】']]) {
        const hidden = await loadReturn({ swipe_id: 0, swipes: candidate });
        assert.equal(hidden.button.hidden, true);
        assert.equal(hidden.writes.length, 0);
    }
});

test('home and later conversation floors never show a return control or write messages', async () => {
    const row = { swipe_id: 0, swipes: ['【主页】', '正文'] };
    assert.equal((await loadReturn(row)).button.hidden, true);
    const later = await loadReturn({ ...row, swipe_id: 1 }, 3);
    assert.equal(later.button.hidden, true);
    assert.equal(later.writes.length, 0);
});

import test from 'node:test';
import assert from 'node:assert/strict';

import {
    greetingBindingSummary,
    keepOnlyOpenGreetingCard,
    mergeLocalGreetingEntries,
} from '../greeting-workflow.js';

test('opening one greeting card closes every sibling card', () => {
    const first = { open: true };
    const second = { open: true };
    const third = { open: false };

    keepOnlyOpenGreetingCard(second, [first, second, third]);

    assert.equal(first.open, false);
    assert.equal(second.open, true);
    assert.equal(third.open, false);
});

test('simple binding status hides UID details while advanced detail keeps real bindings', () => {
    const summary = greetingBindingSummary({
        name: '罪人线',
        entries: [
            { book: '谈论爱之生', uid: 2, title: '罪人线nsfw' },
            { book: '谈论爱之生', uid: 5, title: '罪人线（恶魔）' },
        ],
    });

    assert.equal(summary.text, '世界书已自动匹配（2 项）');
    assert.doesNotMatch(summary.text, /UID|谈论爱之生/);
    assert.match(summary.detail, /谈论爱之生 · UID 2/);
    assert.match(summary.detail, /谈论爱之生 · UID 5/);
});

test('local character-card read creates editable drafts without erasing written content', () => {
    const merged = mergeLocalGreetingEntries(
        [{ target: 2 }, { title: '角色卡注释标题', target: 4 }],
        [
            { title: '玩家已写标题', route: '旧识线', summary: '玩家已经写好的简介', target: 2, worldlineId: 'line-a' },
            { title: '旧标题', route: '支线', summary: '旧简介', target: 3, worldlineId: 'line-b' },
        ],
    );

    assert.deepEqual(merged[0], {
        number: '01',
        title: '玩家已写标题',
        route: '旧识线',
        summary: '玩家已经写好的简介',
        target: 2,
        worldlineId: 'line-a',
    });
    assert.equal(merged[1].title, '角色卡注释标题');
    assert.equal(merged[1].summary, '旧简介');
    assert.equal(merged[1].target, 4);
});

import test from 'node:test';
import assert from 'node:assert/strict';

import {
    greetingBindingSummary,
    keepOnlyOpenGreetingCard,
    mergeLocalGreetingEntries,
    planOpeningHomeCharacterUpdate,
    shouldReplaceCurrentChatGreeting,
    freshOpeningHomeForCharacter,
    switchOpeningHomeProfile,
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

test('one-click homepage preserves the original first message as an extra greeting', () => {
    const plan = planOpeningHomeCharacterUpdate('原来的第一条开场', ['少年线开场', '罪人线开场']);

    assert.equal(plan.marker, '【主页】');
    assert.equal(plan.movedPrimary, true);
    assert.deepEqual(plan.alternateGreetings, ['原来的第一条开场', '少年线开场', '罪人线开场']);
});

test('one-click homepage does not duplicate an existing greeting or marker', () => {
    const duplicate = planOpeningHomeCharacterUpdate('原开场', ['原开场', '支线']);
    const prepared = planOpeningHomeCharacterUpdate('【主页】', ['原开场', '支线']);

    assert.deepEqual(duplicate.alternateGreetings, ['原开场', '支线']);
    assert.equal(duplicate.movedPrimary, false);
    assert.equal(prepared.alreadyPrepared, true);
    assert.deepEqual(prepared.alternateGreetings, ['原开场', '支线']);
});

test('current chat greeting is only replaced when it still matches the character opening', () => {
    assert.equal(shouldReplaceCurrentChatGreeting({ mes: '原开场', is_user: false }, '原开场'), true);
    assert.equal(shouldReplaceCurrentChatGreeting({ mes: '玩家已经编辑过', is_user: false }, '原开场'), false);
    assert.equal(shouldReplaceCurrentChatGreeting({ mes: '原开场', is_user: true }, '原开场'), false);
});

test('a new character keeps reusable appearance but starts with no old story routes', () => {
    const fresh = freshOpeningHomeForCharacter(
        { title: '作品导航', subtitle: 'STORY HOME', intro: '默认简介', author: '九一', theme: 'classical', worldlines: [], entries: [] },
        { title: '旧卡标题', subtitle: 'OLD', intro: '旧卡简介', author: '九一', theme: 'newspaper', worldlines: [{ name: '罪人线' }], entries: [{ title: '旧开场' }] },
    );

    assert.equal(fresh.author, '九一');
    assert.equal(fresh.theme, 'newspaper');
    assert.equal(fresh.title, '');
    assert.equal(fresh.intro, '');
    assert.deepEqual(fresh.worldlines, []);
    assert.deepEqual(fresh.entries, []);
});

test('switching characters saves and restores independent opening-home profiles', () => {
    const first = switchOpeningHomeProfile({
        profiles: {},
        previousKey: 'character:card-a',
        nextKey: 'character:card-b',
        currentHome: { title: '卡A', intro: 'A简介', theme: 'classical', worldlines: [{ name: '少年线' }], entries: [] },
        defaultHome: { title: '', intro: '', theme: 'classical', worldlines: [], entries: [] },
    });
    const second = switchOpeningHomeProfile({
        profiles: first.profiles,
        previousKey: 'character:card-b',
        nextKey: 'character:card-a',
        currentHome: { ...first.home, title: '卡B', worldlines: [{ name: '神明线' }] },
        defaultHome: { title: '', intro: '', theme: 'classical', worldlines: [], entries: [] },
    });

    assert.equal(first.home.title, '');
    assert.deepEqual(first.home.worldlines, []);
    assert.equal(second.home.title, '卡A');
    assert.deepEqual(second.home.worldlines, [{ name: '少年线' }]);
    assert.deepEqual(second.profiles['character:card-b'].worldlines, [{ name: '神明线' }]);
});

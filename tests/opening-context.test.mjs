import test from 'node:test';
import assert from 'node:assert/strict';
import {
    buildCharacterHomepageContext,
    describeCurrentCharacterContext,
    resolveCurrentCharacterContext,
    selectCurrentSillyTavernContext,
} from '../opening-context.js';

test('prefers the host context that actually contains the selected single character', () => {
    const incompleteExposedContext = { characterId: undefined, groupId: null, characters: [] };
    const importedExtensionContext = {
        characterId: '2',
        groupId: null,
        characters: [{ name: '甲' }, { name: '乙' }, { name: '温瑟', chat: '温瑟 - 2026-08-31' }],
    };
    assert.equal(selectCurrentSillyTavernContext([incompleteExposedContext, importedExtensionContext]), importedExtensionContext);
});

test('recovers a temporarily missing character id from the current chat id', () => {
    const context = {
        characterId: undefined,
        groupId: null,
        chatId: '温瑟 - 2026-08-31',
        characters: [{ name: '温瑟', chat: '温瑟 - 2026-08-31' }, { name: '阿青', chat: '阿青 - 2026-08-31' }],
    };
    const resolved = resolveCurrentCharacterContext(context);
    assert.equal(resolved.state, 'character');
    assert.equal(resolved.characterId, 0);
    assert.equal(resolved.character.name, '温瑟');
    assert.equal(resolved.context.characterId, 0);
});

test('simple mode describes the resolved character instead of showing the unopened-chat placeholder', () => {
    const context = {
        characterId: undefined,
        chatId: '温瑟 - 2026-08-31',
        characters: [{ name: '温瑟', chat: '温瑟 - 2026-08-31' }],
    };
    assert.equal(
        describeCurrentCharacterContext(context),
        '已定位当前角色“温瑟”。点击按钮后将读取角色卡、当前剧情与启用世界书。',
    );
    assert.equal(describeCurrentCharacterContext(null), '酒馆聊天尚未载入完成，请稍候。');
    assert.equal(
        describeCurrentCharacterContext({ characterId: undefined, characters: [] }),
        '当前没有定位到单人角色聊天，请先打开一个角色。',
    );
});

test('homepage context includes real character and worldbook background without inventing fields', () => {
    const context = buildCharacterHomepageContext({
        name: '温瑟',
        data: {
            name: '温瑟',
            description: '灰烬议会的嫌疑人。',
            personality: '克制而敏锐。',
            scenario: '蒸汽都市正在调查码头命案。',
            first_mes: '雨夜，他带着酒回到住处。',
        },
    }, [{
        name: '城市设定',
        data: { entries: [{ comment: '灰烬议会', content: '控制下城区情报网络的秘密组织。' }] },
    }]);
    for (const value of ['温瑟', '灰烬议会的嫌疑人', '蒸汽都市', '雨夜，他带着酒', '城市设定 · 灰烬议会', '秘密组织']) {
        assert.match(context, new RegExp(value));
    }
    assert.doesNotMatch(context, /undefined|null/);
});

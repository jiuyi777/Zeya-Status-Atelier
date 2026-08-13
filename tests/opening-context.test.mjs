import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCharacterHomepageContext } from '../opening-context.js';

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

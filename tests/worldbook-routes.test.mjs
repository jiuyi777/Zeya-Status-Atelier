import test from 'node:test';
import assert from 'node:assert/strict';

import {
    canonicalWorldbookRouteLabel,
    constrainRouteToCatalog,
    extractWorldbookRouteCatalog,
    routeCatalogPrompt,
    worldbookRouteLabels,
} from '../worldbook-routes.js';

test('extracts canonical route labels from actual worldbook entry titles', () => {
    const catalog = extractWorldbookRouteCatalog([{
        name: '谈论爱之生',
        entries: [
            { id: 2, comment: '罪人线nsfw', content: '密室与地牢设定' },
            { id: 5, comment: '罪人线（恶魔）', content: '被教会捕获的魔族' },
            { id: 3, comment: '少年线nsfw', content: '坐在腿上读经' },
            { id: 7, comment: '少年线（邪灵）', content: '伪装成少年' },
            { id: 10, comment: '神明线（着调派）', content: '奥米加的后裔' },
            { id: 11, comment: '状态栏', content: '不是线路条目' },
        ],
    }]);
    assert.deepEqual(worldbookRouteLabels(catalog), ['罪人线', '少年线', '神明线']);
    assert.equal(catalog[0].variants.length, 2);
    assert.match(routeCatalogPrompt(catalog), /route 必须逐字选择/);
    assert.match(routeCatalogPrompt(catalog), /【罪人线】/);
});

test('constrains model route output to names that came from the worldbook', () => {
    const catalog = extractWorldbookRouteCatalog([{ name: '路线书', entries: [{ uid: 2, comment: '罪人线（恶魔）' }, { uid: 3, comment: '少年线nsfw' }] }]);
    assert.equal(canonicalWorldbookRouteLabel('罪人线（恶魔）'), '罪人线');
    assert.equal(constrainRouteToCatalog('罪人线路', catalog), '罪人线');
    assert.equal(constrainRouteToCatalog('密室救赎线', catalog), '');
    assert.equal(constrainRouteToCatalog('任意线', []), '未分类线');
});

test('works generically across cards, naming conventions and multiple linked books', () => {
    const catalog = extractWorldbookRouteCatalog([
        { name: '校园设定', data: { entries: { 1: { uid: 1, comment: '青梅竹马路线', content: '从小一起长大的同学' } } } },
        { name: '都市设定', entries: [{ uid: 9, name: '线路：职场宿敌', content: '竞争同一个晋升机会' }, { uid: 10, keys: ['route: 旧案追查'], content: '调查多年悬案' }] },
    ]);
    assert.deepEqual(worldbookRouteLabels(catalog), ['青梅竹马线', '职场宿敌线', '旧案追查线']);
    assert.equal(constrainRouteToCatalog('职场宿敌线路', catalog), '职场宿敌线');
    assert.match(routeCatalogPrompt(catalog), /校园设定|青梅竹马路线/);
});

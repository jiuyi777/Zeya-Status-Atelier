import test from 'node:test';
import assert from 'node:assert/strict';

import {
    canonicalWorldbookRouteLabel,
    constrainRouteToCatalog,
    extractWorldbookRouteCatalog,
    routeCatalogPrompt,
    syncRouteCatalogWorldlines,
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

test('renames an existing generic line by overlapping UID and creates the remaining route bindings', () => {
    const catalog = extractWorldbookRouteCatalog([{ name: '谈论爱之生', entries: [
        { uid: 2, comment: '罪人线nsfw' },
        { uid: 5, comment: '罪人线（恶魔）' },
        { uid: 3, comment: '少年线nsfw' },
        { uid: 10, comment: '神明线（着调派）' },
    ] }]);
    const worldlines = [{ id: 'old-line-1', name: '世界线 1', description: '保留说明', entries: [{ book: '谈论爱之生', uid: 2, title: '罪人线nsfw' }] }];
    const ids = syncRouteCatalogWorldlines(worldlines, catalog);
    assert.equal(worldlines.find(line => line.id === 'old-line-1').name, '罪人线');
    assert.equal(worldlines.find(line => line.id === 'old-line-1').description, '保留说明');
    assert.deepEqual(worldlines.find(line => line.name === '罪人线').entries.map(item => item.uid), [2, 5]);
    assert.equal(ids['罪人线'], 'old-line-1');
    assert.ok(worldlines.find(line => line.name === '少年线').entries.some(item => item.uid === 3));
    assert.ok(worldlines.find(line => line.name === '神明线').entries.some(item => item.uid === 10));
});

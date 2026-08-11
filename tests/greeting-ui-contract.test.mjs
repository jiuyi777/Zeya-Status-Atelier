import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../index.js', import.meta.url), 'utf8');
const settingsMarkup = fs.readFileSync(new URL('../settings.html', import.meta.url), 'utf8');

test('greeting modal exposes explicit fill-missing and regenerate-all actions', () => {
    assert.match(source, /id="status-atelier-read-current-card">补全缺失项</);
    assert.match(source, /id="status-atelier-regenerate-all">全部重新生成</);
    assert.match(source, /readGreetingsIntoOpeningHome\(\{ overwrite \}\)/);
});

test('opening the greeting modal does not automatically call the model', () => {
    const block = source.match(/function openGreetingModal\(\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(block, /renderGreetingList\(\)/);
    assert.doesNotMatch(block, /refreshGreetingModal/);
});

test('greeting editor keeps title, route and summary as separate editable fields', () => {
    assert.match(source, /线路标签（从角色卡世界书读取，如：罪人线）/);
    assert.match(source, /路线简介（1句话，谁在做什么、发生了什么）/);
    assert.match(source, /target\.route = routeField\.input\.value/);
});

test('AI routes are constrained by the current character worldbook catalog', () => {
    assert.match(source, /currentWorldbookRouteCatalog\(\)/);
    assert.match(source, /route 只能逐字选择上面世界书中已经存在的线路名/);
    assert.doesNotMatch(source, /不得重复这些已使用线路标签/);
});

test('worldbook route prefixes create UID bindings and connect each opening', () => {
    assert.match(source, /syncWorldbookRouteBindings\(routeCatalog\)/);
    assert.match(source, /routeWorldlineIds\?\.\[generated\[index\]\.route\]/);
    assert.match(source, /查看\/调整绑定 UID/);
    assert.match(source, /已自动绑定/);
});

test('regenerate all preserves written work intro and only fills missing homepage fields', () => {
    assert.match(source, /const makeHomepage = Boolean\(homepageFields\.length\)/);
    assert.match(source, /if \(batch\.workIntro && needsGeneratedWorkIntro\(\)\)/);
    assert.doesNotMatch(source, /overwrite \|\| needsGeneratedWorkIntro\(\)/);
});

test('home templates apply complete and visibly distinct visual settings', () => {
    assert.match(source, /Object\.assign\(settings\(\)\.openingHome, template\.values\)/);
    const backgrounds = [...source.matchAll(/values: \{ theme: '[^']+', font: '[^']+', background: '(#[0-9a-f]+)'/gi)].map(match => match[1]);
    assert.equal(backgrounds.length, 4);
    assert.equal(new Set(backgrounds).size, 4);
});

test('long mobile opening editors are collapsed independently', () => {
    assert.equal((settingsMarkup.match(/status-atelier-collapsible/g) || []).length, 3);
    for (const label of ['作品固定资料', '世界线介绍（可选）', '额外问候语目录']) {
        assert.match(settingsMarkup, new RegExp(`<summary[^>]*>[\\s\\S]*?${label}[\\s\\S]*?<\\/summary>`));
    }
});

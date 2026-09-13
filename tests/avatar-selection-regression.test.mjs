import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import * as single from '../status-ai-single.js';
import { normalizeRule } from '../rule-generator.js';

const source = readFileSync(new URL('../index.js', import.meta.url), 'utf8');
const candidates = Array.from({ length: 41 }, (_, i) => ({ key: `profile:${i + 1}`, name: `${i + 1} · 款式${i + 1}`, description: `构图${i + 1}`, input: { structure: 'profile' } }));

test('avatar editor resolves character source instead of showing the saved custom URL', () => {
    const start=source.indexOf('function updateStatusAvatarEditorPreview(');
    assert.notEqual(start,-1);
    const image={hidden:false,removeAttribute(name){delete this[name];}};
    const box={settings:()=>({media:{avatarUrl:'old.png'}}),resolvedStatusInput:input=>({media:{avatarUrl:input.media.avatarSource==='character'?'/characters/current.png':input.media.avatarSource==='none'?'':input.media.avatarUrl}})};
    vm.runInNewContext(source.slice(start,source.indexOf('\nfunction ',start+1)),box);
    box.updateStatusAvatarEditorPreview(image,'character','old.png');
    assert.equal(image.src,'/characters/current.png');
    box.updateStatusAvatarEditorPreview(image,'none','old.png');
    assert.equal(image.hidden,true);assert.equal(image.src,undefined);
});

test('AI catalog includes visual descriptions, including the last candidate', () => {
    const catalog = single.singleStatusCatalog(candidates);
    assert.equal(catalog[40].description, '构图41');
});
test('recent designs are excluded while all later candidates remain eligible', () => {
    assert.equal(typeof single.selectStatusCandidates, 'function');
    const recent = candidates.slice(0, 5).map(c => c.key);
    const result = single.selectStatusCandidates(candidates, { recent, current: candidates[5].key, random: () => 0 });
    assert.equal(result.length, 35);
    assert(result.every(c => ![...recent, candidates[5].key].includes(c.key)));
    assert(result.some(c => c.key === 'profile:41'));
    assert.notEqual(result[0].key, 'profile:7');
    assert.equal(candidates[0].key, 'profile:1');
});
test('an explicitly named design is available even when recently used', () => {
    assert.equal(typeof single.selectStatusCandidates, 'function');
    const named = { ...candidates[0], name: '01 · 绛幕雪信' };
    assert.deepEqual(single.selectStatusCandidates([named, ...candidates.slice(1)], { recent: [named.key], idea: '这次使用绛幕雪信' }), [named]);
    assert.equal(single.selectStatusCandidates([named], { recent: [named.key] }).length, 1);
});
test('AI preview keeps generated values but resolves the newly selected avatar', () => {
    const oldRule = normalizeRule({ structure: 'moon-collage', media: { avatarSource: 'url', avatarUrl: 'https://example.com/old.png' } });
    const newInput = { structure: 'moon-collage', media: { avatarSource: 'character', avatarUrl: '/characters/new.png' } };
    let rendered;
    const box = { document: { querySelector: () => ({}) }, resolvedStatusInput: () => newInput,
        settings: () => ({ structure: 'profile' }), statusAiTestRecords: { rule: oldRule, pages: [{ values: ['剧情值'] }] },
        normalizeRule, makePreviewRecords: () => { throw Error('Must preserve generated records'); },
        isStatusBeauty01To15: () => true, isStatusBeauty05To09: () => false, isStatusBeauty16To20: () => false, isStatusBeauty32To41: () => false,
        renderStatusBeautyBundledPreview: (host, rule, values) => { rendered = { rule, values }; }, DEFAULT_CHARACTER_PORTRAIT_URL: 'sample.png' };
    const start=source.indexOf('function renderStatusPreview(');
    const end=source.indexOf('\nfunction ',start+1);
    vm.runInNewContext(source.slice(start,end), box);
    box.renderStatusPreview({ closest: () => null });
    assert.equal(rendered.rule.media.avatarUrl, '/characters/new.png');
    assert.deepEqual(rendered.values, ['剧情值']);
});
test('bundled preview applies the same media pipeline as export', async () => {
    let result;
    const frame={isConnected:true,setAttribute(){},set srcdoc(value){result=value;}};
    const identity=x=>x;
    const box={ statusBeautyBundlePreviewRequests:new WeakMap(),makeElement:()=>frame,statusBeautyBundleMeta:()=>({lines:[]}),
        mountStatusBeautyPreview(){}, loadStatusBeautyBundledRegex:async()=>({replaceString:'sample portrait'}),
        applyStatusBeautyFieldLayout:identity,applyStatusBeautyTitle:identity,applyStatusBeautyMobileLayout:identity,applyStatusBeautyMobileTypography:identity,
        applyStatusBeautyMediaSettings:(script,media)=>({...script,replaceString:media.avatarUrl}),buildStatusBeautyBundledPreviewDocument:script=>script.replaceString };
    const start=source.indexOf('function renderStatusBeautyBundledPreview('),end=source.indexOf('\nfunction renderStatusPreview(',start);
    vm.runInNewContext(source.slice(start,end),box);
    box.renderStatusBeautyBundledPreview({}, {structure:'moon-collage',media:{avatarUrl:'/characters/current.png'}});
    await Promise.resolve(); await Promise.resolve();
    assert.equal(result,'/characters/current.png');
});

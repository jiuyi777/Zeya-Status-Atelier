import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { parseSingleStatusResult, singleStatusCatalog } from '../status-ai-single.js';
import { normalizeRule, parseFields, STATUS_STRUCTURE_PRESETS } from '../rule-generator.js';
import { responseText, generationErrorMessage, resolveStatusIdeaIntent, applyStatusIdeaFocus, statusRecommendationKey } from '../response-parser.js';
import { STATUS_BEAUTY_01_15_IDS } from '../status-beauty-01-15-bundle.js';
import { STATUS_BEAUTY_16_20_IDS } from '../status-beauty-16-20.js';

const source = readFileSync(new URL('../index.js', import.meta.url), 'utf8');
const runner = source.slice(source.indexOf('function isEmptyGenerationFailure('), source.indexOf('function externalApiBases('));
const input = { structure: 'chat', pagesText: '聊天|当前对话' };
const candidate = { key: 'chat', name: '聊天', input, content: {}, recommendation: { structure: 'chat', profileAppearance: '' } };
const schema = singleStatusCatalog([candidate])[0];
const valid = JSON.stringify({ candidate: 'chat', reason: '当前对话', shared: schema.shared.map(() => '共享信息'), pages: schema.pages.map(page => ({ id: page.id, values: page.fields.map(() => '角色状态') })), phoneApps: [] });

function harness(reply, quietOnly = false, selected = candidate) {
    const calls = { raw: 0, quiet: 0, applied: 0 };
    const node = () => ({ textContent: '', dataset: {}, hidden: false, disabled: false });
    const status = node();
    const stored = { structure: selected.recommendation.structure, statusRecentRecommendations: [],
        phoneDesktop: normalizeRule(selected.input).phoneDesktop };
    const run = async key => { calls[key]++; if (reply instanceof Error) throw reply; return typeof reply === 'function' ? reply() : reply; };
    const sandbox = {
        statusAiGenerationBusy: false, statusAiTestRecords: null, SUMMARY_RESPONSE_LENGTH: 4096,
        context: () => ({ generateRaw: quietOnly ? undefined : () => run('raw'), generateQuietPrompt: () => run('quiet') }),
        responseText, generationErrorMessage, parseSingleStatusResult, singleStatusCatalog, normalizeRule,
        statusAiView: () => ({ status, result: node(), install: node(), source: node() }),
        compactStatusAiText: value => value || '', settings: () => stored,
        currentStatusAiContext: async () => ({ characterName: '旅人', characterContext: '阅读', chatContext: '图书馆', messageCount: 1, worldbookCount: 0 }),
        statusAiSingleCandidates: () => [selected], resolveStatusIdeaIntent: () => ({}),
        applyStatusAiRecommendation: () => { calls.applied++; }, resolvedStatusInput: () => ({ ...selected.input, phoneDesktop: stored.phoneDesktop }),
        field: () => null,
        renderStatusSchema() {}, renderModalStatusSchema() {}, renderPhoneDesktopControls() {},
        renderGreetingStatusChooser() {}, renderStatusPreview() {}, statusRecommendationKey: () => selected.key,
        rememberGeneratedStatusTemplate() {}, saveSettingsSoon() {}, updatePreview() {},
        showStatusAiRecommendation() {}, statusAiRecommendationLabel: () => '聊天', notify() {},
    };
    vm.createContext(sandbox); vm.runInContext(runner, sandbox);
    return { calls, status, sandbox, button: node() };
}

for (const [name, reply] of [['success', valid], ['empty', ''], ['malformed JSON', '{'], ['missing fields', '{"candidate":"chat","shared":[],"pages":[]}'], ['429', new Error('429 Too Many Requests')], ['502', new Error('502 Bad Gateway')], ['empty exception', new Error('No message generated')]]) {
    test(`one click makes exactly one generation call for ${name}`, async () => {
        const h = harness(reply);
        await h.sandbox.testStatusAiGeneration(h.button);
        assert.equal(h.calls.raw, 1); assert.equal(h.calls.quiet, 0);
        assert.equal(h.calls.applied, name === 'success' ? 1 : 0);
        assert.equal(h.status.dataset.state, name === 'success' ? 'success' : 'error');
        assert.equal(h.sandbox.statusAiGenerationBusy, false); assert.equal(h.button.disabled, false);
    });
}
test('quiet-only hosts also make one request', async () => {
    const h = harness(valid, true); await h.sandbox.testStatusAiGeneration(h.button);
    assert.equal(h.calls.raw, 0); assert.equal(h.calls.quiet, 1); assert.equal(h.status.dataset.state, 'success');
});
test('modal phone generation keeps every page field and app name aligned with one call', async () => {
    const selected = { ...candidate, key: 'phone', input: { structure: 'phone' }, recommendation: { structure: 'phone' } };
    const schema = singleStatusCatalog([selected])[0];
    const names = ['个人档案', '旅行笔记', '好友消息', '随身商店'];
    const data = { candidate: 'phone', shared: schema.shared.map(() => '共享'), phoneApps: names,
        pages: schema.pages.map(page => ({ id: page.id, values: page.fields.map((field, i) => `${page.id}-${i}`) })) };
    const h = harness(JSON.stringify(data), false, selected);
    await h.sandbox.testStatusAiGeneration(h.button, 'modal');
    assert.equal(h.status.dataset.state, 'success'); assert.equal(h.calls.raw, 1); assert.equal(h.calls.quiet, 0);
    const records = h.sandbox.statusAiTestRecords;
    assert.deepEqual(records.rule.phoneDesktop.apps.map(app => app.name), names);
    assert.deepEqual(Array.from(records.pages, record => record.page.label), names);
    records.pages.forEach((record, index) => assert.deepEqual(record.values, data.pages[index].values));
});
test('wrapped 429 remains visible and ends after one request', async () => {
    const h = harness(new Error('502 Bad Gateway: upstream returned 429 Too Many Requests'));
    await h.sandbox.testStatusAiGeneration(h.button);
    assert.equal(h.calls.raw, 1); assert.equal(h.calls.quiet, 0);
    assert.match(h.status.textContent, /429/); assert.match(h.status.textContent, /502/);
});

test('real AI template application preserves the previous profile draft across structures', () => {
    const presets = STATUS_BEAUTY_01_15_IDS.map(id => STATUS_STRUCTURE_PRESETS.find(item => item.id === id));
    const [first, second] = presets;
    const stored = { structure: 'profile', profileAppearance: first.id, title: '用户自定义标题',
        pageFieldsText: '观察|用户填写要求|long|observation', profileTemplateDrafts: {}, media: {} };
    const box = { settings: () => stored, STATUS_STRUCTURE_PRESETS, PROFILE_APPEARANCE_PRESETS: presets,
        PROFILE_APPEARANCE_DEFAULT: first, PROFILE_APPEARANCE_IDS: presets.map(item => item.id),
        DEFAULT_SETTINGS: { media: {} }, statusAiTestRecords: null, field: () => null, clone: structuredClone };
    for (const name of ['renderStatusSchema', 'renderModalStatusSchema', 'renderStatusDesignControls',
        'renderTemplateMediaControls', 'renderPhoneDesktopControls', 'renderForumSkinControls',
        'syncQuestMapEditorEntry', 'scheduleStatusPreviewUpdate', 'updatePreview']) box[name] = () => {};
    const extract = (start, end) => source.slice(source.indexOf(`function ${start}(`), source.indexOf(end, source.indexOf(`function ${start}(`)));
    vm.createContext(box);
    vm.runInContext([
        extract('applyStatusStructure', 'function currentProfileTemplateDraft('),
        extract('currentProfileTemplateDraft', 'const SAVED_STATUS_TEMPLATE_KEYS'),
        extract('saveCurrentProfileTemplateDraft', 'function fieldDefinitions('),
        extract('applyStatusAiRecommendation', 'function applyStatusIdeaPlan('),
    ].join('\n'), box);
    const expected = box.currentProfileTemplateDraft();
    box.applyStatusAiRecommendation({ structure: 'profile', profileAppearance: second.id });
    assert.deepEqual(stored.profileTemplateDrafts[first.id], structuredClone(expected));
    stored.title = '第二套用户标题';
    const secondDraft = structuredClone(box.currentProfileTemplateDraft());
    box.applyStatusAiRecommendation({ structure: 'chat' });
    assert.deepEqual(stored.profileTemplateDrafts[second.id], secondDraft);
    box.applyStatusAiRecommendation({ structure: 'profile', profileAppearance: first.id });
    assert.deepEqual(stored.profileTemplateDrafts[first.id], structuredClone(expected));
    assert.deepEqual(stored.profileTemplateDrafts[second.id], secondDraft);
});
test('settings and modal share a pending-request guard and unlock after completion', async () => {
    let release;
    const h = harness(() => new Promise(resolve => { release = resolve; }));
    const first = h.sandbox.testStatusAiGeneration(h.button);
    await Promise.resolve();
    await h.sandbox.testStatusAiGeneration({ textContent: '生成' }, 'modal');
    assert.equal(h.calls.raw, 1);
    release(valid); await first;
    assert.equal(h.sandbox.statusAiGenerationBusy, false);
});

test('candidate schemas preserve drafts and every offered template accepts a complete single response', () => {
    const stored = { structure: 'profile', profileAppearance: 'beauty-record-status-08', title: '自定义标题',
        pageFieldsText: '观察|填写观察|long|observation', sharedFieldsText: '', pagesText: '此刻|当前状态', statusRecentRecommendations: [] };
    const before = structuredClone(stored);
    const profiles = [...STATUS_BEAUTY_01_15_IDS, ...STATUS_BEAUTY_16_20_IDS, 'archive-status'];
    const sandbox = { settings: () => stored, resolveStatusIdeaIntent, applyStatusIdeaFocus, statusRecommendationKey,
        parseFields, STATUS_STRUCTURE_PRESETS, STATUS_AI_STRUCTURE_IDS: ['phone', 'profile', 'social', 'chat', 'forum'],
        PROFILE_APPEARANCE_PRESETS: profiles.map(id => STATUS_STRUCTURE_PRESETS.find(item => item.id === id)),
        resolvedStatusInput: value => ({ ...value, structure: value.structure === 'profile' ? value.profileAppearance : value.structure }),
    };
    const code = source.slice(source.indexOf('function statusAiSingleCandidates('), source.indexOf('function statusAiCandidateCatalog('));
    vm.createContext(sandbox); vm.runInContext(code, sandbox);
    const candidates = sandbox.statusAiSingleCandidates('');
    assert.equal(candidates.length, profiles.length + 4);
    assert.equal(candidates.find(item => item.recommendation.profileAppearance === stored.profileAppearance).content.pageFieldsText, stored.pageFieldsText);
    for (const schema of singleStatusCatalog(candidates)) {
        const data = { candidate: schema.candidate, shared: schema.shared.map(() => '共享'),
            pages: schema.pages.map(page => ({ id: page.id, values: page.fields.map(() => '状态') })),
            phoneApps: schema.phoneApps.map(() => '应用') };
        const parsed = parseSingleStatusResult(JSON.stringify(data), candidates);
        assert.equal(parsed.records.pages.length, schema.pages.length);
    }
    assert.deepEqual(stored, before);
});

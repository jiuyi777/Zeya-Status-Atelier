import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { isStatusWorldbookEntry } from '../status-worldbook.js';
import { buildCharacterHomepageContext } from '../opening-context.js';

const source = readFileSync(new URL('../index.js', import.meta.url), 'utf8');
const reader = source.slice(source.indexOf('function compactStatusAiText('), source.indexOf('function statusAiCandidateCatalog('));

test('AI context reads embedded and linked lore and excludes both generations of status rules', async () => {
    const entries = [
        { comment: '港口', content: '港口坐落在北方。', enabled: true },
        { comment: '旧格式', content: 'old-status-control', automationId: 'jiuyi-status-output-rule-v1' },
        { comment: '新格式', content: 'new-status-control', automationId: 'jiuyi-wb-profile-test' },
        { comment: '停用项', content: 'disabled-lore', disable: true },
        { comment: '关闭项', content: 'disabled-card-lore', enabled: false },
    ];
    const original = structuredClone(entries);
    const ctx = { chat: [{ is_user: true, mes: '准备出发。' }] };
    const character = { name: '旅行者', description: '一位旅人。' };
    const sandbox = {
        isStatusWorldbookEntry, buildCharacterHomepageContext,
        requireCurrentCharacterContext: () => ({ context: ctx, character }),
        currentEmbeddedWorldbooks: () => [{ name: '内嵌书', entries }],
        currentLinkedWorldbooks: () => ['关联书'],
        loadWorldInfo: async () => ({ entries: { 0: { comment: '旅店', content: '旅店位于广场边。' } } }),
    };
    const result = await runInNewContext(`${reader}\ncurrentStatusAiContext()`, sandbox);
    assert.equal(result.characterName, '旅行者');
    assert.equal(result.worldbookCount, 2);
    assert.equal(result.messageCount, 1);
    assert.match(result.characterContext, /港口坐落在北方/);
    assert.match(result.characterContext, /旅店位于广场边/);
    assert.doesNotMatch(result.characterContext, /old-status-control|new-status-control|disabled-lore|disabled-card-lore/);
    assert.match(result.chatContext, /准备出发/);
    assert.deepEqual(entries, original);
});

test('empty lore is a valid context and does not prevent generation preparation', async () => {
    const result = await runInNewContext(`${reader}\ncurrentStatusAiContext()`, {
        isStatusWorldbookEntry, buildCharacterHomepageContext,
        requireCurrentCharacterContext: () => ({ context: { chat: [] }, character: { name: '旅行者' } }),
        currentEmbeddedWorldbooks: () => [], currentLinkedWorldbooks: () => [],
    });
    assert.equal(result.worldbookCount, 0);
    assert.equal(result.messageCount, 0);
});

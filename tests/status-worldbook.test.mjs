import test from 'node:test';
import assert from 'node:assert/strict';
import {
    STATUS_WORLDBOOK_ENTRY_ID,
    buildStatusWorldbookName,
    selectStatusWorldbookTarget,
    isStatusWorldbookEntry,
    upsertStatusWorldbookData,
} from '../status-worldbook.js';
import { buildWorldbookJson, RULE_PRESETS } from '../rule-generator.js';

test('writes to the current main book after rebinding, even when the old book remains available or auxiliary', () => {
    for (const linkedBooks of [['新世界书'], ['新世界书', '旧世界书']]) {
        assert.equal(selectStatusWorldbookTarget({ primaryBook: '新世界书', linkedBooks,
            boundBook: '旧世界书', availableBooks: ['新世界书', '旧世界书'] }), '新世界书');
    }
    assert.equal(selectStatusWorldbookTarget({ primaryBook: '九一-状态栏-主世界书',
        linkedBooks: ['九一-状态栏-主世界书', '其他书'], availableBooks: ['九一-状态栏-主世界书', '其他书'] }), '九一-状态栏-主世界书');
});

test('never resurrects an unlinked cached book and does not silently replace a missing main book', () => {
    assert.equal(selectStatusWorldbookTarget({ linkedBooks: [], boundBook: '旧世界书', availableBooks: ['旧世界书'] }), '');
    assert.equal(selectStatusWorldbookTarget({ linkedBooks: ['附加设定'], boundBook: '旧世界书', availableBooks: ['附加设定', '旧世界书'] }), '附加设定');
    assert.throws(() => selectStatusWorldbookTarget({ primaryBook: '未加载的主世界书', linkedBooks: ['旧世界书'],
        boundBook: '旧世界书', availableBooks: ['旧世界书'] }), /未加载的主世界书/);
});

test('builds a stable character-specific status worldbook name', () => {
    const first = buildStatusWorldbookName({ name: '温瑟', avatar: 'wensher.png' }, 'character:wensher.png');
    const again = buildStatusWorldbookName({ name: '温瑟', avatar: 'wensher.png' }, 'character:wensher.png');
    const other = buildStatusWorldbookName({ name: '塞恩', avatar: 'saien.png' }, 'character:saien.png');
    assert.equal(first, again);
    assert.notEqual(first, other);
    assert.match(first, /^九一-状态栏-温瑟-/);
});

test('keeps different status rules, updates only the same identity, and preserves unrelated entries', () => {
    const generated = buildWorldbookJson(RULE_PRESETS.relationship).entries[0];
    const dossier = buildWorldbookJson({
        ...RULE_PRESETS.relationship,
        structure: 'beauty-dossier-04',
        tagName: 'dossier_status',
        ruleName: '状态栏04 · 人物剪报卷宗',
    }).entries[0];
    const original = { entries: { 4: { uid: 4, comment: '角色设定', content: '保留我' } } };
    const first = upsertStatusWorldbookData(original, generated);
    const second = upsertStatusWorldbookData(first.data, dossier);
    const updated = upsertStatusWorldbookData(second.data, { ...generated, content: '更新后的输出规则' });
    assert.equal(first.created, true);
    assert.equal(second.created, true);
    assert.notEqual(second.uid, first.uid);
    assert.equal(updated.created, false);
    assert.equal(updated.uid, first.uid);
    assert.equal(updated.data.entries[4].content, '保留我');
    assert.equal(updated.data.entries[first.uid].automationId, generated.automationId);
    assert.equal(updated.data.entries[first.uid].content, '更新后的输出规则');
    assert.equal(updated.data.entries[second.uid].automationId, dossier.automationId);
    assert.equal(updated.data.entries[second.uid].content, dossier.content);
    assert.equal(updated.data.entries[first.uid].constant, true);
    assert.equal(updated.data.entries[first.uid].disable, false);
    assert.ok(isStatusWorldbookEntry(updated.data.entries[first.uid]));
    assert.ok(isStatusWorldbookEntry(updated.data.entries[second.uid]));
});

test('migrates only the matching legacy worldbook rule instead of overwriting another status', () => {
    const relationship = buildWorldbookJson(RULE_PRESETS.relationship).entries[0];
    const dossier = buildWorldbookJson({
        ...RULE_PRESETS.relationship,
        structure: 'beauty-dossier-04',
        tagName: 'dossier_status',
        ruleName: '状态栏04 · 人物剪报卷宗',
    }).entries[0];
    const legacyRelationship = { ...relationship, uid: 2, automationId: STATUS_WORLDBOOK_ENTRY_ID };
    const installedDossier = upsertStatusWorldbookData({ entries: { 2: legacyRelationship } }, dossier);
    assert.equal(installedDossier.created, true);
    assert.equal(installedDossier.data.entries[2].automationId, STATUS_WORLDBOOK_ENTRY_ID);

    const migratedRelationship = upsertStatusWorldbookData(installedDossier.data, relationship);
    assert.equal(migratedRelationship.created, false);
    assert.equal(migratedRelationship.uid, 2);
    assert.equal(migratedRelationship.data.entries[2].automationId, relationship.automationId);
    assert.equal(migratedRelationship.data.entries[installedDossier.uid].automationId, dossier.automationId);
});

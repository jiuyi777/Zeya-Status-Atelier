import test from 'node:test';
import assert from 'node:assert/strict';
import {
    STATUS_WORLDBOOK_ENTRY_ID,
    buildStatusWorldbookName,
    upsertStatusWorldbookData,
} from '../status-worldbook.js';
import { buildWorldbookJson, RULE_PRESETS } from '../rule-generator.js';

test('builds a stable character-specific status worldbook name', () => {
    const first = buildStatusWorldbookName({ name: '温瑟', avatar: 'wensher.png' }, 'character:wensher.png');
    const again = buildStatusWorldbookName({ name: '温瑟', avatar: 'wensher.png' }, 'character:wensher.png');
    const other = buildStatusWorldbookName({ name: '塞恩', avatar: 'saien.png' }, 'character:saien.png');
    assert.equal(first, again);
    assert.notEqual(first, other);
    assert.match(first, /^九一-状态栏-温瑟-/);
});

test('upserts one constant AI output rule without erasing other worldbook entries', () => {
    const generated = buildWorldbookJson(RULE_PRESETS.relationship).entries[0];
    const original = { entries: { 4: { uid: 4, comment: '角色设定', content: '保留我' } } };
    const first = upsertStatusWorldbookData(original, generated);
    const second = upsertStatusWorldbookData(first.data, { ...generated, content: '更新后的输出规则' });
    assert.equal(first.created, true);
    assert.equal(second.created, false);
    assert.equal(second.uid, first.uid);
    assert.equal(second.data.entries[4].content, '保留我');
    assert.equal(second.data.entries[first.uid].automationId, STATUS_WORLDBOOK_ENTRY_ID);
    assert.equal(second.data.entries[first.uid].content, '更新后的输出规则');
    assert.equal(second.data.entries[first.uid].constant, true);
    assert.equal(second.data.entries[first.uid].disable, false);
});

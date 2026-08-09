import test from 'node:test';
import assert from 'node:assert/strict';
import {
    extractStatusBlock,
    parseAliases,
    parseSchema,
    parseStatusSections,
    schemaToStatusExample,
    splitEscaped,
} from '../status-parser.js';

test('extracts a status block without changing the story body', () => {
    const input = '正文第一段。\n\n<status_bar>\n[DateTime|9月14日|21:40]\n</status_bar>';
    const result = extractStatusBlock(input);
    assert.equal(result.messageWithoutStatus, '正文第一段。');
    assert.match(result.body, /DateTime/);
});

test('removes a surrounding html code fence when it only wraps the status block', () => {
    const input = '正文\n```html\n<status_bar>\n[Location|旧城区]\n</status_bar>\n```';
    const result = extractStatusBlock(input);
    assert.equal(result.messageWithoutStatus, '正文');
});

test('uses the last status block when malformed output contains two', () => {
    const input = '<status_bar>[A|旧]</status_bar>正文<status_bar>[A|新]</status_bar>';
    const result = extractStatusBlock(input);
    assert.equal(parseStatusSections(result.body)[0].values[0], '新');
    assert.match(result.messageWithoutStatus, /旧/);
});

test('parses the supplied aqua reference structure', () => {
    const body = [
        '[DateTime|9月14日 星期六|21:40]',
        '[Weather|🌧️|细雨绵绵|22°C]',
        '[Affection|牵绊|55|+3]',
        '[Thoughts|她刚才那句话，我还记得。]',
    ].join('\n');
    const sections = parseStatusSections(body);
    assert.equal(sections.length, 4);
    assert.deepEqual(sections[2], { key: 'Affection', values: ['牵绊', '55', '+3'] });
});

test('parses the supplied ticket reference structure', () => {
    const body = '[InnerThoughts|第一条|第二条|第三条]';
    assert.deepEqual(parseStatusSections(body)[0].values, ['第一条', '第二条', '第三条']);
});

test('supports escaped separators and closing brackets', () => {
    assert.deepEqual(splitEscaped('Thoughts|包含\\|竖线|包含\\]括号'), ['Thoughts', '包含|竖线', '包含]括号']);
});

test('parses editable schema and aliases', () => {
    const schema = parseSchema('# comment\nDateTime|日期|时间\nAffection|等级|数值');
    assert.equal(schema.length, 2);
    assert.deepEqual(schema[0].labels, ['日期', '时间']);
    const aliases = parseAliases('DateTime=日期与时间\nAffection=好感度');
    assert.equal(aliases.get('datetime'), '日期与时间');
});

test('creates a copy-ready prompt example', () => {
    const example = schemaToStatusExample('DateTime|日期|时间\nThoughts|内心想法');
    assert.equal(example, '<status_bar>\n[DateTime|{{日期}}|{{时间}}]\n[Thoughts|{{内心想法}}]\n</status_bar>');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    BATCH_SUMMARY_JSON_SCHEMA,
    SUMMARY_RESPONSE_LENGTH,
    SINGLE_SUMMARY_JSON_SCHEMA,
    generationErrorMessage,
    greetingPreview,
    jsonObjectsFromResponse,
    parseBatchSummaryResponse,
    parseSummaryResponse,
    responseText,
    stripReasoningBlocks,
    usableGreetingRecords,
} from '../response-parser.js';

test('provides SillyTavern-compatible JSON schemas for single and batch summaries', () => {
    assert.deepEqual(SINGLE_SUMMARY_JSON_SCHEMA.value.required, ['title', 'summary']);
    assert.deepEqual(BATCH_SUMMARY_JSON_SCHEMA.value.required, ['workIntro', 'entries']);
    assert.deepEqual(BATCH_SUMMARY_JSON_SCHEMA.value.properties.entries.items.required, ['index', 'title', 'summary']);
});

test('extracts balanced JSON when braces and escapes appear inside strings', () => {
    const objects = jsonObjectsFromResponse('prefix {"title":"雨夜 {重逢}","summary":"他说：\\"回来吧\\""} suffix');
    assert.equal(objects.length, 1);
    assert.equal(objects[0].title, '雨夜 {重逢}');
});

test('removes common tagged and fenced reasoning blocks case-insensitively', () => {
    const response = '<THINK>不要使用 {"title":"错误"}</THINK>\n```plan\n{"title":"也错误"}\n```\n{"title":"正确","summary":"有效简介"}';
    const cleaned = stripReasoningBlocks(response);
    assert.doesNotMatch(cleaned, /错误/);
    assert.deepEqual(parseSummaryResponse(response, '兜底标题', '兜底简介'), { title: '正确', summary: '有效简介' });
});

test('falls back to final JSON when a gateway wraps the answer in reasoning tags', () => {
    const response = '<reasoning>推理文字\n{"title":"标签内标题","summary":"标签内简介"}</reasoning>';
    assert.deepEqual(parseSummaryResponse(response, '兜底标题', '兜底简介'), { title: '标签内标题', summary: '标签内简介' });
});

test('batch parser keeps only requested complete entries and work intro', () => {
    const response = '<analysis>{"entries":[{"index":1,"title":"错误","summary":"错误"}]}</analysis>\n' +
        '{"workIntro":"作品简介","entries":[{"index":1,"title":"线路甲","summary":"甲简介"},{"index":9,"title":"越界","summary":"忽略"}]}';
    const parsed = parseBatchSummaryResponse(response, [{ index: 0 }, { index: 1 }]);
    assert.equal(parsed.workIntro, '作品简介');
    assert.deepEqual(parsed.entries.get(0), { title: '线路甲', summary: '甲简介' });
    assert.equal(parsed.entries.has(8), false);
});

test('unwraps common gateway response objects before parsing', () => {
    const wrapped = { choices: [{ message: { content: '{"title":"被包装的标题","summary":"被包装的简介"}' } }] };
    assert.match(responseText(wrapped), /被包装的标题/);
    assert.deepEqual(parseSummaryResponse(wrapped, '兜底', '兜底'), { title: '被包装的标题', summary: '被包装的简介' });
});

test('batch parser accepts tagged and numbered non-JSON model replies', () => {
    const tagged = '[WorkIntro|作品总简介]\n[Entry|1|雨夜来客|陌生人在雨夜敲响旧宅大门。]\n[Entry|2|失落车站|两人在末班车站再次相遇。]';
    const parsedTagged = parseBatchSummaryResponse(tagged, [{ index: 0 }, { index: 1 }]);
    assert.equal(parsedTagged.workIntro, '作品总简介');
    assert.deepEqual(parsedTagged.entries.get(1), { title: '失落车站', summary: '两人在末班车站再次相遇。' });

    const numbered = '1. 标题：旧城来信\n简介：一封迟到多年的信改变了重逢。\n2、海边清晨\n线路简介：潮声中出现新的选择。';
    const parsedNumbered = parseBatchSummaryResponse(numbered, [{ index: 0 }, { index: 1 }]);
    assert.deepEqual(parsedNumbered.entries.get(0), { title: '旧城来信', summary: '一封迟到多年的信改变了重逢。' });
    assert.deepEqual(parsedNumbered.entries.get(1), { title: '海边清晨', summary: '潮声中出现新的选择。' });
});

test('distinguishes a generic 502 from an actual 524 timeout', () => {
    assert.equal(SUMMARY_RESPONSE_LENGTH, 4096);
    assert.match(generationErrorMessage(new Error('Gateway 524 timed out')), /超时或 524/);
    assert.match(generationErrorMessage(new Error('Gateway 524 timed out')), /4096/);
    assert.match(generationErrorMessage(new Error('Got response status 502')), /502 不一定是超时/);
    assert.match(generationErrorMessage(new Error('No message generated')), /本地摘要补全/);
    assert.equal(generationErrorMessage(new Error('permission denied')), '');
});

test('filters empty greeting placeholders while preserving native swipe indexes', () => {
    assert.equal(greetingPreview('<div> 真实开场 </div>'), '真实开场');
    const records = usableGreetingRecords(['第一条', '```html\n<div></div>\n```', '', '<p>第四条</p>']);
    assert.deepEqual(records.map(item => ({ sourceIndex: item.sourceIndex, preview: item.preview })), [
        { sourceIndex: 0, preview: '第一条' },
        { sourceIndex: 3, preview: '第四条' },
    ]);
});

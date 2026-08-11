import test from 'node:test';
import assert from 'node:assert/strict';
import {
    SUMMARY_RESPONSE_LENGTH,
    generationErrorMessage,
    greetingPreview,
    jsonObjectsFromResponse,
    parseBatchSummaryResponse,
    parseSummaryResponse,
    stripReasoningBlocks,
    usableGreetingRecords,
} from '../response-parser.js';

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

test('distinguishes a generic 502 from an actual 524 timeout', () => {
    assert.equal(SUMMARY_RESPONSE_LENGTH, 4096);
    assert.match(generationErrorMessage(new Error('Gateway 524 timed out')), /超时或 524/);
    assert.match(generationErrorMessage(new Error('Gateway 524 timed out')), /4096/);
    assert.match(generationErrorMessage(new Error('Got response status 502')), /502 不一定是超时/);
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

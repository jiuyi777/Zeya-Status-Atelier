import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { PORTRAIT_FREE_PRESETS, buildPortraitFreePreview } from '../status-portrait-free.js';
import { normalizeRule, buildRegexScript, buildAiInstruction, parseStatusOutput, buildWorldbookJson } from '../rule-generator.js';
import { makePortableRegex } from '../portable-regex.js';

const inputFor = preset => ({ structure: preset.id, title: preset.title, tagName: 'portrait_status',
  ruleId: `test-${preset.id}`, ruleName: preset.title, pagesText: preset.pagesText, sharedFieldsText: '',
  pageFieldsText: preset.fields.map(field => field.join('|')).join('\n') });

for (const preset of PORTRAIT_FREE_PRESETS) {
  test(`${preset.title}：三人剧情记录、预览、导出和规则使用同一份字段`, async () => {
    const input = inputFor(preset);
    const lines = ['林赛', '艾登', '第三位人物'].map((name, i) => `[View${i+1}|${preset.fields.map(field => field[3] === 'name' ? name : field[3] === 'score' ? '72' : `${name}的${field[0]}`).join('|')}|${name}]`);
    const output = `<portrait_status>\n${lines.join('\n')}\n</portrait_status>`;
    const parsed = parseStatusOutput(input, output);
    assert.equal(parsed.pages.length, 3);
    assert.deepEqual(parsed.pages.map(page => page.page.label), ['林赛', '艾登', '第三位人物']);
    const regex = buildRegexScript(input);
    const pattern = new RegExp(regex.findRegex.slice(1, regex.findRegex.lastIndexOf('/')), 'i');
    assert.ok(pattern.test(output));
    assert.equal(pattern.test('<portrait_status></textarea><script>oops()</script></portrait_status>'), false);
    const html = output.replace(pattern, regex.replaceString);
    assert.match(html, /^```html\s+<!doctype html>/i);
    assert.match(html, /<body>[\s\S]*<\/body>/);
    assert.doesNotMatch(html, /\$1|data-st-avatar|\/thumbnail|sample\.js|reference-controls\.js|17772300/);
    assert.ok(Buffer.byteLength(html) < 80_000, '导出携带界面代码，不重复嵌入字体与图片');
    assert.deepEqual(regex.placement, [2]);
    for (const script of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(script[1]);
    const preview = buildPortraitFreePreview(parsed.rule, parsed.pages);
    assert.match(preview, /林赛的身份/);
    assert.match(preview, /艾登的心声/);
    for (const field of preset.fields) assert.ok(html.includes(`data-field="${field[3]}"`));
    assert.match(buildAiInstruction(input), /实际人数逐人输出/);
    const book = JSON.stringify(buildWorldbookJson(input));
    assert.ok(book.includes('portrait_status'));
    const packed = await makePortableRegex(regex, { fetchResource: () => { throw new Error('公开资源不应被重新嵌入导出'); } });
    assert.equal(packed.replaceString, regex.replaceString);
  });
}

test('无头像素材与交互由正式源文件编译，时钟读取设备时间', async () => {
  const source = await readFile(new URL('../status-portrait-free/quiet-clock.js', import.meta.url), 'utf8');
  assert.match(source, /getDeviceClockTime/);
  assert.doesNotMatch(source, /parseSceneTime|data-scene-time/);
  const css = await readFile(new URL('../status-portrait-free/sample.css', import.meta.url), 'utf8');
  assert.match(css, /scrollbar-width: none/);
  for (const preset of PORTRAIT_FREE_PRESETS) {
    assert.equal(preset.avatarSource, 'none');
    assert.equal(preset.fields.some(field => field[2] === 'avatar'), false);
    assert.equal(normalizeRule(inputFor(preset)).structure, preset.id);
  }
});

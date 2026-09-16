import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadStatusBeautyBundledRegex, buildStatusBeautyBundledPreviewDocument } from '../status-beauty-01-15-bundle.js';

test('06 removes the mood illustration and uses one desire font size without changing card layout', async t => {
    t.mock.method(globalThis, 'fetch', async url => new Response(await readFile(url)));
    const script = await loadStatusBeautyBundledRegex('beauty-card-status-06');
    const css = script.replaceString.match(/<style data-status-atelier-responsive-layout>([\s\S]*?)<\/style>/)[1];
    const mood = script.replaceString.match(/<article class="playing-card mood-art">([\s\S]*?)<\/article>/)[1];
    assert.doesNotMatch(mood, /<img/);
    assert.match(mood, /data-capture="9"/);
    assert.match(mood, /data-capture="10"/);
    assert.doesNotMatch(script.replaceString, /padding-left:82px/);
    assert.match(script.replaceString, /\.attire b i\{font-size:15px!important/);
    assert.match(script.replaceString, /font-style:normal!important/);
    assert.match(css, /table-moment\{grid-template-columns:1fr 1fr/);
    const values = Array.from({length:14}, (_, i) => `字段${i + 1}：${'温柔体贴中带着不容动摇的固执。'.repeat(5)}`);
    const preview = buildStatusBeautyBundledPreviewDocument(script, values);
    for (let i = 1; i <= 14; i++) assert.ok(script.replaceString.includes(`data-capture="${i}"`));
    for (const value of values) assert.ok(preview.includes(value));
    assert.ok(preview.includes(css));
});

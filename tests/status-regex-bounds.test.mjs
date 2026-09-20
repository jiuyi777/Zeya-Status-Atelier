import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Worker } from 'node:worker_threads';
import { buildRegexScript } from '../rule-generator.js';
import { loadStatusBeautyBundledRegex, statusBeautyBundleMeta, STATUS_BEAUTY_01_15_IDS } from '../status-beauty-01-15-bundle.js';

function matchInWorker(findRegex, source) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(`const {parentPort,workerData}=require('node:worker_threads');
            const end=workerData.findRegex.lastIndexOf('/');
            const regex=new RegExp(workerData.findRegex.slice(1,end),workerData.findRegex.slice(end+1));
            parentPort.postMessage(sourceMatch());
            function sourceMatch(){return regex.exec(workerData.source)?.slice(1)||null;}`,
        { eval: true, workerData: { findRegex, source } });
        const timer = setTimeout(() => { worker.terminate(); reject(new Error('Regex blocked for more than 1500ms')); }, 1500);
        worker.once('message', result => { clearTimeout(timer); worker.terminate(); resolve(result); });
        worker.once('error', error => { clearTimeout(timer); worker.terminate(); reject(error); });
    });
}

test('incomplete repeated moon records terminate without crossing record boundaries', async t => {
    t.mock.method(globalThis, 'fetch', async url => new Response(await readFile(url)));
    const structure = 'moon-collage';
    const rule = await loadStatusBeautyBundledRegex(structure);
    const meta = statusBeautyBundleMeta(structure);
    const records = meta.lines.map(([key]) => `[${key}|状态]`).join('\n');
    assert.equal(await matchInWorker(rule.findRegex, `<${meta.tag}>\n${records.repeat(40)}`), null);
});

test('generic status regex terminates on whitespace-only truncated output', async () => {
    const rule = buildRegexScript({ tagName: 'status_test' });
    assert.equal(await matchInWorker(rule.findRegex, '<status_test>' + ' '.repeat(5000)), null);
    const result = await matchInWorker(rule.findRegex, '<status_test>\n [View1|第一行|第二行]\n </status_test>');
    assert.equal(result[0].trim(), '[View1|第一行|第二行]');
});

test('bounded captures preserve empty and multiline fields, reject extra delimiters, and find the next complete block', async t => {
    t.mock.method(globalThis, 'fetch', async url => new Response(await readFile(url)));
    const structures = STATUS_BEAUTY_01_15_IDS;
    assert.equal(structures.length, 15);
    for (const structure of structures) {
        const rule = await loadStatusBeautyBundledRegex(structure);
        const {tag, lines} = statusBeautyBundleMeta(structure);
        const values = lines.flatMap(([, indexes]) => indexes.map(index => index === 0 ? '' : `字段${index}\n续行`));
        let offset = 0;
        const records = lines.map(([key, indexes]) => `[${key}|${indexes.map(() => values[offset++]).join('|')}]`).join('\n');
        const block = `<${tag}>\n${records}\n</${tag}>`;
        assert.deepEqual(await matchInWorker(rule.findRegex, block), values, structure);
        assert.equal(await matchInWorker(rule.findRegex, `<${tag}>\n${records.repeat(40)}`), null, structure);
        assert.equal(await matchInWorker(rule.findRegex, block.replace('|]', '|unexpected|extra]')), null, structure);
        assert.deepEqual(await matchInWorker(rule.findRegex, `<${tag}>${records}\n` + block), values, structure);
    }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {loadStatusBeautyBundledRegex} from '../status-beauty-01-15-bundle.js';

test('08 phone export retains equal text sizes for short and long values during fitting', async t => {
    t.mock.method(globalThis, 'fetch', async url => new Response(await readFile(url)));
    const result = await loadStatusBeautyBundledRegex('beauty-record-status-08');
    assert.match(result.replaceString, /track-list strong,\.lyric-thought p\)\{font:400 15px/);
    assert.match(result.replaceString, /lyric-thought span\)\{font-size:13px!important/);
    const runtime = [...result.replaceString.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)]
        .map(match => match[1]).find(code => code.includes('function fit()'));
    const writes = [];
    const style = () => ({getPropertyValue:()=>'',getPropertyPriority:()=>'',removeProperty(){},setProperty(){}});
    const nodes = ['站立', '站立良久略有疲惫，精神高度集中且带着隐秘的亢奋。'.repeat(4)].map(textContent => ({
        textContent, closest:()=>null, style:{...style(),setProperty:(...args)=>writes.push(args)},
    }));
    const card = {tagName:'ARTICLE',offsetWidth:360,offsetHeight:800,scrollHeight:800,style:style(),
        classList:{contains:name=>name==='design-08'},querySelectorAll:()=>nodes,addEventListener(){}};
    vm.runInNewContext(runtime, {
        document:{body:{children:[card],style:style()},documentElement:{clientWidth:360,style:style()}},
        window:{innerWidth:360,addEventListener(){}},requestAnimationFrame:fn=>fn(),getComputedStyle:()=>({fontSize:'15px'}),
    });
    assert.deepEqual(writes, [], 'phone fitting must not shrink long values below the shared CSS font size');
});

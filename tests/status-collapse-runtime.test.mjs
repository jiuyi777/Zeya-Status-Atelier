import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { loadStatusBeautyBundledRegex } from '../status-beauty-01-15-bundle.js';

test('P08 and P09 collapsed frames measure the visible card instead of hidden expanded overflow', async t => {
    t.mock.method(globalThis, 'fetch', async url => new Response(await readFile(url)));
    for (const [structure, design] of [['beauty-record-status-08', '08'], ['beauty-archive-status-09', '09']]) {
        const result = await loadStatusBeautyBundledRegex(structure);
        assert.ok(result.replaceString.includes(`.design-${design}:not(.is-collapsed){height:auto!important}`));
        assert.ok(result.replaceString.includes(`.design-${design}:not(.is-collapsed) .expanded-content{position:relative;`));
        const code = [...result.replaceString.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)]
            .map(match => match[1]).find(source => source.includes('function fit()'));
        for (const collapsed of [false, true]) {
            const style = () => ({ setProperty() {}, removeProperty() {} });
            const card = { tagName: 'ARTICLE', offsetWidth: 519, offsetHeight: collapsed ? 116 : 850,
                scrollHeight: 850, style: style(), classList: { contains: () => collapsed },
                querySelectorAll: () => [], addEventListener() {} };
            const body = { children: [card], style: style() };
            const viewport = { clientWidth: 519, style: style() };
            let resize;
            vm.runInNewContext(code, {
                document: { body, documentElement: viewport },
                window: { innerWidth: 519, addEventListener: (name, fn) => { if (name === 'resize') resize = fn; } }, requestAnimationFrame: fn => fn(),
            });
            assert.equal(body.style.height, collapsed ? '116px' : '850px', structure);
            viewport.clientWidth = card.offsetWidth = 280;
            resize();
            assert.equal(body.style.height, collapsed ? '116px' : '850px', `${structure}: reflowed phone card keeps full size`);
        }
    }
});

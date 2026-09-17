import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { applyStatusBeautyMobileTypography } from '../status-beauty-01-15-bundle.js';

for (const structure of ['beauty-crimson-letter-01', 'moon-collage', 'beauty-current-status-05']) {
    test(`${structure}: long prose becomes compact and reclassifies after text changes`, () => {
        const root = { querySelectorAll: () => nodes };
        const nodes = ['短句', '长'.repeat(40), '9'.repeat(40)].map((textContent, index) => ({
            textContent, dataset: { capture: String(index + 1) }, parentElement: root,
            attrs: new Map(), closest: () => null,
            setAttribute(name, value) { this.attrs.set(name, value); },
            getAttribute(name) { return this.attrs.get(name); },
            toggleAttribute(name, enabled) { if (enabled) this.attrs.set(name, ''); else this.attrs.delete(name); },
        }));
        const result = applyStatusBeautyMobileTypography({replaceString: '<html><head></head><body><div data-capture="1">$1</div></body></html>'}, {
            structure, pages: [{fields: [{kind:'text'}, {kind:'long'}, {kind:'progress'}]}],
        });
        let notify, options;
        class MutationObserver {
            constructor(callback) { notify = callback; }
            observe(target, config) { assert.equal(target, root); options = config; }
        }
        const script = result.replaceString.match(/<script>([\s\S]*?)<\/script>/)[1];
        vm.runInNewContext(script, {
            document: {querySelector: () => root}, window: {MutationObserver}, MutationObserver,
            requestAnimationFrame: callback => callback(),
        });
        assert.equal(nodes[0].attrs.has('data-sta-paragraph'), false);
        assert.equal(nodes[1].attrs.has('data-sta-paragraph'), true);
        assert.equal(nodes[2].attrs.has('data-sta-paragraph'), false);
        nodes[0].textContent = '字'.repeat(45);
        nodes[1].textContent = '缩短';
        notify();
        assert.equal(nodes[0].attrs.has('data-sta-paragraph'), true);
        assert.equal(nodes[1].attrs.has('data-sta-paragraph'), false);
        assert.equal(options.attributes, undefined);
        assert.match(result.replaceString, /data-sta-paragraph\]\{font-size:12px!important/);
        assert.match(result.replaceString, /font-size:13px!important;font-weight:400/);
    });
}

import test from 'node:test';
import assert from 'node:assert/strict';

import { applyStatusBeautyMobileLayout } from '../status-beauty-01-15-bundle.js';

test('flower echo keeps desktop markup and adds a complete phone layout with all 15 captures', () => {
    const source = {
        id: 'flower',
        replaceString: '<html><head></head><body><details class="status"><div class="canvas"></div><div class="compact"></div></details></body></html>',
    };
    const result = applyStatusBeautyMobileLayout(source, { structure: 'beauty-flower-echo-10' });

    assert.match(result.replaceString, /data-status-atelier-flower-mobile/);
    assert.match(result.replaceString, /@media\(max-width:700px\)/);
    assert.match(result.replaceString, /sta-flower-mobile-avatar avatar/);
    assert.match(result.replaceString, /展开更多状态/);
    for (let capture = 1; capture <= 15; capture += 1) {
        assert.match(result.replaceString, new RegExp(`\\$${capture}(?!\\d)`));
    }
    assert.match(result.replaceString, /<div class="canvas"><\/div>/);
});

test('other bundled designs are unchanged by the flower mobile adapter', () => {
    const source = { replaceString: '<html><head></head><body>desktop</body></html>' };
    assert.equal(applyStatusBeautyMobileLayout(source, { structure: 'beauty-clock-travel-11' }), source);
});

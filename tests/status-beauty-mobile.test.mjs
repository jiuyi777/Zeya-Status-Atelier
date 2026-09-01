import test from 'node:test';
import assert from 'node:assert/strict';

import {
    applyStatusBeautyMobileLayout,
    buildStatusBeautyBundledPreviewDocument,
} from '../status-beauty-01-15-bundle.js';

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

test('dossier keeps its desktop artwork and adds a readable vertical phone layout with all 8 captures', () => {
    const source = {
        id: 'dossier',
        replaceString: '<html><head></head><body class="design-page design-04-page"><details class="art-card dossier-art" open><div class="art-stage">desktop artwork</div><div class="compact"></div></details></body></html>',
    };
    const fields = ['时间', '地点', '今日宜', '今日忌', '广播', '当前章节', '心声', '御神签']
        .map(label => ({ label, kind: 'text' }));
    const result = applyStatusBeautyMobileLayout(source, {
        structure: 'beauty-dossier-04',
        title: '人物剪报卷宗',
        pages: [{ fields }],
    });

    assert.match(result.replaceString, /data-status-atelier-dossier-mobile/);
    assert.match(result.replaceString, /class="sta-dossier-mobile"/);
    assert.match(result.replaceString, /data-status-atelier-dossier-font/);
    assert.match(result.replaceString, /HuiwenMincho-Improved-Regular\.woff2/);
    assert.match(result.replaceString, /font-family:"STA Huiwen Mincho","Huiwen-mincho",serif!important/);
    assert.doesNotMatch(result.replaceString, /\.design-04-page \.sta-dossier-mobile \[data-sta-typography-value\]\{font-size:/);
    assert.match(result.replaceString, /\.dossier-art\[open\]>.art-stage\{display:none!important\}/);
    assert.match(result.replaceString, /\.dossier-art\[open\]>.sta-dossier-mobile\{display:block!important\}/);
    assert.match(result.replaceString, /<div class="art-stage">desktop artwork<\/div>/);
    for (let capture = 1; capture <= 8; capture += 1) {
        assert.match(result.replaceString, new RegExp(`data-capture="${capture}">\\$${capture}(?!\\d)`));
    }
    const preview = buildStatusBeautyBundledPreviewDocument(result, Array.from({ length: 8 }, (_, index) => `字段${index + 1}`));
    assert.match(preview, /data-status-atelier-adaptive-preview/);
    assert.match(preview, /textLength>48\?\.56:textLength>32\?\.64:textLength>20\?\.74:textLength>12\?\.86:1/);
    assert.match(preview, /document\.fonts&&document\.fonts\.ready/);
    assert.equal(applyStatusBeautyMobileLayout(result, { structure: 'beauty-dossier-04' }), result);
});

test('unadapted bundled designs are unchanged by the mobile adapter', () => {
    const source = { replaceString: '<html><head></head><body>desktop</body></html>' };
    assert.equal(applyStatusBeautyMobileLayout(source, { structure: 'beauty-clock-travel-11' }), source);
});

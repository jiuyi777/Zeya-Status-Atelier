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

test('moon collage keeps the desktop artwork and uses a real stacked phone layout instead of shrinking it', () => {
    const source = {
        id: 'moon',
        replaceString: '<html><head></head><body class="design-page design-03-page"><details class="art-card moon-art" open><div class="art-stage"><img class="art-photo" src="portrait.jpg"></div><div class="compact"></div></details></body></html>',
    };
    const fields = ['情愫', '欲念', '衣冠', '身处', '心语', '书信', '情愫注', '欲念注']
        .map(label => ({ label, kind: 'long' }));
    const result = applyStatusBeautyMobileLayout(source, {
        structure: 'moon-collage',
        title: '月下蝶影',
        pages: [{ fields }],
    });

    assert.match(result.replaceString, /data-status-atelier-moon-mobile/);
    assert.match(result.replaceString, /class="sta-moon-mobile"/);
    assert.match(result.replaceString, /\.moon-art\[open\]>.art-stage\{display:none!important\}/);
    assert.match(result.replaceString, /\.moon-art\[open\]>.sta-moon-mobile\{display:block!important\}/);
    assert.match(result.replaceString, /<div class="art-stage"><img class="art-photo" src="portrait\.jpg"><\/div>/);
    for (let capture = 1; capture <= 8; capture += 1) {
        assert.match(result.replaceString, new RegExp(`data-capture="${capture}">\\$${capture}(?!\\d)`));
    }
    assert.equal(applyStatusBeautyMobileLayout(result, { structure: 'moon-collage' }), result);
});

test('crimson letter stacks every field on phones so long values are not squeezed into columns', async () => {
    const moduleSource = await import('node:fs/promises').then(fs => fs.readFile(new URL('../status-beauty-01-15-bundle.js', import.meta.url), 'utf8'));
    assert.match(moduleSource, /\.fields\{grid-template-columns:minmax\(0,1fr\)/);
    assert.match(moduleSource, /grid-column:1!important;grid-row:auto!important/);
});

test('designs 11 to 15 keep their desktop canvas and gain complete themed phone pages', () => {
    const structures = [
        'beauty-clock-travel-11',
        'beauty-flower-reader-12',
        'beauty-olive-ticket-13',
        'beauty-cat-rabbit-14',
        'beauty-rabbit-track-15',
    ];
    structures.forEach(structure => {
        const source = {
            replaceString: '<html><head></head><body><details class="status" open><div class="canvas">desktop artwork</div><div class="compact"></div></details></body></html>',
        };
        const fields = Array.from({ length: 15 }, (_, index) => ({ label: `字段${index + 1}`, kind: 'long' }));
        const result = applyStatusBeautyMobileLayout(source, { structure, title: `人物状态${structure.slice(-2)}`, pages: [{ fields }] });
        assert.match(result.replaceString, /data-status-atelier-layered-mobile/, structure);
        assert.match(result.replaceString, /class="sta-layered-mobile sta-layered-\d+"/, structure);
        assert.match(result.replaceString, /\.status\[open\]>.canvas\{display:none!important\}/, structure);
        assert.match(result.replaceString, /<div class="canvas">desktop artwork<\/div>/, structure);
        for (let capture = 1; capture <= 15; capture += 1) {
            assert.match(result.replaceString, new RegExp(`data-capture="${capture}">\\$${capture}(?!\\d)`), `${structure} capture ${capture}`);
        }
    });
});

test('unadapted bundled designs are unchanged by the mobile adapter', () => {
    const source = { replaceString: '<html><head></head><body>desktop</body></html>' };
    assert.equal(applyStatusBeautyMobileLayout(source, { structure: 'beauty-crimson-letter-01' }), source);
});

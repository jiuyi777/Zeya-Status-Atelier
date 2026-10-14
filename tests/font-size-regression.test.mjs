import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { makePortableRegex } from '../portable-regex.js';
import { buildRegexScript } from '../rule-generator.js';
import { REFERENCE_STATUS_PRESETS } from '../reference-status.js';
import { createHash } from 'node:crypto';
import { sha256Bytes, compactEmbeddedFonts } from '../font-resources.js';

const font = await readFile(new URL('../assets/reference-status/fonts/HuiwenMincho.woff2', import.meta.url));
const embedded = 'data:font/woff2;base64,' + font.toString('base64');
const publicFont = 'https://raw.githubusercontent.com/jiuyi777/Zeya-Status-Atelier/v0.11.43/assets/reference-status/fonts/HuiwenMincho.woff2';
const baseUrl = 'http://phone.test/extensions/renamed/index.js';
const noFetch = () => { throw Error('unexpected request'); };
const face = url => `<style>@font-face{font-family:Huiwen;src:url("${url}") format("woff2");font-display:swap}</style>`;

test('HTTP phone hashing agrees with SHA-256 at padding boundaries and for the complete font', async () => {
    for (const length of [0,1,55,56,63,64,65,127,128,1024]) {
        const bytes=Buffer.alloc(length,0xa3);
        assert.equal(await sha256Bytes(bytes,null),createHash('sha256').update(bytes).digest('hex'));
    }
    assert.equal(await sha256Bytes(font,null),createHash('sha256').update(font).digest('hex'));
});

test('a same-length font with different bytes is never replaced during legacy cleanup', async () => {
    const modified=Buffer.from(font); modified[1234]^=1;
    const other=face('data:font/woff2;base64,'+modified.toString('base64'));
    assert.ok(await compactEmbeddedFonts(other,{checkSize:false}) === other);
});

test('reference templates export a linked font through the final packaging stage', async () => {
    for (const preset of REFERENCE_STATUS_PRESETS) {
        const source = buildRegexScript({ structure:preset.id, title:preset.title, pageFieldsText:preset.fields.map(f=>f.join('|')).join('\n') });
        assert.ok(Buffer.byteLength(JSON.stringify(source)) < 1024 * 1024, preset.id);
        const output = await makePortableRegex(source, { fetchResource:noFetch });
        assert.ok(Buffer.byteLength(JSON.stringify(output)) < 1024 * 1024, preset.id);
        assert.ok(output.replaceString.includes(publicFont), preset.id);
        assert.doesNotMatch(output.replaceString, /data:font\//, preset.id);
    }
});

test('a legacy full-font regex shrinks without changing its fields, content or interactions', async () => {
    const source = { id:'keep-id', disabled:true, placement:[2], markdownOnly:true, findRegex:'<status>([\\s\\S]*?)</status>', unknown:{keep:1},
        replaceString:'```html\n<body>'+face(embedded)+'<p>$1</p><button onclick="this.textContent=1">展开</button></body>\n```' };
    const output = await makePortableRegex(source, { fetchResource:noFetch });
    assert.ok(Buffer.byteLength(output.replaceString) < 10000, 'legacy font must be externalized');
    assert.deepEqual(output, {...source, replaceString:source.replaceString.replace(embedded, publicFont)});
    assert.ok(source.replaceString.includes(embedded), 'input stays unchanged');
    assert.deepEqual(await makePortableRegex(output, { fetchResource:noFetch }), output);
});

test('local and linked stylesheet fonts are recognized by bytes instead of embedded again', async () => {
    for (const html of [face('./assets/reference-status/fonts/HuiwenMincho.woff2'), '<link rel="stylesheet" href="./theme.css">']) {
        const calls=[];
        const output = await makePortableRegex({replaceString:html}, {baseUrl, fetchResource:async url=>{
            calls.push(url);
            return url.endsWith('.css')
                ? new Response(face('./assets/reference-status/fonts/HuiwenMincho.woff2').slice(7,-8), {headers:{'content-type':'text/css'}})
                : new Response(font, {headers:{'content-type':'font/woff2'}});
        }});
        assert.ok(output.replaceString.includes(publicFont));
        assert.ok(Buffer.byteLength(output.replaceString)<1000);
        assert.ok(calls.length>=1);
    }
});

test('unknown fonts are preserved; oversized embedded fonts stop export instead of changing typeface', async () => {
    const small='data:font/woff2;base64,'+Buffer.alloc(50,7).toString('base64');
    assert.equal((await makePortableRegex({replaceString:face(small)}, {fetchResource:noFetch})).replaceString,face(small));
    const other='data:font/woff2;base64,'+Buffer.alloc(300*1024,7).toString('base64');
    await assert.rejects(makePortableRegex({replaceString:face(other)}, {fetchResource:noFetch}), /字体.*过大/);
});

test('final packaged regexes are checked after resource processing', async () => {
    await assert.rejects(makePortableRegex({replaceString:'x'.repeat(1024*1024)}, {fetchResource:noFetch}), /正则.*1 MiB/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { makePortableRegex, pngImageBytes } from '../portable-regex.js';
import { readFile } from 'node:fs/promises';
import { STATUS_STRUCTURE_PRESETS, buildRegexScript } from '../rule-generator.js';
import { isStatusBeauty01To15, loadStatusBeautyBundledRegex } from '../status-beauty-01-15-bundle.js';

const baseUrl = 'http://tauri.localhost/scripts/extensions/third-party/Zeya-Status-Atelier/index.js';
const cssUrl = new URL('status-beauty-16-20.css', baseUrl).href;
const avatar = '/User%20Avatars/1760813107884-.png';

test('character PNG metadata stays out of avatars across repeated exports without changing pixel chunks', async () => {
    const original = new Uint8Array(await readFile(new URL('../assets/chat/cat-mascot.png', import.meta.url)));
    const pixels = pngImageBytes(original);
    const payload = Buffer.from('chara\0' + Buffer.from(JSON.stringify({ description: 'private-card-content', nested: 'x'.repeat(5000) })).toString('base64'));
    const textChunk = Buffer.alloc(payload.length + 12);
    textChunk.writeUInt32BE(payload.length); textChunk.write('tEXt', 4); payload.copy(textChunk, 8);
    const card = new Uint8Array(Buffer.concat([pixels.subarray(0, -12), textChunk, pixels.subarray(-12)]));
    assert.deepEqual(pngImageBytes(card), pixels);
    const packed = await makePortableRegex({ replaceString: `<img src="${avatar}">` }, { baseUrl, fetchResource: fixtureFetch({ [new URL(avatar, baseUrl).href]: [card, 'image/png'] }) });
    const encoded = packed.replaceString.match(/base64,([A-Za-z0-9+/=]+)/)[1];
    assert.deepEqual(new Uint8Array(Buffer.from(encoded, 'base64')), pixels);
    const saved = await makePortableRegex({ replaceString: `<img src="data:image/png;base64,${Buffer.from(card).toString('base64')}">` });
    assert.equal(saved.replaceString, packed.replaceString);
    assert.deepEqual(await makePortableRegex(packed), packed);
});
function fixtureFetch(files, calls = []) {
    return async url => {
        calls.push(url);
        const file = files[url];
        return file ? new Response(file[0], { headers: { 'content-type': file[1] } }) : new Response('', { status: 404 });
    };
}

test('export carries stylesheet, CSS images and configured local avatar while preserving regex contract', async () => {
    const source = { id: 'test', findRegex: '/<status>([\\s\\S]*?)<\\/status>/', placement: [2], markdownOnly: true,
        replaceString: '```html\n<html><head><link rel="stylesheet" href="' + cssUrl + '"></head><body><textarea hidden>$1</textarea><script>var config={"photoUrl":"' + avatar + '"};</script></body></html>\n```' };
    const calls = [];
    const files = {
        [cssUrl]: ['.status-card{display:grid;background:url("assets/paper.png")}', 'text/css'],
        [new URL('assets/paper.png', baseUrl).href]: ['paper', 'image/png'],
        [new URL(avatar, baseUrl).href]: ['avatar', 'image/png'],
    };
    const output = await makePortableRegex(source, { baseUrl, fetchResource: fixtureFetch(files, calls) });
    assert.match(output.replaceString, /<style>\.status-card\{display:grid/);
    assert.match(output.replaceString, /data:image\/png;base64,cGFwZXI=/);
    assert.match(output.replaceString, /"photoUrl":"data:image\/png;base64,YXZhdGFy"/);
    assert.doesNotMatch(output.replaceString, /tauri\.localhost|User%20Avatars|<link/);
    assert.match(output.replaceString, /<textarea hidden>\$1<\/textarea>/);
    assert.deepEqual({ ...output, replaceString: '' }, { ...source, replaceString: '' });
    assert.match(source.replaceString, /tauri\.localhost/);
    assert.equal(calls.length, 3);
});

test('local missing or HTML fallback resources stop export with a useful error', async () => {
    const source = { replaceString: '<img src="' + avatar + '">' };
    await assert.rejects(makePortableRegex(source, { baseUrl, fetchResource: fixtureFetch({}) }), /资源.*1760813107884/);
    await assert.rejects(makePortableRegex(source, { baseUrl, fetchResource: fixtureFetch({ [new URL(avatar, baseUrl).href]: ['<html>login</html>', 'text/html'] }) }), /资源/);
});

test('public media, data URLs and runtime character thumbnail lookup stay intact; repeated local files are read once', async () => {
    const calls = [];
    const source = { replaceString: '<img src="https://example.com/photo.png"><img src="data:image/png;base64,YQ=="><script>var thumbnail="/thumbnail?type=avatar&file="+name;var a="' + avatar + '",b="' + avatar + '";</script>' };
    const result = await makePortableRegex(source, { baseUrl, fetchResource: fixtureFetch({ [new URL(avatar, baseUrl).href]: ['avatar', 'image/png'] }, calls) });
    assert.match(result.replaceString, /https:\/\/example.com\/photo.png/);
    assert.match(result.replaceString, /\/thumbnail\?type=avatar&file=/);
    assert.equal(calls.length, 1);
});

test('user, character thumbnail and URL sources retain their chosen image in portable exports', async () => {
    for (const image of [avatar, '/thumbnail?type=avatar&file=character.png', 'https://images.example.com/custom.png']) {
        const local = image.startsWith('/');
        const source = { replaceString: `<script>var config={"photoUrl":"${image}"};</script>` };
        const calls = [];
        const result = await makePortableRegex(source, { baseUrl, fetchResource: fixtureFetch({ [new URL(image, baseUrl).href]: ['image', 'image/png'] }, calls) });
        assert.ok(result.replaceString.includes(local ? 'data:image/png;base64,aW1hZ2U=' : image));
        assert.equal(calls.length, local ? 1 : 0);
    }
});

test('inline background images are embedded while CSS attribute selectors remain unchanged', async () => {
    const source = { replaceString: `<div style="background:url(&quot;${avatar}&quot;)"></div><style>[src="/preview-character.svg"]{display:none}</style>` };
    const result = await makePortableRegex(source, { baseUrl, fetchResource: fixtureFetch({ [new URL(avatar, baseUrl).href]: ['image', 'image/png'] }) });
    assert.match(result.replaceString, /url\(&quot;data:image\/png;base64,aW1hZ2U=&quot;\)/);
    assert.match(result.replaceString, /\[src="\/preview-character.svg"\]/);
});

test('generated script escaping is decoded before requesting host thumbnail images', async () => {
    const url = '/thumbnail?type=avatar&file=character.png';
    const source = { replaceString: '<script>var config={"photoUrl":"' + url.replace('&', '\\u0026') + '"};</script>' };
    const result = await makePortableRegex(source, { baseUrl, fetchResource: fixtureFetch({ [new URL(url, baseUrl).href]: ['image', 'image/png'] }) });
    assert.match(result.replaceString, /"photoUrl":"data:image\/png;base64,aW1hZ2U="/);
});

test('CSS assigned by script and nested CSS imports become portable too', async () => {
    const nested = new URL('nested.css', baseUrl).href;
    const result = await makePortableRegex({ replaceString: '<script>link.href="' + cssUrl + '";</script>' }, { baseUrl, fetchResource: fixtureFetch({
        [cssUrl]: ['@import "nested.css"; .card{color:red}', 'text/css'],
        [nested]: ['.fold{display:block}', 'text/css'],
    }) });
    assert.doesNotMatch(result.replaceString, /tauri\.localhost/);
    const data = result.replaceString.match(/base64,([^" ]+)/)[1];
    assert.match(Buffer.from(data, 'base64').toString(), /\.fold\{display:block\}/);
});

test('every shipped status template can be packaged without plugin-directory references', async () => {
    const originalFetch = globalThis.fetch;
    const fileFetch = async value => {
        const url = new URL(value);
        assert.equal(url.protocol, 'file:', `unexpected network request: ${url}`);
        const extension = url.pathname.split('.').pop();
        const types = { css: 'text/css', png: 'image/png', svg: 'image/svg+xml', webp: 'image/webp', jpg: 'image/jpeg', json: 'application/json' };
        return new Response(await readFile(url), { headers: { 'content-type': types[extension] || 'application/octet-stream' } });
    };
    globalThis.fetch = fileFetch;
    try {
        for (const preset of STATUS_STRUCTURE_PRESETS) {
            const source = isStatusBeauty01To15(preset.id)
                ? await loadStatusBeautyBundledRegex(preset.id)
                : buildRegexScript({ structure: preset.id, pageFieldsText: preset.fields.map(field => field.join('|')).join('\n') });
            const output = await makePortableRegex(source, { fetchResource: fileFetch });
            assert.doesNotMatch(output.replaceString, /file:\/\/\/|tauri\.localhost|\/scripts\/extensions\/third-party\//, preset.id);
            for (const match of output.replaceString.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
                assert.doesNotThrow(() => new Function(match[1]), `${preset.id}: exported script syntax`);
            }
        }
    } finally { globalThis.fetch = originalFetch; }
});

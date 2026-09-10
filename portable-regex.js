// Resolve author-side resources once, before downloading or installing a regex.
// Public URLs and host-runtime character lookups remain usable on the recipient's host.
const RESOURCE_EXTENSION = /\.(?:css|png|jpe?g|webp|gif|svg|avif|ico|woff2?|ttf|otf)(?:[?#].*)?$/i;
const LOCAL_HOST = /^(?:localhost|.*\.localhost|127(?:\.\d+){3}|0\.0\.0\.0|\[::1\]|10(?:\.\d+){3}|192\.168(?:\.\d+){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d+){2})$/i;

async function replaceAsync(text, pattern, replace) {
    const matches = [...text.matchAll(pattern)];
    let result = '', cursor = 0;
    for (const match of matches) {
        result += text.slice(cursor, match.index) + await replace(match);
        cursor = match.index + match[0].length;
    }
    return result + text.slice(cursor);
}

function dataUrl(bytes, type) {
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 16384) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + 16384));
    }
    return `data:${type};base64,${btoa(binary)}`;
}

// Character PNGs carry card JSON in text chunks. Only pixels belong in an avatar.
export function pngImageBytes(bytes) {
    const signature = [137, 80, 78, 71, 13, 10, 26, 10];
    if (!signature.every((value, index) => bytes[index] === value)) return bytes;
    const chunks = [bytes.subarray(0, 8)];
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let offset = 8, size = 8, removed = false;
    while (offset + 12 <= bytes.length) {
        const length = view.getUint32(offset);
        const end = offset + length + 12;
        if (end > bytes.length) throw new Error('PNG 图片数据不完整');
        const type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
        if (['tEXt', 'iTXt', 'zTXt'].includes(type)) removed = true;
        else { chunks.push(bytes.subarray(offset, end)); size += end - offset; }
        offset = end;
        if (type === 'IEND') {
            if (!removed) return bytes;
            const output = new Uint8Array(size);
            let cursor = 0;
            for (const chunk of chunks) { output.set(chunk, cursor); cursor += chunk.length; }
            return output;
        }
    }
    throw new Error('PNG 图片缺少结束块');
}

export async function makePortableRegex(script, { baseUrl = import.meta.url, fetchResource = globalThis.fetch } = {}) {
    const base = new URL(baseUrl);
    const cache = new Map();
    function localUrl(value, relativeTo = baseUrl) {
        if (!value || /^(?:data:|#)/i.test(value) || value.includes('$') || value.includes('{{')) return null;
        let url;
        try { url = new URL(value.replace(/&amp;/g, '&').replace(/\\u0026/gi, '&'), relativeTo); } catch { return null; }
        const relative = !/^[a-z][a-z\d+.-]*:/i.test(value) && !value.startsWith('//');
        const local = relative || url.protocol === 'file:' || url.protocol === 'blob:' || LOCAL_HOST.test(url.hostname) || url.origin === base.origin;
        const thumbnail = url.pathname === '/thumbnail' && Boolean(url.searchParams.get('file'));
        if (!local || (url.protocol !== 'blob:' && !thumbnail && !RESOURCE_EXTENSION.test(url.pathname + url.search + url.hash))) return null;
        return url.href;
    }
    async function resource(url, chain = []) {
        if (chain.includes(url)) throw new Error('导出资源存在循环引用，请检查样式文件');
        if (!cache.has(url)) cache.set(url, (async () => {
            try {
                const response = await fetchResource(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const type = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
                const css = /\.css(?:[?#]|$)/i.test(url);
                if (css) {
                    if (type !== 'text/css' && type !== 'text/plain') throw new Error('样式响应格式错误');
                    const text = await portableCss(await response.text(), url, [...chain, url]);
                    return { text, data: dataUrl(new TextEncoder().encode(text), 'text/css') };
                }
                if (!/^(?:image\/|font\/|application\/(?:font|x-font|vnd\.ms-fontobject|octet-stream))/.test(type)) throw new Error('图片或字体响应格式错误');
                const bytes = new Uint8Array(await response.arrayBuffer());
                if (!bytes.length) throw new Error('资源为空');
                return { data: dataUrl(pngImageBytes(bytes), type) };
            } catch (error) {
                const name = decodeURIComponent(new URL(url).pathname.split('/').pop() || '图片');
                throw new Error(`导出资源「${name}」读取失败：${error.message}。请确认文件存在后重新生成。`);
            }
        })());
        return cache.get(url);
    }
    async function portableCss(css, relativeTo, chain = []) {
        let result = await replaceAsync(css, /@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?\s*([^;]*);/gi, async match => {
            const url = localUrl(match[1], relativeTo);
            if (!url) return match[0];
            const imported = await resource(url, chain);
            return match[2].trim() ? `@media ${match[2].trim()}{${imported.text}}` : imported.text;
        });
        result = await replaceAsync(result, /url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]+))\s*\)/gi, async match => {
            const url = localUrl(match[1] ?? match[2] ?? match[3], relativeTo);
            return url ? `url("${(await resource(url, chain)).data}")` : match[0];
        });
        return result;
    }
    let html = String(script.replaceString || '');
    html = await replaceAsync(html, /<link\b[^>]*>/gi, async match => {
        if (!/\brel\s*=\s*["']stylesheet["']/i.test(match[0])) return match[0];
        const href = match[0].match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
        const url = localUrl(href);
        if (!url) return match[0];
        const css = (await resource(url)).text;
        const media = match[0].match(/\bmedia\s*=\s*(["'][^"']*["'])/i)?.[1];
        return `<style${media ? ` media=${media}` : ''}>${css.replace(/<\/style/gi, '<\\/style')}</style>`;
    });
    // Inline CSS uses the document base; linked CSS above uses its own file URL.
    html = await replaceAsync(html, /<style\b([^>]*)>([\s\S]*?)<\/style>/gi,
        async match => `<style${match[1]}>${await portableCss(match[2], baseUrl)}</style>`);
    html = await replaceAsync(html, /\bstyle=("[^"]*"|'[^']*')/gi, async match => {
        const quote = match[1][0];
        const css = match[1].slice(1, -1).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
        const packed = await portableCss(css, baseUrl);
        return `style=${quote}${packed.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')}${quote}`;
    });
    // CSS selectors can contain URL-shaped attribute tests, which are not resources.
    // Process only the regions outside the style blocks already handled above.
    const sections = html.split(/(<style\b[^>]*>[\s\S]*?<\/style>)/gi);
    for (let index = 0; index < sections.length; index += 2) {
        sections[index] = await replaceAsync(sections[index], /(["'])((?:(?:https?:|file:)\/\/|blob:|\/|\.\.?\/|assets\/|role-card-originals\/)[^"'<>\r\n]*?)\1/g, async match => {
            const url = localUrl(match[2]);
            return url ? `${match[1]}${(await resource(url)).data}${match[1]}` : match[0];
        });
    }
    html = sections.join('');
    // Previously saved media settings may already contain an embedded character PNG.
    html = html.replace(/data:image\/png;base64,([A-Za-z0-9+/=]+)/g, (value, encoded) => {
        const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
        const image = pngImageBytes(bytes);
        return image === bytes ? value : dataUrl(image, 'image/png');
    });
    return { ...script, replaceString: html };
}

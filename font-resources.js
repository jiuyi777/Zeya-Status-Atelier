// A shared font is a resource, not character data. Match the historical embedded
// copy by its complete SHA-256 before replacing it with the identical public file.
export const HUIWEN_PUBLIC_FONT_URL = 'https://raw.githubusercontent.com/jiuyi777/Zeya-Status-Atelier/v0.11.43/assets/reference-status/fonts/HuiwenMincho.woff2';
export const HUIWEN_FONT_BYTES = 8245656;
const HUIWEN_SHA256 = '01fa3ffff6c44b59483b4eb3898272fae30601dbf85701219e5c64203fab44e0';
const MAX_EMBEDDED_FONT_BYTES = 256 * 1024;
const SHA256_K = new Uint32Array([
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2,
]);
const rotate = (word, bits) => (word >>> bits) | (word << (32 - bits));

// LAN phone pages often run over HTTP, where SubtleCrypto is unavailable.
export async function sha256Bytes(bytes, subtle = globalThis.crypto?.subtle) {
    if (subtle) {
        const hash = new Uint8Array(await subtle.digest('SHA-256', bytes));
        return [...hash].map(byte => byte.toString(16).padStart(2, '0')).join('');
    }
    const padded = new Uint8Array(Math.ceil((bytes.length + 9) / 64) * 64);
    padded.set(bytes); padded[bytes.length] = 0x80;
    const view = new DataView(padded.buffer);
    view.setUint32(padded.length - 8, Math.floor(bytes.length / 0x20000000));
    view.setUint32(padded.length - 4, (bytes.length * 8) >>> 0);
    const state = new Uint32Array([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]);
    const words = new Uint32Array(64);
    for (let offset = 0; offset < padded.length; offset += 64) {
        for (let i = 0; i < 16; i++) words[i] = view.getUint32(offset + i * 4);
        for (let i = 16; i < 64; i++) {
            const x = words[i - 15], y = words[i - 2];
            words[i] = words[i - 16] + (rotate(x,7) ^ rotate(x,18) ^ (x >>> 3)) + words[i - 7] + (rotate(y,17) ^ rotate(y,19) ^ (y >>> 10));
        }
        let [a,b,c,d,e,f,g,h] = state;
        for (let i = 0; i < 64; i++) {
            const t1 = (h + (rotate(e,6) ^ rotate(e,11) ^ rotate(e,25)) + ((e & f) ^ (~e & g)) + SHA256_K[i] + words[i]) >>> 0;
            const t2 = ((rotate(a,2) ^ rotate(a,13) ^ rotate(a,22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
            h=g; g=f; f=e; e=(d+t1)>>>0; d=c; c=b; b=a; a=(t1+t2)>>>0;
        }
        [a,b,c,d,e,f,g,h].forEach((value, i) => { state[i] += value; });
    }
    return [...state].map(word => word.toString(16).padStart(8, '0')).join('');
}

export async function publicFontForBytes(bytes) {
    return bytes.length === HUIWEN_FONT_BYTES && await sha256Bytes(bytes) === HUIWEN_SHA256 ? HUIWEN_PUBLIC_FONT_URL : null;
}

export function checkEmbeddedFontSize(bytes) {
    if (bytes > MAX_EMBEDDED_FONT_BYTES) throw new Error('内嵌字体过大，请使用公开字体链接后重新生成，避免把完整字体写入角色卡');
}

export async function compactEmbeddedFonts(text, { checkSize = true, cache = new Map() } = {}) {
    const pattern = /data:(font\/[\w.+-]+|application\/(?:[\w.+-]*font[\w.+-]*|octet-stream));base64,([A-Za-z0-9+/=]+)/gi;
    let result = '', cursor = 0;
    for (const match of String(text).matchAll(pattern)) {
        if (!cache.has(match[0])) {
            const bytes = Uint8Array.from(atob(match[2]), character => character.charCodeAt(0));
            const url = await publicFontForBytes(bytes);
            if (!url && checkSize && match[1].toLowerCase() !== 'application/octet-stream') checkEmbeddedFontSize(bytes.length);
            cache.set(match[0], url || match[0]);
        }
        result += text.slice(cursor, match.index) + cache.get(match[0]);
        cursor = match.index + match[0].length;
    }
    return result + text.slice(cursor);
}

// Installation may retain older templates alongside the newly selected one.
// Migrate only the verified font in every retained regex, keeping its content,
// identity, ordering and enabled state. Unknown fonts remain untouched.
export async function compactRegexFonts(scripts) {
    const cache = new Map(), result = [];
    let changed = 0;
    for (const script of scripts) {
        if (typeof script?.replaceString !== 'string') { result.push(script); continue; }
        const replaceString = await compactEmbeddedFonts(script.replaceString, {checkSize:false,cache});
        if (replaceString === script.replaceString) result.push(script);
        else { result.push({...script,replaceString}); changed++; }
    }
    return {scripts:result,changed};
}

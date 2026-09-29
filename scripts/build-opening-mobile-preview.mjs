import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { buildOpeningHomeRegex } from '../opening-home-generator.js';
const source = await readFile(new URL('../index.js', import.meta.url), 'utf8');
const ids = ['glass', 'noir-poster', 'negative-space', 'collage'];
const escape = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const panels = ids.map(id => {
    const block = source.match(new RegExp("id: '" + id + "', name: '([^']+)'[^\\n]*\\r?\\n\\s*values: (\\{[^\\n]+\\})"));
    const values = Object.fromEntries([...block[2].matchAll(/(\w+): '([^']*)'/g)].map(match => [match[1], match[2]]));
    const data = { ...values, title: '作品导航', author: '九一', model: 'gemini3.7flash\nClaude4.5o/Claude4.6o\nkimi3', preset: '弥生春\n泪\n圣血\n蛇果', intro: '一封意外来信，让平静的生活偏离原来的轨道。\n选择一段开场，走进属于你的故事。', entries: ['未命名开局 1', '一个较长的开场白标题：雨夜里的重逢', '未命名开局 3', '未命名开局 4'].map((title, index) => ({ title, summary: '填写这条开场白的简介，让读者知道故事从哪里开始。', target: index + 2 })) };
    const html = buildOpeningHomeRegex(data).replaceString.slice(8, -4);
    return `<section id="${id}"><h2>${block[1]}</h2><iframe sandbox title="${block[1]} 手机预览" srcdoc="${escape(html)}"></iframe></section>`;
});
await mkdir(new URL('../output/', import.meta.url), { recursive: true });
await writeFile(new URL('../output/opening-mobile-preview.html', import.meta.url), `<!DOCTYPE html><html lang="zh-CN"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>开场白 · 手机排版修正版</title><style>*{scrollbar-width:none}*::-webkit-scrollbar{width:0;height:0;display:none}body{margin:0;background:#e9e7e2;color:#302e2a;font:14px/1.6 system-ui;padding:24px}header{max-width:840px;margin:0 auto 24px}h1{font-size:24px}p{color:#68645c}.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr));gap:28px;max-width:840px;margin:auto}section{min-width:0}h2{font-size:15px;font-weight:500}iframe{display:block;width:100%;max-width:390px;height:1000px;border:0;border-radius:12px;box-shadow:0 6px 25px #302e2a15;background:white}@media(max-width:440px){body{padding:14px}iframe{height:1050px}}</style><header><h1>开场白 · 手机排版修正版</h1><p>四款沿用原本配色；压缩信息区、缩小编号、提高简介对比度。此页展示示例内容，预览与成品共用排版。</p></header><main class="gallery">${panels.join('')}</main></html>`);
console.log('output/opening-mobile-preview.html');

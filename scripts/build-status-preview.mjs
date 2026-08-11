import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
    RULE_PRESETS,
    STATUS_STRUCTURE_PRESETS,
    buildRegexScript,
} from '../rule-generator.js';

const outputPath = resolve(process.argv[2] || 'status-atelier-status-preview.html');
const avatarPath = process.argv[3] ? resolve(process.argv[3]) : '';
let avatarUrl = '';
if (avatarPath) {
    const bytes = await readFile(avatarPath);
    const extension = avatarPath.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
    avatarUrl = `data:image/${extension};base64,${bytes.toString('base64')}`;
}

function recordsFor(structure) {
    const fields = structure.fields.map((field, index) => field[2] === 'progress' ? String(46 + index * 7) : `${field[0]} · 浏览器动态值`);
    return `<zeya_status>\n[View1|${fields.join('|')}]\n</zeya_status>`;
}

function rendererFor(structure, index) {
    const input = {
        ...RULE_PRESETS.universalClassical,
        tagName: 'zeya_status',
        structure: structure.id,
        paletteId: ['cream-navy', 'berry-milk', 'newsprint', 'black-silver', 'sunset-pop', 'jade-gold', 'aqua-mist', 'porcelain', 'lavender-glass'][index],
        theme: ['classical', 'seed-note', 'retro-bbs', 'mono-chat', 'dada-collage', 'vinyl-mag', 'illuminated-quest', 'noir-case', 'minimal'][index],
        title: structure.title,
        subtitle: structure.subtitle,
        layout: structure.layout,
        pagesText: structure.pagesText,
        sharedFieldsText: '',
        pageFieldsText: structure.fields.map(field => field.join('|')).join('\n'),
        media: {
            avatarSource: avatarUrl ? 'url' : 'none',
            avatarUrl,
            imageUrl: index === 4 && avatarUrl ? avatarUrl : '',
            audioUrl: index === 5 ? 'https://example.com/theme.mp3' : '',
            imageAlt: '本地浏览器验收头像',
        },
    };
    return buildRegexScript(input).replaceString
        .replace(/^```html\s*/, '')
        .replace(/\s*```$/, '')
        .replace('$1', recordsFor(structure));
}

const cards = STATUS_STRUCTURE_PRESETS.map(rendererFor).join('\n');
const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>九一 · 状态栏组件验收</title>
<style>body{margin:0;padding:18px;background:#d8d3c9;color:#222;font-family:"Noto Sans SC",sans-serif}.preview-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:18px;align-items:start}.preview-note{max-width:1080px;margin:0 auto 18px;padding:12px 14px;background:#fff;border-left:5px solid #8a493d}</style></head>
<body><div class="preview-note"><strong>真实生成器浏览器验收</strong><br>9 种结构 × 独立色卡 × 真实字段解析；头像来自本地角色图，音乐控件不自动播放。</div><main class="preview-grid">${cards}</main></body></html>`;
await writeFile(outputPath, html, 'utf8');
console.log(outputPath);

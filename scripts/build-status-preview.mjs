import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
    RULE_PRESETS,
    STATUS_CUSTOM_VARIANTS,
    STATUS_RECIPE_PRESETS,
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

function recipeDefinition(recipe) {
    const structure = STATUS_STRUCTURE_PRESETS.find(item => item.id === recipe.structure);
    const variant = recipe.group === 'custom' ? STATUS_CUSTOM_VARIANTS.find(item => item.id === recipe.variant) : null;
    return { structure, fields: variant?.fields || structure.fields };
}

function recordsFor(fields) {
    const values = fields.map((field, index) => field[2] === 'progress' ? String(46 + index * 7) : `${field[0]} · 动态值`);
    return `<zeya_status>\n[View1|${values.join('|')}]\n</zeya_status>`;
}

function rendererFor(recipe, index) {
    const { structure, fields } = recipeDefinition(recipe);
    const input = {
        ...RULE_PRESETS.universalClassical,
        tagName: 'zeya_status',
        structure: structure.id,
        variant: recipe.variant,
        paletteId: recipe.paletteId,
        logoId: recipe.logoId,
        theme: recipe.theme,
        title: recipe.title || recipe.name,
        subtitle: recipe.subtitle || `${recipe.group === 'custom' ? 'CUSTOM PANEL' : 'TYPE STATUS'} / ${String(index + 1).padStart(2, '0')}`,
        layout: recipe.layout,
        pagesText: structure.pagesText,
        sharedFieldsText: '',
        pageFieldsText: fields.map(field => field.join('|')).join('\n'),
        media: {
            avatarSource: avatarUrl ? 'url' : 'none',
            avatarUrl,
            imageUrl: '',
            audioUrl: '',
            imageAlt: '本地浏览器验收头像',
        },
    };
    return buildRegexScript(input).replaceString
        .replace(/^```html\s*/, '')
        .replace(/\s*```$/, '')
        .replace('$1', recordsFor(fields));
}

const cards = STATUS_RECIPE_PRESETS.map(rendererFor).join('\n');
const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>九一 · 状态栏组件验收</title>
<style>body{margin:0;padding:18px;background:#d8d3c9;color:#222;font-family:"Noto Sans SC",sans-serif}.preview-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:18px;align-items:start}.preview-note{max-width:1080px;margin:0 auto 18px;padding:12px 14px;background:#fff;border-left:5px solid #8a493d}</style></head>
<body><div class="preview-note"><strong>真实生成器浏览器验收</strong><br>20 套自由面板＋20 套类型状态栏；每张卡都由最终正则生成器、真实字段解析和独立配方生成。</div><main class="preview-grid">${cards}</main></body></html>`;
await writeFile(outputPath, html, 'utf8');
console.log(outputPath);

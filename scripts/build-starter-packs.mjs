import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildOpeningHomeBlock, buildOpeningHomeRegex } from '../opening-home-generator.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = join(root, 'starter-packs');

const openingEntries = Array.from({ length: 8 }, (_, index) => ({
    number: String(index + 1).padStart(2, '0'),
    title: `开场白 ${index + 1}`,
    characters: '填写涉及人物 / 视角',
    summary: '填写这一条开场白的故事简介。',
    target: index + 2,
}));

const openingPacks = [
    { code: '01', slug: 'classical', name: '古典对称', theme: 'classical', font: 'serif', accent: '#a85f5b', background: '#fffaf1', text: '#443c38', secondary: '#6d9799' },
    { code: '03', slug: 'newspaper', name: '复古报刊', theme: 'newspaper', font: 'serif', accent: '#8d2d23', background: '#f3eddc', text: '#201d19', secondary: '#5a5348' },
    { code: '04', slug: 'timeline', name: '中轴时间线', theme: 'timeline', font: 'kai', accent: '#b46662', background: '#fffaf1', text: '#3c3330', secondary: '#6d9799' },
    { code: '05', slug: 'minimal', name: '极简留白', theme: 'minimal', font: 'sans', accent: '#677f72', background: '#f6f4ee', text: '#2c322f', secondary: '#a98763' },
];

async function writeJson(filePath, value) {
    await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(join(outputRoot, '开场白主页'), { recursive: true });

for (const pack of openingPacks) {
    const folder = join(outputRoot, '开场白主页', `${pack.code}-${pack.name}`);
    await mkdir(folder, { recursive: true });
    const settings = {
        ruleId: `zeya-opening-home-${pack.slug}-v1`,
        title: '作品导航',
        subtitle: 'STORY HOME',
        author: '九一',
        model: '填写推荐模型',
        preset: '填写推荐预设',
        intro: '这里填写整部作品的世界观、主要人物、故事背景与阅读提示。',
        theme: pack.theme,
        font: pack.font,
        accent: pack.accent,
        background: pack.background,
        text: pack.text,
        secondary: pack.secondary,
        entries: openingEntries,
    };
    const template = buildOpeningHomeBlock(settings);
    const regex = buildOpeningHomeRegex(settings);
    regex.scriptName = `九一 · 开场白主页${pack.code}·${pack.name}`;
    await writeJson(join(folder, `regex-开场白主页${pack.code}-${pack.name}.json`), regex);
    await writeFile(join(folder, `开场白主页${pack.code}-可编辑模板.txt`), `${template}\n`, 'utf8');
}

console.log(`STARTER_PACKS_BUILT ${outputRoot}`);

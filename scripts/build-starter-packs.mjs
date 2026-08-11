import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildOpeningHomeBlock, buildOpeningHomeRegex } from '../opening-home-generator.js';
import { RULE_PRESETS, STATUS_STYLE_PRESETS, buildAiInstruction, buildRegexScript, buildWorldbookJson } from '../rule-generator.js';

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

const statusPacks = STATUS_STYLE_PRESETS;

const fieldKind = label => {
    if (/(进度|率|健康|饱食|水分|完整度|血氧|成长值|心情数值|CPU|内存|存储)/i.test(label)) return 'progress';
    if (/(价格|当前价|实付|小计|优惠|营收|金币)/.test(label)) return 'currency';
    if (/(正文|摘要|简介|日志|消息|公告|歌词|章节|清单|记录|任务|目标|笔记|证据|关系|线索|解读|牌义|告警|物资|地图|计划|病史|关键词|趋势|待办|订单|历史|数据|事件|形态|回忆)/.test(label)) return 'long';
    if (/(数|量|温度|体感|湿度|风速|能见度|心率|血压|评分|睡眠|步数|专注)/.test(label)) return 'number';
    return 'text';
};

const fieldsText = fields => fields.map((label, index) => `${label}|根据当前剧情填写${label}|${fieldKind(label)}|field_${index + 1}`).join('\n');

async function writeJson(filePath, value) {
    await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(join(outputRoot, '开场白主页'), { recursive: true });
await mkdir(join(outputRoot, '通用状态栏'), { recursive: true });

for (const pack of openingPacks) {
    const folder = join(outputRoot, '开场白主页', `${pack.code}-${pack.name}`);
    await mkdir(folder, { recursive: true });
    const settings = {
        ruleId: `zeya-opening-home-${pack.slug}-v1`,
        title: '作品导航',
        subtitle: 'STORY HOME',
        author: 'Zeya',
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
    const tag = `opening_home_${pack.slug}`;
    const template = buildOpeningHomeBlock(settings)
        .replace('<opening_home>', `<${tag}>`)
        .replace('</opening_home>', `</${tag}>`);
    const regex = buildOpeningHomeRegex(settings);
    regex.scriptName = `Zeya · 开场白主页${pack.code}·${pack.name}`;
    regex.findRegex = `/<${tag}>\\s*([\\s\\S]*?)\\s*<\\/${tag}>/i`;
    await writeJson(join(folder, `regex-开场白主页${pack.code}-${pack.name}.json`), regex);
    await writeFile(join(folder, `开场白主页${pack.code}-可编辑模板.txt`), `${template}\n`, 'utf8');
}

for (const pack of statusPacks) {
    const folder = join(outputRoot, '通用状态栏', `${pack.code}-${pack.name}`);
    await mkdir(folder, { recursive: true });
    const tagName = `zeya_status_${pack.id}`;
    const settings = {
        ...RULE_PRESETS.universalClassical,
        ruleId: `zeya-status-${pack.id}-v1`,
        tagName,
        ruleName: `通用状态栏${pack.code}·${pack.name}`,
        title: pack.title,
        subtitle: pack.subtitle,
        theme: pack.id,
        layout: pack.layout,
        pagesText: pack.fields ? '记录一|填写当前主要人物、项目或视角\n记录二|填写需要切换查看的第二人物、项目或视角' : RULE_PRESETS.universalClassical.pagesText,
        sharedFieldsText: pack.shared ? fieldsText(pack.shared) : RULE_PRESETS.universalClassical.sharedFieldsText,
        pageFieldsText: pack.fields ? fieldsText(pack.fields) : RULE_PRESETS.universalClassical.pageFieldsText,
    };
    const instruction = buildAiInstruction(settings);
    const regex = buildRegexScript(settings);
    await writeJson(join(folder, `regex-通用状态栏${pack.code}-${pack.name}.json`), regex);
    await writeJson(join(folder, `世界书-通用状态栏${pack.code}-${pack.name}.json`), buildWorldbookJson(settings));
    await writeFile(join(folder, `世界书正文-通用状态栏${pack.code}-${pack.name}.txt`), `${instruction}\n`, 'utf8');
}

console.log(`STARTER_PACKS_BUILT ${outputRoot}`);

import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STATUS_STYLE_PRESETS } from '../rule-generator.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requiredFiles = [
    'manifest.json',
    'index.js',
    'rule-generator.js',
    'opening-home-generator.js',
    'response-parser.js',
    'settings.html',
    'style.css',
    'README.md',
    'docs/新手教程.md',
    'LICENSE',
];

const errors = [];
for (const file of requiredFiles) {
    try {
        await readFile(join(root, file));
    } catch {
        errors.push(`缺少文件：${file}`);
    }
}

const manifest = JSON.parse(await readFile(join(root, 'manifest.json'), 'utf8'));
for (const key of ['display_name', 'loading_order', 'js', 'css', 'author', 'version', 'description', 'minimum_client_version']) {
    if (manifest[key] === undefined || manifest[key] === '') {
        errors.push(`manifest.json 缺少字段：${key}`);
    }
}
if (manifest.minimum_client_version !== '1.14.0') {
    errors.push('minimum_client_version 必须锁定为已检查的 1.14.0');
}

const indexSource = await readFile(join(root, 'index.js'), 'utf8');
const cssSource = await readFile(join(root, 'style.css'), 'utf8');
const settingsSource = await readFile(join(root, 'settings.html'), 'utf8');
const readmeSource = await readFile(join(root, 'README.md'), 'utf8');
const generatorSource = await readFile(join(root, 'rule-generator.js'), 'utf8');
const openingGeneratorSource = await readFile(join(root, 'opening-home-generator.js'), 'utf8');

for (const forbidden of ['eval(', 'new Function(', 'innerHTML = message', 'innerHTML = value']) {
    if (indexSource.includes(forbidden)) {
        errors.push(`发现不安全模式：${forbidden}`);
    }
}
if (/\son\w+\s*=/.test(settingsSource)) {
    errors.push('settings.html 不应包含内联事件处理器');
}
if (/<script\b/i.test(settingsSource)) {
    errors.push('settings.html 不应包含脚本标签');
}
if (!generatorSource.includes('textContent')) {
    errors.push('生成正则中的动态状态值必须通过 textContent 写入');
}
if (!openingGeneratorSource.includes('textContent') || !openingGeneratorSource.includes('openings.forEach')) {
    errors.push('开场白主页必须安全渲染任意数量的目录条目');
}
if (!openingGeneratorSource.includes("ctx.swipe") && !openingGeneratorSource.includes("live.swipe")) {
    errors.push('开场白主页正则必须复用 SillyTavern 原生 swipe');
}
if (!indexSource.includes('ctx.swipe[direction].call')) {
    errors.push('开场白切换必须复用 SillyTavern 原生 swipe');
}
if (!indexSource.includes('saveScriptsByType')) {
    errors.push('缺少 SillyTavern 原生正则保存接口');
}
if (!generatorSource.includes('buildAiInstruction') || !generatorSource.includes('buildRegexScript')) {
    errors.push('缺少 AI 规则或正则 JSON 生成器');
}
if (manifest.author !== '九一') {
    errors.push('manifest 作者必须为 九一');
}
if (!cssSource.includes('@media (max-width: 700px)')) {
    errors.push('缺少手机端样式契约');
}
if (/^\s*(body|html|#chat|\.mes|\.mes_text)\s*[,{]/m.test(cssSource)) {
    errors.push('CSS 出现未限定的酒馆全局节点选择器');
}
for (const heading of ['安装', '第一次使用', 'AI 实际输出示例', '开场白主页', '更新', '常见问题']) {
    if (!readmeSource.includes(heading)) {
        errors.push(`README 缺少新手章节：${heading}`);
    }
}

const files = await readdir(root);
if (files.some(file => /secret|token|cookie|credential/i.test(file))) {
    errors.push('仓库根目录出现疑似秘密文件名');
}

const openingDefinitions = [
    ['01', '古典对称'],
    ['03', '复古报刊'],
    ['04', '中轴时间线'],
    ['05', '极简留白'],
];
const openingIds = new Set();
const statusIds = new Set();
const miniWebPalettes = new Set();
const miniWebSchemas = new Set();
for (const [code, name] of openingDefinitions) {
    const openingFolder = join(root, 'starter-packs', '开场白主页', `${code}-${name}`);
    try {
        const openingRegex = JSON.parse(await readFile(join(openingFolder, `regex-开场白主页${code}-${name}.json`), 'utf8'));
        const openingTemplate = await readFile(join(openingFolder, `开场白主页${code}-可编辑模板.txt`), 'utf8');
        openingIds.add(openingRegex.id);
        if (openingTemplate.trim() !== '【主页】' || openingRegex.findRegex !== '/【主页】/s') {
            errors.push(`开场白主页${code}必须只使用【主页】标记直接替换`);
        }
        if ((openingRegex.replaceString.match(/class="zoh-entry"/g) || []).length !== 8) {
            errors.push(`开场白主页${code}正则必须内置8条目录`);
        }
        if (!openingRegex.replaceString.includes('openings.forEach') || !openingRegex.replaceString.includes('swipe[direction].call')) {
            errors.push(`开场白主页${code}缺少动态目录或原生跳转`);
        }
    } catch (error) {
        errors.push(`开场白主页${code}成品缺失或 JSON 无效：${error.message}`);
    }
}

for (const style of STATUS_STYLE_PRESETS) {
    const { code, id, name } = style;
    const statusFolder = join(root, 'starter-packs', '通用状态栏', `${code}-${name}`);
    try {
        const statusRegex = JSON.parse(await readFile(join(statusFolder, `regex-通用状态栏${code}-${name}.json`), 'utf8'));
        const worldbook = JSON.parse(await readFile(join(statusFolder, `世界书-通用状态栏${code}-${name}.json`), 'utf8'));
        statusIds.add(statusRegex.id);
        const entry = worldbook.entries?.[0];
        if (!statusRegex.replaceString.includes(`data-theme="${id}"`)) {
            errors.push(`通用状态栏${code}没有写入主题 ${id}`);
        }
        if (!entry?.constant || !entry.content?.includes('所有值都必须根据当前剧情动态生成')) {
            errors.push(`通用状态栏${code}世界书没有动态输出规则`);
        }
        if (!statusRegex.replaceString.includes('textContent')) {
            errors.push(`通用状态栏${code}正则未安全写入动态数据`);
        }
        if (Number(code) >= 21) {
            const palettePattern = new RegExp(`data-theme="${id}"\\]\\{--z-accent:([^;}]+);--z-bg:([^;}]+);--z-card:([^;}]+);--z-text:([^;}]+);--z-muted:([^;}]+)\\}`);
            const palette = statusRegex.replaceString.match(palettePattern)?.slice(1).join('|');
            if (!palette) errors.push(`迷你网页${code}没有专属五色色卡`);
            else miniWebPalettes.add(palette);
            const schema = [...(style.shared || []), ...(style.fields || [])];
            miniWebSchemas.add(schema.join('|'));
            if (!style.glyph || !statusRegex.replaceString.includes('zrs-chrome')) {
                errors.push(`迷你网页${code}缺少专属装饰 HTML`);
            }
            for (const label of schema) {
                if (!entry?.content?.includes(label)) errors.push(`迷你网页${code}世界书缺少字段：${label}`);
            }
        }
    } catch (error) {
        errors.push(`通用状态栏${code}成品缺失或 JSON 无效：${error.message}`);
    }
}
if (openingIds.size !== 4) errors.push('四套开场白主页必须使用四个独立正则 ID');
if (STATUS_STYLE_PRESETS.length !== 50) errors.push('状态栏主题注册表必须正好包含50套');
if (new Set(STATUS_STYLE_PRESETS.map(style => style.id)).size !== 50) errors.push('50套状态栏必须使用50个独立主题 ID');
if (statusIds.size !== 50) errors.push('50套通用状态栏必须使用50个独立正则 ID');
if (miniWebPalettes.size !== 30) errors.push('21-50 必须使用30套独立五色色卡');
if (miniWebSchemas.size !== 30) errors.push('21-50 必须使用30套独立动态字段协议');

if (errors.length) {
    console.error('STATIC_CHECK_FAILED');
    errors.forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
} else {
    console.log('STATIC_CHECK_OK');
    console.log(`manifest=${manifest.display_name} v${manifest.version}`);
    console.log(`files=${requiredFiles.length}`);
}

import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requiredFiles = [
    'manifest.json',
    'index.js',
    'status-parser.js',
    'settings.html',
    'style.css',
    'README.md',
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
if (!indexSource.includes('textContent')) {
    errors.push('动态状态值必须通过 textContent 写入');
}
if (!indexSource.includes('ctx.swipe[direction].call')) {
    errors.push('开场白切换必须复用 SillyTavern 原生 swipe');
}
if (!indexSource.includes('ctx.updateMessageBlock')) {
    errors.push('消息重绘必须复用 SillyTavern 原生消息格式化路径');
}
if (!cssSource.includes('@media (max-width: 700px)')) {
    errors.push('缺少手机端样式契约');
}
if (/^\s*(body|html|#chat|\.mes|\.mes_text)\s*[,{]/m.test(cssSource)) {
    errors.push('CSS 出现未限定的酒馆全局节点选择器');
}
for (const heading of ['安装', '第一次使用', '开场白导航', '更新', '常见问题']) {
    if (!readmeSource.includes(heading)) {
        errors.push(`README 缺少新手章节：${heading}`);
    }
}

const files = await readdir(root);
if (files.some(file => /secret|token|cookie|credential/i.test(file))) {
    errors.push('仓库根目录出现疑似秘密文件名');
}

if (errors.length) {
    console.error('STATIC_CHECK_FAILED');
    errors.forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
} else {
    console.log('STATIC_CHECK_OK');
    console.log(`manifest=${manifest.display_name} v${manifest.version}`);
    console.log(`files=${requiredFiles.length}`);
}

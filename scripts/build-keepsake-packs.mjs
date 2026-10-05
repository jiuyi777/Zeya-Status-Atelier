import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';
import path from 'node:path';
import { KEEPSAKE_THEMES, keepsakeDefaults, buildKeepsakeGreetingFields } from '../opening-keepsake.js';
import { buildOpeningHomeRegexPack } from '../opening-home-generator.js';
import { createOpeningTemplate } from '../opening-template-package.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'output', '四时小物');
const { version } = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
await mkdir(out, { recursive: true });
for (const theme of KEEPSAKE_THEMES) {
  const data = keepsakeDefaults(theme.id);
  const home = { ...data, font: data.fontStyle, text: data.ink, entries: data.entries.map((entry, index) => ({ ...entry, target: index + 2 })) };
  const fields = buildKeepsakeGreetingFields(data);
  const rules = buildOpeningHomeRegexPack(home);
  for (const replacement of [fields.first_mes, ...fields.alternate_greetings, ...rules.map(rule => rule.replaceString)]) {
    const html = replacement.replace(/^\$1\n\n(?=```html\n)/, '');
    if (!/^```html\n<!DOCTYPE html>[\s\S]*<body>[\s\S]*<\/body><\/html>\n```\n?$/.test(html)) throw new Error('不完整的导出文档');
    for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) new Script(match[1]);
    if (/<img[^>]*src="(?:data:|blob:|file:|http:)/i.test(html)) throw new Error('导出包含非 HTTPS 图片');
  }
  for (const [suffix, value] of [['开场白字段包', fields], ['主页与返回正则', rules], ['工坊外观模板', createOpeningTemplate(home)]]) {
    const file = path.join(out, `${theme.name}-${suffix}.json`);
    await writeFile(file, JSON.stringify(value, null, 2) + '\n');
    JSON.parse(await readFile(file, 'utf8'));
  }
  console.log(`${theme.name}: 3 JSON files, complete documents and script syntax checked`);
}
await writeFile(path.join(out, '使用说明.md'), `# 四时小物 · v${version}

四款：风藏书页、留声片刻、沿途拾光、一页晴天。
每款有开场白字段包、主页与返回正则、工坊外观模板三份 JSON。
字段包含示例正文，不是完整角色卡；工坊外观模板只更新样式，保留原正文、真实序号和世界书绑定。

一次点击展开，正文末尾返回，返回后保持展开。标题、介绍、正文、字体和可选外链图片均可编辑，配图留空不会保留空框。
在工坊更新后重新生成并应用主页；手工导入局部正则前，先停用旧的“九一 · 开场白返回作品目录”，避免重复运行。导入会新增规则，不会自动覆盖。刷新并重开聊天后生效。
需要启用角色局部正则及酒馆助手 HTML 前端渲染。图片使用压缩 HTTPS 外链，接收者无需安装工坊。

本版下载：https://github.com/jiuyi777/Zeya-Status-Atelier/releases/tag/v${version}
`, 'utf8');

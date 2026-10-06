import { mkdir,writeFile,readFile } from 'node:fs/promises';
import { Script } from 'node:vm';
import { KINETIC_THEMES,kineticDefaults,buildKineticGreetingFields } from '../opening-kinetic.js';
import { buildOpeningHomeRegexPack } from '../opening-home-generator.js';
import { createOpeningTemplate } from '../opening-template-package.js';
const out=new URL('../output/动态开场实验/',import.meta.url);await mkdir(out,{recursive:true});
const {version}=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
for(const theme of KINETIC_THEMES){
 const d=kineticDefaults(theme.id),home={...d,font:d.fontStyle,text:d.ink,entries:d.entries.map((e,i)=>({...e,target:i+2}))};
 const fields=buildKineticGreetingFields(d),rules=buildOpeningHomeRegexPack(home);
 for(const replacement of [fields.first_mes,...fields.alternate_greetings,...rules.map(r=>r.replaceString)]){
  const html=replacement.replace(/^\$1\n\n(?=```html\n)/,'');
  if(!/^```html\n<!DOCTYPE html>[\s\S]*<body>[\s\S]*<\/body><\/html>\n```\n?$/.test(html))throw new Error('导出缺少完整文档');
  for(const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new Script(script[1]);
  if(/(?:src="|url\(')(?:data:|blob:|file:|http:)/.test(html))throw new Error('图片应使用 HTTPS 外链');
 }
 for(const [label,value] of [['开场白字段包',fields],['主页与返回正则',rules],['工坊外观模板',createOpeningTemplate(home)]]){
  const file=new URL(`${theme.name}-${label}.json`,out);await writeFile(file,JSON.stringify(value,null,2)+'\n');JSON.parse(await readFile(file,'utf8'));
 }
 console.log(`${theme.name}: 3 packages verified`);
}
await writeFile(new URL('使用说明.md',out),`# 动态开场实验 · v${version}

三款：此刻，开场（转动指针钟）、未读频率（像素收音机）、下一站，像素（像素小车与中央铁路）。

每款提供三种文件：

- 开场白字段包：作品导航和六篇短示例正文；替换成自己的内容后使用。
- 主页与返回正则：包含目录与随卡返回按钮。请先备份现有角色卡。
- 工坊外观模板：导入现有工坊替换外观，保留既有开场白序号与世界书线路。

编辑预览：opening-kinetic-preview.html；动态总览：opening-kinetic-overview.html。
点击作品名、作品介绍、本篇简介可修改文字，顶部“保存草稿”保存在本机浏览器。
《下一站》的顶部大字也可直接点选编辑，支持中英文、数字与换行，留空隐藏；文字依次出现一次后保持完整。大字内容随可编辑配置、工坊生成和字段包保存，导入外观模板不覆盖它。
介绍支持多段文字与可选外链图片，正文支持光标插图。图片使用压缩外链，不内嵌大图。

时钟红针持续选篇，点击编号只定位，点击“暂停指针”才停下；打开故事时短暂锁定，返回后继续转动。收音机可拖动调频、点前后频道或故事预设；它选择故事，不播放真实广播。
《下一站》小车沿铁路逐站巡游，点站点可改道，到站才切换对应简介；默认停留 4.6 秒，手动选站后停留 9 秒。宽屏在画面中央横向铺轨，手机在中央用缓弯连接各站，站名沿线交错排列；小车到端站后沿同一条铁路往返，车灯随行驶方向切换。暂停或减少动态时点站直接抵达。
三款都能打开正文，正文末尾可返回原篇目；可暂停动画，支持减少动态和手机宽度。
旧卡请重新应用主页与返回正则，旧字段包请重新导出，使返回入口移到正文末尾。手工导入正则会新增一份规则，请先停用旧的“九一 · 开场白返回作品目录”，再导入新版局部正则并刷新酒馆；全局和局部都安装过的需要一并检查。工坊自己的应用流程按固定 ID 更新。
按钮打开已填写的正文，不调用 AI。需要生成新正文时请使用工坊已有的开场白生成流程。

源码和本版下载：https://github.com/jiuyi777/Zeya-Status-Atelier/releases/tag/v${version}
使用时需要启用角色局部正则及酒馆助手 HTML 前端渲染；字段包不是完整角色卡。图片是外链，不包含原图。
顶部空框及底部返回已在本机 SillyTavern 1.14.0 验证；用户手机端和真实图床上传尚未核对。
`, 'utf8');

import {mkdir,writeFile,copyFile} from 'node:fs/promises';
import {REFERENCE_STATUS_PRESETS,buildReferencePreview} from '../reference-status.js';
import {buildRegexScript,buildWorldbookJson,normalizeRule} from '../rule-generator.js';
import {buildOpeningHomeRegex,buildOpeningHomePreviewDocument} from '../opening-home-generator.js';
const output=new URL('../deliverables/reference-collection/',import.meta.url);await mkdir(output,{recursive:true});
await mkdir(new URL('fonts/',output),{recursive:true});
for(const file of ['HuiwenMincho.woff2','LICENSE.txt'])await copyFile(new URL('../assets/reference-status/fonts/'+file,import.meta.url),new URL('fonts/'+file,output));
const links=[];
for(const p of REFERENCE_STATUS_PRESETS){
 const input={structure:p.id,title:p.title,ruleName:p.title,pagesText:p.pagesText,pageFieldsText:p.fields.map(f=>f.join('|')).join('\n'),sharedFieldsText:'',media:{avatarSource:'character'}};
 await writeFile(new URL(p.id+'.json',output),JSON.stringify(buildRegexScript(input),null,2)+'\n');
 await writeFile(new URL(p.id+'-worldbook.json',output),JSON.stringify(buildWorldbookJson(input),null,2)+'\n');
 const previewValues=p.id==='reference-wechat-night'?['联系人','21:40','对方：这是一条收到的消息。\n我：这是一条发出的回复。\n对方：较长的消息会在气泡内自然换行，头像和文字保持对齐。']:p.fields.map((f,i)=>f[0].includes('数值')||f[0].includes('强度')?'50':f[0].includes('日期')?'剧情日期':f[0]==='时间'?'21:40':'X');
 await writeFile(new URL(p.id+'.html',output),buildReferencePreview(normalizeRule(input),previewValues).replaceAll('/scripts/extensions/third-party/status-atelier/assets/reference-status/fonts/HuiwenMincho.woff2','./fonts/HuiwenMincho.woff2'));
 links.push(`<section><h2>${p.title}</h2><a href="${p.id}.html" target="_blank">打开独立预览</a><iframe title="${p.title}" src="${p.id}.html" loading="lazy"></iframe></section>`);
}
const home={theme:'social-reference',title:'暗夜社交主页',subtitle:'角色与故事档案',author:'九一',intro:'填写角色档案，选择故事开场。',entries:[{title:'故事开场',summary:'在制作界面绑定实际开场白。',target:2}]};
await writeFile(new URL('social-reference-home.json',output),JSON.stringify(buildOpeningHomeRegex(home),null,2)+'\n');
await writeFile(new URL('social-reference-home.html',output),buildOpeningHomePreviewDocument(home));
links.push('<section><h2>暗夜社交主页</h2><a href="social-reference-home.html" target="_blank">打开主页预览</a><iframe title="暗夜社交主页" src="social-reference-home.html"></iframe></section>');
await writeFile(new URL('index.html',output),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>九一 · 主题交互状态栏合集</title><style>*{box-sizing:border-box;scrollbar-width:none}*::-webkit-scrollbar{display:none}@font-face{font-family:Huiwen;src:url(./fonts/HuiwenMincho.woff2)}body{margin:0;background:#202020;color:#eee;font:16px/1.6 Huiwen;padding:20px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(360px,100%),1fr));gap:24px}section{min-width:0}h2{font-size:18px}a{color:#ccc}iframe{display:block;width:100%;height:620px!important;max-height:620px!important;border:0;background:transparent}</style><h1>九一 · 主题交互状态栏合集</h1><p>16 款状态栏 + 1 款主页 · 每款右上角切换昼夜 · 点击卡片标题展开内容 · X 为剧情占位</p><main>${links.join('')}</main></html>`);
console.log('REFERENCE_PACKS_OK: 16 regex + 16 worldbooks + 16 previews');

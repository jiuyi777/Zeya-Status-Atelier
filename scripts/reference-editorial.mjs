import {MOTIFS,MOTIF_BY_ID,writeMotifAssets} from './reference-motifs.mjs';
import {buildWechatTemplate} from './reference-wechat.mjs';
import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const dir=new URL('assets/reference-status/',root);
const ornament=await readFile(new URL('ornament.svg',dir),'utf8');
const tail=await readFile(new URL('floral-tail.svg',dir),'utf8');
const corner=await readFile(new URL('floral-corner.svg',dir),'utf8');
const base=await readFile(new URL('editorial.css',dir),'utf8');
let ticket=await readFile(new URL('ticket.css',dir),'utf8');

ticket+='\n.body-status-panel>summary{display:flow-root}.status-avatar{outline:1px solid var(--line);outline-offset:4px}';
const profiles={
 'blue-gold':['book','书摘与心声','NOTES / EXCERPTS'], 'wechat-night':['correspondence','夜间来信','PRIVATE MESSAGES'],
 'weibo':['correspondence','社交手帖','SOCIAL JOURNAL'], 'purple-thoughts':['ticket','心声档案','INNER MONOLOGUE'],
 'song-theatre':['ticket','歌笺小剧场','SONGS / THEATRE'], 'tianji':['book','天机录','CHRONICLES'],
 'gazette-one':['press','内心日报','DAILY / ONE VOICE'], 'gazette-two':['press','双声日报','DAILY / TWO VOICES'],
 'dual-voice':['ticket','月影双声','TWO VOICES'], 'magic-note':['book','观测手记','OBSERVATION NOTES'],
 'mode-monitor':['ticket','状态监测','BODY / THOUGHTS'], 'dream-canvas':['book','梦境画布','MOMENTS'],
 'study-slime':['book','学习手记','STUDY JOURNAL'], 'body-record':['ticket','身体记录','PRIVATE RECORD'],
 'eclipse-player':['ticket','蚀月唱机','LISTENING ROOM'], 'magazine':['press','故事杂志','STORY JOURNAL'],
 'social-home':['correspondence','角色与故事','IDENTITY / STORIES']};
// Change the source declarations once; retain the original layout/state selectors.
function themeTokens(css){return css
 .replace(/--(?:paper|ink|muted|line|soft)\s*:[^;{}]+;?/gi,'')
 .replace(/@import\s+[^;]+;/gi,'')
 .replace(/(?:-webkit-)?animation(?:-[\w-]+)?\s*:[^;{}]+;?/gi,'')
 .replace(/font-family\s*:[^;{}]+/gi,'font-family:Huiwen')
 .replace(/(background(?:-color|-image)?)\s*:\s*([^;{}]+)/gi,(_,prop,value)=>`${prop}:`+(/^\s*(?:transparent|none)(?:\s*!important)?\s*$/.test(value)?value:prop==='background-image'?'none':/gradient\(/.test(value)?'transparent':/url\(/.test(value)?value:'var(--soft)'))
 .replace(/(?<![-\w])color\s*:\s*[^;{}]+/gi,'color:var(--ink)')
 .replace(/((?:border(?:-[a-z]+)?|outline|box-shadow|text-shadow)\s*:[^;{}]*)/gi,s=>s.replace(/#[\da-f]{3,8}\b|rgba?\([^)]+\)|hsla?\([^)]+\)|var\([^)]+\)/gi,'var(--line)'))
 .replace(/(?:box-shadow|text-shadow)\s*:[^;{}]+/gi,m=>m.split(':')[0]+':none');}
export function editorialize(html,id){
 if(id==='reference-wechat-night')return buildWechatTemplate();
 const [family,title,subtitle]=profiles[id.replace('reference-','')]||profiles['social-home'];
 const plainBook=id==='reference-blue-gold';
 if(plainBook)html=html.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu,'').replace(/<span class="(?:icon|location-icon)">\s*<\/span>/g,'');
 html=html.replaceAll('悬停查看','点击查看');
 html=html.replace(/<link\b[^>]*(?:lxgw|fonts\.google)[^>]*>/gi,'');
 html=html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi,(_,css)=>'<style>'+themeTokens(css)+'</style>');
 html=html.replace(/style="([^"]*)"/g,(_,css)=>'style="'+themeTokens(css)+'"');
 if(id==='reference-body-record'){
  html=html.replace(/<style>[\s\S]*?<\/style>/,`<style>${ticket}</style>`).replace('✧ BODY STATUS ✧','身体档案');
 }
 // A repeating ticker hid long thoughts after autonomous motion was removed.
 if(id==='reference-magazine')html=html.replace('`${thoughts} ✦ ${thoughts} ✦ ${thoughts}`','thoughts');
 if(id==='reference-dream-canvas')html=html.replace(/\/\* ── 2\.[\s\S]*?(?=\}\)\(\);)/,'');
 const motif=MOTIF_BY_ID[id.replace('reference-','')]||'letter';
 const quiet=motif!=='floral';
 const art=motif==='floral'?{head:ornament,corner,tail}:MOTIFS[motif];
 const corners=`<span class="sta-scroll-corner sta-scroll-left">${art.corner.replaceAll('id="','id="left-')}</span><span class="sta-scroll-corner sta-scroll-right">${art.corner.replaceAll('id="','id="right-')}</span>`;
 const front=`<header class="sta-front">${plainBook?'':art.head}<h1 data-design-title>${title}</h1><p>${subtitle}</p>${quiet?'':corners}</header>`;
 html=html.replace(/<body[^>]*>/,`<body><main class="sta-edition" data-family="${family}" data-motif="${motif}"${quiet?' data-layout="quiet"':''}><div class="sta-tools"><span>JIUYI / ${subtitle}</span><button type="button" class="sta-theme" aria-label="切换到白天版" aria-pressed="true">白天版</button></div>${front}`)
 .replace('</body>',`${quiet?'':`<footer class="sta-endpiece" aria-hidden="true">${art.tail}</footer>`}</main></body>`);
 // First-level folds open initially so the content and controls can be discovered.
 html=html.replace(/<details(?![^>]*\bopen\b)([^>]*)>/, '<details$1 open>');
 return html.replace('</body>',`<style>${base}</style></body>`);
}
export async function buildEditorialAssets(){
 await writeMotifAssets(new URL('motifs/',dir));
 const font=(await readFile(new URL('fonts/HuiwenMincho.woff2',dir))).toString('base64');
 await writeFile(new URL('reference-font-data.js',root),'// Generated full CC0 font; shared once by all templates.\nexport const REFERENCE_FONT='+JSON.stringify(font)+';\n');
}

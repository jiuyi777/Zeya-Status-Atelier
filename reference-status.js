import {REFERENCE_STATUS_DATA} from './reference-status-data.js';
import {referenceFontStyle,editorialRuntime} from './reference-editorial-runtime.js';
export const REFERENCE_STATUS_PRESETS=Object.freeze(REFERENCE_STATUS_DATA.map(({html,...item})=>item));
export const REFERENCE_STATUS_IDS=Object.freeze(REFERENCE_STATUS_PRESETS.map(item=>item.id));
export const isReferenceStatus=id=>REFERENCE_STATUS_IDS.includes(id);
export const referenceStatusMeta=id=>REFERENCE_STATUS_DATA.find(item=>item.id===id);
export const referenceStatusTag=id=>'sta_'+id.replaceAll('-','_');
const json=value=>JSON.stringify(value).replace(/</g,'\\u003c').replace(/\$/g,'\\u0024');
export function referenceSettings(rule){return rule.media?.referenceSettings?.[rule.structure]||{};}
export function buildReferenceInstruction(rule){
 const meta=referenceStatusMeta(rule.structure);const fields=rule.pageFields;let slot=0;
 return ['在每次正文后追加以下区块。各值依据当前角色和剧情填写；禁止凭空补写人物事实。未知写未明确，不在场的人物写无。',
 '值内不得使用尖括号、英文方括号、英文竖线；不要输出HTML、代码围栏或填写说明。数值字段只填数字。书摘无可靠出处时使用角色随笔。',
 `<${referenceStatusTag(rule.structure)}>`,...meta.lines.map(([key,count])=>'['+key+'|'+Array.from({length:count},()=>{const f=fields[slot++];return `{{${f?.label||'内容'}：${f?.instruction||'依据当前剧情填写'}}}`;}).join('|')+']'),`</${referenceStatusTag(rule.structure)}>`].join('\n');
}
export function parseReferenceOutput(rule,raw){
 const meta=referenceStatusMeta(rule.structure);const tag=referenceStatusTag(rule.structure);
 const block=String(raw).match(new RegExp('<'+tag+'>\\s*([^<>]*?)\\s*</'+tag+'>','i'))?.[1];
 if(block===undefined)throw Error('缺少当前模板的状态区块：'+tag);
 const records=[...block.matchAll(/\[([^\[\]]+)\]/g)].map(m=>m[1].split('|').map(s=>s.trim()));
 if(records.length!==meta.lines.length)throw Error('状态记录数量与模板不一致');
 const values=[];meta.lines.forEach(([key,count],i)=>{const row=records[i];if(row[0]!==key||row.length!==count+1||row.slice(1).some(x=>!x))throw Error('状态字段不完整：'+key);values.push(...row.slice(1));});
 return {rule,shared:[],pages:[{page:rule.pages[0],values}],raw:String(raw)};
}
// This function runs inside the exported iframe. Values are inserted as text/attributes.
function referenceRuntime(config){
 const raw=document.getElementById('sta-ref-data').textContent;
 const blocks=[...raw.matchAll(/\[([^\[\]]+)\]/g)].map(m=>m[1].split('|').slice(1));
 const values=blocks.flat();const doc=new DOMParser().parseFromString(config.html,'text/html');
 const scripts=[...doc.querySelectorAll('script')].map(node=>({text:node.textContent,src:node.getAttribute('src')}));doc.querySelectorAll('script').forEach(n=>n.remove());
 doc.querySelectorAll('.wav[data-name],.wstk-av[data-name]').forEach(node=>{node.dataset.staAvatarIndex=String(Math.max(0,[1,4,7,10].indexOf(Number(node.getAttribute('data-name').slice(1)))));});
 const valueFor=n=>config.id==='reference-magazine'?raw:(values[n-1]??'X');
 const walker=doc.createTreeWalker(doc.body,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())if(!walker.currentNode.parentElement.closest('style'))nodes.push(walker.currentNode);
 nodes.forEach(node=>{if(!/\$\d+/.test(node.nodeValue))return;const frag=doc.createDocumentFragment();node.nodeValue.split(/(\$\d+)/).forEach(part=>{const m=part.match(/^\$(\d+)$/);if(!m){frag.append(doc.createTextNode(part));return;}const span=doc.createElement('span');span.dataset.capture=m[1];span.textContent=valueFor(Number(m[1]));frag.append(span);});node.replaceWith(frag);});
 doc.querySelectorAll('*').forEach(node=>[...node.attributes].forEach(attr=>{if(/\$\d+/.test(attr.value))node.setAttribute(attr.name,attr.value.replace(/\$(\d+)/g,(_,n)=>valueFor(Number(n))));}));
 document.head.append(...doc.head.childNodes);document.body.replaceChildren(...doc.body.childNodes);
 const style=document.createElement('style');style.textContent='*{box-sizing:border-box;scrollbar-width:none!important}*::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}html,body{margin:0;padding:0;min-width:0;background:transparent}body>details,body>section,body>div{max-width:100%}img{max-width:100%}[data-sta-reference-avatar]{background-size:cover!important;background-position:center!important;cursor:pointer}[data-sta-reference-avatar] img{width:100%;height:100%;object-fit:cover;border-radius:inherit}audio{max-width:100%}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}';document.head.append(style);

 if(config.id==='reference-wechat-night'&&config.media.worldbookName&&/^\d+$/.test(config.media.settingsUid||'')){
  (async()=>{try{let read;for(const scope of [window,window.parent]){try{if(typeof scope.getWorldbook==='function'){read=scope.getWorldbook.bind(scope);break;}if(typeof scope.TavernHelper?.getWorldbook==='function'){read=scope.TavernHelper.getWorldbook.bind(scope.TavernHelper);break;}}catch{}}
   if(!read)return;const entries=await read(config.media.worldbookName);const entry=entries.find(e=>e.uid===Number(config.media.settingsUid));let theme=entry?.content;try{theme=JSON.parse(theme).theme;}catch{}
   if(['day','night'].includes(theme))window.staApplyReferenceTheme?.(theme);
  }catch(error){const notice=document.createElement('p');notice.textContent='主题设置读取失败：'+error.message;document.body.append(notice);}})();
 }
 window.staReferenceMedia=config.media;
 scripts.forEach(({text,src})=>{if(src)return;const script=document.createElement('script');script.textContent=text;document.body.append(script);});
 const root=[...document.body.children].find(n=>n.matches('div,details,section,main,article'))||document.body;
 const titleNode=root.querySelector('[data-design-title],h1,h2');if(titleNode&&config.title){titleNode.textContent=config.title;titleNode.dataset.designTitle='';}
 config.avatars.forEach(selector=>root.querySelectorAll(selector).forEach((node,i)=>{
  const slot=selector.includes('user-avatar')?'user':config.id==='reference-weibo'?'account'+(node.getAttribute('data-name')||i):'character';
  node.dataset.staReferenceAvatar=slot;
  let url=slot==='user'?config.media.userAvatarUrl:config.media.avatarUrl;
  if(config.id==='reference-weibo')url=config.media.accountAvatars[Number(node.dataset.staAvatarIndex)]||url;
  if(config.media.avatarSource==='none'&&slot==='character')url='';
  if(url){if(node.tagName==='IMG')node.src=url;else{node.textContent='';node.style.backgroundImage='url('+JSON.stringify(url)+')';}node.setAttribute('aria-label','可配置头像');}
 }));
 const staticWalker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(staticWalker.nextNode()){const node=staticWalker.currentNode;if(node.parentElement.closest('script,style,[data-capture]'))continue;node.nodeValue=node.nodeValue.replace(/当前角色|人物一/g,config.media.characterName||'当前角色').replace(/人物二/g,config.media.secondaryName||'人物二').replace(/当前场景/g,config.media.locationText||'当前场景');}
 if(config.media.imageUrl){const node=document.createElement('img');node.src=config.media.imageUrl;node.alt=config.media.imageAlt||'配图';const figure=document.createElement('figure');figure.className='sta-scene';figure.append(node);node.addEventListener('error',()=>figure.remove(),{once:true});const front=root.querySelector('.sta-front');if(front)front.after(figure);else root.append(figure);}
 if(config.media.audioUrl&&config.id!=='reference-eclipse-player'){const audio=document.createElement('audio');audio.controls=true;audio.preload='none';audio.src=config.media.audioUrl;audio.style.cssText='display:block;width:100%;margin-top:12px';const end=root.querySelector('.sta-endpiece');if(end)end.before(audio);else root.append(audio);window.addEventListener('pagehide',()=>audio.pause(),{once:true});}
 // Apply field label edits only to explicit, matching label nodes; preserve layout.
 config.fields.forEach((field,i)=>{const original=config.defaults[i];if(!original||field.label===original)return;root.querySelectorAll('span,label,b,strong,h3,h4').forEach(n=>{if(!n.children.length&&n.textContent.trim()===original)n.textContent=field.label;});});
 const textNodes=[...root.querySelectorAll('h1,h2,h3,h4,h5,h6,span,strong,small,em,b,p,label,figcaption,dt,dd,li')].filter(n=>{const t=n.textContent.trim();return t&&t.length<=80&&/[A-Za-z0-9\u3400-\u9fff]/.test(t)&&!n.closest('button')&&!n.matches('[data-capture],[data-value],[data-label],[data-design-title]')&&!n.querySelector('[data-capture],[data-value],[data-label]')&&!n.children.length;});
 textNodes.forEach((node,i)=>{if(config.textOverrides[i])node.textContent=config.textOverrides[i];});
 function fit(){const frame=window.frameElement;if(frame){frame.style.height=Math.ceil(root.getBoundingClientRect().bottom+window.scrollY+12)+'px';frame.style.maxHeight='none';}}
 const observer=new ResizeObserver(fit);observer.observe(root);document.addEventListener('toggle',fit,true);window.addEventListener('load',fit,{once:true});window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});requestAnimationFrame(fit);
}
function safeUrl(value){const url=String(value||'').trim();return /^(?:https?:\/\/|data:image\/(?:png|jpeg|webp|gif);base64,|\/[^/])/i.test(url)?url:'';}
export function buildReferenceReplacement(rule,values){
 const meta=referenceStatusMeta(rule.structure);const options=referenceSettings(rule);const media=rule.media||{};
 const playlist=String(options.playlist||'').split(/\r?\n/).map(safeUrl).filter(Boolean);
 const config={id:rule.structure,html:meta.html,title:rule.title,avatars:meta.avatarSelectors,fields:rule.pageFields,defaults:meta.fields.map(f=>f[0]),textOverrides:rule.referenceTextOverrides||{},media:{characterName:options.characterName||media.characterName,secondaryName:options.secondaryName,locationText:options.locationText,worldbookName:options.worldbookName,settingsUid:options.settingsUid,avatarSource:media.avatarSource,avatarUrl:safeUrl(media.avatarUrl),userAvatarUrl:safeUrl(options.userAvatarOverride||media.userAvatarUrl),imageUrl:safeUrl(options.imageUrl),imageAlt:media.imageAlt,audioUrl:safeUrl(options.audioUrl||media.audioUrl),accountAvatars:[0,1,2,3].map(i=>safeUrl(options['avatar'+i])),playlist:playlist.length?playlist:(options.audioUrl||media.audioUrl)?[safeUrl(options.audioUrl||media.audioUrl)]:options.playlist===undefined?(meta.defaultPlaylist||[]):[]}};
 let slot=0;const raw=values?meta.lines.map(([key,count])=>'['+key+'|'+Array.from({length:count},()=>String(values[slot++]??'X')).join('|')+']').join('\n'):'$1';
 const escaped=raw.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
 return '```html\n<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+referenceFontStyle(Boolean(values))+'</head><body><div id="sta-ref-data" hidden>'+escaped+'</div><script>('+referenceRuntime.toString()+')('+json(config)+');('+editorialRuntime.toString()+')('+json(rule.structure)+');</script></body></html>\n```';
}
export function buildReferencePreview(rule,values){return buildReferenceReplacement(rule,values).replace(/^```html\s*/,'').replace(/\s*```$/,'');}

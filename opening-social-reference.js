import {REFERENCE_HOME_SOURCE} from './reference-home-data.js';
import {referenceFontStyle,editorialRuntime} from './reference-editorial-runtime.js';
export const SOCIAL_HOME_FIELDS=[['worldbook','目标世界书名称'],['uidUserInfo','档案资料条目 UID'],['uidVtuber','附加身份条目 UID'],['uidWeibo','微博规则条目 UID'],['uidWechat','微信规则条目 UID'],['uidSettings','微信主题设置条目 UID'],['musicUrl','主页音乐直链'],['modeOne','普通身份说明'],['modeTwo','附加身份说明']];
export function normalizeSocialBindings(value={}){return Object.fromEntries(SOCIAL_HOME_FIELDS.map(([key])=>[key,String(value?.[key]??'').trim().slice(0,key.startsWith('uid')?12:2000)]));}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function socialRuntime(config){
 const notice=document.querySelector('.sta-social-notice');
 function report(message){notice.textContent=message;}
 function api(name){for(const scope of [window,window.parent]){try{if(typeof scope[name]==='function')return scope[name].bind(scope);if(typeof scope.TavernHelper?.[name]==='function')return scope.TavernHelper[name].bind(scope.TavernHelper);}catch{}}return null;}
 const fields={weibo_name:'tdhn-wb-name',weibo_avatar:'tdhn-wb-avatar',weibo_bio:'tdhn-wb-bio',weibo_style:'tdhn-wb-style',alt_name:'tdhn-alt-name',alt_avatar:'tdhn-alt-avatar',alt_style:'tdhn-alt-style',vtuber_name:'tdhn-vt-name',vtuber_avatar:'tdhn-vt-avatar',vtuber_look:'tdhn-vt-look',vtuber_style:'tdhn-vt-style',vtuber_active:'tdhn-vt-active',vtuber_fame:'tdhn-vt-fame'};
 let busy=false;
 async function change(patches){
  if(busy)throw Error('正在保存，请稍候');
  const book=config.worldbook;const update=api('updateWorldbookWith');if(!book)throw Error('请先在制作界面填写目标世界书与条目 UID');if(!update)throw Error('需要酒馆助手的世界书接口');
  const normalized=patches.map(([key,patch])=>{const raw=config[key];if(!/^\d+$/.test(raw))throw Error('尚未配置 '+key+' 的条目 UID');return {uid:Number(raw),patch};});
  if(new Set(normalized.map(p=>p.uid)).size!==normalized.length)throw Error('不同用途不能绑定同一个条目 UID');
  busy=true;try{
   const result=await update(book,entries=>{for(const p of normalized)if(!entries.some(e=>e.uid===p.uid))throw Error('目标条目不存在：'+p.uid);return entries.map(e=>{const p=normalized.find(p=>p.uid===e.uid);return p?{...e,...p.patch}:e;});},{render:'debounced'});
   if(!normalized.every(p=>Object.entries(p.patch).every(([k,v])=>result.find(e=>e.uid===p.uid)?.[k]===v)))throw Error('世界书保存结果与请求不一致');
   report('已保存到 '+book);
  }finally{busy=false;}
 }
 window.tdhnSubmitForm=async function(event){event.preventDefault();try{if(!tdhnCurrentMode)throw Error('请先选择身份模式');const data={mode:tdhnCurrentMode};for(const [key,id]of Object.entries(fields))data[key]=document.getElementById(id).value.trim();await change([['uidUserInfo',{content:JSON.stringify(data,null,2)}],['uidVtuber',{enabled:tdhnCurrentMode==='vtuber'}]]);}catch(error){report(error.message);}};
 async function toggle(key,id,enabled){const control=document.getElementById(id);try{await change([[key,{enabled}]]);}catch(error){control.checked=!enabled;report(error.message);}}
 window.tdhnToggleWeibo=enabled=>toggle('uidWeibo','tdhn-toggle-weibo',enabled);
 window.tdhnToggleWechat=enabled=>toggle('uidWechat','tdhn-toggle-wechat',enabled);
 window.tdhnSwitchTheme=async function(theme,button){try{await change([['uidSettings',{content:JSON.stringify({theme})}]]);document.querySelectorAll('.tdhn-theme-btn').forEach(b=>b.classList.toggle('active',b===button));}catch(error){report(error.message);}};
 for(const id of ['tdhn-wb-avatar','tdhn-alt-avatar','tdhn-vt-avatar']){const input=document.getElementById(id);const preview=document.createElement('img');preview.alt='头像预览';preview.style.cssText='width:44px;height:44px;object-fit:cover;border-radius:50%';input.after(preview);const refresh=()=>{const url=input.value.trim();preview.hidden=!/^https?:\/\//i.test(url);if(!preview.hidden)preview.src=url;};input.addEventListener('input',refresh);preview.addEventListener('error',()=>preview.hidden=true);refresh();}
 async function restore(){const read=api('getWorldbook');if(!read||!config.worldbook)return;try{const entries=await read(config.worldbook);const entry=key=>/^\d+$/.test(config[key])?entries.find(e=>e.uid===Number(config[key])):null;const info=entry('uidUserInfo');if(info?.content){try{const data=JSON.parse(info.content);for(const [key,id]of Object.entries(fields)){if(typeof data[key]==='string'){document.getElementById(id).value=data[key];document.getElementById(id).dispatchEvent(new Event('input'));}}if(['tongdan','vtuber'].includes(data.mode))tdhnSelectMode(data.mode);}catch{report('资料条目不是本主页的档案格式，保留原内容。');}}
  for(const [key,id]of [['uidWeibo','tdhn-toggle-weibo'],['uidWechat','tdhn-toggle-wechat']]){const e=entry(key);if(e)document.getElementById(id).checked=e.enabled;}
  const setting=entry('uidSettings');let theme=setting?.content;try{theme=JSON.parse(theme).theme;}catch{}document.querySelectorAll('.tdhn-theme-btn').forEach(b=>b.classList.toggle('active',b.dataset.theme===theme));
 }catch(error){report('读取绑定失败：'+error.message);}}
 restore();
}
export function buildSocialReferenceHome(data,navigationScript){
 const config=normalizeSocialBindings(data.socialBindings);let html=REFERENCE_HOME_SOURCE.trim().replace(/^```html\s*/,'').replace(/\s*```$/,'');
 const oldScript=html.match(/<script>([\s\S]*?)<\/script>/)?.[1]||'';
 const uiScript=oldScript.slice(oldScript.indexOf('// 当前选中的模式'),oldScript.indexOf('// ===== 辅助：')).replaceAll('纯同担模式','普通身份模式').replaceAll('虚拟主播 + 同担模式','附加身份模式');
 html=html.replace(/<script>[\s\S]*?<\/script>/g,'').replace(/border-left\s*:\s*[^;{}]+;/gi,'border-left:0;');
 const replacements=[['同担同担你恨我',esc(data.title)],['他在阴沟里望着你的光',esc(data.subtitle)],['酒疫',esc(data.author)],['推荐预设：调酒师克 / 蛾摩拉g3',esc('推荐预设：'+data.preset)],
 ['林介，18岁，电子厂代练，一个把全部积蓄砸给虚拟主播的私生饭。你是他的同担——他恨你，视奸你，拉黑你又拉回来，说不清是嫉妒还是别的什么。',esc(data.intro)],
 ['你只是一个和林介追同一个虚拟主播的同担。在林介眼中，你光鲜亮丽，拥有他永远得不到的一切。他恨你，又离不开你。',esc(config.modeOne||'填写普通身份资料，与当前角色展开故事。')],
 ['你本人就是林介疯狂迷恋的那位虚拟主播，但同时你也在用小号当同担。林介不知道他视奸的同担就是主播本人。选择此模式会自动启用"同担_虚拟主播"条目。',esc(config.modeTwo||'填写附加身份资料，并启用作者绑定的附加身份条目。')]];
 for(const [from,to]of replacements)html=html.replaceAll(from,to);
 let card=0;html=html.replace(/(<div class="tdhn-mc-desc">)[\s\S]*?(<\/div>)/g,(_,a,b)=>a+esc(card++===0?(config.modeOne||'使用普通身份参与故事。'):(config.modeTwo||'使用附加身份参与故事。'))+b);
 html=html.replaceAll('同担_user信息','档案资料条目').replaceAll('同担_虚拟主播','附加身份条目').replaceAll('同担_微博Bot','微博规则条目').replaceAll('同担_微信','微信规则条目').replaceAll('同担_设置','主题设置条目').replaceAll('虚拟主播模式的核心设定','附加身份模式的设定').replaceAll('本卡需要5个世界书条目协同工作：','在制作界面按用途绑定世界书条目 UID：');
 html=html.replaceAll('林介','当前角色').replaceAll('纯同担','普通身份').replaceAll('虚拟主播 + 同担','附加身份').replaceAll('虚拟主播+同担模式','附加身份模式');
 html=html.replaceAll('头像 Emoji','头像 Emoji / 图片链接').replaceAll('maxlength="4"','maxlength="2000"');
 html=html.replace('<div class="tdhn-openings" id="tdhn-openings">\n      <!-- 由JS动态填充 -->\n    </div>',`<div class="tdhn-openings zoh-list" id="tdhn-openings">${data.entries.map(entry=>`<article class="zoh-entry tdhn-opening-item"><h4>${esc(entry.title)}</h4><p>${esc(entry.summary)}</p><button class="tdhn-mc-select-btn zoh-jump">进入故事</button></article>`).join('')}</div>`);
 html=html.replace('<div class="tdhn-section-label">选择故事开场</div>',`<div class="tdhn-section-label">选择故事开场</div>${data.worldlines.filter(line=>line.description).map(line=>`<details><summary>${esc(line.name)}</summary><p>${esc(line.description)}</p></details>`).join('')}`);
 const music=/^https?:\/\//i.test(config.musicUrl)?`<audio controls preload="none" src="${esc(config.musicUrl)}" style="width:100%"></audio>`:'';
 const image=/^https?:\/\//i.test(data.imageUrl||'')?`<figure class="sta-scene"><img alt="作品配图" src="${esc(data.imageUrl)}"></figure>`:'';
 html=html.replace('<hr class="tdhn-divider">',image+music+'<hr class="tdhn-divider">');
 html=html.replace('<div class="tdhn-wrap">','<div class="tdhn-wrap zoh-root">').replace('<div class="tdhn-footer">','<p class="sta-social-notice" role="status"></p><p class="zoh-notice" role="status"></p><div class="zoh-switch-toast" role="status"></div><div class="tdhn-footer">');
 const runtime=navigationScript.replace('script.previousElementSibling.previousElementSibling',"document.querySelector('.zoh-root')");
 html=html.replace('</head>',referenceFontStyle()+'</head>');
 const script='<script data-social-ui>('+editorialRuntime.toString()+')("social-home");'+uiScript+'\nfunction tdhnSubmitForm(event){event.preventDefault();document.querySelector(".sta-social-notice").textContent="预览模式：应用主页后可保存档案。"}function tdhnToggleWeibo(){}function tdhnToggleWechat(){}function tdhnSwitchTheme(theme,button){document.querySelectorAll(".tdhn-theme-btn").forEach(b=>b.classList.toggle("active",b===button))}</script><script>('+socialRuntime.toString()+')('+JSON.stringify(config).replace(/</g,'\\u003c')+');</script>';
 return html.replace('</body>',`<style>*{box-sizing:border-box;scrollbar-width:none!important}*::-webkit-scrollbar{display:none!important}body{margin:0;background:transparent}.sta-social-notice,.zoh-notice{color:#aaa;text-align:center;font:14px/1.6 sans-serif}.tdhn-form{max-width:100%}.tdhn-form input,.tdhn-form textarea{min-width:0;max-width:100%}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}</style>${script}<script>${runtime}</script></body>`);
}

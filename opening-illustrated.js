import { ILLUSTRATED_DATA } from './opening-illustrated-data.js';
export const ILLUSTRATED_ASSET_BASE = 'https://cdn.jsdelivr.net/gh/jiuyi777/Zeya-Status-Atelier@script-v1.1.0/assets/opening-illustrated/';
export const ILLUSTRATED_THEMES = Object.values(ILLUSTRATED_DATA).map((t,i)=>({id:t.id,name:`${i+28} ${t.name}`,description:'原版插画 · 动态作品资料与开场目录',values:{theme:t.id,font:'serif'}}));
export const isIllustratedTheme = theme => Object.hasOwn(ILLUSTRATED_DATA,theme);
const escape = value=>String(value??'').replace(/[&<>"'`]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[c]));
const json = value=>JSON.stringify(value).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
export function buildIllustratedDocument(data,navigationScript){
 const source=ILLUSTRATED_DATA[data.theme];if(!source)throw Error('未知插画开场样式');
 const records=data.entries||[];
 const state={...data,entries:records.map(e=>({...e,previewText:e.summary}))};
 const entries=records.map((entry,i)=>{
  const template=source.entries[Math.min(i,source.entries.length-1)];
  return template.replace(/___JIUYI_(ENTRY_\w+|INDEX|NUMBER|COUNT)___/g,(_,key)=>key==='INDEX'?String(i):key==='COUNT'?String(records.length).padStart(2,'0'):key==='NUMBER'?escape(entry.number||String(i+1).padStart(2,'0')):escape(entry[key.slice(6)]));
 }).join('');
 let html=source.html.replace(/___JIUYI_(HOME_\w+|ENTRIES|ASSET|COUNT)___/g,(_,key)=>key==='COUNT'?String(records.length).padStart(2,'0'):key==='ENTRIES'?entries:key==='ASSET'?ILLUSTRATED_ASSET_BASE:escape(data[key.slice(5)]));
 const behavior=source.behavior.replaceAll('___JIUYI_STATE___',()=>json(state));
 const runtime=navigationScript.replace('script.previousElementSibling.previousElementSibling',"document.querySelector('.zoh-root')");
 const styles='<style>*{scrollbar-width:none!important}*::-webkit-scrollbar{display:none!important}[data-home="intro"],[data-home="model"],[data-home="preset"]{white-space:pre-wrap}.zoh-notice{font:14px/1.6 sans-serif;padding:8px;text-align:center}.zoh-notice:empty,.zoh-switch-toast:empty{display:none}</style>';
 return html.replace('</head>',styles+'</head>').replace('<body>','<body><div class="zoh-root"><div class="zoh-list">').replace('</body>',()=>'</div><p class="zoh-notice" role="status"></p><div class="zoh-switch-toast" role="status"></div></div><script data-illustrated-local>'+behavior+'</script><script>document.querySelectorAll(".zoh-jump").forEach(b=>b.addEventListener("click",e=>e.preventDefault()));'+runtime+'</script></body>');
}

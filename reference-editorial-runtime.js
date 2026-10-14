import {HUIWEN_PUBLIC_FONT_URL} from './font-resources.js';
const installedFontUrl=new URL('./assets/reference-status/fonts/HuiwenMincho.woff2',import.meta.url);
const previewFontUrl=installedFontUrl.protocol==='file:'?'./fonts/HuiwenMincho.woff2':installedFontUrl.href;
export function referenceFontStyle(preview=false){return '<style>@font-face{font-family:Huiwen;src:url('+JSON.stringify(preview?previewFontUrl:HUIWEN_PUBLIC_FONT_URL)+') format("woff2");font-display:swap;font-weight:400}</style>';}
export function editorialRuntime(id){
 const root=document.querySelector('.sta-edition');if(!root)return;
 const button=root.querySelector('.sta-theme');const key='jiuyi:reference:'+id+':mode';
 let chosen=false;
 function apply(mode){const night=mode!=='day';document.documentElement.dataset.mode=night?'night':'day';button.textContent=night?'白天版':'黑夜版';button.setAttribute('aria-pressed',String(night));button.setAttribute('aria-label',night?'切换到白天版':'切换到黑夜版');}
 let saved;try{saved=localStorage.getItem(key)}catch{}chosen=['day','night'].includes(saved);apply(chosen?saved:'night');
 window.staApplyReferenceTheme=(mode)=>{if(!chosen)apply(mode);};
 button.addEventListener('click',()=>{chosen=true;const mode=document.documentElement.dataset.mode==='day'?'night':'day';apply(mode);try{localStorage.setItem(key,mode)}catch{}});
 // Keep short Chinese labels intact; longer editable labels may wrap normally.
 root.querySelectorAll('.card-title,.section-title,.xinhua-card-title,.selian-card-label,.accordion-title span,.tianji-section-title,.zeye-accordion-header span,.gz-tag,.cage-card-label,.outfit-label,.mood-label,.tdhn-acc-title,.thought-name').forEach(node=>{
  const text=node.textContent.trim();const chinese=(text.match(/[\u3400-\u9fff]/g)||[]).length;
  if(chinese>0&&chinese<=8&&text.length<=16&&!node.querySelector('[data-capture]'))node.dataset.staShortLabel='';
 });
 // Preserve the original flip content, while making it available on touch and keyboard.
 root.querySelectorAll('.flip-card,.song-flip-container,.fl-in').forEach(node=>{
  if(node.hasAttribute('onclick')||node.parentElement.hasAttribute('onclick'))return;
  node.dataset.staFlip='';node.tabIndex=0;node.setAttribute('role','button');node.setAttribute('aria-label','翻页查看背面');node.setAttribute('aria-pressed','false');
  const flip=()=>{const on=node.classList.toggle('sta-flipped');node.setAttribute('aria-pressed',String(on));};node.addEventListener('click',flip);node.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();flip();}});
 });
 root.querySelectorAll('[onclick]:not(button):not(a):not(input):not(summary),#cc-btn-prev,#cc-btn-play,#cc-btn-next').forEach(node=>{node.tabIndex=0;node.setAttribute('role','button');node.addEventListener('keydown',event=>{if(event.target===node&&(event.key==='Enter'||event.key===' ')){event.preventDefault();node.click();}});});
 [['cc-btn-prev','上一首'],['cc-btn-play','播放或暂停'],['cc-btn-next','下一首']].forEach(([id,label])=>{root.querySelector('#'+id)?.setAttribute('aria-label',label);});
 document.fonts.load('16px Huiwen','身体记录白天黑夜').then(fonts=>{document.documentElement.dataset.fontReady=String(fonts.length>0);}).catch(()=>{document.documentElement.dataset.fontReady='false';});
}

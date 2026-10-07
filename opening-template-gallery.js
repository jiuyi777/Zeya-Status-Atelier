import { HOME_TEMPLATES, LEGACY_HOME_TEMPLATES, openingPreviewHref } from './opening-home-catalog.js?v=0.11.39';
import { createOpeningTemplate, parseOpeningTemplate } from './opening-template-package.js?v=0.11.39';
const gallery=document.getElementById('gallery'),notice=document.getElementById('notice'),key='jiuyi-opening-template-shelf-v1';
let local=[];
try{local=JSON.parse(localStorage.getItem(key)||'[]').map(parseOpeningTemplate);}catch{notice.textContent='本机展架读取失败，仍可下载内置模板。';}
function download(p){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(p,null,2)],{type:'application/json'}));a.href=url;a.download=p.name.replace(/[<>:"/\\|?*]/g,'_')+'-工坊模板.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function render(){
 gallery.replaceChildren();
 const ordered=[...LEGACY_HOME_TEMPLATES,...HOME_TEMPLATES.filter(t=>!LEGACY_HOME_TEMPLATES.includes(t))];
 document.getElementById('count').textContent=`全部 ${HOME_TEMPLATES.length} 款 · 早期 ${LEGACY_HOME_TEMPLATES.length} 款 + 后续 ${HOME_TEMPLATES.length-LEGACY_HOME_TEMPLATES.length} 款`;
 for(const [p,label,description] of [...ordered.map(t=>[createOpeningTemplate(t.values,t.name,'九一'),LEGACY_HOME_TEMPLATES.includes(t)?'早期作品':'后续作品',t.description]),...local.map(p=>[p,'本机收藏','你收藏的外观配置'])]){
  const card=document.createElement('article'),swatches=document.createElement('div');
  card.dataset.theme=p.appearance.theme;
  swatches.className='swatches';swatches.setAttribute('aria-hidden','true');
  for(const key of ['background','accent','text']){const color=document.createElement('span');color.style.background=p.appearance[key];swatches.append(color);}
  const name=document.createElement('h2');name.textContent=p.name;
  const meta=document.createElement('p');meta.textContent=label+' · '+description;
  const actions=document.createElement('div');actions.className='card-actions';
  const preview=document.createElement('a');preview.className='button';preview.href=openingPreviewHref(p.appearance.theme);preview.textContent='打开预览 ↗';preview.setAttribute('aria-label','预览 '+p.name);
  const button=document.createElement('button');button.className='secondary';button.textContent='下载外观 ↓';button.onclick=()=>download(p);
  actions.append(preview,button);card.append(swatches,name,meta,actions);
  if(p.appearance.theme==='bloom-letter'){const candidate=document.createElement('a');candidate.href='./opening-bloom-letter-preview.html?art=pencil';candidate.textContent='看新版花朵与信封 ↗';candidate.className='candidate';card.append(candidate);}
  gallery.append(card);
 }
}
document.getElementById('import').onchange=async event=>{try{const file=event.target.files[0];if(!file)return;if(file.size>65536)throw new Error('外观模板请小于 64KB');const p=parseOpeningTemplate(JSON.parse(await file.text()));const next=[...local.filter(t=>!(t.name===p.name&&t.author===p.author)),p];localStorage.setItem(key,JSON.stringify(next));local=next;render();notice.textContent='已保存到本机展架，可重新下载；尚未公开发布。';}catch(e){notice.textContent=e.message;}finally{event.target.value='';}};
document.getElementById('submit').href='https://github.com/jiuyi777/Zeya-Status-Atelier/issues/new?title='+encodeURIComponent('[开场白模板投稿] 模板名称')+'&body='+encodeURIComponent('模板名称：\n作者署名：\n设计简介：\n\n请在此附上从工坊下载的外观模板 JSON 和预览截图。请确认素材允许分享。\n\n审核合入后进入公共模板列表。');
render();

import { buildNoirCollagePreview } from './opening-noir-collage.js';
import { withClassicalFrame } from './opening-classical-frame.js';
import { LEGACY_HOME_TEMPLATES } from './opening-home-catalog.js?v=0.11.39';
import { buildOpeningHomePreviewDocument } from './opening-home-generator.js?v=0.11.39';
import { createOpeningTemplate } from './opening-template-package.js?v=0.11.39';
const $=id=>document.getElementById(id),frame=document.querySelector('iframe');
let theme=LEGACY_HOME_TEMPLATES.find(t=>t.id===new URLSearchParams(location.search).get('theme'))||LEGACY_HOME_TEMPLATES[0];
$('theme').replaceChildren(...LEGACY_HOME_TEMPLATES.map(t=>new Option(t.name,t.id)));
$('title').value='故事未完';
$('subtitle').value=['classical','scroll'].includes(theme.id)?'一卷风月 · 静候君来':'THE BEGINNING';
$('intro').value='一座旧城，两次相逢。\n这里可以写作品的背景、人物和阅读提示。';
function settings(){return {...theme.values,title:$('title').value,subtitle:$('subtitle').value,author:'九一',intro:$('intro').value,model:'按角色卡设置',preset:'按你的习惯选择',entries:[{title:'雨停之前',summary:'檐下的陌生人，似乎一直在等你。',route:'初遇',target:1},{title:'久别重逢',summary:'旧街的灯还亮着，熟悉的声音从身后传来。',route:'重逢',target:2}]};}
function render(){
 $('theme').value=theme.id;$('name').textContent=theme.name;$('description').textContent=theme.description;
 const collage=theme.id==='noir-poster'&&new URLSearchParams(location.search).get('edition')==='collage';
 const ornate=theme.id==='classical'&&new URLSearchParams(location.search).get('edition')==='ornate';
 $('download').disabled=collage||ornate;$('download').title=collage||ornate?'新视觉样稿确认后开放导出':'';
 if(collage)$('description').textContent='胶片拼贴 · 动态主视觉 · 新版视觉样稿';
 if(ornate)$('description').textContent='素笺题名 · 暖白纸色 · 金线卷目';
 const html=collage?buildNoirCollagePreview(settings()):buildOpeningHomePreviewDocument(settings());
 frame.srcdoc=(ornate?withClassicalFrame(html):html).replace('</body>',`<script>new ResizeObserver(()=>parent.postMessage({type:'opening-preview-height',height:Math.ceil(document.body.getBoundingClientRect().height)},${JSON.stringify(location.origin)})).observe(document.body);<\/script></body>`);
}
window.addEventListener('message',event=>{if(event.source===frame.contentWindow&&event.origin===location.origin&&event.data?.type==='opening-preview-height'&&Number.isFinite(event.data.height))frame.style.height=Math.max(300,Math.min(16000,event.data.height+30))+'px';});
$('theme').onchange=()=>{theme=LEGACY_HOME_TEMPLATES.find(t=>t.id===$('theme').value);history.replaceState(null,'','?theme='+theme.id);render();};
for(const id of ['title','subtitle','intro'])$(id).oninput=render;
$('width').onclick=()=>{const phone=$('stage').classList.toggle('phone');$('width').textContent=phone?'恢复宽屏':'手机宽度';};
$('download').onclick=()=>{const p=createOpeningTemplate(settings(),theme.name,'九一'),url=URL.createObjectURL(new Blob([JSON.stringify(p,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=theme.name+'-工坊模板.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
render();

import { createOpeningImagePicker } from './opening-image-picker.js?v=0.11.41';
import { insertImageAt } from './opening-image-tools.js?v=0.11.41';
import { kineticDefaults, normalizeKinetic as normalizeFloral, buildKineticPage as buildFloralPage, buildKineticGreetingFields as buildFloralGreetingFields } from './opening-kinetic.js?v=0.11.41';
import { createOpeningTemplate } from './opening-template-package.js?v=0.11.41';
const $ = id => document.getElementById(id);
const frame = document.querySelector('iframe');
const initialTheme = new URLSearchParams(location.search).get('theme');
let data = normalizeFloral(kineticDefaults(initialTheme)), selected = data.entries[0].id, current = 'home';
const drafts = new Map();
const draftKey = () => 'status-atelier-kinetic-draft-v1:' + data.theme;
try { const saved = localStorage.getItem(draftKey()); if (saved) { data = normalizeFloral(JSON.parse(saved)); selected = data.entries[0]?.id; } } catch { $('editor-status').textContent = '本地草稿读取失败，当前显示初始模板。'; }
const entry = () => data.entries.find(item => item.id === selected);
function updateSelection() {
  $('entry').replaceChildren(...data.entries.map(item => new Option(item.title || '未命名开场白', item.id)));
  $('entry').value = selected || '';
  for (const key of ['title', 'summary', 'body', 'imageUrl']) { $('entry-' + key).value = entry()?.[key] || ''; $('entry-' + key).disabled = !entry(); }
  for (const id of ['remove', 'up', 'read', 'insert-body', 'upload-entry-cover']) $(id).disabled = !entry();
}
function render() {
  clearTimeout(pending);
  $('display-title-field').hidden=data.theme!=='pixel-dusk';
  if (current !== 'home' && !data.entries.some(item => item.id === current)) current = 'home';
  const adapter = `<script>window.getChatMessages=async()=>parent.kineticPreviewRead();window.setChatMessages=async(rows,options)=>parent.kineticPreviewSwitch(rows,options);

  document.addEventListener('DOMContentLoaded',()=>{
    const page=document.querySelector('main');
    const resize=()=>parent.kineticPreviewResize(page.getBoundingClientRect().bottom+20);
    new ResizeObserver(resize).observe(page);
    resize();
    const title=document.querySelector('h1');
    function editable(element,action,label){element.tabIndex=0;element.setAttribute('role','button');element.setAttribute('aria-label',label);element.title=label;element.style.cursor='pointer';element.dataset.previewEdit='true';element.classList.add('preview-editable');element.addEventListener('click',action);element.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();action();}});}
    if(title&&document.querySelector('[data-star-page]').dataset.starPage.endsWith('-home')){editable(title,()=>parent.kineticQuickEdit('title'),'点击修改作品名称');}
    document.querySelectorAll('[data-edit-display-title]').forEach(element=>editable(element,()=>parent.kineticQuickEdit('displayTitle'),'点击修改顶部大字'));
    document.querySelectorAll('[data-edit-intro]').forEach(element=>{element.dataset.empty=String(!element.textContent.trim());editable(element,()=>parent.kineticQuickEdit('intro'),'点击编辑作品介绍');});
    document.querySelectorAll('[data-edit-summary]').forEach(element=>{element.dataset.empty=String(!element.querySelector('.entry-summary').textContent.trim());editable(element,()=>parent.kineticQuickEdit('summary',element.dataset.editSummary),'点击编辑本篇简介');});
    document.querySelectorAll('[data-image-slot]').forEach(slot=>editable(slot,()=>parent.kineticQuickEdit('image',slot.dataset.imageSlot),'添加或更换本条配图'));
  });<\/script>`;
  frame.srcdoc = buildFloralPage(data, current, {preview:true}).replace('<body>', '<body>' + adapter);
  for(const button of document.querySelectorAll('[data-theme]'))button.setAttribute('aria-pressed',String(button.dataset.theme===data.theme));
  $('location').textContent = current === 'home' ? data.title : data.entries.find(item => item.id === current).title;
}
// Only this development page provides the simulated host; exported pages use TavernHelper.

window.kineticPreviewResize = height => {
  if (Number.isFinite(height)) frame.style.height = Math.max(250, Math.ceil(height)) + 'px';
};
window.kineticPreviewRead = () => [{ swipes: ['home', ...data.entries.map(item => item.id)].map(id => `<main data-star-page="${data.theme}-${id}"></main>`) }];
window.kineticPreviewSwitch = async rows => {
  if (rows.length !== 1 || rows[0].message_id !== 0) throw new Error('预览收到无效的消息目标');
  const target = ['home', ...data.entries.map(item => item.id)][rows[0].swipe_id];
  if (!target) throw new Error('目标开场白不存在');
  current = target;
  render();
  $('feedback').textContent = target === 'home' ? '本地模拟：已返回作品导航。' : '本地模拟：已进入开场白；正文末尾可返回作品导航。';
};
let pending;
function scheduleRender() { clearTimeout(pending); pending = setTimeout(render, 180); $('editor-status').textContent = '修改待保存'; }
for (const key of ['title', 'subtitle', 'displayTitle', 'author', 'intro', 'accent', 'ink', 'fontSize', 'fontStyle', 'imageUrl']) {
  $(key).value = data[key] || ""; $(key).oninput = () => { data[key] = key === 'fontSize' ? Number($(key).value) : $(key).value; scheduleRender(); };
}
$('entry').onchange = () => { selected = $('entry').value; updateSelection(); };
for (const key of ['title', 'summary', 'body', 'imageUrl']) $('entry-' + key).oninput = () => { if (!entry()) return; entry()[key] = $('entry-' + key).value; if (key === 'title') $('entry').selectedOptions[0].textContent = entry().title || '未命名开场白'; scheduleRender(); };
$('add').onclick = () => { const id = 'opening-' + crypto.randomUUID(); data.entries.push({ id, title: '新开场白', summary: '', body: '' }); selected = id; updateSelection(); scheduleRender(); };
$('remove').onclick = () => { data.entries = data.entries.filter(item => item.id !== selected); selected = data.entries[0]?.id; updateSelection(); scheduleRender(); };
$('up').onclick = () => { const i = data.entries.findIndex(item => item.id === selected); if (i > 0) { [data.entries[i-1], data.entries[i]] = [data.entries[i], data.entries[i-1]]; updateSelection(); scheduleRender(); } };
$('read').onclick = () => { current = selected; render(); };
$('rename').onclick=()=>window.kineticQuickEdit('title');
$('edit-intro').onclick=()=>window.kineticQuickEdit('intro');
$('replay').onclick=()=>{current='home';try{for(let i=sessionStorage.length-1;i>=0;i--){const key=sessionStorage.key(i);if(key.startsWith('status-atelier:kinetic:')&&key.endsWith(':'+JSON.stringify([data.theme,data.title,data.author,data.entries.map(item=>item.id)])))sessionStorage.removeItem(key);}}catch{}render();};
$('width').onclick = () => { const phone = $('stage').classList.toggle('phone'); $('width').textContent = phone ? '恢复宽屏' : '手机宽度'; };
$('toggle-editor').onclick = () => { const hidden = $('editor').hidden = !$('editor').hidden; document.querySelector('.workspace').style.gridTemplateColumns = hidden ? '1fr' : ''; $('toggle-editor').textContent = hidden ? '展开编辑' : '收起编辑'; };
function saveDraft() { try { localStorage.setItem(draftKey(), JSON.stringify(data)); $('editor-status').textContent = $('feedback').textContent = '草稿已保存在本机浏览器'; } catch { $('editor-status').textContent = $('feedback').textContent = '本地保存失败，请下载可编辑配置保存。'; } }
$('save').onclick = saveDraft;
$('save-quick').onclick = saveDraft;
function download(name, content) { const url = URL.createObjectURL(new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
$('export-draft').onclick = () => download('' + data.title + '-可编辑配置.json', data);
$('export-pages').onclick=()=>{try{download('' + data.title + '-开场白字段包.json',buildFloralGreetingFields(data));$('editor-status').textContent='字段包已生成，图片全部使用链接。';}catch(e){$('editor-status').textContent=e.message;}};
$('export-template').onclick=()=>download('' + data.title + '-工坊模板.json',createOpeningTemplate({...data,theme:data.theme,font:data.fontStyle,text:data.ink}));
$('import-draft').onchange=async event=>{try{const file=event.target.files[0];if(!file)return;if(file.size>2000000)throw new Error('配置过大，请选择小于 2MB 的配置');const parsed=JSON.parse(await file.text());if(!Array.isArray(parsed.entries)||parsed.entries.some(e=>!e||typeof e!=='object'))throw new Error('请选择可编辑配置 JSON');data=normalizeFloral(parsed);selected=data.entries[0]?.id;current='home';for(const key of ['title','subtitle','displayTitle','author','intro','accent','ink','fontSize','fontStyle','imageUrl'])$(key).value=data[key] || "";updateSelection();render();$('editor-status').textContent='已导入；点击保存本地草稿可保留修改。';}catch(e){$('editor-status').textContent=e.message;}finally{event.target.value='';}};
let quickTarget;
window.kineticQuickEdit = (kind, id) => {
  if(!['title','displayTitle','intro','summary','image'].includes(kind))return;
  const item=data.entries.find(item=>item.id===id);
  if((kind==='summary'||kind==='image')&&!item)return;
  quickTarget = {kind, id};
  const headings={displayTitle:'修改顶部大字',title:'修改作品名称',intro:'编辑作品介绍',summary:'编辑本篇简介',image:'添加开场白配图'};
  const labels={displayTitle:'支持中英文、数字和换行；留空隐藏，最多 80 字',title:'新的作品名称',intro:'作品的背景、人物与阅读提示',summary:item?.title||'本篇简介',image:'图片链接（留空可移除）'};
  $('quick-heading').textContent = headings[kind];
  $('quick-label').textContent = labels[kind];
  $('quick-value').maxLength = kind === 'displayTitle' ? 80 : 12000;
  $('quick-value').rows = kind === 'title' ? 1 : kind === 'image' ? 2 : 5;
  $('quick-value').value = kind === 'displayTitle' ? data.displayTitle : kind === 'title' ? data.title : kind === 'intro' ? data.intro : item?.[kind==='image'?'imageUrl':'summary'] || '';
  $('quick-error').textContent = '';
  $('quick-edit').showModal();
  $('quick-value').focus();
};
$('quick-cancel').onclick = () => $('quick-edit').close();
$('quick-form').onsubmit = event => {
  event.preventDefault();
  const value = $('quick-value').value.trim();
  if (quickTarget.kind === 'title') {
    if (!value) { $('quick-error').textContent = '请输入作品名称。'; return; }
    data.title = value.replace(/[\r\n]+/g,' '); $('title').value = data.title;
  } else if(quickTarget.kind === 'displayTitle') {
    data.displayTitle = value.slice(0,80); $('displayTitle').value = data.displayTitle;
  } else if(quickTarget.kind === 'intro') {
    data.intro = value; $('intro').value = value;
  } else {
    if (quickTarget.kind === 'image' && value && !value.startsWith('https://')) { $('quick-error').textContent = '请填写 https 图片链接。'; return; }
    const item = data.entries.find(item => item.id === quickTarget.id);
    if (item) { item[quickTarget.kind==='image'?'imageUrl':'summary'] = value; selected = item.id; updateSelection(); }
  }
  $('quick-edit').close();
  $('editor-status').textContent = $('feedback').textContent = '已应用修改；点击“保存草稿”可在下次打开时继续使用。';
  render();
};
updateSelection();
$('feedback').textContent = '本地模拟 · 选择篇目进入开场白，页内可返回作品导航。';
render();

const imagePicker=createOpeningImagePicker();
function insertAt(control,key,object){const start=control.selectionStart??control.value.length,end=control.selectionEnd??start;const original=control.value;imagePicker.open((url,alt)=>{if(control.value!==original){$('editor-status').textContent='文字已变化，请重新选择插入位置。';return;}const result=insertImageAt(original,start,end,url,alt);object[key]=result.text;control.value=result.text;control.focus();control.setSelectionRange(result.cursor,result.cursor);if(key==='body')current=object.id;scheduleRender();});}
$('insert-intro').onclick=()=>insertAt($('intro'),'intro',data);
$('insert-body').onclick=()=>{if(entry())insertAt($('entry-body'),'body',entry());};
function chooseCover(control,key,object){imagePicker.open(url=>{object[key]=url;control.value=url;scheduleRender();});}
$('upload-cover').onclick=()=>chooseCover($('imageUrl'),'imageUrl',data);
$('upload-entry-cover').onclick=()=>{if(entry())chooseCover($('entry-imageUrl'),'imageUrl',entry());};

for(const button of document.querySelectorAll('[data-theme]'))button.onclick=()=>{
  clearTimeout(pending);drafts.set(data.theme,data);
  const nextTheme=button.dataset.theme;
  let next=drafts.get(nextTheme);
  if(!next)try{const saved=localStorage.getItem('status-atelier-kinetic-draft-v1:'+nextTheme);if(saved)next=JSON.parse(saved);}catch{}
  data=normalizeFloral(next||kineticDefaults(nextTheme));selected=data.entries[0]?.id;current='home';
  for(const key of ['title','subtitle','displayTitle','author','intro','accent','ink','fontSize','fontStyle','imageUrl'])$(key).value=data[key]||'';
  updateSelection();render();history.replaceState(null,'','?theme='+data.theme+(document.body.classList.contains('stage-only')?'&stage=1':''));$('feedback').textContent='选择编号进入故事；时钟也会自动轮选。';
};

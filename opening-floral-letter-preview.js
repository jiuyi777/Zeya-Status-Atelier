import { FLORAL_DEFAULTS, normalizeFloral, buildFloralPage, buildFloralGreetingFields } from './opening-floral-letter.js';
const $ = id => document.getElementById(id);
const frame = document.querySelector('iframe');
let data = structuredClone(FLORAL_DEFAULTS), selected = data.entries[0].id, current = 'home';
try { const saved = localStorage.getItem('status-atelier-floral-letter-draft-v1'); if (saved) { data = normalizeFloral(JSON.parse(saved)); selected = data.entries[0]?.id; } } catch { $('editor-status').textContent = '本地草稿读取失败，当前显示初始模板。'; }
const entry = () => data.entries.find(item => item.id === selected);
function updateSelection() {
  $('entry').replaceChildren(...data.entries.map(item => new Option(item.title || '未命名开场白', item.id)));
  $('entry').value = selected || '';
  for (const key of ['title', 'summary', 'body', 'imageUrl']) { $('entry-' + key).value = entry()?.[key] || ''; $('entry-' + key).disabled = !entry(); }
  for (const id of ['remove', 'up', 'read']) $(id).disabled = !entry();
}
function render() {
  clearTimeout(pending);
  if (current !== 'home' && !data.entries.some(item => item.id === current)) current = 'home';
  const adapter = `<script>window.getChatMessages=async()=>parent.floralPreviewRead();window.setChatMessages=async(rows,options)=>parent.floralPreviewSwitch(rows,options);
  document.addEventListener('DOMContentLoaded',()=>{
    const title=document.querySelector('h1');
    function editable(element,action,label){element.tabIndex=0;element.setAttribute('role','button');element.setAttribute('aria-label',label);element.title=label;element.style.cursor='pointer';element.addEventListener('click',action);element.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();action();}});}
    if(title){editable(title,()=>parent.floralQuickEdit('title'),'点击修改作品名称');const hint=document.createElement('small');hint.textContent='点击标题修改名称';hint.style.cssText='font:9px sans-serif;opacity:.6;display:block;margin:-12px 0 17px';title.after(hint);}
    document.querySelectorAll('[data-image-slot]').forEach(slot=>editable(slot,()=>parent.floralQuickEdit('image',slot.dataset.imageSlot),'添加或更换本条配图'));
  });<\/script>`;
  frame.srcdoc = buildFloralPage(data, current).replace('<body>', '<body>' + adapter);
  $('location').textContent = current === 'home' ? data.title : data.entries.find(item => item.id === current).title;
}
// Only this development page provides the simulated host; exported pages use TavernHelper.
window.floralPreviewRead = () => [{ swipes: ['home', ...data.entries.map(item => item.id)].map(id => `<main data-star-page="floral-${id}"></main>`) }];
window.floralPreviewSwitch = async rows => {
  if (rows.length !== 1 || rows[0].message_id !== 0) throw new Error('预览收到无效的消息目标');
  const target = ['home', ...data.entries.map(item => item.id)][rows[0].swipe_id];
  if (!target) throw new Error('目标开场白不存在');
  current = target;
  render();
  $('feedback').textContent = target === 'home' ? '本地模拟：已返回作品导航。' : '本地模拟：已进入开场白；页首和页尾都能返回作品导航。';
};
let pending;
function scheduleRender() { clearTimeout(pending); pending = setTimeout(render, 180); $('editor-status').textContent = '修改待保存'; }
for (const key of ['title', 'subtitle', 'author', 'intro', 'accent', 'ink', 'fontSize', 'fontStyle', 'imageUrl']) {
  $(key).value = data[key]; $(key).oninput = () => { data[key] = key === 'fontSize' ? Number($(key).value) : $(key).value; scheduleRender(); };
}
$('entry').onchange = () => { selected = $('entry').value; updateSelection(); };
for (const key of ['title', 'summary', 'body', 'imageUrl']) $('entry-' + key).oninput = () => { if (!entry()) return; entry()[key] = $('entry-' + key).value; if (key === 'title') $('entry').selectedOptions[0].textContent = entry().title || '未命名开场白'; scheduleRender(); };
$('add').onclick = () => { const id = 'opening-' + crypto.randomUUID(); data.entries.push({ id, title: '新开场白', summary: '', body: '' }); selected = id; updateSelection(); scheduleRender(); };
$('remove').onclick = () => { data.entries = data.entries.filter(item => item.id !== selected); selected = data.entries[0]?.id; updateSelection(); scheduleRender(); };
$('up').onclick = () => { const i = data.entries.findIndex(item => item.id === selected); if (i > 0) { [data.entries[i-1], data.entries[i]] = [data.entries[i], data.entries[i-1]]; updateSelection(); scheduleRender(); } };
$('read').onclick = () => { current = selected; render(); };
$('home').onclick = () => { current = 'home'; render(); };
$('width').onclick = () => { const phone = $('stage').classList.toggle('phone'); $('width').textContent = phone ? '恢复宽屏' : '手机宽度'; };
$('toggle-editor').onclick = () => { const hidden = $('editor').hidden = !$('editor').hidden; document.querySelector('.workspace').style.gridTemplateColumns = hidden ? '1fr' : ''; $('toggle-editor').textContent = hidden ? '展开编辑' : '收起编辑'; };
$('save').onclick = () => { try { localStorage.setItem('status-atelier-floral-letter-draft-v1', JSON.stringify(data)); $('editor-status').textContent = '草稿已保存在本机浏览器'; } catch { $('editor-status').textContent = '本地保存失败，请下载可编辑配置保存。'; } };
function download(name, content) { const url = URL.createObjectURL(new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
$('export-draft').onclick = () => download('花间来信-可编辑配置.json', data);
$('export-pages').onclick = () => download('花间来信-开场白字段包.json', buildFloralGreetingFields(data));
let quickTarget;
window.floralQuickEdit = (kind, id) => {
  quickTarget = {kind, id};
  $('quick-heading').textContent = kind === 'title' ? '修改作品名称' : '添加开场白配图';
  $('quick-label').textContent = kind === 'title' ? '新的作品名称' : '图片链接（留空可移除）';
  $('quick-value').type = kind === 'title' ? 'text' : 'url';
  $('quick-value').value = kind === 'title' ? data.title : data.entries.find(item => item.id === id)?.imageUrl || '';
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
    data.title = value; $('title').value = value;
  } else {
    if (value && !value.startsWith('https://')) { $('quick-error').textContent = '请填写 https 图片链接。'; return; }
    const item = data.entries.find(item => item.id === quickTarget.id);
    if (item) { item.imageUrl = value; selected = item.id; updateSelection(); }
  }
  $('quick-edit').close();
  $('editor-status').textContent = '修改待保存';
  render();
};
updateSelection();
$('feedback').textContent = '本地模拟 · 点击箭头进入开场白，页内可返回作品导航。';
render();

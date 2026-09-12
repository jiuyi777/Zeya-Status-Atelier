import { LILY_DEFAULTS, normalizeLily, buildLilyPage, buildLilyGreetingFields } from './opening-lily-moon.js';
const $ = id => document.getElementById(id);
const frame = document.querySelector('iframe');
let data = structuredClone(LILY_DEFAULTS), selected = data.entries[0].id, current = 'home';
try { const saved = localStorage.getItem('status-atelier-lily-moon-draft-v1'); if (saved) { data = normalizeLily(JSON.parse(saved)); selected = data.entries[0]?.id; } } catch { $('editor-status').textContent = '本地草稿读取失败，当前显示初始模板。'; }
const entry = () => data.entries.find(item => item.id === selected);
function updateSelection() {
  $('entry').replaceChildren(...data.entries.map(item => new Option(item.title || '未命名开场白', item.id)));
  $('entry').value = selected || '';
  for (const key of ['title', 'summary', 'body']) { $('entry-' + key).value = entry()?.[key] || ''; $('entry-' + key).disabled = !entry(); }
  for (const id of ['remove', 'up', 'read']) $(id).disabled = !entry();
}
function render() {
  if (current !== 'home' && !data.entries.some(item => item.id === current)) current = 'home';
  const adapter = `<script>window.getChatMessages=async()=>parent.lilyPreviewRead();window.setChatMessages=async(rows,options)=>parent.lilyPreviewSwitch(rows,options);<\/script>`;
  frame.srcdoc = buildLilyPage(data, current).replace('<body>', '<body>' + adapter);
  $('location').textContent = current === 'home' ? '作品导航' : data.entries.find(item => item.id === current).title;
}
// Only this development page provides the simulated host; exported pages use TavernHelper.
window.lilyPreviewRead = () => [{ swipes: ['home', ...data.entries.map(item => item.id)].map(id => `<main data-star-page="lily-${id}"></main>`) }];
window.lilyPreviewSwitch = async rows => {
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
for (const key of ['title', 'summary', 'body']) $('entry-' + key).oninput = () => { if (!entry()) return; entry()[key] = $('entry-' + key).value; if (key === 'title') $('entry').selectedOptions[0].textContent = entry().title || '未命名开场白'; scheduleRender(); };
$('add').onclick = () => { const id = 'opening-' + crypto.randomUUID(); data.entries.push({ id, title: '新开场白', summary: '', body: '' }); selected = id; updateSelection(); scheduleRender(); };
$('remove').onclick = () => { data.entries = data.entries.filter(item => item.id !== selected); selected = data.entries[0]?.id; updateSelection(); scheduleRender(); };
$('up').onclick = () => { const i = data.entries.findIndex(item => item.id === selected); if (i > 0) { [data.entries[i-1], data.entries[i]] = [data.entries[i], data.entries[i-1]]; updateSelection(); scheduleRender(); } };
$('read').onclick = () => { current = selected; render(); };
$('home').onclick = () => { current = 'home'; render(); };
$('width').onclick = () => { const phone = $('stage').classList.toggle('phone'); $('width').textContent = phone ? '恢复宽屏' : '手机宽度'; };
$('toggle-editor').onclick = () => { const hidden = $('editor').hidden = !$('editor').hidden; document.querySelector('.workspace').style.gridTemplateColumns = hidden ? '1fr' : ''; $('toggle-editor').textContent = hidden ? '展开编辑' : '收起编辑'; };
$('save').onclick = () => { try { localStorage.setItem('status-atelier-lily-moon-draft-v1', JSON.stringify(data)); $('editor-status').textContent = '草稿已保存在本机浏览器'; } catch { $('editor-status').textContent = '本地保存失败，请下载可编辑配置保存。'; } };
function download(name, content) { const url = URL.createObjectURL(new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
$('export-draft').onclick = () => download('月下百合-可编辑配置.json', data);
$('export-pages').onclick = () => download('月下百合-开场白字段包.json', buildLilyGreetingFields(data));
updateSelection();
$('feedback').textContent = '本地模拟 · 点击箭头进入开场白，页内可返回作品导航。';
render();

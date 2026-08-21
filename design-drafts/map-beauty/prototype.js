const STORAGE_KEY = 'status-atelier-map-editor-v2';
const STATUS_LABELS = {
  current: '当前位置',
  completed: '已走过',
  available: '可前往',
  blocked: '已阻断',
  unknown: '未探明',
};

const defaultState = {
  objective: '等待 AI 更新当前任务',
  objects: [
    {
      id: 'place-1',
      name: '地点 01',
      imageUrl: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=640&q=80',
      description: '已经调查过的地点，线索会继续保留在地图上。',
      status: 'completed',
      connectFrom: '',
      x: 31,
      y: 32,
      rotation: -4,
      size: 104,
      z: 2,
    },
    {
      id: 'place-2',
      name: '地点 02',
      imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=640&q=80',
      description: '角色当前所在地点。AI 可通过 currentId 动态切换当前位置。',
      status: 'current',
      connectFrom: 'place-1',
      x: 63,
      y: 32,
      rotation: 3,
      size: 102,
      z: 4,
    },
    {
      id: 'place-3',
      name: '地点 03',
      imageUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=640&q=80',
      description: '当前可以前往的下一处地点。',
      status: 'available',
      connectFrom: 'place-2',
      x: 43,
      y: 68,
      rotation: -3,
      size: 98,
      z: 3,
    },
    {
      id: 'place-4',
      name: '地点 04',
      imageUrl: '',
      description: '尚未探明的地点，照片可在得到线索后再填写。',
      status: 'unknown',
      connectFrom: 'place-2',
      x: 78,
      y: 69,
      rotation: 5,
      size: 96,
      z: 1,
    },
  ],
};

const editor = document.querySelector('#map-editor');
const canvas = document.querySelector('#map-canvas');
const placeLayer = document.querySelector('#place-layer');
const connectionLayer = document.querySelector('#connection-layer');
const inspectorEmpty = document.querySelector('#inspector-empty');
const inspectorForm = document.querySelector('#inspector-form');
const duplicateButton = document.querySelector('#duplicate-button');
const previewToggle = document.querySelector('#preview-toggle');
const saveState = document.querySelector('#save-state');
const toast = document.querySelector('#toast');
const detail = document.querySelector('#place-detail');
const detailCard = detail.querySelector('.detail-card');
const exportDialog = document.querySelector('#export-dialog');
const regexOutput = document.querySelector('#regex-output');

const fields = {
  name: document.querySelector('#place-name'),
  imageUrl: document.querySelector('#place-image-url'),
  description: document.querySelector('#place-description'),
  status: document.querySelector('#place-status'),
  connectFrom: document.querySelector('#place-connect-from'),
  rotation: document.querySelector('#place-rotation'),
  size: document.querySelector('#place-size'),
};

let state = loadState();
let selectedId = null;
let mode = new URLSearchParams(location.search).get('preview') === '1' ? 'preview' : 'edit';
let dragState = null;
let toastTimer = 0;
let lastDetailTrigger = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !Array.isArray(saved.objects) || !saved.objects.length) return clone(defaultState);
    const objects = saved.objects
      .filter(item => item && typeof item.id === 'string')
      .slice(0, 16)
      .map((item, index) => normalizeObject(item, index));
    return objects.length ? { objective: String(saved.objective || defaultState.objective), objects } : clone(defaultState);
  } catch {
    return clone(defaultState);
  }
}

function normalizeObject(item, index = 0) {
  return {
    id: String(item.id || `place-${Date.now()}-${index}`).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 48),
    name: String(item.name || `地点 ${String(index + 1).padStart(2, '0')}`).slice(0, 28),
    imageUrl: isSafeHttpUrl(item.imageUrl) ? String(item.imageUrl) : '',
    description: String(item.description || '等待 AI 补充地点详情。').slice(0, 160),
    status: STATUS_LABELS[item.status] ? item.status : 'unknown',
    connectFrom: String(item.connectFrom || ''),
    x: clamp(Number(item.x), 7, 93, 50),
    y: clamp(Number(item.y), 10, 90, 50),
    rotation: clamp(Number(item.rotation), -12, 12, 0),
    size: clamp(Number(item.size), 72, 132, 100),
    z: clamp(Number(item.z), 1, 99, index + 1),
  };
}

function clamp(value, min, max, fallback) {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

function isSafeHttpUrl(value) {
  if (value === undefined || value === null || String(value).trim() === '') return false;
  try {
    const url = new URL(String(value).trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    saveState.textContent = '布局已保存到本机';
  } catch {
    saveState.textContent = '本机存储不可用，请及时生成正则';
  }
}

function selectedObject() {
  return state.objects.find(item => item.id === selectedId) || null;
}

function statusLabel(status) {
  return STATUS_LABELS[status] || STATUS_LABELS.unknown;
}

function svgElement(name, attributes = {}) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function renderConnections() {
  connectionLayer.replaceChildren();
  state.objects.forEach(object => {
    if (!object.connectFrom) return;
    const from = state.objects.find(item => item.id === object.connectFrom);
    if (!from || from.id === object.id) return;
    const x1 = from.x * 10;
    const y1 = from.y * 6.25;
    const x2 = object.x * 10;
    const y2 = object.y * 6.25;
    const bend = Math.min(46, Math.abs(x2 - x1) * .08) * (state.objects.indexOf(object) % 2 ? 1 : -1);
    const path = svgElement('path', {
      d: `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 + bend} ${x2} ${y2}`,
      class: 'route-thread',
      'data-status': object.status,
    });
    connectionLayer.append(path);
  });
}

function renderPlaces() {
  placeLayer.replaceChildren();
  state.objects.forEach(object => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'place-card';
    button.dataset.placeId = object.id;
    button.dataset.status = object.status;
    button.setAttribute('aria-label', `${object.name}，${statusLabel(object.status)}`);
    button.setAttribute('aria-pressed', String(mode === 'edit' && object.id === selectedId));
    button.style.setProperty('--x', `${object.x}%`);
    button.style.setProperty('--y', `${object.y}%`);
    button.style.setProperty('--rotation', `${object.rotation}deg`);
    button.style.setProperty('--object-scale', object.size / 100);
    button.style.setProperty('--z', object.z);

    const windowElement = document.createElement('span');
    windowElement.className = `photo-window${object.imageUrl ? '' : ' is-empty'}`;
    if (object.imageUrl) {
      const image = document.createElement('img');
      image.src = object.imageUrl;
      image.alt = '';
      image.loading = 'lazy';
      image.referrerPolicy = 'no-referrer';
      image.draggable = false;
      image.addEventListener('error', () => {
        image.remove();
        windowElement.classList.add('is-empty');
      });
      windowElement.append(image);
    }

    const caption = document.createElement('span');
    caption.className = 'place-caption';
    caption.textContent = object.name;
    const stateTag = document.createElement('span');
    stateTag.className = 'place-state';
    stateTag.textContent = statusLabel(object.status);
    button.append(windowElement, caption, stateTag);
    bindPlaceInteractions(button, object);
    placeLayer.append(button);
  });
}

function bindPlaceInteractions(button, object) {
  button.addEventListener('click', event => {
    if (button.dataset.dragged === 'true') {
      button.dataset.dragged = 'false';
      event.preventDefault();
      return;
    }
    if (mode === 'preview') {
      openDetail(object, button);
      return;
    }
    selectObject(object.id);
  });

  button.addEventListener('keydown', event => {
    if (mode !== 'edit') return;
    const movements = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
    if (movements[event.key]) {
      event.preventDefault();
      selectObject(object.id);
      moveSelected(...movements[event.key]);
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      selectObject(object.id);
      deleteSelected();
    }
  });

  button.addEventListener('pointerdown', event => {
    if (mode !== 'edit' || event.button !== 0) return;
    selectObject(object.id);
    const rect = canvas.getBoundingClientRect();
    dragState = {
      pointerId: event.pointerId,
      id: object.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: object.x,
      startY: object.y,
      rect,
      button,
      moved: false,
    };
    button.setPointerCapture?.(event.pointerId);
  });
  button.addEventListener('pointermove', event => {
    if (!dragState || dragState.pointerId !== event.pointerId || dragState.id !== object.id) return;
    const deltaX = ((event.clientX - dragState.startClientX) / dragState.rect.width) * 100;
    const deltaY = ((event.clientY - dragState.startClientY) / dragState.rect.height) * 100;
    if (Math.abs(deltaX) > .35 || Math.abs(deltaY) > .35) dragState.moved = true;
    object.x = clamp(dragState.startX + deltaX, 7, 93, object.x);
    object.y = clamp(dragState.startY + deltaY, 10, 90, object.y);
    button.style.setProperty('--x', `${object.x}%`);
    button.style.setProperty('--y', `${object.y}%`);
    updatePositionReadout(object);
    renderConnections();
  });
  const endDrag = event => {
    if (!dragState || dragState.pointerId !== event.pointerId || dragState.id !== object.id) return;
    button.dataset.dragged = String(dragState.moved);
    dragState = null;
    save();
  };
  button.addEventListener('pointerup', endDrag);
  button.addEventListener('pointercancel', endDrag);
}

function renderSummary() {
  const current = state.objects.find(item => item.status === 'current');
  document.querySelector('#current-place-name').textContent = current?.name || '尚未设定';
  document.querySelector('#current-objective').textContent = state.objective;
}

function renderInspector() {
  const object = selectedObject();
  inspectorEmpty.hidden = Boolean(object);
  inspectorForm.hidden = !object;
  duplicateButton.disabled = !object;
  if (!object) return;

  document.querySelector('#selected-object-title').textContent = object.name;
  fields.name.value = object.name;
  fields.imageUrl.value = object.imageUrl;
  fields.description.value = object.description;
  fields.status.value = object.status;
  fields.rotation.value = object.rotation;
  fields.size.value = object.size;
  document.querySelector('#url-error').hidden = true;
  fields.imageUrl.removeAttribute('aria-invalid');

  fields.connectFrom.replaceChildren();
  const emptyOption = document.createElement('option');
  emptyOption.value = '';
  emptyOption.textContent = '不连接';
  fields.connectFrom.append(emptyOption);
  state.objects.filter(item => item.id !== object.id).forEach(item => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.name;
    fields.connectFrom.append(option);
  });
  fields.connectFrom.value = state.objects.some(item => item.id === object.connectFrom) ? object.connectFrom : '';
  updatePositionReadout(object);
  document.querySelector('#rotation-output').textContent = `${object.rotation}°`;
  document.querySelector('#size-output').textContent = `${object.size}%`;
}

function render() {
  editor.dataset.mode = mode;
  previewToggle.setAttribute('aria-pressed', String(mode === 'preview'));
  previewToggle.querySelector('span').textContent = mode === 'preview' ? '返回编辑' : '成品预览';
  renderConnections();
  renderPlaces();
  renderSummary();
  renderInspector();
}

function selectObject(id, focusInspector = false) {
  selectedId = state.objects.some(item => item.id === id) ? id : null;
  render();
  if (focusInspector && selectedId) fields.name.focus();
}

function updatePositionReadout(object) {
  document.querySelector('#position-x').textContent = `X ${Math.round(object.x)}%`;
  document.querySelector('#position-y').textContent = `Y ${Math.round(object.y)}%`;
}

function updateSelected(changes, { rerender = true } = {}) {
  const object = selectedObject();
  if (!object) return;
  Object.assign(object, changes);
  save();
  if (rerender) render();
}

function moveSelected(dx, dy) {
  const object = selectedObject();
  if (!object) return;
  object.x = clamp(object.x + dx, 7, 93, object.x);
  object.y = clamp(object.y + dy, 10, 90, object.y);
  save();
  render();
  document.querySelector(`[data-place-id="${CSS.escape(object.id)}"]`)?.focus();
}

function addPlace(source = null) {
  if (state.objects.length >= 16) {
    showToast('一张地图最多放置 16 个地点。');
    return;
  }
  const index = state.objects.length + 1;
  const base = source || {};
  const id = `place-${Date.now().toString(36)}-${index}`;
  const object = normalizeObject({
    ...base,
    id,
    name: source ? `${source.name} 副本`.slice(0, 28) : `地点 ${String(index).padStart(2, '0')}`,
    x: clamp(Number(base.x ?? 50) + (source ? 4 : 0), 7, 93, 50),
    y: clamp(Number(base.y ?? 50) + (source ? 4 : 0), 10, 90, 50),
    connectFrom: source ? source.id : (state.objects.at(-1)?.id || ''),
    z: Math.max(0, ...state.objects.map(item => item.z)) + 1,
    status: source ? 'unknown' : 'available',
  }, index - 1);
  state.objects.push(object);
  selectedId = object.id;
  save();
  render();
  fields.name.focus();
  showToast(source ? '已复制地点照片。' : '已添加地点照片，请填写名称和 URL。');
}

function deleteSelected() {
  const object = selectedObject();
  if (!object) return;
  const index = state.objects.indexOf(object);
  const snapshot = clone(object);
  state.objects.splice(index, 1);
  state.objects.forEach(item => {
    if (item.connectFrom === object.id) item.connectFrom = object.connectFrom || '';
  });
  selectedId = null;
  save();
  render();
  showToast(`已删除“${snapshot.name}”。`, '撤销', () => {
    state.objects.splice(index, 0, snapshot);
    selectedId = snapshot.id;
    save();
    render();
  });
}

function moveLayer(direction) {
  const object = selectedObject();
  if (!object) return;
  const zValues = state.objects.map(item => item.z);
  object.z = direction > 0 ? Math.max(...zValues) + 1 : Math.max(1, Math.min(...zValues) - 1);
  save();
  render();
}

function showToast(message, actionLabel = '', action = null) {
  window.clearTimeout(toastTimer);
  toast.replaceChildren(document.createTextNode(message));
  if (actionLabel && action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = actionLabel;
    button.addEventListener('click', () => {
      action();
      hideToast();
    }, { once: true });
    toast.append(button);
  }
  toast.classList.add('is-visible');
  toastTimer = window.setTimeout(hideToast, 4800);
}

function hideToast() {
  toast.classList.remove('is-visible');
}

function openDetail(object, trigger) {
  lastDetailTrigger = trigger;
  document.querySelector('#detail-status').textContent = statusLabel(object.status);
  document.querySelector('#detail-title').textContent = object.name;
  document.querySelector('#detail-description').textContent = object.description;
  detail.classList.add('is-open');
  detail.setAttribute('aria-hidden', 'false');
  detailCard.focus();
}

function closeDetail() {
  if (!detail.classList.contains('is-open')) return;
  detail.classList.remove('is-open');
  detail.setAttribute('aria-hidden', 'true');
  lastDetailTrigger?.focus?.();
}

function safeScriptJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

const EXPORTED_CSS = `
*{box-sizing:border-box}html,body{min-width:320px;margin:0;background:transparent}button{font:inherit}.qm{--paper:#d8c4a0;--ink:#43382d;position:relative;isolation:isolate;width:min(100%,760px);aspect-ratio:16/10;min-height:360px;margin:14px auto;overflow:hidden;border:1px solid #5e3926;background:repeating-linear-gradient(2deg,rgba(255,255,255,.018) 0 1px,transparent 1px 5px),#6a3820;box-shadow:0 18px 42px rgba(0,0,0,.4),inset 0 0 70px rgba(40,14,5,.42);font-family:"Noto Sans SC","Microsoft YaHei",sans-serif}.qm:before{content:"";position:absolute;z-index:0;inset:0;background:radial-gradient(circle at 88% 12%,rgba(255,202,128,.16),transparent 21%),repeating-linear-gradient(87deg,transparent 0 22px,rgba(46,20,10,.08) 23px 25px)}.qm-book{position:absolute;z-index:1;inset:12% 10% 8%;filter:drop-shadow(0 10px 13px rgba(30,12,5,.38))}.qm-page{position:absolute;top:0;bottom:0;width:50.2%;border:1px solid rgba(91,68,44,.45);background:repeating-radial-gradient(circle at 0 0,rgba(87,62,36,.06) 0 1px,transparent 1px 7px),#d8c4a0;box-shadow:inset 0 0 30px rgba(108,74,39,.19)}.qm-page:first-child{left:0;border-radius:16px 2px 2px 12px}.qm-page:last-child{right:0;border-radius:2px 16px 12px 2px}.qm-grid{position:absolute;z-index:2;inset:7%;background:linear-gradient(90deg,transparent 49.8%,rgba(78,57,38,.2) 50%,transparent 50.2%),linear-gradient(transparent 49.8%,rgba(78,57,38,.16) 50%,transparent 50.2%);background-size:50% 50%;border:1px dashed rgba(78,57,38,.3)}.qm-routes{position:absolute;z-index:3;inset:0;width:100%;height:100%;pointer-events:none}.qm-route{fill:none;stroke:#983b31;stroke-width:4;stroke-linecap:round;filter:drop-shadow(0 2px 1px rgba(50,20,12,.38))}.qm-route[data-status=completed]{stroke:#73563a}.qm-route[data-status=blocked]{stroke:#5b211d;stroke-dasharray:15 10}.qm-route[data-status=unknown]{stroke:#7a6b58;stroke-dasharray:5 10}.qm-places{position:absolute;z-index:5;inset:0}.qm-place{--s:1;position:absolute;left:var(--x);top:var(--y);z-index:var(--z);width:clamp(88px,14.5%,145px);min-height:44px;padding:7px 7px 20px;border:0;color:#3d342c;background:#e7dfcf;box-shadow:0 7px 13px rgba(35,20,11,.36);cursor:pointer;transform:translate(-50%,-50%) rotate(var(--r)) scale(var(--s));touch-action:manipulation}.qm-place:before{content:"";position:absolute;z-index:3;left:50%;top:-7px;width:17px;height:17px;border-radius:50%;background:radial-gradient(circle at 33% 28%,#fff1cf 0 12%,#baa17a 38%,#6a5948 74%);box-shadow:0 2px 3px rgba(0,0,0,.45);transform:translateX(-50%)}.qm-place[data-status=current]:before{background:radial-gradient(circle at 33% 28%,#ffcfb7 0 12%,#b45242 38%,#62241f 74%);box-shadow:0 0 0 6px rgba(153,54,44,.2),0 2px 3px rgba(0,0,0,.45)}.qm-photo{position:relative;display:block;width:100%;aspect-ratio:1.38;overflow:hidden;border:1px solid rgba(55,47,39,.28);background:linear-gradient(145deg,transparent 0 45%,rgba(57,58,53,.68) 46% 58%,transparent 59%),linear-gradient(#bbb9af,#72756f)}.qm-photo img{display:block;width:100%;height:100%;object-fit:cover;filter:grayscale(1) sepia(.16) contrast(1.02)}.qm-photo:empty:after{content:"PHOTO";position:absolute;inset:0;display:grid;place-items:center;color:rgba(44,40,35,.5);font:800 .58rem/1 monospace;letter-spacing:.15em}.qm-name{position:absolute;left:5px;right:5px;bottom:4px;overflow:hidden;font:800 clamp(.62rem,1.1vw,.8rem)/1.2 "KaiTi",serif;text-align:center;text-overflow:ellipsis;white-space:nowrap}.qm-badge{position:absolute;right:-7px;bottom:-8px;padding:5px 7px;color:#f7ead4;background:#674a35;font:800 .52rem/1 monospace}.qm-summary{position:absolute;z-index:7;left:12%;bottom:3%;max-width:58%;padding:7px 10px;color:#4c392a;background:rgba(231,213,177,.91);box-shadow:0 5px 10px rgba(36,20,10,.25);transform:rotate(-1deg)}.qm-summary span,.qm-summary strong,.qm-summary small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.qm-summary span{font:800 .52rem/1 monospace}.qm-summary strong{margin:2px 0;font:800 .75rem/1.2 serif}.qm-summary small{font-size:.58rem}.qm-detail{position:absolute;z-index:20;inset:0;display:none;background:rgba(25,15,9,.66)}.qm-detail.open{display:grid;place-items:end center}.qm-card{width:min(86%,480px);margin-bottom:5%;padding:20px;color:#40352b;background:repeating-linear-gradient(0deg,transparent 0 26px,rgba(94,71,48,.09) 27px),#dfcfad;box-shadow:0 18px 44px rgba(0,0,0,.42)}.qm-back{min-height:44px;padding:0 10px;border:0;color:#4b392b;background:transparent;font-weight:800;cursor:pointer}.qm-card b{display:block;margin:12px 0 5px;color:#8d3e32;font:800 .62rem/1 monospace}.qm-card h2{margin:0 0 8px;font-family:serif}.qm-card p{margin:0;line-height:1.7}@media(max-width:520px){.qm{aspect-ratio:3/4}.qm-book{inset:7% 5% 9%}.qm-page{left:0!important;right:0!important;width:100%;height:50.2%}.qm-page:first-child{top:0;bottom:auto;border-radius:12px 12px 2px 2px}.qm-page:last-child{top:auto;bottom:0;border-radius:2px 2px 12px 12px}.qm-grid{background-size:50% 25%}.qm-place{width:clamp(80px,26%,108px)}.qm-badge{display:none}.qm-summary{left:6%;max-width:74%}}`;

function buildRegexHtml() {
  const config = {
    version: 1,
    objective: state.objective,
    objects: state.objects.map(item => ({ ...item })),
  };
  const configJson = safeScriptJson(config);
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>${EXPORTED_CSS}</style>
</head>
<body>
<article class="qm" id="qm">
  <div class="qm-book" aria-hidden="true"><span class="qm-page"></span><span class="qm-page"></span><span class="qm-grid"></span></div>
  <svg class="qm-routes" viewBox="0 0 1000 625" preserveAspectRatio="none" aria-hidden="true"></svg>
  <div class="qm-places" role="group" aria-label="任务地点"></div>
  <aside class="qm-summary"><span>当前位置</span><strong>尚未设定</strong><small></small></aside>
  <section class="qm-detail" aria-hidden="true"><div class="qm-card" role="dialog" aria-modal="true" tabindex="-1"><button class="qm-back" type="button">← 返回地图</button><b></b><h2></h2><p></p></div></section>
</article>
<script type="application/json" id="qm-data">$1</script>
<script>
(function(){
var config=${configJson};
var labels={current:'当前位置',completed:'已走过',available:'可前往',blocked:'已阻断',unknown:'未探明'};
var dynamic={};try{dynamic=JSON.parse(document.getElementById('qm-data').textContent.trim()||'{}')}catch(error){dynamic={}}
var overrides=Array.isArray(dynamic.places)?dynamic.places:[];
var places=config.objects.map(function(base){var change=overrides.find(function(item){return item&&item.id===base.id})||{};return Object.assign({},base,change)});
overrides.forEach(function(item,index){if(!item||!item.id||places.some(function(place){return place.id===item.id}))return;places.push(Object.assign({name:'新地点',imageUrl:'',description:'等待补充地点详情。',status:'unknown',connectFrom:'',x:16+(index%4)*22,y:18+(index%3)*31,rotation:0,size:92,z:places.length+1},item))});
if(dynamic.statuses&&typeof dynamic.statuses==='object'){places.forEach(function(place){if(labels[dynamic.statuses[place.id]])place.status=dynamic.statuses[place.id]})}
if(dynamic.currentId){places.forEach(function(place){if(place.id===dynamic.currentId)place.status='current';else if(place.status==='current')place.status='completed'})}
var root=document.getElementById('qm'),host=root.querySelector('.qm-places'),routes=root.querySelector('.qm-routes'),detail=root.querySelector('.qm-detail'),card=detail.querySelector('.qm-card');
function safeUrl(value){try{var url=new URL(String(value||''));return url.protocol==='http:'||url.protocol==='https:'?url.href:''}catch(error){return''}}
function close(){detail.classList.remove('open');detail.setAttribute('aria-hidden','true')}
detail.addEventListener('click',function(event){if(event.target===detail)close()});detail.querySelector('.qm-back').addEventListener('click',close);
places.forEach(function(place){
 if(place.connectFrom){var from=places.find(function(item){return item.id===place.connectFrom});if(from){var x1=from.x*10,y1=from.y*6.25,x2=place.x*10,y2=place.y*6.25,bend=Math.min(46,Math.abs(x2-x1)*.08);var path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M '+x1+' '+y1+' Q '+((x1+x2)/2)+' '+(((y1+y2)/2)+bend)+' '+x2+' '+y2);path.setAttribute('class','qm-route');path.dataset.status=place.status;routes.append(path)}}
 var button=document.createElement('button');button.type='button';button.className='qm-place';button.dataset.status=labels[place.status]?place.status:'unknown';button.style.setProperty('--x',Math.max(7,Math.min(93,Number(place.x)||50))+'%');button.style.setProperty('--y',Math.max(10,Math.min(90,Number(place.y)||50))+'%');button.style.setProperty('--r',Math.max(-12,Math.min(12,Number(place.rotation)||0))+'deg');button.style.setProperty('--s',Math.max(.72,Math.min(1.32,(Number(place.size)||100)/100)));button.style.setProperty('--z',Number(place.z)||1);button.setAttribute('aria-label',String(place.name||'未命名地点')+'，'+(labels[button.dataset.status]||labels.unknown));
 var photo=document.createElement('span');photo.className='qm-photo';var url=safeUrl(place.imageUrl);if(url){var image=document.createElement('img');image.src=url;image.alt='';image.loading='lazy';image.referrerPolicy='no-referrer';photo.append(image)}
 var name=document.createElement('span');name.className='qm-name';name.textContent=place.name||'未命名地点';var badge=document.createElement('span');badge.className='qm-badge';badge.textContent=labels[button.dataset.status]||labels.unknown;button.append(photo,name,badge);
 button.addEventListener('click',function(){card.querySelector('b').textContent=labels[button.dataset.status]||labels.unknown;card.querySelector('h2').textContent=place.name||'未命名地点';card.querySelector('p').textContent=place.description||'等待补充地点详情。';detail.classList.add('open');detail.setAttribute('aria-hidden','false');card.focus()});host.append(button);
});
var current=places.find(function(place){return place.status==='current'});root.querySelector('.qm-summary strong').textContent=current?current.name:'尚未设定';root.querySelector('.qm-summary small').textContent=String(dynamic.objective||config.objective||'');
})();
</script>
</body>
</html>`;
}

function buildRegexScript() {
  return {
    id: `status-atelier-quest-map-${Date.now().toString(36)}`,
    scriptName: '九一 · 可视化任务地图',
    disabled: false,
    runOnEdit: true,
    findRegex: '/<quest_map>\\s*([\\s\\S]*?)\\s*<\\/quest_map>/i',
    trimStrings: [],
    replaceString: `\`\`\`html\n${buildRegexHtml()}\n\`\`\``,
    placement: [2],
    substituteRegex: 0,
    minDepth: null,
    maxDepth: null,
    markdownOnly: true,
    promptOnly: false,
  };
}

function refreshExport() {
  regexOutput.value = JSON.stringify(buildRegexScript(), null, 2);
}

fields.name.addEventListener('input', () => {
  const object = selectedObject();
  if (!object) return;
  object.name = fields.name.value.slice(0, 28) || '未命名地点';
  save();
  renderPlaces();
  renderSummary();
  document.querySelector('#selected-object-title').textContent = object.name;
  fields.connectFrom.querySelectorAll('option').forEach(option => {
    const related = state.objects.find(item => item.id === option.value);
    if (related) option.textContent = related.name;
  });
});

fields.imageUrl.addEventListener('input', () => {
  const value = fields.imageUrl.value.trim();
  const error = document.querySelector('#url-error');
  if (value && !isSafeHttpUrl(value)) {
    error.hidden = false;
    fields.imageUrl.setAttribute('aria-invalid', 'true');
    return;
  }
  error.hidden = true;
  fields.imageUrl.removeAttribute('aria-invalid');
  updateSelected({ imageUrl: value });
});

fields.description.addEventListener('input', () => {
  const object = selectedObject();
  if (!object) return;
  object.description = fields.description.value.slice(0, 160);
  save();
});
fields.status.addEventListener('change', () => {
  const object = selectedObject();
  if (!object) return;
  if (fields.status.value === 'current') {
    state.objects.forEach(item => {
      if (item.id !== object.id && item.status === 'current') item.status = 'completed';
    });
  }
  object.status = fields.status.value;
  save();
  render();
});
fields.connectFrom.addEventListener('change', () => updateSelected({ connectFrom: fields.connectFrom.value }));
fields.rotation.addEventListener('input', () => updateSelected({ rotation: Number(fields.rotation.value) }));
fields.size.addEventListener('input', () => updateSelected({ size: Number(fields.size.value) }));

document.querySelectorAll('[data-nudge]').forEach(button => {
  button.addEventListener('click', () => {
    const [dx, dy] = button.dataset.nudge.split(',').map(Number);
    moveSelected(dx, dy);
  });
});
document.querySelector('#add-place-button').addEventListener('click', () => addPlace());
duplicateButton.addEventListener('click', () => addPlace(selectedObject()));
document.querySelector('#delete-place-button').addEventListener('click', deleteSelected);
document.querySelector('#layer-up-button').addEventListener('click', () => moveLayer(1));
document.querySelector('#layer-down-button').addEventListener('click', () => moveLayer(-1));
document.querySelectorAll('[data-close-detail]').forEach(button => button.addEventListener('click', closeDetail));

previewToggle.addEventListener('click', () => {
  mode = mode === 'edit' ? 'preview' : 'edit';
  if (mode === 'preview') selectedId = null;
  closeDetail();
  render();
});

document.querySelector('#reset-button').addEventListener('click', () => {
  if (!window.confirm('恢复木桌线索簿初始布局？当前本机草稿会被覆盖。')) return;
  state = clone(defaultState);
  selectedId = null;
  save();
  render();
  showToast('已恢复初始地图模板。');
});

document.querySelector('#generate-button').addEventListener('click', () => {
  refreshExport();
  exportDialog.showModal();
});
document.querySelector('#copy-regex-button').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(regexOutput.value);
    showToast('正则 JSON 已复制。');
  } catch {
    regexOutput.select();
    showToast('无法自动复制，已选中全部内容。');
  }
});
document.querySelector('#download-regex-button').addEventListener('click', () => {
  const blob = new Blob([regexOutput.value], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = '九一-可视化任务地图-正则.json';
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('正则 JSON 已下载。');
});

document.querySelector('#back-button').addEventListener('click', () => {
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'status-atelier-map-close' }, location.origin === 'null' ? '*' : location.origin);
    return;
  }
  location.href = './plugin-preview.html';
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (detail.classList.contains('is-open')) {
    closeDetail();
    return;
  }
  if (exportDialog.open) exportDialog.close();
});

window.__mapEditorTestApi = {
  getState: () => clone(state),
  buildRegexScript,
  addPlace: () => addPlace(),
  selectObject,
};

render();

const STORAGE_KEY = 'status-atelier-map-editor-v2';
const STATUS_LABELS = {
  current: '当前位置',
  completed: '已走过',
  available: '可前往',
  blocked: '已阻断',
  unknown: '未探明',
};
const FRAME_STYLES = new Set(['pin', 'tape', 'clip', 'collage']);
const LEGACY_INTROS = {
  '已经调查过的地点，线索会继续保留在地图上。': '已经调查过的地点。',
  '角色当前所在地点。AI 可通过 currentId 动态切换当前位置。': '角色当前所在地点。',
  '当前可以前往的下一处地点。': '当前可以前往的下一处地点。',
  '尚未探明的地点，照片可在得到线索后再填写。': '尚未探明。',
};

const defaultState = {
  objective: '',
  objects: [
    {
      id: 'place-1',
      name: '地点 01',
      imageUrl: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=640&q=80',
      intro: '已经调查过的地点。',
      frameStyle: 'pin',
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
      intro: '角色当前所在地点。',
      frameStyle: 'tape',
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
      intro: '当前可以前往的下一处地点。',
      frameStyle: 'clip',
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
      intro: '尚未探明。',
      frameStyle: 'collage',
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
const quickDeleteButton = document.querySelector('#quick-delete-button');
const newPlaceStyle = document.querySelector('#new-place-style');
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
  intro: document.querySelector('#place-intro'),
  frameStyle: document.querySelector('#place-style'),
  status: document.querySelector('#place-status'),
  rotation: document.querySelector('#place-rotation'),
  size: document.querySelector('#place-size'),
};

let state = loadState();
let selectedId = null;
let mode = new URLSearchParams(location.search).get('preview') === '1' ? 'preview' : 'edit';
let dragState = null;
let toastTimer = 0;
let lastDetailTrigger = null;
let connectionStartId = null;
let backgroundDataUri = '';
let backgroundLoadPromise = null;

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
    const objective = String(saved.objective || '');
    return objects.length ? { objective: objective.startsWith('等待 AI 更新') ? '' : objective, objects } : clone(defaultState);
  } catch {
    return clone(defaultState);
  }
}

function normalizeObject(item, index = 0) {
  const legacyIntro = String(item.intro ?? item.description ?? '');
  const intro = LEGACY_INTROS[legacyIntro] ?? (legacyIntro.startsWith('等待 AI 补充') ? '' : legacyIntro);
  return {
    id: String(item.id || `place-${Date.now()}-${index}`).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 48),
    name: String(item.name || `地点 ${String(index + 1).padStart(2, '0')}`).slice(0, 28),
    imageUrl: isSafeHttpUrl(item.imageUrl) ? String(item.imageUrl) : '',
    intro: intro.slice(0, 60),
    frameStyle: FRAME_STYLES.has(item.frameStyle) ? item.frameStyle : ['pin', 'tape', 'clip', 'collage'][index % 4],
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
    button.classList.toggle('is-connection-source', mode === 'edit' && object.id === connectionStartId);
    button.dataset.placeId = object.id;
    button.dataset.status = object.status;
    button.dataset.frame = object.frameStyle;
    button.setAttribute('aria-label', `${object.name}，${statusLabel(object.status)}`);
    button.setAttribute('aria-pressed', String(mode === 'edit' && object.id === selectedId));
    button.style.setProperty('--x', `${object.x}%`);
    button.style.setProperty('--y', `${object.y}%`);
    button.style.setProperty('--rotation', `${object.rotation}deg`);
    button.style.setProperty('--object-scale', object.size / 100);
    button.style.setProperty('--z', object.z);

    const attachment = document.createElement('span');
    attachment.className = 'place-attachment';
    attachment.setAttribute('aria-hidden', 'true');

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
    button.append(attachment, windowElement, caption, stateTag);
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

  button.addEventListener('dblclick', event => {
    if (mode !== 'edit' || button.dataset.dragged === 'true') return;
    event.preventDefault();
    event.stopPropagation();
    if (connectionStartId === object.id) {
      connectionStartId = null;
      renderPlaces();
      showToast('已取消红线起点。');
      return;
    }
    if (!connectionStartId) {
      connectionStartId = object.id;
      renderPlaces();
      showToast('再双击另一张照片连接红线。');
      return;
    }
    const source = state.objects.find(item => item.id === connectionStartId);
    if (!source) {
      connectionStartId = object.id;
      renderPlaces();
      return;
    }
    object.connectFrom = source.id;
    connectionStartId = null;
    selectedId = object.id;
    save();
    render();
    showToast(`已连接“${source.name}”与“${object.name}”。`);
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
  const objective = document.querySelector('#current-objective');
  objective.textContent = state.objective;
  objective.hidden = !state.objective;
}

function renderInspector() {
  const object = selectedObject();
  inspectorEmpty.hidden = Boolean(object);
  inspectorForm.hidden = !object;
  duplicateButton.disabled = !object;
  quickDeleteButton.disabled = !object;
  if (!object) return;

  document.querySelector('#selected-object-title').textContent = object.name;
  fields.name.value = object.name;
  fields.imageUrl.value = object.imageUrl;
  fields.intro.value = object.intro;
  fields.frameStyle.value = object.frameStyle;
  fields.status.value = object.status;
  fields.rotation.value = object.rotation;
  fields.size.value = object.size;
  document.querySelector('#url-error').hidden = true;
  fields.imageUrl.removeAttribute('aria-invalid');

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
  placeLayer.querySelectorAll('.place-card').forEach(button => {
    button.setAttribute('aria-pressed', String(mode === 'edit' && button.dataset.placeId === selectedId));
  });
  renderInspector();
  if (focusInspector && selectedId) fields.name.focus();
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

function findOpenPosition() {
  const slots = [
    { x: 20, y: 24 }, { x: 50, y: 24 }, { x: 80, y: 24 },
    { x: 24, y: 50 }, { x: 50, y: 50 }, { x: 76, y: 50 },
    { x: 20, y: 76 }, { x: 50, y: 76 }, { x: 80, y: 76 },
  ];
  if (!state.objects.length) return slots[4];
  return slots.reduce((best, slot) => {
    const nearest = Math.min(...state.objects.map(item => ((item.x - slot.x) ** 2) + ((item.y - slot.y) ** 2)));
    return nearest > best.nearest ? { ...slot, nearest } : best;
  }, { ...slots[0], nearest: -1 });
}

function addPlace(source = null, requestedStyle = 'pin') {
  if (state.objects.length >= 16) {
    showToast('一张地图最多放置 16 个地点。');
    return;
  }
  const index = state.objects.length + 1;
  const base = source || {};
  const position = findOpenPosition();
  const id = `place-${Date.now().toString(36)}-${index}`;
  const object = normalizeObject({
    ...base,
    id,
    name: source ? `${source.name} 副本`.slice(0, 28) : `地点 ${String(index).padStart(2, '0')}`,
    intro: source ? source.intro : '',
    frameStyle: source ? source.frameStyle : (FRAME_STYLES.has(requestedStyle) ? requestedStyle : 'pin'),
    x: position.x,
    y: position.y,
    connectFrom: '',
    z: Math.max(0, ...state.objects.map(item => item.z)) + 1,
    status: source ? 'unknown' : 'available',
  }, index - 1);
  state.objects.push(object);
  selectedId = object.id;
  save();
  render();
  fields.name.focus();
  showToast(source ? '已复制地点。' : '已添加地点，请填写名称和照片 URL。');
}

function deleteSelected() {
  const object = selectedObject();
  if (!object) return;
  const index = state.objects.indexOf(object);
  const snapshot = clone(object);
  state.objects.splice(index, 1);
  state.objects.forEach(item => {
    if (item.connectFrom === object.id) item.connectFrom = '';
  });
  if (connectionStartId === object.id) connectionStartId = null;
  selectedId = null;
  save();
  render();
  showToast(`已删除地点“${snapshot.name}”。`, '撤销', () => {
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
  const intro = document.querySelector('#detail-intro');
  intro.textContent = object.intro;
  intro.hidden = !object.intro;
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
*{box-sizing:border-box}html,body{min-width:320px;margin:0;background:transparent}button{font:inherit}.qm{position:relative;isolation:isolate;width:min(100%,760px);aspect-ratio:16/10;min-height:360px;margin:14px auto;overflow:hidden;border:1px solid #5e3926;background:#6a3820 url("__MAP_BACKGROUND__") center/cover no-repeat;box-shadow:0 18px 42px rgba(0,0,0,.4);font-family:"Noto Sans SC","Microsoft YaHei",sans-serif}.qm-routes{position:absolute;z-index:3;inset:0;width:100%;height:100%;pointer-events:none}.qm-route{fill:none;stroke:#983b31;stroke-width:4;stroke-linecap:round;filter:drop-shadow(0 2px 1px rgba(50,20,12,.38))}.qm-route[data-status=completed]{stroke:#73563a}.qm-route[data-status=blocked]{stroke:#5b211d;stroke-dasharray:15 10}.qm-route[data-status=unknown]{stroke:#7a6b58;stroke-dasharray:5 10}.qm-places{position:absolute;z-index:5;inset:0}.qm-place{--s:1;position:absolute;left:var(--x);top:var(--y);z-index:var(--z);width:clamp(88px,14.5%,145px);min-height:44px;padding:7px 7px 20px;border:0;color:#3d342c;background:#e7dfcf;box-shadow:0 7px 13px rgba(35,20,11,.36);cursor:pointer;transform:translate(-50%,-50%) rotate(var(--r)) scale(var(--s));touch-action:manipulation}.qm-place:before{content:"";position:absolute;z-index:3;left:50%;top:-7px;width:17px;height:17px;border-radius:50%;background:radial-gradient(circle at 33% 28%,#fff1cf 0 12%,#baa17a 38%,#6a5948 74%);box-shadow:0 2px 3px rgba(0,0,0,.45);transform:translateX(-50%)}.qm-place[data-status=current]:before{background:radial-gradient(circle at 33% 28%,#ffcfb7 0 12%,#b45242 38%,#62241f 74%);box-shadow:0 0 0 6px rgba(153,54,44,.2),0 2px 3px rgba(0,0,0,.45)}.qm-photo{position:relative;display:block;width:100%;aspect-ratio:1.38;overflow:hidden;border:1px solid rgba(55,47,39,.28);background:linear-gradient(145deg,transparent 0 45%,rgba(57,58,53,.68) 46% 58%,transparent 59%),linear-gradient(#bbb9af,#72756f)}.qm-photo img{display:block;width:100%;height:100%;object-fit:cover;filter:grayscale(1) sepia(.16) contrast(1.02)}.qm-photo:empty:after{content:"PHOTO";position:absolute;inset:0;display:grid;place-items:center;color:rgba(44,40,35,.5);font:800 .58rem/1 monospace;letter-spacing:.15em}.qm-name{position:absolute;left:5px;right:5px;bottom:4px;overflow:hidden;font:800 clamp(.62rem,1.1vw,.8rem)/1.2 "KaiTi",serif;text-align:center;text-overflow:ellipsis;white-space:nowrap}.qm-badge{position:absolute;right:-7px;bottom:-8px;padding:5px 7px;color:#f7ead4;background:#674a35;font:800 .52rem/1 monospace}.qm-summary{position:absolute;z-index:7;left:12%;bottom:3%;max-width:58%;padding:7px 10px;color:#4c392a;background:rgba(231,213,177,.91);box-shadow:0 5px 10px rgba(36,20,10,.25);transform:rotate(-1deg)}.qm-summary span,.qm-summary strong,.qm-summary small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.qm-summary span{font:800 .52rem/1 monospace}.qm-summary strong{margin:2px 0;font:800 .75rem/1.2 serif}.qm-summary small{font-size:.58rem}.qm-detail{position:absolute;z-index:20;inset:0;display:none;background:rgba(25,15,9,.66)}.qm-detail.open{display:grid;place-items:end center}.qm-card{width:min(86%,480px);margin-bottom:5%;padding:20px;color:#40352b;background:repeating-linear-gradient(0deg,transparent 0 26px,rgba(94,71,48,.09) 27px),#dfcfad;box-shadow:0 18px 44px rgba(0,0,0,.42)}.qm-back{min-height:44px;padding:0 10px;border:0;color:#4b392b;background:transparent;font-weight:800;cursor:pointer}.qm-card b{display:block;margin:12px 0 5px;color:#8d3e32;font:800 .62rem/1 monospace}.qm-card h2{margin:0 0 8px;font-family:serif}.qm-card p{margin:0;line-height:1.7}@media(max-width:520px){.qm{aspect-ratio:3/4}.qm-place{width:clamp(80px,26%,108px)}.qm-badge{display:none}.qm-summary{left:6%;max-width:74%}}`;

const EXPORTED_FRAME_CSS = `
.qm-place:before{display:none}.qm-attachment{position:absolute;z-index:8;display:block;left:50%;pointer-events:none}.qm-place[data-frame=pin] .qm-attachment{top:-10px;width:20px;height:20px;border:1px solid #47351f;border-radius:50%;background:radial-gradient(circle at 33% 24%,#fff2bc 0 9%,#cda55a 23%,#85622f 55%,#3b2a19 100%);box-shadow:inset -2px -3px 4px rgba(39,24,10,.42),inset 2px 2px 3px rgba(255,239,180,.5),1px 4px 5px rgba(20,12,7,.52);transform:translateX(-50%)}.qm-place[data-frame=pin] .qm-attachment:after{content:"";position:absolute;left:9px;top:15px;width:2px;height:8px;background:linear-gradient(90deg,#443827,#d2c39f 48%,#514431)}.qm-place[data-frame=pin][data-status=current] .qm-attachment{background:radial-gradient(circle at 33% 24%,#ffd4bf 0 9%,#bc5b49 25%,#702c25 58%,#351715 100%);box-shadow:inset -2px -3px 4px rgba(50,13,10,.45),inset 2px 2px 3px rgba(255,206,188,.42),0 0 0 5px rgba(153,54,44,.18),1px 4px 5px rgba(20,12,7,.52)}.qm-place[data-frame=tape]{background:#ddd0b7}.qm-place[data-frame=tape] .qm-attachment{top:-7px;width:54%;height:18px;background:repeating-linear-gradient(90deg,rgba(111,86,49,.08) 0 2px,transparent 2px 7px),rgba(222,197,142,.78);box-shadow:0 2px 4px rgba(45,28,13,.18);transform:translateX(-50%) rotate(-2deg)}.qm-place[data-frame=clip]{border-left:2px solid rgba(94,85,72,.38)}.qm-place[data-frame=clip] .qm-attachment{left:22%;top:-13px;width:18px;height:34px;border:3px solid #a9a79f;border-bottom-color:transparent;border-radius:10px 10px 7px 7px;box-shadow:inset 1px 0 #ece9dd,2px 2px 3px rgba(35,28,23,.28);transform:rotate(-7deg)}.qm-place[data-frame=collage]{background:#d5c5a6;box-shadow:-7px 8px 0 rgba(94,67,42,.24),0 12px 18px rgba(35,20,11,.4)}.qm-place[data-frame=collage] .qm-photo{border:4px solid #f0e5cf;transform:rotate(-1deg)}.qm-place[data-frame=collage] .qm-attachment{left:auto;right:8px;top:-10px;width:24px;height:24px;border:3px double rgba(255,221,196,.42);border-radius:50%;background:radial-gradient(circle at 35% 30%,#bd6250,#783128 63%,#431b18);box-shadow:1px 4px 5px rgba(40,18,12,.42);transform:rotate(8deg)}`;

function blobToDataUri(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result || '')), { once: true });
    reader.addEventListener('error', () => reject(reader.error || new Error('底图读取失败')), { once: true });
    reader.readAsDataURL(blob);
  });
}

function ensureBackgroundDataUri() {
  if (backgroundDataUri) return Promise.resolve(backgroundDataUri);
  if (!backgroundLoadPromise) {
    backgroundLoadPromise = fetch('./assets/detective-desk-blank.webp')
      .then(response => {
        if (!response.ok) throw new Error(`底图加载失败：${response.status}`);
        return response.arrayBuffer();
      })
      .then(buffer => blobToDataUri(new Blob([buffer], { type: 'image/webp' })))
      .then(dataUri => {
        if (!dataUri.startsWith('data:image/webp;base64,')) throw new Error('底图格式无效');
        backgroundDataUri = dataUri;
        return dataUri;
      })
      .catch(error => {
        backgroundLoadPromise = null;
        throw error;
      });
  }
  return backgroundLoadPromise;
}

function buildRegexHtml(mapBackground = backgroundDataUri) {
  const config = {
    version: 1,
    objective: state.objective,
    objects: state.objects.map(item => ({ ...item })),
  };
  const configJson = safeScriptJson(config);
  const exportedCss = `${EXPORTED_CSS}${EXPORTED_FRAME_CSS}`.replace('__MAP_BACKGROUND__', mapBackground);
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>${exportedCss}</style>
</head>
<body>
<article class="qm" id="qm">
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
overrides.forEach(function(item,index){if(!item||!item.id||places.some(function(place){return place.id===item.id}))return;places.push(Object.assign({name:'新地点',imageUrl:'',intro:'',frameStyle:'pin',status:'unknown',connectFrom:'',x:16+(index%4)*22,y:18+(index%3)*31,rotation:0,size:92,z:places.length+1},item))});
if(dynamic.statuses&&typeof dynamic.statuses==='object'){places.forEach(function(place){if(labels[dynamic.statuses[place.id]])place.status=dynamic.statuses[place.id]})}
if(dynamic.currentId){places.forEach(function(place){if(place.id===dynamic.currentId)place.status='current';else if(place.status==='current')place.status='completed'})}
var root=document.getElementById('qm'),host=root.querySelector('.qm-places'),routes=root.querySelector('.qm-routes'),detail=root.querySelector('.qm-detail'),card=detail.querySelector('.qm-card');
function safeUrl(value){try{var url=new URL(String(value||''));return url.protocol==='http:'||url.protocol==='https:'?url.href:''}catch(error){return''}}
function close(){detail.classList.remove('open');detail.setAttribute('aria-hidden','true')}
detail.addEventListener('click',function(event){if(event.target===detail)close()});detail.querySelector('.qm-back').addEventListener('click',close);
places.forEach(function(place){
 if(place.connectFrom){var from=places.find(function(item){return item.id===place.connectFrom});if(from){var x1=from.x*10,y1=from.y*6.25,x2=place.x*10,y2=place.y*6.25,bend=Math.min(46,Math.abs(x2-x1)*.08);var path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M '+x1+' '+y1+' Q '+((x1+x2)/2)+' '+(((y1+y2)/2)+bend)+' '+x2+' '+y2);path.setAttribute('class','qm-route');path.dataset.status=place.status;routes.append(path)}}
 var button=document.createElement('button');button.type='button';button.className='qm-place';button.dataset.status=labels[place.status]?place.status:'unknown';button.dataset.frame=['pin','tape','clip','collage'].includes(place.frameStyle)?place.frameStyle:'pin';button.style.setProperty('--x',Math.max(7,Math.min(93,Number(place.x)||50))+'%');button.style.setProperty('--y',Math.max(10,Math.min(90,Number(place.y)||50))+'%');button.style.setProperty('--r',Math.max(-12,Math.min(12,Number(place.rotation)||0))+'deg');button.style.setProperty('--s',Math.max(.72,Math.min(1.32,(Number(place.size)||100)/100)));button.style.setProperty('--z',Number(place.z)||1);button.setAttribute('aria-label',String(place.name||'未命名地点')+'，'+(labels[button.dataset.status]||labels.unknown));
 var attachment=document.createElement('span');attachment.className='qm-attachment';attachment.setAttribute('aria-hidden','true');
 var photo=document.createElement('span');photo.className='qm-photo';var url=safeUrl(place.imageUrl);if(url){var image=document.createElement('img');image.src=url;image.alt='';image.loading='lazy';image.referrerPolicy='no-referrer';photo.append(image)}
 var name=document.createElement('span');name.className='qm-name';name.textContent=place.name||'未命名地点';var badge=document.createElement('span');badge.className='qm-badge';badge.textContent=labels[button.dataset.status]||labels.unknown;button.append(attachment,photo,name,badge);
 button.addEventListener('click',function(){var intro=String(place.intro||place.description||'');card.querySelector('b').textContent=labels[button.dataset.status]||labels.unknown;card.querySelector('h2').textContent=place.name||'未命名地点';card.querySelector('p').textContent=intro;card.querySelector('p').hidden=!intro;detail.classList.add('open');detail.setAttribute('aria-hidden','false');card.focus()});host.append(button);
});
var current=places.find(function(place){return place.status==='current'}),summaryText=String(dynamic.objective||config.objective||''),summarySmall=root.querySelector('.qm-summary small');root.querySelector('.qm-summary strong').textContent=current?current.name:'尚未设定';summarySmall.textContent=summaryText;summarySmall.hidden=!summaryText;
})();
</script>
</body>
</html>`;
}

function buildRegexScript(mapBackground = backgroundDataUri) {
  return {
    id: `status-atelier-quest-map-${Date.now().toString(36)}`,
    scriptName: '九一 · 可视化任务地图',
    disabled: false,
    runOnEdit: true,
    findRegex: '/<quest_map>\\s*([\\s\\S]*?)\\s*<\\/quest_map>/i',
    trimStrings: [],
    replaceString: `\`\`\`html\n${buildRegexHtml(mapBackground)}\n\`\`\``,
    placement: [2],
    substituteRegex: 0,
    minDepth: null,
    maxDepth: null,
    markdownOnly: true,
    promptOnly: false,
  };
}

async function refreshExport() {
  const mapBackground = await ensureBackgroundDataUri();
  regexOutput.value = JSON.stringify(buildRegexScript(mapBackground), null, 2);
}

fields.name.addEventListener('input', () => {
  const object = selectedObject();
  if (!object) return;
  object.name = fields.name.value.slice(0, 28) || '未命名地点';
  save();
  renderPlaces();
  renderSummary();
  document.querySelector('#selected-object-title').textContent = object.name;
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

fields.intro.addEventListener('input', () => {
  const object = selectedObject();
  if (!object) return;
  object.intro = fields.intro.value.slice(0, 60);
  save();
});
fields.frameStyle.addEventListener('change', () => updateSelected({ frameStyle: fields.frameStyle.value }));
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
fields.rotation.addEventListener('input', () => updateSelected({ rotation: Number(fields.rotation.value) }));
fields.size.addEventListener('input', () => updateSelected({ size: Number(fields.size.value) }));
document.querySelector('#add-place-button').addEventListener('click', () => addPlace(null, newPlaceStyle.value));
duplicateButton.addEventListener('click', () => addPlace(selectedObject()));
document.querySelector('#delete-place-button').addEventListener('click', deleteSelected);
quickDeleteButton.addEventListener('click', deleteSelected);
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

document.querySelector('#generate-button').addEventListener('click', async event => {
  const button = event.currentTarget;
  button.disabled = true;
  try {
    await refreshExport();
    exportDialog.showModal();
  } catch {
    showToast('底图无法内嵌，请从插件预览入口通过本地服务打开后再生成。');
  } finally {
    button.disabled = false;
  }
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

ensureBackgroundDataUri().catch(() => {});
render();

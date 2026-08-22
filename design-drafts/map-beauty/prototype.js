const STORAGE_KEY = 'status-atelier-map-editor-v2';
const STATUS_LABELS = {
  current: '进行中',
  completed: '已走过',
  available: '可前往',
  blocked: '已阻断',
  unknown: '未探明',
};
const FRAME_STYLE_LIST = ['pin', 'tape', 'clip', 'ticket', 'lens'];
const FRAME_STYLES = new Set(FRAME_STYLE_LIST);
const MAP_TEMPLATE_LIST = ['desk-casebook', 'travel-atlas', 'urban-research', 'noir-network', 'crime-collage', 'travel-souvenir', 'urban-investigation', 'retro-archive'];
const MAP_TEMPLATES = new Set(MAP_TEMPLATE_LIST);
const DEFAULT_FRAME_LABELS = {
  pin: '黄铜别针',
  tape: '旧棕格绑带',
  clip: '银色票夹',
  ticket: '票据齿边',
  lens: '圆形镜片',
};
const TEMPLATE_FRAME_LABELS = {
  'crime-collage': { pin: '别针拍立得', tape: '电脑案件窗口', clip: '撕边胶片', ticket: '报纸证物框', lens: '镜头证物照' },
  'travel-souvenir': { pin: '旅行明信片', tape: '火车票照片', clip: '行李牌照片', ticket: '邮票照片', lens: '折叠地图快照' },
  'urban-investigation': { pin: '报纸证物框', tape: '监控窗口', clip: '胶片联络表', ticket: '案件夹照片', lens: '圆形调查镜头' },
  'retro-archive': { pin: '电脑文件窗口', tape: 'CRT 监控屏', clip: '扫描预览', ticket: '缩略图文件夹', lens: '暗房档案袋' },
};
const ASSET_URLS = {
  deskBackground: './assets/detective-desk-blank.webp',
  travelBackground: './assets/map-backgrounds/travel-atlas.webp',
  urbanBackground: './assets/map-backgrounds/urban-research.webp',
  noirBackground: './assets/map-backgrounds/noir-network.webp',
  crimeBackground: './assets/map-backgrounds/crime-collage.webp',
  souvenirBackground: './assets/map-backgrounds/travel-souvenir.webp',
  investigationBackground: './assets/map-backgrounds/urban-investigation.webp',
  archiveBackground: './assets/map-backgrounds/retro-archive.webp',
  pin: './assets/attachments/brass-safety-pin.webp',
  tape: './assets/attachments/gingham-cross-muted.webp',
  clip: './assets/attachments/silver-binder-clip.webp',
};
const LEGACY_INTROS = {
  '已经调查过的地点，线索会继续保留在地图上。': '已经调查过的地点。',
  '角色当前所在地点。AI 可通过 currentId 动态切换当前位置。': '当前正在处理的任务节点。',
  '当前可以前往的下一处地点。': '当前可以前往的下一处地点。',
  '尚未探明的地点，照片可在得到线索后再填写。': '尚未探明。',
};

const defaultState = {
  templateId: 'desk-casebook',
  objective: '',
  objects: [
    {
      id: 'place-1',
      name: '地点 01',
      imageUrl: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=640&q=80',
      intro: '已经调查过的地点。',
      frameStyle: 'pin',
      status: 'completed',
      connectFrom: [],
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
      intro: '当前正在处理的任务节点。',
      frameStyle: 'tape',
      status: 'current',
      connectFrom: ['place-1'],
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
      connectFrom: ['place-2'],
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
      frameStyle: 'ticket',
      status: 'unknown',
      connectFrom: ['place-2'],
      x: 78,
      y: 69,
      rotation: 5,
      size: 96,
      z: 1,
    },
    {
      id: 'place-5',
      name: '地点 05',
      imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=640&q=80',
      intro: '另一处可以继续调查的地点。',
      frameStyle: 'lens',
      status: 'available',
      connectFrom: ['place-3'],
      x: 18,
      y: 74,
      rotation: 2,
      size: 94,
      z: 5,
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
const mapTemplate = document.querySelector('#map-template');
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
const requestedTemplate = new URLSearchParams(location.search).get('template');
if (MAP_TEMPLATES.has(requestedTemplate)) state.templateId = requestedTemplate;
let selectedId = null;
let mode = new URLSearchParams(location.search).get('preview') === '1' ? 'preview' : 'edit';
let dragState = null;
let toastTimer = 0;
let lastDetailTrigger = null;
let connectionStartId = null;
let assetDataUris = null;
let assetLoadPromise = null;

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
    return objects.length ? {
      templateId: MAP_TEMPLATES.has(saved.templateId) ? saved.templateId : defaultState.templateId,
      objective: objective.startsWith('等待 AI 更新') ? '' : objective,
      objects,
    } : clone(defaultState);
  } catch {
    return clone(defaultState);
  }
}

function normalizeObject(item, index = 0) {
  const legacyIntro = String(item.intro ?? item.description ?? '');
  const intro = LEGACY_INTROS[legacyIntro] ?? (legacyIntro.startsWith('等待 AI 补充') ? '' : legacyIntro);
  const id = String(item.id || `place-${Date.now()}-${index}`).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 48);
  return {
    id,
    name: String(item.name || `地点 ${String(index + 1).padStart(2, '0')}`).slice(0, 28),
    imageUrl: isSafeHttpUrl(item.imageUrl) ? String(item.imageUrl) : '',
    intro: intro.slice(0, 60),
    frameStyle: FRAME_STYLES.has(item.frameStyle) ? item.frameStyle : FRAME_STYLE_LIST[index % FRAME_STYLE_LIST.length],
    status: STATUS_LABELS[item.status] ? item.status : 'unknown',
    connectFrom: normalizeConnectionIds(item.connectFrom, id),
    x: clamp(Number(item.x), 7, 93, 50),
    y: clamp(Number(item.y), 10, 90, 50),
    rotation: clamp(Number(item.rotation), -12, 12, 0),
    size: clamp(Number(item.size), 72, 132, 100),
    z: clamp(Number(item.z), 1, 99, index + 1),
  };
}

function normalizeConnectionIds(value, ownId = '') {
  const values = Array.isArray(value) ? value : [value];
  return [...new Set(values
    .map(item => String(item || '').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 48))
    .filter(id => id && id !== ownId))]
    .slice(0, 15);
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

function syncFrameStyleOptions() {
  const labels = TEMPLATE_FRAME_LABELS[state.templateId] || DEFAULT_FRAME_LABELS;
  [newPlaceStyle, fields.frameStyle].forEach(select => {
    const previous = FRAME_STYLES.has(select.value) ? select.value : 'pin';
    select.replaceChildren(...FRAME_STYLE_LIST.map(style => {
      const option = document.createElement('option');
      option.value = style;
      option.textContent = labels[style] || DEFAULT_FRAME_LABELS[style];
      return option;
    }));
    select.value = previous;
  });
}

function svgElement(name, attributes = {}) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function renderConnections() {
  connectionLayer.replaceChildren();
  state.objects.forEach((object, objectIndex) => {
    object.connectFrom.forEach((fromId, connectionIndex) => {
      const from = state.objects.find(item => item.id === fromId);
      if (!from || from.id === object.id) return;
      const x1 = from.x * 10;
      const y1 = from.y * 6.25;
      const x2 = object.x * 10;
      const y2 = object.y * 6.25;
      const direction = (objectIndex + connectionIndex) % 2 ? 1 : -1;
      const bend = Math.min(46, Math.abs(x2 - x1) * .08) * direction;
      const path = svgElement('path', {
        d: `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 + bend} ${x2} ${y2}`,
        class: 'route-thread',
        'data-status': object.status,
      });
      connectionLayer.append(path);
    });
  });
}

function toggleConnection(source, target) {
  const directIndex = target.connectFrom.indexOf(source.id);
  if (directIndex >= 0) {
    target.connectFrom.splice(directIndex, 1);
    return false;
  }
  const reverseIndex = source.connectFrom.indexOf(target.id);
  if (reverseIndex >= 0) {
    source.connectFrom.splice(reverseIndex, 1);
    return false;
  }
  target.connectFrom.push(source.id);
  return true;
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
    button.append(attachment, windowElement, caption);
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
      showToast('连续连线已开始：继续双击任意地点，双击起点结束。');
      return;
    }
    const source = state.objects.find(item => item.id === connectionStartId);
    if (!source) {
      connectionStartId = object.id;
      renderPlaces();
      return;
    }
    const connected = toggleConnection(source, object);
    selectedId = object.id;
    save();
    render();
    showToast(connected
      ? `已连接“${source.name}”与“${object.name}”；可继续连接其他地点。`
      : `已撤掉“${source.name}”与“${object.name}”之间的红线。`);
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
  canvas.dataset.template = state.templateId;
  mapTemplate.value = state.templateId;
  syncFrameStyleOptions();
  previewToggle.setAttribute('aria-pressed', String(mode === 'preview'));
  previewToggle.querySelector('span').textContent = mode === 'preview' ? '返回编辑' : '成品预览';
  renderConnections();
  renderPlaces();
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
    connectFrom: [],
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
  const connectionSnapshots = new Map(state.objects.map(item => [item.id, clone(item.connectFrom)]));
  state.objects.splice(index, 1);
  state.objects.forEach(item => {
    item.connectFrom = item.connectFrom.filter(id => id !== object.id);
  });
  if (connectionStartId === object.id) connectionStartId = null;
  selectedId = null;
  save();
  render();
  showToast(`已删除地点“${snapshot.name}”。`, '撤销', () => {
    state.objects.splice(index, 0, snapshot);
    state.objects.forEach(item => {
      item.connectFrom = clone(connectionSnapshots.get(item.id) || []);
    });
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
*{box-sizing:border-box}html,body{min-width:320px;margin:0;background:transparent}button{font:inherit}.qm{position:relative;isolation:isolate;width:min(100%,760px);aspect-ratio:16/10;min-height:360px;margin:14px auto;overflow:hidden;border:1px solid #5e3926;background:#6a3820 url("__DESK_BACKGROUND__") center/cover no-repeat;box-shadow:0 18px 42px rgba(0,0,0,.4);font-family:"Noto Sans SC","Microsoft YaHei",sans-serif}.qm[data-template=travel-atlas]{border-color:#56412d;background:#45362a url("__TRAVEL_BACKGROUND__") center/cover no-repeat}.qm[data-template=urban-research]{border-color:#b9b7ad;background:#e5e5df url("__URBAN_BACKGROUND__") center/cover no-repeat;box-shadow:0 18px 44px rgba(0,0,0,.34)}.qm[data-template=noir-network]{border-color:#3c3c3c;background:#111 url("__NOIR_BACKGROUND__") center/cover no-repeat;box-shadow:0 24px 60px rgba(0,0,0,.64)}
.qm-routes{position:absolute;z-index:3;inset:0;width:100%;height:100%;pointer-events:none}.qm-route{fill:none;stroke:#983b31;stroke-width:4;stroke-linecap:round;filter:drop-shadow(0 2px 1px rgba(50,20,12,.38))}.qm-route[data-status=completed]{stroke:#73563a}.qm-route[data-status=blocked]{stroke:#5b211d;stroke-dasharray:15 10}.qm-route[data-status=unknown]{stroke:#7a6b58;stroke-dasharray:5 10}.qm[data-template=travel-atlas] .qm-route{stroke:#9d362e;stroke-width:4.5;filter:drop-shadow(0 1px 1px rgba(46,21,14,.5))}.qm[data-template=urban-research] .qm-route{stroke:#282a27;stroke-width:3;stroke-dasharray:11 8;filter:none}.qm[data-template=urban-research] .qm-route[data-status=blocked]{stroke:#9b3d2f;stroke-dasharray:4 7}.qm[data-template=noir-network] .qm-route{stroke:rgba(238,236,224,.84);stroke-width:2.5;filter:drop-shadow(0 0 3px rgba(255,255,255,.2))}.qm[data-template=noir-network] .qm-route[data-status=blocked]{stroke:#9e493f;stroke-dasharray:5 7}.qm[data-template=noir-network] .qm-route[data-status=unknown]{stroke:rgba(188,188,179,.52);stroke-dasharray:2 8}
.qm-places{position:absolute;z-index:5;inset:0}.qm-place{--s:1;position:absolute;left:var(--x);top:var(--y);z-index:var(--z);width:clamp(88px,14.5%,145px);min-height:44px;padding:7px 7px 20px;border:0;color:#3d342c;background:#e7dfcf;box-shadow:0 7px 13px rgba(35,20,11,.36);cursor:pointer;transform:translate(-50%,-50%) rotate(var(--r)) scale(var(--s));touch-action:manipulation}.qm-photo{position:relative;display:block;width:100%;aspect-ratio:1.38;overflow:hidden;border:1px solid rgba(55,47,39,.28);background:linear-gradient(145deg,transparent 0 45%,rgba(57,58,53,.68) 46% 58%,transparent 59%),linear-gradient(#bbb9af,#72756f)}.qm-photo img{display:block;width:100%;height:100%;object-fit:cover;filter:grayscale(1) sepia(.16) contrast(1.02)}.qm-photo:empty:after{content:"PHOTO";position:absolute;inset:0;display:grid;place-items:center;color:rgba(44,40,35,.5);font:800 .58rem/1 monospace;letter-spacing:.15em}.qm-name{position:absolute;left:5px;right:5px;bottom:4px;overflow:hidden;font:800 clamp(.62rem,1.1vw,.8rem)/1.2 "KaiTi",serif;text-align:center;text-overflow:ellipsis;white-space:nowrap}
.qm[data-template=travel-atlas] .qm-place{width:clamp(100px,16%,166px);padding:7px 7px 23px;border:1px solid rgba(91,65,38,.3);color:#493421;background:#eee0c3;box-shadow:0 9px 18px rgba(40,26,13,.4)}.qm[data-template=travel-atlas] .qm-photo{aspect-ratio:1.62;border-color:rgba(74,55,34,.35)}.qm[data-template=travel-atlas] .qm-photo img{filter:sepia(.28) saturate(.82) contrast(1.05)}.qm[data-template=travel-atlas] .qm-name{bottom:5px;font-style:italic;letter-spacing:.04em}
.qm[data-template=urban-research] .qm-place{width:clamp(90px,13.5%,140px);padding:5px 5px 29px;border:1px solid rgba(35,36,33,.55);color:#191a18;background:#f4f3ed;box-shadow:5px 6px 0 rgba(42,43,39,.16),0 9px 18px rgba(26,27,25,.2)}.qm[data-template=urban-research] .qm-photo{aspect-ratio:1.05;border:0}.qm[data-template=urban-research] .qm-photo img{filter:grayscale(1) contrast(1.18)}.qm[data-template=urban-research] .qm-name{left:8px;right:auto;bottom:-8px;max-width:calc(100% - 13px);padding:6px 9px;color:#25241c;background:#d8bf58;box-shadow:2px 3px 0 rgba(50,49,39,.24);font:800 clamp(.58rem,1vw,.74rem)/1.1 sans-serif;text-align:left;transform:rotate(-1.5deg)}.qm[data-template=urban-research] .qm-attachment{filter:grayscale(.75) drop-shadow(1px 2px 1px rgba(30,30,28,.28))}
.qm[data-template=noir-network] .qm-place{width:clamp(94px,14%,148px);padding:5px 5px 22px;border:1px solid rgba(235,232,217,.72);color:#ece9df;background:#171817;box-shadow:0 0 0 2px rgba(0,0,0,.68),0 10px 24px rgba(0,0,0,.7)}.qm[data-template=noir-network] .qm-photo{aspect-ratio:1.48;border-color:rgba(236,234,224,.5);background-color:#20211f}.qm[data-template=noir-network] .qm-photo img{filter:grayscale(1) contrast(1.22) brightness(.9)}.qm[data-template=noir-network] .qm-photo:empty:after{color:rgba(239,237,225,.5)}.qm[data-template=noir-network] .qm-name{bottom:5px;color:#ece9df;font:700 clamp(.58rem,1vw,.75rem)/1.15 ui-monospace,Consolas,monospace;letter-spacing:.08em}.qm[data-template=noir-network] .qm-attachment{filter:grayscale(1) brightness(1.25) drop-shadow(1px 3px 2px rgba(0,0,0,.75))}
.qm-detail{position:absolute;z-index:20;inset:0;display:none;background:rgba(25,15,9,.66)}.qm-detail.open{display:grid;place-items:end center}.qm-card{width:min(86%,480px);margin-bottom:5%;padding:20px;color:#40352b;background:repeating-linear-gradient(0deg,transparent 0 26px,rgba(94,71,48,.09) 27px),#dfcfad;box-shadow:0 18px 44px rgba(0,0,0,.42)}.qm-back{min-height:44px;padding:0 10px;border:0;color:#4b392b;background:transparent;font-weight:800;cursor:pointer}.qm-card h2{margin:0 0 8px;font-family:serif}.qm-card p{margin:0;line-height:1.7}@media(max-width:520px){.qm{aspect-ratio:3/4}.qm-place{width:clamp(80px,26%,108px)}.qm[data-template=travel-atlas] .qm-place{width:clamp(86px,29%,118px)}.qm[data-template=urban-research] .qm-place{width:clamp(74px,23%,98px)}.qm[data-template=noir-network] .qm-place{width:clamp(80px,25%,106px)}}`;

const EXPORTED_FRAME_CSS = `
.qm-place:before{display:none}
.qm-attachment{position:absolute;z-index:8;display:block;pointer-events:none;background-position:center;background-repeat:no-repeat;background-size:contain;filter:drop-shadow(1px 3px 2px rgba(33,20,12,.35))}
.qm-place[data-frame=pin] .qm-attachment{left:50%;top:-19px;width:76%;height:34px;background-image:url("__PIN_ASSET__");transform:translateX(-50%) rotate(-3deg)}
.qm-place[data-frame=tape]{background:#e5dccd}.qm-place[data-frame=tape] .qm-attachment{left:50%;top:-14px;width:57%;height:36px;background-image:url("__TAPE_ASSET__");transform:translateX(-50%) rotate(-2deg)}
.qm-place[data-frame=clip]{background:#e9e2d6}.qm-place[data-frame=clip] .qm-attachment{left:12%;top:-17px;width:36px;height:42px;background-image:url("__CLIP_ASSET__");transform:rotate(-5deg)}
`;

const EXPORTED_CRIME_CSS = `
.qm[data-template=crime-collage]{border-color:#d8d5cd;background:#0b0c0b url("__CRIME_BACKGROUND__") center/cover no-repeat;box-shadow:0 24px 64px rgba(0,0,0,.68)}
.qm[data-template=crime-collage] .qm-route{stroke:#e3131f;stroke-width:4;filter:drop-shadow(0 1px 2px rgba(0,0,0,.72))}.qm[data-template=crime-collage] .qm-route[data-status=blocked]{stroke:#f2f0ea;stroke-dasharray:12 8}.qm[data-template=crime-collage] .qm-route[data-status=unknown]{stroke:rgba(236,234,226,.64);stroke-dasharray:3 8}
.qm[data-template=crime-collage] .qm-attachment{display:none}
.qm[data-template=crime-collage] .qm-place[data-frame=pin] .qm-attachment{display:block;left:50%;top:-18px;width:82%;height:34px;filter:grayscale(.25) brightness(.9) drop-shadow(1px 4px 2px rgba(0,0,0,.62));transform:translateX(-50%) rotate(-4deg)}
.qm[data-template=crime-collage] .qm-place[data-frame=pin]{width:clamp(104px,16%,172px);padding:8px 8px 31px;border:0;color:#111;background:#f0eee7;box-shadow:0 0 0 1px rgba(255,255,255,.5),8px 11px 18px rgba(0,0,0,.68)}.qm[data-template=crime-collage] .qm-place[data-frame=pin] .qm-photo{aspect-ratio:1.08;border:0}.qm[data-template=crime-collage] .qm-place[data-frame=pin] .qm-photo img{filter:grayscale(1) contrast(1.3)}.qm[data-template=crime-collage] .qm-place[data-frame=pin] .qm-name{bottom:8px;font:900 .7rem/1 ui-monospace,Consolas,monospace;letter-spacing:.08em}
.qm[data-template=crime-collage] .qm-place[data-frame=tape]{width:clamp(124px,19%,202px);padding:25px 6px 24px;border:3px double #262725;color:#171816;background:#c8c9c5;box-shadow:8px 10px 0 rgba(0,0,0,.38),0 13px 24px rgba(0,0,0,.5)}.qm[data-template=crime-collage] .qm-place[data-frame=tape]:before{content:"CASE.FILE";display:block;position:absolute;left:3px;right:3px;top:3px;height:17px;padding:3px 6px;color:#ecece8;background:#4b4d49;font:800 .5rem/1 ui-monospace,Consolas,monospace;letter-spacing:.08em;text-align:left}.qm[data-template=crime-collage] .qm-place[data-frame=tape] .qm-photo{aspect-ratio:1.72;border:1px solid #3d3f3b}.qm[data-template=crime-collage] .qm-place[data-frame=tape] .qm-photo img{filter:grayscale(1) contrast(1.15)}.qm[data-template=crime-collage] .qm-place[data-frame=tape] .qm-name{bottom:6px;font:800 .64rem/1 ui-monospace,Consolas,monospace;text-align:left}
.qm[data-template=crime-collage] .qm-place[data-frame=clip]{width:clamp(100px,15%,162px);padding:12px 9px 25px;border:0;color:#f0eee8;background:#101110;box-shadow:0 0 0 2px #e3e1da,8px 10px 20px rgba(0,0,0,.72)}.qm[data-template=crime-collage] .qm-place[data-frame=clip]:before{content:"";display:block;position:absolute;left:8px;right:8px;top:3px;height:5px;background:repeating-linear-gradient(90deg,#eee 0 6px,transparent 6px 12px);opacity:.82}.qm[data-template=crime-collage] .qm-place[data-frame=clip] .qm-photo{aspect-ratio:1.34;border:1px solid #eceae3}.qm[data-template=crime-collage] .qm-place[data-frame=clip] .qm-photo img{filter:grayscale(1) contrast(1.35) brightness(.88)}.qm[data-template=crime-collage] .qm-place[data-frame=clip] .qm-photo:empty:after{color:rgba(238,236,228,.56)}.qm[data-template=crime-collage] .qm-place[data-frame=clip] .qm-name{bottom:6px;color:#f0eee8;font:800 .62rem/1 ui-monospace,Consolas,monospace;letter-spacing:.1em}
@media(max-width:520px){.qm[data-template=crime-collage] .qm-place[data-frame=pin]{width:clamp(82px,27%,110px);padding-bottom:27px}.qm[data-template=crime-collage] .qm-place[data-frame=tape]{width:clamp(100px,33%,132px)}.qm[data-template=crime-collage] .qm-place[data-frame=clip]{width:clamp(80px,25%,104px)}}`;

const EXPORTED_NEW_TEMPLATE_CSS = `
.qm[data-template=travel-souvenir]{border-color:#8c6845;background:#b99568 url("__SOUVENIR_BACKGROUND__") center/cover no-repeat;box-shadow:0 20px 48px rgba(45,27,12,.48)}
.qm[data-template=urban-investigation]{border-color:#66727d;background:#9ca9b2 url("__INVESTIGATION_BACKGROUND__") center/cover no-repeat;box-shadow:0 20px 48px rgba(13,22,30,.45)}
.qm[data-template=retro-archive]{border-color:#4b4e4b;background:#111311 url("__ARCHIVE_BACKGROUND__") center/cover no-repeat;box-shadow:0 25px 64px rgba(0,0,0,.72)}
.qm[data-template=travel-souvenir] .qm-route{stroke:#8d3c32;stroke-width:4.5;stroke-dasharray:3 6;filter:drop-shadow(0 1px 1px rgba(60,31,18,.48))}.qm[data-template=travel-souvenir] .qm-route[data-status=completed]{stroke:#715c46}.qm[data-template=travel-souvenir] .qm-route[data-status=blocked]{stroke:#63332d;stroke-dasharray:13 8}
.qm[data-template=urban-investigation] .qm-route{stroke:#1b2024;stroke-width:3.5;filter:drop-shadow(0 1px 0 rgba(255,255,255,.35))}.qm[data-template=urban-investigation] .qm-route[data-status=blocked]{stroke:#7a3432;stroke-dasharray:7 6}.qm[data-template=urban-investigation] .qm-route[data-status=unknown]{stroke:rgba(35,43,49,.52);stroke-dasharray:2 7}
.qm[data-template=retro-archive] .qm-route{stroke:#ad242a;stroke-width:4.5;filter:drop-shadow(0 1px 3px rgba(0,0,0,.9))}.qm[data-template=retro-archive] .qm-route[data-status=completed]{stroke:#777b76}.qm[data-template=retro-archive] .qm-route[data-status=blocked]{stroke:#e4e1d8;stroke-dasharray:12 8}.qm[data-template=retro-archive] .qm-route[data-status=unknown]{stroke:rgba(200,204,197,.48);stroke-dasharray:2 8}
.qm-place[data-frame=ticket]{width:clamp(108px,16%,176px);padding:7px 7px 23px;border:2px dashed rgba(83,65,44,.52);background:#eadcc0}.qm-place[data-frame=ticket] .qm-attachment,.qm-place[data-frame=lens] .qm-attachment{display:none}.qm-place[data-frame=ticket] .qm-photo{aspect-ratio:1.55}.qm-place[data-frame=lens]{width:clamp(94px,13.5%,148px);padding:9px 9px 26px;border:6px solid #b7aa91;border-radius:50%;background:#ded3be}.qm-place[data-frame=lens] .qm-photo{aspect-ratio:1;border-radius:50%}.qm-place[data-frame=lens] .qm-name{bottom:-20px;padding:5px 7px;background:#e6dbc3;box-shadow:0 3px 6px rgba(0,0,0,.24)}
.qm[data-template=travel-souvenir] .qm-attachment{display:none}.qm[data-template=travel-souvenir] .qm-place{color:#4d3824;font-family:"KaiTi",serif}
.qm[data-template=travel-souvenir] .qm-place[data-frame=pin]{width:clamp(126px,18%,196px);padding:7px 7px 27px;border:1px solid rgba(91,65,38,.3);background:#ead5ad;box-shadow:0 9px 18px rgba(61,38,18,.38)}.qm[data-template=travel-souvenir] .qm-place[data-frame=pin] .qm-attachment{display:block;left:7%;top:-17px;width:38px;height:44px;background-image:url("__CLIP_ASSET__");filter:sepia(.18) drop-shadow(1px 3px 2px rgba(42,27,15,.45));transform:rotate(-7deg)}.qm[data-template=travel-souvenir] .qm-place[data-frame=pin] .qm-photo{aspect-ratio:1.55;border-color:rgba(82,57,32,.35)}
.qm[data-template=travel-souvenir] .qm-place[data-frame=tape]{width:clamp(144px,21%,226px);padding:9px 13px 28px;border:1px solid #8f6843;border-radius:4px 15px;color:#4b301e;background:#d5a978;box-shadow:5px 7px 0 rgba(91,55,25,.2),0 10px 20px rgba(55,34,18,.3)}.qm[data-template=travel-souvenir] .qm-place[data-frame=tape]:before{display:block;content:"";position:absolute;top:0;bottom:0;right:22%;border-left:2px dashed rgba(94,56,29,.5)}.qm[data-template=travel-souvenir] .qm-place[data-frame=tape] .qm-photo{width:72%;aspect-ratio:1.45;border-color:rgba(76,48,26,.42)}.qm[data-template=travel-souvenir] .qm-place[data-frame=tape] .qm-name{right:25%;text-align:left}
.qm[data-template=travel-souvenir] .qm-place[data-frame=clip]{width:clamp(116px,16%,178px);padding:9px 9px 28px 17px;border:0;clip-path:polygon(10% 0,100% 0,100% 100%,10% 100%,0 50%);background:#caa779;box-shadow:0 10px 20px rgba(58,38,21,.38)}.qm[data-template=travel-souvenir] .qm-place[data-frame=clip] .qm-attachment{display:block;left:-6%;top:13%;width:48%;height:42px;background-image:url("__TAPE_ASSET__");transform:rotate(-8deg)}.qm[data-template=travel-souvenir] .qm-place[data-frame=clip] .qm-photo{aspect-ratio:1.42}
.qm[data-template=travel-souvenir] .qm-place[data-frame=ticket]{width:clamp(104px,14%,158px);padding:8px 8px 30px;border:6px dotted #ead9b8;color:#4d3924;background:#d9c09a;box-shadow:0 8px 17px rgba(59,39,21,.34)}.qm[data-template=travel-souvenir] .qm-place[data-frame=ticket] .qm-photo{aspect-ratio:1}
.qm[data-template=travel-souvenir] .qm-place[data-frame=lens]{width:clamp(134px,19%,208px);padding:8px 8px 27px;border:1px solid rgba(84,62,39,.42);border-radius:0;background:#dfc9a3;box-shadow:0 9px 18px rgba(59,40,23,.36)}.qm[data-template=travel-souvenir] .qm-place[data-frame=lens]:before{display:block;content:"";position:absolute;z-index:3;left:50%;top:7px;bottom:27px;border-left:1px solid rgba(87,64,41,.45);box-shadow:2px 0 4px rgba(77,52,28,.18)}.qm[data-template=travel-souvenir] .qm-place[data-frame=lens] .qm-photo{aspect-ratio:1.62;border-radius:0}.qm[data-template=travel-souvenir] .qm-place[data-frame=lens] .qm-name{bottom:5px;padding:0;background:transparent;box-shadow:none}.qm[data-template=travel-souvenir] .qm-photo img{filter:sepia(.24) saturate(.85) contrast(1.05)}
.qm[data-template=urban-investigation] .qm-attachment{display:none}.qm[data-template=urban-investigation] .qm-place{color:#20272c;font-family:ui-monospace,Consolas,monospace}
.qm[data-template=urban-investigation] .qm-place[data-frame=pin]{width:clamp(120px,17%,188px);padding:16px 12px 30px;border:0;clip-path:polygon(2% 4%,95% 0,100% 91%,92% 100%,4% 96%,0 14%);background:#d7d4ca;box-shadow:7px 8px 0 rgba(36,48,57,.2),0 12px 25px rgba(27,37,45,.28)}.qm[data-template=urban-investigation] .qm-place[data-frame=pin] .qm-attachment{display:block;left:5%;top:-17px;width:68%;height:31px;filter:grayscale(1) brightness(.72) drop-shadow(1px 2px 1px rgba(0,0,0,.5))}.qm[data-template=urban-investigation] .qm-place[data-frame=pin] .qm-photo{aspect-ratio:1.2;border:1px solid #5b6266}
.qm[data-template=urban-investigation] .qm-place[data-frame=tape]{width:clamp(142px,21%,224px);padding:25px 7px 27px;border:4px double #2e373d;border-radius:3px;color:#e6e7e2;background:#48545c;box-shadow:7px 9px 0 rgba(28,38,45,.3),0 12px 24px rgba(20,28,34,.36)}.qm[data-template=urban-investigation] .qm-place[data-frame=tape]:before{display:block;content:"CAM.FEED";position:absolute;left:5px;right:5px;top:4px;height:17px;padding:3px 6px;color:#dce0dd;background:#20282d;font:800 .5rem/1 monospace;letter-spacing:.08em;text-align:left}.qm[data-template=urban-investigation] .qm-place[data-frame=tape] .qm-photo{aspect-ratio:1.78;border-color:#1e252a}.qm[data-template=urban-investigation] .qm-place[data-frame=tape] .qm-name{color:#eceee9;text-align:left}
.qm[data-template=urban-investigation] .qm-place[data-frame=clip]{width:clamp(152px,23%,240px);padding:16px 8px 28px;border:0;color:#eceee9;background:#151b1f;box-shadow:0 0 0 2px #30383e,0 10px 22px rgba(17,24,29,.42)}.qm[data-template=urban-investigation] .qm-place[data-frame=clip]:before{display:block;content:"";position:absolute;left:7px;right:7px;top:4px;height:7px;background:repeating-linear-gradient(90deg,#d9dcda 0 7px,transparent 7px 14px)}.qm[data-template=urban-investigation] .qm-place[data-frame=clip] .qm-photo{aspect-ratio:2.4;border-color:#c9ceca}.qm[data-template=urban-investigation] .qm-place[data-frame=clip] .qm-name{color:#e9ece7}
.qm[data-template=urban-investigation] .qm-place[data-frame=ticket]{width:clamp(134px,19%,208px);padding:10px 10px 29px;border:0;color:#252b2f;background:#c7bca4;box-shadow:7px 8px 0 rgba(38,49,57,.22),0 10px 22px rgba(27,37,45,.28)}.qm[data-template=urban-investigation] .qm-place[data-frame=ticket]:before{display:block;content:"";position:absolute;left:10px;top:-13px;width:44%;height:16px;background:#b9ae96;clip-path:polygon(0 100%,15% 0,100% 0,100% 100%)}.qm[data-template=urban-investigation] .qm-place[data-frame=ticket] .qm-attachment{display:block;left:50%;top:-20px;width:45px;height:48px;background-image:url("__CLIP_ASSET__");filter:grayscale(1) brightness(.75) drop-shadow(1px 3px 2px rgba(0,0,0,.45));transform:translateX(-50%)}.qm[data-template=urban-investigation] .qm-place[data-frame=ticket] .qm-photo{aspect-ratio:1.5}
.qm[data-template=urban-investigation] .qm-place[data-frame=lens]{width:clamp(106px,14%,164px);padding:9px 9px 27px;border:8px double #444f56;border-radius:50%;color:#20272c;background:#aeb7bc;box-shadow:8px 9px 0 rgba(33,44,52,.22),0 10px 23px rgba(22,31,38,.34)}.qm[data-template=urban-investigation] .qm-place[data-frame=lens] .qm-photo{aspect-ratio:1;border:0;border-radius:50%}.qm[data-template=urban-investigation] .qm-place[data-frame=lens] .qm-name{bottom:-22px;color:#20272c;background:#d2d3cd}.qm[data-template=urban-investigation] .qm-photo img{filter:grayscale(1) contrast(1.16) brightness(.92)}
.qm[data-template=retro-archive] .qm-attachment{display:none}.qm[data-template=retro-archive] .qm-place{font-family:ui-monospace,Consolas,monospace}
.qm[data-template=retro-archive] .qm-place[data-frame=pin]{width:clamp(142px,21%,224px);padding:26px 6px 26px;border:4px double #202321;color:#171a18;background:#a8aaa5;box-shadow:8px 9px 0 rgba(0,0,0,.36),0 14px 28px rgba(0,0,0,.52)}.qm[data-template=retro-archive] .qm-place[data-frame=pin]:before{display:block;content:"ARCHIVE.FILE";position:absolute;left:3px;right:3px;top:3px;height:18px;padding:4px 6px;color:#e5e6e1;background:#343734;font:800 .5rem/1 monospace;letter-spacing:.05em;text-align:left}.qm[data-template=retro-archive] .qm-place[data-frame=pin] .qm-photo{aspect-ratio:1.62;border-color:#2d302e}.qm[data-template=retro-archive] .qm-place[data-frame=pin] .qm-name{text-align:left}
.qm[data-template=retro-archive] .qm-place[data-frame=tape]{width:clamp(132px,19%,208px);padding:13px 13px 29px;border:8px solid #353a37;border-radius:17px;color:#e1e4df;background:#242825;box-shadow:inset 0 0 0 2px #0c0e0d,8px 10px 0 rgba(0,0,0,.35),0 14px 30px rgba(0,0,0,.58)}.qm[data-template=retro-archive] .qm-place[data-frame=tape] .qm-photo{aspect-ratio:1.32;border:2px solid #080a09;border-radius:13px}.qm[data-template=retro-archive] .qm-place[data-frame=tape] .qm-name{color:#e4e6e1}
.qm[data-template=retro-archive] .qm-place[data-frame=clip]{width:clamp(118px,16%,184px);padding:26px 10px 28px;border:2px solid #717671;color:#252824;background:#b8bbb5;box-shadow:8px 9px 0 rgba(0,0,0,.3),0 13px 27px rgba(0,0,0,.5)}.qm[data-template=retro-archive] .qm-place[data-frame=clip]:before{display:block;content:"SCAN.PREVIEW";position:absolute;left:10px;top:7px;color:#333732;font:800 .48rem/1 monospace;letter-spacing:.06em}.qm[data-template=retro-archive] .qm-place[data-frame=clip] .qm-photo{aspect-ratio:1/1.18;border:2px solid #2d302d}
.qm[data-template=retro-archive] .qm-place[data-frame=ticket]{width:clamp(154px,23%,244px);padding:20px 9px 28px;border:1px solid #494b47;color:#262824;background:#b8ae9b;box-shadow:8px 10px 0 rgba(0,0,0,.32),0 14px 28px rgba(0,0,0,.5)}.qm[data-template=retro-archive] .qm-place[data-frame=ticket]:before{display:block;content:"ARCHIVE.THUMBNAILS";position:absolute;left:14px;top:-12px;width:58%;height:24px;padding:8px 8px 0;color:#30322f;background:#aea48f;font:800 .46rem/1 monospace;text-align:left;clip-path:polygon(0 100%,9% 0,100% 0,100% 100%)}.qm[data-template=retro-archive] .qm-place[data-frame=ticket] .qm-photo{aspect-ratio:2.2;border-color:#3a3d39}
.qm[data-template=retro-archive] .qm-place[data-frame=lens]{width:clamp(130px,18%,204px);padding:34px 10px 28px;border:1px solid #4c504c;border-radius:2px;color:#dfe1db;background:#252825;box-shadow:8px 10px 0 rgba(0,0,0,.38),0 15px 30px rgba(0,0,0,.58)}.qm[data-template=retro-archive] .qm-place[data-frame=lens]:before{display:block;content:"CONTACT.PRINT";position:absolute;left:0;right:0;top:0;height:25px;padding:8px 10px;color:#d5d8d1;background:#343834;font:800 .48rem/1 monospace;letter-spacing:.06em;text-align:left;clip-path:polygon(0 0,100% 0,93% 100%,7% 100%)}.qm[data-template=retro-archive] .qm-place[data-frame=lens] .qm-photo{aspect-ratio:1.45;border:1px solid #c5c8c1;border-radius:0}.qm[data-template=retro-archive] .qm-place[data-frame=lens] .qm-name{bottom:6px;color:#e1e3de;background:transparent;box-shadow:none;text-align:left}.qm[data-template=retro-archive] .qm-photo{background:#070908}.qm[data-template=retro-archive] .qm-photo img{filter:grayscale(1) contrast(1.25) brightness(.82)}.qm[data-template=retro-archive] .qm-photo:empty:after{color:rgba(218,221,214,.45)}
@media(max-width:520px){.qm[data-template=travel-souvenir] .qm-place[data-frame=pin]{width:clamp(94px,31%,126px)}.qm[data-template=travel-souvenir] .qm-place[data-frame=tape]{width:clamp(110px,36%,146px)}.qm[data-template=travel-souvenir] .qm-place[data-frame=clip]{width:clamp(86px,28%,116px)}.qm[data-template=travel-souvenir] .qm-place[data-frame=ticket]{width:clamp(78px,25%,104px)}.qm[data-template=travel-souvenir] .qm-place[data-frame=lens]{width:clamp(102px,33%,136px)}.qm[data-template=urban-investigation] .qm-place[data-frame=pin]{width:clamp(90px,29%,120px)}.qm[data-template=urban-investigation] .qm-place[data-frame=tape]{width:clamp(108px,35%,144px)}.qm[data-template=urban-investigation] .qm-place[data-frame=clip]{width:clamp(116px,38%,154px)}.qm[data-template=urban-investigation] .qm-place[data-frame=ticket]{width:clamp(100px,32%,134px)}.qm[data-template=urban-investigation] .qm-place[data-frame=lens]{width:clamp(80px,26%,106px)}.qm[data-template=retro-archive] .qm-place[data-frame=pin]{width:clamp(110px,36%,146px)}.qm[data-template=retro-archive] .qm-place[data-frame=tape]{width:clamp(102px,33%,136px)}.qm[data-template=retro-archive] .qm-place[data-frame=clip]{width:clamp(88px,29%,118px)}.qm[data-template=retro-archive] .qm-place[data-frame=ticket]{width:clamp(118px,39%,158px)}.qm[data-template=retro-archive] .qm-place[data-frame=lens]{width:clamp(98px,32%,132px)}}`;

function blobToDataUri(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result || '')), { once: true });
    reader.addEventListener('error', () => reject(reader.error || new Error('底图读取失败')), { once: true });
    reader.readAsDataURL(blob);
  });
}

function ensureAssetDataUris() {
  if (assetDataUris) return Promise.resolve(assetDataUris);
  if (!assetLoadPromise) {
    assetLoadPromise = Promise.all(Object.entries(ASSET_URLS).map(async ([key, url]) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`素材加载失败：${key} (${response.status})`);
      const dataUri = await blobToDataUri(new Blob([await response.arrayBuffer()], { type: 'image/webp' }));
      if (!dataUri.startsWith('data:image/webp;base64,')) throw new Error(`素材格式无效：${key}`);
      return [key, dataUri];
    }))
      .then(entries => {
        assetDataUris = Object.fromEntries(entries);
        return assetDataUris;
      })
      .catch(error => {
        assetLoadPromise = null;
        throw error;
      });
  }
  return assetLoadPromise;
}

function buildRegexHtml(assets = assetDataUris) {
  if (!assets) throw new Error('地图素材尚未加载');
  const config = {
    version: 2,
    templateId: state.templateId,
    objects: state.objects.map(item => ({ ...item })),
  };
  const configJson = safeScriptJson(config);
  const exportedCss = `${EXPORTED_CSS}${EXPORTED_FRAME_CSS}${EXPORTED_CRIME_CSS}${EXPORTED_NEW_TEMPLATE_CSS}`
    .replaceAll('__DESK_BACKGROUND__', assets.deskBackground)
    .replaceAll('__TRAVEL_BACKGROUND__', assets.travelBackground)
    .replaceAll('__URBAN_BACKGROUND__', assets.urbanBackground)
    .replaceAll('__NOIR_BACKGROUND__', assets.noirBackground)
    .replaceAll('__CRIME_BACKGROUND__', assets.crimeBackground)
    .replaceAll('__SOUVENIR_BACKGROUND__', assets.souvenirBackground)
    .replaceAll('__INVESTIGATION_BACKGROUND__', assets.investigationBackground)
    .replaceAll('__ARCHIVE_BACKGROUND__', assets.archiveBackground)
    .replaceAll('__PIN_ASSET__', assets.pin)
    .replaceAll('__TAPE_ASSET__', assets.tape)
    .replaceAll('__CLIP_ASSET__', assets.clip);
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>${exportedCss}</style>
</head>
<body>
<article class="qm" id="qm" data-template="${state.templateId}">
  <svg class="qm-routes" viewBox="0 0 1000 625" preserveAspectRatio="none" aria-hidden="true"></svg>
  <div class="qm-places" role="group" aria-label="任务地点"></div>
  <section class="qm-detail" aria-hidden="true"><div class="qm-card" role="dialog" aria-modal="true" tabindex="-1"><button class="qm-back" type="button">← 返回地图</button><h2></h2><p></p></div></section>
</article>
<script type="application/json" id="qm-data">$1</script>
<script>
(function(){
var config=${configJson};
var labels={current:'进行中',completed:'已走过',available:'可前往',blocked:'已阻断',unknown:'未探明'};
var dynamic={};try{dynamic=JSON.parse(document.getElementById('qm-data').textContent.trim()||'{}')}catch(error){dynamic={}}
var overrides=Array.isArray(dynamic.places)?dynamic.places:[];
var places=config.objects.map(function(base){var change=overrides.find(function(item){return item&&item.id===base.id})||{};return Object.assign({},base,change)});
overrides.forEach(function(item,index){if(!item||!item.id||places.some(function(place){return place.id===item.id}))return;places.push(Object.assign({name:'新地点',imageUrl:'',intro:'',frameStyle:'pin',status:'unknown',connectFrom:[],x:16+(index%4)*22,y:18+(index%3)*31,rotation:0,size:92,z:places.length+1},item))});
if(dynamic.statuses&&typeof dynamic.statuses==='object'){places.forEach(function(place){if(labels[dynamic.statuses[place.id]])place.status=dynamic.statuses[place.id]})}
if(dynamic.currentId){places.forEach(function(place){if(place.id===dynamic.currentId)place.status='current';else if(place.status==='current')place.status='completed'})}
var root=document.getElementById('qm'),host=root.querySelector('.qm-places'),routes=root.querySelector('.qm-routes'),detail=root.querySelector('.qm-detail'),card=detail.querySelector('.qm-card');
function safeUrl(value){try{var url=new URL(String(value||''));return url.protocol==='http:'||url.protocol==='https:'?url.href:''}catch(error){return''}}
function connectionIds(value,ownId){return(Array.isArray(value)?value:[value]).map(function(id){return String(id||'')}).filter(function(id,index,list){return id&&id!==ownId&&list.indexOf(id)===index})}
function close(){detail.classList.remove('open');detail.setAttribute('aria-hidden','true')}
detail.addEventListener('click',function(event){if(event.target===detail)close()});detail.querySelector('.qm-back').addEventListener('click',close);
places.forEach(function(place,placeIndex){
 connectionIds(place.connectFrom,place.id).forEach(function(fromId,connectionIndex){var from=places.find(function(item){return item.id===fromId});if(from){var x1=from.x*10,y1=from.y*6.25,x2=place.x*10,y2=place.y*6.25,direction=(placeIndex+connectionIndex)%2?1:-1,bend=Math.min(46,Math.abs(x2-x1)*.08)*direction;var path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M '+x1+' '+y1+' Q '+((x1+x2)/2)+' '+(((y1+y2)/2)+bend)+' '+x2+' '+y2);path.setAttribute('class','qm-route');path.dataset.status=place.status;routes.append(path)}});
 var button=document.createElement('button');button.type='button';button.className='qm-place';button.dataset.status=labels[place.status]?place.status:'unknown';button.dataset.frame=['pin','tape','clip','ticket','lens'].includes(place.frameStyle)?place.frameStyle:'pin';button.style.setProperty('--x',Math.max(7,Math.min(93,Number(place.x)||50))+'%');button.style.setProperty('--y',Math.max(10,Math.min(90,Number(place.y)||50))+'%');button.style.setProperty('--r',Math.max(-12,Math.min(12,Number(place.rotation)||0))+'deg');button.style.setProperty('--s',Math.max(.72,Math.min(1.32,(Number(place.size)||100)/100)));button.style.setProperty('--z',Number(place.z)||1);button.setAttribute('aria-label',String(place.name||'未命名地点')+'，'+(labels[button.dataset.status]||labels.unknown));
 var attachment=document.createElement('span');attachment.className='qm-attachment';attachment.setAttribute('aria-hidden','true');
 var photo=document.createElement('span');photo.className='qm-photo';var url=safeUrl(place.imageUrl);if(url){var image=document.createElement('img');image.src=url;image.alt='';image.loading='lazy';image.referrerPolicy='no-referrer';photo.append(image)}
 var name=document.createElement('span');name.className='qm-name';name.textContent=place.name||'未命名地点';button.append(attachment,photo,name);
 button.addEventListener('click',function(){var intro=String(place.intro||place.description||'');card.querySelector('h2').textContent=place.name||'未命名地点';card.querySelector('p').textContent=intro;card.querySelector('p').hidden=!intro;detail.classList.add('open');detail.setAttribute('aria-hidden','false');card.focus()});host.append(button);
});
})();
</script>
</body>
</html>`;
}

function buildRegexScript(assets = assetDataUris) {
  return {
    id: `status-atelier-quest-map-${Date.now().toString(36)}`,
    scriptName: '九一 · 可视化任务地图',
    disabled: false,
    runOnEdit: true,
    findRegex: '/<quest_map>\\s*([\\s\\S]*?)\\s*<\\/quest_map>/i',
    trimStrings: [],
    replaceString: `\`\`\`html\n${buildRegexHtml(assets)}\n\`\`\``,
    placement: [2],
    substituteRegex: 0,
    minDepth: null,
    maxDepth: null,
    markdownOnly: true,
    promptOnly: false,
  };
}

async function refreshExport() {
  const assets = await ensureAssetDataUris();
  regexOutput.value = JSON.stringify(buildRegexScript(assets), null, 2);
}

fields.name.addEventListener('input', () => {
  const object = selectedObject();
  if (!object) return;
  object.name = fields.name.value.slice(0, 28) || '未命名地点';
  save();
  renderPlaces();
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
mapTemplate.addEventListener('change', () => {
  if (!MAP_TEMPLATES.has(mapTemplate.value)) return;
  state.templateId = mapTemplate.value;
  save();
  render();
  showToast('地图模板已切换，地点数据与位置保持不变。');
});
document.querySelector('#add-place-button').addEventListener('click', () => addPlace(null, newPlaceStyle.value));
duplicateButton.addEventListener('click', () => addPlace(selectedObject()));
document.querySelector('#delete-place-button').addEventListener('click', deleteSelected);
quickDeleteButton.addEventListener('click', deleteSelected);
document.querySelector('#layer-up-button').addEventListener('click', () => moveLayer(1));
document.querySelector('#layer-down-button').addEventListener('click', () => moveLayer(-1));
document.querySelectorAll('[data-close-detail]').forEach(button => button.addEventListener('click', closeDetail));

previewToggle.addEventListener('click', () => {
  mode = mode === 'edit' ? 'preview' : 'edit';
  if (mode === 'preview') {
    selectedId = null;
    connectionStartId = null;
  }
  closeDetail();
  render();
});

document.querySelector('#reset-button').addEventListener('click', () => {
  if (!window.confirm('恢复地点初始布局？当前地点草稿会被覆盖。')) return;
  const templateId = state.templateId;
  state = { ...clone(defaultState), templateId };
  selectedId = null;
  connectionStartId = null;
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
    showToast('地图素材无法内嵌，请从插件预览入口通过本地服务打开后再生成。');
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
  if (exportDialog.open) {
    exportDialog.close();
    return;
  }
  if (connectionStartId) {
    connectionStartId = null;
    renderPlaces();
    showToast('已结束连续连线。');
  }
});

window.__mapEditorTestApi = {
  getState: () => clone(state),
  buildRegexScript,
  addPlace: () => addPlace(),
  selectObject,
};

ensureAssetDataUris().catch(() => {});
render();

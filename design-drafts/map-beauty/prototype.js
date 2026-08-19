const NS = 'http://www.w3.org/2000/svg';

const iconPaths = {
  town: '<path d="M5 20v-9l7-6 7 6v9M9 20v-6h6v6M3 20h18"/>',
  gate: '<path d="M5 21V9a7 7 0 0 1 14 0v12M9 21V9a3 3 0 0 1 6 0v12M3 21h18"/>',
  camp: '<path d="m4 20 8-16 8 16M7 14h10M9 20l3-6 3 6"/>',
  tower: '<path d="M6 21h12M8 21l1-12h6l1 12M8 9l-1-4h10l-2 4M12 5V2"/>',
  bridge: '<path d="M3 18h18M5 18a7 7 0 0 1 14 0M4 13h16"/>',
  forest: '<path d="m12 3 5 7h-3l5 7h-6v4h-2v-4H5l5-7H7Z"/>',
  ruins: '<path d="M4 21V8l4-3 4 3 4-3 4 3v13M8 21v-6h4v6M16 12h1"/>',
  cave: '<path d="M3 20C4 10 7 4 12 4s8 6 9 16M8 20c0-5 1-8 4-8s4 3 4 8"/>',
  shrine: '<path d="M4 9h16M6 9l2-5h8l2 5M7 9v12m10-12v12M4 21h16M9 14h6"/>',
  port: '<path d="M12 3v13m-4-9h8M5 13c1 5 4 8 7 8s6-3 7-8M4 13h3m10 0h3"/>',
  peak: '<path d="m3 20 6-10 3 4 3-7 6 13M7 14l2 1 3-1"/>',
};

const place = (id, name, type, status, x, y, extra = {}) => ({
  id, name, type, status, x, y,
  description: '此处尚未写入详细记录，AI 可在下一轮剧情中补全地点信息。',
  distance: '—', weather: '薄雾', hint: '路线信息等待确认。',
  photoUrl: '', photoAlt: '',
  ...extra,
});

const datasets = {
  compact: {
    title: '白槐驿路', subtitle: '从港口沿旧商路前往山口关隘', weather: '晴间云 · 16℃',
    objective: '护送药箱穿过山口并交给边境医师', risk: '午后可能出现强侧风', progress: 34,
    nodes: [
      place('port', '芦潮港', 'port', 'completed', 14, 76, { distance: '起点', weather: '海风 / 港区', hint: '补给已经完成。' }),
      place('inn', '白槐驿', 'town', 'current', 39, 58, { description: '驿站仍在营业，马厩与饮水均可使用。', distance: '当前位置', weather: '晴 / 原野', hint: '北侧商路可通行。' }),
      place('bridge', '渡鸦桥', 'bridge', 'available', 66, 69, { description: '跨越峡溪的老石桥，桥面有新修补的木板。', distance: '2.1 km', weather: '多云 / 峡溪', hint: '注意桥南湿滑石阶。' }),
      place('gate', '寒松关', 'gate', 'unknown', 84, 29, { description: '地图上最后一处有守军驻扎的山口。', distance: '5.8 km', weather: '未知 / 山地', hint: '需要先抵达渡鸦桥。' }),
    ],
    edges: [
      ['port', 'inn', 'travelled'], ['inn', 'bridge', 'available'], ['bridge', 'gate', 'unknown'],
    ],
  },
  standard: {
    title: '雾脊古道', subtitle: '沿废弃驿道抵达北境观星台', weather: '薄雾 · 11℃',
    objective: '在夜潮抵达前修复观星台的引路灯', risk: '北坡出现不稳定落石', progress: 42,
    nodes: [
      place('south', '苔岸村', 'town', 'completed', 10, 78, { distance: '起点', weather: '小雨 / 村落', hint: '留有备用补给。' }),
      place('bridge', '盐骨桥', 'bridge', 'completed', 27, 63, { distance: '3.2 km', weather: '薄雾 / 河谷', hint: '桥面已经加固。' }),
      place('gate', '风蚀关', 'gate', 'current', 45, 47, { description: '古道穿过狭窄石门，旧守卫棚可暂作避风处。', distance: '当前位置', weather: '薄雾 / 山口', hint: '灰栎驿站与回声洞均在可达范围。' }),
      place('inn', '灰栎驿站', 'camp', 'available', 64, 31, { description: '旧驿站的屋顶仍能遮雨，炉膛中残留着不久前燃烧过的灰烬。', distance: '1.8 km', weather: '薄雾 / 林地', hint: '沿石标向东北，避开北侧塌方。' }),
      place('cave', '回声洞', 'cave', 'blocked', 65, 72, { description: '山腹内有捷径，但入口已被落石封住。', distance: '1.3 km', weather: '潮湿 / 洞穴', hint: '需要工具清理入口，目前不可通行。' }),
      place('shrine', '无名祠', 'shrine', 'unknown', 81, 56, { description: '林间石祠没有出现在旧地图上。', distance: '未知', weather: '未知 / 密林', hint: '只有抵达相邻地点后才能确认路线。' }),
      place('tower', '北境观星台', 'tower', 'unknown', 88, 18, { description: '任务终点。引路灯在夜潮中决定整条古道是否安全。', distance: '6.4 km', weather: '强风 / 高地', hint: '先在灰栎驿站确认登山道路。' }),
    ],
    edges: [
      ['south', 'bridge', 'travelled'], ['bridge', 'gate', 'travelled'], ['gate', 'inn', 'available'], ['gate', 'cave', 'blocked'],
      ['inn', 'tower', 'unknown'], ['cave', 'shrine', 'blocked'], ['shrine', 'tower', 'unknown'],
    ],
  },
  expanded: {
    title: '群岛巡行图', subtitle: '在潮汐变化前完成十一处航标巡检', weather: '海雾 · 14℃',
    objective: '确认东侧航标并找出失联巡守的最后停靠点', risk: '外海潮位正在快速升高', progress: 55,
    nodes: [
      place('harbor', '沉钟港', 'port', 'completed', 8, 79, { distance: '起点', weather: '海雾 / 港区', hint: '补给点。' }),
      place('village', '芦花村', 'town', 'completed', 20, 58, { distance: '1.4 km', weather: '微雨 / 滩地', hint: '村道已确认。' }),
      place('bridge', '潮门桥', 'bridge', 'completed', 34, 72, { distance: '2.2 km', weather: '海雾 / 水道', hint: '低潮期可通过。' }),
      place('watch', '旧潮塔', 'tower', 'completed', 37, 38, { distance: '2.8 km', weather: '强风 / 高台', hint: '旧信号仍可使用。' }),
      place('camp', '巡守营', 'camp', 'current', 51, 54, { description: '失联巡守最后一次留下完整记录的营地。', distance: '当前位置', weather: '海雾 / 草甸', hint: '东塔和石窟两路可选。' }),
      place('grove', '白桦林', 'forest', 'available', 61, 30, { distance: '1.2 km', weather: '细雨 / 林地', hint: '道路平缓但视野有限。' }),
      place('cave', '听潮窟', 'cave', 'available', 64, 76, { distance: '1.6 km', weather: '涨潮 / 石窟', hint: '只在潮位升高前可进入。' }),
      place('ruins', '盐风遗址', 'ruins', 'blocked', 75, 57, { distance: '2.9 km', weather: '强风 / 遗址', hint: '南门坍塌，等待替代路线。' }),
      place('shrine', '航海祠', 'shrine', 'unknown', 79, 27, { distance: '未知', weather: '未知 / 高地', hint: '从白桦林继续探明。' }),
      place('peak', '鸥鸣岬', 'peak', 'unknown', 90, 44, { distance: '未知', weather: '未知 / 海岬', hint: '航标所在区域。' }),
      place('light', '东侧航标', 'tower', 'unknown', 91, 14, { distance: '7.1 km', weather: '未知 / 外海', hint: '任务终点。' }),
    ],
    edges: [
      ['harbor', 'village', 'travelled'], ['village', 'bridge', 'travelled'], ['village', 'watch', 'travelled'], ['bridge', 'camp', 'travelled'], ['watch', 'camp', 'travelled'],
      ['camp', 'grove', 'available'], ['camp', 'cave', 'available'], ['cave', 'ruins', 'blocked'], ['grove', 'shrine', 'unknown'], ['ruins', 'peak', 'blocked'],
      ['shrine', 'light', 'unknown'], ['peak', 'light', 'unknown'],
    ],
  },
};

const state = { dataset: 'standard', selected: null, trigger: null, toastTimer: null };
const map = document.querySelector('#quest-map');
const nodesHost = document.querySelector('#node-layer');
const routeHost = document.querySelector('#route-layer');
const photoHost = document.querySelector('#photo-layer');
const sheet = document.querySelector('#location-sheet');
const sheetPanel = sheet.querySelector('.sheet-panel');
const toast = document.querySelector('#prototype-toast');
const embeddedMode = new URLSearchParams(location.search).get('embedded') === '1';

if (embeddedMode) document.body.classList.add('is-embedded');

function nodeStatusLabel(status) {
  return ({ completed: '已走过', current: '当前位置', available: '可前往', blocked: '路线已阻断', unknown: '未探明' })[status] || '未知状态';
}

function svg(tag, attributes = {}) {
  const element = document.createElementNS(NS, tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function edgePath(from, to, index) {
  const x1 = from.x * 10;
  const y1 = from.y * 6.2;
  const x2 = to.x * 10;
  const y2 = to.y * 6.2;
  const bend = (index % 2 ? -1 : 1) * Math.min(46, Math.abs(x2 - x1) * .09);
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2 + bend;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

function renderRoutes(data) {
  routeHost.replaceChildren();
  data.edges.forEach((edge, index) => {
    const [fromId, toId, status] = edge;
    const from = data.nodes.find(node => node.id === fromId);
    const to = data.nodes.find(node => node.id === toId);
    if (!from || !to) return;
    const path = svg('path', { d: edgePath(from, to, index), class: `route-path is-${status}` });
    routeHost.append(path);
    if (status === 'blocked') {
      const x = ((from.x + to.x) / 2) * 10;
      const y = ((from.y + to.y) / 2) * 6.2;
      routeHost.append(svg('path', { d: `M ${x - 11} ${y - 11} L ${x + 11} ${y + 11} M ${x + 11} ${y - 11} L ${x - 11} ${y + 11}`, class: 'route-cross' }));
    }
  });
}

function renderNodes(data) {
  nodesHost.replaceChildren();
  nodesHost.classList.toggle('is-dense', data.nodes.length > 8);
  data.nodes.forEach(node => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'map-node';
    button.dataset.nodeId = node.id;
    button.dataset.status = node.status;
    button.style.left = `${node.x}%`;
    button.style.top = `${node.y}%`;
    button.setAttribute('aria-label', `${node.name}，${nodeStatusLabel(node.status)}`);
    button.setAttribute('aria-pressed', String(state.selected === node.id));
    const icon = document.createElementNS(NS, 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = iconPaths[node.type] || iconPaths.town;
    const label = document.createElement('span');
    label.className = 'node-label';
    label.textContent = node.name;
    const statusDot = document.createElement('i');
    statusDot.className = 'node-status-dot';
    statusDot.setAttribute('aria-hidden', 'true');
    button.append(icon, label, statusDot);
    button.addEventListener('click', () => openSheet(node, true, button));
    nodesHost.append(button);
  });
}

function archiveScene(node) {
  const scenes = {
    port: '<path d="M0 126h320v74H0z" fill="#8c8b80"/><path d="M0 139q54-25 105 0t108 0 107 2v59H0z" fill="#5e625e"/><path d="M58 117h109l-18 16H76zM112 63v55m-31-35h77" fill="none" stroke="#343833" stroke-width="8"/>',
    town: '<path d="M0 150h320v50H0z" fill="#6b6d65"/><path d="M28 154V92l45-30 42 30v62m18 0v-43l39-27 39 27v43m18 0v-68h52v68" fill="#77786e" stroke="#363934" stroke-width="6"/><path d="M47 114h18m20 0h17m48 17h19m24 0h17m39-17h22" stroke="#d4cfbc" stroke-width="8"/>',
    bridge: '<path d="M0 148h320v52H0z" fill="#696c67"/><path d="M12 145h296M42 145q28-79 64 0m0 0q28-79 64 0m0 0q28-79 64 0m0 0q28-79 64 0" fill="none" stroke="#3f423e" stroke-width="10"/><path d="M0 166q70-19 140 0t180 0" fill="none" stroke="#a7a596" stroke-width="7"/>',
    tower: '<path d="M0 152h320v48H0z" fill="#656862"/><path d="M121 158l12-108h55l13 108zm-8-108h96l-15-19h-67z" fill="#575a55" stroke="#343733" stroke-width="5"/><path d="M150 78h23m-26 26h29m-33 28h36" stroke="#cfccb9" stroke-width="6"/>',
    camp: '<path d="M0 153h320v47H0z" fill="#656a62"/><path d="m57 154 62-94 62 94zm121 0 43-68 45 68" fill="#7c7d72" stroke="#393c37" stroke-width="7"/><path d="M119 61v94m102-68v68" stroke="#393c37" stroke-width="5"/>',
    forest: '<path d="M0 154h320v46H0z" fill="#666960"/><path d="m35 154 42-99 42 99m-13 0 52-125 52 125m-17 0 42-96 45 96" fill="#5f645c" stroke="#363a35" stroke-width="7"/>',
    cave: '<path d="M0 164h320v36H0z" fill="#666862"/><path d="M35 166Q66 47 160 46t128 120" fill="#666963" stroke="#383b37" stroke-width="9"/><path d="M105 166q9-75 55-75t58 75" fill="#30332f"/>',
    shrine: '<path d="M0 154h320v46H0z" fill="#696c64"/><path d="M78 77h164M95 77l22-38h86l22 38M105 77v81m110-81v81M76 158h168" fill="none" stroke="#41443f" stroke-width="12"/><path d="M132 101h57v57h-57z" fill="#74766d"/>',
    ruins: '<path d="M0 155h320v45H0z" fill="#696b64"/><path d="M39 158V62l39-23 41 23 39-23 42 23 39-23 39 23v96M76 158v-56h41v56m65-89h36v42" fill="#73746b" stroke="#3c3f3a" stroke-width="7"/>',
    gate: '<path d="M0 158h320v42H0z" fill="#686b65"/><path d="M49 159V82q0-54 48-54t48 54v77m29 0V82q0-54 48-54t48 54v77" fill="#74776f" stroke="#383c37" stroke-width="8"/><path d="M76 159V84q0-24 21-24t21 24v75m83 0V84q0-24 21-24t21 24v75" fill="#343733"/>',
    peak: '<path d="m0 170 83-110 45 54 54-89 138 145v30H0z" fill="#686b65"/><path d="m82 61 19 25 19-11 62-50 26 28" fill="none" stroke="#d1cdbb" stroke-width="8"/>',
  };
  const art = scenes[node.type] || scenes.town;
  const label = node.name.replace(/[&<>"']/g, '');
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#d8d3c2"/><stop offset="1" stop-color="#9d9d91"/></linearGradient><filter id="grain"><feTurbulence baseFrequency=".72" numOctaves="3" seed="${node.id.length + node.name.length}" type="fractalNoise"/><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 .16 0"/></filter></defs><path d="M0 0h320v200H0z" fill="url(#sky)"/><circle cx="245" cy="49" r="24" fill="#e7dfc8" opacity=".45"/>${art}<path d="M0 0h320v200H0z" filter="url(#grain)" opacity=".38"/><text x="12" y="190" fill="#292d29" font-family="Georgia,serif" font-size="12" opacity=".82">FIELD RECORD · ${label}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}

function photoNodes(data) {
  const current = data.nodes.find(node => node.status === 'current');
  const available = data.nodes.filter(node => node.status === 'available');
  const candidates = [current, ...available, data.nodes[0], data.nodes[data.nodes.length - 1], ...data.nodes].filter(Boolean);
  return [...new Map(candidates.map(node => [node.id, node])).values()].slice(0, 6);
}

function renderPhotos(data) {
  photoHost.replaceChildren();
  photoNodes(data).forEach((node, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'photo-card';
    button.dataset.nodeId = node.id;
    button.dataset.status = node.status;
    button.style.setProperty('--photo-index', index);
    button.setAttribute('aria-label', `打开${node.name}地点档案，${nodeStatusLabel(node.status)}`);
    button.setAttribute('aria-pressed', String(state.selected === node.id));

    const pin = document.createElement('i');
    pin.className = 'photo-pin';
    pin.setAttribute('aria-hidden', 'true');
    const image = document.createElement('img');
    image.src = node.photoUrl || archiveScene(node);
    image.alt = node.photoAlt || `${node.name}的黑白档案风景`;
    image.width = 320;
    image.height = 200;
    image.loading = 'lazy';
    image.decoding = 'async';
    const caption = document.createElement('span');
    caption.className = 'photo-caption';
    caption.textContent = node.name;
    const meta = document.createElement('small');
    meta.textContent = nodeStatusLabel(node.status);
    button.append(pin, image, caption, meta);
    button.addEventListener('click', () => openSheet(node, true, button));
    photoHost.append(button);
  });
}

function renderSummary(data) {
  const current = data.nodes.find(node => node.status === 'current') || data.nodes[0];
  document.querySelector('#map-title').textContent = data.title;
  document.querySelector('#map-subtitle').textContent = data.subtitle;
  document.querySelector('#weather-value').textContent = data.weather;
  document.querySelector('#current-location').textContent = current.name;
  document.querySelector('#current-note').textContent = current.hint;
  document.querySelector('#progress-value').textContent = `${data.progress}%`;
  document.querySelector('#progress-fill').style.width = `${data.progress}%`;
  document.querySelector('#objective-value').textContent = data.objective;
  document.querySelector('#risk-value').textContent = data.risk;
}

function render() {
  const data = datasets[state.dataset];
  renderSummary(data);
  renderRoutes(data);
  renderNodes(data);
  renderPhotos(data);
}

function syncSelection(nodeId) {
  map.querySelectorAll('.map-node, .photo-card').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.nodeId === nodeId));
  });
}

function openSheet(node, pushHistory, trigger) {
  state.selected = node.id;
  state.trigger = trigger || document.activeElement;
  document.querySelector('#sheet-route-state').textContent = nodeStatusLabel(node.status);
  document.querySelector('#sheet-eyebrow').textContent = node.status === 'current' ? 'CURRENT LOCATION' : node.status === 'available' ? 'NEXT LOCATION' : 'MAP RECORD';
  document.querySelector('#sheet-title').textContent = node.name;
  document.querySelector('#sheet-description').textContent = node.description;
  document.querySelector('#sheet-distance').textContent = node.distance;
  document.querySelector('#sheet-weather').textContent = node.weather;
  document.querySelector('#sheet-hint').textContent = node.hint;
  sheet.setAttribute('aria-hidden', 'false');
  syncSelection(node.id);
  if (pushHistory) history.pushState({ mapDetail: true, nodeId: node.id }, '', `#place-${node.id}`);
  requestAnimationFrame(() => sheetPanel.focus());
}

function closeSheet({ useHistory = true } = {}) {
  if (sheet.getAttribute('aria-hidden') === 'true') return;
  const previous = state.trigger?.isConnected
    ? state.trigger
    : map.querySelector(`[data-node-id="${CSS.escape(state.selected)}"]`);
  state.selected = null;
  state.trigger = null;
  sheet.setAttribute('aria-hidden', 'true');
  syncSelection(null);
  previous?.focus();
  if (useHistory && history.state?.mapDetail) history.back();
}

function showToast(message) {
  window.clearTimeout(state.toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  state.toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

function advanceStory() {
  const data = datasets[state.dataset];
  const current = data.nodes.find(node => node.status === 'current');
  const next = data.nodes.find(node => node.status === 'available');
  if (!current || !next) {
    showToast('当前示例没有更多已确认的可达地点。');
    return;
  }
  current.status = 'completed';
  next.status = 'current';
  data.progress = Math.min(100, data.progress + Math.max(6, Math.round(38 / data.nodes.length)));
  const nextEdge = data.edges.find(edge => edge[0] === current.id && edge[1] === next.id || edge[1] === current.id && edge[0] === next.id);
  if (nextEdge) nextEdge[2] = 'travelled';
  data.edges.forEach(edge => {
    if (edge[2] !== 'unknown') return;
    if (edge[0] === next.id || edge[1] === next.id) {
      edge[2] = 'available';
      const destinationId = edge[0] === next.id ? edge[1] : edge[0];
      const destination = data.nodes.find(node => node.id === destinationId);
      if (destination?.status === 'unknown') destination.status = 'available';
    }
  });
  render();
  showToast(`AI 数据已推进：当前位置更新为“${next.name}”。`);
}

document.querySelectorAll('[data-dataset]').forEach(button => {
  button.addEventListener('click', () => {
    if (sheet.getAttribute('aria-hidden') === 'false') closeSheet({ useHistory: false });
    state.dataset = button.dataset.dataset;
    document.querySelectorAll('[data-dataset]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    render();
    showToast(`已切换为 ${datasets[state.dataset].nodes.length} 个 AI 动态地点。`);
  });
});

document.querySelector('#advance-button').addEventListener('click', advanceStory);
document.querySelector('#map-exit').addEventListener('click', () => {
  if (embeddedMode && window.parent !== window) {
    window.parent.postMessage({ type: 'status-atelier-map-close' }, location.origin);
    return;
  }
  showToast('原型返回动作：主干集成时交还上层状态页或聊天。');
});
sheet.querySelectorAll('[data-close-sheet]').forEach(element => element.addEventListener('click', () => closeSheet()));

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (sheet.getAttribute('aria-hidden') === 'false') {
    closeSheet();
    return;
  }
  if (embeddedMode && window.parent !== window) {
    window.parent.postMessage({ type: 'status-atelier-map-close' }, location.origin);
  }
});

window.addEventListener('popstate', () => {
  if (sheet.getAttribute('aria-hidden') === 'false') closeSheet({ useHistory: false });
});

render();

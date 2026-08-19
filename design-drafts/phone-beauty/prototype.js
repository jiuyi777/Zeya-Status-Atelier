const PHONE_APP_DEFAULTS = Object.freeze([
  { id: 'Personal', name: '个人' },
  { id: 'Memo', name: '备忘录' },
  { id: 'Wechat', name: '微信' },
  { id: 'Shop', name: '购物' },
]);

const PHONE_PAGE_SCHEMAS = Object.freeze({
  Personal: [
    { id: 'favor', label: '好感度', kind: 'progress', value: '72' },
    { id: 'desire', label: '欲望度', kind: 'progress', value: '46' },
    { id: 'cloth', label: '当前衣着', kind: 'long', value: '浅灰针织外套，袖口沾了一点雨。' },
    { id: 'thought', label: '实时想法', kind: 'long', value: '想再多留一会儿，但不准备先开口。' },
  ],
  Memo: [
    { id: 'memo_1', value: '晚八点前回旧车站取伞。' },
    { id: 'memo_2', value: '记得把蓝色钥匙还给店主。' },
    { id: 'memo_3', value: '无' },
  ],
  Wechat: [
    { id: 'chat_target', value: '南枝' },
    { id: 'left_1', value: '你还在那家店吗？' },
    { id: 'right_1', value: '在，雨停了就走。' },
    { id: 'left_2', value: '那我来接你。' },
    { id: 'right_2', value: '好。' },
  ],
  Shop: [
    { id: 'item_1', value: '铜柄折叠伞' },
    { id: 'item_1_desc', value: '旧城区杂货铺，能挡住今晚的大雨。' },
    { id: 'item_2', value: '柚子硬糖' },
    { id: 'item_2_desc', value: '纸袋装，适合放进外套口袋。' },
    { id: 'item_3', value: '无' },
    { id: 'item_3_desc', value: '无' },
  ],
});

const SHARED_RECORDS = Object.freeze({
  current_location: '旧城区 · 雨廊',
  current_time: '19:42',
  current_weather: '小雨 / 16℃',
});

const PHONE_APP_ICON_PATHS = Object.freeze({
  Personal: '<circle cx="12" cy="8" r="3.1"></circle><path d="M5.7 19.2c.8-3.4 3-5.3 6.3-5.3s5.5 1.9 6.3 5.3"></path>',
  Memo: '<rect x="5.5" y="3.5" width="13" height="17" rx="3"></rect><path d="M9 8h6M9 12h6M9 16h4"></path>',
  Wechat: '<path d="M4.2 10.1c0-3.1 3-5.6 6.7-5.6s6.7 2.5 6.7 5.6-3 5.6-6.7 5.6c-.8 0-1.6-.1-2.3-.4l-3.3 1.6.8-3.1a5.1 5.1 0 0 1-1.9-3.7Z"></path><path d="M13.4 14.8c.5 2.1 2.6 3.7 5.1 3.7.6 0 1.1-.1 1.6-.3l2.1 1-.5-2c.8-.7 1.3-1.7 1.3-2.8 0-2-1.7-3.7-4.1-4.1"></path>',
  Shop: '<path d="M5.2 8.5h13.6l-1 11H6.2l-1-11Z"></path><path d="M8.6 9V7.1a3.4 3.4 0 0 1 6.8 0V9"></path>',
});

const PROTOTYPES = Object.freeze([
  { id: 'clamshell', number: '01', title: '贝壳折叠机', description: '上屏只负责内容，下半部是四枚实体 APP 键。打开页面时，导航不会消失。', note: '构图：双屏 / 实体键盘 / 珠光树脂外壳。动效：开屏呼吸光与按键下沉。' },
  { id: 'orbit', number: '02', title: '透明轨道机', description: '四个 APP 沿圆形桌面分布，中央时间像一枚悬浮表盘，页面从侧边滑入。', note: '构图：圆形主视觉 / 轨道 APP / 半透明侧翼。动效：轨道慢转、页面侧滑。' },
  { id: 'slider', number: '03', title: '贴纸滑盖机', description: '上屏是一张拼贴手帐，下层滑出快捷键盘；键盘可直接切换四个 APP。', note: '构图：3:4 主屏 / 滑出键盘 / 贴纸票根桌面。动效：贴纸轻摆与滑盖高光。' },
]);

const state = {
  wallpaperUrl: '', wallpaperPositionX: 50, wallpaperPositionY: 50,
  personalAvatarUrl: '', personalAvatarScale: 1,
  shellColor: '#6f65c8', motionEnabled: true,
  apps: PHONE_APP_DEFAULTS.map(app => ({ ...app, iconUrl: '' })),
};

const glyph = id => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${PHONE_APP_ICON_PATHS[id]}</svg>`;
const safeImageUrl = value => {
  const url = String(value || '').trim();
  return /^(https?:\/\/|\/[^/]|data:image\/(?:png|jpe?g|gif|webp|avif);base64,)/i.test(url) ? url : '';
};

function sharedMarkup() {
  return `<div class="shared-widget" data-contract="shared-records">
    <span data-field-id="current_time">${SHARED_RECORDS.current_time}</span>
    <strong data-field-id="current_location">${SHARED_RECORDS.current_location}</strong>
    <small data-field-id="current_weather">${SHARED_RECORDS.current_weather}</small>
  </div>`;
}

function appButton(app, mode = '') {
  return `<button class="phone-app ${mode}" type="button" data-app-id="${app.id}" aria-label="打开${app.name}">
    <span class="app-icon" data-icon-id="${app.id}">${glyph(app.id)}</span><span class="app-name">${app.name}</span>
  </button>`;
}

function homeMarkup(type) {
  const apps = state.apps.map(app => appButton(app, type === 'clamshell' ? 'physical-key' : '')).join('');
  if (type === 'clamshell') return `<div class="shell shell-clamshell" data-phone-shell="clamshell">
    <div class="clamshell-lid"><div class="speaker"></div><div class="phone-screen">${wallpaperMarkup()}<div class="screen-home">${sharedMarkup()}${avatarMarkup('cover-avatar')}</div><div class="screen-page" hidden></div></div></div>
    <div class="hinge"><i></i></div><div class="clamshell-base"><div class="physical-grid">${apps}</div><span class="brand-mark">ATELIER FLIP</span></div>
  </div>`;
  if (type === 'orbit') return `<div class="shell shell-orbit" data-phone-shell="orbit"><i class="side-wing wing-a"></i><i class="side-wing wing-b"></i>
    <div class="phone-screen">${wallpaperMarkup()}<div class="screen-home orbit-home">${sharedMarkup()}<div class="orbit-ring">${apps}</div><div class="orbit-core"><span>${SHARED_RECORDS.current_time}</span><small>RAIN SIGNAL</small></div></div><div class="screen-page" hidden></div></div><div class="orbit-homebar"></div>
  </div>`;
  return `<div class="shell shell-slider" data-phone-shell="slider"><div class="slider-top"><div class="phone-screen">${wallpaperMarkup()}<div class="screen-home slider-home">${sharedMarkup()}<div class="scrap-title"><small>TODAY'S POCKET</small><strong>${SHARED_RECORDS.current_weather}</strong></div><div class="ticket-apps">${apps}</div></div><div class="screen-page" hidden></div></div></div>
    <div class="slider-rail"></div><div class="slider-keyboard">${state.apps.map(app => appButton(app, 'shortcut-key')).join('')}<span class="keyboard-caption">QUICK KEYS</span></div></div>`;
}

function wallpaperMarkup() {
  return '<div class="phone-wallpaper" aria-hidden="true"><img alt="" draggable="false" hidden></div>';
}

function avatarMarkup(className = '') {
  return `<div class="phone-avatar ${className}" aria-hidden="true"><img alt="" draggable="false" hidden><span>${glyph('Personal')}</span></div>`;
}

function renderPage(appId) {
  const fields = PHONE_PAGE_SCHEMAS[appId];
  if (appId === 'Personal') return `<div class="personal-page">${avatarMarkup('page-avatar')}<div class="metric-row">${fields.slice(0, 2).map(field => `<div class="metric" data-field-id="${field.id}"><span>${field.label}</span><strong>${field.value}</strong><i><b style="width:${field.value}%"></b></i></div>`).join('')}</div>${fields.slice(2).map(field => `<div class="text-card" data-field-id="${field.id}"><span>${field.label}</span><p>${field.value}</p></div>`).join('')}</div>`;
  if (appId === 'Memo') return `<div class="memo-page">${fields.filter(field => field.value !== '无').map((field, index) => `<div class="memo-note" data-field-id="${field.id}"><span>${String(index + 1).padStart(2, '0')}</span><p>${field.value}</p></div>`).join('')}</div>`;
  if (appId === 'Wechat') return `<div class="chat-page"><div class="chat-person" data-field-id="chat_target">${fields[0].value}</div>${fields.slice(1).filter(field => field.value !== '无').map((field, index) => `<p class="chat-bubble ${index % 2 ? 'mine' : 'theirs'}" data-field-id="${field.id}">${field.value}</p>`).join('')}</div>`;
  const products = [];
  for (let index = 0; index < fields.length; index += 2) if (fields[index].value !== '无') products.push(`<details class="shop-item"><summary data-field-id="${fields[index].id}">${fields[index].value}</summary><p data-field-id="${fields[index + 1].id}">${fields[index + 1].value}</p></details>`);
  return `<div class="shop-page">${products.join('')}</div>`;
}

function openApp(shell, appId) {
  const app = state.apps.find(item => item.id === appId);
  const home = shell.querySelector('.screen-home');
  const page = shell.querySelector('.screen-page');
  page.innerHTML = `<header class="page-bar"><button type="button" class="back-button" aria-label="返回手机桌面">${glyph('Personal')}<span>返回</span></button><h3>${app.name}</h3></header><div class="page-scroll">${renderPage(appId)}</div>`;
  home.hidden = true;
  page.hidden = false;
  shell.dataset.activeApp = appId;
  applyImages(shell);
  page.querySelector('.back-button').focus({ preventScroll: true });
}

function closeApp(shell) {
  shell.querySelector('.screen-page').hidden = true;
  shell.querySelector('.screen-home').hidden = false;
  delete shell.dataset.activeApp;
  shell.querySelector(`[data-app-id="Personal"]`)?.focus({ preventScroll: true });
}

function applyImages(scope = document) {
  scope.querySelectorAll('.phone-wallpaper img').forEach(image => {
    const url = safeImageUrl(state.wallpaperUrl);
    image.hidden = !url;
    if (url) image.src = url; else image.removeAttribute('src');
    image.style.objectPosition = `${state.wallpaperPositionX}% ${state.wallpaperPositionY}%`;
    image.onerror = () => { image.hidden = true; image.removeAttribute('src'); };
  });
  scope.querySelectorAll('.phone-avatar img').forEach(image => {
    const url = safeImageUrl(state.personalAvatarUrl);
    const fallback = image.nextElementSibling;
    image.hidden = !url; fallback.hidden = Boolean(url);
    if (url) image.src = url; else image.removeAttribute('src');
    image.style.transform = `scale(${state.personalAvatarScale})`;
    image.onerror = () => { image.hidden = true; fallback.hidden = false; image.removeAttribute('src'); };
  });
  scope.querySelectorAll('[data-icon-id]').forEach(holder => {
    const app = state.apps.find(item => item.id === holder.dataset.iconId);
    const url = safeImageUrl(app?.iconUrl);
    holder.innerHTML = url ? `<img src="${url}" alt="" draggable="false">` : glyph(holder.dataset.iconId);
    const image = holder.querySelector('img');
    if (image) image.onerror = () => { holder.innerHTML = glyph(holder.dataset.iconId); };
  });
}

function renderGallery() {
  const gallery = document.querySelector('#phone-gallery');
  const template = document.querySelector('#phone-card-template');
  gallery.replaceChildren();
  PROTOTYPES.forEach(prototype => {
    const fragment = template.content.cloneNode(true);
    const article = fragment.querySelector('article');
    article.id = prototype.id;
    article.dataset.prototype = prototype.id;
    article.querySelector('.prototype-number').textContent = prototype.number;
    article.querySelector('h2').textContent = prototype.title;
    article.querySelector('.prototype-copy p').textContent = prototype.description;
    article.querySelector('.prototype-note').textContent = prototype.note;
    article.querySelector('.phone-stage').innerHTML = homeMarkup(prototype.id);
    gallery.append(fragment);
  });
  applyState();
}

function renderAppEditor() {
  const grid = document.querySelector('#app-editor-grid');
  grid.innerHTML = state.apps.map(app => `<fieldset data-app-editor="${app.id}"><legend>${app.id}</legend><label>显示名称<input data-app-name="${app.id}" maxlength="12" value="${app.name}"></label><label>图标 URL<input data-app-icon="${app.id}" type="url" placeholder="https://..."></label></fieldset>`).join('');
}

function applyState() {
  document.documentElement.style.setProperty('--shell-user', state.shellColor);
  document.body.classList.toggle('motion-off', !state.motionEnabled);
  document.querySelectorAll('.app-name').forEach(label => {
    const id = label.closest('[data-app-id]')?.dataset.appId;
    label.textContent = state.apps.find(app => app.id === id)?.name || id;
  });
  applyImages();
}

function bindControls() {
  const bindings = [
    ['wallpaper-url', 'wallpaperUrl', 'input'], ['avatar-url', 'personalAvatarUrl', 'input'],
    ['shell-color', 'shellColor', 'input'], ['wallpaper-x', 'wallpaperPositionX', 'input'],
    ['wallpaper-y', 'wallpaperPositionY', 'input'], ['avatar-scale', 'personalAvatarScale', 'input'],
  ];
  bindings.forEach(([id, key, eventName]) => document.querySelector(`#${id}`).addEventListener(eventName, event => {
    state[key] = event.target.type === 'range' ? Number(event.target.value) : event.target.value;
    applyState();
  }));
  document.querySelector('#motion-toggle').addEventListener('change', event => { state.motionEnabled = event.target.checked; applyState(); });
  document.querySelector('#reset-diy').addEventListener('click', () => {
    Object.assign(state, { wallpaperUrl: '', wallpaperPositionX: 50, wallpaperPositionY: 50, personalAvatarUrl: '', personalAvatarScale: 1, shellColor: '#6f65c8', motionEnabled: true });
    state.apps = PHONE_APP_DEFAULTS.map(app => ({ ...app, iconUrl: '' }));
    document.querySelector('#wallpaper-url').value = '';
    document.querySelector('#avatar-url').value = '';
    document.querySelector('#shell-color').value = state.shellColor;
    document.querySelector('#wallpaper-x').value = '50';
    document.querySelector('#wallpaper-y').value = '50';
    document.querySelector('#avatar-scale').value = '1';
    document.querySelector('#motion-toggle').checked = true;
    renderAppEditor(); bindAppEditor(); renderGallery();
  });
}

function bindAppEditor() {
  document.querySelector('#app-editor-grid').addEventListener('input', event => {
    const id = event.target.dataset.appName || event.target.dataset.appIcon;
    const app = state.apps.find(item => item.id === id);
    if (!app) return;
    if (event.target.dataset.appName) app.name = String(event.target.value || PHONE_APP_DEFAULTS.find(item => item.id === id).name).slice(0, 12);
    else app.iconUrl = event.target.value;
    applyState();
  });
}

document.addEventListener('click', event => {
  const appButtonElement = event.target.closest('[data-app-id]');
  if (appButtonElement && appButtonElement.closest('.shell')) {
    openApp(appButtonElement.closest('.shell'), appButtonElement.dataset.appId);
    return;
  }
  const backButton = event.target.closest('.back-button');
  if (backButton) closeApp(backButton.closest('.shell'));
});

renderAppEditor();
bindAppEditor();
renderGallery();
bindControls();

requestAnimationFrame(() => {
  const params = new URLSearchParams(location.search);
  const prototypeId = params.get('preview') || location.hash.slice(1);
  const target = PROTOTYPES.some(item => item.id === prototypeId) ? document.getElementById(prototypeId) : null;
  const appId = params.get('open');
  if (target && PHONE_PAGE_SCHEMAS[appId]) openApp(target.querySelector('.shell'), appId);
  target?.scrollIntoView({ block: 'start', behavior: 'instant' });
});

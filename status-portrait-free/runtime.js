// This runtime only reads the current regex payload; it never edits the host chat.
const status = document.querySelector('.status');
const content = document.getElementById('status-content');
const summary = document.querySelector('.folded-summary');
const fold = document.querySelector('.fold');
const records = [];
const raw = document.querySelector('[data-status-source]').value;
for (const key of ['title', 'subtitle']) {
  if (config[key]) status.querySelectorAll(`[data-design-${key}]`).forEach(node => { node.textContent = config[key]; });
}
for (const line of raw.split(/\r?\n/)) {
  const match = line.trim().match(/^\[(View[1-9]\d*)\|([^\[\]<>]*)\]$/);
  if (!match) continue;
  const values = match[2].split('|').map(value => value.trim());
  if (values.length < config.fields.length) continue;
  const person = Object.fromEntries(config.fields.map((field, index) => [field.id, values[index]]));
  person.name = person.name || values[config.fields.length] || config.pages.find(page => page.id === match[1])?.label || '当前角色';
  records.push(person);
}
if (!records.length) records.push({ name: '等待剧情状态' });
const people = document.querySelector('.people');
people.replaceChildren();
function fitFrame() {
  try {
    const overhang = Math.max(0, parseFloat(getComputedStyle(status).getPropertyValue('--preview-overhang')) || 0);
    const height = Math.ceil(status.getBoundingClientRect().height + overhang + 3);
    if (window.frameElement) window.frameElement.style.height = `${height}px`;
    if (window.parent !== window) window.parent.postMessage({ type: 'status-atelier:resize', height }, '*');
  } catch { /* Cross-origin hosts retain ordinary document scrolling. */ }
}
function selectPerson(index) {
  const person = records[index];
  status.querySelectorAll('[data-field]').forEach(node => {
    node.textContent = String(person[node.dataset.field] || '—');
    const fieldIndex = config.fields.findIndex(field => field.id === node.dataset.field);
    if (fieldIndex >= 0) node.dataset.value = String(fieldIndex);
  });
  people.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  const score = Math.max(0, Math.min(100, parseFloat(person.score) || 0));
  status.style.setProperty('--score', `${score}%`);
  status.querySelectorAll('[role="meter"]').forEach(meter => {
    meter.setAttribute('aria-valuenow', String(score));
    meter.setAttribute('aria-valuetext', `${person.score || '—'} / 100，${person.relation || ''}`);
  });
  fitFrame();
}
records.forEach((person, index) => {
  const button = document.createElement('button');
  button.type = 'button'; button.textContent = person.name; button.dataset.person = String(index);
  button.addEventListener('click', () => selectPerson(index));
  people.append(button);
});
fold.addEventListener('click', () => {
  const collapsed = !content.hidden;
  status.dataset.collapsed = String(collapsed);
  content.hidden = collapsed; summary.hidden = !collapsed;
  fold.setAttribute('aria-expanded', String(!collapsed));
  fold.setAttribute('aria-label', collapsed ? '展开状态栏' : '收起状态栏');
  fold.textContent = collapsed ? '+' : '−';
  fitFrame();
});
selectPerson(0);
new ResizeObserver(fitFrame).observe(status);
document.fonts?.ready.then(fitFrame);

import { PORTRAIT_FREE_TEMPLATES } from './status-portrait-free-templates.js?v=0.11.37';

const ASSET_BASE = 'https://raw.githubusercontent.com/jiuyi777/Zeya-Status-Atelier/v0.11.37/status-portrait-free/';
const fields = [
  ['姓名', '填写该人物在剧情中的真实姓名', 'text', 'name'],
  ['身份', '填写当前身份或称谓', 'text', 'identity'],
  ['剧情时间', '填写当前剧情日期与时间，依据正文场景', 'text', 'time'],
  ['地点', '填写当前所在地点', 'text', 'place'],
  ['衣着', '具体描述当前衣着与可见细节', 'long', 'attire'],
  ['状态', '填写当前身体与精神状态', 'long', 'condition'],
  ['行动', '填写此刻正在做什么', 'long', 'action'],
  ['关系', '简述与对话对象的当前关系阶段', 'text', 'relation'],
  ['信任', '填写0到100之间的整数，只写数字', 'progress', 'score'],
  ['关系变化', '填写本轮关系变化与原因', 'long', 'relationNote'],
  ['心声', '第一人称填写没有说出口的真实想法', 'long', 'voice'],
  ['下一程', '填写接下来准备做的事', 'long', 'plan'],
];
export const PORTRAIT_FREE_PRESETS = Object.freeze([
  { id: 'portrait-pixel-dream-42', name: '42 · 像素梦游', title: '像素梦游', template: 'pixel-dream', description: '无头像，立体像素窗口与蓝金梦核空间', glyph: '▦' },
  { id: 'portrait-earth-night-43', name: '43 · 地球失眠', title: '地球失眠', template: 'earth-night', description: '无头像，黑白怪诞剪纸与旋转地球', glyph: '◉' },
  { id: 'portrait-quiet-clock-44', name: '44 · 慢一刻', title: '慢一刻', template: 'quiet-clock', description: '无头像，浅灰内凹表盘，三针跟随设备本地时间', glyph: '◷' },
].map(preset => ({ ...preset, fields, shared: [], dynamicRoster: true, avatarSource: 'none', pagesText: '当前角色|填写当前主要角色的状态', subtitle: '人物状态', layout: 'grid' })));
export const PORTRAIT_FREE_IDS = Object.freeze(PORTRAIT_FREE_PRESETS.map(preset => preset.id));
export const isPortraitFree = structure => PORTRAIT_FREE_IDS.includes(structure);
const safeJson = value => JSON.stringify(value).replace(/</g, '\\u003c');
const escapeSource = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function buildDocument(rule, source, assetBase = ASSET_BASE) {
  const preset = PORTRAIT_FREE_PRESETS.find(item => item.id === rule.structure);
  if (!preset) throw new Error('未知的无头像状态栏');
  const template = PORTRAIT_FREE_TEMPLATES[preset.template];
  const config = safeJson({ fields: rule.pages[0]?.fields || rule.pageFields, pages: rule.pages,
    title: rule.title === preset.title ? '' : rule.title,
    subtitle: rule.subtitle === preset.subtitle ? '' : rule.subtitle });
  const runtime = `(function(){const config=${config};\n${template.runtime}\n})();`;
  const payload = `<textarea data-status-source hidden>${escapeSource(source)}</textarea><script>${runtime.replace(/<\/script/gi, '<\\/script')}</script>`;
  return template.html.replace('</body>', `${payload}</body>`).replaceAll('__STA_PORTRAIT_ASSETS__', assetBase);
}
export function buildPortraitFreeReplacement(rule) {
  return `\`\`\`html\n${buildDocument(rule, '$1')}\n\`\`\``;
}
export function buildPortraitFreePreview(rule, pages, { assetBase = new URL('./status-portrait-free/', import.meta.url).href } = {}) {
  const clean = value => String(value ?? '').replace(/[|\[\]<>\r\n]/g, ' ');
  const source = pages.map((entry, index) => `[${entry.page?.id || `View${index + 1}`}|${[...(entry.values || []), entry.page?.label || '当前角色'].map(clean).join('|')}]`).join('\n');
  return buildDocument(rule, source, assetBase);
}

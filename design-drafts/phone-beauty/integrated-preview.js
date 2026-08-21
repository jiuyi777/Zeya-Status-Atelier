import { RULE_PRESETS, STATUS_STRUCTURE_PRESETS, buildRegexScript } from '../../rule-generator.js';

const shells = [
  ['classic', '经典直板机（原款）'],
  ['clamshell', '01 横向掌机'],
  ['orbit', '02 粉色相机机'],
  ['slider', '03 银白挂饰机'],
];
const previewParams = new URLSearchParams(location.search);
const requestedShell = previewParams.get('preview');
const requestedPage = previewParams.get('open');
const returnHome = previewParams.get('return') === '1';
const openPage = ['Personal', 'Memo', 'Wechat', 'Shop'].includes(requestedPage) ? requestedPage : '';
const visibleShells = shells.some(([id]) => id === requestedShell)
  ? shells.filter(([id]) => id === requestedShell)
  : shells;

const phonePreset = STATUS_STRUCTURE_PRESETS.find(item => item.id === 'phone');
const sampleStatus = `<zeya_status>
[Shared|旧城区 · 雨廊|19:42|小雨 / 16℃]
[Personal|72|46|浅灰针织外套，袖口沾了一点雨|想再多留一会儿，但不准备先开口]
[Memo|今晚的雨一直敲着旧车站的玻璃顶。我在那里等了很久，明明已经听见脚步声，还是装作只在看远处的灯。|他把那把蓝色钥匙放进我手心时，指尖还是凉的。他说话很轻，我却把每个字都记住了。原来真正让我慌张的从来不是等待，而是他真的来了。|回来的路上雨小了。我想，下一次见面时，我会先把想说的话说出来，也会告诉他，这把钥匙对我意味着什么。]
[Wechat|南枝|你还在那家店吗？|在，雨停了就走|那我来接你|好，我在门口等你|外面冷，先别出来|知道啦，你慢点开|看见你了|我也看见你了]
[Shop|铜柄折叠伞|旧城区杂货铺，能挡住今晚的大雨|柚子硬糖|纸袋装，适合放进外套口袋|无|无]
</zeya_status>`;

function exportedHtml(shellStyle) {
  const apps = [
    { id: 'Personal', name: '个人', iconUrl: '', enabled: true },
    { id: 'Memo', name: '日记', iconUrl: '', enabled: true },
    { id: 'Wechat', name: '微信', iconUrl: '', enabled: true },
    { id: 'Shop', name: '购物', iconUrl: '', enabled: shellStyle === 'classic' || shellStyle === 'slider' },
  ];
  const replaceString = buildRegexScript({
    ...RULE_PRESETS.custom,
    structure: 'phone',
    theme: 'glass',
    paletteId: 'ice-blue',
    pagesText: phonePreset.pagesText,
    sharedFieldsText: phonePreset.shared.map(field => field.join('|')).join('\n'),
    pageFieldsText: phonePreset.fields.map(field => field.join('|')).join('\n'),
    phoneDesktop: { shellStyle, apps },
  }).replaceString.replace('$1', sampleStatus);
  const exportedFragment = replaceString.replace(/^```html\s*/, '').replace(/\s*```$/, '');
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${exportedFragment}</body></html>`;
}

const gallery = document.querySelector('#gallery');
if (visibleShells.length === 1) gallery.classList.add('is-single');
for (const [id, title] of visibleShells) {
  const article = document.createElement('article');
  const heading = document.createElement('h2');
  const frame = document.createElement('iframe');
  heading.textContent = title;
  frame.title = `${title}可交互预览`;
  frame.loading = 'eager';
  frame.srcdoc = exportedHtml(id);
  frame.addEventListener('load', () => {
    if (!openPage) return;
    const controlKey = { Personal: 'X', Wechat: 'Y', Shop: 'B', Memo: 'A' }[openPage];
    if (id === 'clamshell' && controlKey) {
      frame.contentDocument?.querySelector(`[data-phone-control="${controlKey}"]`)?.click();
      if (returnHome) frame.contentDocument?.querySelector('.zrs-phone-back')?.click();
      return;
    }
    const icon = frame.contentDocument?.querySelector(`.zrs-app-icon[data-app-id="${openPage}"]`);
    icon?.closest('button')?.click();
    if (returnHome) frame.contentDocument?.querySelector('.zrs-phone-back')?.click();
  });
  article.dataset.shell = id;
  article.append(heading, frame);
  gallery.append(article);
}

import { RULE_PRESETS, STATUS_STRUCTURE_PRESETS, buildRegexScript } from '../../rule-generator.js';

const shells = [
  ['classic', '经典直板机（原款）'],
  ['clamshell', '贝壳折叠机'],
  ['orbit', '透明轨道机'],
  ['slider', '贴纸滑盖机'],
];

const phonePreset = STATUS_STRUCTURE_PRESETS.find(item => item.id === 'phone');
const sampleStatus = `<zeya_status>
[Shared|旧城区 · 雨廊|19:42|小雨 / 16℃]
[Personal|72|46|浅灰针织外套，袖口沾了一点雨|想再多留一会儿，但不准备先开口]
[Memo|晚八点前回旧车站取伞|把蓝色钥匙还给店主|无]
[Wechat|南枝|你还在那家店吗？|在，雨停了就走|那我来接你|好]
[Shop|铜柄折叠伞|旧城区杂货铺，能挡住今晚的大雨|柚子硬糖|纸袋装，适合放进外套口袋|无|无]
</zeya_status>`;

function exportedHtml(shellStyle) {
  const replaceString = buildRegexScript({
    ...RULE_PRESETS.custom,
    structure: 'phone',
    theme: 'glass',
    paletteId: 'ice-blue',
    pagesText: phonePreset.pagesText,
    sharedFieldsText: phonePreset.shared.map(field => field.join('|')).join('\n'),
    pageFieldsText: phonePreset.fields.map(field => field.join('|')).join('\n'),
    phoneDesktop: { shellStyle },
  }).replaceString.replace('$1', sampleStatus);
  return replaceString.replace(/^```html\s*/, '').replace(/\s*```$/, '');
}

const gallery = document.querySelector('#gallery');
for (const [id, title] of shells) {
  const article = document.createElement('article');
  const heading = document.createElement('h2');
  const frame = document.createElement('iframe');
  heading.textContent = title;
  frame.title = `${title}可交互预览`;
  frame.loading = 'eager';
  frame.srcdoc = exportedHtml(id);
  article.dataset.shell = id;
  article.append(heading, frame);
  gallery.append(article);
}

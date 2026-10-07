import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as rules from '../rule-generator.js';
import * as portrait from '../status-portrait-free.js';

const source = readFileSync(new URL('../index.js', import.meta.url), 'utf8');
const functionSource = name => {
  const match = source.match(new RegExp(`^function ${name}\\([^]*?^}`, 'm'));
  assert.ok(match, `Missing production function: ${name}`);
  return match[0];
};
const functions = ['applyProfileAppearance', 'resolvedStatusInput', 'resolvedStatusExportInput',
  'renderStatusPreview', 'mountStatusBeautyPreview'];
if (source.includes('function renderPortraitFreePreview(')) functions.push('renderPortraitFreePreview');

function element(tag, className = '', text = '') {
  assert.ok(!className.includes('zeya-regex-status'), '新款落回了截图中的古典对称通用布局');
  return { tag, className, textContent: text, children: [], dataset: {}, attributes: {},
    append(...children) { this.children.push(...children); },
    replaceChildren(...children) { this.children = children; },
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener() {}, closest() { return null; } };
}
const descendants = node => [node, ...node.children.flatMap(descendants)];

test('地图在制作弹窗提供真实编辑器入口，切换其他作品后恢复面板', () => {
  const host = element('section');
  const sections = new Map();
  const stored = { structure: 'quest' };
  let opened = false;
  const box = {
    settings: () => stored,
    greetingModal: { querySelector(selector) {
      if (selector === '#status-atelier-modal-structure-controls') return host;
      if (!sections.has(selector)) sections.set(selector, {});
      return sections.get(selector);
    } },
    makeElement(tag, cls, text) { return { ...element(tag, cls, text), addEventListener(type, fn) { this[type] = fn; } }; },
    openQuestMapEditor: () => { opened = true; },
  };
  vm.runInNewContext(functionSource('renderModalStructureControls'), box);
  box.renderModalStructureControls();
  const entry = host.children.find(node => node.tag === 'button');
  assert.equal(host.hidden, false);
  assert.ok(entry);
  entry.click();
  assert.equal(opened, true);
  assert.ok([...sections.values()].every(node => node.hidden));
  stored.structure = 'forum';
  box.renderModalStructureControls();
  assert.ok([...sections.values()].every(node => !node.hidden));
});

for (const preset of portrait.PORTRAIT_FREE_PRESETS) {
  test(`${preset.title}: 制作弹窗选择后渲染专属无头像界面，并导出同一款`, () => {
    const stored = { structure: 'profile', profileAppearance: 'moon-collage',
      media: { avatarSource: 'character' }, phoneDesktop: {}, profileTextOverrides: {} };
    const host = element('div');
    const box = { ...rules, ...portrait, settings: () => stored,
      DEFAULT_SETTINGS: { media: {}, phoneDesktop: {} }, clone: structuredClone,
      PROFILE_APPEARANCE_PRESETS: portrait.PORTRAIT_FREE_PRESETS,
      PROFILE_APPEARANCE_DEFAULT: portrait.PORTRAIT_FREE_PRESETS[0],
      context: () => ({}), getThumbnailUrl() {}, user_avatar: '',
      resolveHostAvatarUrls: () => ({ url: '/characters/old-avatar.png', fallbackUrl: '' }),
      document: { querySelector: () => ({}) }, statusAiTestRecords: null, makeElement: element,
      isStatusBeauty01To15: () => false, isStatusBeauty05To09: () => false,
      isStatusBeauty16To20: () => false, isStatusBeauty32To41: () => false,
      isOriginalRoleCardStructure: () => false,
      saveCurrentProfileTemplateDraft() {}, field: () => null, renderStatusSchema() {},
      renderModalStatusSchema() {}, renderTemplateMediaControls() {},
      createStatusBeautyDirectEditor: () => ({ root: element('section'), openMedia() {} }),
      bindStatusBeautyPreviewEditing() {},
      updatePreview: () => box.renderStatusPreview(host),
    };
    vm.runInNewContext(functions.map(functionSource).join('\n'), box);
    assert.equal(box.applyProfileAppearance(preset.id), true);
    const nodes = descendants(host);
    const frame = nodes.find(node => node.tag === 'iframe');
    assert.ok(frame, '制作弹窗必须挂载正式样式 iframe');
    assert.ok(frame.srcdoc.includes(preset.template === 'pixel-dream' ? 'dream-terminal' : preset.template === 'earth-night' ? 'earth-terminal' : 'quiet-clock'));
    assert.doesNotMatch(frame.srcdoc, /data-st-avatar|old-avatar\.png/);
    assert.equal(nodes.some(node => node.textContent === '修改头像'), false);
    const exported = rules.buildRegexScript(box.resolvedStatusExportInput());
    assert.match(exported.replaceString, /^```html/);
    assert.ok(exported.replaceString.includes(preset.title));
    assert.doesNotMatch(exported.replaceString, /data-st-avatar|old-avatar\.png/);
    const records = rules.makePreviewRecords(box.resolvedStatusInput());
    records.pages[0].values[0] = '剧情人物';
    box.statusAiTestRecords = records;
    box.renderStatusPreview(host);
    assert.match(descendants(host).find(node => node.tag === 'iframe').srcdoc, /剧情人物/);
  });
}

test('专属响应式预览保留自身布局和高度，旧款继续使用原有适配', () => {
  for (const structure of ['portrait-quiet-clock-44', 'beauty-current-status-05']) {
    const styles = [];
    let resized = 0;
    const box = { isPortraitFree: portrait.isPortraitFree, settings: () => ({}),
      resizeStatusBeautyPreviewFrame: () => { resized += 1; }, statusBeautyStaticTextNodes: () => [],
    };
    vm.runInNewContext(functionSource('bindStatusBeautyPreviewEditing'), box);
    const doc = { createElement: () => ({}), head: { append: node => styles.push(node.textContent) }, querySelectorAll: () => [] };
    const frame = { contentDocument: doc, addEventListener: (name, callback) => callback() };
    box.bindStatusBeautyPreviewEditing(frame, { structure }, { editor: {} });
    assert.match(styles.join(''), /touch-action:manipulation/);
    if (portrait.isPortraitFree(structure)) {
      assert.equal(resized, 0);
      assert.doesNotMatch(styles.join(''), /display:flex|overflow:hidden|zoom/);
    } else {
      assert.equal(resized, 1);
      assert.match(styles.join(''), /background:transparent!important/);
    }
  }
});

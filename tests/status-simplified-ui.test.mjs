import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../index.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../style.css', import.meta.url), 'utf8') + readFileSync(new URL('../status-maker.css', import.meta.url), 'utf8');
const productionFunction = name => {
    const match = source.match(new RegExp(`^(?:async )?function ${name}\\([^]*?^}`, 'm'));
    assert.ok(match, `Missing ${name}`);
    return match[0];
};

function control() {
    const selectors = new Map();
    return {
        dataset: {}, attributes: {}, listeners: {}, children: [], value: '', textContent: '',
        setAttribute(name, value) { this.attributes[name] = value; },
        addEventListener(name, listener) { this.listeners[name] = listener; },
        scrollIntoView() {},
        append(...nodes) { this.children.push(...nodes); },
        querySelector(selector) {
            if (!selectors.has(selector)) selectors.set(selector, control());
            return selectors.get(selector);
        },
        querySelectorAll() { return []; },
    };
}

test('both makers can open their own full workbench from the shared header', () => {
    const header = source.match(/<header class="status-atelier-dialog-header">([^]*?)<\/header>/)?.[1] || '';
    assert.match(header, /id="status-atelier-open-full-workbench"/);
    assert.doesNotMatch(header, /status-atelier-opening-only/);
    const root = control();
    let openedWorkspace;
    let closed = false;
    const box = {
        greetingModal: null, settingsRoot: root,
        document: { createElement: control, body: control(), querySelector: () => null },
        setGreetingModalWorkspace(workspace) { box.greetingModal.dataset.workspace = workspace; },
        setWorkspace(workspace) { openedWorkspace = workspace; },
        closeGreetingModal() { closed = true; },
        saveCurrentStatusTemplate() {}, addStatusField() {},
        getComputedStyle: () => ({ display: 'block' }),
        setTimeout: callback => callback(),
    };
    vm.runInNewContext(`${productionFunction('buildGreetingModal')}\n${productionFunction('openFullWorkbench')}`, box);
    box.buildGreetingModal();
    for (const workspace of ['status', 'opening']) {
        root.dataset.full = '0';
        box.greetingModal.dataset.workspace = workspace;
        box.greetingModal.querySelector('#status-atelier-open-full-workbench').listeners.click();
        assert.equal(openedWorkspace, workspace);
        assert.equal(closed, true);
        assert.equal(root.dataset.full, '1');
        assert.equal(root.querySelector('.status-atelier-launch-full').attributes['aria-expanded'], 'true');
    }
});

test('a collapsed phone preview retains its expand control at desktop widths', () => {
    const desktop = styles.slice(styles.lastIndexOf('@media (min-width:980px)'));
    assert.doesNotMatch(desktop, /\.status-atelier-preview-toggle\s*\{\s*display:\s*none/);
    assert.match(styles, /data-collapsed="1"\]\s+#status-atelier-modal-status-preview\s*\{\s*display:\s*none/);
    assert.match(source, /collapsed \? '展开预览' : '收起预览'/);
});

test('full phone preview opens a collapsed preview and returns without rebuilding the preview or form', () => {
    const modal = control();
    const wrap = modal.querySelector('.status-atelier-modal-status-preview-wrap');
    const toggle = modal.querySelector('.status-atelier-preview-toggle');
    const button = modal.querySelector('.status-atelier-preview-expand');
    const preview = modal.querySelector('#status-atelier-modal-status-preview');
    const inspector = modal.querySelector('.status-atelier-editor-inspector');
    const liveFrame = { currentTime: 37 };
    preview.children = [liveFrame];
    preview.scrollTop = 140;
    inspector.scrollTop = 260;
    inspector.value = '尚未保存的字段内容';
    wrap.dataset.collapsed = '1';
    const box = { greetingModal: modal };
    vm.runInNewContext(productionFunction('setStatusPreviewExpanded'), box);
    box.setStatusPreviewExpanded(true);
    assert.equal(modal.dataset.previewExpanded, '1');
    assert.equal(wrap.dataset.collapsed, '0');
    assert.equal(toggle.attributes['aria-expanded'], 'true');
    assert.equal(button.textContent, '返回编辑');
    box.setStatusPreviewExpanded(false);
    assert.equal(modal.dataset.previewExpanded, '0');
    assert.equal(button.textContent, '放大预览');
    assert.equal(button.attributes['aria-expanded'], 'false');
    assert.equal(preview.children[0], liveFrame);
    assert.equal(liveFrame.currentTime, 37);
    assert.equal(preview.scrollTop, 140);
    assert.equal(inspector.scrollTop, 260);
    assert.equal(inspector.value, '尚未保存的字段内容');
    wrap.dataset.collapsed = '1';
    box.setStatusPreviewExpanded(false);
    assert.equal(wrap.dataset.collapsed, '1', 'closing the maker keeps the user collapse preference');
});

test('template searches filter by number, title and multiple words, then restore the selection', () => {
    const cards = [
        { ...control(), dataset: { search: '11 时针旅页 星空钟' } },
        { ...control(), dataset: { search: '13 橄榄票根簿 旅行' } },
        { ...control(), dataset: { search: '61 入场券票根 黑白' } },
        { ...control(), dataset: { search: '53 微博动态 主页' } },
    ];
    const picker = control();
    picker.querySelectorAll = () => cards;
    const gallery = picker.querySelector('.status-atelier-tpl-gallery');
    gallery.clientHeight = 200;
    cards[2].offsetTop = 300;
    cards[2].clientHeight = 100;
    gallery.querySelector = () => cards[2];
    const box = { greetingModal: picker, PROFILE_APPEARANCE_PRESETS: cards, requestAnimationFrame: callback => callback() };
    vm.runInNewContext(productionFunction('filterTemplatePicker'), box);
    for (const [query, visible] of [['11', [0]], ['票根', [1, 2]], ['微博', [3]], ['票根 黑白', [2]], ['不存在', []], ['', [0, 1, 2, 3]]]) {
        box.filterTemplatePicker(query);
        assert.deepEqual(cards.flatMap((card, index) => card.hidden ? [] : [index]), visible);
        assert.equal(picker.querySelector('.status-atelier-tpl-count').textContent, query ? `找到 ${visible.length} 款` : '4 款');
    }
    assert.equal(gallery.scrollTop, 250);
});

test('editor tabs preserve controls and field edits while changing the visible panel', () => {
    const names = ['templates', 'content', 'appearance'];
    const tabs = names.map(name => ({ ...control(), dataset: { editorTab: name } }));
    const panels = names.map(name => ({ ...control(), dataset: { editorPanel: name }, value: '保留已经填写的内容' }));
    const modal = { dataset: {}, querySelectorAll: selector => selector === '[data-editor-tab]' ? tabs : panels };
    const box = { greetingModal: modal };
    vm.runInNewContext(productionFunction('setStatusEditorPanel'), box);
    for (const name of [...names, 'content', 'templates']) {
        box.setStatusEditorPanel(name);
        assert.equal(modal.dataset.editorPanel, name);
        assert.deepEqual(panels.filter(panel => !panel.hidden).map(panel => panel.dataset.editorPanel), [name]);
        assert.deepEqual(tabs.filter(tab => tab.tabIndex === 0).map(tab => tab.dataset.editorTab), [name]);
        assert.ok(panels.every(panel => panel.value === '保留已经填写的内容'));
    }
});

test('footer installation reports a missing character and keeps the action available to retry', async () => {
    const states = [control(), control(), control()];
    const button = { textContent: '一键安装到当前角色', disabled: false };
    const stored = { title: '保留标题', media: { avatarUrl: 'https://example.org/avatar.png' } };
    let installScope;
    const box = {
        greetingModal: { querySelectorAll: () => states }, settings: () => stored,
        async installRegex(scope) { installScope = scope; throw new Error('请先选择一个角色'); },
        notify() {},
    };
    vm.runInNewContext(productionFunction('applyModalStatus'), box);
    await box.applyModalStatus(button);
    assert.equal(installScope, 'scoped');
    assert.ok(states.every(state => state.dataset.state === 'error' && state.textContent.includes('请先选择一个角色')));
    assert.equal(button.disabled, false);
    assert.equal(button.textContent, '一键安装到当前角色');
    assert.equal(stored.title, '保留标题');
    assert.equal(stored.media.avatarUrl, 'https://example.org/avatar.png');
});

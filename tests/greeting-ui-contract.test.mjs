import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../index.js', import.meta.url), 'utf8');
const settingsMarkup = fs.readFileSync(new URL('../settings.html', import.meta.url), 'utf8');
const styleSource = fs.readFileSync(new URL('../style.css', import.meta.url), 'utf8');

test('greeting modal exposes explicit fill-missing and regenerate-all actions', () => {
    assert.match(source, /id="status-atelier-read-current-card">补全缺失项</);
    assert.match(source, /id="status-atelier-regenerate-all">全部重新生成</);
    assert.match(source, /readGreetingsIntoOpeningHome\(\{ overwrite \}\)/);
});

test('opening the greeting modal does not automatically call the model', () => {
    const block = source.match(/function openGreetingModal\(\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(block, /renderGreetingList\(\)/);
    assert.doesNotMatch(block, /refreshGreetingModal/);
});

test('greeting editor keeps title, route and summary as separate editable fields', () => {
    assert.match(source, /线路标签（通常会自动匹配）/);
    assert.match(source, /路线简介（1句话，谁在做什么、发生了什么）/);
    assert.match(source, /target\.route = routeField\.input\.value/);
});

test('simple editor exposes work intro and editable worldline descriptions without leaving the modal', () => {
    const block = source.match(/function buildGreetingHomeQuickEditor\(\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(block, /panel\.open = true/);
    assert.match(block, /作品简介与线路介绍（可编辑）/);
    assert.match(block, /世界线介绍/);
    assert.match(block, /线路介绍/);
    assert.match(block, /worldline\.description = descriptionField\.input\.value/);
});

test('opening-home drafts switch by current character instead of leaking routes across cards', () => {
    assert.match(source, /openingProfiles: \{\}/);
    assert.match(source, /function switchOpeningProfileForCurrentCharacter\(\)/);
    assert.match(source, /switchOpeningHomeProfile\(\{/);
    const openBlock = source.match(/function openGreetingModal\(\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(openBlock, /switchOpeningProfileForCurrentCharacter\(\)/);
    const bindBlock = source.match(/function bindEvents\(\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(bindBlock, /events\.CHAT_CHANGED/);
    assert.match(bindBlock, /switchOpeningProfileForCurrentCharacter\(\)/);
});

test('AI routes are constrained by the current character worldbook catalog', () => {
    assert.match(source, /currentWorldbookRouteCatalog\(\)/);
    assert.match(source, /route 只能逐字选择上面世界书中已经存在的线路名/);
    assert.doesNotMatch(source, /不得重复这些已使用线路标签/);
});

test('worldbook route prefixes create UID bindings and connect each opening', () => {
    assert.match(source, /syncWorldbookRouteBindings\(routeCatalog\)/);
    assert.match(source, /routeWorldlineIds\?\.\[generated\[index\]\.route\]/);
    assert.match(source, /greetingBindingSummary\(boundWorldline\)/);
    assert.match(source, /手动调整绑定/);
});

test('regenerate all preserves written work intro and only fills missing homepage fields', () => {
    assert.match(source, /const makeHomepage = Boolean\(homepageFields\.length\)/);
    assert.match(source, /if \(batch\.workIntro && needsGeneratedWorkIntro\(\)\)/);
    assert.doesNotMatch(source, /overwrite \|\| needsGeneratedWorkIntro\(\)/);
});

test('home templates apply complete and visibly distinct visual settings', () => {
    assert.match(source, /Object\.assign\(settings\(\)\.openingHome, template\.values\)/);
    const backgrounds = [...source.matchAll(/values: \{ theme: '[^']+', font: '[^']+', background: '(#[0-9a-f]+)'/gi)].map(match => match[1]);
    assert.equal(backgrounds.length, 4);
    assert.equal(new Set(backgrounds).size, 4);
});

test('long mobile opening editors are collapsed independently', () => {
    const openingWorkspace = settingsMarkup.match(/data-status-workspace-panel="opening"([\s\S]*?)data-status-workspace-panel="status"/)?.[1] || '';
    assert.equal((openingWorkspace.match(/status-atelier-collapsible/g) || []).length, 3);
    for (const label of ['作品固定资料', '世界线介绍（可选）', '额外问候语目录']) {
        assert.match(settingsMarkup, new RegExp(`<summary[^>]*>[\\s\\S]*?${label}[\\s\\S]*?<\\/summary>`));
    }
});

test('status workspace exposes component, palette, real avatar and audio controls', () => {
    for (const id of ['status-atelier-structure', 'status-atelier-status-palettes', 'status-atelier-avatar-source', 'status-atelier-avatar-url', 'status-atelier-image-url', 'status-atelier-audio-url', 'status-atelier-test-ai']) {
        assert.match(settingsMarkup, new RegExp(`id="${id}"`));
    }
    assert.match(source, /thumbnail\('avatar', avatar\)/);
    assert.match(source, /thumbnail\('persona', user_avatar\)/);
    assert.match(source, /parseStatusOutput\(input, response\)/);
});

test('mobile workbench keeps bottom sheets inside safe areas with touch-sized controls', () => {
    assert.match(styleSource, /env\(safe-area-inset-bottom\)/);
    assert.match(styleSource, /\.status-atelier-palette-toolbar button\s*\{[\s\S]*?min-height:\s*44px/);
});

test('simple greeting flow keeps one primary footer action and moves secondary actions into more', () => {
    const footer = source.match(/<footer class="status-atelier-dialog-footer">([\s\S]*?)<\/footer>/)?.[1] || '';
    assert.match(footer, /id="status-atelier-modal-apply"/);
    assert.equal((footer.match(/<button/g) || []).length, 1);
    assert.doesNotMatch(footer, /modal-copy-home|modal-download-regex|open-full-workbench|regenerate-all/);
    assert.match(source, /class="status-atelier-greeting-more"/);
    for (const id of ['status-atelier-regenerate-all', 'status-atelier-modal-copy-home', 'status-atelier-open-full-workbench']) {
        assert.match(source, new RegExp(`id="${id}"`));
    }
});

test('mobile greeting modal offers a stateless copy-only overview and directly installs a status regex', () => {
    assert.match(source, /id="status-atelier-generate-overview"/);
    assert.match(source, /buildOpeningOverview\(data\.entries, generated/);
    const overviewBlock = source.match(/async function generateOpeningOverview\(button\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(overviewBlock, /syncBindings: false/);
    assert.doesNotMatch(overviewBlock, /settings\(\)\.openingHome|saveSettingsNow|renderGreetingList/);
    assert.doesNotMatch(source, /status-atelier-greeting-overview-preview/);
    assert.match(source, /id="status-atelier-modal-status-style"/);
    assert.match(source, /id="status-atelier-modal-apply-status"/);
    const statusBlock = source.match(/async function applyModalStatus\(button\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(statusBlock, /await installRegex\('scoped'\)/);
    assert.doesNotMatch(source, /id="status-atelier-modal-download-regex"/);
});

test('greeting flow includes in-place theme selection and live preview without another modal', () => {
    assert.match(source, /status-atelier-greeting-theme-list/);
    assert.match(source, /status-atelier-greeting-live-preview/);
    assert.match(source, /renderGreetingThemeChooser\(\)/);
    assert.doesNotMatch(source, /status-atelier-greeting-theme-dialog/);
});

test('manual UID editing is progressive disclosure while cards stay collapsed by default', () => {
    assert.match(source, /高级：调整世界书绑定/);
    assert.match(source, /keepOnlyOpenGreetingCard/);
    assert.doesNotMatch(source, /card\.open\s*=\s*true/);
});

test('primary apply waits for automatic worldbook binding before installing', () => {
    const block = source.match(/async function applyGreetingModal\(button\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(block, /readGreetingsIntoOpeningHome\(\{ rawEntries: plan\.alternateGreetings \}\)/);
    assert.match(block, /await greetingBindingPromise/);
    assert.ok(block.indexOf('await greetingBindingPromise') < block.indexOf("await installOpeningHomeRegex('scoped')"));
    assert.ok(block.indexOf("await installOpeningHomeRegex('scoped')") < block.indexOf('await applyOpeningHomeCharacterPlan(plan)'));
});

test('one-click homepage updates the local regex and character greeting without manual copying', () => {
    const block = source.match(/async function applyGreetingModal\(button\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(block, /currentOpeningHomeCharacterPlan\(\)/);
    assert.match(block, /await applyOpeningHomeCharacterPlan\(plan\)/);
    assert.match(settingsMarkup, /id="status-atelier-opening-install-scoped"[^>]*>一键生成并应用</);
    assert.match(settingsMarkup, /原主开场白会自动移入额外问候语/);
});

test('status workspace exposes a short one-click path and hides customization by default', () => {
    assert.match(settingsMarkup, /id="status-atelier-install-scoped"[^>]*>一键应用到当前角色</);
    assert.match(settingsMarkup, /<details class="status-atelier-setting-section status-atelier-collapsible">[\s\S]*?状态栏字段/);
    assert.match(settingsMarkup, /<details class="status-atelier-setting-section status-atelier-collapsible">[\s\S]*?更多外观与配色/);
    assert.match(settingsMarkup, /<details class="status-atelier-setting-section status-atelier-advanced">[\s\S]*?可选：头像、配图与音乐/);
    const block = source.match(/async function installRegex\(scope\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(block, /settings\(\)\.promptEnabled = true/);
    assert.match(block, /updatePrompt\(\)/);
});

test('status prompt only runs where the generated status regex is installed', () => {
    const gate = source.match(/function statusRegexAppliesToCurrentContext\(\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(gate, /getScriptsByType\(SCRIPT_TYPES\.SCOPED\)/);
    assert.match(gate, /getScriptsByType\(SCRIPT_TYPES\.GLOBAL\)/);
    const prompt = source.match(/function updatePrompt\(\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(prompt, /stored\.promptEnabled && statusRegexAppliesToCurrentContext\(\)/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../index.js', import.meta.url), 'utf8');
const settingsMarkup = fs.readFileSync(new URL('../settings.html', import.meta.url), 'utf8');
const styleSource = fs.readFileSync(new URL('../style.css', import.meta.url), 'utf8');
const mapEditorMarkup = fs.readFileSync(new URL('../design-drafts/map-beauty/index.html', import.meta.url), 'utf8');

test('greeting modal exposes explicit fill-missing and regenerate-all actions', () => {
    assert.match(source, /id="status-atelier-read-current-card">补全缺失项</);
    assert.match(source, /id="status-atelier-regenerate-all">全部重新生成</);
    assert.match(source, /readGreetingsIntoOpeningHome\(\{ overwrite \}\)/);
});

test('opening the greeting modal does not automatically call the model', () => {
    const block = source.match(/function openGreetingModal\(target = 'opening'\) \{([\s\S]*?)\n\}/)?.[1] || '';
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
    assert.match(block, /作品总简介（含世界观 \/ 背景）/);
    assert.match(block, /世界线介绍（可选）/);
    assert.match(block, /线路介绍/);
    assert.match(block, /worldline\.description = descriptionField\.input\.value/);
});

test('opening-home drafts switch by current character instead of leaking routes across cards', () => {
    assert.match(source, /openingProfiles: \{\}/);
    assert.match(source, /function switchOpeningProfileForCurrentCharacter\(\)/);
    assert.match(source, /switchOpeningHomeProfile\(\{/);
    const openBlock = source.match(/function openGreetingModal\(target = 'opening'\) \{([\s\S]*?)\n\}/)?.[1] || '';
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
    assert.equal(backgrounds.length, 12);
    assert.equal(new Set(backgrounds).size, 12);
    for (const theme of ['scroll', 'editorial', 'collage', 'dossier', 'glass', 'kinetic', 'noir-poster', 'negative-space']) {
        assert.match(source, new RegExp(`id: '${theme}'`));
        assert.match(styleSource, new RegExp(`status-atelier-opening-live\\[data-theme="${theme}"\\]`));
    }
    assert.match(styleSource, /writing-mode: vertical-rl/);
    assert.match(styleSource, /grid-template-columns: minmax\(0, var\(--zop-media-width\)\) minmax\(0, 1fr\)/);
    assert.match(styleSource, /LAYOUT \/ DESIGN/);
});

test('long mobile opening editors are collapsed independently', () => {
    const openingWorkspace = settingsMarkup.match(/data-status-workspace-panel="opening"([\s\S]*?)data-status-workspace-panel="status"/)?.[1] || '';
    assert.equal((openingWorkspace.match(/status-atelier-collapsible/g) || []).length, 3);
    for (const label of ['作品固定资料', '世界线介绍（可选）', '额外问候语目录']) {
        assert.match(settingsMarkup, new RegExp(`<summary[^>]*>[\\s\\S]*?${label}[\\s\\S]*?<\\/summary>`));
    }
});

test('status workspace exposes component, palette, real avatar and audio controls', () => {
    for (const id of ['status-atelier-structure', 'status-atelier-forum-skins', 'status-atelier-status-styles', 'status-atelier-status-palettes', 'status-atelier-avatar-source', 'status-atelier-avatar-url', 'status-atelier-image-url', 'status-atelier-archive-image-urls', 'status-atelier-audio-url', 'status-atelier-test-ai']) {
        assert.match(settingsMarkup, new RegExp(`id="${id}"`));
    }
    assert.match(settingsMarkup, /拍立得图片链接（每行一个，随机显示）/);
    assert.match(source, /'status-atelier-archive-image-urls': 'archiveImageUrls'/);
    assert.match(settingsMarkup, /<strong>人物状态栏<\/strong>/);
    assert.match(settingsMarkup, /26 套配色/);
    assert.match(source, /resolveHostAvatarUrls\('avatar', avatar, thumbnail\)/);
    assert.match(source, /resolveHostAvatarUrls\('persona', user_avatar, thumbnail\)/);
    assert.match(source, /parseStatusOutput\(input, response\)/);
    assert.match(source, /details\.append\(instruction\)/);
    assert.doesNotMatch(source, /instructionWrap\.append\(instruction\)/);
});

test('profile appearance keeps structure profile while exposing status beauty 01 to 21', () => {
    assert.match(source, /const PROFILE_APPEARANCE_IDS = Object\.freeze\(\[\.\.\.STATUS_BEAUTY_01_15_IDS, \.\.\.STATUS_BEAUTY_16_20_IDS, 'archive-status'\]\)/);
    assert.match(source, /profileAppearance: PROFILE_APPEARANCE_DEFAULT\.id/);
    assert.match(source, /profileTemplateSchemaVersion: 1/);
    assert.match(source, /profileTemplateDrafts: \{\}/);
    assert.match(source, /legacyProfileTemplateSchemaVersion < 1[\s\S]*?stored\.profileTemplateDrafts = \{\}[\s\S]*?stored\.pageFieldsText = appearance\.fields\.map/);
    assert.match(source, /function saveCurrentProfileTemplateDraft\(stored = settings\(\)\)/);
    assert.match(source, /stored\.profileTemplateDrafts\?\.\[appearance\.id\]/);
    assert.match(source, /function applyProfileAppearance\(appearanceId\)/);
    assert.match(source, /stored\.structure = 'profile'/);
    assert.match(source, /async function resolveStatusRegexScript\(input = resolvedStatusExportInput\(\)\)/);
    assert.match(source, /isStatusBeauty01To15\(rule\.structure\)[\s\S]*?loadStatusBeautyBundledRegex\(rule\.structure\)/);
    assert.match(settingsMarkup, /<strong>人物状态栏<\/strong>/);
});

test('quest template opens the dedicated map editor inside the main plugin', () => {
    assert.match(settingsMarkup, /id="status-atelier-quest-map-entry"[^>]*hidden/);
    assert.match(settingsMarkup, /任务地图模板都在地图编辑器里/);
    assert.match(settingsMarkup, /id="status-atelier-open-map-editor"[^>]*>进入地图模板编辑器</);
    assert.equal((mapEditorMarkup.match(/<option value="(?:desk-casebook|travel-atlas|urban-research|noir-network|crime-collage|travel-souvenir|urban-investigation|retro-archive)"/g) || []).length, 8);
    const syncBlock = source.match(/function syncQuestMapEditorEntry\(\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(syncBlock, /const questMode = settings\(\)\.structure === 'quest'/);
    for (const id of ['status-atelier-status-schema-section', 'status-atelier-quick-apply-section', 'status-atelier-download-actions-section', 'status-atelier-advanced-rules-section', 'status-atelier-preview-shell']) {
        assert.match(syncBlock, new RegExp(id));
        assert.match(settingsMarkup, new RegExp(`id="${id}"`));
    }
    assert.match(source, /if \(settings\(\)\.structure === 'quest'\) \{\s*host\.replaceChildren\(\);\s*return;/);
    assert.doesNotMatch(source, /\[\['当前区域', questValues\[0\]\]/);
    assert.match(source, /new URL\('\.\/design-drafts\/map-beauty\/index\.html\?embedded=1', import\.meta\.url\)/);
    assert.match(source, /event\.data\?\.type !== 'status-atelier-map-close'/);
    assert.match(styleSource, /\.status-atelier-map-editor-overlay\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?inset:\s*0;/);
    assert.match(styleSource, /\.status-atelier-map-editor-frame\s*\{[\s\S]*?width:\s*100%;[\s\S]*?height:\s*100%;/);
});

test('status appearance controls update in place and preserve readable selected text', () => {
    assert.match(source, /paletteHost\.children\.length !== STATUS_PALETTE_PRESETS\.length/);
    const paletteClick = source.match(/const statusPaletteButton = event\.target\.closest\('\[data-status-palette\]'\);([\s\S]*?)field\('status-atelier-test-ai'\)/)?.[1] || '';
    assert.doesNotMatch(paletteClick, /renderStatusDesignControls\(\)/);
    assert.match(paletteClick, /refreshStatusPalettePreview\(\)/);
    const styleClick = source.match(/const statusStyleButton = event\.target\.closest\('\[data-status-style\]'\);([\s\S]*?)field\('status-atelier-test-ai'\)/)?.[1] || '';
    assert.match(styleClick, /refreshStatusAppearancePreview\(\)/);
    assert.doesNotMatch(styleClick, /updatePreview\(\)/);
    assert.match(source, /style\.textContent = `\$\{STATUS_THEME_CSS\}\\n\$\{CHAT_REFERENCE_CSS\}\\n\$\{STATUS_PHONE_CSS\}`/);
    assert.match(source, /scope: 'shared'/);
    assert.match(source, /definitions\.filter\(item => item\.scope === 'shared'\)/);
    assert.match(source, /status-atelier-preview-card zrs-card/);
    assert.match(source, /status-atelier-preview-field zrs-field/);
    assert.match(source, /meter\.append\(fill\)/);
    assert.doesNotMatch(source, /status-atelier-preview-meter-marker|zrs-meter-trail/);
    assert.doesNotMatch(styleSource, /status-atelier-preview-flow/);
    const appliesCheck = source.match(/function statusRegexAppliesToCurrentContext\(\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.doesNotMatch(appliesCheck, /buildRegexScript/);
    const resolvedInput = source.match(/function resolvedStatusInput\(source = settings\(\)\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.doesNotMatch(resolvedInput, /clone\(source\)/);
    assert.doesNotMatch(resolvedInput, /openingProfiles|openingNotes|openingHome/);
    assert.match(resolvedInput, /media: \{ \.\.\.DEFAULT_SETTINGS\.media, \.\.\.\(source\.media \|\| \{\}\) \}/);
    const mediaRead = source.match(/function readStatusMediaControl\(control\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.doesNotMatch(mediaRead, /renderStatusDesignControls\(\)/);
    assert.match(styleSource, /status-atelier-template-card\.is-active :is\(strong, small\) \{\s*color: inherit;/);
    assert.match(styleSource, /data-theme="vinyl-mag"\][\s\S]*?status-atelier-rule-preview-header::before/);
});

test('mobile workbench keeps bottom sheets inside safe areas with touch-sized controls', () => {
    assert.match(styleSource, /env\(safe-area-inset-bottom\)/);
    assert.match(styleSource, /\.status-atelier-palette-toolbar button\s*\{[\s\S]*?min-height:\s*44px/);
});

test('simple greeting flow keeps one primary footer action and moves secondary actions into more', () => {
    const footer = source.match(/<footer class="status-atelier-dialog-footer[^"]*">([\s\S]*?)<\/footer>/)?.[1] || '';
    assert.match(footer, /id="status-atelier-modal-apply"/);
    assert.equal((footer.match(/<button/g) || []).length, 1);
    assert.doesNotMatch(footer, /modal-copy-home|modal-download-regex|open-full-workbench|regenerate-all/);
    assert.match(source, /class="status-atelier-greeting-more status-atelier-opening-only"/);
    for (const id of ['status-atelier-regenerate-all', 'status-atelier-modal-copy-home', 'status-atelier-open-full-workbench']) {
        assert.match(source, new RegExp(`id="${id}"`));
    }
});

test('mobile greeting modal offers a stateless copy-only overview and directly installs a status regex', () => {
    assert.match(source, /id="status-atelier-generate-overview"/);
    assert.match(source, /mergeOpeningOverviewMetadata\(data\.entries, settings\(\)\.openingHome\.entries\)/);
    assert.match(source, /buildOpeningOverview\(prepared, generated/);
    assert.match(source, /includeHomepage: true/);
    const overviewBlock = source.match(/async function generateOpeningOverview\(button\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(overviewBlock, /syncBindings: false/);
    assert.match(overviewBlock, /overwrite: false/);
    assert.doesNotMatch(overviewBlock, /settings\(\)\.openingHome\s*=|saveSettingsNow|renderGreetingList/);
    assert.doesNotMatch(source, /status-atelier-greeting-overview-preview/);
    assert.match(source, /id="status-atelier-modal-status-style"/);
    assert.match(source, /id="status-atelier-modal-status-structure"/);
    assert.match(source, /id="status-atelier-modal-status-preview"/);
    assert.doesNotMatch(source, /id="status-atelier-modal-status-logos"/);
    assert.match(source, /id="status-atelier-modal-status-palettes"/);
    assert.match(source, /id="status-atelier-modal-apply-status"/);
    assert.match(source, /id="status-atelier-modal-add-field"/);
    assert.match(source, /id="status-atelier-modal-status-schema"/);
    assert.match(source, /字段与 AI 动态数值/);
    const statusBlock = source.match(/async function applyModalStatus\(button\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(statusBlock, /await installRegex\('scoped'\)/);
    assert.doesNotMatch(statusBlock, /title: style\.title|subtitle: style\.subtitle/);
    assert.doesNotMatch(source, /logoId: stored\.logoId/);
    assert.doesNotMatch(source, /id="status-atelier-modal-download-regex"/);
    assert.match(styleSource, /#status-atelier-modal\s*\{[\s\S]*?width:\s*100vw;[\s\S]*?height:\s*100dvh;/);
});

test('wand exposes a simple AI status flow while the plugin settings keep the full workbench', () => {
    assert.match(source, /制作开场白 · 九一/);
    assert.match(source, /制作状态栏 · 九一/);
    assert.match(source, /status-atelier-greeting-theme-favorites/);
    assert.match(source, /展开未收藏主页外观/);
    assert.match(source, /function openGreetingModal\(target = 'opening'\)/);
    assert.match(source, /target === 'status'/);
    assert.match(styleSource, /#status-atelier-modal\[data-workspace="status"\] \.status-atelier-opening-only/);
    assert.match(source, /id="status-atelier-modal-test-ai"[^>]*>AI 分析并生成美化</);
    assert.match(source, /id="status-atelier-modal-ai-idea"[^>]*maxlength="240"/);
    assert.match(settingsMarkup, /id="status-atelier-ai-idea"[^>]*maxlength="240"/);
    assert.match(source, /id="status-atelier-modal-ai-remix"[^>]*type="radio"/);
    assert.match(settingsMarkup, /id="status-atelier-ai-remix"[^>]*type="radio"/);
    assert.match(source, /id="status-atelier-modal-apply-status"[^>]*disabled[^>]*>确认安装到当前角色</);
    assert.match(source, /id="status-atelier-modal-ai-recommendation"[^>]*hidden/);
    assert.match(source, /class="status-atelier-modal-status-preview-wrap">\s*<small>实时预览<\/small>/);
    assert.doesNotMatch(source, /id="status-atelier-open-full-status-workbench"/);
    assert.match(source, /testStatusAiGeneration\(event\.currentTarget, 'modal', true\)/);
    assert.match(settingsMarkup, /id="status-atelier-settings"[^>]*data-entry-mode="expert"/);
    assert.match(settingsMarkup, /data-status-entry-mode="simple"[^>]*>\s*<strong>简单模式/);
    assert.match(settingsMarkup, /data-status-entry-mode="expert"[^>]*aria-pressed="true"[^>]*>\s*<strong>复杂模式/);
    assert.match(settingsMarkup, /<details id="status-atelier-expert-workshop" class="status-atelier-expert-workshop" open>/);
    assert.match(styleSource, /data-entry-mode="expert"[^\n]*status-atelier-quick-apply-section/);
    assert.match(styleSource, /data-status-entry-mode="expert"[^\n]*status-atelier-modal-ai-simple-flow/);
    assert.doesNotMatch(source, /data-greeting-workspace=/);
    const openBlock = source.match(/function openGreetingModal\(target = 'opening'\) \{([\s\S]*?)\n\}/)?.[1] || '';
    const statusFastPath = openBlock.match(/if \(target === 'status'\) \{([\s\S]*?)\n    \}/)?.[1] || '';
    assert.match(statusFastPath, /setGreetingModalWorkspace\('status'\)/);
    assert.match(source, /source\.textContent = describeCurrentCharacterContext\(context\(\)\)/);
    assert.match(source, /statusAiSource\.textContent = describeCurrentCharacterContext\(context\(\)\)/);
    assert.match(statusFastPath, /setStatusEntryMode\('modal', 'simple'\)/);
    assert.match(statusFastPath, /return;/);
    assert.doesNotMatch(statusFastPath, /ensureLocalGreetingDrafts|renderGreetingList|renderGreetingThemeChooser|updateOpeningHomePreview/);
    const aiGenerationBlock = source.match(/async function testStatusAiGeneration\(button, viewName = 'settings', forceDifferent = false\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(aiGenerationBlock, /compactStatusAiText\(idea\?\.value, 240\)/);
    assert.match(aiGenerationBlock, /用户提示词/);
    assert.match(aiGenerationBlock, /forceDifferent \|\| Boolean\(remix\?\.checked\)/);
    assert.doesNotMatch(aiGenerationBlock, /previewWrap\.hidden = true/);
    const entryModeBlock = source.match(/function setStatusEntryMode\(viewName, mode\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(entryModeBlock, /normalized === 'expert'/);
    assert.match(entryModeBlock, /renderStatusPreview\(preview\)/);
    const simpleFlowStyle = styleSource.match(/\.status-atelier-ai-simple-flow \{([\s\S]*?)\n\}/)?.[1] || '';
    const aiActionStyle = styleSource.match(/\.status-atelier-workbench \.status-atelier-ai-generate,([\s\S]*?)\n\}/)?.[1] || '';
    const emptyPreviewStyle = styleSource.match(/\.status-atelier-ai-preview-empty \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.doesNotMatch(simpleFlowStyle, /gradient/i);
    assert.doesNotMatch(aiActionStyle, /gradient/i);
    assert.doesNotMatch(emptyPreviewStyle, /gradient/i);
});

test('complex status mode keeps readable controls and exposes its own one-click install', () => {
    const advancedMarkup = source.match(/<details class="status-atelier-modal-status-advanced">([\s\S]*?)<\/details>\s*<div class="status-atelier-modal-status-preview-wrap">/)?.[1] || '';
    assert.match(advancedMarkup, /id="status-atelier-modal-apply-status-expert"[^>]*>一键安装到当前角色</);
    assert.match(advancedMarkup, /class="status-atelier-modal-install-status"/);
    assert.match(source, /querySelector\('#status-atelier-modal-apply-status-expert'\)\.addEventListener\('click', event => applyModalStatus\(event\.currentTarget\)\)/);
    const installBlock = source.match(/async function applyModalStatus\(button\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(installBlock, /querySelectorAll\('\.status-atelier-modal-install-status'\)/);
    assert.match(installBlock, /state\.dataset\.state = 'success'/);
    assert.match(installBlock, /state\.dataset\.state = 'error'/);
    assert.match(styleSource, /#status-atelier-modal \.status-atelier-entry-mode-switch \.menu_button\[aria-pressed="true"\][\s\S]*?color:\s*#fff\s*!important;[\s\S]*?background:\s*#7f2e2b\s*!important;/);
    assert.match(styleSource, /#status-atelier-modal \.status-atelier-entry-mode-switch \.menu_button\[aria-pressed="true"\] :is\(strong, small\)[\s\S]*?color:\s*inherit\s*!important;/);
    assert.match(styleSource, /#status-atelier-modal \.status-atelier-modal-status-controls select\.text_pole[\s\S]*?color:\s*#2d2925\s*!important;[\s\S]*?background:\s*#fffaf3\s*!important;/);
    assert.match(styleSource, /#status-atelier-modal \.status-atelier-expert-install \.menu_button[\s\S]*?width:\s*100%;[\s\S]*?background:\s*#8f3531\s*!important;/);
});

test('status quick editor updates fields without reloading the whole opening-home workbench', () => {
    const structureBlock = source.match(/function applyStatusStructure\(structureId\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.doesNotMatch(structureBlock, /loadSettingsUI/);
    assert.match(structureBlock, /renderModalStatusSchema\(\)/);
    assert.match(structureBlock, /scheduleStatusPreviewUpdate\(\)/);
    assert.match(source, /function renderModalStatusSchema\(\)/);
    assert.match(source, /function scheduleStatusPreviewUpdate\(\)/);
    assert.match(source, /requestAnimationFrame/);
});

test('modal and palettes stay inside mobile viewport and palette library is collapsible', () => {
    assert.match(settingsMarkup, /status-atelier-status-palette-library/);
    assert.doesNotMatch(settingsMarkup, /status-atelier-status-logo-library/);
    assert.doesNotMatch(source, /status-atelier-status-logo-library/);
    assert.match(source, /structure: 'phone'/);
    assert.match(source, /PHONE_STRUCTURE_IDS = Object\.freeze\(\['phone', 'profile', 'social', 'forum', 'chat', 'quest'\]\)/);
    assert.doesNotMatch(source.match(/const PHONE_STRUCTURE_IDS = Object\.freeze\(([^\n]+)\)/)?.[1] || '', /music/);
    assert.match(settingsMarkup, /<summary><strong>色卡<\/strong><small>26 套配色<\/small><\/summary>/);
    assert.match(settingsMarkup, /<details class="status-atelier-status-style-library" open>[\s\S]*?<strong>人物状态栏<\/strong><small>21 款完整设计；每款保留自己的字段与构图<\/small>/);
    assert.match(styleSource, /status-atelier-status-style-library > summary::\-webkit-details-marker[\s\S]*?status-atelier-status-palette-library > summary::\-webkit-details-marker[\s\S]*?display:\s*none/);
    assert.match(styleSource, /max-height:\s*calc\(100dvh - 12px - env\(safe-area-inset-top\) - env\(safe-area-inset-bottom\)\)/);
    assert.match(styleSource, /\.status-atelier-dialog-body\s*\{[\s\S]*?overflow-y:\s*auto;[\s\S]*?overscroll-behavior:\s*contain;/);
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

test('status AI generation stays preview-only until either entry explicitly installs', () => {
    assert.match(settingsMarkup, /id="status-atelier-test-ai"[^>]*>AI 分析并生成美化</);
    assert.match(settingsMarkup, /id="status-atelier-ai-method-quick"[^>]*type="radio"[^>]*checked/);
    assert.match(settingsMarkup, /id="status-atelier-ai-remix"[^>]*type="radio"/);
    assert.match(settingsMarkup, /快速按模板生成/);
    assert.match(settingsMarkup, /按提示词大幅改造/);
    assert.match(settingsMarkup, /id="status-atelier-ai-regenerate"[^>]*>\s*<span[^>]*>↻<\/span> 不满意，重新生成/);
    assert.match(settingsMarkup, /id="status-atelier-ai-save-template"[^>]*>☆ 保存为我的模板/);
    assert.match(settingsMarkup, /id="status-atelier-ai-saved-templates"/);
    assert.match(settingsMarkup, /id="status-atelier-ai-recent-templates"/);
    assert.match(settingsMarkup, /id="status-atelier-install-scoped"[^>]*disabled[^>]*>确认安装到当前角色</);
    assert.match(settingsMarkup, /id="status-atelier-ai-recommendation"[^>]*hidden/);
    assert.match(source, /async function currentStatusAiContext\(\)/);
    assert.match(source, /currentEmbeddedWorldbooks\(\)/);
    assert.match(source, /currentLinkedWorldbooks\(\)/);
    assert.match(source, /\.slice\(-12\)/);
    const generateBlock = source.match(/async function testStatusAiGeneration\(button, viewName = 'settings', forceDifferent = false\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(generateBlock, /currentStatusAiContext\(\)/);
    assert.match(generateBlock, /【改造幅度：大幅改造】/);
    assert.match(generateBlock, /diversifyStatusRecommendation\(recommendation/);
    assert.match(generateBlock, /recentKeys: settings\(\)\.statusRecentRecommendations/);
    assert.match(generateBlock, /statusRecommendationKey\(recommendation\)/);
    assert.match(generateBlock, /slice\(-5\)/);
    assert.match(generateBlock, /rememberGeneratedStatusTemplate\(\)/);
    assert.match(generateBlock, /用户提示词/);
    assert.match(generateBlock, /applyStatusAiRecommendation\(recommendation\)/);
    assert.match(generateBlock, /showStatusAiRecommendation\(recommendation, contextSnapshot, viewName\)/);
    assert.match(generateBlock, /【格式纠正】/);
    assert.doesNotMatch(generateBlock, /buildLocalStatusRecords|本地已生成|usedLocalFallback/);
    assert.match(source, /STATUS_CONTEXT_CONTROL_TITLE/);
    assert.match(source, /includeCreatorNotes: false/);
    assert.doesNotMatch(generateBlock, /installRegex\(/);
    assert.match(source, /继续生成不会覆盖，只有点击安装才会替换为当前方案/);
    assert.match(source, /'phoneDesktop', 'media'/);
    assert.doesNotMatch(settingsMarkup, /status-atelier-shuffle-recipe|完整 40 套|20 套自由面板/);
    assert.doesNotMatch(source, /status-atelier-modal-shuffle-recipe|applyStatusRecipe|shuffleStatusRecipe/);
    assert.match(source, /id="status-atelier-modal-ai-method-quick"[^>]*type="radio"[^>]*checked/);
    assert.match(source, /id="status-atelier-modal-ai-regenerate"/);
    assert.match(source, /field\('status-atelier-ai-regenerate'\)\.addEventListener\('click', event => testStatusAiGeneration\(event\.currentTarget, 'settings', true\)\)/);
    assert.match(source, /id="status-atelier-modal-ai-save-template"/);
    assert.match(source, /function saveCurrentStatusTemplate\(\)/);
    assert.match(source, /savedStatusTemplates/);
    const rememberBlock = source.match(/function rememberGeneratedStatusTemplate\(\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(rememberBlock, /recentStatusTemplates/);
    assert.doesNotMatch(rememberBlock, /stored\.savedStatusTemplates/);
    assert.match(source, /SAVED_STATUS_TEMPLATE_KEYS/);
    assert.doesNotMatch(source.match(/function currentSavedStatusTemplate\(\) \{([\s\S]*?)\n\}/)?.[1] || '', /statusAiTestRecords|chatContext|characterContext/);
    assert.doesNotMatch(settingsMarkup, /id="status-atelier-fill-mode"/);
    assert.doesNotMatch(source, /id="status-atelier-modal-status-fill-mode"/);
    assert.match(source, /class="status-atelier-modal-status-advanced">/);
    assert.match(source, /id="status-atelier-modal-structure-controls"/);
    assert.match(source, /function renderModalStructureControls\(\)/);
    assert.match(source, /小手机完整调控/);
    assert.match(source, /status-atelier-modal-phone-app-row/);
    assert.match(source, /status-atelier-phone-wallpaper-edit/);
    assert.match(styleSource, /\.status-atelier-modal-phone-grid\s*\{/);
    assert.match(styleSource, /\.status-atelier-modal-phone-app-row\s*\{/);
    assert.match(styleSource, /\.status-atelier-modal-structure-controls > \.status-atelier-setting-actions\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
    assert.match(styleSource, /\.status-atelier-modal-structure-controls > \.status-atelier-setting-actions \.menu_button\s*\{[\s\S]*?width:\s*100%[\s\S]*?white-space:\s*normal/);
    assert.match(styleSource, /@media \(max-width:\s*700px\)[\s\S]*?\.status-atelier-modal-structure-controls > \.status-atelier-setting-actions\s*\{[\s\S]*?grid-template-columns:\s*1fr/);
    assert.match(styleSource, /\.status-atelier-phone-wallpaper-edit\s*\{/);
    assert.match(settingsMarkup, /<details class="status-atelier-setting-section status-atelier-collapsible">[\s\S]*?APP 页面数据/);
    assert.match(settingsMarkup, /<details id="status-atelier-appearance-section" class="status-atelier-setting-section status-atelier-collapsible" open>[\s\S]*?外观与配色/);
    assert.match(settingsMarkup, /id="status-atelier-template-media"[\s\S]*?当前模板角色字段设置/);
    assert.doesNotMatch(settingsMarkup, /可选：头像、配图与音乐/);
    const block = source.match(/async function installRegex\(scope\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(block, /settings\(\)\.promptEnabled = false/);
    assert.match(block, /updatePrompt\(\)/);
});

test('status workbench separates templates, appearance and palettes and supports direct preview editing', () => {
    assert.match(settingsMarkup, /选择状态栏模板/);
    assert.doesNotMatch(settingsMarkup, /模板决定完整构图与交互/);
    assert.doesNotMatch(settingsMarkup, /换素材与动效|都是独立模板/);
    assert.match(settingsMarkup, /status-atelier-setting-section status-atelier-collapsible" open>[\s\S]*?选择状态栏模板/);
    assert.doesNotMatch(settingsMarkup, /外观改字体、边框、材质、圆角和组件造型|色卡只控制颜色/);
    assert.match(settingsMarkup, /id="status-atelier-appearance-section"[^>]*open>[\s\S]*?<h4[^>]*>外观与配色<\/h4>/);
    assert.match(source, /appearanceSection\.hidden = \['phone', 'forum', 'chat', 'quest'\]\.includes\(stored\.structure\)/);
    assert.match(source, /function populateStatusStructureSelect\(structureSelect\)/);
    assert.match(source, /appendGroup\('手机桌面', \['phone'\]\)/);
    assert.match(source, /appendGroup\('聊天会话', \['chat'\]\)/);
    assert.match(source, /appendGroup\('其他状态栏'/);
    assert.match(source, /forumSkinButton[\s\S]*?settings\(\)\.forumSkin = skin\.id/);
    assert.match(settingsMarkup, /<details id="status-atelier-forum-skins-section"[^>]*status-atelier-collapsible[^>]*open hidden>/);
    assert.doesNotMatch(settingsMarkup, /每套都会更换排版方式、示例站名和回复语气/);
    assert.doesNotMatch(settingsMarkup, /把 AI 输出规则写进当前角色世界书，并更新当前角色的局部正则/);
    assert.match(styleSource, /status-atelier-forum-skin\[aria-pressed="true"\][\s\S]*?background: rgba\(250, 248, 241, \.9\) !important/);
    assert.match(source, /status-atelier-forum-field-slot/);
    assert.match(source, /AI 怎么写这项（可选）/);
    assert.match(source, /isRestrictedPage[\s\S]*?深\(\?:页\|夜\)档案/);
    assert.doesNotMatch(source, /六套独立聊天构图|左侧头像可选当前角色、当前 User、自定义 URL 或隐藏/);
    assert.match(source, /structure === 'profile' \? '当前模板角色字段设置'/);
    assert.doesNotMatch(source, /头像会绑定当前角色、当前 user 或图片 URL/);
    assert.match(source, /function bindStatusBeautyPreviewEditing\(frame, rule/);
    assert.match(source, /function makeStatusBeautyStaticTextEditable\(node, structure, key, editor\)/);
    assert.match(source, /function createStatusBeautyDirectEditor\(rule\)/);
    assert.match(source, /function mountStatusBeautyPreview\(host, frame, rule/);
    assert.match(source, /const statusBeautyBundlePreviewRequests = new WeakMap\(\)/);
    assert.match(source, /statusBeautyBundlePreviewRequests\.get\(host\)/);
    assert.match(source, /点击画面中的字段名称、X、固定文字或头像即可修改/);
    assert.match(source, /修改角色头像/);
    assert.match(source, /这个位置需要 AI 填写什么？/);
    assert.match(source, /状态栏标题/);
    assert.match(source, /querySelectorAll\('\[data-design-title\]'\)/);
    assert.match(source, /editor\.openTitle\(designTitleNodes\)/);
    assert.match(source, /这是 AI 动态字段，编辑预览中统一显示 X/);
    assert.match(source, /点击修改角色头像/);
    assert.match(source, /img\[data-st-avatar\],img\[alt\*="角色头像"\],img\.avatar,img\.art-photo/);
    assert.match(source, /applyStatusBeautyMediaSettings\(edited, rule\.media\)/);
    assert.match(source, /profileTextOverrides\[structure\]\[key\] = next/);
    assert.match(source, /applyStatusBeautyTextOverrides\(script, settings\(\)\.profileTextOverrides\?\.\[rule\.structure\]\)/);
    assert.match(source, /querySelectorAll\('\[data-capture\]'\)/);
    assert.match(source, /querySelectorAll\('\[data-label\]'\)/);
    assert.match(source, /editor\.openField\(fieldIndex\)/);
    assert.match(source, /DEFAULT_CHARACTER_PORTRAIT_URL/);
    assert.match(source, /function statusBeautyPreviewRoot\(doc\)/);
    assert.match(source, /card\.style\.flex = '0 0 auto'/);
    assert.doesNotMatch(source, /naturalWidth = Math\.max\(card\.scrollWidth/);
    assert.match(source, /naturalWidth = Math\.max\(card\.offsetWidth/);
    assert.match(source, /const scale = Math\.min\(1, availableWidth \/ naturalWidth\)/);
    assert.match(source, /card\.style\.setProperty\('zoom', String\(scale\), 'important'\)/);
    assert.match(source, /card\.style\.setProperty\('transform', 'none', 'important'\)/);
    assert.match(source, /new MutationObserver\(\(\) => frame\.contentWindow\?\.requestAnimationFrame\(resize\)\)/);
    assert.match(source, /settings\(\)\.structure === 'profile'[\s\S]*?makePreviewRecords\(previewInput\)/);
    assert.match(styleSource, /data-preview-structure="profile"/);
    assert.match(styleSource, /\.status-atelier-beauty-preview-stack/);
    assert.match(source, /chatConversationSchemaVersion !== 3/);
    assert.match(source, /parseChatConversationLog\(valueFor\('chat_log'\)\)/);
    assert.match(settingsMarkup, /id="status-atelier-chat-appearance"[^>]*hidden open/);
    assert.match(settingsMarkup, /id="status-atelier-phone-sticker-photos"[^>]*hidden/);
    assert.match(settingsMarkup, /id="status-atelier-phone-sticker-photo-one-url"/);
    assert.match(settingsMarkup, /id="status-atelier-phone-sticker-photo-two-url"/);
    assert.match(source, /const openPhoneStickerPhotosEditor/);
    assert.match(source, /点击替换两张贴纸照片/);
    assert.match(source, /root\.append\(card\);\s*host\.replaceChildren\(root, directEditor\)/);
    assert.match(source, /const openForumFieldEditor/);
    assert.match(source, /bindForumFieldTarget\(threadTitle/);
    assert.match(source, /bindForumFieldTarget\(threadTags/);
    assert.match(source, /bindForumFieldTarget\(body, postDefinition\)/);
    assert.match(source, /host\.replaceChildren\(style, root, directEditor\)/);
    assert.match(source, /const openPhoneAvatarEditor/);
    assert.match(source, /bindPhoneAvatarDiy\(avatar, avatarImage, openPhoneAvatarEditor\)/);
    assert.match(source, /const openPhoneFieldEditor/);
    assert.match(source, /bindPhoneFieldTarget\(card, page\.id, personalFields\[index\]\)/);
    assert.match(source, /bindDirectMediaTarget\(avatarButton\)/);
    assert.match(source, /bindDirectPreviewTarget\(transcript, 'chat_log'/);
    assert.match(source, /bindDirectPreviewTarget\(contactName, 'chat_name'/);
    assert.match(source, /bindDirectPreviewTarget\(contactOnline, 'online'/);
    assert.match(source, /openPreviewFieldEditor\(fieldId, scope\)/);
    assert.match(source, /directEditorField\('音乐 URL', audioUrl\)/);
    assert.match(source, /bindDirectMediaTarget\(image\)/);
    assert.equal((settingsMarkup.match(/data-chat-appearance=/g) || []).length, 6);
    assert.match(settingsMarkup, /data-chat-appearance="kitty-pink"/);
    assert.match(settingsMarkup, /data-chat-appearance="meow-mono"/);
    assert.match(settingsMarkup, /data-chat-appearance="cloud-blue"/);
    assert.match(settingsMarkup, /data-chat-appearance="notepad-pink"/);
    assert.match(settingsMarkup, /data-chat-appearance="lace-ivory"/);
    assert.match(settingsMarkup, /data-chat-appearance="velvet-wine"/);
    assert.match(source, /retro-pink-pc/);
    assert.match(source, /if \(\['chat', 'social'\]\.includes\(structure\)\) section\.open = true/);
    assert.match(source, /structure !== 'chat' && settings\(\)\.media\?\.avatarSource !== 'url'/);
    assert.match(source, /chatAppearanceSection\.hidden = stored\.structure !== 'chat'/);
    assert.match(source, /closest\('#status-atelier-chat-appearances button\[data-chat-appearance\]'\)/);
    assert.doesNotMatch(source, /closest\('\[data-chat-appearance\]'\)/);
    assert.match(styleSource, /\.status-atelier-workbench \[hidden\] \{\s*display: none !important;/);
    assert.match(settingsMarkup, /id="status-atelier-phone-decoration-style"[\s\S]*?value="snow"[\s\S]*?value="sakura"[\s\S]*?value="petals"[\s\S]*?value="stars"/);
    assert.match(source, /'status-atelier-phone-decoration-style': 'decorationStyle'/);
    assert.match(settingsMarkup, /id="status-atelier-phone-icon-scale"[^>]*type="range"/);
    assert.match(source, /'status-atelier-phone-icon-scale': 'iconScale'/);
    assert.match(source, /ownerDocument\.addEventListener\('pointermove', move, \{ passive: false \}\)/);
    assert.match(source, /moveEvent\.pointerId !== event\.pointerId/);
    assert.match(settingsMarkup, /id="status-atelier-phone-shell-style"[\s\S]*?value="classic"[\s\S]*?value="handheld"[\s\S]*?value="handheld-pink"[\s\S]*?value="handheld-white"[\s\S]*?value="bandage-pop"[\s\S]*?value="mint-archive"[\s\S]*?value="blackberry"/);
    assert.match(settingsMarkup, /02 粉色心形掌机/);
    assert.match(settingsMarkup, /03 白色竖键掌机/);
    assert.match(settingsMarkup, /04 黑粉贴纸小手机/);
    assert.match(settingsMarkup, /05 薄荷格纹小手机/);
    assert.match(settingsMarkup, /06 黑莓键盘手机/);
    assert.doesNotMatch(settingsMarkup, /value="(?:clamshell|orbit|slider)"|横向掌机（新增款）/);
    assert.match(source, /'status-atelier-phone-shell-style': 'shellStyle'/);
    assert.match(source, /displayOnlyRegex: source\.displayOnlyRegex !== false/);
    assert.match(source, /applyStatusBeautyMediaSettings\(edited, rule\.media\),\s*markdownOnly: rule\.displayOnlyRegex/);
    assert.match(source, /编辑配置备份已下载/);
    assert.match(source, /delete exported\.openingNotes;[\s\S]*?delete exported\.openingProfiles;[\s\S]*?delete exported\.statusWorldbookBindings;/);
    assert.match(source, /delete exported\.openingSummary\.apiKey/);
    assert.match(source, /format: 'jiuyi-regex-status-profile', version: 2, settings: exported/);
    assert.match(source, /!\['jiuyi-regex-status-profile', 'zeya-regex-status-profile'\]\.includes\(data\?\.format\)/);
    assert.match(source, /openingNotes: notes,[\s\S]*?openingProfiles: profiles,[\s\S]*?statusWorldbookBindings,[\s\S]*?openingProfilesMigrated: true/);
    assert.match(source, /stored\.openingSummary\.apiKey = apiKey/);
    assert.match(settingsMarkup, /id="status-atelier-phone-shell-color"[^>]*type="color"/);
    assert.match(source, /'status-atelier-phone-shell-color': 'shellColor'/);
    assert.match(settingsMarkup, /id="status-atelier-phone-diy" class="status-atelier-setting-section status-atelier-collapsible">/);
    assert.match(settingsMarkup, /id="status-atelier-phone-appearance" class="status-atelier-setting-section status-atelier-collapsible" open>/);
    assert.match(source, /forumPreviewDraftForSkin/);
    assert.doesNotMatch(source, /status-atelier-forum-edit-toggle|forumPreviewEditMode/);
    assert.match(source, /dataForumPreviewEditable|forumPreviewEditable/);
    assert.match(source, /node\.contentEditable = 'true'/);
    assert.match(source, /node\.title = '点击即可修改'/);
    assert.match(source, /updateForumPageLabel/);
    assert.match(styleSource, /status-atelier-forum-preview \[data-forum-preview-editable="true"\]:focus/);
    assert.match(styleSource, /@media \(max-width: 720px\)[\s\S]*?status-atelier-forum-skins[\s\S]*?repeat\(2, minmax\(0, 1fr\)\)/);
    assert.match(settingsMarkup, /id="status-atelier-phone-wallpaper-file"[^>]*type="file"/);
    assert.match(settingsMarkup, /本地图片（仅预览）/);
    assert.match(settingsMarkup, /在右侧壁纸上拖动；滚轮或双指缩放/);
    assert.match(settingsMarkup, /id="status-atelier-phone-auto-align"[\s\S]*?自动对齐/);
    assert.match(settingsMarkup, /id="status-atelier-phone-reset-layout"[\s\S]*?重置布局/);
    assert.match(settingsMarkup, /地点、时间、天气可以分别拖动/);
    assert.match(source, /function arrangePhoneDesktopLayout\(resetBasePosition = false\)/);
    assert.match(source, /bindPhoneWidgetItemDrag\(phoneSharedHost\)/);
    assert.match(settingsMarkup, /id="status-atelier-regex-display-only"[^>]*type="checkbox"/);
    assert.match(settingsMarkup, /美化只显示，不发送给 AI/);
    assert.equal((settingsMarkup.match(/id="status-atelier-regex-display-only"/g) || []).length, 1);
    assert.ok(settingsMarkup.indexOf('status-atelier-regex-display-only') < settingsMarkup.indexOf('status-atelier-status-editor-title'));
    assert.match(source, /scheduleStatusPreviewUpdate\(\);[\s\S]*?heading\(`正在编辑：\$\{definition\.label\}`\)/);
    const resizeBlock = source.match(/function resizeStatusBeautyPreviewFrame\(frame\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(resizeBlock, /availableWidth \/ naturalWidth/);
    assert.match(resizeBlock, /syncAdaptiveText\(card\)/);
    assert.match(resizeBlock, /textLength > 48 \? 0\.56/);
    assert.match(resizeBlock, /overflowsContainer\(node\)/);
    assert.match(resizeBlock, /target \* 0\.92/);
    assert.doesNotMatch(resizeBlock, /maxBoost|state\.fontSize \* scale < 8/);
    assert.match(resizeBlock, /card\.scrollHeight/);
    assert.match(resizeBlock, /getPropertyPriority\('font-size'\)/);
    assert.doesNotMatch(resizeBlock, /minimumTouchScale|Math\.max\(220/);
    assert.match(resizeBlock, /frame\.style\.height = `\$\{Math\.ceil\(contentHeight\)\}px`/);
    const previewBindingBlock = source.match(/function bindStatusBeautyPreviewEditing\(frame, rule[\s\S]*?interactionStyle\.textContent = '([^']+)'/)?.[1] || '';
    assert.match(previewBindingBlock, /background:transparent!important/);
    assert.match(previewBindingBlock, /padding:0!important/);
    assert.doesNotMatch(previewBindingBlock, /padding:10px/);
    const previewFrameStyle = styleSource.match(/\.status-atelier-beauty-preview-frame \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.doesNotMatch(previewFrameStyle, /min-height/);
    const previewWrapStyle = styleSource.match(/\.status-atelier-modal-status-preview-wrap \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(previewWrapStyle, /background:\s*transparent/);
    assert.match(previewWrapStyle, /border:\s*0/);
    const modeButtonStyle = styleSource.match(/\.status-atelier-entry-mode-switch \.menu_button \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(modeButtonStyle, /font-size:\s*13px/);
    assert.match(modeButtonStyle, /font-weight:\s*400/);
    const secondaryActionStyle = styleSource.match(/\.status-atelier-ai-result-actions \.menu_button \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(secondaryActionStyle, /font-size:\s*13px/);
    assert.match(secondaryActionStyle, /font-weight:\s*400/);
    assert.match(styleSource, /status-atelier-preview-shell\[data-preview-structure="profile"\][\s\S]*?order: 1/);
    assert.match(settingsMarkup, /APP 页面数据/);
    for (const removedHeadingHelp of [
        '款式、外壳颜色、挂饰与桌面动效。',
        '壁纸、桌面排版、个人页头像和 APP。',
        '四个页面都写入同一条世界书规则。',
        '六套独立主题；聊天结构、左右头像和长对话都保留。',
    ]) assert.doesNotMatch(settingsMarkup, new RegExp(removedHeadingHelp));
    assert.doesNotMatch(source, /status-atelier-template-media-help|status-atelier-status-editor-help/);
    assert.match(settingsMarkup, /双击字段名修改 · 拖动字段排序/);
    for (const removedId of ['status-atelier-title', 'status-atelier-subtitle', 'status-atelier-layout', 'status-atelier-theme']) {
        assert.doesNotMatch(settingsMarkup, new RegExp(`id="${removedId}"`));
    }
    assert.ok(settingsMarkup.indexOf('让 AI 按这个角色直接做好') < settingsMarkup.indexOf('高级自定义'));
    assert.ok(settingsMarkup.indexOf('高级自定义') < settingsMarkup.indexOf('外观与配色'));
    assert.match(settingsMarkup, /<section[^>]*class="status-atelier-setting-section status-atelier-advanced status-atelier-download-actions"[^>]*>[\s\S]*?<h4>手动下载与全局安装<\/h4>/);
    assert.match(source, /bindPreviewFieldLabelEditor/);
    assert.match(source, /bindPreviewTitleEditor/);
    assert.match(source, /bindPreviewFieldReorder/);
    assert.match(source, /moveFieldDefinition/);
    assert.match(source, /avatar:\s*'头像'/);
    assert.match(source, /status-atelier-preview-field-avatar zrs-field-avatar/);
    assert.match(source, /status-atelier-avatar-edit-button', '修改头像'/);
    assert.match(styleSource, /status-atelier-avatar-edit-button[\s\S]*?writing-mode: horizontal-tb;[\s\S]*?white-space: nowrap;/);
    for (const removedSlider of ['wallpaper-x', 'wallpaper-y', 'widget-x', 'widget-y', 'avatar-x', 'avatar-y']) {
        assert.doesNotMatch(settingsMarkup, new RegExp(`id="status-atelier-phone-${removedSlider}"`));
    }
    assert.match(settingsMarkup, /在右侧头像上拖动和缩放/);
    assert.match(settingsMarkup, /每枚图标都能单独拖动/);
    assert.doesNotMatch(settingsMarkup, /data-phone-widget-nudge|data-phone-avatar-adjust|data-phone-widget-(?:up|down)/);
    assert.match(source, /function bindPhonePersonalFieldLabelEditor/);
    assert.match(source, /phoneDesktop\.personalFields/);
    assert.match(source, /editLegend\.hidden = phoneMode/);
    assert.match(source, /function bindPhoneAvatarDiy/);
    assert.match(source, /pointers\.size >= 2/);
    assert.match(source, /addEventListener\('wheel'/);
    assert.match(source, /phoneDesktopSchemaVersion !== 7/);
    assert.match(source, /function previewLocalPhoneWallpaper/);
    assert.match(source, /status-atelier-phone-wallpaper-picker/);
    assert.match(source, /wallpaperFilePicker\.showPicker/);
    assert.doesNotMatch(source, /openPhoneWallpaperEditor/);
    assert.match(source, /\/characters\//);
    assert.match(source, /\/User%20Avatars\//);
    assert.match(source, /personalAvatarFallbackUrl/);
    assert.match(source, /PHONE_PAGE_SCHEMAS\.forEach/);
    assert.match(source, /function renderPhoneSchemaEditor/);
    assert.match(source, /appName\.placeholder = 'APP 与页面名称'/);
    assert.match(source, /renderPhoneSchemaEditor\(host, \{ modal: true \}\)/);
    assert.match(source, /definition\.label = label\.value\.slice\(0, 30\)/);
    assert.match(source, /wallpaperScale/);
});

test('status template selection also works in change-only webviews', () => {
    const changeHandler = source.match(/settingsRoot\.addEventListener\('change', event => \{([\s\S]*?)\n    \}\);/)?.[1] || '';
    assert.match(changeHandler, /readSettingsControl\(event\.target\)/);
    assert.match(changeHandler, /readStatusMediaControl\(event\.target\)/);
    assert.match(changeHandler, /readPhoneDesktopControl\(event\.target\)/);
    assert.doesNotMatch(changeHandler, /if \(!isStatusControl\)/);
});

test('dynamic numbers keep one solid progress treatment without object controls', () => {
    assert.match(source, /meter\.append\(fill\)/);
    assert.doesNotMatch(source, /fillMode|data-fill-mode|zrs-meter-trail|zrs-meter-marker/);
    assert.doesNotMatch(settingsMarkup, /小物填充|动态数值小物/);
});

test('status prompt only runs where the generated status regex is installed', () => {
    const gate = source.match(/function statusRegexAppliesToCurrentContext\(\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(gate, /getScriptsByType\(SCRIPT_TYPES\.SCOPED, \{ allowedOnly: true \}\)/);
    assert.match(gate, /getScriptsByType\(SCRIPT_TYPES\.GLOBAL\)/);
    const prompt = source.match(/function updatePrompt\(\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(prompt, /stored\.promptEnabled && statusRegexAppliesToCurrentContext\(\)/);
});

test('one-click scoped status reuses or creates and binds a character worldbook before replacing the regex', () => {
    assert.match(source, /async function installStatusWorldbookRule\(\)/);
    const scopedWorldbook = source.match(/async function installStatusWorldbookRule\(\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(scopedWorldbook, /currentLinkedWorldbooks\(ctx\)/);
    assert.match(scopedWorldbook, /buildStatusWorldbookName\(character, storageKey\)/);
    assert.match(scopedWorldbook, /createNewWorldInfo\(bookName, \{ interactive: false \}\)/);
    assert.match(scopedWorldbook, /charUpdateAddAuxWorld\(character\.avatar, bookName\)/);
    assert.match(source, /saveWorldInfo\(bookName, result\.data, true\)/);
    assert.match(scopedWorldbook, /世界书已准备好，但没有绑定到当前角色/);
    assert.match(source, /世界书没有确认状态栏输出规则已保存/);
    const scopedInstall = source.match(/async function installRegex\(scope\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(scopedInstall, /installStatusWorldbookRule\(\)/);
    assert.match(scopedInstall, /installGeneratedRegex/);
    assert.ok(scopedInstall.indexOf('installStatusWorldbookRule()') < scopedInstall.indexOf('installGeneratedRegex'));
    const regexInstall = source.match(/async function installGeneratedRegex\(script, requestedScope = settings\(\)\.installScope\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(regexInstall, /fetch\('\/api\/characters\/merge-attributes'/);
    assert.match(regexInstall, /fetch\('\/api\/characters\/get'/);
    assert.match(regexInstall, /const installedScript = \{ \.\.\.script, id: targetId, disabled: false \}/);
    assert.match(regexInstall, /scripts\.push\(installedScript\)/);
    assert.match(regexInstall, /接口返回成功，但重新读取角色卡后没有找到本次安装结果/);
    assert.match(regexInstall, /if \(!response\.ok\)/);
    assert.match(regexInstall, /局部正则未保存到角色卡/);
    assert.match(regexInstall, /isScopedScriptsAllowed\(selection\.character\)/);
    assert.match(regexInstall, /confirmedScripts\.some/);
    assert.match(scopedInstall, /世界书“\$\{worldbook\.bookName\}”已写入，但/);
    assert.doesNotMatch(regexInstall, /notify\('success'/);
    assert.doesNotMatch(source, /statusRecipe\(\)/);
});

test('personal feed clearly separates DIY media from story data and previews a two-sided paper dossier', () => {
    assert.match(settingsMarkup, /id="status-atelier-social-data-guide"/);
    assert.match(settingsMarkup, /图片设置/);
    assert.match(settingsMarkup, /动态内容/);
    assert.doesNotMatch(settingsMarkup, /你来 DIY|AI 随剧情更新|成品只显示自然资料/);
    assert.match(source, /socialGuide\.hidden = structure !== 'social'/);
    assert.match(source, /function renderSocialPage|const renderSocialPage/);
    assert.match(source, /zrs-social-photo/);
    assert.match(source, /zrs-social-theme-art/);
    assert.match(source, /blue-fabric-scrapbook-v1-compact\.jpg/);
    assert.match(source, /new URL\('\.\/assets\/personal-feed\/blue-fabric-scrapbook-v1-compact\.jpg', import\.meta\.url\)\.href/);
    assert.match(source, /new URL\('\.\/assets\/personal-feed\/editorial-clipping-dossier-v1\.jpg', import\.meta\.url\)\.href/);
    assert.match(source, /resolvedStatusExportInput/);
    assert.match(settingsMarkup, /id="status-atelier-theme-asset-url"/);
    assert.match(settingsMarkup, /留空时预览当前外观的内置插画/);
    assert.match(source, /output\.themeAssetUrl = String\(source\.media\?\.themeAssetUrl \|\| ''\)\.trim\(\)/);
    assert.doesNotMatch(source, /blobAsDataUrl|socialThemeArtDataUrlPromise/);
    assert.match(source, /physical_state/);
    assert.match(source, /current_thought/);
    assert.match(source, /zrs-social-intro-copy/);
    assert.match(source, /zrs-social-scraps/);
    assert.match(source, /openPreviewFieldEditor/);
    assert.match(source, /openPreviewMediaEditor/);
    assert.match(source, /status-atelier-preview-direct-editor/);
    assert.match(source, /bindDirectPreviewTarget\(introCopy, 'introduction'/);
    assert.match(source, /bindDirectMediaTarget\(portrait\)/);
    assert.match(source, /if \(avatarUrl\.value\.trim\(\)\) avatarSource\.value = 'url'/);
    assert.match(source, /AI 填写内容/);
    assert.match(styleSource, /\.status-atelier-preview-direct-target:is\(:hover, :focus-visible\)/);
    assert.match(source, /scraps\.setAttribute\('aria-hidden', 'true'\)/);
    assert.match(source, /profileButton\.setAttribute\('aria-selected'/);
    assert.match(source, /introButton\.setAttribute\('aria-selected'/);
    assert.doesNotMatch(source, /likeButton\.setAttribute\('aria-pressed'/);
    assert.doesNotMatch(source, /commentButton\.setAttribute\('aria-expanded'/);
    assert.match(styleSource, /status-atelier-social-data-guide/);
    assert.doesNotMatch(source, /renderArchiveDossierPage|zrs-storyboard/);
});

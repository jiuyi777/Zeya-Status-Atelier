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
    for (const id of ['status-atelier-structure', 'status-atelier-status-styles', 'status-atelier-status-palettes', 'status-atelier-avatar-source', 'status-atelier-avatar-url', 'status-atelier-image-url', 'status-atelier-audio-url', 'status-atelier-test-ai']) {
        assert.match(settingsMarkup, new RegExp(`id="${id}"`));
    }
    assert.match(settingsMarkup, /20 套外观/);
    assert.match(settingsMarkup, /24 套色卡/);
    assert.match(source, /thumbnail\('avatar', avatar\)/);
    assert.match(source, /thumbnail\('persona', user_avatar\)/);
    assert.match(source, /parseStatusOutput\(input, response\)/);
});

test('status appearance controls update in place and preserve readable selected text', () => {
    assert.match(source, /styleHost\.children\.length !== STATUS_STYLE_PRESETS\.length/);
    assert.match(source, /paletteHost\.children\.length !== STATUS_PALETTE_PRESETS\.length/);
    const paletteClick = source.match(/const statusPaletteButton = event\.target\.closest\('\[data-status-palette\]'\);([\s\S]*?)const statusStyleButton/)?.[1] || '';
    assert.doesNotMatch(paletteClick, /renderStatusDesignControls\(\)/);
    assert.match(paletteClick, /refreshStatusPalettePreview\(\)/);
    const styleClick = source.match(/const statusStyleButton = event\.target\.closest\('\[data-status-style\]'\);([\s\S]*?)field\('status-atelier-test-ai'\)/)?.[1] || '';
    assert.match(styleClick, /refreshStatusAppearancePreview\(\)/);
    assert.doesNotMatch(styleClick, /updatePreview\(\)/);
    assert.match(source, /style\.textContent = `\$\{STATUS_THEME_CSS\}\\n\$\{STATUS_PHONE_CSS\}`/);
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
});

test('wand exposes separate opening and status actions and quick theme choices are collapsible favorites first', () => {
    assert.match(source, /制作开场白 · 九一/);
    assert.match(source, /制作状态栏 · 九一/);
    assert.match(source, /status-atelier-greeting-theme-favorites/);
    assert.match(source, /展开未收藏主页外观/);
    assert.match(source, /function openGreetingModal\(target = 'opening'\)/);
    assert.match(source, /target === 'status'/);
    assert.match(styleSource, /#status-atelier-modal\[data-workspace="status"\] \.status-atelier-opening-only/);
    assert.doesNotMatch(source, /data-greeting-workspace=/);
    const openBlock = source.match(/function openGreetingModal\(target = 'opening'\) \{([\s\S]*?)\n\}/)?.[1] || '';
    const statusFastPath = openBlock.match(/if \(target === 'status'\) \{([\s\S]*?)\n    \}/)?.[1] || '';
    assert.match(statusFastPath, /setGreetingModalWorkspace\('status'\)/);
    assert.match(statusFastPath, /return;/);
    assert.doesNotMatch(statusFastPath, /ensureLocalGreetingDrafts|renderGreetingList|renderGreetingThemeChooser|updateOpeningHomePreview/);
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
    assert.match(source, /PHONE_STRUCTURE_IDS = Object\.freeze\(\['phone', 'profile', 'social', 'forum', 'chat', 'music', 'casefile', 'quest'\]\)/);
    assert.match(settingsMarkup, /24 套色卡（可折叠）/);
    assert.match(settingsMarkup, /20 套外观（可折叠）/);
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

test('status workspace exposes a short one-click path and hides customization by default', () => {
    assert.match(settingsMarkup, /id="status-atelier-install-scoped"[^>]*>生成并应用</);
    assert.doesNotMatch(settingsMarkup, /status-atelier-shuffle-recipe|完整 40 套|20 套自由面板/);
    assert.doesNotMatch(source, /status-atelier-modal-shuffle-recipe|applyStatusRecipe|shuffleStatusRecipe/);
    assert.doesNotMatch(settingsMarkup, /id="status-atelier-fill-mode"/);
    assert.doesNotMatch(source, /id="status-atelier-modal-status-fill-mode"/);
    assert.match(source, /class="status-atelier-modal-status-advanced">/);
    assert.match(settingsMarkup, /<details class="status-atelier-setting-section status-atelier-collapsible">[\s\S]*?APP 页面数据/);
    assert.match(settingsMarkup, /<details class="status-atelier-setting-section status-atelier-collapsible">[\s\S]*?更多外观与配色/);
    assert.match(settingsMarkup, /id="status-atelier-template-media"[\s\S]*?当前模板素材/);
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
    assert.match(settingsMarkup, /外观改字体、边框、材质、圆角和组件造型/);
    assert.match(settingsMarkup, /色卡只改颜色/);
    assert.match(settingsMarkup, /id="status-atelier-appearance-section"[^>]*>[\s\S]*?<h4>更多外观与配色<\/h4>/);
    assert.match(source, /appearanceSection\.hidden = stored\.structure === 'phone'/);
    assert.match(styleSource, /\.status-atelier-workbench \[hidden\] \{\s*display: none !important;/);
    assert.match(settingsMarkup, /id="status-atelier-phone-decoration-style"[\s\S]*?value="snow"[\s\S]*?value="sakura"[\s\S]*?value="petals"[\s\S]*?value="stars"/);
    assert.match(source, /'status-atelier-phone-decoration-style': 'decorationStyle'/);
    assert.match(settingsMarkup, /id="status-atelier-phone-icon-scale"[^>]*type="range"/);
    assert.match(source, /'status-atelier-phone-icon-scale': 'iconScale'/);
    assert.match(source, /ownerDocument\.addEventListener\('pointermove', move, \{ passive: false \}\)/);
    assert.match(source, /moveEvent\.pointerId !== event\.pointerId/);
    assert.match(settingsMarkup, /id="status-atelier-phone-shell-style"[\s\S]*?value="classic"[\s\S]*?value="handheld"[\s\S]*?value="handheld-pink"[\s\S]*?value="handheld-white"[\s\S]*?value="bandage-pop"[\s\S]*?value="mint-archive"/);
    assert.match(settingsMarkup, /02 粉色心形掌机/);
    assert.match(settingsMarkup, /03 白色竖键掌机/);
    assert.match(settingsMarkup, /04 黑粉贴纸小手机/);
    assert.match(settingsMarkup, /05 薄荷格纹小手机/);
    assert.doesNotMatch(settingsMarkup, /value="(?:clamshell|orbit|slider)"|横向掌机（新增款）/);
    assert.match(source, /'status-atelier-phone-shell-style': 'shellStyle'/);
    assert.match(source, /displayOnlyRegex: source\.displayOnlyRegex !== false/);
    assert.match(settingsMarkup, /id="status-atelier-phone-shell-color"[^>]*type="color"/);
    assert.match(source, /'status-atelier-phone-shell-color': 'shellColor'/);
    assert.match(settingsMarkup, /id="status-atelier-phone-diy" class="status-atelier-setting-section status-atelier-collapsible">/);
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
    assert.match(settingsMarkup, /APP 页面数据/);
    assert.match(settingsMarkup, /四个页面都写入同一条世界书规则/);
    assert.match(settingsMarkup, /双击字段名修改 · 拖动字段排序/);
    for (const removedId of ['status-atelier-title', 'status-atelier-subtitle', 'status-atelier-layout', 'status-atelier-theme']) {
        assert.doesNotMatch(settingsMarkup, new RegExp(`id="${removedId}"`));
    }
    assert.ok(settingsMarkup.indexOf('更多外观与配色') < settingsMarkup.indexOf('启用状态栏'));
    assert.match(settingsMarkup, /<details class="status-atelier-setting-section status-atelier-advanced" open>[\s\S]*?<summary>手动下载与全局安装<\/summary>/);
    assert.match(source, /bindPreviewFieldLabelEditor/);
    assert.match(source, /bindPreviewTitleEditor/);
    assert.match(source, /bindPreviewFieldReorder/);
    assert.match(source, /moveFieldDefinition/);
    assert.match(source, /avatar:\s*'头像'/);
    assert.match(source, /status-atelier-preview-field-avatar zrs-field-avatar/);
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
    assert.match(source, /PHONE_PAGE_SCHEMAS\.forEach/);
    assert.match(source, /wallpaperScale/);
});

test('dynamic numbers keep one solid progress treatment without object controls', () => {
    assert.match(source, /meter\.append\(fill\)/);
    assert.doesNotMatch(source, /fillMode|data-fill-mode|zrs-meter-trail|zrs-meter-marker/);
    assert.doesNotMatch(settingsMarkup, /小物填充|动态数值小物/);
});

test('status prompt only runs where the generated status regex is installed', () => {
    const gate = source.match(/function statusRegexAppliesToCurrentContext\(\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(gate, /getScriptsByType\(SCRIPT_TYPES\.SCOPED\)/);
    assert.match(gate, /getScriptsByType\(SCRIPT_TYPES\.GLOBAL\)/);
    const prompt = source.match(/function updatePrompt\(\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(prompt, /stored\.promptEnabled && statusRegexAppliesToCurrentContext\(\)/);
});

test('one-click scoped status installs and verifies a character-bound worldbook rule before the regex', () => {
    assert.match(source, /async function installStatusWorldbookRule\(\)/);
    assert.match(source, /createNewWorldInfo\(bookName, \{ interactive: false \}\)/);
    assert.match(source, /saveWorldInfo\(bookName, result\.data, true\)/);
    assert.match(source, /charUpdateAddAuxWorld\(character\.avatar, bookName\)/);
    assert.match(source, /世界书输出规则已保存，但没有绑定到当前角色/);
    assert.match(source, /世界书没有确认状态栏输出规则已保存/);
    const scopedInstall = source.match(/async function installRegex\(scope\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(scopedInstall, /installStatusWorldbookRule\(\)/);
    assert.match(scopedInstall, /installGeneratedRegex/);
    assert.ok(scopedInstall.indexOf('installStatusWorldbookRule()') < scopedInstall.indexOf('installGeneratedRegex'));
});

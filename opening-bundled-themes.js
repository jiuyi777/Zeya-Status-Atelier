import { buildStarPage } from './opening-star-atlas.js?v=0.11.41';
import { buildLilyPage } from './opening-lily-moon.js?v=0.11.41';
import { buildNoirPage } from './opening-sakura-noir.js?v=0.11.41';
import { buildOrbitPage } from './opening-lunar-orbit.js?v=0.11.41';
import { buildFloralPage } from './opening-floral-letter.js?v=0.11.41';
import { buildBloomPage } from './opening-bloom-letter.js?v=0.11.41';
import { KEEPSAKE_THEMES, buildKeepsakePage } from './opening-keepsake.js?v=0.11.41';
import { KINETIC_THEMES, buildKineticPage } from './opening-kinetic.js?v=0.11.41';

const builders = { ...Object.fromEntries(KINETIC_THEMES.map(theme => [theme.id, buildKineticPage])), ...Object.fromEntries(KEEPSAKE_THEMES.map(theme => [theme.id, buildKeepsakePage])), 'bloom-letter': buildBloomPage, 'star-atlas': buildStarPage, 'lily-moon': buildLilyPage, 'sakura-noir': buildNoirPage, 'lunar-orbit': buildOrbitPage, 'floral-letter': buildFloralPage };
export const BUNDLED_HOME_TEMPLATES = [
    ...KINETIC_THEMES.map(t => [t.id, t.name, t.description, t.accent, t.ink, t.fontStyle]),
    ...KEEPSAKE_THEMES.map(t => [t.id, t.name, t.description, t.accent, t.ink, t.fontStyle]),
    ['bloom-letter', '见花如晤', '浅色信封 · 展信阅读', '#d38a53', '#028e96'],
    ['star-atlas', '星芒云笺', '藏蓝金色 · 星芒云笺', '#e9a343', '#123a59'],
    ['lily-moon', '月下百合', '月光百合 · 书签目录', '#c5a759', '#425e79'],
    ['sakura-noir', '樱色夜刊', '黑粉海报 · 开场票', '#ef91a4', '#f8dfe5'],
    ['lunar-orbit', '循月而行', '月相轨道 · 清蓝目录', '#94bad1', '#304760'],
    ['floral-letter', '花间来信', '白金花卉 · 紧凑信笺', '#bca56b', '#57515e'],
].map(([id, name, description, accent, text, font], index) => ({ id, name: `${index + 14} ${name}`, description, values: { theme: id, font: font || (['floral-letter', 'bloom-letter'].includes(id) ? 'kai' : 'serif'), accent, text } }));
export const isBundledHomeTheme = theme => Object.hasOwn(builders, theme);

// Reuse the production navigation/worldbook runtime, with the approved sample layout.
export function buildBundledHomeDocument(data, navigationScript) {
    const notes = [data.intro, data.model && `推荐模型：${data.model}`, data.preset && `推荐预设：${data.preset}`,
        ...data.worldlines.filter(line => line.description).map(line => `${line.name}\n${line.description}`)].filter(Boolean).join('\n\n');
    let html = builders[data.theme]({ ...data, intro: data.theme === 'bloom-letter' ? data.intro : notes, ink: data.text, fontStyle: data.font,
        entries: data.entries.map((entry, index) => ({ ...entry, id: `opening-${index + 1}` })) });
    html = html.replace(/<script>[\s\S]*?<\/script>/g, '')
        .replace(/<article class="/g, '<article class="zoh-entry ')
        .replace(/<button data-target="([^"]*)"([^>]*)>/g, (_match, target, attributes) => {
            const attrs = /\bclass="/.test(attributes)
                ? attributes.replace(/\bclass="/, 'class="zoh-jump ')
                : ` class="zoh-jump"${attributes}`;
            return `<button data-target="${target}"${attrs}>`;
        });
    // All runtime selectors are scoped; do not include the old layout or its CSS.
    const runtime = navigationScript.replace("script.previousElementSibling.previousElementSibling", "document.querySelector('.zoh-root')");
    const fonts = { serif: 'SimSun,STSong,serif', kai: 'KaiTi,STKaiti,serif', sans: '"Microsoft YaHei",sans-serif', mono: 'monospace', fangsong: 'FangSong,STFangsong,serif', rounded: 'YouYuan,"Yuanti SC",sans-serif', clerical: 'LiSu,STLiti,serif' };
    const style = `<style>:root{--body:${fonts[data.font]};--serif:${fonts[data.font]};--display:${fonts[data.font]}}.zoh-notice{font:12px/1.6 sans-serif;text-align:center}.zoh-notice:empty,.zoh-switch-toast:empty{display:none}.zoh-current{font-size:11px}.image-empty{display:none}.ticket-image:has(.image-empty){display:none}</style>`;
    return html.replace('<body>', '<body><div class="zoh-root"><div class="zoh-list">')
        .replace('</body>', `</div><p class="zoh-notice" role="status"></p><div class="zoh-switch-toast" role="status"></div></div>${style}<script>${runtime}</script></body>`);
}

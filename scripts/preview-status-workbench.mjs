// Runs the actual extension UI with a local host adapter, without a live Tavern or model.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const prefix = '/scripts/extensions/third-party/status-atelier/';
const port = Number(process.argv[2] || 4221);
const contextModule = `
const extensionSettings = JSON.parse(localStorage.getItem('status-atelier-ui-check') || '{}');
const save = () => localStorage.setItem('status-atelier-ui-check', JSON.stringify(extensionSettings));
export const context = { extensionSettings, characters: [], chat: [], groups: [],
  saveSettingsDebounced: save, saveSettings: save, eventTypes: {}, eventSource: { on() {}, off() {} },
  getRequestHeaders: () => ({ 'Content-Type': 'application/json' }), setExtensionPrompt() {} };
export const getContext = () => context;
export { save };
`;
const stubs = new Map([
  ['/scripts/extensions.js', contextModule],
  ['/script.js', `import { save } from '/scripts/extensions.js';
    export const saveSettings = save, user_avatar = '';
    export const getThumbnailUrl = () => '';
    export const createOrEditCharacter = () => { throw Error('本地 UI 验证不写入角色卡'); };`],
  ['/scripts/utils.js', `export const getCharaFilename = () => '';`],
  ['/scripts/world-info.js', `export const selected_world_info = [], world_names = [], world_info = {};
    const unavailable = () => { throw Error('本地 UI 验证不读写世界书'); };
    export { unavailable as charUpdateAddAuxWorld, unavailable as createNewWorldInfo,
      unavailable as loadWorldInfo, unavailable as saveWorldInfo };`],
  ['/scripts/extensions/regex/engine.js', `export const SCRIPT_TYPES = { GLOBAL: 0, SCOPED: 1 };
    export const getScriptsByType = () => [], isScopedScriptsAllowed = () => true;
    const unavailable = () => { throw Error('本地 UI 验证不安装正则'); };
    export { unavailable as allowScopedScripts, unavailable as saveScriptsByType };`],
]);
const html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>状态栏制作界面验证</title>
<link rel="stylesheet" href="${prefix}style.css">
<style>:root{--SmartThemeBodyColor:#242722;--SmartThemeBorderColor:#b4b6aa;--SmartThemeBlurTintColor:#e7e7df}
*{box-sizing:border-box;scrollbar-width:none}*::-webkit-scrollbar{display:none}
body{margin:0;background:#e7e7df;color:#242722;font:16px/1.5 system-ui}
button,input,textarea,select{font:inherit}button,[role=button],summary{cursor:pointer}
.text_pole{max-width:100%;padding:8px;border:1px solid #ccc;background:#fff;color:#242722}
.menu_button{border:1px solid #b6b9af;border-radius:6px;background:#f5f5ef;padding:7px 12px;color:#242722}
[hidden]{display:none!important}#extensionsMenu{display:flex;gap:18px;padding:16px}
#extensions_settings{max-width:1000px;margin:auto}.preview-note{padding:0 16px;font-size:13px}</style>
<p class="preview-note">本地制作界面检查 · 使用正式插件代码，角色、世界书与模型服务均未连接。</p>
<nav id="extensionsMenu"></nav><div id="extensions_settings"></div>
<details><summary>本地导出检查</summary><pre id="workbench-export"></pre></details>
<script>document.addEventListener('click', event => {
  const link = event.target.closest('a[download]');
  if (!link || !link.href.startsWith('blob:')) return;
  event.preventDefault();
  fetch(link.href).then(response => response.text()).then(text => {
    const output = document.getElementById('workbench-export');
    output.dataset.filename = link.download; output.textContent = text;
  });
}, true);</script>
<script type="module" src="${prefix}index.js"></script></html>`;
const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.html': 'text/html', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    response.setHeader('Cache-Control', 'no-store');
    if (path === '/') { response.setHeader('Content-Type', 'text/html; charset=utf-8'); response.end(html); return; }
    if (stubs.has(path)) { response.setHeader('Content-Type', 'text/javascript; charset=utf-8'); response.end(stubs.get(path)); return; }
    if (!path.startsWith(prefix)) { response.writeHead(404); response.end(); return; }
    const relative = path.slice(prefix.length);
    const file = resolve(root, relative);
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep) || relative.split('/').some(part => part.startsWith('.'))) {
      response.writeHead(403); response.end(); return;
    }
    response.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
    response.end(await readFile(file));
  } catch { response.writeHead(404); response.end(); }
}).listen(port, '127.0.0.1', () => console.log(`Workbench UI: http://127.0.0.1:${port}/`));

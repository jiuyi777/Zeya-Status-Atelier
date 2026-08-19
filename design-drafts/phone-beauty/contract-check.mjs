import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('./', import.meta.url);
const [html, css, js] = await Promise.all([
  readFile(new URL('index.html', root), 'utf8'),
  readFile(new URL('prototype.css', root), 'utf8'),
  readFile(new URL('prototype.js', root), 'utf8'),
]);

for (const id of ['Personal', 'Memo', 'Wechat', 'Shop']) assert.match(js, new RegExp(`id: '${id}'`));
for (const id of ['current_location', 'current_time', 'current_weather', 'favor', 'desire', 'cloth', 'thought']) assert.match(js, new RegExp(id));
for (const shell of ['clamshell', 'orbit', 'slider']) {
  assert.match(html, new RegExp(shell));
  assert.match(css, new RegExp(`shell-${shell}`));
}
for (const control of ['wallpaper-url', 'avatar-url', 'shell-color', 'wallpaper-x', 'wallpaper-y', 'avatar-scale', 'motion-toggle']) assert.match(html, new RegExp(`id="${control}"`));
assert.match(css, /min-height:\s*44px/);
assert.match(css, /prefers-reduced-motion:\s*reduce/);
assert.match(css, /env\(safe-area-inset-top\)/);
assert.doesNotMatch(html + css + js, /TavernHelper|SillyTavern|getContext\(|updateWorldbookWith/);

console.log('PHONE_BEAUTY_CONTRACT_OK');

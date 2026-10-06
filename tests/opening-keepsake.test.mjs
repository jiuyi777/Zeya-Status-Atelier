import test from 'node:test';
import assert from 'node:assert/strict';
import { Script } from 'node:vm';
import { KEEPSAKE_THEMES, keepsakeDefaults, normalizeKeepsake, buildKeepsakeGreetingFields, keepsakeInteraction, KEEPSAKE_BOTANICAL_ART } from '../opening-keepsake.js';
import { buildOpeningHomeRegexPack } from '../opening-home-generator.js';
import { createOpeningTemplate, applyOpeningTemplate } from '../opening-template-package.js';
import { switchStarPage } from '../opening-star-atlas.js';

for (const theme of KEEPSAKE_THEMES) test(`${theme.name}: exported documents preserve content, external media, return routes and workshop bindings`, async () => {
  const data = { ...keepsakeDefaults(theme.id), title: '用户的标题', intro: '前文\n![配图](https://images.example/small.webp)\n后文', entries: [{ id: 'second', title: '实际开场', summary: '摘要', body: '保留这段正文 <script>unsafe()</script>' }] };
  const fields = JSON.parse(JSON.stringify(buildKeepsakeGreetingFields(data)));
  const pages = [fields.first_mes, ...fields.alternate_greetings];
  for (const page of pages) {
    assert.match(page, /^```html\n<!DOCTYPE html>/);
    assert.match(page, /<body>[\s\S]*<\/body><\/html>\n```$/);
    assert.doesNotMatch(page, /(?:src="(?:file:|data:|blob:|http:)|unsafe\(\)<\/script>)/);
    for (const script of page.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) new Script(script[1]);
  }
  assert.match(fields.first_mes, /前文[\s\S]*<figure class="inline-picture">[\s\S]*后文/);
  assert.match(fields.alternate_greetings[0], /保留这段正文 &lt;script&gt;unsafe\(\)&lt;\/script&gt;/);
  assert.equal((fields.alternate_greetings[0].match(new RegExp(`data-target="${theme.id}-home"`, 'g')) || []).length, 1);
  const calls = [];
  await switchStarPage(`${theme.id}-home`, async () => [{ swipes: [fields.alternate_greetings[0], fields.first_mes] }], async rows => calls.push(rows));
  assert.deepEqual(calls, [[{ message_id: 0, swipe_id: 1 }]]);
  const home = { ...data, font: theme.fontStyle, text: theme.ink, worldlines: [{ id: 'line', name: '真实线路', entries: [{ book: '原世界书', uid: 31 }] }], entries: [{ title: '原开场', target: 4, worldlineId: 'line' }] };
  const rules = buildOpeningHomeRegexPack(home);
  assert.equal(rules.length, 2);
  assert.equal(rules[1].id, 'jiuyi-opening-return-portable-v1');
  assert.match(rules[0].replaceString, /<script data-keepsake-interaction>/);
  assert.match(rules[0].replaceString, /class="zoh-jump"/);
  const restored = applyOpeningTemplate(home, createOpeningTemplate({ ...home, theme: theme.id }));
  assert.deepEqual(restored.entries, home.entries);
  assert.deepEqual(restored.worldlines, home.worldlines);
  assert.equal(restored.theme, theme.id);
  if (theme.id === 'vellum-page') assert.ok(fields.first_mes.includes(KEEPSAKE_BOTANICAL_ART));
});

function mount({ reduced = false, storage = new Map(), view = 100, key = 'book', opened = false } = {}) {
  const timers = [], events = [];
  let click, focus = 0;
  const trigger = { disabled: false, addEventListener: (_type, fn) => { click = fn; } };
  const cover = { hidden: opened, querySelector: () => trigger };
  const sheet = { hidden: !opened, inert: !opened, querySelector: () => ({ focus() { focus++; } }) };
  const page = { dataset: { kind: 'book', keepsakeKey: key, state: opened ? 'open' : 'closed' }, querySelector: selector => selector === '.cover-stage' ? cover : sheet, dispatchEvent: event => events.push(event.type) };
  new Script(`(${keepsakeInteraction.toString()})();`).runInNewContext({
    document: { querySelector: () => page }, performance: { timeOrigin: 0 }, window: { parent: { performance: { timeOrigin: view } } },
    matchMedia: () => ({ matches: reduced }), sessionStorage: { getItem: k => storage.get(k), setItem: (k, value) => storage.set(k, value) },
    Event: class { constructor(type) { this.type = type; } }, setTimeout: fn => timers.push(fn),
  });
  return { trigger, page, sheet, cover, timers, events, click: () => click?.(), focus: () => focus };
}

test('one click opens the whole directory, repeated input is coalesced, and reduced motion needs no timer', () => {
  for (const reduced of [false, true]) {
    const view = mount({ reduced });
    view.click(); view.click();
    if (reduced) assert.equal(view.timers.length, 0);
    else assert.equal(view.timers.length, 1);
    while (view.timers.length) view.timers.shift()();
    assert.equal(view.sheet.hidden, false);
    assert.equal(view.sheet.inert, false);
    assert.equal(view.cover.hidden, true);
    assert.equal(view.focus(), 1);
    assert.deepEqual(view.events, ['keepsake-opened']);
  }
});

test('returning restores the open directory, while a new visit and a different template start closed', () => {
  const storage = new Map();
  const first = mount({ storage }); first.click(); first.timers[0]();
  assert.equal(mount({ storage }).sheet.hidden, false);
  assert.equal(mount({ storage, view: 101 }).sheet.hidden, true);
  assert.equal(mount({ storage, key: 'tape' }).sheet.hidden, true);
});

test('optional images stay optional and do not accept embedded bitmaps; stable IDs survive editing', () => {
  const d = normalizeKeepsake({ theme: 'cloth-book', imageUrl: 'data:image/png;base64,AAAA', entries: [{ id: 'home', title: '同名' }, { id: 'home', title: '同名' }] });
  assert.equal(d.imageUrl, '');
  assert.notEqual(d.entries[0].id, d.entries[1].id);
  const fields = buildKeepsakeGreetingFields(d);
  assert.doesNotMatch(fields.first_mes, /<img|<figure class="optional-image">/);
});

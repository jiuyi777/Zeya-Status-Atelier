import test from 'node:test';
import assert from 'node:assert/strict';
import { Script } from 'node:vm';
import { STAR_DEFAULTS, buildStarGreetingFields, switchStarPage } from '../opening-star-atlas.js';

test('exported pages contain runnable complete documents and automatic return buttons', () => {
  const fields = JSON.parse(JSON.stringify(buildStarGreetingFields(STAR_DEFAULTS)));
  for (const page of [fields.first_mes, ...fields.alternate_greetings]) {
    assert.match(page, /^```html\n<!DOCTYPE html>/);
    assert.match(page, /<body>[\s\S]*<\/body><\/html>\n```$/);
    for (const script of page.matchAll(/<script>([\s\S]*?)<\/script>/g)) new Script(script[1]);
  }
  for (const page of fields.alternate_greetings) assert.equal([...page.matchAll(/data-target="home"/g)].length, 2);
  assert.equal(fields.alternate_greetings.length, 3);
});

test('return resolves the actual home swipe after reordering and writes only its index', async () => {
  const fields = buildStarGreetingFields(STAR_DEFAULTS);
  const swipes = [fields.alternate_greetings[2], fields.alternate_greetings[0], fields.first_mes, fields.alternate_greetings[1]];
  const before = structuredClone(swipes), calls = [];
  const read = async (floor, options) => { assert.equal(floor, '0'); assert.deepEqual(options, { include_swipes: true }); return [{ swipes }]; };
  await switchStarPage('home', read, async (...args) => calls.push(args));
  await switchStarPage('opening-2', read, async (...args) => calls.push(args));
  assert.deepEqual(calls, [[[{ message_id: 0, swipe_id: 2 }], { refresh: 'affected' }], [[{ message_id: 0, swipe_id: 3 }], { refresh: 'affected' }]]);
  assert.deepEqual(swipes, before);
});

test('missing or ambiguous pages and missing helpers never write to chat', async () => {
  let writes = 0;
  const write = () => { writes++; };
  await assert.rejects(switchStarPage('home', undefined, write));
  await assert.rejects(switchStarPage('home', () => [{ swipes: ['original greeting'] }], write));
  await assert.rejects(switchStarPage('home', () => [{ swipes: ['data-star-page="home"', 'data-star-page="home"'] }], write));
  assert.equal(writes, 0);
});

test('user text stays literal and cannot close scripts or spoof page markers', () => {
  const text = '<script>bad()</script> ``` data-star-page="home"\n原文';
  const fields = buildStarGreetingFields({ ...STAR_DEFAULTS, entries: [{ id: 'one', title: text, body: text }] });
  assert.equal(fields.alternate_greetings[0].includes('<script>bad()'), false);
  assert.equal(fields.alternate_greetings[0].includes('data-star-page="home"'), false);
  assert.match(fields.alternate_greetings[0], /原文/);
});

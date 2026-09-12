import test from 'node:test';
import assert from 'node:assert/strict';
import { Script } from 'node:vm';
import { LILY_DEFAULTS, LILY_IMAGE_URL, buildLilyGreetingFields } from '../opening-lily-moon.js';
import { STAR_DEFAULTS, buildStarGreetingFields, switchStarPage } from '../opening-star-atlas.js';

test('lily exports reference the GitHub image URL and include complete executable documents', () => {
  const fields = JSON.parse(JSON.stringify(buildLilyGreetingFields(LILY_DEFAULTS)));
  assert.ok(fields.first_mes.includes(LILY_IMAGE_URL));
  assert.equal(fields.first_mes.includes('data:image'), false);
  for (const page of [fields.first_mes, ...fields.alternate_greetings]) {
    assert.match(page, /^```html\n<!DOCTYPE html>/);
    assert.match(page, /<body>[\s\S]*<\/body><\/html>\n```$/);
    for (const script of page.matchAll(/<script>([\s\S]*?)<\/script>/g)) new Script(script[1]);
  }
  for (const page of fields.alternate_greetings) assert.equal([...page.matchAll(/data-target="lily-home"/g)].length, 2);
});

test('lily return resolves its own navigation among reordered pages including another style', async () => {
  const lily = buildLilyGreetingFields(LILY_DEFAULTS);
  const star = buildStarGreetingFields(STAR_DEFAULTS);
  const swipes = [star.first_mes, lily.alternate_greetings[1], lily.first_mes, lily.alternate_greetings[0]];
  const calls = [];
  await switchStarPage('lily-home', () => [{ swipes }], async (...args) => calls.push(args));
  await switchStarPage('lily-opening-1', () => [{ swipes }], async (...args) => calls.push(args));
  assert.deepEqual(calls, [[[{message_id:0,swipe_id:2}],{refresh:'affected'}], [[{message_id:0,swipe_id:3}],{refresh:'affected'}]]);
});

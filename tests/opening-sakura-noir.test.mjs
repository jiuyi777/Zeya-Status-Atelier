import test from 'node:test';
import assert from 'node:assert/strict';
import { Script } from 'node:vm';
import { NOIR_DEFAULTS, NOIR_IMAGE_URL, buildNoirGreetingFields } from '../opening-sakura-noir.js';
import { STAR_DEFAULTS, buildStarGreetingFields, switchStarPage } from '../opening-star-atlas.js';

test('noir exports reference the GitHub image URL and include complete executable documents', () => {
  const fields = JSON.parse(JSON.stringify(buildNoirGreetingFields(NOIR_DEFAULTS)));
  assert.ok(fields.first_mes.includes(NOIR_IMAGE_URL));
  assert.equal(fields.first_mes.includes('data:image'), false);
  for (const page of [fields.first_mes, ...fields.alternate_greetings]) {
    assert.match(page, /^```html\n<!DOCTYPE html>/);
    assert.match(page, /<body>[\s\S]*<\/body><\/html>\n```$/);
    for (const script of page.matchAll(/<script>([\s\S]*?)<\/script>/g)) new Script(script[1]);
  }
  for (const page of fields.alternate_greetings) assert.equal([...page.matchAll(/data-target="noir-home"/g)].length, 2);
});

test('noir return resolves its own navigation among reordered pages including another style', async () => {
  const noir = buildNoirGreetingFields(NOIR_DEFAULTS);
  const star = buildStarGreetingFields(STAR_DEFAULTS);
  const swipes = [star.first_mes, noir.alternate_greetings[1], noir.first_mes, noir.alternate_greetings[0]];
  const calls = [];
  await switchStarPage('noir-home', () => [{ swipes }], async (...args) => calls.push(args));
  await switchStarPage('noir-opening-1', () => [{ swipes }], async (...args) => calls.push(args));
  assert.deepEqual(calls, [[[{message_id:0,swipe_id:2}],{refresh:'affected'}], [[{message_id:0,swipe_id:3}],{refresh:'affected'}]]);
});

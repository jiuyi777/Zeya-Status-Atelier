import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStarGreetingFields, switchStarPage } from '../opening-star-atlas.js';
import { buildLilyGreetingFields } from '../opening-lily-moon.js';
import { buildNoirGreetingFields } from '../opening-sakura-noir.js';
import { buildOrbitGreetingFields } from '../opening-lunar-orbit.js';
import { buildFloralGreetingFields } from '../opening-floral-letter.js';
import { buildBloomGreetingFields } from '../opening-bloom-letter.js';
import { KEEPSAKE_THEMES, buildKeepsakeGreetingFields } from '../opening-keepsake.js';
import { KINETIC_THEMES, buildKineticGreetingFields } from '../opening-kinetic.js';

const builders = [
    ['星图', buildStarGreetingFields], ['月下百合', buildLilyGreetingFields],
    ['樱夜', buildNoirGreetingFields], ['月轨', buildOrbitGreetingFields],
    ['花间来信', buildFloralGreetingFields], ['见花如晤', buildBloomGreetingFields],
    ...KEEPSAKE_THEMES.map(theme => [theme.name, input => buildKeepsakeGreetingFields({ ...input, theme: theme.id })]),
    ...KINETIC_THEMES.map(theme => [theme.name, input => buildKineticGreetingFields({ ...input, theme: theme.id })]),
];

for (const [name, build] of builders) test(`${name}: one return follows the story and returns to the actual home`, async () => {
    const fields = JSON.parse(JSON.stringify(build({
        title: '作品标题', author: '作者署名',
        entries: [{ id: 'first', title: '篇目名称', body: '第一段。\n\n正文最后一句。', imageUrl: 'https://example.com/story.webp' }],
    })));
    const page = fields.alternate_greetings[0];
    const markup = page.slice(page.indexOf('<body>'), page.indexOf('<script'));
    const returns = [...markup.matchAll(/<button\b[^>]*data-target="([^"]+)"[^>]*>[\s\S]*?返回[\s\S]*?<\/button>/g)];
    assert.equal(returns.length, 1, 'the reading page has one return, at the end');
    const back = returns[0];
    assert.ok(back.index > markup.indexOf('正文最后一句。'));
    const picture = markup.indexOf('src="https://example.com/story.webp"');
    if (picture >= 0) assert.ok(back.index > picture, 'optional story picture precedes the return');
    const sign = markup.indexOf('class="sign"');
    if (sign >= 0) assert.ok(back.index > sign, 'the letter signature precedes the return');
    const swipes = [page, fields.first_mes], writes = [];
    await switchStarPage(back[1], async () => [{ swipes }], async rows => writes.push(rows));
    assert.deepEqual(writes, [[{ message_id: 0, swipe_id: 1 }]]);
    assert.equal(swipes[0], page);
});

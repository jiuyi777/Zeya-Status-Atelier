import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOpeningOverview, mergeOpeningOverviewMetadata, selectTensionExcerpts } from '../opening-overview.js';

test('tension excerpts are exact paragraphs from the original greeting', () => {
    const quiet = '他把书放回架子，替换了桌上已经冷掉的茶。';
    const tense = '窗外枪声骤然炸响，他一把抓住你的手腕，呼吸贴得很近：“别开门。”';
    const intimate = '他没有立刻出声，只是看着你，拇指压住你急促跳动的脉搏。';
    const raw = `${quiet}\n\n${tense}\n\n${intimate}`;
    const excerpts = selectTensionExcerpts(raw, 2);
    assert.equal(excerpts.length, 2);
    excerpts.forEach(excerpt => assert.ok(raw.includes(excerpt), 'every excerpt must be a verbatim paragraph from the card'));
    assert.ok(excerpts.includes(tense));
});

test('opening overview combines generated titles and summaries with unedited source excerpts', () => {
    const first = '雨声盖住了钥匙转动的轻响。\n\n他站在门边看着睡着的你，贪婪地数着你的每一次呼吸。';
    const second = '审讯室的灯熄灭了。\n\n“先吃饭，”他贴着你的额头问，“还是先吃我？”';
    const overview = buildOpeningOverview(
        [{ raw: first }, { raw: second }],
        [
            { title: '雨夜等门的贪念', summary: '温瑟归家后发现你已经睡着。' },
            { title: '审讯室外的温存', route: '旧识线', summary: '疲惫的你回到公寓寻求拥抱。' },
        ],
        { excerptsPerOpening: 1, homepage: { title: '雨夜档案', subtitle: 'NIGHT FILE', intro: '这是已经生成的作品与世界观简介。' } },
    );
    assert.match(overview, /^## :book: 雨夜档案/);
    assert.match(overview, /\*NIGHT FILE\*/);
    assert.match(overview, /### 作品简介 \/ 世界观介绍\n这是已经生成的作品与世界观简介。/);
    assert.match(overview, /> \*\*开场白1:雨夜等门的贪念\*\*/);
    assert.match(overview, /> 温瑟归家后发现你已经睡着。/);
    assert.match(overview, /> \*\*线路：旧识线\*\*/);
    assert.match(overview, /-# 他站在门边看着睡着的你，贪婪地数着你的每一次呼吸。/);
    assert.match(overview, /-# “先吃饭，”他贴着你的额头问，“还是先吃我？”/);
});

test('opening overview preserves existing edited metadata and only leaves real gaps for AI', () => {
    const merged = mergeOpeningOverviewMetadata(
        [
            { raw: '第一条原文', title: '已经写好的标题', route: '罪人线', summary: '已经写好的路线简介。' },
            { raw: '第二条原文' },
            { raw: '第三条原文' },
        ],
        [
            { title: '不能覆盖', route: '少年线', summary: '不能覆盖现有数据。' },
            { title: '草稿标题', route: '神明线', summary: '草稿里已经填写的简介。' },
            { title: '未命名开局 3', route: '未分类线', summary: '等待 AI 补全。' },
        ],
    );
    assert.deepEqual(
        merged.map(({ title, route, summary }) => ({ title, route, summary })),
        [
            { title: '已经写好的标题', route: '罪人线', summary: '已经写好的路线简介。' },
            { title: '草稿标题', route: '神明线', summary: '草稿里已经填写的简介。' },
            { title: '', route: '', summary: '' },
        ],
    );
});

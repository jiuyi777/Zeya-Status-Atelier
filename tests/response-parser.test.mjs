import test from 'node:test';
import assert from 'node:assert/strict';
import {
    applyStatusIdeaFocus,
    buildLocalStatusRecords,
    BATCH_SUMMARY_JSON_SCHEMA,
    ENTRY_BATCH_JSON_SCHEMA,
    SUMMARY_RESPONSE_LENGTH,
    SINGLE_SUMMARY_JSON_SCHEMA,
    generationErrorMessage,
    greetingPreview,
    jsonObjectsFromResponse,
    normalizeRouteLabel,
    parseBatchSummaryResponse,
    parseSummaryResponse,
    responseText,
    resolveStatusIdeaIntent,
    resolveStatusRecommendation,
    stripReasoningBlocks,
    usableGreetingRecords,
} from '../response-parser.js';

const statusStructures = [
    { id: 'phone', name: '手机桌面' },
    { id: 'profile', name: '人物状态栏' },
    { id: 'social', name: '个人动态' },
    { id: 'chat', name: '聊天会话' },
    { id: 'forum', name: '论坛主题' },
];
const statusAppearances = [
    { id: 'obsidian', name: '黑银档案' },
    { id: 'classical', name: '古典对称' },
];

test('resolves status recommendations from ids, Chinese template names and local fallback text', () => {
    const options = { structures: statusStructures, appearances: statusAppearances, defaultAppearance: 'classical' };
    assert.deepEqual(resolveStatusRecommendation('{"structure":"chat","profileAppearance":"","reason":"适合对话"}', options), {
        structure: 'chat', profileAppearance: '', reason: '适合对话', usedFallback: false,
    });
    assert.equal(resolveStatusRecommendation('{"template":"人物状态栏","style":"黑银档案"}', options).profileAppearance, 'obsidian');
    const fallback = resolveStatusRecommendation('我推荐做成论坛帖子', { ...options, fallbackText: '当前剧情有楼层讨论' });
    assert.equal(fallback.structure, 'forum');
    assert.equal(fallback.usedFallback, true);
    for (const structure of statusStructures) {
        const resolved = resolveStatusRecommendation(`建议使用${structure.name}`, options);
        assert.equal(resolved.structure, structure.id);
    }
});

test('simple ideas select a focus and rewrite visible field labels and AI instructions', () => {
    const story = resolveStatusIdeaIntent('这次注重剧情和关键线索');
    assert.equal(story.focus, 'story');
    assert.equal(story.structureHint, '');
    const storyFields = applyStatusIdeaFocus([
        { id: 'time', label: '时间', instruction: '填写时间', kind: 'text' },
        { id: 'location', label: '位置', instruction: '填写位置', kind: 'text' },
        { id: 'body', label: '身体情况', instruction: '填写身体', kind: 'long' },
    ], story);
    assert.deepEqual(storyFields.map(item => item.label), ['当前章节', '剧情进展', '任务进度']);
    assert.equal(storyFields[2].kind, 'progress');
    assert.match(storyFields[1].instruction, /本轮实际推进/);
    assert.deepEqual(storyFields.map(item => item.id), ['time', 'location', 'body']);

    const body = resolveStatusIdeaIntent('我想关注其他人的身体情况和伤势');
    assert.equal(body.focus, 'other_body');
    const bodyFields = applyStatusIdeaFocus(storyFields, body);
    assert.deepEqual(bodyFields.map(item => item.label), ['目标人物', '身体情况', '伤势程度']);
    assert.equal(bodyFields[2].kind, 'progress');
    assert.match(bodyFields[2].instruction, /未知则写0/);
});

test('an explicit simple-mode template hint is preserved alongside the content focus', () => {
    const intent = resolveStatusIdeaIntent('做成论坛主题帖，注重剧情推进');
    assert.equal(intent.structureHint, 'forum');
    assert.equal(intent.focus, 'story');
});

test('local status fallback derives different complete records from different cards', () => {
    const rule = {
        structure: 'profile',
        sharedFields: [{ id: 'name', label: '角色名', kind: 'text' }],
        pageFields: [],
        pages: [{ id: 'View1', label: '剧情', fields: [
            { id: 'plot', label: '剧情进展', kind: 'long' },
            { id: 'health', label: '身体情况', kind: 'long' },
            { id: 'risk', label: '风险程度', kind: 'progress' },
        ] }],
    };
    const mystery = buildLocalStatusRecords(rule, {
        characterName: '林雾',
        characterContext: '雾港调查员，正在追查失踪的守夜人。',
        chatContext: '角色：她在灯塔找到一把铜钥匙和缺页航海日志。',
    });
    const medic = buildLocalStatusRecords(rule, {
        characterName: '沈岚',
        characterContext: '战地医生，负责观察队友伤势。',
        chatContext: '角色：队友呼吸急促，左臂流血，暂时无法站立。',
    });
    assert.equal(mystery.shared[0], '林雾');
    assert.equal(medic.shared[0], '沈岚');
    assert.notDeepEqual(mystery.pages[0].values, medic.pages[0].values);
    assert.match(medic.pages[0].values[1], /呼吸|流血|伤势/);
    assert.match(mystery.pages[0].values[2], /^\d+$/);
    assert.ok([...mystery.shared, ...mystery.pages[0].values, ...medic.shared, ...medic.pages[0].values]
        .every(value => !/[|\[\]<>]/.test(value)));
});

test('provides SillyTavern-compatible JSON schemas for single and batch summaries', () => {
    assert.deepEqual(SINGLE_SUMMARY_JSON_SCHEMA.value.required, ['title', 'route', 'summary']);
    assert.deepEqual(BATCH_SUMMARY_JSON_SCHEMA.value.required, ['homeTitle', 'homeSubtitle', 'workIntro', 'entries']);
    assert.deepEqual(BATCH_SUMMARY_JSON_SCHEMA.value.properties.entries.items.required, ['index', 'title', 'route', 'summary']);
    assert.deepEqual(ENTRY_BATCH_JSON_SCHEMA.value.required, ['entries']);
});

test('parses optional AI-filled homepage title fields without losing the directory', () => {
    const parsed = parseBatchSummaryResponse(JSON.stringify({
        homeTitle: '白冠秘闻',
        homeSubtitle: '圣光之下',
        entries: [{ index: 1, title: '地牢赦免', route: '罪人线', summary: '塞恩在行刑前夜进入地牢，决定暗中带走即将受刑的你。' }],
    }), [{ index: 0 }]);
    assert.equal(parsed.homeTitle, '白冠秘闻');
    assert.equal(parsed.homeSubtitle, '圣光之下');
    assert.equal(parsed.entries.get(0).route, '罪人线');
});

test('normalizes route labels and clamps generated directory copy', () => {
    assert.equal(normalizeRouteLabel('密室博弈路线'), '密室博弈线');
    assert.equal(normalizeRouteLabel('醉后失控'), '醉后失控线');
    const parsed = parseSummaryResponse(JSON.stringify({
        title: '这是一个明显超过十四个汉字的长标题需要截断',
        route: '角色关系逐渐失控并发生重大变化路线',
        summary: '这是一段明显过长的路线简介，它不断重复正文里的细节而且一直延伸，最终会超过界面允许的简短长度，所以必须被可靠截断。',
    }), '兜底', '兜底', '兜底线');
    assert.ok(Array.from(parsed.title).length <= 14);
    assert.ok(Array.from(parsed.route).length <= 10);
    assert.ok(Array.from(parsed.summary).length <= 56);
});

test('extracts balanced JSON when braces and escapes appear inside strings', () => {
    const objects = jsonObjectsFromResponse('prefix {"title":"雨夜 {重逢}","summary":"他说：\\"回来吧\\""} suffix');
    assert.equal(objects.length, 1);
    assert.equal(objects[0].title, '雨夜 {重逢}');
});

test('removes common tagged and fenced reasoning blocks case-insensitively', () => {
    const response = '<THINK>不要使用 {"title":"错误"}</THINK>\n```plan\n{"title":"也错误"}\n```\n{"title":"正确","route":"重逢线","summary":"有效简介"}';
    const cleaned = stripReasoningBlocks(response);
    assert.doesNotMatch(cleaned, /错误/);
    assert.deepEqual(parseSummaryResponse(response, '兜底标题', '兜底简介'), { title: '正确', route: '重逢线', summary: '有效简介' });
});

test('falls back to final JSON when a gateway wraps the answer in reasoning tags', () => {
    const response = '<reasoning>推理文字\n{"title":"标签内标题","route":"试探线","summary":"标签内简介"}</reasoning>';
    assert.deepEqual(parseSummaryResponse(response, '兜底标题', '兜底简介'), { title: '标签内标题', route: '试探线', summary: '标签内简介' });
});

test('batch parser keeps only requested complete entries and work intro', () => {
    const response = '<analysis>{"entries":[{"index":1,"title":"错误","summary":"错误"}]}</analysis>\n' +
        '{"workIntro":"作品简介","entries":[{"index":1,"title":"线路甲","route":"雨夜线","summary":"甲简介"},{"index":9,"title":"越界","route":"越界线","summary":"忽略"}]}';
    const parsed = parseBatchSummaryResponse(response, [{ index: 0 }, { index: 1 }]);
    assert.equal(parsed.workIntro, '作品简介');
    assert.deepEqual(parsed.entries.get(0), { title: '线路甲', route: '雨夜线', summary: '甲简介' });
    assert.equal(parsed.entries.has(8), false);
});

test('homepage work intro keeps enough room for worldbuilding context', () => {
    const workIntro = '蒸汽都市正因码头命案陷入不安，灰烬议会与审判机关在暗处争夺情报。温瑟既是玩家最亲近的归处，也是调查名单上的危险嫌疑人；多个开局从雨夜归家、审讯余波与秘密追查展开，围绕信任、身份和彼此试探推进。';
    const parsed = parseBatchSummaryResponse(JSON.stringify({ workIntro, entries: [] }), []);
    assert.equal(parsed.workIntro, workIntro);
});

test('unwraps common gateway response objects before parsing', () => {
    const wrapped = { choices: [{ message: { content: '{"title":"被包装的标题","route":"旧识线","summary":"被包装的简介"}' } }] };
    assert.match(responseText(wrapped), /被包装的标题/);
    assert.deepEqual(parseSummaryResponse(wrapped, '兜底', '兜底'), { title: '被包装的标题', route: '旧识线', summary: '被包装的简介' });
});

test('batch parser accepts tagged and numbered non-JSON model replies', () => {
    const tagged = '[WorkIntro|作品总简介]\n[Entry|1|雨夜来客|旧宅访客线|陌生人在雨夜敲响旧宅大门。]\n[Entry|2|失落车站|旧识重逢线|两人在末班车站再次相遇。]';
    const parsedTagged = parseBatchSummaryResponse(tagged, [{ index: 0 }, { index: 1 }]);
    assert.equal(parsedTagged.workIntro, '作品总简介');
    assert.deepEqual(parsedTagged.entries.get(1), { title: '失落车站', route: '旧识重逢线', summary: '两人在末班车站再次相遇。' });

    const numbered = '1. 标题：旧城来信\n线路：迟信重逢线\n简介：一封迟到多年的信改变了重逢。\n2、海边清晨\n路线：海边相遇线\n线路简介：潮声中出现新的选择。';
    const parsedNumbered = parseBatchSummaryResponse(numbered, [{ index: 0 }, { index: 1 }]);
    assert.deepEqual(parsedNumbered.entries.get(0), { title: '旧城来信', route: '迟信重逢线', summary: '一封迟到多年的信改变了重逢。' });
    assert.deepEqual(parsedNumbered.entries.get(1), { title: '海边清晨', route: '海边相遇线', summary: '潮声中出现新的选择。' });
});

test('distinguishes a generic 502 from an actual 524 timeout', () => {
    assert.equal(SUMMARY_RESPONSE_LENGTH, 4096);
    assert.match(generationErrorMessage(new Error('Gateway 524 timed out')), /超时或 524/);
    assert.match(generationErrorMessage(new Error('Gateway 524 timed out')), /4096/);
    assert.match(generationErrorMessage(new Error('Got response status 502')), /502 不一定是超时/);
    assert.match(generationErrorMessage(new Error('No message generated')), /不会再截抄正文/);
    assert.equal(generationErrorMessage(new Error('permission denied')), '');
});

test('filters empty greeting placeholders while preserving native swipe indexes', () => {
    assert.equal(greetingPreview('<div> 真实开场 </div>'), '真实开场');
    const records = usableGreetingRecords(['第一条', '```html\n<div></div>\n```', '', '<p>第四条</p>']);
    assert.deepEqual(records.map(item => ({ sourceIndex: item.sourceIndex, preview: item.preview })), [
        { sourceIndex: 0, preview: '第一条' },
        { sourceIndex: 3, preview: '第四条' },
    ]);
});

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
    RULE_PRESETS,
    STATUS_CUSTOM_VARIANTS,
    STATUS_RECIPE_PRESETS,
    STATUS_STRUCTURE_PRESETS,
    buildRegexScript,
} from '../rule-generator.js';
import { buildOpeningHomeRegex } from '../opening-home-generator.js';

const outputPath = resolve(process.argv[2] || 'status-atelier-status-preview.html');
async function fileDataUrl(value) {
    if (!value) return '';
    const path = resolve(value);
    try {
        const bytes = await readFile(path);
        const extension = path.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
        return `data:image/${extension};base64,${bytes.toString('base64')}`;
    } catch {
        return '';
    }
}

const avatarUrl = await fileDataUrl(process.argv[3]);
const objectUrl = await fileDataUrl(process.argv[4]);
const scenicUrl = await fileDataUrl(process.argv[5]);

const RECIPE_SAMPLE_VALUES = Object.freeze({
    'custom-01': ['星纹蓝宝石', '76', '同一枚宝石可切换网点、像素、涂抹、三维和扭曲表现。'],
    'custom-02': ['午夜通讯终端', '线路已接通', '64', '02:17 收到来自北港的加密讯息。'],
    'custom-03': ['小道旧案抄录', '照片背面写着：别在月圆之后打开钟楼的门。', '58', '霜月十七日'],
    'custom-04': ['NO WAY BACK', '越界者档案', '81', '最后一班列车已经驶离，整座城只剩下广播仍在重复你的名字。'],
    'custom-05': ['旧城区入口', '42', '总览', '调查队在暴雨中抵达封锁线，钟楼方向传来第三次异响。'],
    'custom-06': ['NIGHT FILE', '失踪者留下的第七码头', '潮汐退去后，废弃仓库里出现一排没有脚印的湿鞋。', 'VOL.07 / P.18'],
    'custom-07': ['贴身口袋', '69', '里面装着半张车票、一枚旧徽章和没有寄出的信。', 'HAND MADE'],
    'custom-08': ['温瑟', '灰烬议会观察对象', '73', '他仍然笑着，却把那封电报折进了最贴近心口的内袋。'],
    'custom-09': ['SECTOR 7', '88', '未知信号逼近', '扫描结果显示目标正在地铁废线中移动。'],
    'custom-10': ['冬日花园', '北塔温室 · 第四层', '45', '预留大图位置可粘贴玩家自己的风景、植物或剧情照片 URL。'],
    'custom-11': ['SAVE_07', '夜间模式', '52', '你获得了新道具：生锈的钟楼钥匙。'],
    'custom-12': ['UNIT / A-17', '67', '高危样本', '外壳出现轻微裂纹，内部仍持续传出规律敲击声。'],
    'custom-13': ['雨打芭蕉', '子时三刻', '61', '窗外灯影摇晃，他在屏风另一侧停住了呼吸。'],
    'custom-14': ['DREAM.EXE', '79', '正在载入', '弹窗里只有一句话：你确定昨晚醒来的人是你吗？'],
    'custom-15': ['PROJECT 0-17', '结构复核', '84', '主梁偏移 3.2mm，建议在下一幕触发坍塌事件。'],
    'custom-16': ['致仍在等门的人', '寄自雾港旧街', '37', '雨已经下了三天。我把没有说出口的那句话一起封进了信里。'],
    'custom-17': ['ROLL 09', '最后一张清晰照片', '71', '画面右侧的镜子里，比现场多出一个背对镜头的人。'],
    'custom-18': ['失落卫星 Aster-9', '方位 217° / 仰角 31°', '63', '它每隔十四分钟发出一次重复信号，内容像一段被截断的姓名。'],
    'custom-19': ['THE NIGHT IS OPEN', '02:47', '55', '广播刚刚宣布宵禁，而你们正站在唯一仍亮着灯的门前。'],
    'custom-20': ['2084-11-04', '第七区 · 地下铁遗迹', '12.5 升', '短柄霰弹枪', '3 罐头', '2 瓶净水', '凯伦 / ID #1024 / 状态稳定；734号单元 / 权限 LVL 2', '92', '45', '70', '辐射计数器持续升高，必须在天亮前转移。'],
    'type-01': ['遗失圣物研究', '07', '银制心脏瓶', '持有者不明', 'RELIC / A', '一件物品可以占据主视觉，其余信息退到边缘。'],
    'type-02': ['月下茶会', '68', '来客 4 人', '茶壶仍温热', '桌上多出第五只杯子', '没有人承认它属于自己。'],
    'type-03': ['雾港第三章', '雨季第 11 日', '43', '旧码头、钟楼、地下水道', '追踪失踪电报员', '本章从一场没有尸体的葬礼开始。'],
    'type-04': ['B917', '北线封锁', '仅限持证者', '23:40', '旧城中央站', '下一班列车不会停靠本站。'],
    'type-05': ['钟楼倒计时', '门锁已解除', '17', '83', '还剩两次尝试', '数字是主角，说明文字只负责补充。'],
    'type-06': ['EP.09', '雨声里的第二个脚步', '31:24', '温瑟 / 调查员', '关于旧城区连环失踪案的一段录音。', '00:00 等门；08:12 电报；19:43 枪声'],
    'type-07': ['九一', '3,842', '86', '午夜档案直播', '「镜子里刚才是不是有人？」 「回放第17秒！」', '观众投票决定是否打开地下室。'],
    'type-08': ['该相信谁？', '相遇：隐瞒姓名', '试探：交换证物', '揭示：同一份通缉令', '尚未定局', '三张牌分别承载过去、现在与下一步选择。'],
    'type-09': ['ARCHIVE_NODE_07', 'SECURE LINK', '63', '91', '> decrypt memory_17\n> warning: identity mismatch', '不要相信镜中的备份。'],
    'type-10': ['北港废弃区', '低能见度', '72', '38', '避难所 A、断桥、旧诊所', '红色路径正在缩短，灰区仍未探索。'],
    'type-11': ['FILE 2084-117', '观察中', '心率 108', '体温 37.8℃', '74', '受试者能准确复述从未经历过的童年记忆。'],
    'type-12': ['关于重复梦境的田野记录', '九一 / 2084', '连续七夜，十三名受访者梦见同一座不存在的车站。', '29', '梦境、车站、集体记忆', 'ARCHIVE DOI / 07-29'],
    'type-13': ['17', '62', '4', '异常信号持续上升', '核对电报原件；寻找第五位证人', '玻璃面板适合展示数据与行动摘要。'],
    'type-14': ['LOT 017', '红宝石圣油瓶', '1890s', '极稀有', '00:12:48', '金质花枝环绕红色玻璃，瓶塞刻有陌生家徽。'],
    'type-15': ['BEFORE', 'CHOICE', 'AFTER', '抉择时刻', '信任 68 / 风险 41', '门已经打开，所有人都在等你先迈出第一步。'],
    'type-16': ['NO. 071', '旧城区今晨封锁', '8月16日 / 雾港', '警方称这只是一次例行检修。', '居民却在凌晨听见钟楼连续敲响十三次。', 'THE MORNING CHRONICLE'],
    'type-17': ['RELIC 017', '白塔收藏室', '圣物 / 容器', '百合心脏瓶', '红玻璃瓶被四朵白瓷百合托起，金枝上仍残留蜡痕。', '图片区域可替换成任意物件、人物或场景 URL。'],
    'type-18': ['ORDER 071', '23:47', '旧钥匙 ×1\n电报抄件 ×3\n银币 ×12', '12', '3', '关键证物已齐全'],
    'type-19': ['午夜单程票', '悬疑 / 黑色电影', '77', '2084-11-04 23:40', '北线 7 号站台', 'B917-04'],
    'type-20': ['147 天', '8月16日', '72', '第一次在雨夜等门', '那锅被反复热过的汤，以及没有问出口的真名。', '下一章：钟楼下的回声'],
});

const PAGE_SAMPLE_VALUES = Object.freeze({
    'custom-05': [
        ['旧城区入口', '42', '总览', '调查队在暴雨中抵达封锁线，钟楼方向传来第三次异响。'],
        ['温瑟与调查员', '68', '关系', '双方交换了一半真相，信任正在上升，身份仍未完全坦白。'],
        ['钟楼密室', '31', '任务', '在午夜前找到第七码头的钥匙，并决定是否销毁那封电报。'],
    ],
});

function recipeDefinition(recipe) {
    const structure = STATUS_STRUCTURE_PRESETS.find(item => item.id === recipe.structure);
    const variant = recipe.group === 'custom' ? STATUS_CUSTOM_VARIANTS.find(item => item.id === recipe.variant) : null;
    return { structure, fields: variant?.fields || structure.fields };
}

function recordsFor(recipe, fields) {
    const fallback = fields.map((field, index) => field[2] === 'progress'
        ? String(45 + index * 6)
        : field[2] === 'long'
            ? '剧情正文会由 AI 根据当前对话填写。'
            : `信息 ${String(index + 1).padStart(2, '0')}`);
    const base = RECIPE_SAMPLE_VALUES[recipe.id] || fallback;
    const pages = String(recipe.pagesText || '').split('\n').filter(Boolean);
    const pageValues = PAGE_SAMPLE_VALUES[recipe.id] || [base];
    const rows = (pages.length ? pages : ['当前页面']).map((_, index) => `[View${index + 1}|${(pageValues[index] || base).join('|')}]`);
    return `<zeya_status>\n${rows.join('\n')}\n</zeya_status>`;
}

function rendererFor(recipe, index) {
    const { structure, fields } = recipeDefinition(recipe);
    const avatarSource = recipe.avatarSource || 'none';
    const input = {
        ...RULE_PRESETS.universalClassical,
        tagName: 'zeya_status',
        structure: structure.id,
        variant: recipe.variant,
        paletteId: recipe.paletteId,
        logoId: recipe.logoId,
        theme: recipe.theme,
        title: recipe.title || recipe.name,
        subtitle: recipe.subtitle || `${recipe.group === 'custom' ? 'CUSTOM PANEL' : 'TYPE STATUS'} / ${String(index + 1).padStart(2, '0')}`,
        layout: recipe.layout,
        pagesText: recipe.pagesText || structure.pagesText,
        sharedFieldsText: '',
        pageFieldsText: fields.map(field => field.join('|')).join('\n'),
        media: {
            avatarSource,
            avatarUrl: avatarSource === 'character' ? avatarUrl : '',
            imageUrl: recipe.id === 'custom-10' ? scenicUrl : recipe.id === 'type-17' ? objectUrl : '',
            audioUrl: '',
            imageAlt: '本地浏览器验收头像',
        },
    };
    const rendered = buildRegexScript(input).replaceString
        .replace(/^```html\s*/, '')
        .replace(/\s*```$/, '')
        .replace('$1', recordsFor(recipe, fields));
    return `<article id="recipe-${recipe.id}" class="preview-shell" data-recipe="${recipe.id}"><div class="preview-caption"><strong>${recipe.name}</strong><span>${recipe.description}</span></div>${rendered}</article>`;
}

const customCards = STATUS_RECIPE_PRESETS.filter(item => item.group === 'custom').map(rendererFor).join('\n');
const typeCards = STATUS_RECIPE_PRESETS.filter(item => item.group === 'type').map((recipe, index) => rendererFor(recipe, index + 20)).join('\n');

const openingSettings = {
    ruleId: 'jiuyi-opening-preview', title: '雾港夜航', subtitle: 'STORY HOME / 可跳转开场白', author: '九一', model: 'Gemini 3.1 Pro', preset: '叙事长文预设',
    intro: '暴雨封锁了旧城区。你将从不同时间、身份和世界线进入同一宗失踪案；点击「进入」会在酒馆中切换到真实额外问候语。',
    theme: 'collage', font: 'kai', accent: '#7b352d', background: '#cfc3a7', cardBackground: '#eee0bd', text: '#392a24', secondary: '#405142', introBackground: '#d9c9a2', buttonColor: '#55352c',
    worldlines: [
        { id: 'sinner', name: '罪人线', description: '从被追捕者视角进入旧城区，真相与赎罪同时逼近。', entries: [] },
        { id: 'youth', name: '少年线', description: '从尚未卷入议会的过去开始，提前遇见改变命运的人。', entries: [] },
        { id: 'observer', name: '旁观线', description: '以档案整理者身份调查遗留照片、电报与失踪名单。', entries: [] },
    ],
    entries: [
        { number: '01', title: '雨夜等门的贪念', route: '罪人线', summary: '温瑟带着酒回到住处，发现等待他的你已经在沙发上睡着。', target: 2, worldlineId: 'sinner' },
        { number: '02', title: '审讯室外的温存', route: '罪人线', summary: '漫长审讯结束后，你在煤气灯下试图从疲惫中抽离。', target: 3, worldlineId: 'sinner' },
        { number: '03', title: '尚未寄出的电报', route: '少年线', summary: '十七岁的他第一次发现，那封信写着未来才会出现的名字。', target: 4, worldlineId: 'youth' },
        { number: '04', title: '第七码头的照片', route: '旁观线', summary: '你在旧卷宗中找到一张比案发日期早了二十年的现场照片。', target: 5, worldlineId: 'observer' },
    ],
};
const openingDocument = buildOpeningHomeRegex(openingSettings).replaceString.replace(/^```html\s*/, '').replace(/\s*```$/, '');
const openingSrcdoc = openingDocument.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>九一 · 状态栏组件验收</title>
<style>body{margin:0;padding:18px;background:#d8d3c9;color:#222;font-family:"Noto Sans SC",sans-serif}.preview-note,.preview-opening,.preview-group{max-width:1320px;margin:0 auto 22px}.preview-note{padding:14px 16px;background:#fff;border-left:6px solid #8a493d}.preview-opening{padding:16px;background:#26231f}.preview-opening h2{margin:0 0 12px;color:#f2e8d2}.preview-opening iframe{display:block;width:100%;height:1100px;border:0;background:#cfc3a7}.preview-group>h2{margin:0 0 13px;padding:9px 12px;color:#fff;background:#24211e}.preview-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,410px),1fr));gap:22px;align-items:start}.preview-shell{min-width:0;padding:10px;background:#c9c4ba}.preview-caption{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:4px 4px 8px}.preview-caption strong{font-size:15px}.preview-caption span{max-width:70%;color:#5b5650;font-size:11px;text-align:right}.preview-shell>.zeya-regex-status{width:100%;margin:0}.preview-shell:is([data-recipe="custom-01"],[data-recipe="custom-03"],[data-recipe="custom-20"]){grid-column:span 2}.preview-shell:is([data-recipe="custom-01"],[data-recipe="custom-03"],[data-recipe="custom-20"])>.zeya-regex-status{max-width:820px}@media(max-width:900px){.preview-shell{grid-column:1!important}.preview-opening iframe{height:980px}}@media(max-width:520px){body{padding:8px}.preview-opening{padding:8px}.preview-opening iframe{height:930px}.preview-caption{display:block}.preview-caption span{display:block;max-width:none;margin-top:3px;text-align:left}}</style></head>
<body><div class="preview-note"><strong>真实生成器浏览器验收</strong><br>顶部是实际的可跳转开场白主页；下面分为 20 套自由面板与 20 套类型状态栏。预览文案全部改成不同剧情示例，不再使用“任意主标题”。</div><section class="preview-opening"><h2>可跳转开场白主页 · 点击「进入」在酒馆中切换真实额外问候语</h2><iframe title="可跳转开场白主页预览" srcdoc="${openingSrcdoc}"></iframe></section><section class="preview-group"><h2>20 套自由面板</h2><main class="preview-grid">${customCards}</main></section><section class="preview-group"><h2>20 套类型状态栏</h2><main class="preview-grid">${typeCards}</main></section></body></html>`;
await writeFile(outputPath, html, 'utf8');
console.log(outputPath);

import { STATUS_BEAUTY_05_09_PRESETS } from './status-beauty-05-09.js';

const BUNDLE_ROOT = new URL('./assets/status-beauty/regexes/', import.meta.url);

const COMMON_10_15_FIELDS = Object.freeze([
    ['情愫', '填写角色当前情愫数值或简短阶段', 'text', 'affection'],
    ['欲念', '填写角色当前欲念数值或简短状态', 'text', 'desire'],
    ['衣冠', '具体描述角色当前衣着、配饰与可见细节', 'long', 'attire'],
    ['身处', '具体描述角色当前地点与周围环境', 'long', 'location'],
    ['心语', '第一人称填写角色没有说出口的真实想法', 'long', 'inner_voice'],
    ['书信', '以角色口吻填写此刻最想传达的话', 'long', 'letter'],
    ['双手', '具体填写角色双手正在做什么', 'long', 'hands'],
    ['腹部', '具体填写角色腹部或核心身体状态', 'long', 'abdomen'],
    ['身体', '具体填写角色当前整体身体状况与体感', 'long', 'body'],
    ['思绪', '概括角色此刻反复盘旋的思绪', 'long', 'thoughts'],
    ['计划', '填写角色接下来最可能执行的计划', 'long', 'plan'],
    ['目的地一', '填写第一个可能前往或关注的地点', 'text', 'destination_1'],
    ['目的地二', '填写第二个可能前往或关注的地点', 'text', 'destination_2'],
    ['目的地三', '填写第三个可能前往或关注的地点', 'text', 'destination_3'],
    ['秘密', '填写角色当前隐藏且未说出口的秘密', 'long', 'secret'],
]);

function preset(id, name, description, title, subtitle, fields) {
    return { id, name, description, title, subtitle, layout: 'stack', pagesText: '当前角色|填写当前主要角色或视角', fields };
}

export const STATUS_BEAUTY_01_04_10_15_PRESETS = Object.freeze([
    preset('beauty-crimson-letter-01', '01 · 绛幕雪信', '绛红帷幕、雪信与角色八项状态', '绛幕雪信', 'CRIMSON SNOW LETTER', [
        ['情愫', '填写角色当前情愫数值或简短阶段', 'text', 'affection'],
        ['欲念', '填写角色当前欲念数值或简短状态', 'text', 'desire'],
        ['衣冠', '具体描述角色当前衣着、配饰与可见细节', 'long', 'attire'],
        ['身处', '具体描述角色当前地点与周围环境', 'long', 'location'],
        ['心语', '第一人称填写角色没有说出口的真实想法', 'long', 'inner_voice'],
        ['书信', '以角色口吻填写此刻最想传达的话', 'long', 'letter'],
        ['情愫注', '概括本轮情愫变化及原因', 'long', 'affection_note'],
        ['欲念注', '概括欲念当前的克制、动摇或变化', 'long', 'desire_note'],
        ['时间', '填写当前剧情时间', 'text', 'time'],
        ['当前章节', '填写当前剧情章节或阶段', 'text', 'chapter'],
    ]),
    preset('beauty-burgundy-album-02', '02 · 酒红交换相簿', '相簿式隐秘行动、计划、去向与心声', '酒红交换相簿', 'BURGUNDY EXCHANGE ALBUM', [
        ['隐秘行动', '填写角色正在暗中进行或刚完成的行动', 'long', 'hidden_actions'],
        ['小计划一', '填写角色近期第一个小计划', 'long', 'small_plan_1'],
        ['小计划二', '填写角色近期第二个小计划', 'long', 'small_plan_2'],
        ['去向一', '填写第一个可能前往或关注的地点', 'text', 'destination_1'],
        ['去向二', '填写第二个可能前往或关注的地点', 'text', 'destination_2'],
        ['去向三', '填写第三个可能前往或关注的地点', 'text', 'destination_3'],
        ['去向四', '填写第四个可能前往或关注的地点', 'text', 'destination_4'],
        ['去向五', '填写第五个可能前往或关注的地点', 'text', 'destination_5'],
        ['去向六', '填写第六个可能前往或关注的地点', 'text', 'destination_6'],
        ['心声', '第一人称填写角色没有说出口的真实想法', 'long', 'musings'],
    ]),
    preset('beauty-dossier-04', '04 · 人物剪报卷宗', '剪报卷宗式时间、地点、宜忌、广播与签文', '人物剪报卷宗', 'CHARACTER DOSSIER', [
        ['时间', '填写当前剧情时间', 'text', 'time'],
        ['地点', '填写角色当前所在地点', 'text', 'location'],
        ['今日宜', '填写此刻适合角色做的一件事', 'text', 'recommended'],
        ['今日忌', '填写此刻不适合角色做的一件事', 'text', 'avoid'],
        ['广播', '用一句简短广播概括当前状态或场景', 'long', 'broadcast'],
        ['当前章节', '填写当前剧情章节或阶段', 'text', 'chapter'],
        ['心声', '第一人称填写角色没有说出口的真实想法', 'long', 'inner_voice'],
        ['御神签', '填写与当前剧情对应的签位与简短签意', 'long', 'fortune'],
    ]),
    preset('beauty-flower-echo-10', '10 · 花冠回声簿', '花冠与回声书页式十五项人物状态', '花冠回声簿', 'FLOWER CROWN ECHO', COMMON_10_15_FIELDS),
    preset('beauty-clock-travel-11', '11 · 时针旅页', '时针与旅行书页式十五项人物状态', '时针旅页', 'CLOCKWORK TRAVEL PAGE', COMMON_10_15_FIELDS),
    preset('beauty-flower-reader-12', '12 · 花间读者札', '花间读者札记式十五项人物状态', '花间读者札', 'FLOWER READER NOTE', COMMON_10_15_FIELDS),
    preset('beauty-olive-ticket-13', '13 · 橄榄票根簿', '橄榄票根与旅页式十五项人物状态', '橄榄票根簿', 'OLIVE TICKET BOOK', COMMON_10_15_FIELDS),
    preset('beauty-cat-rabbit-14', '14 · 猫兔夜话', '猫兔夜谈式十五项人物状态', '猫兔夜话', 'CAT & RABBIT NIGHT TALK', COMMON_10_15_FIELDS),
    preset('beauty-rabbit-track-15', '15 · 兔子计划跑道', '兔子计划跑道式十五项人物状态', '兔子计划跑道', 'RABBIT PLAN TRACK', COMMON_10_15_FIELDS),
]);
export const STATUS_BEAUTY_01_02_PRESETS = Object.freeze(STATUS_BEAUTY_01_04_10_15_PRESETS.slice(0, 2));
export const STATUS_BEAUTY_04_PRESETS = Object.freeze(STATUS_BEAUTY_01_04_10_15_PRESETS.slice(2, 3));
export const STATUS_BEAUTY_10_15_PRESETS = Object.freeze(STATUS_BEAUTY_01_04_10_15_PRESETS.slice(3));

const commonLines10To15 = Object.freeze([
    ['Affection', [0]], ['Desire', [1]], ['Attire', [2]], ['Location', [3]], ['InnerVoice', [4]],
    ['Letter', [5]], ['Hands', [6]], ['Abdomen', [7]], ['Body', [8]], ['Thoughts', [9]],
    ['Plan', [10]], ['Destination1', [11]], ['Destination2', [12]], ['Destination3', [13]], ['Secret', [14]],
]);

const BUNDLED = Object.freeze({
    'beauty-crimson-letter-01': { file: '状态栏01-绛幕雪信.json', tag: 'qingshan_status', lines: [['Affection',[0]],['Desire',[1]],['Attire',[2]],['Location',[3]],['InnerVoice',[4]],['Letter',[5]],['AffectionNote',[6]],['DesireNote',[7]],['Time',[8]],['Chapter',[9]]] },
    'beauty-burgundy-album-02': { file: '状态栏02-酒红交换相簿.json', tag: 'aier_status', lines: [['HiddenActions',[0]],['SmallPlans',[1,2]],['Destinations',[3,4,5,6,7,8]],['Musings',[9]]] },
    'moon-collage': { file: '状态栏03-月下蝶影.json', tag: 'qingshan_status', lines: [['Affection',[0]],['Desire',[1]],['Attire',[2]],['Location',[3]],['InnerVoice',[4]],['Letter',[5]],['AffectionNote',[6]],['DesireNote',[7]]] },
    'beauty-dossier-04': { file: '状态栏04-人物剪报卷宗.json', tag: 'dossier_status', lines: [['Time',[0]],['Location',[1]],['Recommended',[2]],['Avoid',[3]],['Broadcast',[4]],['Chapter',[5]],['InnerVoice',[6]],['Fortune',[7]]] },
    'beauty-current-status-05': { file: '状态栏05-角色当前状态.json', tag: 'status_p05', lines: [['Time',[0]],['Location',[1]],['Affection',[2,3]],['Body',[4]],['Hands',[5]],['Action',[6]],['Spoken',[7]],['InnerVoice',[8]]] },
    'beauty-card-status-06': { file: '状态栏06-牌面角色状态.json', tag: 'status_p06', lines: [['Time',[0]],['Location',[1]],['Affection',[2,3]],['Body',[4,5]],['Hands',[6,7]],['Mood',[8,9]],['Attire',[10]],['Desire',[11,12]],['InnerVoice',[13]]] },
    'beauty-letter-status-07': { file: '状态栏07-角色此刻来信.json', tag: 'status_p07', lines: [['Time',[0]],['Location',[1]],['Affection',[2,3]],['Body',[4]],['Hands',[5]],['Action',[6]],['InnerVoice',[7]],['Postscript',[8]]] },
    'beauty-record-status-08': { file: '状态栏08-唱片角色状态.json', tag: 'status_p08', lines: [['Time',[0]],['Location',[1]],['Affection',[2]],['Body',[3]],['Hands',[4]],['HiddenAction',[5]],['Plan',[6]],['InnerVoice',[7]]] },
    'beauty-archive-status-09': { file: '状态栏09-角色档案.json', tag: 'status_p09', lines: [['Time',[0]],['Location',[1]],['Affection',[2,3]],['Whisper',[4]],['Temperature',[5]],['Breathing',[6]],['Shoulders',[7]],['Palms',[8]],['Sensation',[9]],['Chapter',[10]],['Fortune',[11]],['InnerVoice',[12]]] },
    'beauty-flower-echo-10': { file: '状态栏10-花冠回声簿.json', tag: 'status_panel', lines: commonLines10To15 },
    'beauty-clock-travel-11': { file: '状态栏11-时针旅页.json', tag: 'status_panel', lines: commonLines10To15 },
    'beauty-flower-reader-12': { file: '状态栏12-花间读者札.json', tag: 'status_panel', lines: commonLines10To15 },
    'beauty-olive-ticket-13': { file: '状态栏13-橄榄票根簿.json', tag: 'status_panel', lines: commonLines10To15 },
    'beauty-cat-rabbit-14': { file: '状态栏14-猫兔夜话.json', tag: 'status_panel', lines: commonLines10To15 },
    'beauty-rabbit-track-15': { file: '状态栏15-兔子计划跑道.json', tag: 'status_panel', lines: commonLines10To15 },
});

export const STATUS_BEAUTY_01_15_IDS = Object.freeze(Object.keys(BUNDLED));
const cache = new Map();

const MOON_COLLAGE_FIELDS = Object.freeze([
    ['情愫', '填写角色当前情愫数值或简短阶段', 'text', 'affection'],
    ['欲念', '填写角色当前欲念数值或简短状态', 'text', 'desire'],
    ['衣冠', '具体描述角色当前衣着、配饰与可见细节', 'long', 'attire'],
    ['身处', '具体描述角色当前地点与周围环境', 'long', 'location'],
    ['心语', '第一人称填写角色没有说出口的真实想法', 'long', 'inner_voice'],
    ['书信', '以角色口吻填写此刻最想传达的话', 'long', 'letter'],
    ['情愫注', '概括本轮情愫变化及原因', 'long', 'affection_note'],
    ['欲念注', '概括欲念当前的克制、动摇或变化', 'long', 'desire_note'],
]);

const BUNDLED_DEFAULT_FIELDS = new Map([
    ...STATUS_BEAUTY_01_04_10_15_PRESETS.map(item => [item.id, item.fields]),
    ...STATUS_BEAUTY_05_09_PRESETS.map(item => [item.id, item.fields]),
    ['moon-collage', MOON_COLLAGE_FIELDS],
]);

const BUNDLED_DEFAULT_TITLES = new Map([
    ...STATUS_BEAUTY_01_04_10_15_PRESETS.map(item => [item.id, item.title]),
    ...STATUS_BEAUTY_05_09_PRESETS.map(item => [item.id, item.title]),
    ['moon-collage', '月下蝶影'],
]);

export function isStatusBeauty01To15(structure) {
    return Object.hasOwn(BUNDLED, structure);
}

export function statusBeautyBundleMeta(structure) {
    return BUNDLED[structure] || null;
}

function adaptBundledRegex(structure, script) {
    if (structure === 'beauty-crimson-letter-01') {
        return {
            ...script,
            findRegex: '/<(?:qingshan_status|status_qingshan)>\\s*\\[(?:Affection|情愫)\\|(.*?)\\]\\s*\\[(?:Desire|欲念)\\|(.*?)\\]\\s*\\[(?:Attire|衣冠)\\|(.*?)\\]\\s*\\[(?:Location|身处)\\|(.*?)\\]\\s*\\[(?:InnerVoice|心语)\\|(.*?)\\]\\s*\\[(?:Letter|书信)\\|(.*?)\\]\\s*\\[(?:AffectionNote|情愫注)\\|(.*?)\\]\\s*\\[(?:DesireNote|欲念注)\\|(.*?)\\]\\s*\\[(?:Time|时间)\\|(.*?)\\]\\s*\\[(?:Chapter|当前章节)\\|(.*?)\\]\\s*<\\/(?:qingshan_status|status_qingshan)>/s',
            replaceString: String(script.replaceString || '')
                .replaceAll('雪 后 · 第 三 回', '$10')
                .replaceAll('山寺西廊', '$4')
                .replaceAll('SNOW / 17:20', '$9'),
        };
    }
    if (structure === 'moon-collage') {
        const replacements = [
            ['<strong class="value label-value label-1" data-capture="3">$3</strong>', '<strong class="value label-value label-1" data-label="2">衣冠</strong>'],
            ['<strong class="value value-3 long-value" data-capture="4">$4</strong>', '<strong class="value value-3 long-value" data-capture="3">$3</strong>'],
            ['<strong class="value label-value label-2" data-capture="5">$5</strong>', '<strong class="value label-value label-2" data-label="3">身处</strong>'],
            ['<strong class="value value-4 long-value" data-capture="6">$6</strong>', '<strong class="value value-4 long-value" data-capture="4">$4</strong>'],
            ['<strong class="value label-value label-3" data-capture="7">$7</strong>', '<strong class="value label-value label-3" data-label="4">心语</strong>'],
            ['<strong class="value value-5 long-value" data-capture="8">$8</strong>', '<strong class="value value-5 long-value" data-capture="5">$5</strong>'],
            ['<strong class="value label-value label-4" data-capture="9">$9</strong>', '<strong class="value label-value label-4" data-label="5">书信</strong>'],
            ['<strong class="value value-6 long-value" data-capture="10">$10</strong>', '<strong class="value value-6 long-value" data-capture="6">$6</strong>'],
            ['<strong class="value value-7 note-value" data-capture="11">$11</strong>', '<strong class="value value-7 note-value" data-capture="7">$7</strong>'],
            ['<strong class="value value-8 note-value" data-capture="12">$12</strong>', '<strong class="value value-8 note-value" data-capture="8">$8</strong>'],
        ];
        let replaceString = String(script.replaceString || '');
        replacements.forEach(([before, after]) => { replaceString = replaceString.replaceAll(before, after); });
        return {
            ...script,
            findRegex: '/<(?:qingshan_status|status_qingshan)>\\s*\\[(?:Affection|情愫)\\|(.*?)\\]\\s*\\[(?:Desire|欲念)\\|(.*?)\\]\\s*\\[(?:Attire|衣冠)\\|(.*?)\\]\\s*\\[(?:Location|身处)\\|(.*?)\\]\\s*\\[(?:InnerVoice|心语)\\|(.*?)\\]\\s*\\[(?:Letter|书信)\\|(.*?)\\]\\s*\\[(?:AffectionNote|情愫注)\\|(.*?)\\]\\s*\\[(?:DesireNote|欲念注)\\|(.*?)\\]\\s*<\\/(?:qingshan_status|status_qingshan)>/s',
            replaceString,
        };
    }
    return script;
}

const REFLOWING_BUNDLED_MOBILE_CSS = Object.freeze({
    'beauty-crimson-letter-01': `
@media(max-width:560px){
  .status-card{width:100%!important;height:auto!important;display:block!important;overflow:hidden}
  .portrait-wing{height:245px;border-right:0;border-bottom:6px double #a46e55}
  .portrait-mat{height:176px!important}.portrait-caption{bottom:18px!important}
  .record-wing{min-height:0;padding:30px 16px 24px;background:#f3e9df}
  .record-wing:before,.clock{display:none}
  .title-block{width:auto;padding-right:42px}.title-block h1{font-size:clamp(30px,10vw,40px)}
  .fields{grid-template-columns:1fr 1fr;grid-template-rows:auto;gap:10px;margin-top:20px}
  .fields :is(.meter,.ribbon,.paper,.note){position:relative;grid-column:auto;grid-row:auto;min-height:82px}
  .fields :is(.paper,.note){grid-column:1/-1}.note{display:block}.note strong{margin-top:6px}
  .fold{right:14px;top:16px;bottom:auto}
  .status-card.is-collapsed{height:96px!important;display:block!important}.status-card.is-collapsed .portrait-wing{display:none}.status-card.is-collapsed .record-wing{height:96px;padding:18px 56px 14px 16px}.status-card.is-collapsed .title-block{display:none}.status-card.is-collapsed .compact-summary{display:grid;position:static;gap:5px}.status-card.is-collapsed .fold{top:28px;bottom:auto}
}`,
    'beauty-burgundy-album-02': `
@media(max-width:560px){
  .burgundy-album{width:100%!important;height:auto!important;min-height:0}
  .album-shell{display:block;height:auto;border-width:6px}
  .album-spine{height:260px;padding:16px;border-right:0;border-bottom:6px double #2c0d12}
  .album-brand{padding-right:48px}.portrait-card{left:18px;top:88px;width:124px;padding:7px 7px 15px}.portrait-card img{height:132px}.classified-side{left:158px;right:18px;bottom:55px}.wax{left:auto;right:38px;bottom:5px;width:50px;height:50px;border-width:6px}
  .album-paper{display:block;padding:30px 14px 20px}
  .album-paper :is(.sheet,.itinerary,.mini-card){margin-top:12px;transform:none}
  .sheet{min-height:126px;padding:44px 16px 16px}.itinerary{padding:48px 0 0}.route-cards{grid-template-columns:1fr;height:auto}.route-cards article{min-height:112px;transform:none!important}.mini-card{min-height:94px}.paper-flower{display:none}
  .burgundy-album:not([open]){height:80px!important}.burgundy-album:not([open]) .album-shell{height:80px}.burgundy-album:not([open]) .album-spine{height:80px;border-bottom:0}.burgundy-album:not([open]) .album-brand{width:auto;padding:10px 54px 10px 10px}.burgundy-album:not([open]) .album-brand h1{font-size:20px}
}`,
    'beauty-current-status-05': `
@media(max-width:560px){
  .design-05{width:100%!important;height:auto!important;min-height:0}
  .design-05 .expanded-content{position:relative;inset:auto;padding:72px 14px 24px}
  .design-05 .status-heading{position:relative;top:auto;left:auto;width:auto}.design-05 .status-heading h1{font-size:clamp(28px,9vw,36px)}
  .design-05 .identity-card{position:relative;left:auto;top:auto;width:176px;margin:22px auto 14px;transform:none}
  .design-05 .status-board{position:relative;top:auto;right:auto;width:auto}.design-05 .affection{grid-template-columns:1fr}.design-05 .condition-grid,.design-05 .small-moments{grid-template-columns:1fr}.design-05 .single-collage{display:none}
}`,
    'beauty-card-status-06': `
@media(max-width:560px){
  .design-06{width:100%!important;height:auto!important;min-height:0}
  .design-06 .expanded-content{position:relative;inset:auto;padding:72px 14px 24px}
  .design-06 .table-heading{position:relative;top:auto;left:auto;width:auto}.design-06 .table-heading h1{font-size:clamp(28px,9vw,35px)}
  .design-06 .portrait-card{position:relative;left:auto;top:auto;width:184px;margin:22px auto 16px;transform:none}.design-06 .portrait-card .avatar,.design-06 .avatar-placeholder{width:158px;height:210px}
  .design-06 .card-table{position:relative;top:auto;left:auto;width:auto}.design-06 .table-moment{grid-template-columns:1fr 1fr}.design-06 .status-hand{height:auto;min-height:150px}.design-06 .attire{grid-template-columns:1fr}.design-06 .attire b{justify-self:start}
}`,
    'beauty-letter-status-07': `
@media(max-width:560px){
  .design-07{width:100%!important;height:auto!important;min-height:0}
  .design-07 .expanded-content{position:relative;inset:auto;padding:72px 14px 24px}
  .design-07 .post-heading{position:relative;top:auto;left:auto;width:auto}.design-07 .post-heading h1{font-size:clamp(28px,9vw,36px)}
  .design-07 .mail-scene{position:relative;left:auto;top:auto;width:auto;height:auto;margin-top:20px}.design-07 .envelope-back,.design-07 .postmark,.design-07 .postal-note{display:none}
  .design-07 .letter-sheet{position:relative;left:auto;top:auto;width:auto;height:auto;min-height:0;padding:18px;transform:none}.design-07 .route-strip{grid-template-columns:1fr;width:auto;border-radius:12px}.design-07 .letter-copy{width:auto;padding-top:210px}.design-07 .sender-stamp{right:50%;top:110px;width:124px;transform:translateX(50%) rotate(2deg)}.design-07 .sender-stamp .avatar{width:106px;height:148px}.design-07 .affection-seal{right:14px;top:18px;bottom:auto;width:70px;height:70px}
}`,
    'beauty-record-status-08': `
@media(max-width:560px){
  .design-08{width:100%!important;height:auto!important;min-height:0}
  .design-08 .expanded-content{position:relative;inset:auto;padding:72px 14px 24px}.design-08 .expanded-content:after{display:none}.design-08 .generated-backdrop{position:absolute;height:260px;opacity:.38}
  .design-08 .record-heading{position:relative;top:auto;left:auto;width:auto}.design-08 .record-heading h1{font-size:clamp(27px,8vw,35px)}
  .design-08 .generated-record-avatar{position:relative;left:auto;top:auto;width:118px;margin:22px auto}.design-08 .track-panel{position:relative;top:auto;right:auto;width:auto}.design-08 .track-meta{grid-template-columns:1fr 1fr}.design-08 .affection-player{grid-template-columns:1fr}.design-08 .track-list article{grid-template-columns:26px 76px minmax(0,1fr)}
}`,
    'beauty-archive-status-09': `
@media(max-width:560px){
  .design-09{width:100%!important;height:auto!important;min-height:0}
  .design-09 .expanded-content{position:relative;inset:auto;padding:72px 14px 24px}.design-09 .mirror-heading{position:relative;top:auto;left:auto;width:auto}.design-09 .mirror-heading h1{font-size:clamp(28px,9vw,35px)}
  .design-09 .portrait-side{position:relative;left:auto;top:auto;width:260px;height:360px;margin:16px auto}.design-09 .mirror-frame{width:244px;height:352px}.design-09 .archive-stage{position:relative;right:auto;top:auto;width:auto;height:auto}.design-09 .archive-stack{height:auto;min-height:328px;perspective:none}.design-09 .archive-card{display:none;position:relative;left:auto;top:auto;width:100%;height:auto;min-height:305px;margin:0;transform:none!important}.design-09 .archive-card[data-position="active"]{display:block}.design-09 .card-controls{grid-template-columns:76px minmax(0,1fr) 76px}.design-09 .card-tabs{min-width:0}
}`,
});

function bundledResponsiveLayoutStyles(structure) {
    const css = REFLOWING_BUNDLED_MOBILE_CSS[structure];
    return css ? `<style data-status-atelier-responsive-layout>${css}</style>` : '';
}

function addBundledMobileRuntime(structure, script) {
    const source = String(script?.replaceString || '');
    const sizingStyles = `<style>html,body{height:auto!important;min-height:0!important;overflow:hidden!important}</style>`;
    const overflowStyles = structure === 'beauty-burgundy-album-02' ? `<style>
.burgundy-album :is(.sheet p,.plans li,.route-cards h3,.route-cards p){overflow:hidden;overflow-wrap:anywhere;display:-webkit-box;-webkit-box-orient:vertical}
.burgundy-album .secret p{-webkit-line-clamp:3}
.burgundy-album .plans ol{gap:5px;margin-top:0}
.burgundy-album .plans li{padding-top:0!important;font-size:11px;line-height:1.35;-webkit-line-clamp:3}
.burgundy-album .route-cards h3{font-size:15px;line-height:1.25;-webkit-line-clamp:2}
.burgundy-album .route-cards p{font-size:10px;line-height:1.3;-webkit-line-clamp:2}
.burgundy-album .mood p{font-size:14px;line-height:1.35;-webkit-line-clamp:3}
</style>` : '';
    const fitRuntime = `<script>(function(){
if(window.frameElement&&window.frameElement.classList.contains('status-atelier-beauty-preview-frame'))return;
var card=Array.from(document.body.children).find(function(node){return /^(DETAILS|ARTICLE|SECTION|MAIN)$/.test(node.tagName)});if(!card)return;
card.style.setProperty('zoom','1','important');
var baseWidth=card.offsetWidth||900;
var dynamicTextSelector='[data-capture],[data-value]';var originalTextStyles=new WeakMap();
function syncAdaptiveText(){var nodes=Array.from(card.querySelectorAll(dynamicTextSelector));nodes.forEach(function(node){var state=originalTextStyles.get(node);if(!state){state={value:node.style.getPropertyValue('font-size'),priority:node.style.getPropertyPriority('font-size'),fontSize:parseFloat(getComputedStyle(node).fontSize)||0};originalTextStyles.set(node,state)}if(state.value)node.style.setProperty('font-size',state.value,state.priority);else node.style.removeProperty('font-size')});function overflows(node){var rect=node.getBoundingClientRect();if(node.scrollWidth>node.clientWidth+1||node.scrollHeight>node.clientHeight+1)return true;for(var parent=node.parentElement;parent&&parent!==card.parentElement;parent=parent.parentElement){var style=getComputedStyle(parent);var parentRect=parent.getBoundingClientRect();var clips=parent===card||/hidden|clip/.test((style.overflowX||'')+' '+(style.overflowY||''))||style.position==='absolute';if(clips&&(rect.right>parentRect.right-1||rect.bottom>parentRect.bottom-1))return true;if(parent===card)break}return false}nodes.forEach(function(node){var state=originalTextStyles.get(node);var textLength=Array.from(String(node.textContent||'').replace(/\s+/g,'')).length;if(!state||!state.fontSize||!textLength)return;var factor=textLength>48?0.56:textLength>32?0.64:textLength>20?0.74:textLength>12?0.86:1;var minimum=Math.min(state.fontSize,12);var target=Math.max(minimum,state.fontSize*factor);if(target<state.fontSize)node.style.setProperty('font-size',target+'px','important');for(var attempts=0;attempts<8&&target>minimum&&overflows(node);attempts++){target=Math.max(minimum,target*.92);node.style.setProperty('font-size',target+'px','important')}})}
function fit(){card.style.setProperty('zoom','1','important');card.style.setProperty('transform','none','important');var available=Math.max(1,document.documentElement.clientWidth||window.innerWidth||baseWidth);var scale=Math.min(1,available/baseWidth);card.style.setProperty('--sta-readable-font',(scale<1?Math.ceil(8/scale):8)+'px');syncAdaptiveText();var baseHeight=Math.max(card.offsetHeight||0,card.scrollHeight||0,1);var targetHeight=Math.ceil(baseHeight*scale);card.style.setProperty('position','absolute','important');card.style.setProperty('left','0','important');card.style.setProperty('top','0','important');card.style.setProperty('transform','scale('+scale+')','important');card.style.setProperty('transform-origin','top left','important');card.style.margin='0';document.documentElement.style.setProperty('background','transparent','important');document.documentElement.style.height=targetHeight+'px';document.documentElement.style.minHeight='0';document.documentElement.style.overflow='hidden';document.body.style.setProperty('display','block','important');document.body.style.setProperty('place-items','initial','important');document.body.style.setProperty('background','transparent','important');document.body.style.setProperty('margin','0','important');document.body.style.setProperty('padding','0','important');document.body.style.width='100%';document.body.style.minHeight='0';document.body.style.height=targetHeight+'px';document.body.style.overflow='hidden';var frame=window.frameElement;if(frame){frame.style.height=targetHeight+'px';frame.style.minHeight='0';frame.style.maxHeight='none'}}
requestAnimationFrame(fit);window.addEventListener('resize',fit);card.addEventListener('toggle',function(){requestAnimationFrame(fit)});if(window.ResizeObserver)new ResizeObserver(function(){requestAnimationFrame(fit)}).observe(card);
})();</script>`;
    const additions = `${sizingStyles}${bundledResponsiveLayoutStyles(structure)}${overflowStyles}${fitRuntime}`;
    return {
        ...script,
        replaceString: source.includes('</body>') ? source.replace('</body>', `${additions}</body>`) : `${source}${additions}`,
    };
}

export async function loadStatusBeautyBundledRegex(structure) {
    const meta = statusBeautyBundleMeta(structure);
    if (!meta) throw new Error('当前模板没有对应的原始正则成品');
    if (!cache.has(structure)) {
        cache.set(structure, fetch(new URL(meta.file, BUNDLE_ROOT)).then(response => {
            if (!response.ok) throw new Error(`无法读取原始正则成品：${response.status}`);
            return response.json();
        }).then(script => addBundledMobileRuntime(structure, adaptBundledRegex(structure, script))));
    }
    return cache.get(structure);
}

function fieldPlaceholder(field, pageLabel) {
    return `{{${pageLabel}·${field?.label || '状态'}：${field?.instruction || '根据当前剧情动态填写'}}}`;
}

export function buildStatusBeautyBundledInstruction(rule) {
    const meta = statusBeautyBundleMeta(rule?.structure);
    if (!meta) return '';
    const page = rule.pages?.[0];
    const fields = page?.fields || rule.pageFields || [];
    const pageLabel = page?.label || '当前角色';
    const outputLines = meta.lines.map(([key, indexes]) => `[${key}|${indexes.map(index => fieldPlaceholder(fields[index], pageLabel)).join('|')}]`);
    const fieldGuide = fields.map((field, index) => `- 第${index + 1}项“${field.label}”：${field.instruction}`).join('\n');
    return [
        `<${meta.tag}_rules>`,
        `每次正文结束后，必须追加一个 <${meta.tag}> 状态区块。`,
        '所有值必须根据当前剧情动态生成；模板中的双花括号只是填写说明，回复时不得原样保留。',
        '方括号内严格使用英文竖线分隔；值中不得出现英文竖线、方括号、尖括号或 Markdown 加粗。',
        '不要输出 HTML，不要把状态区块放入 Markdown 代码块，不要遗漏或改变字段顺序。',
        '',
        '动态字段说明：',
        fieldGuide,
        '',
        '严格输出模板：',
        `<${meta.tag}>`,
        ...outputLines,
        `</${meta.tag}>`,
        `</${meta.tag}_rules>`,
    ].join('\n');
}

export function parseStatusBeautyBundledOutput(rule, rawOutput) {
    const meta = statusBeautyBundleMeta(rule?.structure);
    if (!meta) return null;
    const source = String(rawOutput || '');
    const block = source.match(new RegExp(`<${meta.tag}>\\s*([\\s\\S]*?)\\s*<\\/${meta.tag}>`, 'i'))?.[1] || source;
    const records = {};
    for (const match of block.matchAll(/[\[【]([^\]】\r\n]+)[\]】]/g)) {
        const parts = match[1].replace(/｜/g, '|').split('|').map(value => value.trim());
        const key = parts.shift();
        if (key) records[key] = parts;
    }
    const values = [];
    const missing = [];
    for (const [key, indexes] of meta.lines) {
        const record = records[key] || [];
        if (record.length < indexes.length) missing.push(key);
        indexes.forEach((index, valueIndex) => { values[index] = record[valueIndex] || ''; });
    }
    if (missing.length) throw new Error(`AI 状态区块缺少完整记录：${missing.join('、')}`);
    return { rule, shared: [], pages: [{ page: rule.pages[0], values }], raw: source };
}

export function buildStatusBeautyBundledPreviewDocument(regexScript, generatedValues = []) {
    let html = String(applyStatusBeautyControlChrome(regexScript)?.replaceString || '').trim();
    html = html.replace(/^```html\s*/i, '').replace(/\s*```$/, '');
    const values = JSON.stringify(generatedValues.map(value => String(value || ''))).replace(/</g, '\\u003c');
    const previewPatch = `<script>(function(){var values=${values};var root=document.body;if(!root)return;var valueFor=function(index){return values[index-1]||'X';};var pending=[];var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(walker.nextNode()){var node=walker.currentNode;var parent=node.parentElement;if(!parent||parent.closest('script,style,[data-capture]'))continue;if(/\\$\\d{1,2}/.test(node.nodeValue||''))pending.push(node);}pending.forEach(function(node){var parts=(node.nodeValue||'').split(/(\\$\\d{1,2})/g);var fragment=document.createDocumentFragment();parts.forEach(function(part){var match=part.match(/^\\$(\\d{1,2})$/);if(match){var span=document.createElement('span');span.dataset.capture=match[1];span.textContent=valueFor(Number(match[1]));fragment.appendChild(span);}else if(part){fragment.appendChild(document.createTextNode(part));}});node.replaceWith(fragment);});root.querySelectorAll('[data-capture]').forEach(function(node){node.textContent=valueFor(Number(node.dataset.capture));});root.querySelectorAll('*').forEach(function(node){Array.from(node.attributes||[]).forEach(function(attribute){if(/\\$\\d{1,2}/.test(attribute.value))node.setAttribute(attribute.name,attribute.value.replace(/\\$(\\d{1,2})/g,function(_,index){return valueFor(Number(index));}));});});})();</script>`;
    const adaptivePreviewPatch = `<script data-status-atelier-adaptive-preview>(function(){function fit(){var nodes=Array.from(document.querySelectorAll('.sta-dossier-mobile [data-capture]'));nodes.forEach(function(node){var base=Number(node.dataset.staBaseFontSize);if(!base){node.style.removeProperty('font-size');base=parseFloat(getComputedStyle(node).fontSize)||0;if(base)node.dataset.staBaseFontSize=String(base)}else node.style.removeProperty('font-size');var textLength=Array.from(String(node.textContent||'').replace(/\\s+/g,'')).length;if(!base||!textLength)return;var factor=textLength>48?.56:textLength>32?.64:textLength>20?.74:textLength>12?.86:1;var minimum=Math.min(base,12);var target=Math.max(minimum,base*factor);if(target<base)node.style.setProperty('font-size',target+'px','important');for(var attempts=0;attempts<8&&target>minimum&&(node.scrollWidth>node.clientWidth+1||node.scrollHeight>node.clientHeight+1);attempts++){target=Math.max(minimum,target*.92);node.style.setProperty('font-size',target+'px','important')}})}requestAnimationFrame(fit);window.addEventListener('resize',fit);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);})();</script>`;
    return /<\/body>/i.test(html)
        ? html.replace(/<\/body>/i, `${previewPatch}${adaptivePreviewPatch}</body>`)
        : `${html}${previewPatch}${adaptivePreviewPatch}`;
}

function annotateLayoutCaptures(source) {
    return String(source || '').replace(
        /<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<[^>]+>|\$(\d{1,2})/gi,
        (match, capture) => capture
            ? `<span class="sta-layout-capture" data-capture="${capture}">${match}</span>`
            : match,
    );
}

export function applyStatusBeautyFieldLayout(regexScript, rule) {
    const defaults = BUNDLED_DEFAULT_FIELDS.get(rule?.structure) || [];
    const page = rule?.pages?.[0];
    const fields = page?.fields || rule?.pageFields || [];
    const slots = defaults.map((fallback, index) => {
        const field = fields[index] || {};
        return {
            slot: index + 1,
            id: String(field.id || fallback?.[3] || `field_${index + 1}`),
            label: String(field.label || fallback?.[0] || `字段${index + 1}`).slice(0, 30),
        };
    });
    const changed = slots.some((slot, index) => (
        slot.id !== String(defaults[index]?.[3] || '')
        || slot.label !== String(defaults[index]?.[0] || '')
    ));
    if (!changed) return regexScript;

    const payload = JSON.stringify(slots).replace(/</g, '\\u003c');
    const patch = `<style>.sta-layout-capture{display:contents}</style><script>(function(){var slots=${payload};var root=document.querySelector('.status-card')||Array.from(document.body.children).find(function(node){return node.matches&&node.matches('details,section,article,main,div');})||document.body;if(!root)return;var captures=Array.from(root.querySelectorAll('.sta-layout-capture'));captures.forEach(function(node){var slot=slots[Number(node.dataset.capture)-1];if(!slot)return;node.dataset.staFieldId=slot.id;node.dataset.staFieldSlot=String(slot.slot);node.setAttribute('aria-label',slot.label);if(node.closest('.compact-summary'))return;var branch=node.parentElement;for(var depth=0;branch&&branch!==root&&depth<4;depth+=1,branch=branch.parentElement){var peers=Array.from(branch.querySelectorAll('.sta-layout-capture'));if(!peers.length||peers[0]!==node)continue;var labels=Array.from(branch.querySelectorAll('[data-label],label,.label,.field-label,.status-label,h2,h3,h4,span')).filter(function(candidate){var text=(candidate.textContent||'').trim();return text&&text.length<=24&&!candidate.closest('button')&&!candidate.matches('.sta-layout-capture,[data-capture]')&&!candidate.querySelector('.sta-layout-capture,[data-capture]');});if(labels.length){labels[0].textContent=slot.label;branch.dataset.staFieldId=slot.id;branch.dataset.staFieldSlot=String(slot.slot);break;}}});})();</script>`;
    const replacement = annotateLayoutCaptures(regexScript?.replaceString);
    return {
        ...regexScript,
        replaceString: /<\/body>/i.test(replacement)
            ? replacement.replace(/<\/body>/i, `${patch}</body>`)
            : `${replacement}${patch}`,
    };
}

export function applyStatusBeautyTitle(regexScript, rule) {
    const defaultTitle = String(BUNDLED_DEFAULT_TITLES.get(rule?.structure) || '').trim();
    const title = String(rule?.title || '').trim().slice(0, 40);
    if (!defaultTitle || !title || title === defaultTitle) return regexScript;
    const payload = JSON.stringify({ defaultTitle, title }).replace(/</g, '\\u003c');
    const patch = `<script>(function(){var heading=${payload};document.title=heading.title;var nodes=Array.from(document.querySelectorAll('[data-design-title],h1,h2,h3,h4,h5,h6,.compact>strong,.compact-summary>strong'));var target=nodes.find(function(node){return (node.textContent||'').trim()===heading.defaultTitle;});if(target)target.textContent=heading.title;})();</script>`;
    const replacement = String(regexScript?.replaceString || '');
    return {
        ...regexScript,
        replaceString: /<\/body>/i.test(replacement)
            ? replacement.replace(/<\/body>/i, `${patch}</body>`)
            : `${replacement}${patch}`,
    };
}

export function applyStatusBeautyMobileLayout(regexScript, rule) {
    if (rule?.structure === 'beauty-dossier-04') {
        const marker = 'data-status-atelier-dossier-mobile';
        const replacement = String(regexScript?.replaceString || '');
        if (!replacement || replacement.includes(marker)) return regexScript;
        const defaults = BUNDLED_DEFAULT_FIELDS.get(rule.structure) || [];
        const fields = rule?.pages?.[0]?.fields || rule?.pageFields || [];
        const escapeHtml = value => String(value || '').replace(/[&<>"']/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        })[character]);
        const label = index => escapeHtml(fields[index]?.label || defaults[index]?.[0] || `字段${index + 1}`);
        const title = escapeHtml(rule?.title || BUNDLED_DEFAULT_TITLES.get(rule.structure) || '人物剪报卷宗');
        const fontStyle = '<style data-status-atelier-dossier-font>@font-face{font-family:"STA Huiwen Mincho";src:url("https://raw.githubusercontent.com/jiuyi777/sillytavern-theme-assets/main/font-library/v2/fonts/huiwenmincho-improved/HuiwenMincho-Improved-Regular.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap}@media(max-width:700px){.design-04-page .sta-dossier-mobile{font-family:"STA Huiwen Mincho","Huiwen-mincho",serif!important}.design-04-page .sta-dossier-mobile h1,.design-04-page .sta-dossier-mobile [data-sta-typography-label],.design-04-page .sta-dossier-mobile [data-sta-typography-value]{font-family:"STA Huiwen Mincho","Huiwen-mincho",serif!important;font-weight:400!important;letter-spacing:.02em!important}}</style>';
        const mobile = `<section class="sta-dossier-mobile" ${marker} aria-label="人物剪报卷宗手机布局"><header class="sta-dossier-mobile-head"><div><small>STATUS ATELIER · ARCHIVE 04</small><h1 data-design-title>${title}</h1><p>PERSONAL CLIPPING DOSSIER</p></div><b aria-hidden="true">04</b></header><div class="sta-dossier-mobile-meta"><article><span>${label(0)}</span><strong data-capture="1">$1</strong></article><article><span>${label(1)}</span><strong data-capture="2">$2</strong></article></div><div class="sta-dossier-mobile-rules"><article class="is-recommended"><span>${label(2)}</span><p data-capture="3">$3</p></article><article class="is-avoid"><span>${label(3)}</span><p data-capture="4">$4</p></article></div><article class="sta-dossier-mobile-broadcast"><span>${label(4)}</span><p data-capture="5">$5</p></article><div class="sta-dossier-mobile-story"><article class="sta-dossier-mobile-chapter"><span>${label(5)}</span><p data-capture="6">$6</p></article><article class="sta-dossier-mobile-voice"><span>${label(6)}</span><p data-capture="7">$7</p></article></div><footer class="sta-dossier-mobile-foot"><div><small>OMIKUJI / CURRENT SIGN</small><span>${label(7)}</span></div><strong data-capture="8">$8</strong><i aria-hidden="true">九一</i></footer></section>`;
        const style = `<style ${marker}>.sta-dossier-mobile{display:none}@media(max-width:700px){html,body{min-height:0!important;background:transparent!important}.design-page{display:block!important;padding:0!important;background:transparent!important}.dossier-art{width:100%!important;height:auto!important;overflow:hidden!important;border:1px solid #223b51!important;border-radius:18px!important;background:#efe3cf!important;box-shadow:0 10px 28px rgba(12,28,43,.22)!important}.dossier-art[open]>.art-stage{display:none!important}.dossier-art[open]>.sta-dossier-mobile{display:block!important}.dossier-art>summary{right:11px!important;top:11px!important;width:30px!important;height:30px!important;color:#f8ead5!important;background:#1d3b55!important;border-color:#f8ead599!important}.sta-dossier-mobile{position:relative;isolation:isolate;padding:14px;color:#183047;background:linear-gradient(105deg,rgba(24,48,71,.045) 1px,transparent 1px) 0 0/18px 18px,linear-gradient(165deg,#f7efdf 0%,#e9dbc2 62%,#f6ead6 100%);font:400 clamp(14px,3.85vw,17px)/1.55 "Noto Serif SC","Source Han Serif SC","Songti SC","STSong","SimSun",serif}.sta-dossier-mobile:before,.sta-dossier-mobile:after{content:"";position:absolute;z-index:-1;pointer-events:none}.sta-dossier-mobile:before{right:-25px;top:98px;width:116px;height:116px;border:18px solid rgba(225,91,28,.12);border-radius:50%}.sta-dossier-mobile:after{left:-38px;bottom:92px;width:150px;height:48px;background:rgba(24,57,82,.08);transform:rotate(-9deg)}.sta-dossier-mobile-head{display:grid;grid-template-columns:minmax(0,1fr) 58px;gap:10px;align-items:start;padding:4px 38px 12px 4px;border-bottom:5px solid #17364f}.sta-dossier-mobile-head small,.sta-dossier-mobile-head p{display:block;margin:0;color:#bd4d22;font:700 clamp(9px,2.7vw,11px)/1.25 Georgia,serif;letter-spacing:.14em}.sta-dossier-mobile-head h1{margin:4px 0 2px;color:#17364f;font:800 clamp(27px,8vw,37px)/1.05 "Noto Serif SC","Source Han Serif SC","Songti SC","STSong","SimSun",serif;letter-spacing:.035em}.sta-dossier-mobile-head>b{display:grid;width:54px;height:54px;place-items:center;margin-top:4px;border-radius:50%;color:#f8ead7;background:#df5c20;box-shadow:inset 0 0 0 4px #f8ead7,inset 0 0 0 6px #df5c20;font:800 22px/1 Georgia,serif;transform:rotate(7deg)}.sta-dossier-mobile-meta,.sta-dossier-mobile-rules{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:10px}.sta-dossier-mobile-meta article{min-width:0;padding:10px 11px;border:1px solid rgba(24,54,79,.35);border-top:4px solid #17364f;background:rgba(255,250,240,.7)}.sta-dossier-mobile span{display:block;color:#b54920;font-size:.78em;font-weight:700;letter-spacing:.11em}.sta-dossier-mobile-meta strong{display:block;margin-top:4px;color:#17364f;font-size:1.08em;font-weight:650;line-height:1.35;white-space:normal;overflow-wrap:anywhere}.design-04-page .sta-dossier-mobile [data-sta-typography-value]{font-family:"Noto Serif SC","Source Han Serif SC","Songti SC","STSong","SimSun",serif!important;font-weight:500!important;letter-spacing:.015em!important}.sta-dossier-mobile-rules article{position:relative;min-width:0;min-height:86px;padding:11px 12px 10px 14px;border-radius:3px;background:#183a55;color:#fff7e8;box-shadow:4px 4px 0 rgba(225,91,28,.25)}.sta-dossier-mobile-rules .is-avoid{background:#d85a25}.sta-dossier-mobile-rules span{color:#ffd9ae}.sta-dossier-mobile p{margin:5px 0 0;white-space:normal;overflow-wrap:anywhere}.sta-dossier-mobile-rules p{font-size:1.02em;font-weight:600;line-height:1.45}.sta-dossier-mobile-broadcast{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px;align-items:center;margin-top:10px;padding:10px 12px;border-block:2px solid #d65b27;background:rgba(255,249,237,.74)}.sta-dossier-mobile-broadcast span{padding:4px 7px;color:#fff4df;background:#d65b27}.sta-dossier-mobile-broadcast p{margin:0;color:#17364f;font-weight:650;line-height:1.45}.sta-dossier-mobile-story{display:grid;grid-template-columns:minmax(0,.86fr) minmax(0,1.45fr);gap:9px;margin-top:10px}.sta-dossier-mobile-story article{min-width:0;padding:11px 12px;border:1px solid rgba(24,54,79,.3);background:rgba(255,251,242,.72)}.sta-dossier-mobile-chapter{border-left:5px solid #d65b27!important}.sta-dossier-mobile-voice{background:linear-gradient(145deg,rgba(255,251,242,.9),rgba(231,214,187,.78))!important}.sta-dossier-mobile-story p{color:#20394e;line-height:1.5}.sta-dossier-mobile-foot{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.35fr) 48px;gap:8px;align-items:center;margin-top:10px;padding:10px 10px 10px 12px;border:2px solid #17364f;background:#f8edd9}.sta-dossier-mobile-foot small{color:#775d45;font:700 8px/1.2 Georgia,serif;letter-spacing:.09em}.sta-dossier-mobile-foot strong{display:block;color:#a43e20;font-family:"Noto Serif SC","Source Han Serif SC","Songti SC","STSong","SimSun",serif;font-size:1em;font-weight:700;line-height:1.4;text-align:center;overflow-wrap:anywhere}.sta-dossier-mobile-foot i{display:grid;width:44px;height:44px;place-items:center;border:2px solid #a23f31;color:#95352b;background:rgba(244,219,187,.72);font:700 13px/1 serif;transform:rotate(-5deg)}}@media(max-width:390px){.sta-dossier-mobile{padding:11px}.sta-dossier-mobile-head{grid-template-columns:minmax(0,1fr) 50px;padding-right:35px}.sta-dossier-mobile-head>b{width:48px;height:48px}.sta-dossier-mobile-meta,.sta-dossier-mobile-rules,.sta-dossier-mobile-story{gap:7px}.sta-dossier-mobile-meta article,.sta-dossier-mobile-story article{padding:9px 10px}.sta-dossier-mobile-rules article{min-height:80px;padding:9px 10px}.sta-dossier-mobile-foot{grid-template-columns:minmax(0,.85fr) minmax(0,1.45fr) 42px;padding:8px}.sta-dossier-mobile-foot i{width:38px;height:38px}}</style>`;
        let next = replacement.replace('<div class="compact">', `${mobile}<div class="compact">`);
        next = /<\/head>/i.test(next) ? next.replace(/<\/head>/i, `${style}${fontStyle}</head>`) : `${style}${fontStyle}${next}`;
        return { ...regexScript, replaceString: next };
    }
    if (rule?.structure !== 'beauty-flower-echo-10') return regexScript;
    const marker = 'data-status-atelier-flower-mobile';
    const replacement = String(regexScript?.replaceString || '');
    if (!replacement || replacement.includes(marker)) return regexScript;
    const mobile = `<section class="sta-flower-mobile" ${marker} aria-label="花冠回声簿手机布局"><header class="sta-flower-mobile-hero"><div class="sta-flower-mobile-avatar avatar"><img alt="角色头像"></div><div><small>FLOWER CROWN ECHO</small><strong>花冠回声簿</strong><span>人物此刻的情绪、衣冠与回声</span></div></header><div class="sta-flower-mobile-meters"><article><span>情愫</span><strong>$1</strong></article><article><span>欲念</span><strong>$2</strong></article></div><article class="sta-flower-mobile-card sta-flower-mobile-attire"><span>衣冠</span><p>$3</p></article><div class="sta-flower-mobile-stack"><article class="sta-flower-mobile-card"><span>身处</span><p>$4</p></article><article class="sta-flower-mobile-card"><span>心语</span><p>$5</p></article><article class="sta-flower-mobile-card sta-flower-mobile-letter"><span>书信</span><p>$6</p></article></div><details class="sta-flower-mobile-more"><summary>展开更多状态</summary><div><article><span>双手</span><p>$7</p></article><article><span>腹部</span><p>$8</p></article><article><span>身体</span><p>$9</p></article><article><span>思绪</span><p>$10</p></article><article><span>计划</span><p>$11</p></article><article><span>目的地一</span><p>$12</p></article><article><span>目的地二</span><p>$13</p></article><article><span>目的地三</span><p>$14</p></article><article><span>秘密</span><p>$15</p></article></div></details><footer><i>❦</i><i>✿</i><b>九一</b><i>❧</i><i>✦</i></footer></section>`;
    const style = `<style ${marker}>.sta-flower-mobile{display:none}@media(max-width:700px){html,body{min-height:0!important;background:transparent!important}body{display:block!important;overflow:visible!important}.status{width:100%!important;min-height:0!important;aspect-ratio:auto!important;background:transparent!important;border:0!important;filter:none!important}.status[open]>.canvas{display:none!important}.status[open]>.sta-flower-mobile{display:block}.status>summary[aria-label="展开或收起状态栏"]{right:12px!important;top:12px!important}.sta-flower-mobile{position:relative;overflow:hidden;padding:14px;color:#433925;background:linear-gradient(145deg,#f6eddc 0%,#e9dcc3 55%,#f8f0df 100%);border:1px solid #ad956a;border-radius:18px;box-shadow:0 10px 28px rgba(69,52,29,.18);font:400 clamp(13px,3.6vw,16px)/1.65 "Noto Serif SC","Songti SC",serif}.sta-flower-mobile:before,.sta-flower-mobile:after{position:absolute;z-index:0;color:#94794d;opacity:.18;font:64px/1 Georgia,serif;pointer-events:none}.sta-flower-mobile:before{content:"❦";left:-12px;top:118px;transform:rotate(-24deg)}.sta-flower-mobile:after{content:"❧";right:-11px;bottom:72px;transform:rotate(20deg)}.sta-flower-mobile>*{position:relative;z-index:1}.sta-flower-mobile-hero{display:grid;grid-template-columns:minmax(96px,34%) 1fr;gap:13px;align-items:end;margin:-14px -14px 14px;padding:14px 48px 14px 14px;background:linear-gradient(180deg,rgba(71,91,60,.14),rgba(255,255,255,.28));border-bottom:1px solid rgba(125,99,55,.25)}.sta-flower-mobile-avatar.avatar{position:relative!important;inset:auto!important;width:100%!important;height:clamp(150px,47vw,220px)!important;overflow:hidden;border:1px solid #9c8053;border-radius:70px 70px 14px 14px;background:#ded4bd;box-shadow:inset 0 0 0 5px rgba(255,250,236,.62)}.sta-flower-mobile-avatar img{width:100%;height:100%;display:block;object-fit:cover;object-position:center 18%}.sta-flower-mobile-hero small,.sta-flower-mobile-hero span{display:block;color:#74664d;font-size:clamp(10px,2.8vw,12px);letter-spacing:.08em}.sta-flower-mobile-hero strong{display:block;margin:.25em 0;font-size:clamp(22px,6.3vw,30px);font-weight:650;line-height:1.25;letter-spacing:.12em}.sta-flower-mobile-meters{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:10px}.sta-flower-mobile-meters article{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:8px;min-height:78px;padding:10px 12px;border:1px solid rgba(139,108,61,.38);border-radius:16px;background:rgba(255,250,238,.66)}.sta-flower-mobile-meters span,.sta-flower-mobile-card>span,.sta-flower-mobile-more article>span{color:#755f3b;font-size:.82em;letter-spacing:.15em}.sta-flower-mobile-meters strong{justify-self:end;max-width:100%;font:600 clamp(24px,8vw,40px)/1 Georgia,serif;overflow-wrap:anywhere}.sta-flower-mobile-card{margin:0 0 10px;padding:13px 14px;border:1px solid rgba(139,108,61,.32);border-radius:14px;background:rgba(255,252,244,.7)}.sta-flower-mobile-card p,.sta-flower-mobile-more p{margin:.35em 0 0;white-space:normal;word-break:normal;overflow-wrap:anywhere}.sta-flower-mobile-attire{border-left:4px solid #8f6a46}.sta-flower-mobile-stack{display:grid;gap:10px}.sta-flower-mobile-stack .sta-flower-mobile-card{margin:0}.sta-flower-mobile-letter{background:linear-gradient(135deg,rgba(255,251,241,.84),rgba(231,213,178,.72));box-shadow:inset 0 0 0 3px rgba(255,255,255,.38)}.sta-flower-mobile-more{margin-top:12px;border:1px solid rgba(139,108,61,.38);border-radius:14px;background:rgba(238,224,196,.7)}.sta-flower-mobile-more>summary{padding:13px 14px;cursor:pointer;list-style:none;color:#58472d;font-weight:600;letter-spacing:.1em}.sta-flower-mobile-more>summary:after{content:"＋";float:right}.sta-flower-mobile-more[open]>summary:after{content:"－"}.sta-flower-mobile-more>div{display:grid;gap:8px;padding:0 10px 10px}.sta-flower-mobile-more article{padding:10px 11px;border-radius:10px;background:rgba(255,252,245,.72)}.sta-flower-mobile footer{display:flex;align-items:center;justify-content:space-between;padding:14px 5px 1px;color:#8e754b}.sta-flower-mobile footer b{display:grid;width:34px;height:34px;place-items:center;border:1px solid #974d3e;border-radius:4px;color:#8c4035;background:#f2dfc4;font:500 12px/1 serif;transform:rotate(-4deg)}}@media(max-width:390px){.sta-flower-mobile{padding:11px;border-radius:14px}.sta-flower-mobile-hero{grid-template-columns:104px 1fr;margin:-11px -11px 11px;padding:11px 44px 11px 11px}.sta-flower-mobile-meters article{grid-template-columns:1fr;gap:2px}.sta-flower-mobile-meters strong{justify-self:start}.sta-flower-mobile-card{padding:11px 12px}}</style>`;
    let next = replacement.replace('<div class="compact">', `${mobile}<div class="compact">`);
    next = /<\/head>/i.test(next) ? next.replace(/<\/head>/i, `${style}</head>`) : `${style}${next}`;
    return { ...regexScript, replaceString: next };
}

export function applyStatusBeautyMobileTypography(regexScript, rule) {
    const marker = 'data-status-atelier-mobile-typography';
    const replacement = String(regexScript?.replaceString || '');
    if (!replacement || replacement.includes(marker)) return regexScript;
    const page = rule?.pages?.[0];
    const fields = page?.fields || rule?.pageFields || [];
    const kinds = fields.map(field => String(field?.kind || 'text'));
    const payload = JSON.stringify(kinds).replace(/</g, '\\u003c');
    const annotated = /data-capture\s*=/i.test(replacement) ? replacement : annotateLayoutCaptures(replacement);
    const style = `<style ${marker}>@media(max-width:700px){[data-sta-typography-label]{font-size:clamp(12px,3.4vw,14px)!important;font-weight:600!important;line-height:1.45!important;letter-spacing:.06em!important}[data-sta-typography-value][data-sta-kind="text"],[data-sta-typography-value][data-sta-kind="long"]{font-family:"Noto Sans SC","Microsoft YaHei",sans-serif!important;font-size:clamp(15px,4.5vw,18px)!important;font-weight:400!important;line-height:1.65!important;letter-spacing:0!important;white-space:normal!important;overflow-wrap:anywhere!important}[data-sta-typography-value][data-sta-kind="progress"]{font-weight:600!important}}</style>`;
    const runtime = `<script>(function(){var kinds=${payload};var root=document.querySelector('.status-card')||Array.from(document.body.children).find(function(node){return node.matches&&node.matches('details,section,article,main,div');})||document.body;if(!root)return;Array.from(root.querySelectorAll('[data-capture]')).forEach(function(node){if(node.closest('.compact-summary'))return;var kind=kinds[Number(node.dataset.capture)-1]||'text';node.setAttribute('data-sta-typography-value','');node.setAttribute('data-sta-kind',kind);for(var branch=node.parentElement,depth=0;branch&&branch!==root&&depth<4;branch=branch.parentElement,depth+=1){var peers=Array.from(branch.querySelectorAll('[data-capture]'));if(!peers.length||peers[0]!==node)continue;var labels=Array.from(branch.querySelectorAll('[data-label],label,.label,.field-label,.status-label,h2,h3,h4,span,small,b,em')).filter(function(candidate){var text=(candidate.textContent||'').trim();return text&&text.length<=24&&!candidate.closest('button')&&!candidate.matches('[data-capture],[data-value],[data-design-title]')&&!candidate.querySelector('[data-capture],[data-value]');});if(labels.length){labels[0].setAttribute('data-sta-typography-label','');break;}}});})();</script>`;
    let next = /<\/head>/i.test(annotated) ? annotated.replace(/<\/head>/i, `${style}</head>`) : `${style}${annotated}`;
    next = /<\/body>/i.test(next) ? next.replace(/<\/body>/i, `${runtime}</body>`) : `${next}${runtime}`;
    return { ...regexScript, replaceString: next };
}

export function applyStatusBeautyTextOverrides(regexScript, overrides = {}) {
    const entries = Object.entries(overrides || {}).filter(([, value]) => String(value || '').trim());
    if (!entries.length) return regexScript;
    const payload = JSON.stringify(Object.fromEntries(entries)).replace(/</g, '\\u003c');
    const patch = `<script>(function(){var edits=${payload};var root=document.querySelector('.status-card')||Array.from(document.body.children).find(function(node){return node.matches&&node.matches('details,section,article,main,div');})||document.body.firstElementChild;if(!root)return;var nodes=Array.from(root.querySelectorAll('h1,h2,h3,h4,h5,h6,span,strong,small,em,b,p,label,figcaption,dt,dd,li')).filter(function(node){var text=(node.textContent||'').trim();return text&&text.length<=80&&/[A-Za-z0-9\\u3400-\\u9fff]/.test(text)&&!node.closest('button')&&!node.matches('[data-capture],[data-value],[data-label],[data-design-title]')&&!node.querySelector('[data-capture],[data-value],[data-label]')&&node.children.length===0;});Object.keys(edits).forEach(function(key){var node=nodes[Number(key)];if(node)node.textContent=edits[key];});})();</script>`;
    const replacement = String(regexScript?.replaceString || '');
    return {
        ...regexScript,
        replaceString: /<\/body>/i.test(replacement)
            ? replacement.replace(/<\/body>/i, `${patch}</body>`)
            : `${replacement}${patch}`,
    };
}

export function applyStatusBeautyControlChrome(regexScript) {
    const marker = 'data-status-atelier-control-chrome';
    const replacement = String(regexScript?.replaceString || '');
    if (!replacement || replacement.includes(marker)) return regexScript;
    const patch = `<style ${marker}>details>summary[aria-label="展开或收起状态栏"]{right:8px!important;top:8px!important;display:grid!important;width:28px!important;height:24px!important;min-width:28px!important;min-height:24px!important;place-items:center!important;padding:0!important;border:1px solid rgba(255,255,255,.7)!important;border-radius:7px!important;color:#fff!important;background:rgba(39,37,34,.58)!important;box-shadow:0 2px 7px rgba(0,0,0,.18)!important;backdrop-filter:blur(6px);opacity:.72;overflow:hidden;font-size:0!important;line-height:1!important}details>summary[aria-label="展开或收起状态栏"]:hover,details>summary[aria-label="展开或收起状态栏"]:focus-visible{opacity:1}details>summary[aria-label="展开或收起状态栏"]:before{content:attr(data-collapsed-label);display:none;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:600 var(--sta-readable-font,14px)/1.3 "Microsoft YaHei",sans-serif;letter-spacing:.04em}details>summary[aria-label="展开或收起状态栏"]:after{content:"⌃"!important;display:block!important;color:inherit!important;font:700 15px/1 Arial,sans-serif!important;transform:translateY(2px)!important}details:not([open])>summary[aria-label="展开或收起状态栏"]{position:relative!important;inset:auto!important;display:flex!important;justify-content:space-between!important;width:calc(100% - 16px)!important;height:56px!important;min-width:0!important;min-height:56px!important;margin:8px!important;padding:0 15px!important;border-color:rgba(255,255,255,.5)!important;border-radius:12px!important;background:linear-gradient(110deg,rgba(39,50,76,.96),rgba(103,96,119,.96))!important;opacity:1}details:not([open])>summary[aria-label="展开或收起状态栏"]:before{display:block}details:not([open])>summary[aria-label="展开或收起状态栏"]:after{content:"⌄"!important;flex:0 0 auto;transform:translateY(-1px)!important}</style>`;
    const labelPatch = `<script>(function(){function setup(){var summary=document.querySelector('details>summary[aria-label="展开或收起状态栏"]');if(!summary)return;var heading=document.querySelector('[data-design-title],h1,h2,h3,h4');var title=(heading&&heading.textContent||document.title||'状态栏').trim();summary.setAttribute('data-collapsed-label',title+' 已收起 · 点击展开');}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();})();</script>`;
    const withStyle = /<\/head>/i.test(replacement)
        ? replacement.replace(/<\/head>/i, `${patch}</head>`)
        : `${patch}${replacement}`;
    return {
        ...regexScript,
        replaceString: /<\/body>/i.test(withStyle)
            ? withStyle.replace(/<\/body>/i, `${labelPatch}</body>`)
            : `${withStyle}${labelPatch}`,
    };
}

export function applyStatusBeautyMediaSettings(regexScript, media = {}) {
    const payload = JSON.stringify({
        avatarSource: ['none', 'character', 'user', 'url'].includes(media.avatarSource) ? media.avatarSource : 'character',
        avatarUrl: String(media.avatarUrl || ''),
        avatarFallbackUrl: String(media.avatarFallbackUrl || ''),
        imageAlt: String(media.imageAlt || '当前角色头像').slice(0, 80),
    }).replace(/</g, '\\u003c');
    const patch = `<script>(function(){var media=${payload};var root=document.querySelector('.status-card')||Array.from(document.body.children).find(function(node){return node.matches&&node.matches('details,section,article,main,div');})||document.body.firstElementChild;if(!root)return;var images=Array.from(root.querySelectorAll('img[data-st-avatar],img[alt*="角色头像"],img.avatar,img.art-photo'));images.forEach(function(image){image.setAttribute('data-st-avatar','');if(media.avatarSource==='none'||!media.avatarUrl){image.removeAttribute('src');image.hidden=true;return;}image.addEventListener('error',function(){if(media.avatarFallbackUrl&&media.avatarFallbackUrl!==media.avatarUrl&&image.dataset.fallbackAttempted!=='true'){image.dataset.fallbackAttempted='true';image.src=media.avatarFallbackUrl;return;}image.removeAttribute('src');image.hidden=true;});image.src=media.avatarUrl;image.alt=media.imageAlt;image.hidden=false;});})();</script>`;
    const replacement = String(regexScript?.replaceString || '');
    return {
        ...regexScript,
        replaceString: /<\/body>/i.test(replacement)
            ? replacement.replace(/<\/body>/i, `${patch}</body>`)
            : `${replacement}${patch}`,
    };
}

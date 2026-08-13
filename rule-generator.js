const FIELD_KINDS = new Set(['text', 'long', 'number', 'progress', 'currency']);

const DEFAULT_SHARED_FIELDS = [
    { label: '日期', instruction: '填写当前剧情日期', kind: 'text' },
    { label: '时间', instruction: '填写当前剧情时间', kind: 'text' },
    { label: '天气', instruction: '填写当前天气与体感', kind: 'text' },
];

const DEFAULT_PAGE_FIELDS = [
    { label: '当前位置', instruction: '填写该角色当前所在地点', kind: 'text' },
    { label: '关系值', instruction: '填写0到100之间的整数，只写数字', kind: 'progress' },
    { label: '关系变化', instruction: '填写本轮变化，例如+3或-1', kind: 'number' },
    { label: '当前状态', instruction: '填写该角色当前身体与情绪状态', kind: 'text' },
    { label: '内心想法', instruction: '第一人称填写该角色此刻没有说出口的真实想法', kind: 'long' },
    { label: '对用户观察', instruction: '填写该角色对用户本轮言行的观察', kind: 'long' },
    { label: '近期记忆', instruction: '填写与当前剧情最相关的一段近期记忆', kind: 'long' },
    { label: '下一步打算', instruction: '填写该角色最可能采取的下一步行动', kind: 'long' },
];

export const STATUS_STYLE_PRESETS = Object.freeze([
    { code: '01', id: 'classical', name: '古典对称', title: '人物状态记录', subtitle: 'STORY STATUS', layout: 'grid' },
    { code: '02', id: 'glass', name: '水色玻璃', title: '水色人物档案', subtitle: 'AQUA GLASS', layout: 'grid' },
    { code: '03', id: 'newspaper', name: '复古报刊', title: '剧情人物档案', subtitle: 'DAILY CHARACTER FILE', layout: 'grid' },
    { code: '04', id: 'timeline', name: '中轴时间线', title: '人物轨迹', subtitle: 'CHARACTER TIMELINE', layout: 'stack' },
    { code: '05', id: 'minimal', name: '构成编辑', title: '当前状态', subtitle: 'STATUS / EDITION 05', layout: 'grid' },
    { code: '06', id: 'envelope', name: '信封日记', title: '私密近况', subtitle: 'PRIVATE LETTER', layout: 'stack' },
    { code: '07', id: 'obsidian', name: '黑银档案', title: '机密状态档案', subtitle: 'CLASSIFIED STATUS', layout: 'grid' },
    { code: '08', id: 'botanical', name: '植物标本', title: '人物观察手记', subtitle: 'BOTANICAL NOTES', layout: 'grid' },
    { code: '09', id: 'cyber', name: '赛博终端', title: '神经状态面板', subtitle: 'NEURAL STATUS', layout: 'grid' },
    { code: '10', id: 'terminal', name: '绿屏终端', title: '角色运行日志', subtitle: 'CHARACTER.LOG', layout: 'stack' },
    { code: '11', id: 'polaroid', name: '拍立得墙', title: '今日人物快照', subtitle: 'DAILY SNAPSHOT', layout: 'grid' },
    { code: '12', id: 'ledger', name: '账簿手记', title: '人物往来簿', subtitle: 'RELATION LEDGER', layout: 'grid' },
    { code: '13', id: 'neon', name: '霓虹夜城', title: '夜色情报站', subtitle: 'NIGHT SIGNAL', layout: 'grid' },
    { code: '14', id: 'parchment', name: '羊皮卷轴', title: '旅途人物志', subtitle: 'TRAVEL CHRONICLE', layout: 'stack' },
    { code: '15', id: 'sakura', name: '樱花便笺', title: '心绪便笺', subtitle: 'SAKURA NOTE', layout: 'grid' },
    { code: '16', id: 'ocean', name: '深海观测', title: '深海人物观测', subtitle: 'ABYSS OBSERVER', layout: 'grid' },
    { code: '17', id: 'dossier', name: '特工卷宗', title: '行动人员卷宗', subtitle: 'FIELD DOSSIER', layout: 'stack' },
    { code: '18', id: 'comic', name: '漫画分镜', title: '本回人物状态', subtitle: 'CHARACTER PANEL', layout: 'grid' },
    { code: '19', id: 'constellation', name: '星象罗盘', title: '人物星轨', subtitle: 'CELESTIAL STATUS', layout: 'grid' },
    { code: '20', id: 'pixel', name: '像素冒险', title: '队伍状态', subtitle: 'PARTY STATUS', layout: 'grid' },
    { code: '21', id: 'seed-note', name: '贴纸种草', title: '今日种草笔记', subtitle: 'GOOD THINGS / TODAY', layout: 'stack', glyph: '♥', shared: ['日期', '标题', '标签'], fields: ['摘要', '点赞', '收藏', '评论'] },
    { code: '22', id: 'barrage-video', name: '弹幕放映', title: '正在放映', subtitle: 'BARRAGE PLAYER', layout: 'grid', glyph: '▶', shared: ['标题', '时长', '播放量'], fields: ['播放进度', '弹幕密度', '互动数', '本段内容'] },
    { code: '23', id: 'retro-bbs', name: '复古论坛', title: '主题讨论串', subtitle: 'BBS THREAD / ONLINE', layout: 'stack', glyph: '⌁', shared: ['板块', '主题', '时间'], fields: ['楼层', '正文', '引用', '互动数'] },
    { code: '24', id: 'candy-live', name: '糖果直播', title: '直播事件流', subtitle: 'LIVE NOW', layout: 'grid', glyph: '●', shared: ['直播状态', '热度', '在线数'], fields: ['事件流', '任务进度', '成长值', '互动消息'] },
    { code: '25', id: 'mono-chat', name: '黑白群聊', title: '群组会话', subtitle: 'GROUP CHAT', layout: 'stack', glyph: '↗', shared: ['群名', '成员数', '在线数'], fields: ['群公告', '最新消息', '附件', '已读数'] },
    { code: '26', id: 'ink-diary', name: '水墨日记', title: '私笺日录', subtitle: 'PRIVATE DIARY', layout: 'stack', glyph: '印', shared: ['日期', '天气', '地点'], fields: ['心情', '日记正文', '步数', '睡眠', '专注'] },
    { code: '27', id: 'vinyl-mag', name: '七十年代唱片', title: '此刻播放', subtitle: 'STEREO / SIDE A', layout: 'grid', glyph: '♪', shared: ['曲名', '作者', '专辑'], fields: ['播放进度', '时长', '歌词', '收藏状态'] },
    { code: '28', id: 'y2k-podcast', name: '千禧播客', title: '声音频道', subtitle: 'PODCAST 2000', layout: 'stack', glyph: '◉', shared: ['期号', '标题', '时长'], fields: ['日期', '简介', '主持', '嘉宾', '章节'] },
    { code: '29', id: 'dada-collage', name: '达达拼贴', title: '影像拼贴册', subtitle: 'CUT / PASTE / MEMORY', layout: 'grid', glyph: '✂', shared: ['胶卷号', '地点', '日期'], fields: ['照片标题', '短注', '画面内容', '印章'] },
    { code: '30', id: 'rococo-zine', name: '洛可可杂志', title: '本期雅集', subtitle: 'LA REVUE / ÉDITION', layout: 'stack', glyph: '❦', shared: ['期号', '日期', '本期主题'], fields: ['栏目', '摘要', '页码', '书签状态'] },
    { code: '31', id: 'bauhaus-shop', name: '包豪斯商品', title: '精选商品', subtitle: 'FORM FOLLOWS FUNCTION', layout: 'grid', glyph: '●', shared: ['商品名', '价格', '库存'], fields: ['销量', '规格', '评分', '评价标签'] },
    { code: '32', id: 'memphis-food', name: '孟菲斯食评', title: '今日食味', subtitle: 'TASTE CHECK!', layout: 'grid', glyph: '≈', shared: ['店名', '类型', '地点'], fields: ['总评分', '口味', '环境', '服务', '推荐菜', '到店记录'] },
    { code: '33', id: 'airline-passport', name: '复古旅行护照', title: '旅行护照', subtitle: 'BON VOYAGE', layout: 'stack', glyph: '✈', shared: ['目的地', '出发日', '返回日'], fields: ['行程进度', '地点清单', '当前状态', '旅行笔记'] },
    { code: '34', id: 'swiss-rail', name: '瑞士列车时刻', title: '列车时刻', subtitle: 'RAIL INFORMATION', layout: 'grid', glyph: '→', shared: ['车次', '出发站', '到达站'], fields: ['时间', '站台', '座位', '停靠状态', '延误'] },
    { code: '35', id: 'aqua-weather', name: '水色天气观测', title: '天气观测站', subtitle: 'AQUA FORECAST', layout: 'grid', glyph: '☼', shared: ['地点', '天气', '温度'], fields: ['体感', '湿度', '风速', '能见度', '预警'] },
    { code: '36', id: 'illuminated-quest', name: '古典任务手抄本', title: '冒险任务录', subtitle: 'THE QUEST CHRONICLE', layout: 'stack', glyph: '✦', shared: ['等级', '经验', '当前状态'], fields: ['当前任务', '目标清单', '武器', '防具', '材料', '金币'] },
    { code: '37', id: 'noir-case', name: '黑色电影案件', title: '案件调查档案', subtitle: 'CONFIDENTIAL / CASE FILE', layout: 'stack', glyph: '×', shared: ['案件编号', '标题', '机密等级'], fields: ['调查进度', '证据', '人物关系', '线索摘要'] },
    { code: '38', id: 'nouveau-tarot', name: '新艺术塔罗', title: '三时牌阵', subtitle: 'PAST · PRESENT · FUTURE', layout: 'grid', glyph: '☾', shared: ['占卜问题', '牌阵', '日期'], fields: ['过去牌', '现在牌', '未来牌', '正逆位', '综合解读', '牌义'] },
    { code: '39', id: 'holo-terminal', name: '全息赛博终端', title: '系统会话', subtitle: 'NEURAL LINK ACTIVE', layout: 'grid', glyph: '⌘', shared: ['会话', '网络', '加密等级'], fields: ['命令日志', 'CPU', '内存', '存储', '告警'] },
    { code: '40', id: 'industrial-survival', name: '工业生存监控', title: '生存监测', subtitle: 'FIELD UNIT / HAZARD', layout: 'grid', glyph: '!', shared: ['位置', '天气', '威胁'], fields: ['健康', '饱食', '水分', '体温', '物资', '地图摘要'] },
    { code: '41', id: 'clinical-file', name: '现代医疗档案', title: '生命体征档案', subtitle: 'CLINICAL RECORD', layout: 'grid', glyph: '+', shared: ['档案编号', '风险', '更新时间'], fields: ['心率', '血压', '体温', '血氧', '治疗计划', '病史'] },
    { code: '42', id: 'brutal-paper', name: '粗野主义论文', title: '研究摘要', subtitle: 'PAPER / INDEX 042', layout: 'stack', glyph: '#', shared: ['标题', '作者', '发表时间'], fields: ['摘要', '引用', '阅读', '收藏', '关键词', 'DOI'] },
    { code: '43', id: 'prism-dashboard', name: '棱镜企业仪表盘', title: '经营概览', subtitle: 'BUSINESS PULSE', layout: 'grid', glyph: '◇', shared: ['营收', '毛利率', '订单数'], fields: ['客户数', '趋势', '任务进度', '待办', '订单摘要'] },
    { code: '44', id: 'deco-auction', name: '装饰艺术拍卖', title: '夜场拍卖', subtitle: 'GRAND AUCTION', layout: 'stack', glyph: '◆', shared: ['拍品编号', '名称', '年代'], fields: ['材质', '当前价', '倒计时', '出价人', '出价历史'] },
    { code: '45', id: 'broadcast-sport', name: '美式体育转播', title: '实时赛况', subtitle: 'GAME DAY / LIVE', layout: 'grid', glyph: '⚡', shared: ['主队', '比分', '客队'], fields: ['比赛时间', '阶段', '控球率', '球员数据', '事件'] },
    { code: '46', id: 'victorian-news', name: '维多利亚报纸', title: '每日纪事报', subtitle: 'THE DAILY CHRONICLE', layout: 'grid', glyph: '§', shared: ['期号', '更新时间', '天气'], fields: ['时间', '地点', '当前状态', '重要数值', '事件速览'] },
    { code: '47', id: 'naturalist-specimen', name: '自然学家标本', title: '植物采集志', subtitle: 'HERBARIUM / PLATE', layout: 'stack', glyph: '❧', shared: ['采集时间', '地点', '完整度'], fields: ['分类', '种名', '当前状态', '形态记录', '备注'] },
    { code: '48', id: 'cafe-receipt', name: '法式咖啡收据', title: '今日小票', subtitle: 'CAFÉ DE LA RUE', layout: 'stack', glyph: '☕', shared: ['订单号', '时间', '订单状态'], fields: ['商品清单', '小计', '优惠', '实付', '会员进度'] },
    { code: '49', id: 'pop-ticket', name: '波普电影票根', title: '今夜放映', subtitle: 'CINEMA / ADMIT ONE', layout: 'grid', glyph: '★', shared: ['片名', '类型', '时长'], fields: ['评分', '日期', '时间', '影厅', '座位', '影院', '票号'] },
    { code: '50', id: 'porcelain-memory', name: '青花关系纪念册', title: '岁月纪念册', subtitle: 'OUR DAYS TOGETHER', layout: 'stack', glyph: '囍', shared: ['相识天数', '纪念日', '当前状态'], fields: ['心情数值', '重要事件', '共同回忆', '下一次纪念'] },
]);

export const STATUS_LOGO_PRESETS = Object.freeze([
    { id: 'auto', name: '跟随外观', glyph: '' },
    { id: 'spark', name: '星芒', glyph: '✦' },
    { id: 'leaf', name: '叶片', glyph: '🍃' },
    { id: 'apple', name: '苹果', glyph: '🍎' },
    { id: 'clover', name: '四叶草', glyph: '☘' },
    { id: 'moon', name: '月亮', glyph: '☾' },
    { id: 'heart', name: '爱心', glyph: '♥' },
    { id: 'butterfly', name: '蝴蝶', glyph: '🦋' },
    { id: 'paw', name: '爪印', glyph: '🐾' },
    { id: 'flower', name: '花枝', glyph: '❀' },
    { id: 'music', name: '音符', glyph: '♪' },
    { id: 'sun', name: '太阳', glyph: '☼' },
    { id: 'key', name: '钥匙', glyph: '⚿' },
    { id: 'candle', name: '烛火', glyph: '🕯' },
    { id: 'diamond', name: '菱形', glyph: '◆' },
    { id: 'seal', name: '印章', glyph: '印' },
]);

const STATUS_STYLE_IDS = new Set(STATUS_STYLE_PRESETS.map(style => style.id));

export const STATUS_STRUCTURE_PRESETS = Object.freeze([
    {
        id: 'profile', name: '人物名片', description: '角色头像、身份签名、关系与内心动态',
        title: '人物状态记录', subtitle: 'CHARACTER PROFILE', layout: 'grid',
        pagesText: '当前角色|填写当前主要角色的姓名与身份',
        fields: [
            ['身份 / 称谓', '填写角色当前身份或对用户的称谓', 'text', 'identity'],
            ['所在地点', '填写角色当前所在地点', 'text', 'location'],
            ['关系阶段', '填写双方当前关系阶段', 'text', 'relation'],
            ['好感度', '填写0到100之间的整数，只写数字', 'progress', 'affection'],
            ['当前状态', '填写角色当前身体与情绪状态', 'text', 'state'],
            ['内心独白', '第一人称填写角色没有说出口的真实想法', 'long', 'inner_voice'],
        ],
    },
    {
        id: 'social', name: '种草笔记 / 动态', description: '头像、正文、标签与互动数据',
        title: '今日动态', subtitle: 'SOCIAL NOTE', layout: 'stack',
        pagesText: '最新动态|填写本轮最值得发布的一条动态',
        fields: [
            ['发布者', '填写发布这条动态的角色名', 'text', 'author'],
            ['笔记标题', '填写简短有吸引力的动态标题', 'text', 'post_title'],
            ['正文', '以发布者口吻概括动态内容', 'long', 'post_body'],
            ['标签', '填写2到4个与本轮剧情有关的标签', 'text', 'tags'],
            ['点赞', '填写合理的点赞数', 'number', 'likes'],
            ['收藏 / 评论', '填写收藏数与评论数', 'text', 'engagement'],
        ],
    },
    {
        id: 'forum', name: '论坛主题帖', description: '板块、楼层、引用和回帖式组件',
        title: '主题讨论中', subtitle: 'FORUM THREAD', layout: 'stack',
        pagesText: '主题帖|填写当前讨论主题',
        fields: [
            ['板块', '填写帖子所在板块', 'text', 'board'],
            ['主题', '填写帖子主题标题', 'text', 'thread_title'],
            ['楼层 / 用户', '填写当前楼层与发帖人', 'text', 'floor_user'],
            ['帖子正文', '以论坛帖子口吻填写本轮正文', 'long', 'post_body'],
            ['引用', '填写本楼引用的短句，没有则写无', 'long', 'quote'],
            ['回复 / 点赞', '填写合理的回复与点赞数量', 'text', 'replies'],
        ],
    },
    {
        id: 'chat', name: '聊天会话', description: '对话气泡、在线状态与附件提示',
        title: '会话窗口', subtitle: 'CHAT / ONLINE', layout: 'stack',
        pagesText: '当前会话|填写聊天对象或群组名称',
        fields: [
            ['会话名', '填写聊天对象或群组名称', 'text', 'chat_name'],
            ['在线状态', '填写在线、离线或正在输入等状态', 'text', 'online'],
            ['对方消息', '概括对方本轮最重要的一句话', 'long', 'their_message'],
            ['我的消息', '概括用户本轮最重要的一句话', 'long', 'user_message'],
            ['附件', '填写本轮出现的图片、文件或语音，没有则写无', 'text', 'attachment'],
            ['已读状态', '填写已读、未读或送达状态', 'text', 'read_state'],
        ],
    },
    {
        id: 'collage', name: '影像拼贴', description: '主图、贴纸注释、记忆碎片和印章',
        title: '影像拼贴册', subtitle: 'CUT / PASTE / MEMORY', layout: 'grid',
        pagesText: '本页拼贴|填写本轮影像主题',
        fields: [
            ['胶卷编号', '填写简短胶卷编号', 'text', 'roll'],
            ['地点 / 日期', '填写画面地点与日期', 'text', 'place_date'],
            ['照片标题', '填写本轮主画面的短标题', 'text', 'photo_title'],
            ['画面描述', '概括这张照片会拍到的内容', 'long', 'visual'],
            ['手写短注', '填写一句手写感的记忆短注', 'long', 'caption'],
            ['印章 / 情绪', '填写一个印章词与当前情绪', 'text', 'stamp'],
        ],
    },
    {
        id: 'music', name: '音乐播放页', description: '封面、曲目信息、歌词和可选音频链接',
        title: '此刻播放', subtitle: 'NOW PLAYING', layout: 'stack',
        pagesText: '当前曲目|填写最符合本轮剧情的曲目主题',
        fields: [
            ['曲名', '填写符合本轮剧情的曲名', 'text', 'track'],
            ['演唱 / 专辑', '填写演唱者与专辑名', 'text', 'artist_album'],
            ['播放进度', '填写0到100之间的整数，只写数字', 'progress', 'play_progress'],
            ['氛围', '填写歌曲与当前场景的氛围', 'text', 'mood'],
            ['歌词摘句', '原创一句与剧情呼应的歌词式短句，不引用真实歌词', 'long', 'lyrics'],
            ['收听备注', '填写角色为何在此刻播放它', 'long', 'listening_note'],
        ],
    },
    {
        id: 'quest', name: '任务地图', description: '区域、任务轨迹、资源和行动节点',
        title: '冒险任务簿', subtitle: 'QUEST MAP', layout: 'stack',
        pagesText: '当前任务|填写当前主任务或探索区域',
        fields: [
            ['区域 / 天气', '填写当前区域与天气', 'text', 'region_weather'],
            ['当前任务', '填写当前主要任务目标', 'long', 'objective'],
            ['任务进度', '填写0到100之间的整数，只写数字', 'progress', 'quest_progress'],
            ['下一节点', '填写下一步要前往或触发的地点', 'text', 'next_node'],
            ['关键物资', '列出当前最重要的物资', 'long', 'inventory'],
            ['风险提示', '填写当前最需要警惕的风险', 'long', 'risk'],
        ],
    },
    {
        id: 'casefile', name: '案件卷宗', description: '案件编号、证据卡、嫌疑人与推理结论',
        title: '案件调查档案', subtitle: 'CONFIDENTIAL / CASE FILE', layout: 'grid',
        pagesText: '当前案件|填写当前调查案件或谜团',
        fields: [
            ['案件编号', '填写简短案件编号', 'text', 'case_id'],
            ['案件标题', '填写案件或谜团标题', 'text', 'case_title'],
            ['调查进度', '填写0到100之间的整数，只写数字', 'progress', 'investigation'],
            ['关键证据', '列出本轮新增或最关键的证据', 'long', 'evidence'],
            ['人物关系', '概括相关人物和嫌疑关系', 'long', 'suspects'],
            ['当前推论', '填写目前最合理但尚未证实的推论', 'long', 'theory'],
        ],
    },
    {
        id: 'custom', name: '自由组件板', description: '保留完全可编辑的通用字段容器',
        title: '自定义状态面板', subtitle: 'CUSTOM COMPONENTS', layout: 'grid',
        pagesText: '当前页面|填写页面对象或视角',
        fields: [
            ['标题字段', '根据当前剧情动态填写', 'text', 'custom_title'],
            ['主要内容', '根据当前剧情动态填写', 'long', 'custom_body'],
            ['动态数值', '填写0到100之间的整数，只写数字', 'progress', 'custom_progress'],
        ],
    },
]);

export const STATUS_PALETTE_PRESETS = Object.freeze([
    { id: 'cream-navy', name: '奶油海军蓝', accent: '#1f4268', background: '#e8ddc7', card: '#fff9ed', text: '#2d2924', muted: '#786b5d' },
    { id: 'lotus-ink', name: '荷塘墨绿', accent: '#49634d', background: '#bdc6aa', card: '#efe5cf', text: '#243126', muted: '#84685c' },
    { id: 'berry-milk', name: '莓果奶霜', accent: '#a14f6b', background: '#e8c9cf', card: '#fff4ed', text: '#4a3038', muted: '#876b73' },
    { id: 'aqua-mist', name: '水色薄雾', accent: '#318c97', background: '#b9e0df', card: '#f0fbf7', text: '#214951', muted: '#638389' },
    { id: 'newsprint', name: '报纸红黑', accent: '#9a2821', background: '#c8b894', card: '#eee3c6', text: '#1d1a16', muted: '#62594c' },
    { id: 'porcelain', name: '青花瓷蓝', accent: '#2458a6', background: '#d7e9e4', card: '#f8f7ee', text: '#183a69', muted: '#43836d' },
    { id: 'neon-night', name: '午夜霓虹', accent: '#ff4fc8', background: '#0e1027', card: '#21133b', text: '#fff2fc', muted: '#79dff1' },
    { id: 'black-silver', name: '黑银档案', accent: '#d7d7d7', background: '#090909', card: '#151515', text: '#f3f3f3', muted: '#9f9f9f' },
    { id: 'sunset-pop', name: '落日波普', accent: '#e73767', background: '#f2b84b', card: '#fff06a', text: '#142c52', muted: '#7f3c62' },
    { id: 'lavender-glass', name: '薰衣草玻璃', accent: '#8068d8', background: '#c8c3ef', card: '#f3f0ff', text: '#312c55', muted: '#716a91' },
    { id: 'jade-gold', name: '翡翠描金', accent: '#c9a54c', background: '#0b2f29', card: '#123f36', text: '#fff1cf', muted: '#b7c7b5' },
    { id: 'sakura-paper', name: '樱纸青黛', accent: '#bd6981', background: '#efdae0', card: '#fff8f3', text: '#443a44', muted: '#687b83' },
    { id: 'imperial-red', name: '宫墙朱砂', accent: '#b52d27', background: '#d9bd91', card: '#f5ead2', text: '#3f251c', muted: '#79604f' },
    { id: 'cornflower', name: '矢车菊蓝', accent: '#315fc4', background: '#c7d8f2', card: '#f5f8ff', text: '#1d315c', muted: '#61749a' },
    { id: 'apricot-lilac', name: '杏桃丁香', accent: '#bb6d72', background: '#ead0bf', card: '#fff2e8', text: '#50363b', muted: '#8e7185' },
    { id: 'moss-copper', name: '苔藓铜绿', accent: '#b16f52', background: '#aab094', card: '#eef0dc', text: '#344035', muted: '#6d735f' },
    { id: 'cobalt-lime', name: '钴蓝酸橙', accent: '#3151d5', background: '#cdea49', card: '#f7ffd9', text: '#121c4d', muted: '#526b77' },
    { id: 'rust-cream', name: '铁锈奶油', accent: '#b74f32', background: '#cc9b69', card: '#fff0d4', text: '#4a2b20', muted: '#7d614e' },
    { id: 'coffee-mint', name: '咖啡薄荷', accent: '#5c8878', background: '#b9c9b9', card: '#f3ebd9', text: '#3b3029', muted: '#7a685b' },
    { id: 'plum-gold', name: '梅紫鎏金', accent: '#c5a04a', background: '#4c294d', card: '#6a3b62', text: '#fff0d0', muted: '#d0aebd' },
    { id: 'mint-coral', name: '薄荷珊瑚', accent: '#ef786b', background: '#a9d9cf', card: '#f5fff6', text: '#294a47', muted: '#648b83' },
    { id: 'ice-blue', name: '冰川浅蓝', accent: '#3f8fb2', background: '#c9e6ef', card: '#f5fcff', text: '#244653', muted: '#668593' },
    { id: 'lemon-pink', name: '柠檬樱粉', accent: '#df6e93', background: '#f3df77', card: '#fff9dc', text: '#4a3341', muted: '#8b6f68' },
    { id: 'oxblood-gray', name: '牛血石灰', accent: '#8e2631', background: '#a7a39d', card: '#ece8df', text: '#2f2927', muted: '#706865' },
]);

const STATUS_STRUCTURE_IDS = new Set(STATUS_STRUCTURE_PRESETS.map(item => item.id));
const STATUS_PALETTE_IDS = new Set(STATUS_PALETTE_PRESETS.map(item => item.id));

export const RULE_PRESETS = Object.freeze({
    relationship: {
        ruleName: '攻略关系状态栏',
        tagName: 'zeya_relationship',
        title: '关系状态记录',
        subtitle: 'RELATIONSHIP NOTE',
        theme: 'classical',
        layout: 'grid',
        pagesText: '当前攻略对象|填写当前主要攻略对象的姓名与身份',
        sharedFieldsText: '日期时间|填写当前剧情日期与时间|text|datetime\n当前位置|填写当前场景地点|text|location',
        pageFieldsText: '当前关系|填写双方目前的关系阶段|text|relation\n好感度|填写0到100之间的整数，只写数字|progress|affection\n变化原因|填写本轮关系变化的具体原因|long|change_reason\n内心独白|第一人称填写没有说出口的真实想法|long|inner_voice',
    },
    openingInfo: {
        ruleName: '开局信息状态栏',
        tagName: 'zeya_opening_info',
        title: '序章情报页',
        subtitle: 'OPENING DOSSIER',
        theme: 'newspaper',
        layout: 'grid',
        pagesText: '当前开局|填写当前开局路线或视角',
        sharedFieldsText: '日期时间|填写当前剧情日期与时间|text|datetime\n当前位置|填写当前地点|text|location\n玩家身份|填写用户在本路线中的身份|text|player_identity',
        pageFieldsText: '世界前提|概括本路线必须知道的世界设定|long|world_intro\n当前目标|填写用户目前最需要完成的目标|long|objective\n阅读提示|填写本路线当前重要提示|long|reading_tip',
    },
    worldNpc: {
        ruleName: '大世界NPC状态栏',
        tagName: 'zeya_world_npc',
        title: '大陆动态档案',
        subtitle: 'WORLD & NPC ARCHIVE',
        theme: 'timeline',
        layout: 'grid',
        pagesText: '当前区域|填写当前所在地区或主要观察区域',
        sharedFieldsText: '区域|填写当前地区|text|region\n天气|填写天气与环境变化|text|weather\n世界事件|填写正在发生的重要世界事件|long|world_event',
        pageFieldsText: '阵营态势|填写当前主要阵营关系|long|faction_state\nNPC动态|列出当前重要NPC及其最新动向|long|npc_list\n声望|填写用户在当前区域的声望数值或级别|number|reputation\n威胁等级|填写当前区域威胁等级|text|threat',
    },
    survival: {
        ruleName: '生存探索状态栏',
        tagName: 'zeya_survival',
        title: '探索记录',
        subtitle: 'EXPEDITION LOG',
        theme: 'obsidian',
        layout: 'grid',
        pagesText: '当前探索|填写当前探索者或队伍名称',
        sharedFieldsText: '时间|填写当前时间|text|time\n区域|填写当前探索区域|text|region\n环境危险|填写即将发生或正在发生的环境危险|long|environment_danger',
        pageFieldsText: '生命值|填写0到100之间的整数，只写数字|progress|health\n补给|填写剩余水、食物与关键资源|text|supply\n背包摘要|列出当前关键物品|long|inventory\n当前任务|填写当前任务目标与进度|long|quest',
    },
    universalClassical: {
        ruleName: '通用状态栏01·古典对称',
        tagName: 'zeya_status',
        title: '人物状态记录',
        subtitle: 'STORY STATUS',
        theme: 'classical',
        layout: 'grid',
        pagesText: '角色一|填写第一个角色或视角的名称与身份\n角色二|填写第二个角色或视角的名称与身份',
        sharedFieldsText: DEFAULT_SHARED_FIELDS.map(field => `${field.label}|${field.instruction}|${field.kind}`).join('\n'),
        pageFieldsText: DEFAULT_PAGE_FIELDS.map(field => `${field.label}|${field.instruction}|${field.kind}`).join('\n'),
    },
    universalNewspaper: {
        ruleName: '通用状态栏03·复古报刊',
        tagName: 'zeya_status',
        title: '剧情人物档案',
        subtitle: 'DAILY CHARACTER FILE',
        theme: 'newspaper',
        layout: 'grid',
        pagesText: '角色一|填写第一个角色或视角的名称与身份\n角色二|填写第二个角色或视角的名称与身份',
        sharedFieldsText: DEFAULT_SHARED_FIELDS.map(field => `${field.label}|${field.instruction}|${field.kind}`).join('\n'),
        pageFieldsText: DEFAULT_PAGE_FIELDS.map(field => `${field.label}|${field.instruction}|${field.kind}`).join('\n'),
    },
    universalTimeline: {
        ruleName: '通用状态栏04·中轴时间线',
        tagName: 'zeya_status',
        title: '人物轨迹',
        subtitle: 'CHARACTER TIMELINE',
        theme: 'timeline',
        layout: 'stack',
        pagesText: '角色一|填写第一个角色或视角的名称与身份\n角色二|填写第二个角色或视角的名称与身份',
        sharedFieldsText: DEFAULT_SHARED_FIELDS.map(field => `${field.label}|${field.instruction}|${field.kind}`).join('\n'),
        pageFieldsText: DEFAULT_PAGE_FIELDS.map(field => `${field.label}|${field.instruction}|${field.kind}`).join('\n'),
    },
    universalMinimal: {
        ruleName: '通用状态栏05·构成编辑',
        tagName: 'zeya_status',
        title: '当前状态',
        subtitle: 'CURRENT STATUS',
        theme: 'minimal',
        layout: 'grid',
        pagesText: '角色一|填写第一个角色或视角的名称与身份\n角色二|填写第二个角色或视角的名称与身份',
        sharedFieldsText: DEFAULT_SHARED_FIELDS.map(field => `${field.label}|${field.instruction}|${field.kind}`).join('\n'),
        pageFieldsText: DEFAULT_PAGE_FIELDS.map(field => `${field.label}|${field.instruction}|${field.kind}`).join('\n'),
    },
    richTwins: {
        ruleName: '双页剧情状态',
        tagName: 'zeya_status',
        title: '人物状态记录',
        subtitle: 'STORY STATUS',
        theme: 'newspaper',
        layout: 'grid',
        pagesText: '角色一|填写第一个角色或视角的名称与身份\n角色二|填写第二个角色或视角的名称与身份',
        sharedFieldsText: DEFAULT_SHARED_FIELDS.map(field => `${field.label}|${field.instruction}|${field.kind}`).join('\n'),
        pageFieldsText: DEFAULT_PAGE_FIELDS.map(field => `${field.label}|${field.instruction}|${field.kind}`).join('\n'),
    },
    twinsDiary: {
        ruleName: '双页信封日记',
        tagName: 'zeya_diary',
        title: '私密日记',
        subtitle: 'PRIVATE DIARY',
        theme: 'envelope',
        layout: 'stack',
        pagesText: '角色一|填写第一位日记书写者的姓名与性格要求\n角色二|填写第二位日记书写者的姓名与性格要求',
        sharedFieldsText: '日期|填写本轮剧情日期|text',
        pageFieldsText: '可用资金|填写具体金额并带货币符号|currency\n日记正文|第一人称、紧扣最近剧情，填写50到150字的真实日记|long',
    },
    singleStatus: {
        ruleName: '单页通用状态',
        tagName: 'zeya_status',
        title: '角色状态',
        subtitle: 'STATUS',
        theme: 'glass',
        layout: 'grid',
        pagesText: '当前角色|填写当前主要角色的姓名与身份',
        sharedFieldsText: DEFAULT_SHARED_FIELDS.map(field => `${field.label}|${field.instruction}|${field.kind}`).join('\n'),
        pageFieldsText: DEFAULT_PAGE_FIELDS.slice(0, 6).map(field => `${field.label}|${field.instruction}|${field.kind}`).join('\n'),
    },
});

function splitLine(line) {
    const values = [];
    let current = '';
    let escaped = false;
    for (const character of String(line)) {
        if (escaped) {
            current += character;
            escaped = false;
        } else if (character === '\\') {
            escaped = true;
        } else if (character === '|') {
            values.push(current.trim());
            current = '';
        } else {
            current += character;
        }
    }
    values.push(current.trim());
    return values;
}

function meaningfulLines(value) {
    return String(value ?? '')
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
}

export function parsePages(value) {
    return meaningfulLines(value).map((line, index) => {
        const [label, instruction = ''] = splitLine(line);
        return {
            id: `View${index + 1}`,
            label: label || `角色${index + 1}`,
            instruction: instruction || `填写${label || `角色${index + 1}`}的身份与视角要求`,
        };
    });
}

export function parseFields(value) {
    return meaningfulLines(value).map((line, index) => {
        const [label, instruction = '', rawKind = 'text', rawKey = ''] = splitLine(line);
        const kind = FIELD_KINDS.has(rawKind.toLowerCase()) ? rawKind.toLowerCase() : 'text';
        const stableKey = String(rawKey || `field_${index + 1}`).trim().replace(/[^a-zA-Z0-9_-]/g, '_') || `field_${index + 1}`;
        return {
            id: stableKey,
            label: label || `字段${index + 1}`,
            instruction: instruction || `根据当前剧情填写${label || `字段${index + 1}`}`,
            kind,
        };
    });
}

export function sanitizeTagName(value) {
    const cleaned = String(value ?? '').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    return cleaned || 'zeya_status';
}

function safeMediaUrl(value, kind = 'image') {
    const url = String(value || '').trim();
    if (!url) return '';
    if (/^https?:\/\//i.test(url) || /^\/(?!\/)/.test(url)) return url;
    if (kind === 'image' && /^data:image\/(?:png|jpe?g|gif|webp|avif);base64,/i.test(url)) return url;
    return '';
}

function normalizePalette(input = {}) {
    const preset = STATUS_PALETTE_PRESETS.find(item => item.id === input.paletteId);
    const source = preset || input.palette || {};
    const color = (key, fallback) => /^#[0-9a-f]{6}$/i.test(String(source[key] || '')) ? String(source[key]) : fallback;
    if (!preset && !input.palette) return null;
    return {
        id: preset?.id || (STATUS_PALETTE_IDS.has(input.paletteId) ? input.paletteId : 'custom'),
        name: preset?.name || '自定义色卡',
        accent: color('accent', '#9b6849'),
        background: color('background', '#f2e5c5'),
        card: color('card', '#f8efd7'),
        text: color('text', '#493a2b'),
        muted: color('muted', '#7a6954'),
    };
}

function normalizeMedia(input = {}) {
    const media = input.media && typeof input.media === 'object' ? input.media : {};
    const avatarSource = ['none', 'character', 'user', 'url'].includes(media.avatarSource) ? media.avatarSource : 'none';
    return {
        avatarSource,
        avatarUrl: safeMediaUrl(media.avatarUrl, 'image'),
        imageUrl: safeMediaUrl(media.imageUrl, 'image'),
        audioUrl: safeMediaUrl(media.audioUrl, 'audio'),
        imageAlt: String(media.imageAlt || '状态栏配图').slice(0, 80),
    };
}

export function normalizeRule(input = {}) {
    const pages = parsePages(input.pagesText);
    const sharedFields = parseFields(input.sharedFieldsText);
    const pageFields = parseFields(input.pageFieldsText);
    const style = STATUS_STYLE_PRESETS.find(item => item.id === input.theme);
    const logo = STATUS_LOGO_PRESETS.find(item => item.id === input.logoId) || STATUS_LOGO_PRESETS[0];
    const structure = STATUS_STRUCTURE_IDS.has(input.structure) ? input.structure : 'profile';
    return {
        ruleId: String(input.ruleId || 'zeya-status-rule'),
        ruleName: String(input.ruleName || '双页剧情状态').trim() || '双页剧情状态',
        tagName: sanitizeTagName(input.tagName),
        title: String(input.title || '人物状态记录'),
        subtitle: String(input.subtitle || 'STORY STATUS'),
        theme: style?.id || 'newspaper',
        styleName: style?.name || '复古报刊',
        logoId: logo.id,
        glyph: logo.glyph || style?.glyph || '✦',
        structure,
        structureName: STATUS_STRUCTURE_PRESETS.find(item => item.id === structure)?.name || '人物名片',
        palette: normalizePalette(input),
        media: normalizeMedia(input),
        layout: input.layout === 'stack' ? 'stack' : 'grid',
        pages: pages.length ? pages : parsePages(RULE_PRESETS.relationship.pagesText),
        sharedFields,
        pageFields: pageFields.length ? pageFields : DEFAULT_PAGE_FIELDS,
    };
}

function placeholder(field, pageLabel = '') {
    const subject = pageLabel ? `${pageLabel}·` : '';
    return `{{${subject}${field.label}：${field.instruction}}}`;
}

export function buildAiInstruction(input) {
    const rule = normalizeRule(input);
    const records = [];
    if (rule.sharedFields.length) {
        records.push(`[Shared|${rule.sharedFields.map(field => placeholder(field)).join('|')}]`);
    }
    for (const page of rule.pages) {
        records.push(`[${page.id}|${rule.pageFields.map(field => placeholder(field, page.label)).join('|')}]`);
    }

    const pageGuide = rule.pages.map(page => `- ${page.id} 对应“${page.label}”：${page.instruction}`).join('\n');
    const fieldGuide = rule.pageFields.map((field, index) => `- 第${index + 1}项“${field.label}”：${field.instruction}`).join('\n');
    return [
        `<${rule.tagName}_rules>`,
        `每次正文结束后，必须追加一个 <${rule.tagName}> 状态区块。`,
        '区块中的所有值都必须根据当前剧情动态生成；模板中的双花括号只是填写说明，回复时不得原样保留。',
        '方括号内严格使用英文竖线分隔。值中不得出现英文竖线、方括号、尖括号或 Markdown 加粗。',
        '不要把状态区块放进 Markdown 代码块，不要输出 HTML，不要遗漏记录，也不要附加同类的第二套状态格式。',
        '',
        '切换页对应关系：',
        pageGuide,
        '',
        '每个切换页的动态字段顺序：',
        fieldGuide,
        '',
        '严格输出模板：',
        `<${rule.tagName}>`,
        ...records,
        `</${rule.tagName}>`,
        `</${rule.tagName}_rules>`,
    ].join('\n');
}

export function parseStatusOutput(input, rawOutput) {
    const rule = normalizeRule(input);
    const source = String(rawOutput || '');
    const block = source.match(new RegExp(`<${rule.tagName}>\\s*([\\s\\S]*?)\\s*<\\/${rule.tagName}>`, 'i'))?.[1] || source;
    const records = {};
    for (const match of block.matchAll(/[\[【]([^\]】\r\n]+)[\]】]/g)) {
        const parts = match[1].replace(/｜/g, '|').split('|').map(value => value.trim());
        const key = parts.shift();
        if (key) records[key] = parts;
    }
    const missing = [];
    if (rule.sharedFields.length && (records.Shared?.length || 0) < rule.sharedFields.length) missing.push('Shared');
    for (const page of rule.pages) {
        if ((records[page.id]?.length || 0) < rule.pageFields.length) missing.push(page.id);
    }
    if (missing.length) throw new Error(`AI 状态区块缺少完整记录：${missing.join('、')}`);
    return {
        rule,
        shared: rule.sharedFields.map((_, index) => records.Shared?.[index] || ''),
        pages: rule.pages.map(page => ({ page, values: rule.pageFields.map((_, index) => records[page.id]?.[index] || '') })),
        raw: source,
    };
}

export function buildWorldbookJson(input) {
    const rule = normalizeRule(input);
    return {
        entries: {
            0: {
                uid: 0,
                key: [],
                keysecondary: [],
                comment: `九一 · ${rule.ruleName} · AI动态输出规则`,
                content: buildAiInstruction(input),
                constant: true,
                vectorized: false,
                selective: true,
                selectiveLogic: 0,
                addMemo: true,
                order: 100,
                position: 0,
                disable: false,
                ignoreBudget: false,
                excludeRecursion: false,
                preventRecursion: false,
                matchPersonaDescription: false,
                matchCharacterDescription: false,
                matchCharacterPersonality: false,
                matchCharacterDepthPrompt: false,
                matchScenario: false,
                matchCreatorNotes: false,
                delayUntilRecursion: 0,
                probability: 100,
                useProbability: true,
                automationId: 'jiuyi-status-output-rule-v1',
                depth: 4,
                outletName: '',
                group: '',
                groupOverride: false,
                groupWeight: 100,
                scanDepth: null,
                caseSensitive: null,
                matchWholeWords: null,
                useGroupScoring: null,
                role: 0,
                sticky: null,
                cooldown: null,
                delay: null,
                triggers: [],
            },
        },
    };
}

function safeJsonForScript(value) {
    return JSON.stringify(value)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026');
}

export const STATUS_THEME_CSS = `
.zeya-regex-status[data-theme="classical"]{--z-accent:#9b6849;--z-bg:#f2e5c5;--z-card:#f8efd7;--z-text:#493a2b;--z-muted:#7a6954}
.zeya-regex-status[data-theme="glass"]{--z-accent:#6ec7d9;--z-bg:#102631;--z-card:#173844;--z-text:#e9f8fb;--z-muted:#9dbdc5}
.zeya-regex-status[data-theme="newspaper"]{--z-accent:#842f26;--z-bg:#e8dfca;--z-card:#f3eddc;--z-text:#201d19;--z-muted:#5a5348}
.zeya-regex-status[data-theme="timeline"]{--z-accent:#b46662;--z-bg:#fff6ed;--z-card:#fffaf1;--z-text:#3c3330;--z-muted:#6d9799}
.zeya-regex-status[data-theme="minimal"]{--z-accent:#a7312e;--z-bg:#c9cac8;--z-card:#f4f1e8;--z-text:#1d1b19;--z-muted:#67645e}
.zeya-regex-status[data-theme="envelope"]{--z-accent:#9b4b58;--z-bg:#4a566e;--z-card:#faf6ed;--z-text:#2a3242;--z-muted:#687185}
.zeya-regex-status[data-theme="obsidian"]{--z-accent:#d7d7d7;--z-bg:#090909;--z-card:#141414;--z-text:#f3f3f3;--z-muted:#a7a7a7}
.zeya-regex-status[data-theme="botanical"]{--z-accent:#55755b;--z-bg:#dfe7d8;--z-card:#f4f2e5;--z-text:#354234;--z-muted:#71806b}
.zeya-regex-status[data-theme="cyber"]{--z-accent:#24e5ff;--z-bg:#071321;--z-card:#0d2034;--z-text:#e5fbff;--z-muted:#72a9bb}
.zeya-regex-status[data-theme="terminal"]{--z-accent:#53ed74;--z-bg:#020b05;--z-card:#07120a;--z-text:#bfffc9;--z-muted:#63a971}
.zeya-regex-status[data-theme="polaroid"]{--z-accent:#de6f55;--z-bg:#d7d2c8;--z-card:#fffdf7;--z-text:#35312d;--z-muted:#837b72}
.zeya-regex-status[data-theme="ledger"]{--z-accent:#365f8d;--z-bg:#e5e1d4;--z-card:#f9f4df;--z-text:#302f2b;--z-muted:#7a6049}
.zeya-regex-status[data-theme="neon"]{--z-accent:#ff4fc8;--z-bg:#140c2c;--z-card:#21133b;--z-text:#fff2fc;--z-muted:#a899d7}
.zeya-regex-status[data-theme="parchment"]{--z-accent:#8b562e;--z-bg:#b79261;--z-card:#f0dbad;--z-text:#4b321f;--z-muted:#806342}
.zeya-regex-status[data-theme="sakura"]{--z-accent:#c76883;--z-bg:#f4dce2;--z-card:#fff6f7;--z-text:#513d47;--z-muted:#9b7180}
.zeya-regex-status[data-theme="ocean"]{--z-accent:#55d4dc;--z-bg:#071d2b;--z-card:#0d3447;--z-text:#e8fcff;--z-muted:#8db8c4}
.zeya-regex-status[data-theme="dossier"]{--z-accent:#b54835;--z-bg:#aaa18d;--z-card:#e6dfcc;--z-text:#292820;--z-muted:#686353}
.zeya-regex-status[data-theme="comic"]{--z-accent:#ef3f49;--z-bg:#ffda45;--z-card:#fffdf2;--z-text:#171717;--z-muted:#5a4a3a}
.zeya-regex-status[data-theme="constellation"]{--z-accent:#d8bcff;--z-bg:#090b29;--z-card:#17173c;--z-text:#f7f1ff;--z-muted:#a5a1ce}
.zeya-regex-status[data-theme="pixel"]{--z-accent:#ffcb48;--z-bg:#20233b;--z-card:#303552;--z-text:#fff7dc;--z-muted:#aeb5d0}
.zeya-regex-status[data-theme="seed-note"]{--z-accent:#ed6f83;--z-bg:#ffd8d2;--z-card:#fff8dc;--z-text:#493d4d;--z-muted:#5e9c92}.zeya-regex-status[data-theme="barrage-video"]{--z-accent:#58e6ff;--z-bg:#11162f;--z-card:#202052;--z-text:#f8f5ff;--z-muted:#ae8cff}.zeya-regex-status[data-theme="retro-bbs"]{--z-accent:#f4b942;--z-bg:#060c1d;--z-card:#0e1930;--z-text:#d6ff7f;--z-muted:#7a9ab7}.zeya-regex-status[data-theme="candy-live"]{--z-accent:#ff5db1;--z-bg:#cbb7ff;--z-card:#fff4fd;--z-text:#42295f;--z-muted:#22a9b2}.zeya-regex-status[data-theme="mono-chat"]{--z-accent:#e2211c;--z-bg:#dedede;--z-card:#fff;--z-text:#111;--z-muted:#666}.zeya-regex-status[data-theme="ink-diary"]{--z-accent:#a84132;--z-bg:#c6d2c0;--z-card:#f4efdf;--z-text:#24312b;--z-muted:#63766b}.zeya-regex-status[data-theme="vinyl-mag"]{--z-accent:#c65a31;--z-bg:#f1bd3b;--z-card:#f6e8c5;--z-text:#15384f;--z-muted:#74583d}.zeya-regex-status[data-theme="y2k-podcast"]{--z-accent:#6b43ff;--z-bg:#b7f6ff;--z-card:#e9e7f2;--z-text:#151c3d;--z-muted:#6f6a9a}.zeya-regex-status[data-theme="dada-collage"]{--z-accent:#e63225;--z-bg:#f2cf22;--z-card:#f7f2e7;--z-text:#111;--z-muted:#1468a8}.zeya-regex-status[data-theme="rococo-zine"]{--z-accent:#9f3c5d;--z-bg:#d7b4ac;--z-card:#fff7e8;--z-text:#55353b;--z-muted:#a98542}.zeya-regex-status[data-theme="bauhaus-shop"]{--z-accent:#d9271c;--z-bg:#f3c62f;--z-card:#f5f0df;--z-text:#0f3975;--z-muted:#151515}.zeya-regex-status[data-theme="memphis-food"]{--z-accent:#f06b5b;--z-bg:#f8c56a;--z-card:#fff2da;--z-text:#173e43;--z-muted:#1d9d95}.zeya-regex-status[data-theme="airline-passport"]{--z-accent:#e34b35;--z-bg:#8ccbe0;--z-card:#f8edcf;--z-text:#183a58;--z-muted:#5d7c86}.zeya-regex-status[data-theme="swiss-rail"]{--z-accent:#e1251b;--z-bg:#d8d8d6;--z-card:#fff;--z-text:#111;--z-muted:#686868}.zeya-regex-status[data-theme="aqua-weather"]{--z-accent:#35bfc2;--z-bg:#bce9ea;--z-card:#effdf7;--z-text:#185066;--z-muted:#5d8b8d}.zeya-regex-status[data-theme="illuminated-quest"]{--z-accent:#7a263a;--z-bg:#b69358;--z-card:#ead9a8;--z-text:#3a2b1e;--z-muted:#246044}.zeya-regex-status[data-theme="noir-case"]{--z-accent:#b61e24;--z-bg:#202020;--z-card:#e5ddca;--z-text:#171717;--z-muted:#67625c}.zeya-regex-status[data-theme="nouveau-tarot"]{--z-accent:#bf9a4a;--z-bg:#342849;--z-card:#ede2cf;--z-text:#46324d;--z-muted:#667447}.zeya-regex-status[data-theme="holo-terminal"]{--z-accent:#00f0ff;--z-bg:#050611;--z-card:#0c1730;--z-text:#d7ffff;--z-muted:#fe3ec8}.zeya-regex-status[data-theme="industrial-survival"]{--z-accent:#e6b62f;--z-bg:#302f29;--z-card:#4a4a3d;--z-text:#f4e9cc;--z-muted:#b5784f}.zeya-regex-status[data-theme="clinical-file"]{--z-accent:#ed6c63;--z-bg:#d8eff0;--z-card:#f8fffd;--z-text:#214b59;--z-muted:#65949b}.zeya-regex-status[data-theme="brutal-paper"]{--z-accent:#2447d8;--z-bg:#dbff38;--z-card:#fff;--z-text:#090909;--z-muted:#2447d8}.zeya-regex-status[data-theme="prism-dashboard"]{--z-accent:#725cff;--z-bg:#a8d8ff;--z-card:#eff2ff;--z-text:#172458;--z-muted:#727aa6}.zeya-regex-status[data-theme="deco-auction"]{--z-accent:#d6b35b;--z-bg:#071b18;--z-card:#102d26;--z-text:#fff1cf;--z-muted:#bd6c68}.zeya-regex-status[data-theme="broadcast-sport"]{--z-accent:#b9ff24;--z-bg:#102469;--z-card:#f4f7ff;--z-text:#101b43;--z-muted:#e84535}.zeya-regex-status[data-theme="victorian-news"]{--z-accent:#7e2e2c;--z-bg:#a89676;--z-card:#eee2c7;--z-text:#201d19;--z-muted:#685947}.zeya-regex-status[data-theme="naturalist-specimen"]{--z-accent:#73805c;--z-bg:#202b08;--z-card:#dcc9a7;--z-text:#293623;--z-muted:#9a6652}.zeya-regex-status[data-theme="cafe-receipt"]{--z-accent:#b85f48;--z-bg:#8fb8a0;--z-card:#fbf1d7;--z-text:#3b261d;--z-muted:#7d634f}.zeya-regex-status[data-theme="pop-ticket"]{--z-accent:#ec2f89;--z-bg:#18bed1;--z-card:#ffe43e;--z-text:#111;--z-muted:#65328f}.zeya-regex-status[data-theme="porcelain-memory"]{--z-accent:#2458a6;--z-bg:#d7e9e4;--z-card:#f8f7ee;--z-text:#183a69;--z-muted:#43836d}
.zeya-regex-status[data-theme="classical"] .zrs-card{border:4px double var(--z-accent);border-radius:8px}.zeya-regex-status[data-theme="classical"] .zrs-header{text-align:center}.zeya-regex-status[data-theme="classical"] .zrs-header>div{flex:1}
.zeya-regex-status[data-theme="glass"] .zrs-card{border-color:color-mix(in srgb,var(--z-accent) 65%,transparent);background:linear-gradient(135deg,rgba(255,255,255,.1),transparent 48%),color-mix(in srgb,var(--z-card) 84%,transparent);backdrop-filter:blur(12px)}
.zeya-regex-status[data-theme="minimal"]{font-family:"Noto Sans SC","Microsoft YaHei",sans-serif}.zeya-regex-status[data-theme="minimal"] .zrs-card{border:1px solid var(--z-text);border-radius:0;background:var(--z-card);box-shadow:6px 6px 0 color-mix(in srgb,var(--z-text) 18%,transparent)}.zeya-regex-status[data-theme="minimal"] .zrs-header{position:relative;padding:18px 15px 24px;border-bottom:6px solid var(--z-text);background:transparent}.zeya-regex-status[data-theme="minimal"] .zrs-header::after{content:"LIVE / WORLD INFO";position:absolute;left:15px;bottom:7px;color:var(--z-accent);font:800 8px/1 monospace;letter-spacing:.12em}.zeya-regex-status[data-theme="minimal"] .zrs-title{font:900 clamp(1.35em,7vw,2.4em)/.92 "Noto Serif SC","Songti SC",serif;letter-spacing:-.08em}.zeya-regex-status[data-theme="minimal"] .zrs-subtitle{color:var(--z-muted);font:700 .62em/1.2 monospace;letter-spacing:.12em}.zeya-regex-status[data-theme="minimal"] .zrs-collapse{border-color:var(--z-text);border-radius:0}.zeya-regex-status[data-theme="minimal"] .zrs-content{padding:1px;background:var(--z-text)}.zeya-regex-status[data-theme="minimal"] .zrs-shared,.zeya-regex-status[data-theme="minimal"] .zrs-fields{gap:1px;margin-bottom:1px}.zeya-regex-status[data-theme="minimal"] .zrs-shared-item,.zeya-regex-status[data-theme="minimal"] .zrs-field{min-height:72px;border:0;background:var(--z-card)}.zeya-regex-status[data-theme="minimal"] .zrs-label{color:var(--z-muted);font:700 .62em/1.3 monospace;letter-spacing:.1em}.zeya-regex-status[data-theme="minimal"] .zrs-value{font-family:"Noto Serif SC","Songti SC",serif}.zeya-regex-status[data-theme="minimal"] .zrs-tabs{gap:1px;margin:0 0 1px;background:var(--z-text)}.zeya-regex-status[data-theme="minimal"] .zrs-tab{border:0;border-radius:0;background:var(--z-card)}.zeya-regex-status[data-theme="minimal"] .zrs-tab.is-active{color:var(--z-card);background:var(--z-text)}.zeya-regex-status[data-theme="minimal"] .zrs-meter{height:5px;border-radius:0;background:color-mix(in srgb,var(--z-text) 14%,transparent)}
.zeya-regex-status[data-theme="envelope"] .zrs-card{border-radius:3px;border-width:1px}.zeya-regex-status[data-theme="envelope"] .zrs-header{background:repeating-linear-gradient(135deg,color-mix(in srgb,var(--z-accent) 18%,var(--z-card)) 0 12px,var(--z-card) 12px 24px)}
.zeya-regex-status[data-theme="obsidian"] .zrs-card{border-radius:0;box-shadow:8px 8px 0 #000}.zeya-regex-status[data-theme="obsidian"] .zrs-field,.zeya-regex-status[data-theme="obsidian"] .zrs-shared-item{border-left:3px solid var(--z-accent)}
.zeya-regex-status[data-theme="botanical"] .zrs-card{border-radius:30px 8px}.zeya-regex-status[data-theme="botanical"] .zrs-header{background:linear-gradient(110deg,color-mix(in srgb,var(--z-accent) 22%,var(--z-card)),var(--z-card))}.zeya-regex-status[data-theme="botanical"] .zrs-field{border-radius:16px 4px}
.zeya-regex-status[data-theme="cyber"] .zrs-card{clip-path:polygon(14px 0,100% 0,100% calc(100% - 14px),calc(100% - 14px) 100%,0 100%,0 14px);border-radius:0;box-shadow:0 0 24px color-mix(in srgb,var(--z-accent) 28%,transparent)}.zeya-regex-status[data-theme="cyber"] .zrs-tab{border-radius:2px;text-transform:uppercase}
.zeya-regex-status[data-theme="terminal"]{font-family:"Cascadia Mono","Noto Sans Mono CJK SC",monospace}.zeya-regex-status[data-theme="terminal"] .zrs-card{border-style:dashed;border-radius:0;box-shadow:none}.zeya-regex-status[data-theme="terminal"] .zrs-title::before{content:"> "}.zeya-regex-status[data-theme="terminal"] .zrs-field,.zeya-regex-status[data-theme="terminal"] .zrs-shared-item{border-style:dashed}
.zeya-regex-status[data-theme="polaroid"] .zrs-card{border:10px solid var(--z-card);border-bottom-width:24px;border-radius:2px;box-shadow:0 8px 22px rgba(0,0,0,.28)}.zeya-regex-status[data-theme="polaroid"] .zrs-field:nth-child(odd){transform:rotate(-.35deg)}.zeya-regex-status[data-theme="polaroid"] .zrs-field:nth-child(even){transform:rotate(.35deg)}
.zeya-regex-status[data-theme="ledger"] .zrs-card{border-radius:2px;background:repeating-linear-gradient(0deg,transparent 0 31px,color-mix(in srgb,var(--z-accent) 14%,transparent) 31px 32px),var(--z-card)}.zeya-regex-status[data-theme="ledger"] .zrs-field,.zeya-regex-status[data-theme="ledger"] .zrs-shared-item{border-width:0 0 1px;background:color-mix(in srgb,var(--z-card) 78%,transparent)}
.zeya-regex-status[data-theme="neon"] .zrs-card{border-color:var(--z-accent);box-shadow:0 0 8px var(--z-accent),inset 0 0 22px color-mix(in srgb,var(--z-accent) 12%,transparent)}.zeya-regex-status[data-theme="neon"] .zrs-title{text-shadow:0 0 9px var(--z-accent)}
.zeya-regex-status[data-theme="parchment"] .zrs-card{border:7px ridge color-mix(in srgb,var(--z-accent) 72%,#d6b77d);border-radius:4px;background:radial-gradient(circle at 20% 10%,rgba(255,255,255,.22),transparent 25%),var(--z-card)}.zeya-regex-status[data-theme="parchment"] .zrs-field{border-style:dotted}
.zeya-regex-status[data-theme="sakura"] .zrs-card{border:1px solid var(--z-accent);border-radius:26px}.zeya-regex-status[data-theme="sakura"] .zrs-header{border-bottom-style:dashed}.zeya-regex-status[data-theme="sakura"] .zrs-tab,.zeya-regex-status[data-theme="sakura"] .zrs-field{border-radius:18px}
.zeya-regex-status[data-theme="ocean"] .zrs-card{border-radius:24px 24px 8px 8px;background:linear-gradient(180deg,color-mix(in srgb,var(--z-accent) 14%,var(--z-card)),var(--z-card) 42%)}.zeya-regex-status[data-theme="ocean"] .zrs-meter{height:9px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--z-accent) 30%,transparent))}
.zeya-regex-status[data-theme="dossier"] .zrs-card{border-width:0 0 0 8px;border-radius:0;box-shadow:5px 5px 0 color-mix(in srgb,var(--z-text) 24%,transparent)}.zeya-regex-status[data-theme="dossier"] .zrs-header{border-bottom:3px solid var(--z-text)}.zeya-regex-status[data-theme="dossier"] .zrs-subtitle{letter-spacing:.3em}
.zeya-regex-status[data-theme="comic"] .zrs-card{border:3px solid var(--z-text);border-radius:14px;box-shadow:7px 7px 0 var(--z-text)}.zeya-regex-status[data-theme="comic"] .zrs-field,.zeya-regex-status[data-theme="comic"] .zrs-shared-item,.zeya-regex-status[data-theme="comic"] .zrs-tab{border:2px solid var(--z-text);border-radius:10px}.zeya-regex-status[data-theme="comic"] .zrs-title{font-weight:900;transform:skew(-4deg)}
.zeya-regex-status[data-theme="constellation"] .zrs-card{border-color:color-mix(in srgb,var(--z-accent) 64%,transparent);background:radial-gradient(circle at 12% 18%,#fff 0 1px,transparent 2px),radial-gradient(circle at 78% 34%,#fff 0 1px,transparent 2px),radial-gradient(circle at 55% 82%,#fff 0 1px,transparent 2px),var(--z-card);background-size:90px 90px,130px 130px,110px 110px}.zeya-regex-status[data-theme="constellation"] .zrs-tab{border-radius:50%}
.zeya-regex-status[data-theme="pixel"]{font-family:"Cascadia Mono","Noto Sans Mono CJK SC",monospace}.zeya-regex-status[data-theme="pixel"] .zrs-card{border:4px solid var(--z-text);border-radius:0;box-shadow:6px 6px 0 var(--z-accent)}.zeya-regex-status[data-theme="pixel"] .zrs-field,.zeya-regex-status[data-theme="pixel"] .zrs-shared-item,.zeya-regex-status[data-theme="pixel"] .zrs-tab,.zeya-regex-status[data-theme="pixel"] .zrs-collapse{border-radius:0}
.zeya-regex-status[data-theme="seed-note"] .zrs-card{border:0;border-radius:28px;box-shadow:0 9px 0 #9bd3c8}.zeya-regex-status[data-theme="seed-note"] .zrs-chrome{background:repeating-linear-gradient(45deg,#ed6f83 0 8px,#ffb7a8 8px 16px)}.zeya-regex-status[data-theme="seed-note"] :is(.zrs-field,.zrs-shared-item){border:2px dashed #ed6f83;border-radius:18px}.zeya-regex-status[data-theme="seed-note"] .zrs-tab{border-radius:8px 18px;transform:rotate(-1deg)}
.zeya-regex-status[data-theme="barrage-video"]{font-family:"Noto Sans SC",sans-serif}.zeya-regex-status[data-theme="barrage-video"] .zrs-card{clip-path:polygon(0 0,100% 0,100% 94%,95% 100%,0 100%);border-radius:0;background:linear-gradient(135deg,#11162f,#33236e)}.zeya-regex-status[data-theme="barrage-video"] .zrs-header{min-height:112px;align-items:flex-end;background:linear-gradient(120deg,transparent 42%,rgba(88,230,255,.18))}.zeya-regex-status[data-theme="barrage-video"] .zrs-chrome i{width:28px;border-radius:0}.zeya-regex-status[data-theme="barrage-video"] .zrs-meter>i{background:linear-gradient(90deg,#58e6ff,#ae8cff)}
.zeya-regex-status[data-theme="retro-bbs"]{font-family:"Cascadia Mono","Noto Sans Mono CJK SC",monospace}.zeya-regex-status[data-theme="retro-bbs"] .zrs-card{border:3px double #f4b942;border-radius:0;box-shadow:inset 0 0 26px #000}.zeya-regex-status[data-theme="retro-bbs"] .zrs-chrome{color:#06101b;background:#d6ff7f}.zeya-regex-status[data-theme="retro-bbs"] :is(.zrs-field,.zrs-shared-item){border-style:dashed}.zeya-regex-status[data-theme="retro-bbs"] .zrs-title::before{content:"SUBJECT: "}
.zeya-regex-status[data-theme="candy-live"] .zrs-card{border:5px solid #fff;border-radius:30px;background:radial-gradient(circle at 88% 12%,#ffe84d 0 28px,transparent 29px),radial-gradient(circle at 8% 60%,#8fe2df 0 36px,transparent 37px),#fff4fd}.zeya-regex-status[data-theme="candy-live"] .zrs-chrome{border-radius:0 0 60% 60%}.zeya-regex-status[data-theme="candy-live"] :is(.zrs-field,.zrs-shared-item,.zrs-tab){border:0;border-radius:22px;background:rgba(203,183,255,.3)}
.zeya-regex-status[data-theme="mono-chat"]{font-family:"Noto Sans SC",sans-serif}.zeya-regex-status[data-theme="mono-chat"] .zrs-card{border:2px solid #111;border-left:14px solid #111;border-radius:0;box-shadow:none}.zeya-regex-status[data-theme="mono-chat"] .zrs-chrome{background:#111}.zeya-regex-status[data-theme="mono-chat"] .zrs-header{border-bottom:6px solid #111}.zeya-regex-status[data-theme="mono-chat"] .zrs-field:nth-child(even){margin-left:14%;background:#111;color:#fff}.zeya-regex-status[data-theme="mono-chat"] .zrs-tab{border-radius:0}
.zeya-regex-status[data-theme="ink-diary"]{font-family:"Kaiti SC","STKaiti",serif}.zeya-regex-status[data-theme="ink-diary"] .zrs-card{border:0;border-radius:2px;background:linear-gradient(90deg,rgba(36,49,43,.07) 1px,transparent 1px),#f4efdf;background-size:22px 100%;box-shadow:5px 8px 0 #63766b}.zeya-regex-status[data-theme="ink-diary"] .zrs-chrome{justify-content:center;background:#24312b}.zeya-regex-status[data-theme="ink-diary"] .zrs-glyph{padding:4px;color:#fff;background:#a84132}.zeya-regex-status[data-theme="ink-diary"] :is(.zrs-field,.zrs-shared-item){border-width:0 0 1px;background:rgba(244,239,223,.72)}
.zeya-regex-status[data-theme="vinyl-mag"] .zrs-card{border:6px solid #15384f;border-radius:4px;box-shadow:8px 8px 0 #c65a31}.zeya-regex-status[data-theme="vinyl-mag"] .zrs-header{position:relative;min-height:118px;padding-left:42%;background:#f6e8c5}.zeya-regex-status[data-theme="vinyl-mag"] .zrs-header::before{content:"";position:absolute;left:18px;width:92px;height:92px;border-radius:50%;background:radial-gradient(circle,#f1bd3b 0 8px,#15384f 9px 42px,#f6e8c5 43px)}.zeya-regex-status[data-theme="vinyl-mag"] .zrs-tab{border-radius:0;text-transform:uppercase}
.zeya-regex-status[data-theme="y2k-podcast"] .zrs-card{border:1px solid #fff;border-radius:36px;background:linear-gradient(145deg,rgba(255,255,255,.82),rgba(183,246,255,.45),rgba(170,135,255,.38));box-shadow:inset 0 1px 1px #fff,0 10px 30px rgba(54,33,139,.25)}.zeya-regex-status[data-theme="y2k-podcast"] .zrs-chrome{color:#151c3d;background:linear-gradient(90deg,#b7f6ff,#fff,#cbb8ff,#d8ff58)}.zeya-regex-status[data-theme="y2k-podcast"] :is(.zrs-field,.zrs-shared-item,.zrs-tab){border:1px solid #fff;border-radius:999px;background:rgba(255,255,255,.35)}
.zeya-regex-status[data-theme="dada-collage"] .zrs-card{border:3px solid #111;border-radius:0;background:linear-gradient(12deg,transparent 72%,#1468a8 73% 82%,transparent 83%),#f7f2e7;box-shadow:10px 8px 0 #f2cf22}.zeya-regex-status[data-theme="dada-collage"] .zrs-title{font-size:1.7em;letter-spacing:-.08em;text-transform:uppercase}.zeya-regex-status[data-theme="dada-collage"] .zrs-field:nth-child(3n+1){transform:rotate(-1deg);background:#fff}.zeya-regex-status[data-theme="dada-collage"] .zrs-field:nth-child(3n+2){transform:rotate(1deg);color:#fff;background:#1468a8}.zeya-regex-status[data-theme="dada-collage"] .zrs-tab{border-radius:0;border:2px solid #111}
.zeya-regex-status[data-theme="rococo-zine"] .zrs-card{border:8px double #a98542;border-radius:42px 42px 12px 12px;background:radial-gradient(ellipse at top,#fff 0 15%,transparent 16%),#fff7e8}.zeya-regex-status[data-theme="rococo-zine"] .zrs-chrome{justify-content:center;color:#fff7e8;background:#9f3c5d}.zeya-regex-status[data-theme="rococo-zine"] .zrs-header{text-align:center}.zeya-regex-status[data-theme="rococo-zine"] .zrs-header>div{flex:1}.zeya-regex-status[data-theme="rococo-zine"] :is(.zrs-field,.zrs-shared-item){border-radius:18px 4px}.zeya-regex-status[data-theme="rococo-zine"] .zrs-tab{border-radius:50%}
.zeya-regex-status[data-theme="bauhaus-shop"]{font-family:"Arial Black","Noto Sans SC",sans-serif}.zeya-regex-status[data-theme="bauhaus-shop"] .zrs-card{border:4px solid #151515;border-radius:0;box-shadow:12px 12px 0 #0f3975}.zeya-regex-status[data-theme="bauhaus-shop"] .zrs-chrome{height:48px;background:linear-gradient(90deg,#d9271c 0 30%,#f3c62f 30% 68%,#0f3975 68%)}.zeya-regex-status[data-theme="bauhaus-shop"] .zrs-title{font-size:1.65em;letter-spacing:-.05em}.zeya-regex-status[data-theme="bauhaus-shop"] :is(.zrs-field,.zrs-shared-item,.zrs-tab){border:2px solid #151515;border-radius:0}
.zeya-regex-status[data-theme="memphis-food"] .zrs-card{border:3px solid #173e43;border-radius:18px;background:radial-gradient(circle,#1d9d95 0 3px,transparent 4px) 0 0/28px 28px,#fff2da;box-shadow:9px 9px 0 #f06b5b}.zeya-regex-status[data-theme="memphis-food"] .zrs-header{transform:skewY(-1deg);background:#f8c56a}.zeya-regex-status[data-theme="memphis-food"] :is(.zrs-field,.zrs-shared-item){border:2px solid #173e43;border-radius:5px 22px}.zeya-regex-status[data-theme="memphis-food"] .zrs-tab:nth-child(even){transform:rotate(2deg)}
.zeya-regex-status[data-theme="airline-passport"] .zrs-card{border:0;border-radius:24px;background:#f8edcf;box-shadow:0 0 0 5px #183a58,0 10px 0 #e34b35}.zeya-regex-status[data-theme="airline-passport"] .zrs-chrome{background:#183a58}.zeya-regex-status[data-theme="airline-passport"] .zrs-header{min-height:94px;background:linear-gradient(155deg,#8ccbe0 0 58%,#e34b35 59% 70%,#f8edcf 71%)}.zeya-regex-status[data-theme="airline-passport"] .zrs-content{border-top:2px dashed #183a58}.zeya-regex-status[data-theme="airline-passport"] .zrs-tab{border-radius:3px}
.zeya-regex-status[data-theme="swiss-rail"]{font-family:"Helvetica Neue","Noto Sans SC",sans-serif}.zeya-regex-status[data-theme="swiss-rail"] .zrs-card{border:0;border-radius:0;box-shadow:none}.zeya-regex-status[data-theme="swiss-rail"] .zrs-chrome{color:#fff;background:#e1251b}.zeya-regex-status[data-theme="swiss-rail"] .zrs-header{border-bottom:8px solid #111;background:#fff}.zeya-regex-status[data-theme="swiss-rail"] .zrs-title{font-size:1.7em;letter-spacing:-.06em}.zeya-regex-status[data-theme="swiss-rail"] :is(.zrs-shared,.zrs-fields){gap:1px;background:#111}.zeya-regex-status[data-theme="swiss-rail"] :is(.zrs-field,.zrs-shared-item,.zrs-tab){border:0;border-radius:0;background:#fff}
.zeya-regex-status[data-theme="aqua-weather"] .zrs-card{border:0;border-radius:32px;background:linear-gradient(160deg,#effdf7,#bce9ea);box-shadow:0 14px 35px rgba(24,80,102,.2)}.zeya-regex-status[data-theme="aqua-weather"] .zrs-chrome{color:#185066;background:linear-gradient(90deg,#ffe190,#77d8dc)}.zeya-regex-status[data-theme="aqua-weather"] .zrs-header{min-height:120px;align-items:flex-end;background:radial-gradient(circle at 82% 38%,#ffe190 0 36px,transparent 37px),linear-gradient(#8ddce2,#effdf7)}.zeya-regex-status[data-theme="aqua-weather"] :is(.zrs-field,.zrs-shared-item){border:0;border-radius:18px;background:rgba(255,255,255,.62)}
.zeya-regex-status[data-theme="illuminated-quest"] .zrs-card{border:10px ridge #7a263a;border-radius:2px;background:linear-gradient(90deg,transparent 48%,rgba(58,43,30,.08) 49% 51%,transparent 52%),#ead9a8;box-shadow:inset 0 0 0 3px #bf9a4a}.zeya-regex-status[data-theme="illuminated-quest"] .zrs-chrome{justify-content:center;background:#246044}.zeya-regex-status[data-theme="illuminated-quest"] .zrs-title::first-letter{font-size:2em;color:#7a263a}.zeya-regex-status[data-theme="illuminated-quest"] :is(.zrs-field,.zrs-shared-item){border:1px solid #7a263a;border-radius:0;background:rgba(234,217,168,.76)}
.zeya-regex-status[data-theme="noir-case"] .zrs-card{border:0;border-radius:0;background:#e5ddca;box-shadow:12px 12px 0 #000}.zeya-regex-status[data-theme="noir-case"] .zrs-chrome{background:#171717}.zeya-regex-status[data-theme="noir-case"] .zrs-header{min-height:106px;color:#e5ddca;background:linear-gradient(115deg,#171717 0 67%,#b61e24 68%)}.zeya-regex-status[data-theme="noir-case"] :is(.zrs-field,.zrs-shared-item){border-width:0 0 2px;border-radius:0}.zeya-regex-status[data-theme="noir-case"] .zrs-field:nth-child(odd){background:rgba(0,0,0,.08)}
.zeya-regex-status[data-theme="nouveau-tarot"] .zrs-card{border:4px double #bf9a4a;border-radius:48% 48% 18px 18px;background:radial-gradient(ellipse at top,rgba(191,154,74,.22),transparent 40%),#ede2cf}.zeya-regex-status[data-theme="nouveau-tarot"] .zrs-chrome{justify-content:center;background:#342849}.zeya-regex-status[data-theme="nouveau-tarot"] .zrs-header{text-align:center}.zeya-regex-status[data-theme="nouveau-tarot"] .zrs-header>div{flex:1}.zeya-regex-status[data-theme="nouveau-tarot"] :is(.zrs-field,.zrs-shared-item){border:1px solid #667447;border-radius:50% 50% 12px 12px}.zeya-regex-status[data-theme="nouveau-tarot"] .zrs-tab{border-radius:50%}
.zeya-regex-status[data-theme="holo-terminal"]{font-family:"Cascadia Mono",monospace}.zeya-regex-status[data-theme="holo-terminal"] .zrs-card{clip-path:polygon(18px 0,100% 0,100% calc(100% - 18px),calc(100% - 18px) 100%,0 100%,0 18px);border:1px solid #00f0ff;border-radius:0;background:repeating-linear-gradient(0deg,transparent 0 3px,rgba(0,240,255,.035) 4px),#0c1730;box-shadow:inset 0 0 34px rgba(0,240,255,.18)}.zeya-regex-status[data-theme="holo-terminal"] .zrs-chrome{color:#050611;background:linear-gradient(90deg,#00f0ff,#fe3ec8)}.zeya-regex-status[data-theme="holo-terminal"] :is(.zrs-field,.zrs-shared-item,.zrs-tab){border-radius:0;border-color:#00f0ff}.zeya-regex-status[data-theme="holo-terminal"] .zrs-title{text-shadow:2px 0 #fe3ec8}
.zeya-regex-status[data-theme="industrial-survival"]{font-family:"Arial Narrow","Noto Sans SC",sans-serif}.zeya-regex-status[data-theme="industrial-survival"] .zrs-card{border:5px solid #171713;border-radius:0;background:#4a4a3d;box-shadow:8px 8px 0 #171713}.zeya-regex-status[data-theme="industrial-survival"] .zrs-chrome{color:#171713;background:repeating-linear-gradient(135deg,#e6b62f 0 12px,#171713 12px 24px)}.zeya-regex-status[data-theme="industrial-survival"] .zrs-style-name{padding:4px;background:#e6b62f}.zeya-regex-status[data-theme="industrial-survival"] :is(.zrs-field,.zrs-shared-item){border:1px dashed #e6b62f;border-radius:0}.zeya-regex-status[data-theme="industrial-survival"] .zrs-tab{border-radius:0;text-transform:uppercase}
.zeya-regex-status[data-theme="clinical-file"]{font-family:"Noto Sans SC",sans-serif}.zeya-regex-status[data-theme="clinical-file"] .zrs-card{border:0;border-radius:16px;background:#f8fffd;box-shadow:0 8px 24px rgba(33,75,89,.14)}.zeya-regex-status[data-theme="clinical-file"] .zrs-chrome{color:#214b59;background:#d8eff0}.zeya-regex-status[data-theme="clinical-file"] .zrs-glyph{display:grid;place-items:center;width:22px;height:22px;color:#fff;background:#ed6c63}.zeya-regex-status[data-theme="clinical-file"] :is(.zrs-field,.zrs-shared-item){border:0;border-left:3px solid #65949b;border-radius:7px;background:#edf8f6}.zeya-regex-status[data-theme="clinical-file"] .zrs-meter{height:10px}
.zeya-regex-status[data-theme="brutal-paper"]{font-family:"Arial Black","Noto Sans SC",sans-serif}.zeya-regex-status[data-theme="brutal-paper"] .zrs-card{border:4px solid #090909;border-radius:0;background:#fff;box-shadow:12px 12px 0 #2447d8}.zeya-regex-status[data-theme="brutal-paper"] .zrs-chrome{color:#090909;background:#dbff38}.zeya-regex-status[data-theme="brutal-paper"] .zrs-header{border-bottom:8px solid #090909}.zeya-regex-status[data-theme="brutal-paper"] .zrs-title{font-size:1.5em;letter-spacing:-.08em}.zeya-regex-status[data-theme="brutal-paper"] :is(.zrs-field,.zrs-shared-item,.zrs-tab){border:3px solid #090909;border-radius:0}
.zeya-regex-status[data-theme="prism-dashboard"]{font-family:"Noto Sans SC",sans-serif}.zeya-regex-status[data-theme="prism-dashboard"] .zrs-card{border:1px solid rgba(255,255,255,.8);border-radius:26px;background:linear-gradient(135deg,rgba(255,255,255,.78),rgba(218,211,255,.45));box-shadow:0 16px 36px rgba(60,52,150,.22);backdrop-filter:blur(14px)}.zeya-regex-status[data-theme="prism-dashboard"] .zrs-chrome{background:linear-gradient(90deg,#725cff,#35b8ff)}.zeya-regex-status[data-theme="prism-dashboard"] :is(.zrs-field,.zrs-shared-item){border:1px solid #fff;border-radius:14px;background:rgba(255,255,255,.55)}.zeya-regex-status[data-theme="prism-dashboard"] .zrs-meter>i{background:linear-gradient(90deg,#725cff,#35b8ff)}
.zeya-regex-status[data-theme="deco-auction"] .zrs-card{border:1px solid #d6b35b;border-radius:0;background:#102d26;box-shadow:inset 0 0 0 5px #071b18,inset 0 0 0 6px #d6b35b}.zeya-regex-status[data-theme="deco-auction"] .zrs-chrome{justify-content:center;color:#071b18;background:#d6b35b}.zeya-regex-status[data-theme="deco-auction"] .zrs-header{text-align:center;border-bottom:4px double #d6b35b}.zeya-regex-status[data-theme="deco-auction"] .zrs-header>div{flex:1}.zeya-regex-status[data-theme="deco-auction"] :is(.zrs-field,.zrs-shared-item){border-width:0 0 1px;border-radius:0}.zeya-regex-status[data-theme="deco-auction"] .zrs-tab{border-radius:0;clip-path:polygon(8px 0,calc(100% - 8px) 0,100% 50%,calc(100% - 8px) 100%,8px 100%,0 50%)}
.zeya-regex-status[data-theme="broadcast-sport"]{font-family:"Arial Black","Noto Sans SC",sans-serif}.zeya-regex-status[data-theme="broadcast-sport"] .zrs-card{border:0;border-radius:0;background:#f4f7ff;box-shadow:10px 10px 0 #b9ff24}.zeya-regex-status[data-theme="broadcast-sport"] .zrs-chrome{color:#102469;background:#b9ff24}.zeya-regex-status[data-theme="broadcast-sport"] .zrs-header{color:#fff;background:linear-gradient(110deg,#102469 0 65%,#e84535 66%)}.zeya-regex-status[data-theme="broadcast-sport"] .zrs-title{font-size:1.55em;transform:skew(-8deg)}.zeya-regex-status[data-theme="broadcast-sport"] :is(.zrs-field,.zrs-shared-item,.zrs-tab){border:2px solid #102469;border-radius:0}.zeya-regex-status[data-theme="broadcast-sport"] .zrs-meter>i{background:#b9ff24}
.zeya-regex-status[data-theme="victorian-news"] .zrs-card{border:5px double #201d19;border-radius:0;background:#eee2c7;box-shadow:none}.zeya-regex-status[data-theme="victorian-news"] .zrs-chrome{justify-content:center;color:#eee2c7;background:#201d19}.zeya-regex-status[data-theme="victorian-news"] .zrs-header{text-align:center;border-block:3px double #201d19;background:transparent}.zeya-regex-status[data-theme="victorian-news"] .zrs-header>div{flex:1}.zeya-regex-status[data-theme="victorian-news"] .zrs-title{font-size:1.55em}.zeya-regex-status[data-theme="victorian-news"] :is(.zrs-field,.zrs-shared-item){border-width:0 0 1px;border-radius:0;background:transparent}.zeya-regex-status[data-theme="victorian-news"] .zrs-fields{column-rule:1px solid #201d19}
.zeya-regex-status[data-theme="naturalist-specimen"] .zrs-card{border:10px solid #202b08;border-radius:30px 4px;background:radial-gradient(ellipse at 85% 12%,rgba(115,128,92,.45) 0 55px,transparent 56px),#dcc9a7;box-shadow:8px 8px 0 #9a6652}.zeya-regex-status[data-theme="naturalist-specimen"] .zrs-chrome{background:#202b08}.zeya-regex-status[data-theme="naturalist-specimen"] .zrs-glyph{font-size:22px;color:#dcc9a7}.zeya-regex-status[data-theme="naturalist-specimen"] :is(.zrs-field,.zrs-shared-item){border-width:0 0 1px;border-color:#73805c;border-radius:16px 3px;background:rgba(220,201,167,.78)}
.zeya-regex-status[data-theme="cafe-receipt"]{font-family:"Cascadia Mono","Noto Sans Mono CJK SC",monospace}.zeya-regex-status[data-theme="cafe-receipt"] .zrs-card{border:0;border-radius:0;background:#fbf1d7;box-shadow:0 10px 0 rgba(59,38,29,.2);clip-path:polygon(0 0,100% 0,100% calc(100% - 8px),95% 100%,90% calc(100% - 8px),85% 100%,80% calc(100% - 8px),75% 100%,70% calc(100% - 8px),65% 100%,60% calc(100% - 8px),55% 100%,50% calc(100% - 8px),45% 100%,40% calc(100% - 8px),35% 100%,30% calc(100% - 8px),25% 100%,20% calc(100% - 8px),15% 100%,10% calc(100% - 8px),5% 100%,0 calc(100% - 8px))}.zeya-regex-status[data-theme="cafe-receipt"] .zrs-chrome{color:#fbf1d7;background:#3b261d}.zeya-regex-status[data-theme="cafe-receipt"] :is(.zrs-field,.zrs-shared-item){border-width:0 0 1px;border-style:dashed;border-radius:0;background:transparent}.zeya-regex-status[data-theme="cafe-receipt"] .zrs-tab{border-radius:0}
.zeya-regex-status[data-theme="pop-ticket"]{font-family:"Arial Black","Noto Sans SC",sans-serif}.zeya-regex-status[data-theme="pop-ticket"] .zrs-card{border:4px solid #111;border-radius:18px;background:radial-gradient(circle,#111 0 1px,transparent 1.5px) 0 0/9px 9px,#ffe43e;box-shadow:9px 9px 0 #ec2f89}.zeya-regex-status[data-theme="pop-ticket"] .zrs-chrome{color:#111;background:#18bed1}.zeya-regex-status[data-theme="pop-ticket"] .zrs-header{background:#ffe43e}.zeya-regex-status[data-theme="pop-ticket"] :is(.zrs-field,.zrs-shared-item){border:3px solid #111;border-radius:50% 8px;background:#fff}.zeya-regex-status[data-theme="pop-ticket"] .zrs-tab{border:3px solid #111;border-radius:0;background:#18bed1}
.zeya-regex-status[data-theme="porcelain-memory"] .zrs-card{border:8px double #2458a6;border-radius:28px;background:radial-gradient(circle at 0 0,transparent 0 17px,rgba(36,88,166,.12) 18px 20px,transparent 21px) 0 0/42px 42px,#f8f7ee;box-shadow:0 10px 0 #43836d}.zeya-regex-status[data-theme="porcelain-memory"] .zrs-chrome{justify-content:center;color:#f8f7ee;background:#2458a6}.zeya-regex-status[data-theme="porcelain-memory"] .zrs-header{text-align:center}.zeya-regex-status[data-theme="porcelain-memory"] .zrs-header>div{flex:1}.zeya-regex-status[data-theme="porcelain-memory"] :is(.zrs-field,.zrs-shared-item){border:1px solid #2458a6;border-radius:4px 22px;background:rgba(248,247,238,.82)}.zeya-regex-status[data-theme="porcelain-memory"] .zrs-tab{border-radius:50%;color:#2458a6}
@media(max-width:520px){.zeya-regex-status[data-theme="polaroid"] .zrs-field{transform:none}.zeya-regex-status[data-theme="comic"] .zrs-card,.zeya-regex-status[data-theme="pixel"] .zrs-card,.zeya-regex-status[data-theme="obsidian"] .zrs-card{box-shadow:3px 3px 0 color-mix(in srgb,var(--z-text) 70%,transparent)}}`;

function generatedReplacement(rule) {
    const renderConfig = {
        title: rule.title,
        subtitle: rule.subtitle,
        theme: rule.theme,
        styleName: rule.styleName,
        glyph: rule.glyph,
        layout: rule.layout,
        structure: rule.structure,
        structureName: rule.structureName,
        palette: rule.palette,
        media: rule.media,
        pages: rule.pages,
        sharedFields: rule.sharedFields,
        pageFields: rule.pageFields,
    };
    const configJson = safeJsonForScript(renderConfig);
    const paletteStyle = rule.palette
        ? `--z-accent:${rule.palette.accent};--z-bg:${rule.palette.background};--z-card:${rule.palette.card};--z-text:${rule.palette.text};--z-muted:${rule.palette.muted};`
        : '';
    return `\`\`\`html
<div class="zeya-regex-status" data-theme="${rule.theme}" data-structure="${rule.structure}" data-layout="${rule.layout}" style="${paletteStyle}">
  <textarea class="zrs-source" hidden>$1</textarea>
  <section class="zrs-card">
    <div class="zrs-chrome" aria-hidden="true"><span class="zrs-glyph"></span><span class="zrs-style-name"></span><i></i><i></i><i></i></div>
    <header class="zrs-header">
      <div><h3 class="zrs-title"></h3><p class="zrs-subtitle"></p></div>
      <button class="zrs-collapse" type="button" aria-label="展开或收起">⌄</button>
    </header>
    <div class="zrs-content">
      <div class="zrs-structure-head"></div>
      <div class="zrs-shared"></div>
      <nav class="zrs-tabs" aria-label="状态页切换"></nav>
      <div class="zrs-fields"></div>
    </div>
  </section>
</div>
<style>
.zeya-regex-status,.zeya-regex-status *{box-sizing:border-box}.zeya-regex-status{--z-accent:#9b6849;--z-bg:#f2e5c5;--z-card:#f8efd7;--z-text:#493a2b;--z-muted:#7a6954;width:min(100%,620px);margin:14px auto;color:var(--z-text);font-family:"Noto Serif SC","Songti SC",serif}.zeya-regex-status[data-theme="envelope"]{--z-accent:#9b4b58;--z-bg:#4a566e;--z-card:#faf6ed;--z-text:#2a3242;--z-muted:#687185}.zeya-regex-status[data-theme="glass"]{--z-accent:#6ec7d9;--z-bg:#102631;--z-card:#173844;--z-text:#e9f8fb;--z-muted:#9dbdc5}.zeya-regex-status[data-theme="obsidian"]{--z-accent:#d7d7d7;--z-bg:#090909;--z-card:#141414;--z-text:#f3f3f3;--z-muted:#a7a7a7}.zrs-card{position:relative;overflow:hidden;border:2px solid var(--z-accent);border-radius:14px;background:linear-gradient(145deg,color-mix(in srgb,var(--z-accent) 8%,transparent),transparent 44%),var(--z-card);box-shadow:0 12px 28px rgba(0,0,0,.22)}.zrs-chrome{display:flex;align-items:center;gap:7px;min-height:25px;padding:5px 12px;color:var(--z-card);background:var(--z-accent);font:800 9px/1.2 sans-serif;letter-spacing:.12em;text-transform:uppercase}.zrs-glyph{font-size:14px}.zrs-style-name{margin-right:auto}.zrs-chrome i{width:7px;height:7px;border:1px solid currentColor;border-radius:50%}.zeya-regex-status[data-theme="newspaper"] .zrs-card{border:4px double var(--z-accent);border-radius:2px}.zeya-regex-status[data-theme="timeline"] .zrs-card{border-radius:22px;border-color:color-mix(in srgb,var(--z-muted) 60%,transparent)}.zeya-regex-status[data-theme="timeline"] .zrs-content{margin-left:18px;border-left:1px solid var(--z-muted)}.zeya-regex-status[data-theme="timeline"] .zrs-shared-item,.zeya-regex-status[data-theme="timeline"] .zrs-field{position:relative;border-radius:12px}.zeya-regex-status[data-theme="timeline"] .zrs-shared-item::before,.zeya-regex-status[data-theme="timeline"] .zrs-field::before{content:"";position:absolute;left:-20px;top:17px;width:7px;height:7px;border:2px solid var(--z-card);border-radius:50%;background:var(--z-accent)}.zeya-regex-status[data-theme="minimal"] .zrs-card{border:0;border-radius:0;box-shadow:none}.zeya-regex-status[data-theme="minimal"] .zrs-header{padding-inline:0;background:transparent}.zeya-regex-status[data-theme="minimal"] .zrs-content{padding-inline:0}.zeya-regex-status[data-theme="minimal"] .zrs-shared-item,.zeya-regex-status[data-theme="minimal"] .zrs-field{border-width:0 0 1px;background:transparent}.zeya-regex-status[data-theme="minimal"] .zrs-tab{border-width:0 0 1px;border-radius:0}.zrs-header{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid color-mix(in srgb,var(--z-accent) 45%,transparent);background:color-mix(in srgb,var(--z-bg) 18%,var(--z-card))}.zrs-title{margin:0;font-size:1.12em;letter-spacing:.16em}.zrs-subtitle{margin:3px 0 0;color:var(--z-muted);font:600 .68em/1.2 sans-serif;letter-spacing:.2em}.zrs-collapse{min-width:36px;min-height:36px;border:1px solid color-mix(in srgb,var(--z-accent) 50%,transparent);border-radius:50%;color:var(--z-text);background:transparent;cursor:pointer}.zrs-content{padding:13px}.zrs-structure-head{display:flex;gap:10px;align-items:center;margin:0 0 11px}.zrs-avatar{width:64px;height:64px;flex:0 0 64px;border:2px solid var(--z-accent);border-radius:50%;object-fit:cover;background:color-mix(in srgb,var(--z-bg) 30%,var(--z-card))}.zrs-cover{display:block;width:100%;max-height:220px;object-fit:cover;border:1px solid color-mix(in srgb,var(--z-accent) 34%,transparent)}.zrs-media-copy{min-width:0}.zrs-media-copy b,.zrs-media-copy small{display:block}.zrs-media-copy small{margin-top:4px;color:var(--z-muted)}.zrs-audio{width:100%;min-height:40px;margin-top:9px}.zrs-shared{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:7px;margin-bottom:11px}.zrs-shared-item,.zrs-field{min-width:0;padding:9px 10px;border:1px solid color-mix(in srgb,var(--z-accent) 26%,transparent);background:color-mix(in srgb,var(--z-bg) 7%,transparent)}.zrs-label{display:block;margin-bottom:3px;color:var(--z-muted);font:600 .72em/1.35 sans-serif;letter-spacing:.08em}.zrs-value{display:block;white-space:pre-wrap;overflow-wrap:anywhere}.zrs-tabs{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 11px}.zrs-tab{flex:1 1 90px;padding:8px 10px;border:1px solid color-mix(in srgb,var(--z-accent) 38%,transparent);border-radius:999px;color:var(--z-text);background:transparent;cursor:pointer}.zrs-tab.is-active{color:var(--z-card);background:var(--z-accent)}.zrs-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.zeya-regex-status[data-layout="stack"] .zrs-fields{grid-template-columns:1fr}.zrs-field[data-kind="long"]{grid-column:1/-1}.zrs-meter{height:7px;margin-top:7px;overflow:hidden;border-radius:999px;background:color-mix(in srgb,var(--z-accent) 16%,transparent)}.zrs-meter>i{display:block;width:0;height:100%;background:var(--z-accent);transition:width .35s ease}.zeya-regex-status[data-structure="social"] .zrs-fields{display:flex;flex-wrap:wrap}.zeya-regex-status[data-structure="social"] .zrs-field{flex:1 1 120px;border-radius:16px}.zeya-regex-status[data-structure="social"] .zrs-field:nth-child(2),.zeya-regex-status[data-structure="social"] .zrs-field:nth-child(3){flex-basis:100%}.zeya-regex-status[data-structure="forum"] .zrs-fields{counter-reset:floor}.zeya-regex-status[data-structure="forum"] .zrs-field{position:relative;padding-left:45px;border-width:0 0 1px}.zeya-regex-status[data-structure="forum"] .zrs-field::before{counter-increment:floor;content:"#" counter(floor);position:absolute;left:9px;color:var(--z-accent);font-weight:800}.zeya-regex-status[data-structure="chat"] .zrs-field{max-width:88%;border-radius:18px 18px 18px 4px}.zeya-regex-status[data-structure="chat"] .zrs-field:nth-child(even){margin-left:auto;border-radius:18px 18px 4px 18px;color:var(--z-card);background:var(--z-accent)}.zeya-regex-status[data-structure="chat"] .zrs-field:nth-child(even) .zrs-label{color:inherit;opacity:.75}.zeya-regex-status[data-structure="collage"] .zrs-fields{padding:10px;background:color-mix(in srgb,var(--z-bg) 36%,transparent)}.zeya-regex-status[data-structure="collage"] .zrs-field{border-radius:2px;box-shadow:3px 4px 0 color-mix(in srgb,var(--z-text) 15%,transparent)}.zeya-regex-status[data-structure="collage"] .zrs-field:nth-child(3n+1){transform:rotate(-1deg)}.zeya-regex-status[data-structure="collage"] .zrs-field:nth-child(3n){transform:rotate(1deg)}.zeya-regex-status[data-structure="music"] .zrs-structure-head{display:block}.zeya-regex-status[data-structure="music"] .zrs-cover{aspect-ratio:1;max-height:280px}.zeya-regex-status[data-structure="quest"] .zrs-field{position:relative;margin-left:16px;border-left:4px solid var(--z-accent)}.zeya-regex-status[data-structure="casefile"] .zrs-field{border-radius:0;border-width:0 0 2px}.zeya-regex-status.is-collapsed .zrs-content{display:none}.zeya-regex-status.is-collapsed .zrs-collapse{transform:rotate(-90deg)}@media(max-width:520px){.zrs-fields{grid-template-columns:1fr}.zrs-field{grid-column:1}.zrs-header{padding:12px}.zrs-content{padding:10px}.zrs-avatar{width:54px;height:54px;flex-basis:54px}.zeya-regex-status[data-structure="collage"] .zrs-field{transform:none!important}}
${STATUS_THEME_CSS}
.zeya-regex-status .zrs-meter{position:relative;height:20px!important;overflow:visible;background:transparent!important}.zeya-regex-status .zrs-meter::before{content:"";position:absolute;inset:7px 0;border-radius:999px;background:color-mix(in srgb,var(--z-accent) 16%,transparent)}.zeya-regex-status .zrs-meter>i{position:absolute;left:0;top:7px;height:6px;border-radius:999px;transition:width .2s ease}.zeya-regex-status .zrs-meter-marker{position:absolute;top:50%;z-index:1;display:grid;place-items:center;min-width:22px;height:22px;transform:translate(-50%,-50%);font-size:17px;line-height:1;filter:drop-shadow(0 1px 1px color-mix(in srgb,var(--z-text) 35%,transparent));transition:left .2s ease}
</style>
<script>
(function(script){
  var root=script.previousElementSibling.previousElementSibling;
  if(!root||!root.classList.contains('zeya-regex-status'))return;
  var config=${configJson};
  var raw=root.querySelector('.zrs-source').value||'';
  var records={};
  var lines=raw.split(/\\r?\\n/);
  for(var i=0;i<lines.length;i++){
    var line=lines[i].trim();
    if(line.charAt(0)!=='['||line.charAt(line.length-1)!==']')continue;
    var parts=line.slice(1,-1).split('|').map(function(value){return value.trim();});
    var key=parts.shift();if(key)records[key]=parts;
  }
  var title=root.querySelector('.zrs-title');var subtitle=root.querySelector('.zrs-subtitle');
  title.textContent=config.title;subtitle.textContent=config.subtitle;
  root.querySelector('.zrs-glyph').textContent=config.glyph;root.querySelector('.zrs-style-name').textContent=config.styleName;
  function make(tag,className,text){var el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=String(text);return el;}
  var mediaHost=root.querySelector('.zrs-structure-head');
  function addImage(url,className,alt){if(!url)return null;var img=make('img',className);img.src=url;img.alt=alt||'';img.loading='lazy';img.referrerPolicy='no-referrer';img.addEventListener('error',function(){img.remove();});mediaHost.append(img);return img;}
  if(config.media.avatarUrl){addImage(config.media.avatarUrl,'zrs-avatar',config.media.imageAlt);var copy=make('div','zrs-media-copy');copy.append(make('b','',config.structureName),make('small','',config.media.avatarSource==='character'?'当前角色头像':config.media.avatarSource==='user'?'当前 user 头像':'自定义头像'));mediaHost.append(copy);}
  if(config.media.imageUrl)addImage(config.media.imageUrl,'zrs-cover',config.media.imageAlt);
  if(config.media.audioUrl){var audio=make('audio','zrs-audio');audio.controls=true;audio.preload='metadata';audio.src=config.media.audioUrl;mediaHost.append(audio);}
  if(!mediaHost.children.length)mediaHost.remove();
  function addValue(host,field,value){var item=make('div',host.classList.contains('zrs-shared')?'zrs-shared-item':'zrs-field');item.dataset.kind=field.kind;item.append(make('span','zrs-label',field.label),make('span','zrs-value',value||'—'));if(field.kind==='progress'){var n=Number(String(value||'').match(/-?\\d+(?:\\.\\d+)?/)?.[0]);if(!Number.isFinite(n))n=0;n=Math.max(0,Math.min(100,n));var meter=make('span','zrs-meter');var fill=make('i');fill.style.width=n+'%';var marker=make('span','zrs-meter-marker',config.glyph||'✦');marker.style.left=n+'%';marker.setAttribute('aria-label','AI 动态数值位置 '+n+'%');meter.append(fill,marker);item.append(meter);}host.append(item);}
  var shared=root.querySelector('.zrs-shared');var sharedValues=records.Shared||[];
  config.sharedFields.forEach(function(field,index){addValue(shared,field,sharedValues[index]);});
  if(!config.sharedFields.length)shared.remove();
  var tabs=root.querySelector('.zrs-tabs');var fields=root.querySelector('.zrs-fields');
  function showPage(index){var page=config.pages[index];var values=records[page.id]||[];fields.replaceChildren();config.pageFields.forEach(function(field,fieldIndex){addValue(fields,field,values[fieldIndex]);});root.querySelectorAll('.zrs-tab').forEach(function(button,buttonIndex){button.classList.toggle('is-active',buttonIndex===index);});}
  config.pages.forEach(function(page,index){var button=make('button','zrs-tab',page.label);button.type='button';button.addEventListener('click',function(){showPage(index);});tabs.append(button);});
  if(config.pages.length<2)tabs.style.display='none';showPage(0);
  root.querySelector('.zrs-collapse').addEventListener('click',function(){root.classList.toggle('is-collapsed');});
})(document.currentScript);
</script>
\`\`\``;
}

export function buildRegexScript(input) {
    const rule = normalizeRule(input);
    return {
        id: rule.ruleId,
        scriptName: `九一 · ${rule.ruleName}`,
        disabled: false,
        runOnEdit: true,
        findRegex: `/<${rule.tagName}>\\s*([\\s\\S]*?)\\s*<\\/${rule.tagName}>/i`,
        trimStrings: [],
        replaceString: generatedReplacement(rule),
        placement: [2],
        substituteRegex: 0,
        minDepth: null,
        maxDepth: null,
        markdownOnly: true,
        promptOnly: false,
    };
}

export function makePreviewRecords(input) {
    const rule = normalizeRule(input);
    const sampleFor = field => {
        if (field.kind === 'progress') return 'AI动态数值';
        if (field.kind === 'currency') return 'AI动态金额';
        if (field.kind === 'long') return '这里显示 AI 根据当前剧情生成的长文本。';
        return 'AI动态填写';
    };
    return {
        rule,
        shared: rule.sharedFields.map(sampleFor),
        pages: rule.pages.map(page => ({ page, values: rule.pageFields.map(sampleFor) })),
    };
}

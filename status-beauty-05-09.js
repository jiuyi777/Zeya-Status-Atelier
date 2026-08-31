const STATUS_BEAUTY_05_09_STYLESHEET_URL = new URL('./status-beauty-05-09.css?v=0.11.8', import.meta.url).href;
const STATUS_BEAUTY_05_CLOUDS_URL = new URL('./assets/status-beauty/images/cutout-clouds.png', import.meta.url).href;
const STATUS_BEAUTY_06_CARD_ART_URL = new URL('./assets/status-beauty/images/cutout-botanical-cards-butterfly.png', import.meta.url).href;
const STATUS_BEAUTY_08_BACKDROP_URL = new URL('./assets/status-beauty/images/generated-design-08-vinyl-backdrop.png', import.meta.url).href;
const STATUS_BEAUTY_09_FRAME_URL = new URL('./assets/status-beauty/images/frame-mirror-botanical-generated-alpha.png', import.meta.url).href;

export const STATUS_BEAUTY_05_09_PRESETS = Object.freeze([
    {
        id: 'beauty-current-status-05', name: '05 · 角色当前状态', description: '头像、时空、好感、身体动作与双层对话',
        title: '角色当前状态', subtitle: 'CHARACTER STATUS', layout: 'stack',
        pagesText: '当前角色|填写当前主要角色或视角',
        fields: [
            ['时间', '填写当前剧情时间', 'text', 'time'],
            ['位置', '填写角色当前所在位置', 'text', 'location'],
            ['好感度', '填写0到100之间的整数，只写数字', 'progress', 'affection'],
            ['好感变化', '概括本轮好感变化或当前阶段', 'text', 'affection_note'],
            ['身体情况', '具体填写角色当前身体状况与体感', 'long', 'body'],
            ['双手动作', '具体填写角色双手正在做什么', 'long', 'hands'],
            ['当前动作', '具体填写角色此刻正在进行的动作', 'long', 'action'],
            ['对白', '填写角色此刻说出口的一句短话', 'long', 'spoken'],
            ['心声', '第一人称填写角色没有说出口的真实想法', 'long', 'inner_voice'],
        ],
    },
    {
        id: 'beauty-card-status-06', name: '06 · 牌面角色状态', description: '可左右滑动的四张状态牌与角色头像',
        title: '牌面角色状态', subtitle: 'CHARACTER STATUS CARDS', layout: 'stack',
        pagesText: '当前角色|填写当前主要角色或视角',
        fields: [
            ['时间', '填写当前剧情时间', 'text', 'time'],
            ['位置', '填写角色当前所在位置', 'text', 'location'],
            ['情愫', '填写角色当前情愫数值或简短阶段', 'text', 'affection'],
            ['情愫状态', '概括本轮情愫变化与原因', 'long', 'affection_note'],
            ['身体情况', '概括角色当前最明显的身体状态', 'text', 'body'],
            ['身体细节', '补充呼吸、体温或肌肉状态等身体细节', 'long', 'body_note'],
            ['双手动作', '概括角色双手当前动作', 'text', 'hands'],
            ['双手细节', '补充另一只手或动作细节', 'long', 'hands_note'],
            ['心情', '填写角色当前核心心情', 'text', 'mood'],
            ['心情细节', '补充角色没有直接表现出的情绪细节', 'long', 'mood_note'],
            ['衣着', '具体描述角色当前衣着与配饰', 'long', 'attire'],
            ['欲念', '填写角色当前欲念数值或强度', 'text', 'desire'],
            ['欲念状态', '概括欲念当前处于克制、动摇或其他状态', 'text', 'desire_note'],
            ['心声', '第一人称填写角色没有说出口的真实想法', 'long', 'inner_voice'],
        ],
    },
    {
        id: 'beauty-letter-status-07', name: '07 · 角色此刻来信', description: '信纸、寄件头像、邮戳与此刻身体行动',
        title: '角色此刻来信', subtitle: 'CURRENT LETTER', layout: 'stack',
        pagesText: '当前角色|填写当前主要角色或视角',
        fields: [
            ['时间', '填写当前剧情时间', 'text', 'time'],
            ['位置', '填写角色当前所在位置', 'text', 'location'],
            ['好感度', '填写0到100之间的整数，只写数字', 'progress', 'affection'],
            ['好感状态', '概括当前好感阶段或变化', 'text', 'affection_note'],
            ['身体情况', '具体填写角色当前身体状况与体感', 'long', 'body'],
            ['双手动作', '具体填写角色双手正在做什么', 'long', 'hands'],
            ['正在做', '具体填写角色此刻正在进行的动作', 'long', 'action'],
            ['心声', '以角色口吻写真正想说却没有说出口的话', 'long', 'inner_voice'],
            ['附言', '填写一条简短附言', 'long', 'postscript'],
        ],
    },
    {
        id: 'beauty-record-status-08', name: '08 · 唱片角色状态', description: '冰蓝唱片舞台、角色头像与曲目式状态列表',
        title: '正在播放的角色状态', subtitle: 'NOW PLAYING', layout: 'stack',
        pagesText: '当前角色|填写当前主要角色或视角',
        fields: [
            ['时间', '填写当前剧情时间', 'text', 'time'],
            ['位置', '填写角色当前所在位置', 'text', 'location'],
            ['好感度', '填写0到100之间的整数，只写数字', 'progress', 'affection'],
            ['身体情况', '具体填写角色当前身体状况与体感', 'long', 'body'],
            ['双手动作', '具体填写角色双手正在做什么', 'long', 'hands'],
            ['隐秘行动', '填写角色正在暗中进行或刚完成的行动', 'long', 'hidden_action'],
            ['近期计划', '填写角色接下来最可能执行的计划', 'long', 'plan'],
            ['心声', '第一人称填写角色没有说出口的真实想法', 'long', 'inner_voice'],
        ],
    },
    {
        id: 'beauty-archive-status-09', name: '09 · 角色档案', description: '镜框头像与可点击、可拖动的三页角色档案',
        title: '角色档案', subtitle: 'CHARACTER ARCHIVE', layout: 'stack',
        pagesText: '当前角色|填写当前主要角色或视角',
        fields: [
            ['时间', '填写当前剧情时间', 'text', 'time'],
            ['位置', '填写角色当前所在位置', 'text', 'location'],
            ['好感度', '填写0到100之间的整数，只写数字', 'progress', 'affection'],
            ['好感状态', '概括当前好感阶段或变化', 'text', 'affection_note'],
            ['对白', '填写角色此刻说出口的一句短话', 'long', 'whisper'],
            ['体温', '填写角色当前体温或冷热状态', 'text', 'temperature'],
            ['呼吸', '填写角色当前呼吸状态', 'text', 'breathing'],
            ['肩颈', '填写角色当前肩颈或上身状态', 'text', 'shoulders'],
            ['掌心', '填写角色当前掌心与手部体感', 'text', 'palms'],
            ['此刻体感', '具体概括角色此刻整体身体感受', 'long', 'sensation'],
            ['当前章节', '填写当前剧情章节或阶段', 'text', 'chapter'],
            ['御神签', '填写与当前剧情对应的签位与简短签意', 'long', 'fortune'],
            ['心声', '第一人称填写角色没有说出口的真实想法', 'long', 'inner_voice'],
        ],
    },
]);

export const STATUS_BEAUTY_05_09_IDS = Object.freeze(STATUS_BEAUTY_05_09_PRESETS.map(item => item.id));

const templates = Object.freeze({
    'beauty-current-status-05': `
<article class="status-card design-05">
  <button class="fold" type="button" aria-expanded="true" aria-label="收起角色状态栏"><span aria-hidden="true">⌃</span></button>
  <div class="compact-summary" aria-hidden="true"><img class="summary-avatar" data-st-avatar alt=""><strong data-design-title>角色状态</strong><span><i data-value="0"></i> · <i data-value="1"></i></span><b><i data-label="2">好感度</i> <i data-value="2"></i></b><em data-value="8"></em></div>
  <div class="expanded-content">
    <header class="status-heading"><p>CHARACTER STATUS · P05</p><h1 data-design-title>角色当前状态</h1><span>每一项都是此刻正在发生的事</span></header>
    <figure class="identity-card"><div class="portrait-frame"><img class="avatar" data-st-avatar alt="真实角色头像"></div><figcaption><b>正在同行</b><span>角色此刻记录</span></figcaption></figure>
    <section class="status-board"><div class="moment-row"><article class="moment location"><span data-label="1">位置</span><strong data-value="1"></strong></article><article class="moment time"><span data-label="0">时间</span><strong data-value="0"></strong></article></div>
      <article class="affection"><div class="affection-copy"><span data-label="2">好感度</span><strong data-value="2"></strong><small>/ 100 · <i data-value="3"></i></small></div><div class="affection-track" aria-label="好感度"><i data-progress="2"></i></div></article>
      <div class="condition-grid"><article><span data-label="4">身体情况</span><strong data-value="4"></strong></article><article><span data-label="5">双手动作</span><strong data-value="5"></strong></article><article class="current-action"><span data-label="6">当前动作</span><strong data-value="6"></strong></article></div>
      <div class="small-moments"><article class="spoken-line"><span data-label="7">对白</span><p data-value="7"></p></article><article class="inner-thought"><span data-label="8">心声</span><p data-value="8"></p></article></div>
    </section><img class="single-collage" data-design-asset="clouds" alt="">
  </div>
</article>`,
    'beauty-card-status-06': `
<article class="status-card design-06">
  <button class="fold" type="button" aria-expanded="true" aria-label="收起第六张状态栏"><span>收起状态</span></button>
  <div class="compact-summary" aria-hidden="true"><strong>牌面状态</strong><span><i data-value="0"></i> · <i data-value="1"></i></span><b><i data-label="2">情愫</i> <i data-value="2"></i></b><em><i data-value="4"></i>，<i data-value="6"></i></em></div>
  <div class="expanded-content">
    <header class="table-heading"><p>P06 · CHARACTER STATUS</p><h1 data-design-title>牌面角色状态</h1><span>抽到的每一张，都是他没有说出口的此刻</span></header>
    <figure class="portrait-card"><img class="avatar" data-st-avatar alt="真实角色头像"><div class="avatar-placeholder" aria-hidden="true"><strong>A</strong><span>角色头像</span><small>导入后自动读取</small></div><figcaption><b data-character-name>角色</b><span>此刻牌面记录</span></figcaption></figure>
    <section class="card-table"><div class="table-moment"><article><span data-label="0">时间</span><strong data-value="0"></strong></article><article><span data-label="1">位置</span><strong data-value="1"></strong></article></div><small class="swipe-hint">← 左右滑动查看牌面 →</small>
      <div class="status-hand" aria-label="可左右滑动的角色状态牌"><article class="playing-card affection"><span>♥ <i data-label="2">情愫</i></span><strong data-value="2"></strong><small data-value="3"></small></article><article class="playing-card body"><span>♠ <i data-label="4">身体情况</i></span><strong data-value="4"></strong><small data-value="5"></small></article><article class="playing-card hands"><span>♣ <i data-label="6">双手动作</i></span><strong data-value="6"></strong><small data-value="7"></small></article><article class="playing-card mood-art"><img data-design-asset="cardArt" alt="蝴蝶牌面"><span>♦ <i data-label="8">心情</i></span><strong data-value="8"></strong><small data-value="9"></small></article></div>
      <article class="attire"><span data-label="10">衣着</span><strong data-value="10"></strong><b><i data-label="11">欲念</i> <i data-value="11"></i> · <i data-value="12"></i></b></article><article class="thought-card"><span data-label="13">心声</span><p data-value="13"></p><small>没有说出口的话，留在牌底。</small></article>
    </section>
  </div>
</article>`,
    'beauty-letter-status-07': `
<article class="status-card design-07">
  <button class="fold" type="button" aria-expanded="true" aria-label="收起第七张状态栏"><span>收起来信</span></button>
  <div class="compact-summary" aria-hidden="true"><strong data-design-title>角色此刻来信</strong><span><i data-value="0"></i> · <i data-value="1"></i></span><b><i data-label="2">好感度</i> <i data-value="2"></i></b><em data-value="7"></em></div>
  <div class="expanded-content">
    <header class="post-heading"><p>P07 · CURRENT LETTER</p><h1 data-design-title>角色此刻来信</h1><span>一封正在此刻写下、也正在此刻抵达的状态信</span></header>
    <section class="mail-scene"><div class="envelope-back" aria-hidden="true"></div><article class="letter-sheet"><div class="route-strip"><span>FROM / <i data-value="1"></i></span><span>TO / 正在读信的你</span><b data-value="0"></b></div>
      <div class="letter-copy"><p class="salutation">见字如晤。</p><div class="whereabouts"><span data-label="1">位置</span><strong data-value="1"></strong></div><div class="written-status"><span data-label="4">身体情况</span><strong data-value="4"></strong></div><div class="written-status"><span data-label="5">双手动作</span><strong data-value="5"></strong></div><div class="written-status"><span data-label="6">正在做</span><strong data-value="6"></strong></div><article class="letter-thought"><span data-label="7">心声</span><p data-value="7"></p></article><p class="postscript"><span>P.S.</span> <i data-value="8"></i></p></div>
      <figure class="sender-stamp"><img class="avatar" data-st-avatar alt="真实角色头像"><figcaption><b data-character-name>角色</b><span>寄件人 · 等待中</span></figcaption></figure><div class="postmark" aria-hidden="true"><span>此刻</span><b>NOW</b></div><div class="affection-seal"><span data-label="2">好感度</span><strong data-value="2"></strong><small data-value="3"></small></div><div class="postal-note">DELIVERED · NOW</div>
    </article></section>
  </div>
</article>`,
    'beauty-record-status-08': `
<article class="status-card design-08">
  <button class="fold" type="button" aria-expanded="true" aria-label="收起第八张状态栏"><span>收起播放</span></button>
  <div class="compact-summary" aria-hidden="true"><strong>正在播放的状态</strong><span><i data-value="0"></i> · <i data-value="1"></i></span><b><i data-label="2">好感度</i> <i data-value="2"></i></b><em data-value="7"></em></div>
  <div class="expanded-content"><img class="generated-backdrop" data-design-asset="backdrop" alt="冰蓝唱片舞台"><header class="record-heading"><p>NOW PLAYING · P08</p><h1 data-design-title>正在播放的角色状态</h1><span>TRACK 08 / 幕间没有结束</span></header>
    <figure class="generated-record-avatar"><img class="avatar" data-st-avatar alt="真实角色头像"><figcaption><span data-character-name>角色</span> · 此刻记录</figcaption></figure>
    <section class="track-panel"><div class="track-meta"><article><span data-label="0">时间</span><strong data-value="0"></strong></article><article><span data-label="1">位置</span><strong data-value="1"></strong></article></div><article class="affection-player"><div><span data-label="2">好感度</span><strong data-value="2"></strong><small>/ 100</small></div><div class="player-track"><i data-progress="2"></i><b data-progress-knob="2"></b></div></article>
      <div class="track-list"><article><b>01</b><span data-label="3">身体情况</span><strong data-value="3"></strong></article><article><b>02</b><span data-label="4">双手动作</span><strong data-value="4"></strong></article><article><b>03</b><span data-label="5">隐秘行动</span><strong data-value="5"></strong></article><article><b>04</b><span data-label="6">近期计划</span><strong data-value="6"></strong></article></div><article class="lyric-thought"><span data-label="7">心声</span><p data-value="7"></p></article>
    </section>
  </div>
</article>`,
    'beauty-archive-status-09': `
<article class="status-card design-09">
  <button class="fold" type="button" aria-expanded="true" aria-label="收起第九张状态栏"><span>收起档案</span></button>
  <div class="compact-summary" aria-hidden="true"><strong data-design-title>角色档案</strong><span><i data-value="0"></i> · <i data-value="1"></i></span><b><i data-label="2">好感度</i> <i data-value="2"></i></b><em data-value="12"></em></div>
  <div class="expanded-content"><header class="mirror-heading"><p>P09 · CHARACTER ARCHIVE</p><h1 data-design-title>角色档案</h1><span>三页档案依次展开，点击或拖动查看此刻</span></header>
    <section class="portrait-side"><div class="mirror-frame"><img class="avatar" data-st-avatar alt="真实角色头像"><div class="avatar-placeholder" aria-hidden="true"><strong>ROLE</strong><span>角色头像</span><small>导入后自动读取</small></div><img class="mirror-ornament" data-design-asset="mirrorFrame" alt="" aria-hidden="true"></div><div class="identity"><span>ARCHIVE 09</span><strong><i data-character-name>角色</i> · 此刻记录</strong><small>视线始终朝向你</small></div></section>
    <section class="archive-stage"><div class="archive-stack" aria-live="polite"><article class="archive-card moment-card" data-card="0" data-position="active" data-peek="此刻"><span class="card-index">01 / 此刻</span><h2>此刻所在</h2><div class="moment-grid"><p><span data-label="0">时间</span><strong data-value="0"></strong></p><p><span data-label="1">位置</span><strong data-value="1"></strong></p></div><div class="affection"><span data-label="2">好感度</span><strong data-value="2"></strong><small>/ 100 · <i data-value="3"></i></small></div><p class="card-whisper" data-value="4"></p></article>
      <article class="archive-card body-card" data-card="1" data-position="next" data-peek="身体"><span class="card-index">02 / 身体</span><h2>身体状态</h2><div class="body-metrics"><p><span data-label="5">体温</span><strong data-value="5"></strong></p><p><span data-label="6">呼吸</span><strong data-value="6"></strong></p><p><span data-label="7">肩颈</span><strong data-value="7"></strong></p><p><span data-label="8">掌心</span><strong data-value="8"></strong></p></div><p class="body-note"><span data-label="9">此刻体感</span><strong data-value="9"></strong></p></article>
      <article class="archive-card heart-card" data-card="2" data-position="prev" data-peek="心声"><span class="card-index">03 / 心声</span><h2>没有说出口</h2><div class="record-row"><span data-label="10">当前章节</span><strong data-value="10"></strong></div><div class="record-row"><span data-label="11">御神签</span><strong data-value="11"></strong></div><blockquote data-value="12"></blockquote></article></div>
      <div class="card-controls"><button class="card-arrow prev" type="button" aria-label="查看上一张档案">← 上一张</button><div class="card-tabs" aria-label="档案位置"><button type="button" data-goto="0" aria-pressed="true">此刻</button><button type="button" data-goto="1" aria-pressed="false">身体</button><button type="button" data-goto="2" aria-pressed="false">心声</button></div><button class="card-arrow next" type="button" aria-label="查看下一张档案">下一张 →</button></div>
    </section>
  </div>
</article>`,
});

const foldLabels = Object.freeze({
    'beauty-current-status-05': ['展开角色状态栏', '收起角色状态栏', '⌄', '⌃'],
    'beauty-card-status-06': ['展开第六张状态栏', '收起第六张状态栏', '展开状态', '收起状态'],
    'beauty-letter-status-07': ['展开第七张状态栏', '收起第七张状态栏', '展开来信', '收起来信'],
    'beauty-record-status-08': ['展开第八张状态栏', '收起第八张状态栏', '展开播放', '收起播放'],
    'beauty-archive-status-09': ['展开第九张状态栏', '收起第九张状态栏', '展开档案', '收起档案'],
});

function safeJsonForScript(value) {
    return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

function sourceMarkup(value) {
    return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function designConfig(rule) {
    const page = rule.pages[0];
    const fields = page?.fields || rule.pageFields;
    return {
        structure: rule.structure,
        title: rule.title,
        pageId: page?.id || 'View1',
        pageLabel: page?.label || '当前角色',
        labels: fields.map(field => field.label),
        photoUrl: rule.media.avatarUrl,
        photoAlt: rule.media.imageAlt || '当前角色头像',
        assets: {
            clouds: STATUS_BEAUTY_05_CLOUDS_URL,
            cardArt: STATUS_BEAUTY_06_CARD_ART_URL,
            backdrop: STATUS_BEAUTY_08_BACKDROP_URL,
            mirrorFrame: STATUS_BEAUTY_09_FRAME_URL,
        },
        fold: foldLabels[rule.structure] || ['展开状态栏', '收起状态栏', '展开', '收起'],
    };
}

function buildDocument(rule, source) {
    const template = templates[rule.structure];
    if (!template) return '';
    const config = safeJsonForScript(designConfig(rule));
    return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="${STATUS_BEAUTY_05_09_STYLESHEET_URL}"></head>
<body class="design-page ${rule.structure}">${template}<textarea class="status-beauty-source" hidden>${sourceMarkup(source)}</textarea><script>
(function(){
  var root=document.querySelector('.status-card');if(!root)return;var config=${config};var raw=document.querySelector('.status-beauty-source').value||'';var values=[];
  var dynamicTextSelector='[data-capture],[data-value]';var originalTextStyles=new WeakMap();
  function mobileScale(){var available=Math.max(1,document.documentElement.clientWidth||window.innerWidth||900)-20;return Math.min(1,available/900);}
  function syncAdaptiveText(){var nodes=Array.from(root.querySelectorAll(dynamicTextSelector));nodes.forEach(function(node){var state=originalTextStyles.get(node);if(!state){state={value:node.style.getPropertyValue('font-size'),priority:node.style.getPropertyPriority('font-size'),fontSize:parseFloat(getComputedStyle(node).fontSize)||0};originalTextStyles.set(node,state)}if(state.value)node.style.setProperty('font-size',state.value,state.priority);else node.style.removeProperty('font-size')});function overflows(node){var rect=node.getBoundingClientRect();if(node.scrollWidth>node.clientWidth+1||node.scrollHeight>node.clientHeight+1)return true;for(var parent=node.parentElement;parent&&parent!==root.parentElement;parent=parent.parentElement){var style=getComputedStyle(parent);var parentRect=parent.getBoundingClientRect();var clips=parent===root||/hidden|clip/.test((style.overflowX||'')+' '+(style.overflowY||''))||style.position==='absolute';if(clips&&(rect.right>parentRect.right-1||rect.bottom>parentRect.bottom-1))return true;if(parent===root)break}return false}nodes.forEach(function(node){var state=originalTextStyles.get(node);var textLength=Array.from(String(node.textContent||'').replace(/\s+/g,'')).length;if(!state||!state.fontSize||!textLength)return;var factor=textLength>48?0.56:textLength>32?0.64:textLength>20?0.74:textLength>12?0.86:1;var minimum=Math.min(state.fontSize,8);var target=Math.max(minimum,state.fontSize*factor);if(target<state.fontSize)node.style.setProperty('font-size',target+'px','important');for(var attempts=0;attempts<8&&target>minimum&&overflows(node);attempts++){target=Math.max(minimum,target*.92);node.style.setProperty('font-size',target+'px','important')}})}
  function syncHostFrameHeight(){var frame=window.frameElement;if(!frame||frame.classList.contains('status-atelier-beauty-preview-frame'))return;var height=Math.ceil(Math.max(root.offsetHeight||0,root.scrollHeight||0,1)*mobileScale()+20);frame.style.height=height+'px';frame.style.minHeight='0';frame.style.maxHeight='none';}
  function syncLayout(){var scale=mobileScale();root.style.setProperty('--sta-readable-font',(scale<1?Math.ceil(8/scale):8)+'px');syncAdaptiveText();requestAnimationFrame(syncHostFrameHeight);}window.addEventListener('resize',syncLayout);
  raw.split(/\\r?\\n/).forEach(function(line){var text=line.trim();if(text.charAt(0)!=='['||text.charAt(text.length-1)!==']')return;var parts=text.slice(1,-1).split('|').map(function(item){return item.trim();});var key=parts.shift();if(key===config.pageId)values=parts;});
  root.querySelectorAll('[data-design-title]').forEach(function(node){node.textContent=config.title;});root.querySelectorAll('[data-label]').forEach(function(node){node.textContent=config.labels[Number(node.dataset.label)]||'';});root.querySelectorAll('[data-value]').forEach(function(node){node.textContent=values[Number(node.dataset.value)]||'X';});
  function amount(index){var number=Number(String(values[index]||'').match(/-?\\d+(?:\\.\\d+)?/)?.[0]);return Number.isFinite(number)?Math.max(0,Math.min(100,number)):0;}
  root.querySelectorAll('[data-progress]').forEach(function(node){node.style.width=amount(Number(node.dataset.progress))+'%';});root.querySelectorAll('[data-progress-knob]').forEach(function(node){node.style.left='calc('+amount(Number(node.dataset.progressKnob))+'% - 8px)';});
  root.querySelectorAll('[data-design-asset]').forEach(function(image){var url=config.assets[image.dataset.designAsset];if(url)image.src=url;});
  var topWindow=window;try{if(window.parent&&window.parent!==window)topWindow=window.parent;}catch(error){topWindow=window;}var ctx=null;try{ctx=topWindow.SillyTavern&&topWindow.SillyTavern.getContext?topWindow.SillyTavern.getContext():null;}catch(error){ctx=null;}
  var character=ctx&&ctx.characters?ctx.characters[ctx.characterId]:null;var characterName=(character&&character.name)||(ctx&&ctx.name2)||(config.pageLabel==='当前角色'?'角色':config.pageLabel);root.querySelectorAll('[data-character-name]').forEach(function(node){node.textContent=characterName;});
  var avatar=config.photoUrl;try{if(!avatar&&character&&character.avatar){avatar=ctx&&typeof ctx.getThumbnailUrl==='function'?ctx.getThumbnailUrl('avatar',character.avatar):'/thumbnail?type=avatar&file='+encodeURIComponent(character.avatar);}}catch(error){avatar=config.photoUrl;}root.querySelectorAll('img[data-st-avatar]').forEach(function(image){if(avatar){image.src=avatar;image.alt=config.photoAlt;image.referrerPolicy='no-referrer';}image.addEventListener('error',function(){image.removeAttribute('src');});});
  var button=root.querySelector('.fold');var icon=button&&button.querySelector('span');if(button)button.addEventListener('click',function(){var closed=root.classList.toggle('is-collapsed');button.setAttribute('aria-expanded',String(!closed));button.setAttribute('aria-label',closed?config.fold[0]:config.fold[1]);if(icon)icon.textContent=closed?config.fold[2]:config.fold[3];requestAnimationFrame(syncLayout);});
  if(config.structure==='beauty-archive-status-09'){
    var stack=root.querySelector('.archive-stack');var cards=Array.from(root.querySelectorAll('.archive-card'));var tabs=Array.from(root.querySelectorAll('[data-goto]'));var current=0,startX=0,lastX=0,dragging=false,suppressClick=false;
    function showCard(index){current=(index+cards.length)%cards.length;cards.forEach(function(item,itemIndex){var offset=(itemIndex-current+cards.length)%cards.length;item.dataset.position=offset===0?'active':offset===1?'next':'prev';});tabs.forEach(function(tab,tabIndex){tab.setAttribute('aria-pressed',String(tabIndex===current));});}
    root.querySelector('.card-arrow.prev').addEventListener('click',function(){showCard(current-1);});root.querySelector('.card-arrow.next').addEventListener('click',function(){showCard(current+1);});tabs.forEach(function(tab){tab.addEventListener('click',function(){showCard(Number(tab.dataset.goto));});});stack.addEventListener('click',function(event){if(suppressClick){suppressClick=false;return;}var selected=event.target.closest('.archive-card');if(selected&&selected.dataset.position!=='active')showCard(Number(selected.dataset.card));});stack.addEventListener('pointerdown',function(event){dragging=true;startX=lastX=event.clientX;stack.setPointerCapture(event.pointerId);stack.classList.add('is-dragging');});stack.addEventListener('pointermove',function(event){if(dragging)lastX=event.clientX;});stack.addEventListener('pointerup',function(event){if(!dragging)return;var distance=lastX-startX;dragging=false;stack.releasePointerCapture(event.pointerId);stack.classList.remove('is-dragging');if(Math.abs(distance)>45){suppressClick=true;showCard(current+(distance<0?1:-1));setTimeout(function(){suppressClick=false;},0);}});stack.addEventListener('pointercancel',function(){dragging=false;stack.classList.remove('is-dragging');});
  }
  requestAnimationFrame(syncLayout);if(window.ResizeObserver)new ResizeObserver(function(){requestAnimationFrame(syncHostFrameHeight);}).observe(root);
})();
</script></body></html>`;
}

export function isStatusBeauty05To09(structure) {
    return STATUS_BEAUTY_05_09_IDS.includes(structure);
}

export function buildStatusBeauty05To09Replacement(rule) {
    return `\`\`\`html\n${buildDocument(rule, '$1')}\n\`\`\``;
}

export function buildStatusBeauty05To09Preview(rule, rawValues = []) {
    const values = rawValues.map(value => {
        const text = String(value || '');
        return !text || text.startsWith('AI动态') || text.startsWith('这里显示') ? 'X' : text.replace(/[|\[\]<>]/g, ' ');
    });
    const pageId = rule.pages[0]?.id || 'View1';
    return buildDocument(rule, `[${pageId}|${values.join('|')}]`);
}

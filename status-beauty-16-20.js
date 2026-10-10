const STATUS_BEAUTY_STYLESHEET_URL = new URL('./status-beauty-16-20.css?v=0.11.25', import.meta.url).href;
const STATUS_BEAUTY_ENVELOPE_URL = new URL('./assets/status-beauty/images/envelope-ivory-closed-v2.png', import.meta.url).href;
const STATUS_BEAUTY_HEART_FRAME_URL = new URL('./assets/status-beauty/images/double-heart-frame-pink-v1.png', import.meta.url).href;

export const STATUS_BEAUTY_16_20_PRESETS = Object.freeze([
    {
        id: 'beauty-mailbox-16', name: '16 · 邮匣', description: '完整信封、寄信人头像与角色此刻来信',
        title: '邮匣', subtitle: 'PRIVATE MAILBOX', layout: 'stack',
        pagesText: '当前角色|填写当前主要角色或视角',
        fields: [
            ['时间', '填写当前剧情时间', 'text', 'time'],
            ['位置', '填写角色当前所在位置', 'text', 'location'],
            ['衣冠', '具体描述角色当前衣着、配饰与可见细节', 'long', 'attire'],
            ['情愫', '填写角色当前情愫数值或简短阶段', 'text', 'affection'],
            ['欲念', '填写角色当前欲念数值或简短状态', 'text', 'desire'],
            ['来信', '以角色口吻写完整的第一段来信，至少50个汉字，建议80至150字；结合当前经历、所见与想对收信人说的话自然展开，不重复心声字段', 'long', 'letter'],
            ['心声', '第一人称填写角色没有说出口的真实想法', 'long', 'inner_voice'],
        ],
    },
    {
        id: 'beauty-double-heart-17', name: '17 · 双心观察窗', description: '头像与内心状态并列的双心窗构图',
        title: '双心观察窗', subtitle: 'DOUBLE HEART WINDOW', layout: 'stack',
        pagesText: '当前角色|填写当前主要角色或视角',
        fields: [
            ['时间', '填写当前剧情时间', 'text', 'time'],
            ['位置', '填写角色当前所在位置', 'text', 'location'],
            ['衣冠', '具体描述角色当前衣着、配饰与可见细节', 'long', 'attire'],
            ['情愫', '填写角色当前情愫数值或简短阶段', 'text', 'affection'],
            ['欲念', '填写角色当前欲念数值或简短状态', 'text', 'desire'],
            ['内心状态', '概括角色此刻的情绪与心理状态', 'long', 'inner_state'],
            ['来信', '以角色口吻写此刻最想传达的一小段话', 'long', 'letter'],
        ],
    },
    {
        id: 'beauty-checklist-18', name: '18 · 角色状态清单', description: '绿色清单式身体、动作与关系状态',
        title: '角色状态清单', subtitle: 'CURRENT STATUS', layout: 'stack',
        pagesText: '当前角色|填写当前主要角色或视角',
        fields: [
            ['时间', '填写当前剧情时间', 'text', 'time'],
            ['位置', '填写角色当前所在位置', 'text', 'location'],
            ['身体状态', '具体填写角色当前身体状况与体感', 'long', 'body'],
            ['双手动作', '具体填写角色双手正在做什么', 'long', 'hands'],
            ['当前姿态', '具体填写角色当前姿势与动作', 'long', 'posture'],
            ['心绪', '第一人称概括角色此刻心绪', 'long', 'mood'],
            ['好感度', '填写0到100之间的整数，只写数字', 'progress', 'affection'],
            ['关系状态', '填写角色与用户当前关系状态', 'text', 'relationship'],
        ],
    },
    {
        id: 'beauty-broadcast-19', name: '19 · 今日播报', description: '广播台式时间地点、宜忌与角色心声',
        title: '今日播报', subtitle: 'DAILY BROADCAST', layout: 'stack',
        pagesText: '当前角色|填写当前主要角色或视角',
        fields: [
            ['时间', '填写当前剧情时间', 'text', 'time'],
            ['位置', '填写角色当前所在位置', 'text', 'location'],
            ['今日播报', '用一句简短播报概括角色当前状态或场景', 'long', 'broadcast'],
            ['今日宜', '填写此刻适合角色做的一件事', 'text', 'good'],
            ['今日忌', '填写此刻不适合角色做的一件事', 'text', 'avoid'],
            ['章节', '填写当前剧情章节或阶段', 'text', 'chapter'],
            ['角色心声', '第一人称填写角色没有说出口的真实想法', 'long', 'inner_voice'],
            ['御神签', '填写一个简短签位或签名', 'text', 'fortune'],
            ['签文', '用一句话解释此签与当前剧情的关系', 'long', 'fortune_note'],
        ],
    },
    {
        id: 'beauty-wallet-20', name: '20 · 状态票夹', description: '票夹式角色身份、身体动作与关系状态',
        title: '状态票夹', subtitle: 'CURRENT STATUS WALLET', layout: 'stack',
        pagesText: '当前角色|填写当前主要角色或视角',
        fields: [
            ['时间', '填写当前剧情时间', 'text', 'time'],
            ['位置', '填写角色当前所在位置', 'text', 'location'],
            ['身体状态', '具体填写角色当前身体状况与体感', 'long', 'body'],
            ['双手动作', '具体填写角色双手正在做什么', 'long', 'hands'],
            ['当前姿态', '具体填写角色当前姿势与动作', 'long', 'posture'],
            ['心绪', '第一人称概括角色此刻心绪', 'long', 'mood'],
            ['好感度', '填写0到100之间的整数，只写数字', 'progress', 'affection'],
            ['关系状态', '填写角色与用户当前关系状态', 'text', 'relationship'],
        ],
    },
]);

export const STATUS_BEAUTY_16_20_IDS = Object.freeze(STATUS_BEAUTY_16_20_PRESETS.map(item => item.id));

const templates = Object.freeze({
    'beauty-mailbox-16': `
<article class="status-card design-16">
 <header class="mail-heading"><h1 data-design-title>邮匣</h1><span data-value="0"></span></header>
 <button class="mail-seal" type="button" data-mail-open aria-expanded="false" aria-controls="mail-content" aria-label="拆开来信"><img data-design-asset="envelope" alt="棉线与灰褐火漆封缄的米白信封"><span>轻触拆信</span></button>
 <div class="mail-recipient"><img data-st-avatar alt="寄信人头像"><span><strong data-character-name></strong> 寄来一封信</span></div>
 <section class="mail-content" id="mail-content" hidden>
  <article class="mail-sheet" tabindex="-1">
   <header><span data-label="5"></span><span data-value="0"></span></header>
   <div class="mail-salutation"><h2>展信安。</h2></div><p class="mail-prose" data-value="5"></p>
   <section class="mail-postscript"><h3 data-label="6"></h3><p data-value="6"></p></section>
   <div class="mail-annotation"><p><span data-label="1"></span><b data-value="1"></b></p><p><span data-label="2"></span><b data-value="2"></b></p></div>
   <footer><div><span data-label="3"></span><b data-value="3"></b></div><div><span data-label="4"></span><b data-value="4"></b></div><strong data-character-name></strong></footer>
  </article>
  <button type="button" class="mail-close" data-mail-close>收好信件</button>
 </section>
</article>`,
    'beauty-double-heart-17': `
<article class="status-card design-17"><button class="fold" type="button" aria-expanded="true"><span>收起</span></button><div class="compact-summary"><strong data-design-title>双心观察窗</strong><span data-value="1"></span></div><div class="expanded-content"><header class="folio-title"><p>TWO HEARTS / ONE MOMENT</p><h1 data-design-title>双心观察窗</h1></header><div class="heart-stage"><div class="heart-pane portrait-pane"><img data-st-avatar alt="角色头像"></div><div class="heart-pane thought-pane"><span data-label="3"></span><strong data-value="3"></strong></div><img class="heart-frame" data-design-asset="heartFrame" alt="双心窗框"></div><div class="window-readings"><article><span data-label="0"></span><strong data-value="0"></strong></article><article><span data-label="4"></span><strong data-value="4"></strong></article></div><div class="window-details"><article><span data-label="1"></span><p data-value="1"></p></article><article><span data-label="2"></span><p data-value="2"></p></article></div><article class="window-voice"><span data-label="5"></span><p data-value="5"></p></article><article class="window-letter"><span data-label="6"></span><p data-value="6"></p></article></div></article>`,
    'beauty-checklist-18': `
<article class="status-card design-18">
  <button class="fold" type="button" aria-expanded="true"><span>收起清单</span></button>
  <div class="compact-summary" aria-hidden="true"><strong data-design-title>角色状态清单</strong><span><i data-label="1">位置</i> · <i data-value="1"></i></span><b><i data-label="2">身体状态</i> · <i data-value="2"></i></b><em data-value="5"></em></div>
  <div class="expanded-content">
    <header class="wish-heading"><p>P18 · CURRENT STATUS</p><h1 data-design-title>角色状态清单</h1><span>把身体、动作与此刻状态直接列清楚</span></header>
    <section class="traveler-note"><div class="traveler-id"><img class="avatar" data-st-avatar alt="当前角色头像"><div><span>角色</span><strong data-character-name>角色</strong><small>当前状态持续更新</small></div></div><article><span data-label="0">时间</span><strong data-value="0"></strong></article><article><span data-label="1">位置</span><strong data-value="1"></strong></article></section>
    <section class="wish-list"><h2>身体与动作</h2><article><i aria-hidden="true"></i><div><strong data-label="2">身体状态</strong><span data-value="2"></span></div><em>此刻</em></article><article><i aria-hidden="true"></i><div><strong data-label="3">双手动作</strong><span data-value="3"></span></div><em>此刻</em></article><article><i aria-hidden="true"></i><div><strong data-label="4">当前姿态</strong><span data-value="4"></span></div><em>此刻</em></article></section>
    <article class="travel-mood"><span data-label="5">心绪</span><p data-value="5"></p></article>
    <div class="wish-meta"><span><i data-label="6">好感度</i> · <i data-value="6"></i></span><span><i data-label="7">关系状态</i> · <i data-value="7"></i></span></div>
  </div>
</article>`,
    'beauty-broadcast-19': `
<article class="status-card design-19">
  <button class="fold" type="button" aria-expanded="true"><span>收起播报</span></button>
  <div class="compact-summary" aria-hidden="true"><strong data-design-title>今日播报</strong><span><i data-label="0">时间</i> · <i data-value="0"></i></span><b><i data-label="1">位置</i> · <i data-value="1"></i></b><em data-value="6"></em></div>
  <div class="expanded-content">
    <header class="broadcast-heading"><p>P19 · DAILY BROADCAST</p><h1 data-design-title>今日播报</h1><span>时间、地点、宜忌与角色心声，一次播报完毕</span></header>
    <section class="on-air"><span>ON AIR</span><div><strong><i data-label="0">时间</i> · <i data-value="0"></i></strong><small><i data-label="1">位置</i> · <i data-value="1"></i></small></div></section>
    <section class="broadcast-main"><div class="host"><img class="avatar" data-st-avatar alt="当前角色头像"><span>今日主播</span></div><article class="weather"><span data-label="2">今日播报</span><strong data-value="2"></strong><div class="signal" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></article></section>
    <section class="today-advice"><article class="good"><span data-label="3">今日宜</span><strong data-value="3"></strong></article><article class="avoid"><span data-label="4">今日忌</span><strong data-value="4"></strong></article></section>
    <section class="broadcast-footer"><article><span data-label="5">章节</span><strong data-value="5"></strong></article><article class="voice"><span data-label="6">角色心声</span><strong data-value="6"></strong></article><article class="fortune"><span data-label="7">御神签</span><strong data-value="7"></strong><small data-value="8"></small></article></section>
  </div>
</article>`,
    'beauty-wallet-20': `
<article class="status-card design-20">
  <button class="fold" type="button" aria-expanded="true"><span>收起票夹</span></button>
  <div class="compact-summary" aria-hidden="true"><strong data-design-title>状态票夹</strong><span><i data-value="1"></i> · <i data-value="0"></i></span><b><i data-label="6">好感度</i> <i data-value="6"></i></b><em><i data-label="7">关系状态</i> · <i data-value="7"></i></em></div>
  <div class="expanded-content">
    <header class="ticket-heading"><p>P20 · CURRENT STATUS WALLET</p><h1 data-design-title>状态票夹</h1><span>把角色现在的身体、动作与心绪收进同一只票夹</span></header>
    <div class="status-wallet-layout">
      <section class="wallet-profile"><div class="profile-identity"><div class="profile-photo"><img class="avatar" data-st-avatar alt="当前角色头像"></div><div><span>角色身份</span><strong data-character-name>角色</strong><small>STATUS PASS · OPEN</small></div></div><div class="profile-facts"><article><span data-label="0">时间</span><strong data-value="0"></strong></article><article><span data-label="1">位置</span><strong data-value="1"></strong></article></div></section>
      <section class="status-ticket-panel"><section class="ticket-stack"><article><span data-label="2">身体状态</span><strong data-value="2"></strong><small>PHYSICAL CONDITION</small></article><article><span data-label="3">双手动作</span><strong data-value="3"></strong><small>HANDS IN ACTION</small></article><article><span data-label="4">当前姿态</span><strong data-value="4"></strong><small>CURRENT POSTURE</small></article></section><section class="ticket-outlook"><article class="ticket-mood"><span data-label="5">心绪</span><p data-value="5"></p></article><div class="ticket-meta"><article><span data-label="6">好感度</span><strong data-value="6"></strong></article><article><span data-label="7">关系状态</span><strong data-value="7"></strong></article></div></section></section>
    </div>
  </div>
</article>`,
});

const foldLabels = Object.freeze({
    'beauty-mailbox-16': ['展开邮匣', '收起邮匣'],
    'beauty-double-heart-17': ['展开观察窗', '收起观察窗'],
    'beauty-checklist-18': ['展开清单', '收起清单'],
    'beauty-broadcast-19': ['展开播报', '收起播报'],
    'beauty-wallet-20': ['展开状态票夹', '收起票夹'],
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
        kinds: fields.map(field => field.kind || 'text'),
        avatarSource: rule.media.avatarSource || 'character',
        photoUrl: rule.media.avatarUrl,
        photoAlt: rule.media.imageAlt || '当前角色头像',
        assets: {
            envelope: STATUS_BEAUTY_ENVELOPE_URL,
            heartFrame: STATUS_BEAUTY_HEART_FRAME_URL,
        },
        foldClosed: foldLabels[rule.structure]?.[0] || '展开状态栏',
        foldOpen: foldLabels[rule.structure]?.[1] || '收起状态栏',
    };
}

function buildDocument(rule, source) {
    const template = templates[rule.structure];
    if (!template) return '';
    const config = safeJsonForScript(designConfig(rule));
    return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="${['beauty-mailbox-16','beauty-double-heart-17'].includes(rule.structure) ? new URL('./status-letter-window.css?v=0.11.42', import.meta.url).href : STATUS_BEAUTY_STYLESHEET_URL}"></head>
<body class="design-page ${rule.structure}">${template}<textarea class="status-beauty-source" hidden>${sourceMarkup(source)}</textarea><script>
(function(){
  var root=document.querySelector('.status-card');if(!root)return;var config=${config};
  var dynamicTextSelector='[data-capture],[data-value]';var originalTextStyles=new WeakMap();
  function mobileScale(){if(config.structure==='beauty-mailbox-16'||config.structure==='beauty-double-heart-17')return 1;if(window.matchMedia&&window.matchMedia('(max-width:560px)').matches)return 1;var available=Math.max(1,document.documentElement.clientWidth||window.innerWidth||900)-20;return Math.min(1,available/900);}
  function syncAdaptiveText(){if(config.structure==='beauty-mailbox-16'||config.structure==='beauty-double-heart-17')return;var nodes=Array.from(root.querySelectorAll(dynamicTextSelector));nodes.forEach(function(node){var state=originalTextStyles.get(node);if(!state){state={value:node.style.getPropertyValue('font-size'),priority:node.style.getPropertyPriority('font-size'),fontSize:parseFloat(getComputedStyle(node).fontSize)||0};originalTextStyles.set(node,state)}if(state.value)node.style.setProperty('font-size',state.value,state.priority);else node.style.removeProperty('font-size')});if(document.documentElement.clientWidth<=560&&!root.classList.contains('design-18'))return;function overflows(node){var rect=node.getBoundingClientRect();if(node.scrollWidth>node.clientWidth+1||node.scrollHeight>node.clientHeight+1)return true;for(var parent=node.parentElement;parent&&parent!==root.parentElement;parent=parent.parentElement){var style=getComputedStyle(parent);var parentRect=parent.getBoundingClientRect();var clips=parent===root||/hidden|clip/.test((style.overflowX||'')+' '+(style.overflowY||''))||style.position==='absolute';if(clips&&(rect.right>parentRect.right-1||rect.bottom>parentRect.bottom-1))return true;if(parent===root)break}return false}nodes.forEach(function(node){var state=originalTextStyles.get(node);var textLength=Array.from(String(node.textContent||'').replace(/\s+/g,'')).length;if(!state||!state.fontSize||!textLength)return;var factor=textLength>48?0.56:textLength>32?0.64:textLength>20?0.74:textLength>12?0.86:1;var minimum=Math.min(state.fontSize,12);var target=Math.max(minimum,state.fontSize*factor);if(target<state.fontSize)node.style.setProperty('font-size',target+'px','important');for(var attempts=0;attempts<8&&target>minimum&&overflows(node);attempts++){target=Math.max(minimum,target*.92);node.style.setProperty('font-size',target+'px','important')}})}
  function syncHostFrameHeight(){var frame=window.frameElement;if(!frame||frame.classList.contains('status-atelier-beauty-preview-frame'))return;var height=Math.ceil(Math.max(root.offsetHeight||0,root.scrollHeight||0,1)*mobileScale()+20);frame.style.height=height+'px';frame.style.minHeight='0';frame.style.maxHeight='none';}
  function syncLayout(){var scale=mobileScale();root.style.setProperty('--sta-readable-font',(scale<1?Math.ceil(8/scale):8)+'px');syncAdaptiveText();requestAnimationFrame(syncHostFrameHeight);}window.addEventListener('resize',syncLayout);
  var raw=document.querySelector('.status-beauty-source').value||'';var values=[];
  raw.split(/\\r?\\n/).forEach(function(line){var text=line.trim();if(text.charAt(0)!=='['||text.charAt(text.length-1)!==']')return;var parts=text.slice(1,-1).split('|').map(function(item){return item.trim();});var key=parts.shift();if(key===config.pageId)values=parts;});
  root.querySelectorAll('[data-design-title]').forEach(function(node){node.textContent=config.title;});
  root.querySelectorAll('[data-label]').forEach(function(node){node.textContent=config.labels[Number(node.dataset.label)]||'';});
  root.querySelectorAll('[data-value]').forEach(function(node){var index=Number(node.dataset.value);node.textContent=values[index]||'X';node.dataset.staKind=config.kinds[index]||'text';});
  root.querySelectorAll('[data-design-asset]').forEach(function(image){var url=config.assets[image.dataset.designAsset];if(url)image.src=url;});
  var topWindow=window;try{if(window.parent&&window.parent!==window)topWindow=window.parent;}catch(error){topWindow=window;}
  var ctx=null;try{ctx=topWindow.SillyTavern&&topWindow.SillyTavern.getContext?topWindow.SillyTavern.getContext():null;}catch(error){ctx=null;}
  var character=ctx&&ctx.characters?ctx.characters[ctx.characterId]:null;var characterName=(character&&character.name)||(ctx&&ctx.name2)||(config.pageLabel==='当前角色'?'角色':config.pageLabel);
  root.querySelectorAll('[data-character-name]').forEach(function(node){node.textContent=characterName;});
  var avatar=config.photoUrl;try{if(config.avatarSource==='character'&&!avatar&&character&&character.avatar){avatar=ctx&&typeof ctx.getThumbnailUrl==='function'?ctx.getThumbnailUrl('avatar',character.avatar):'/thumbnail?type=avatar&file='+encodeURIComponent(character.avatar);}}catch(error){avatar=config.photoUrl;}
  if(config.avatarSource==='none')avatar='';
  root.querySelectorAll('img[data-st-avatar]').forEach(function(image){image.hidden=!avatar;if(!avatar)image.removeAttribute('src');if(avatar){image.src=avatar;image.alt=config.photoAlt;image.referrerPolicy='no-referrer';}image.addEventListener('error',function(){image.removeAttribute('src');});});
  var button=root.querySelector('.fold');var label=button&&button.querySelector('span');if(button)button.addEventListener('click',function(){var closed=root.classList.toggle('is-collapsed');button.setAttribute('aria-expanded',String(!closed));button.setAttribute('aria-label',closed?config.foldClosed:config.foldOpen);if(label)label.textContent=closed?config.foldClosed:config.foldOpen;requestAnimationFrame(syncLayout);});
  var mailOpen=root.querySelector('[data-mail-open]');var mailClose=root.querySelector('[data-mail-close]');var mailContent=root.querySelector('.mail-content');
  if(mailOpen&&mailClose&&mailContent){mailOpen.addEventListener('click',function(){if(root.classList.contains('is-letter-open'))return;root.classList.add('is-letter-open');mailOpen.setAttribute('aria-expanded','true');mailContent.hidden=false;root.querySelector('.mail-sheet').focus({preventScroll:true});syncLayout();});mailClose.addEventListener('click',function(){root.classList.remove('is-letter-open');mailContent.hidden=true;mailOpen.setAttribute('aria-expanded','false');mailOpen.focus({preventScroll:true});syncLayout();});}
  root.querySelectorAll('img').forEach(function(image){image.addEventListener('load',syncLayout);});
  requestAnimationFrame(syncLayout);if(window.ResizeObserver)new ResizeObserver(function(){requestAnimationFrame(syncHostFrameHeight);}).observe(root);
})();
</script></body></html>`;
}

export function isStatusBeauty16To20(structure) {
    return STATUS_BEAUTY_16_20_IDS.includes(structure);
}

export function buildStatusBeauty16To20Replacement(rule) {
    return `\`\`\`html\n${buildDocument(rule, '$1')}\n\`\`\``;
}

export function buildStatusBeauty16To20Preview(rule, rawValues = []) {
    const values = rawValues.map(value => {
        const text = String(value || '');
        return !text || text.startsWith('AI动态') || text.startsWith('这里显示') ? 'X' : text.replace(/[|\[\]<>]/g, ' ');
    });
    const pageId = rule.pages[0]?.id || 'View1';
    return buildDocument(rule, `[${pageId}|${values.join('|')}]`);
}

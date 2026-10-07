import { encounterSelection, encounterPool, encounterDraftRecord, randomEncounter, encounterPrompt, encounterScene, submitEncounter } from './opening-encounter-model.js?v=0.11.41';
import { encounterStyle } from './opening-encounter-style.js?v=0.11.41';
export const ENCOUNTER_MARKER='【江湖偶遇簿】';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function encounterRuntime(config,preview){
 const $=id=>document.getElementById(id),ns='jiuyiEncounterDraftV1',key='encounter-preview-v3:'+config.scope;
 const api=name=>typeof globalThis[name]==='function'?globalThis[name]:globalThis.TavernHelper?.[name];
 const context=()=>{try{return window.parent.SillyTavern?.getContext()||null;}catch{return null;}};
 const identity=()=>{const c=context();return c?`${c.characterId}:${c.groupId||''}:${c.chatId}`:'';},initial=identity();
 let state=encounterSelection(config),disposed=false,saving=Promise.resolve(),saveError='',mode='place';
 const status=s=>{$('status').textContent=s;};
 function save(){
  const record=encounterDraftRecord(config,state);
  saving=saving.catch(()=>{}).then(async()=>{try{if(preview)localStorage.setItem(key,JSON.stringify(record));else{
   if(identity()!==initial||api('getCurrentMessageId')?.()!==0)throw Error('聊天已切换');
   if(!api('insertOrAssignVariables'))throw Error('缺少酒馆助手');
   await api('insertOrAssignVariables')({[ns]:record},{type:'message',message_id:0});
  }saveError='';}catch(e){saveError='选择保存失败：'+e.message;status(saveError);}});return saving;
 }
 try{const old=preview?JSON.parse(localStorage.getItem(key)||'null'):api('getVariables')?.({type:'message',message_id:0})?.[ns];if(old&&old.bookScope===config.scope)state=encounterSelection(config,old);}catch{}
 const host={busy:false,pending:'',identity:()=>initial,user:()=>context()?.name1||'玩家',messages:()=>context()?.chat||[],save:async()=>{await save();if(saveError)throw Error(saveError);},snapshot:()=>JSON.stringify(api('getChatMessages')(0,{include_swipes:true})?.[0]?.swipes)+'/'+context()?.chat[0]?.swipe_id,
 check:id=>{
  if(disposed||identity()!==id||id!==initial)throw Error('聊天已切换，生成结果不会写入其他聊天。');
  const ctx=context();if(!ctx||ctx.groupId||api('getCurrentMessageId')?.()!==0||ctx.chat.length!==1)throw Error('请在新单人聊天的地图开场中使用。');
  if(!ctx.chat[0]?.mes?.includes('【江湖偶遇簿】'))throw Error('开场已切换，未修改当前消息。');
  if(['generate','setChatMessages','getChatMessages','insertOrAssignVariables'].some(n=>!api(n)))throw Error('请先启用酒馆助手的 HTML 渲染。');
  if(ctx.onlineStatus==='no_connection')throw Error('请先连接酒馆模型，再开始故事。');
  if(ctx.streamingProcessor&&!ctx.streamingProcessor.isFinished)throw Error('酒馆正在回复，请稍后重试。');
 },generate:prompt=>api('generate')({user_input:prompt,max_chat_history:0,should_stream:false,should_silence:false}),
 commit:async(text,draft)=>{
  const old=api('getChatMessages')(0,{include_swipes:true})[0];
  await api('setChatMessages')([{message_id:0,swipes:[...old.swipes,text],swipe_id:old.swipes.length,swipes_data:[...old.swipes_data,{...old.swipes_data[old.swipe_id],[ns]:encounterDraftRecord(config,draft)}],swipes_info:[...old.swipes_info,{jiuyiEncounter:{scope:config.scope}}]}],{refresh:'affected'});
 }};
 const pointSlots=[[30,32],[51,43],[68,31],[41,66]];
 function render(){
  const place=config.places.find(p=>p.id===state.place),scene=encounterScene(config,state);
  $('scene-title').textContent=state.visited?place.name+' · 偶遇':'你想往哪里去？';
  $('scene-text').textContent=state.visited?scene.text:'点一下地图上的地点，去街巷里走走。途中会遇见谁，又会碰上什么事？';
  $('scene-actions').hidden=!state.visited;$('cast-tools').hidden=!state.visited;
  $('begin').disabled=!state.visited||host.busy;$('begin').textContent=host.busy?'故事正在展开…':'就从这里开始 →';
  $('map-label').textContent=mode==='place'?'扬州 · 街巷漫游':place.name+' · 四下看看';
  $('back').hidden=mode==='place';$('places').hidden=mode!=='place';$('people').hidden=mode!=='people';
  $('remote-place').value=state.place;
  document.querySelectorAll('[data-place]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.place===state.place)));
  document.querySelectorAll('[data-action]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.action===state.action)));
  const pool=encounterPool(config,{...state,scope:'nearby'}),selected=config.people.find(p=>p.id===state.person),visible=[selected,...pool.filter(p=>p.id!==selected.id)].slice(0,4);
  $('people').replaceChildren();
  visible.forEach((p,i)=>{const b=document.createElement('button');b.className='person-dot';b.type='button';b.dataset.person=p.id;b.setAttribute('aria-label','遇见'+p.name);b.setAttribute('aria-pressed',String(state.names?state.names.includes(p.name):p.id===state.person));b.style.setProperty('--x',pointSlots[i][0]+'%');b.style.setProperty('--y',pointSlots[i][1]+'%');const label=document.createElement('span');label.textContent=p.name;b.append(label);$('people').append(b);});
  $('cast-caption').textContent='这次遇见：'+scene.names;
  document.querySelectorAll('button,input,select,textarea').forEach(el=>{if(el.id!=='begin')el.disabled=host.busy;});
 }
 function animate(){const node=$('scene-text');node.classList.remove('reveal');void node.offsetWidth;node.classList.add('reveal');}
 function explore(id){state.place=id;state.scope='nearby';if(!state.names)state=randomEncounter(config,state,'person');state.visited=true;state.action='';state.event=Math.floor(Math.random()*3);mode='people';save();render();animate();status('');}
 $('map-image').addEventListener('error',()=>{$('image-error').hidden=false;});
 if($('map-image').complete&&!$('map-image').naturalWidth)$('image-error').hidden=false;
 document.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b||b.disabled||host.busy)return;
  if(b.dataset.place)explore(b.dataset.place);
  if(b.id==='back'){mode='place';render();}
  if(b.dataset.person){state.person=b.dataset.person;state.names='';$('names').value='';state.action='';state.visited=true;save();render();animate();}
  if(b.dataset.random){state=randomEncounter(config,{...state,scope:b.dataset.random==='person'?'all':'nearby'},b.dataset.random);$('names').value='';mode='people';save();render();animate();}
  if(b.id==='again'){state.event=(state.event+1+Math.floor(Math.random()*2))%3;state.action='';save();render();animate();}
  if(b.dataset.action){state.action=b.dataset.action;save();render();animate();}
  if(b.id==='download'){const a=document.createElement('a'),u=URL.createObjectURL(new Blob([config.installJson],{type:'application/json'}));a.href=u;a.download='江湖偶遇簿-漫游互动版.regex.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1500);}
  if(b.id==='begin'){
   if(preview){$('preview-result').hidden=false;$('preview-story').textContent=encounterScene(config,state).text;status('预览已走到开场。导入酒馆后，这一步会生成完整正文，并直接显示在开场楼层。');$('preview-result').scrollIntoView({behavior:'smooth',block:'nearest'});return;}
   try{const job=submitEncounter(config,state,host);render();status('正在写成开场，稍等片刻…');await job;}
   catch(error){status(error.message);if(host.pending){$('preview-result').hidden=false;$('preview-title').textContent='已生成的正文 · 尚未写入';$('preview-story').textContent=host.pending;}}
   finally{if(!disposed)render();}
  }
 });
 $('remote-place').addEventListener('change',e=>explore(e.target.value));
 $('names').value=state.names;$('names').addEventListener('input',e=>{state.names=e.target.value;state.visited=true;state.action='';save();render();});
 $('note').value=state.note;$('note').addEventListener('input',e=>{state.note=e.target.value;save();});
 if(state.visited)mode='people';render();if(preview&&!config.mapUrl){$('download').hidden=true;}
 addEventListener('pagehide',()=>{disposed=true;},{once:true});
}

export function buildEncounterDocument(config,{preview=false,installJson=''}={}){
 const coords=[[32,26],[43,39],[51,31],[75,49],[24,42],[61,65]];
 const places=config.places.filter(p=>p.map).map((p,i)=>`<button type="button" class="location" data-place="${escape(p.id)}" style="--x:${coords[i%6][0]}%;--y:${coords[i%6][1]}%"><span>${escape(p.name)}</span></button>`).join('');
 const options=config.places.map(p=>`<option value="${escape(p.id)}">${escape(p.name)}</option>`).join('');
 const script=[encounterSelection,encounterPool,encounterDraftRecord,randomEncounter,encounterScene,encounterPrompt,submitEncounter,encounterRuntime].map(f=>f.toString()).join('\n');
 const data={...config,installJson};
 const url=config.mapUrl||(preview?'assets/yangzhou-map.webp':'');
 return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>江湖偶遇簿 · 街巷漫游</title><style>${encounterStyle}</style></head><body>${preview?'<div class="preview-bar"><span>江湖偶遇簿 · 互动预览</span><button id="download">下载开场组件 ↓</button></div>':''}<main class="sheet"><header><div><p class="eyebrow">走入街巷，偶遇江湖</p><h1>今日，去哪里？</h1></div><button data-random="all" class="random-all">随便走走 ↗</button></header><section class="atlas" aria-label="互动地图"><div class="map-scroll"><div class="map-world"><img id="map-image" src="${escape(url||'')}" alt="低饱和俯视地图，街巷、院落、桥梁沿河道展开"><div class="marker-layer" id="places">${places}</div><div class="marker-layer" id="people" hidden></div></div></div><div class="map-heading"><span id="map-label"></span><button id="back" hidden>← 回到街巷</button></div><div id="image-error" hidden>地图图片暂时无法加载，仍可在下方选择地点。</div><span class="map-hint">拖动地图，点一处去走走</span></section><div class="route"><label for="remote-place">目的地</label><select id="remote-place">${options}</select><span class="route-note">地图之外，也有江湖</span></div><section class="encounter"><p class="eyebrow">行路手记</p><h2 id="scene-title"></h2><p id="scene-text" class="scene-text"></p><div id="scene-actions" class="scene-actions" hidden><button data-action="approach">上前问问</button><button data-action="observe">先看看</button><button id="again" class="subtle">换个际遇 ↻</button></div><div id="cast-tools" class="cast-tools" hidden><div class="cast-line"><span id="cast-caption"></span><button data-random="person">随机遇见 ↻</button></div><label for="names">想遇见谁？</label><input id="names" maxlength="100" placeholder="例如：温如晦、陆临、林栀"><details><summary>再添一点情境</summary><textarea id="note" maxlength="300" placeholder="例如：雨后一起去吃面，却被误认成前来赴约的高人"></textarea></details></div><button id="begin" class="begin">就从这里开始 →</button><p id="status" role="status" aria-live="polite"></p><section id="preview-result" class="preview-result" hidden><h3 id="preview-title">开场预览 · 当前相遇片段</h3><p id="preview-story"></p></section></section><footer>九一 · 江湖偶遇簿 <span>一程山水，一次相逢</span></footer></main><script>${script}\nencounterRuntime(${JSON.stringify(data).replaceAll('<','\\u003c')},${preview});</script></body></html>`;
}
export function buildEncounterRegex(config){return {id:`jiuyi-encounter-${config.scope}`,scriptName:'九一 · 江湖偶遇簿·互动开场',findRegex:'/【江湖偶遇簿】/g',replaceString:['```html',buildEncounterDocument(config),'```'].join('\n'),trimStrings:[],placement:[2],disabled:false,markdownOnly:true,promptOnly:false,runOnEdit:true,substituteRegex:0,minDepth:null,maxDepth:null};}

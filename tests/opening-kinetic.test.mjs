import test from 'node:test';
import assert from 'node:assert/strict';
import { Script } from 'node:vm';
import { KINETIC_THEMES, kineticDefaults, buildKineticPage, buildKineticGreetingFields, normalizeKinetic } from '../opening-kinetic.js';
import { clockSelection, kineticInteraction } from '../opening-kinetic-runtime.js';
import { buildOpeningHomeRegexPack, normalizeOpeningHomeSettings } from '../opening-home-generator.js';
import { createOpeningTemplate, applyOpeningTemplate } from '../opening-template-package.js';
import { switchStarPage } from '../opening-star-atlas.js';

for(const theme of KINETIC_THEMES)test(`${theme.name}: editable exported pages, stable navigation and original worldbook bindings`,async()=>{
 const d={...kineticDefaults(theme.id),title:'我的故事',intro:'前文\n![配图](https://images.example/small.webp)\n后文',entries:[{id:'custom-a',title:'原始第二篇',body:'正文 <script>unsafe()</script>'},{id:'custom-b',title:'原始第一篇',body:'第二段'}]};
 const fields=JSON.parse(JSON.stringify(buildKineticGreetingFields(d)));
 assert.equal(fields.alternate_greetings.length,2);
 for(const html of [fields.first_mes,...fields.alternate_greetings]){
  assert.match(html,/^```html\n<!DOCTYPE html>/);assert.match(html,/<body>[\s\S]*<\/body><\/html>\n```$/);
  assert.doesNotMatch(html,/(?:src="(?:data:|blob:|file:|http:)|unsafe\(\)<\/script>)/);
  for(const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new Script(script[1]);
 }
 assert.match(fields.alternate_greetings[0],/正文 &lt;script&gt;/);
 assert.match(fields.first_mes,/<figure class="inline-picture">/);
 const calls=[];
 await switchStarPage(`${theme.id}-custom-b`,async()=>[{swipes:[fields.alternate_greetings[1],fields.first_mes,fields.alternate_greetings[0]]}],async rows=>calls.push(rows));
 assert.deepEqual(calls,[[{message_id:0,swipe_id:0}]]);
 const home={...d,text:theme.ink,font:theme.fontStyle,worldlines:[{id:'line-a',name:'原线路',entries:[{book:'角色世界书',uid:7}]}],entries:[{title:'真实第四条',target:4,worldlineId:'line-a'},{title:'真实第二条',target:2}]};
 const rules=buildOpeningHomeRegexPack(home);
 assert.equal(rules[1].id,'jiuyi-opening-return-portable-v1');
 assert.match(rules[0].replaceString,/<script data-kinetic-interaction>/);
 assert.match(rules[0].replaceString,/<button data-target="[^"]+" class="zoh-jump read-action"/);
 assert.equal((rules[0].replaceString.match(/class="zoh-entry scene-entry"/g)||[]).length,2);
 assert.doesNotMatch(rules[0].replaceString,/<button[^>]*class="[^"]*"[^>]*class=/);
 assert.deepEqual(applyOpeningTemplate(home,createOpeningTemplate(home)).entries,home.entries);
 assert.deepEqual(applyOpeningTemplate(home,createOpeningTemplate(home)).worldlines,home.worldlines);
 if(theme.id==='pixel-dusk')assert.match(fields.first_mes,/data-rail-car/);
});

test('red tip selection wraps at the midpoint of each sector, including arbitrary story counts',()=>{
 for(const count of [1,3,6,12,20])for(let i=0;i<count;i++){
  assert.equal(clockSelection(i*360/count,count),i);
  assert.equal(clockSelection((i+.499)*360/count,count),i);
  assert.equal(clockSelection((i+.501)*360/count,count),(i+1)%count);
 }
 assert.equal(clockSelection(-1,6),0);assert.equal(clockSelection(360,6),0);assert.equal(clockSelection(0,0),-1);
});

function mount({reduced=false,storage=new Map(),theme='soft-clock',count=6}={}){
 const callbacks=new Map(),windowCallbacks=new Map(),frames=new Map(),timers=new Map();let id=0;
 const entries=Array.from({length:count},(_,i)=>({hidden:false,querySelector:()=>({textContent:'故事 '+(i+1)})}));
 const picks=Array.from({length:count},(_,i)=>({dataset:{select:String(i)},setAttribute(){},addEventListener(t,fn){this[t]=fn;}}));
 const toggle={setAttribute(){},addEventListener(t,fn){this[t]=fn;}};
 const tuner={value:'0',attributes:{},setAttribute(k,v){this.attributes[k]=v;},addEventListener(t,fn){this[t]=fn;}},frequency={textContent:''};
 const steps=[-1,1].map(n=>({dataset:{radioStep:String(n)},addEventListener(t,fn){this[t]=fn;}}));
 const hands={'.hour-hand':{},'.minute-hand':{},'.second-hand':{}};
 for(const hand of Object.values(hands))hand.setAttribute=(key,value)=>{hand[key]=value;};
 const properties={};
 const root={classList:{contains:()=>false},dataset:{theme,motionKey:'work-a'},style:{setProperty(k,v){properties[k]=v;}},querySelectorAll:s=>s==='[data-entry]'?entries:s==='[data-select]'?picks:s==='[data-radio-step]'?steps:s==='[data-radio-frequency]'?[frequency]:[],querySelector:s=>s==='[data-motion]'?toggle:s==='[data-radio-tuner]'&&theme==='signal-field'?tuner:hands[s]||null,addEventListener(t,fn){callbacks.set(t,fn);}};
 const context={document:{querySelector:()=>root,hidden:false,addEventListener(){},removeEventListener(){}},window:{parent:{performance:{timeOrigin:10}},addEventListener(t,fn){windowCallbacks.set(t,fn);}},performance:{timeOrigin:10},matchMedia:()=>({matches:reduced,addEventListener(){},removeEventListener(){}}),sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:i=>frames.delete(i),setTimeout:fn=>{timers.set(++id,fn);return id;},clearTimeout:i=>timers.delete(i)};
 new Script(`(${kineticInteraction.toString()})(${clockSelection.toString()});`).runInNewContext(context);
 return {root,entries,picks,toggle,frames,callbacks,storage,tuner,steps,frequency,hands,properties,releaseTimers(){const work=[...timers.values()];timers.clear();work.forEach(fn=>fn());},tick(now){const work=[...frames.values()];frames.clear();work.forEach(fn=>fn(now));}};
}
test('clock keeps moving after a pick; activation locks the right story without leaving a permanent pause',()=>{
 const h=mount();h.tick(1000);for(let n=1100;n<=3400;n+=100)h.tick(n);
 assert.equal(h.root.dataset.selected,'0');
 h.callbacks.get('pointerdown')({target:{closest:()=>({})}});
 for(let n=3500;n<=8000;n+=100)h.tick(n);
 assert.equal(h.root.dataset.selected,'0');assert.equal(h.root.dataset.paused,'true');assert.equal(h.frames.size,0);
 h.releaseTimers();h.tick(8100);h.tick(8200);h.tick(8300);
 assert.equal(h.root.dataset.selected,'1');
 h.picks[4].click();assert.equal(h.root.dataset.selected,'4');
 assert.equal(h.root.dataset.paused,'false');assert.equal(h.frames.size,1);
 h.callbacks.get('pointerdown')({target:{closest:()=>({})}});
 const restored=mount({storage:h.storage});assert.equal(restored.root.dataset.selected,'4');assert.equal(restored.root.dataset.paused,'false');
 restored.toggle.click();const explicitlyPaused=mount({storage:h.storage});assert.equal(explicitlyPaused.root.dataset.paused,'true');
 h.storage.set([...h.storage.keys()][0],JSON.stringify({angle:180,selected:3,paused:true}));
 const legacy=mount({storage:h.storage});assert.equal(legacy.root.dataset.paused,'false');assert.equal(legacy.frames.size,1);
});
test('reduced motion keeps manual story selection functional without an animation loop',()=>{
 const h=mount({reduced:true});assert.equal(h.frames.size,0);
 h.picks[2].click();assert.equal(h.root.dataset.selected,'2');assert.equal(h.entries[2].hidden,false);
 assert.equal(h.entries.filter(e=>!e.hidden).length,1);assert.equal(h.frames.size,0);
 h.toggle.click();assert.equal(h.root.dataset.motionOverride,'true');assert.equal(h.frames.size,1);
 const restored=mount({reduced:true,storage:h.storage});assert.equal(restored.root.dataset.paused,'false');assert.equal(restored.frames.size,1);
});
test('radio tuning, presets and channel buttons share the displayed story and restore on return',()=>{
 const h=mount({theme:'signal-field'});
 assert.equal(h.frames.size,0);assert.equal(h.frequency.textContent,'88.0');
 h.tuner.value='3';h.tuner.input();
 assert.equal(h.root.dataset.selected,'3');assert.equal(h.frequency.textContent,'100.0');
 assert.equal(h.entries[3].hidden,false);assert.match(h.tuner.attributes['aria-valuetext'],/第 4 篇，故事 4/);
 h.steps[1].click();assert.equal(h.root.dataset.selected,'4');assert.equal(h.tuner.value,'4');
 h.picks[0].click();h.steps[0].click();assert.equal(h.root.dataset.selected,'5');assert.equal(h.frequency.textContent,'108.0');
 const restored=mount({theme:'signal-field',storage:h.storage});
 assert.equal(restored.root.dataset.selected,'5');assert.equal(restored.tuner.value,'5');assert.equal(restored.frequency.textContent,'108.0');
 const empty=mount({theme:'signal-field',count:0});empty.steps[1].click();assert.equal(empty.root.dataset.selected,undefined);
 const single=mount({theme:'signal-field',count:1});single.steps[1].click();assert.equal(single.root.dataset.selected,'0');assert.equal(single.frequency.textContent,'88.0');
});
test('clock hands remain continuous across a full turn while story selection wraps',()=>{
 const h=mount();h.tick(1000);for(let n=1100;n<=30900;n+=100)h.tick(n);
 const before=Number(h.hands['.minute-hand'].transform.match(/rotate\(([^ ]+)/)[1]);
 for(let n=31000;n<=31200;n+=100)h.tick(n);
 const after=Number(h.hands['.minute-hand'].transform.match(/rotate\(([^ ]+)/)[1]);
 assert.ok(after>before&&after-before<.1);assert.equal(h.root.dataset.selected,'0');
 assert.match(h.hands['.second-hand'].transform,/^rotate\(/);
});
test('retiring the neon factory palette keeps custom colors and editable introductions',()=>{
 const old={...kineticDefaults('pixel-dusk'),accent:'#f5ec40',ink:'#fff1d1',intro:'我的作品介绍\n第二段',entries:[{id:'letter',title:'某一篇',summary:'自己的简介',body:'保留的正文'}]};
 const migrated=normalizeKinetic(old);
 assert.equal(migrated.accent,'#775666');assert.equal(migrated.ink,'#51474f');assert.equal(migrated.intro,old.intro);
 assert.equal(migrated.entries[0].body,'保留的正文');assert.equal(migrated.entries[0].summary,'自己的简介');
 const custom=normalizeKinetic({...old,accent:'#abcdef',ink:'#123456'});assert.equal(custom.accent,'#abcdef');assert.equal(custom.ink,'#123456');
 for(const theme of KINETIC_THEMES){
  const fields=buildKineticGreetingFields({...old,theme:theme.id});
  assert.match(fields.first_mes,/aria-label="作品介绍"/);assert.match(fields.first_mes,/data-edit-intro>我的作品介绍\n第二段/);
  assert.match(fields.first_mes,/本篇简介<\/span><p class="entry-summary">自己的简介/);
 }
});
test('custom display heading survives configuration, workshop generation and appearance changes',()=>{
 const d={...kineticDefaults('pixel-dusk'),displayTitle:'After 07\n雨停以后 & 再见',worldlines:[{id:'old-line',name:'原线路',entries:[{book:'原书',uid:8}]}]};
 const config=normalizeKinetic(JSON.parse(JSON.stringify(d)));
 assert.equal(config.displayTitle,d.displayTitle);
 const fields=buildKineticGreetingFields(config);
 assert.match(fields.first_mes,/aria-label="After 07\n雨停以后 &amp; 再见"/);
 assert.match(fields.first_mes,/native-glyph/);
 const home=normalizeOpeningHomeSettings({...d,entries:[{title:'原始第四篇',target:4,worldlineId:'old-line'}]});
 assert.equal(home.displayTitle,d.displayTitle);
 const changed=applyOpeningTemplate(home,createOpeningTemplate(kineticDefaults('signal-field')));
 assert.equal(changed.displayTitle,d.displayTitle);
 assert.deepEqual(changed.entries,home.entries);assert.deepEqual(changed.worldlines,home.worldlines);
 assert.match(buildOpeningHomeRegexPack(home)[0].replaceString,/aria-label="After 07\n雨停以后 &amp; 再见"/);
});
test('empty heading stays empty through normalization and export but remains editable in preview',()=>{
 const d={...kineticDefaults('pixel-dusk'),displayTitle:''};
 assert.equal(normalizeKinetic(d).displayTitle,'');assert.equal(normalizeOpeningHomeSettings(d).displayTitle,'');
 assert.doesNotMatch(buildKineticPage(d),/data-edit-display-title/);
 assert.match(buildKineticPage(d,'home',{preview:true}),/data-edit-display-title>点击填写顶部大字/);
 assert.equal(normalizeKinetic({...d,displayTitle:'字'.repeat(100)}).displayTitle.length,80);
});
test('heading accepts the whole Latin alphabet, numerals and escaped unknown characters',()=>{
 const d={...kineticDefaults('pixel-dusk'),displayTitle:'ABCDEFGHIJKLMNOPQRSTUVWXYZ\n0123456789\n<script>!?'};
 const fields=buildKineticGreetingFields(d);
 assert.doesNotMatch(fields.first_mes,/<script>!\?/);
 assert.match(fields.first_mes,/&lt;script&gt;!\?/);
 for(const script of fields.first_mes.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new Script(script[1]);
});
test('optional media is not embedded and zero or many entries do not fail generation',()=>{
 for(const count of [0,1,20]){
  const d=normalizeKinetic({theme:'soft-clock',imageUrl:'data:image/png;base64,AAAA',entries:Array.from({length:count},(_,i)=>({id:'home',title:`第${i}篇`,body:'短正文'}))});
  assert.equal(d.imageUrl,'');assert.equal(new Set(d.entries.map(e=>e.id)).size,count);
  const fields=buildKineticGreetingFields(d);assert.equal(fields.alternate_greetings.length,count);assert.doesNotMatch(fields.first_mes,/<img/);
 }
});

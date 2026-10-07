import test from 'node:test';
import assert from 'node:assert/strict';
import { Script } from 'node:vm';
import { buildBloomPage, buildBloomGreetingFields, BLOOM_DEFAULTS, bloomInteraction } from '../opening-bloom-letter.js';
import { createOpeningTemplate, applyOpeningTemplate, parseOpeningTemplate } from '../opening-template-package.js';
import { buildOpeningHomeRegex } from '../opening-home-generator.js';
function mountBloom({ reduce=false, storage=new Map(), key='story-a', denied=false, viewId=1000 }={}) {
 const nodes=Object.fromEntries(['.bloom-page','.bloom-scene','.bloom-flower','.bloom-letter','.bloom-hint','h2'].map(k=>[k,{
  dataset:{phase:'closed',bloomKey:key},hidden:false,disabled:false,events:[],animations:[],
  addEventListener(_,fn){this.click=fn;},focus(){this.focused=true;},querySelector(k){return nodes[k];},
  getBoundingClientRect(){return {height:nodes['.bloom-letter'].hidden?300:540};},
  animate(frames,options){this.animations.push({frames,options});},dispatchEvent(event){this.events.push(event.type);}
 }]));
 nodes['.bloom-letter'].hidden=true;
 const queue=[];
 new Script('('+bloomInteraction.toString()+')()').runInNewContext({
  document:{querySelector:k=>nodes[k]},matchMedia:()=>({matches:reduce}),
  window:{parent:{performance:{timeOrigin:viewId}}},performance:{timeOrigin:viewId+1},
  sessionStorage:{getItem:key=>{if(denied)throw Error('denied');return storage.get(key);},setItem:(key,value)=>{if(denied)throw Error('denied');storage.set(key,value);}},
  setTimeout:fn=>queue.push(fn),Event:class {constructor(type){this.type=type;}}
 });
 return {nodes,queue};
}
test('one click reveals the entire letter, including reduced motion and blocked storage',()=>{
 for(const reduce of [false,true])for(const denied of [false,true]){
  const {nodes,queue}=mountBloom({reduce,denied});
  nodes['.bloom-flower'].click();nodes['.bloom-flower'].click();
  assert.ok(queue.length<=1);
  if(reduce)assert.equal(nodes['.bloom-letter'].hidden,false);
  while(queue.length)queue.shift()();
  assert.equal(nodes['.bloom-letter'].hidden,false);
  assert.equal(nodes['.bloom-scene'].hidden,true);
  assert.equal(nodes.h2.focused,true);
  assert.equal(nodes['.bloom-page'].events.length,1);
  if(reduce)assert.equal(nodes['.bloom-page'].animations.length,0);
 }
});
test('returning to the same letter stays open without a second gesture or animation',()=>{
 const storage=new Map();
 const first=mountBloom({storage});first.nodes['.bloom-flower'].click();while(first.queue.length)first.queue.shift()();
 const returned=mountBloom({storage});
 assert.equal(returned.nodes['.bloom-letter'].hidden,false);
 assert.equal(returned.nodes['.bloom-scene'].hidden,true);
 assert.equal(returned.nodes['.bloom-page'].animations.length,0);
 assert.equal(returned.nodes.h2.focused,undefined);
 assert.equal(mountBloom({storage,key:'another-story'}).nodes['.bloom-letter'].hidden,true);
});
test('a fresh page visit shows the envelope even after the letter was opened earlier',()=>{
 const storage=new Map([['status-atelier:bloom-open:story-a','1']]);
 const first=mountBloom({storage,viewId:1000});
 assert.equal(first.nodes['.bloom-letter'].hidden,true);
 first.nodes['.bloom-flower'].click();while(first.queue.length)first.queue.shift()();
 assert.equal(mountBloom({storage,viewId:1000}).nodes['.bloom-letter'].hidden,false);
 const refreshed=mountBloom({storage,viewId:2000});
 assert.equal(refreshed.nodes['.bloom-letter'].hidden,true);
 assert.equal(refreshed.nodes['.bloom-scene'].hidden,false);
});
test('rendered pages have no second envelope or close action and can preserve an open preview',()=>{
 const closed=buildBloomPage(BLOOM_DEFAULTS);
 assert.doesNotMatch(closed,/<button[^>]*class="(?:envelope|bloom-reset)"|重新合上|轻触拆信/);
 assert.match(closed,/<section class="bloom-letter" hidden>/);
 assert.doesNotMatch(buildBloomPage(BLOOM_DEFAULTS,'home',{opened:true}),/<section class="bloom-letter" hidden>/);
});
test('exported greetings retain complete executable documents, escaped text and return targets',()=>{
 const pkg=buildBloomGreetingFields({...BLOOM_DEFAULTS,title:'<script>bad</script>',envelopeUrl:'https://cdn.example/envelope.webp',artUrl:'https://images.example/flower.webp'});
 for(const html of [pkg.first_mes,...pkg.alternate_greetings]){assert.match(html,/^```html\n<!DOCTYPE html>/);assert.match(html,/<body>[\s\S]*<\/body>/);assert.doesNotMatch(html,/<script>bad/);for(const [,script]of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))new Script(script);}
 assert.doesNotMatch(pkg.first_mes,/data:image\/(?:png|jpeg|webp);base64/);assert.match(pkg.first_mes,/https:\/\/images.example\/flower.webp/);assert.throws(()=>buildBloomGreetingFields({...BLOOM_DEFAULTS,artUrl:'data:image/png;base64,AAAA'}),/图床/);assert.match(pkg.alternate_greetings[0],/data-target="bloom-home"/);
});
test('default exports and workshop generation use the published compressed envelope link',()=>{
 const fields=buildBloomGreetingFields(BLOOM_DEFAULTS);
 const workshop=buildOpeningHomeRegex({theme:'bloom-letter',title:'公开作品',entries:[{title:'来信',target:2}]}).replaceString;
 for(const html of [fields.first_mes,workshop]){
  assert.match(html,/<img src="https:\/\/raw\.githubusercontent\.com\/jiuyi777\/Zeya-Status-Atelier\/v0.11.41\/assets\/opening-bloom-letter\/letter-pencil-blush-v2\.webp"/);
  assert.doesNotMatch(html,/<img[^>]+src="(?:file:|http:|blob:|data:)/);
 }
});
test('sharing and importing appearance preserves private greetings and worldbook bindings',()=>{
 const home={theme:'bloom-letter',title:'私密故事',entries:[{body:'private',target:4}],worldlines:[{entries:[{book:'private'}]}]};
 const pkg=JSON.parse(JSON.stringify(createOpeningTemplate(home,'花信','九一')));assert.doesNotMatch(JSON.stringify(pkg),/private|私密故事|worldlines/);
 const imported=applyOpeningTemplate(home,pkg);assert.equal(imported.entries,home.entries);assert.equal(imported.worldlines,home.worldlines);assert.equal(imported.title,home.title);
 assert.throws(()=>parseOpeningTemplate({...pkg,version:2}));assert.throws(()=>parseOpeningTemplate({...pkg,appearance:{theme:'unknown'}}));
});

test('workshop letter keeps the introduction separate from complete recommendations and routes',()=>{
 const html=buildOpeningHomeRegex({theme:'bloom-letter',intro:'作品的长篇背景。',model:'模型甲\n模型乙',preset:'预设丙',worldlines:[{id:'a',name:'路线甲',description:'完整线路说明'}],entries:[{title:'重逢',target:4}]}).replaceString;
 const intro=html.match(/<div class="letter-intro">([\s\S]*?)<\/div>/)[1];
 assert.equal(intro,'作品的长篇背景。');
 assert.match(html,/<dl class="letter-publication">[\s\S]*模型甲[\s\S]*模型乙[\s\S]*预设丙[\s\S]*<\/dl>/);
 assert.match(html,/<div class="letter-routes">[\s\S]*完整线路说明/);
 assert.match(html,/随信附页/);
});

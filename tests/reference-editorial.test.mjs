import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {editorialRuntime} from '../reference-editorial-runtime.js';
import {REFERENCE_STATUS_PRESETS,referenceStatusMeta} from '../reference-status.js';
import {wechatConversationRows} from '../scripts/reference-wechat.mjs';

test('WeChat preserves single-message content and separates explicit senders',()=>{
 assert.deepEqual(wechatConversationRows('原有单条消息'),[{outgoing:false,text:'原有单条消息'}]);
 assert.deepEqual(wechatConversationRows('对方：第一行\n续行\n我：回复\n角色：<img src=x>'),[
  {outgoing:false,text:'第一行\n续行'},{outgoing:true,text:'回复'},{outgoing:false,text:'<img src=x>'}
 ]);
});
test('day/night selection survives reopening and takes priority over worldbook default',async()=>{
 const storage=new Map();
 function open(){const attributes={},listeners={},html={dataset:{}};const button={setAttribute(k,v){attributes[k]=v;},addEventListener(k,v){listeners[k]=v;}};
 const root={querySelector:s=>s==='.sta-theme'?button:null,querySelectorAll:()=>[]};const window={};const document={querySelector:()=>root,documentElement:html,fonts:{load:async()=>[{}]}};
 vm.runInNewContext('('+editorialRuntime.toString()+')("test")',{document,window,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)}});
 return {html,window,button,attributes,click:()=>listeners.click()};}
 const first=open();assert.equal(first.html.dataset.mode,'night');first.window.staApplyReferenceTheme('day');assert.equal(first.html.dataset.mode,'day');first.click();assert.equal(first.html.dataset.mode,'night');first.window.staApplyReferenceTheme('day');assert.equal(first.html.dataset.mode,'night');first.click();
 const reopened=open();assert.equal(reopened.html.dataset.mode,'day');assert.equal(reopened.attributes['aria-label'],'切换到黑夜版');
 await Promise.resolve();assert.equal(reopened.html.dataset.fontReady,'true');
});
for(const preset of REFERENCE_STATUS_PRESETS)test(preset.id+' keeps executable controls without ambient loops',()=>{
 const html=referenceStatusMeta(preset.id).html;
 for(const [,script] of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))new vm.Script(script);
 const animations=[...html.matchAll(/animation\s*:\s*([^;}]*infinite[^;}]*)/g)].map(m=>m[1].trim());
 assert(animations.every(value=>value==='sta-disc 12s linear infinite'),'only audio-playing disc may loop');
 assert.doesNotMatch(html,/motion-switch|ticket-breathe/);
 assert.match(html,/class="sta-theme"/);
});

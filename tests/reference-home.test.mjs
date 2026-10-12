import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {socialRuntime} from '../opening-social-reference.js';
import {buildOpeningHomePreviewDocument} from '../opening-home-generator.js';
test('social homepage saves bound entries, restores them, and preserves unrelated data', async()=>{
 const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',checked:false,textContent:'',style:{},after(){},addEventListener(){},dispatchEvent(){}});return nodes.get(id);};
 let entries=[{uid:1,content:JSON.stringify({mode:'tongdan',weibo_name:'恢复昵称'}),enabled:true},{uid:2,enabled:false},{uid:3,enabled:false},{uid:4,enabled:true},{uid:5,content:'{"theme":"night"}'},{uid:9,content:'保留资料',extra:{x:1}}];
 const untouched=JSON.stringify(entries[5]);let calls=0;
 const window={parent:{},getWorldbook:async()=>entries,updateWorldbookWith:async(book,update)=>{assert.equal(book,'测试世界书');calls++;entries=update(entries);return entries;}};
 const sandbox={window,document:{querySelector:()=>node('notice'),getElementById:node,createElement:()=>node('image'),querySelectorAll:()=>[]},Event:class{},tdhnCurrentMode:'tongdan',tdhnSelectMode(){}};
 vm.runInNewContext('('+socialRuntime.toString()+')('+JSON.stringify({worldbook:'测试世界书',uidUserInfo:'1',uidVtuber:'2',uidWeibo:'3',uidWechat:'4',uidSettings:'5'})+')',sandbox);
 await new Promise(resolve=>setImmediate(resolve));assert.equal(node('tdhn-wb-name').value,'恢复昵称');assert.equal(node('tdhn-toggle-wechat').checked,true);
 node('tdhn-wb-name').value='新昵称';await window.tdhnSubmitForm({preventDefault(){}});assert.equal(JSON.parse(entries[0].content).weibo_name,'新昵称');
 await window.tdhnToggleWeibo(true);assert.equal(entries[2].enabled,true);
 await window.tdhnSwitchTheme('day',{});assert.equal(entries[4].content,'{"theme":"day"}');assert.equal(JSON.stringify(entries[5]),untouched);assert.equal(calls,3);
});
test('social editor preview cannot write worldbook or chat',()=>{
 const html=buildOpeningHomePreviewDocument({theme:'social-reference'});
 assert.doesNotMatch(html,/updateWorldbookWith|setChatMessages/);assert.match(html,/data-social-ui/);
});

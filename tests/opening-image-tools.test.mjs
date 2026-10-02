import test from 'node:test';
import assert from 'node:assert/strict';
import {insertImageAt,renderImageText,httpsImageUrl,uploadOpeningImage} from '../opening-image-tools.js';
import {buildBloomPage,buildBloomGreetingFields,BLOOM_DEFAULTS} from '../opening-bloom-letter.js';
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
test('insert two image links between paragraphs, render and export without binaries',()=>{
 const first=insertImageAt('前段\n后段',3,3,'https://cdn.example/a.webp','说明');
 const second=insertImageAt(first.text,first.cursor,first.cursor,'https://cdn.example/b.webp','');
 const html=renderImageText(second.text,escape);assert.equal((html.match(/<img /g)||[]).length,2);assert.ok(html.indexOf('前段')<html.indexOf('<figure'));assert.ok(html.indexOf('后段')>html.lastIndexOf('</figure>'));
 const data={...BLOOM_DEFAULTS,envelopeUrl:'https://cdn.example/envelope.webp',artUrl:'https://cdn.example/flower.webp',entries:[{id:'one',title:'测试',body:second.text}]};
 const json=JSON.stringify(buildBloomGreetingFields(data));assert.doesNotMatch(json,/data:image\/(png|webp|jpeg);base64|blob:/);assert.match(buildBloomPage(data,'one'),/<figure class="inline-picture">/);
});
test('only safe HTTPS URLs become images; arbitrary html stays escaped',()=>{
 for(const url of ['javascript:alert(1)','data:image/png;base64,AA','file:///private.png','https://user:pass@host/p'])assert.equal(httpsImageUrl(url),'');
 const html=renderImageText('<script>bad()</script>![x](javascript:alert(1))',escape);assert.doesNotMatch(html,/<script>|<img /);
 assert.throws(()=>insertImageAt('x',0,0,'blob:123'));
});
test('upload sends compressed file only; failure never produces an image link',async()=>{
 const blob=new Blob(['compressed'],{type:'image/webp'});let call;
 const url=await uploadOpeningImage(blob,{provider:'cloudinary',cloud:'demo',preset:'unsigned'},{fetcher:async(...args)=>{call=args;return{ok:true,json:async()=>({secure_url:'https://cdn.example/small.webp'})};}});
 assert.equal(url,'https://cdn.example/small.webp');assert.equal(call[1].body.get('file').size,blob.size);assert.equal(call[1].body.get('upload_preset'),'unsigned');
 await assert.rejects(uploadOpeningImage(blob,{provider:'imgbb',key:'test-key'},{fetcher:async()=>({ok:false,status:403})}),/403/);
 await assert.rejects(uploadOpeningImage(blob,{provider:'imgbb',key:'test-key'},{fetcher:async()=>({ok:true,json:async()=>({data:{url:'javascript:bad'}})})}),/HTTPS/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import{readFile}from'node:fs/promises';
import{buildOpeningHomeRegex,buildOpeningHomePreviewDocument}from'../opening-home-generator.js';
import{ILLUSTRATED_THEMES,ILLUSTRATED_ASSET_BASE}from'../opening-illustrated.js';
import{createOpeningTemplate,applyOpeningTemplate}from'../opening-template-package.js';
for(const theme of ILLUSTRATED_THEMES)for(const count of [0,1,5])test(`${theme.id}: ${count} real entries and escaped dynamic text`,()=>{
 const data={theme:theme.id,title:'测试作品<&" $1 </script> 中文长标题',subtitle:'副标题',author:'作者甲',model:'模型甲',preset:'预设甲',intro:'真实世界观\n第二段',entries:Array.from({length:count},(_,i)=>({title:'开局 '+i+' <&" $1',route:'线'+i,summary:'内容'+i,target:i+7,worldlineId:'line-a'})),worldlines:[{id:'line-a',name:'世界线',entries:[{book:'测试书',uid:42}]}]};
 const rule=buildOpeningHomeRegex(data);assert.deepEqual(rule.placement,[1,2]);assert.equal(rule.markdownOnly,true);
 assert.match(rule.replaceString,/^```html\n<!doctype html>/i);assert.match(rule.replaceString,/<body>[\s\S]*<\/body>/);
 const{document:d}=parseHTML(rule.replaceString.slice(8,-4));
 assert.equal(d.querySelectorAll('.zoh-entry').length,count);assert.equal(d.querySelectorAll('.zoh-jump').length,count);
 for(const node of d.querySelectorAll('[data-home="title"]'))assert.equal(node.textContent,data.title);
 [...d.querySelectorAll('.zoh-entry')].forEach((node,i)=>{assert.equal(node.querySelector('[data-entry-field="title"]').textContent,data.entries[i].title);});
 for(const s of d.querySelectorAll('script'))new Function(s.textContent);
 assert.doesNotMatch(rule.replaceString,/旧街来信|认错人|辞职信|借伞|___JIUYI_|data:(?:image|font)\//);
 assert.match(rule.replaceString,/setChatMessages/);assert.match(rule.replaceString,/updateWorldbookWith/);assert.ok(rule.replaceString.includes(ILLUSTRATED_ASSET_BASE));
 const preview=buildOpeningHomePreviewDocument(data);assert.doesNotMatch(preview,/setChatMessages|updateWorldbookWith/);
 if(theme.id==='illustrated-flight')assert.match(preview,/data-illustrated-local/);
 const swapped=applyOpeningTemplate(data,createOpeningTemplate({...data,theme:'classical'}));assert.deepEqual(swapped.entries,data.entries);assert.deepEqual(swapped.worldlines,data.worldlines);
});
test('script import artifact is stable and host module paths stay local',async()=>{
 const a=JSON.parse(await readFile(new URL('../script-version/jiuyi-status-atelier.json',import.meta.url)));
 assert.equal(a.type,'script');assert.equal(a.id,'jiuyi-status-atelier-script-v1');assert.equal(a.button.buttons.length,2);new Function(a.content);
 const bundle=await readFile(new URL('../script-version/workbench.mjs',import.meta.url),'utf8');assert.doesNotMatch(bundle,/from ["']\.\.\//);assert.match(bundle,/from "\/scripts\/extensions.js"/);assert.match(bundle,/bindEvents\(\);/);assert.match(bundle,/export \{/);assert.doesNotMatch(a.content,/cdn\.jsdelivr/);assert.match(a.content,/workbench\.css/);assert.match(bundle,/replaceString: isIllustratedTheme/);
});

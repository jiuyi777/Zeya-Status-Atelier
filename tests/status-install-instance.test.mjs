import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {createStatusInstallInstance} from '../status-install-instance.js';
import {buildRegexScript,buildWorldbookJson,mergeStatusRegexScripts,STATUS_STRUCTURE_PRESETS} from '../rule-generator.js';
import {loadStatusBeautyBundledRegex,isStatusBeauty01To15} from '../status-beauty-01-15-bundle.js';
import {upsertStatusWorldbookData} from '../status-worldbook.js';

test('every template installs three independent instances with matching output tags and preserves existing data', async t => {
    t.mock.method(globalThis,'fetch',async url=>new Response(await readFile(url)));
    for (const preset of STATUS_STRUCTURE_PRESETS) {
        const input={structure:preset.id,tagName:'zeya_relationship',ruleName:'攻略关系状态栏',pageFieldsText:preset.fields.map(f=>f.join('|')).join('\n')};
        const original=isStatusBeauty01To15(preset.id)?await loadStatusBeautyBundledRegex(preset.id):buildRegexScript(input);
        const entry=buildWorldbookJson(input).entries[0];
        let scripts=[{id:'old',scriptName:original.scriptName,findRegex:original.findRegex,replaceString:'preserve'}];
        let book={entries:{42:{uid:42,comment:'existing',content:'preserve'}}};
        const tags=[];
        for(let i=0;i<3;i++){
            let pair; try { pair=createStatusInstallInstance(original,entry,`instance${i}`); } catch(error) { throw new Error(preset.id+": "+error.message); }
            const merged=mergeStatusRegexScripts(scripts,pair.script,input);
            assert.equal(merged.replaced.length,0,preset.id);
            scripts=merged.scripts;
            book=upsertStatusWorldbookData(book,pair.entry).data;
            assert.ok(pair.entry.content.includes(`<sta_instance${i}>`),preset.id);
            assert.ok(pair.script.findRegex.includes(`<sta_instance${i}>`),preset.id);
            assert.ok(pair.script.findRegex.includes(`<\\/sta_instance${i}>`),preset.id);
            tags.push(pair.script.findRegex);
        }
        assert.equal(scripts.length,4,preset.id);
        assert.equal(Object.keys(book.entries).length,4,preset.id);
        assert.equal(scripts[0].replaceString,'preserve');
        assert.equal(book.entries[42].content,'preserve');
        assert.equal(new Set(tags).size,3,preset.id);
    }
});

test('the actual one-click installation entry point creates three separate instances of the same design', async () => {
    const source=await readFile(new URL('../index.js',import.meta.url),'utf8');
    const code=source.match(/async function installRegex\(scope\) \{[\s\S]*?\n\}/)[0];
    const input={structure:'beauty-lunar-orbit-35',tagName:'zeya_relationship',ruleName:'攻略关系状态栏'};
    let scripts=[],book={entries:{}},next=0;
    const config={};
    const box={requireCurrentCharacterContext:()=>({character:{avatar:'same.png'}}),
        resolveStatusRegexScript:async()=>buildRegexScript(input),resolvedStatusInput:()=>input,
        buildWorldbookJson,createStatusInstallInstance,crypto:{randomUUID:()=>`unique${++next}`},
        installStatusWorldbookRule:async entry=>{book=upsertStatusWorldbookData(book,entry).data;return {bookName:'当前世界书'};},
        installGeneratedRegex:async script=>{scripts=mergeStatusRegexScripts(scripts,script,input).scripts;},
        settings:()=>config,field:()=>null,updatePrompt(){},saveSettings:async()=>{},notify(){},
    };
    vm.runInNewContext(code,box);
    for(let i=0;i<3;i++)await box.installRegex('scoped');
    assert.equal(scripts.length,3);
    assert.equal(Object.keys(book.entries).length,3);
    for(let i=0;i<3;i++){
        const literal=scripts[i].findRegex,last=literal.lastIndexOf('/');
        const regex=new RegExp(literal.slice(1,last),literal.slice(last+1));
        for(let j=0;j<3;j++)assert.equal(regex.test(`<sta_unique${j+1}>\n[View1|内容]\n</sta_unique${j+1}>`),i===j);
    }
});

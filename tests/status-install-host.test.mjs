import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {mergeStatusRegexScripts} from '../rule-generator.js';

const source = await readFile(new URL('../index.js', import.meta.url), 'utf8');
const code = source.match(/async function installGeneratedRegex\(script, requestedScope = settings\(\)\.installScope\) \{[\s\S]*?\n\}/)[0];
test('copy install confirms the active regex engine and does not reload a missing or unsaved chat', async () => {
    for (const engineSeesInstall of [false, true]) {
        const script = {id:'35',scriptName:'月相观测簿',findRegex:'test',replaceString:'<body>test</body>',disabled:false};
        const character = {avatar:'current.png',data:{extensions:{regex_scripts:[]}}};
        const selection = {character,context:{getRequestHeaders:()=>({})}};
        let refreshed = 0;
        const box = {settings:()=>({}),SCRIPT_TYPES:{SCOPED:1,GLOBAL:0},requireCurrentCharacterContext:()=>selection,
            mergeStatusRegexScripts:()=>({installedScript:script,replaced:[],scripts:[script]}),resolvedStatusInput:()=>({}),
            fetch:async (url,init)=>{
                const payload = JSON.parse(init.body);
                assert.equal(payload.avatar || payload.avatar_url, 'current.png');
                return {ok:true,json:async()=>({data:{extensions:{regex_scripts:[script]}}})};
            },document:{querySelector:()=>null},allowScopedScripts(){},isScopedScriptsAllowed:()=>true,saveSettings:async()=>{},
            getScriptsByType:(type, options)=>{assert.equal(type,1);assert.equal(options.allowedOnly,true);return engineSeesInstall?[script]:[];},
            reloadCurrentChat:async()=>{refreshed++;throw new Error('Chat could not be loaded');},
        };
        vm.runInNewContext(code,box);
        if(engineSeesInstall) {
            await box.installGeneratedRegex(script,'scoped');
            assert.equal(refreshed,0);
        } else {
            await assert.rejects(box.installGeneratedRegex(script,'scoped'),/正则引擎没有读取到/);
            assert.equal(refreshed,0);
        }
    }
});

test('scoped install merges from disk and rejects data lost after settings save', async () => {
    for (const loseAfterSave of [false,true]) {
        const old={id:'old',scriptName:'之前的状态栏',findRegex:'old',replaceString:'old body'};
        const fresh={id:'sta-instance-new',statusAtelierInstance:'new',scriptName:'新状态栏',findRegex:'new',replaceString:'new body'};
        let disk=[old], saved=false;
        const character={avatar:'current.png',data:{extensions:{regex_scripts:[]}}};
        const box={settings:()=>({}),SCRIPT_TYPES:{SCOPED:1,GLOBAL:0},
            requireCurrentCharacterContext:()=>({character,context:{getRequestHeaders:()=>({})}}),
            mergeStatusRegexScripts,resolvedStatusInput:()=>({}),
            fetch:async (url,init)=>{
                if(url.endsWith('merge-attributes'))disk=JSON.parse(init.body).data.extensions.regex_scripts;
                return {ok:true,json:async()=>({data:{extensions:{regex_scripts:structuredClone(saved&&loseAfterSave?[old]:disk)}}})};
            },document:{querySelector:()=>null},allowScopedScripts(){},isScopedScriptsAllowed:()=>true,
            saveSettings:async()=>{saved=true;},getScriptsByType:()=>character.data.extensions.regex_scripts,
            reloadCurrentChat:()=>{throw new Error('must not access chat');},
        };
        vm.runInNewContext(code,box);
        if(loseAfterSave)await assert.rejects(box.installGeneratedRegex(fresh,'scoped'),/最终回读/);
        else {
            await box.installGeneratedRegex(fresh,'scoped');
            assert.equal(disk.length,2);
            assert.deepEqual(disk[0],old);
            assert.equal(disk[1].id,fresh.id);
        }
    }
});

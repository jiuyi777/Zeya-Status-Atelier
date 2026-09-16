import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

const source = await readFile(new URL('../index.js', import.meta.url), 'utf8');
const code = source.match(/async function installGeneratedRegex\(script, requestedScope = settings\(\)\.installScope\) \{[\s\S]*?\n\}/)[0];
test('copy install confirms the active regex engine and refreshes the host before completing', async () => {
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
            reloadCurrentChat:async()=>{refreshed++;},
        };
        vm.runInNewContext(code,box);
        if(engineSeesInstall) {
            await box.installGeneratedRegex(script,'scoped');
            assert.equal(refreshed,1);
        } else {
            await assert.rejects(box.installGeneratedRegex(script,'scoped'),/正则引擎没有读取到/);
            assert.equal(refreshed,0);
        }
    }
});

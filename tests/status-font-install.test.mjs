import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {compactRegexFonts,HUIWEN_PUBLIC_FONT_URL} from '../font-resources.js';
import {mergeStatusRegexScripts} from '../rule-generator.js';

const source=await readFile(new URL('../index.js',import.meta.url),'utf8');
const code=source.match(/async function installGeneratedRegex\(script, requestedScope = settings\(\)\.installScope, preserveIdentity = false\) \{[\s\S]*?\n\}/)[0];
const font=await readFile(new URL('../assets/reference-status/fonts/HuiwenMincho.woff2',import.meta.url));
const embedded='data:font/woff2;base64,'+font.toString('base64');
const old={id:'old-custom',scriptName:'自定义旧状态栏',findRegex:'old',replaceString:`<style>@font-face{font-family:Huiwen;src:url(${embedded})}</style><button onclick="this.textContent=1">原按钮</button>`,disabled:true,custom:{keep:1}};
const unrelated={id:'other',scriptName:'其他正则',findRegex:'other',replaceString:'保留用户脚本'};
const fresh={id:'sta-instance-new',statusAtelierInstance:'new',scriptName:'新状态栏',findRegex:'new',replaceString:'新内容',disabled:false};

function harness({scope='scoped',loseAfterSave=false,switchDuringCleanup=false,incoming=fresh}={}) {
    let disk=structuredClone([old,unrelated]),saved=false,writes=0,active='current.png';
    const character={avatar:'current.png',data:{extensions:{regex_scripts:[]}}};
    const ctx={getRequestHeaders:()=>({})};
    const box={settings:()=>({}),SCRIPT_TYPES:{SCOPED:1,GLOBAL:0},context:()=>ctx,
        requireCurrentCharacterContext:()=>({character:active==='current.png'?character:{avatar:active},context:ctx}),
        compactRegexFonts:async scripts=>{const result=await compactRegexFonts(scripts);if(switchDuringCleanup)active='other.png';return result;},
        mergeStatusRegexScripts,resolvedStatusInput:()=>({}),
        fetch:async(url,init)=>{
            if(url.endsWith('merge-attributes')){writes++;disk=JSON.parse(init.body).data.extensions.regex_scripts;}
            const current=saved&&loseAfterSave?[old,unrelated,incoming]:disk;
            return {ok:true,json:async()=>({data:{extensions:{regex_scripts:structuredClone(current)}}})};
        },
        document:{querySelector:()=>null},allowScopedScripts(){},isScopedScriptsAllowed:()=>true,
        saveSettings:async()=>{saved=true;},getScriptsByType:()=>scope==='global'?disk:character.data.extensions.regex_scripts,
        saveScriptsByType:async scripts=>{writes++;disk=structuredClone(scripts);},
    };
    vm.runInNewContext(code,box);
    return {run:()=>box.installGeneratedRegex(incoming,scope),getDisk:()=>disk,getWrites:()=>writes};
}

test('installation cleans retained old fonts, preserves custom regexes and stays small on repeat install',async()=>{
    for(const scope of ['scoped','global']) {
        const run=harness({scope});
        await run.run();
        let disk=run.getDisk();
        assert.ok(Buffer.byteLength(JSON.stringify(disk))<10000,'retained old font must be cleaned during install');
        assert.deepEqual(disk[0],{...old,replaceString:old.replaceString.replace(embedded,HUIWEN_PUBLIC_FONT_URL)});
        assert.deepEqual(disk[1],unrelated);
        assert.equal(disk.length,3);
        const first=JSON.stringify(disk);
        await run.run();
        assert.equal(JSON.stringify(run.getDisk()),first);
        assert.ok(old.replaceString.includes(embedded),'source is not mutated');
    }
});

test('installation also compacts an incoming legacy regex',async()=>{
    const incoming={...fresh,replaceString:old.replaceString};
    const run=harness({incoming});await run.run();
    assert.ok(run.getDisk().every(script=>!script.replaceString.includes(embedded)));
    assert.ok(incoming.replaceString.includes(embedded));
});

test('installation stops before saving if character changes during font processing',async()=>{
    const run=harness({switchDuringCleanup:true});
    await assert.rejects(run.run(),/切换了角色/);
    assert.equal(run.getWrites(),0);
});

test('final reread detects a host restoring the old embedded font',async()=>{
    const run=harness({loseAfterSave:true});
    await assert.rejects(run.run(),/最终回读/);
});

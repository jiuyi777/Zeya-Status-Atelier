import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { compactCardJson, compactCardBytes } from '../scripts/compact-card-fonts.mjs';
import { HUIWEN_PUBLIC_FONT_URL } from '../font-resources.js';

const font=await readFile(new URL('../assets/reference-status/fonts/HuiwenMincho.woff2',import.meta.url));
const embedded='data:font/woff2;base64,'+font.toString('base64');
const regex={id:'retain',scriptName:'保留原名',disabled:true,findRegex:'original',replaceString:`<style>@font-face{font-family:Huiwen;src:url(${embedded})}</style><button>展开</button>`,custom:{keep:1}};
const card={spec:'chara_card_v2',spec_version:'2.0',data:{name:'测试',description:'保留角色内容',first_mes:'保留开场白',alternate_greetings:['保留线路'],character_book:{entries:[{id:1,content:'保留世界书'}]},extensions:{other:{keep:true},regex_scripts:[regex,{id:'user',replaceString:'user script'}]}},unknown:{keep:'value'}};

test('legacy cleanup preserves fields, IDs, ordering, flags, worldbook and the input object',async()=>{
    const result=await compactCardJson(card);
    assert.equal(result.changedRegexes,1);
    assert.ok(result.card.data.extensions.regex_scripts[0].replaceString.length<1000);
    assert.ok(card.data.extensions.regex_scripts[0].replaceString.includes(embedded));
    const expected=structuredClone(card);
    expected.data.extensions.regex_scripts[0].replaceString=regex.replaceString.replace(embedded,HUIWEN_PUBLIC_FONT_URL);
    assert.deepEqual(result.card,expected);
    assert.equal((await compactCardJson(result.card)).changedRegexes,0);
});

test('JSON and single regex copies retain their data; unchanged files retain their bytes',async()=>{
    const clean=Buffer.from('{ "description": "保留格式", "unknown": 1 }\n');
    assert.deepEqual((await compactCardBytes(clean)).bytes,clean);
    const result=await compactCardBytes(Buffer.from(JSON.stringify(regex)));
    assert.equal(result.changedRegexes,1);
    assert.equal(JSON.parse(result.bytes).replaceString,regex.replaceString.replace(embedded,HUIWEN_PUBLIC_FONT_URL));
});

test('malformed PNG or JSON stops instead of returning a damaged card',async()=>{
    await assert.rejects(compactCardBytes(Buffer.from('{')));
    await assert.rejects(compactCardBytes(Buffer.from([137,80,78,71,13,10,26,10])),/PNG/);
});

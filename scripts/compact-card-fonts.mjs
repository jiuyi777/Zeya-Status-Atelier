// Repair a copy of a JSON/PNG card. Only known embedded font URLs in regex
// replacements change; every other field and every image chunk is retained.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { compactEmbeddedFonts } from '../font-resources.js';

export async function compactCardJson(card) {
    const result = structuredClone(card);
    let changedRegexes = 0;
    const lists = [result?.data?.extensions?.regex_scripts, result?.extensions?.regex_scripts];
    if (typeof result?.replaceString === 'string') lists.push([result]);
    for (const list of new Set(lists.filter(Array.isArray))) {
        for (const script of list) {
            if (typeof script?.replaceString !== 'string') continue;
            const compact = await compactEmbeddedFonts(script.replaceString, {checkSize:false});
            if (compact !== script.replaceString) { script.replaceString=compact; changedRegexes++; }
        }
    }
    return {card:result,changedRegexes};
}

function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
        crc ^= byte;
        for (let bit = 0; bit < 8; bit++) crc=(crc>>>1)^((crc&1)?0xedb88320:0);
    }
    return (crc^0xffffffff)>>>0;
}

export async function compactCardBytes(input) {
    const bytes=Buffer.from(input);
    const png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    if (!png) {
        const result=await compactCardJson(JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/,'')));
        return {bytes:result.changedRegexes?Buffer.from(JSON.stringify(result.card,null,2)+'\n'):bytes,changedRegexes:result.changedRegexes,payloads:1};
    }
    const chunks=[bytes.subarray(0,8)];
    let offset=8,changedRegexes=0,payloads=0,ended=false;
    while (offset+12<=bytes.length) {
        const length=bytes.readUInt32BE(offset),end=offset+12+length;
        if(end>bytes.length) throw Error('PNG 数据不完整');
        const type=bytes.toString('ascii',offset+4,offset+8);
        let chunk=bytes.subarray(offset,end);
        if(type==='tEXt') {
            const data=bytes.subarray(offset+8,end-4),separator=data.indexOf(0);
            const keyword=data.subarray(0,separator).toString('latin1');
            if(separator>=0 && /^(?:chara|ccv3)$/i.test(keyword)) {
                payloads++;
                const json=Buffer.from(data.subarray(separator+1).toString('ascii'),'base64').toString('utf8');
                const result=await compactCardJson(JSON.parse(json));
                changedRegexes+=result.changedRegexes;
                if(result.changedRegexes) {
                    const payload=Buffer.concat([data.subarray(0,separator+1),Buffer.from(Buffer.from(JSON.stringify(result.card)).toString('base64'))]);
                    chunk=Buffer.alloc(payload.length+12);
                    chunk.writeUInt32BE(payload.length); chunk.write('tEXt',4); payload.copy(chunk,8);
                    chunk.writeUInt32BE(crc32(chunk.subarray(4,-4)),chunk.length-4);
                }
            }
        }
        chunks.push(chunk); offset=end;
        if(type==='IEND') { ended=true; chunks.push(bytes.subarray(offset)); break; }
    }
    if(!ended) throw Error('PNG 缺少结束块');
    if(!payloads) throw Error('PNG 中没有角色卡数据');
    return {bytes:changedRegexes?Buffer.concat(chunks):bytes,changedRegexes,payloads};
}

async function main() {
    const [input,output]=process.argv.slice(2);
    if(!input||!output) throw Error('用法：node scripts/compact-card-fonts.mjs 原卡.png 瘦身副本.png');
    if(resolve(input).toLowerCase()===resolve(output).toLowerCase()) throw Error('请使用新的输出文件名，保留原卡');
    const original=await readFile(input);
    const result=await compactCardBytes(original);
    // Exclusive creation also protects an existing output or a same-file hard link.
    await writeFile(output,result.bytes,{flag:'wx'});
    console.log(JSON.stringify({beforeBytes:original.length,afterBytes:result.bytes.length,savedBytes:original.length-result.bytes.length,changedRegexes:result.changedRegexes,payloads:result.payloads}));
}
if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
    main().catch(error=>{console.error(error.message);process.exitCode=1;});
}

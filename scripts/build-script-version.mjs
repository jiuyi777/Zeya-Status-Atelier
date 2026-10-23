import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
const base='https://cdn.jsdelivr.net/gh/jiuyi777/Zeya-Status-Atelier@script-v1.1.0/';
await mkdir('script-version',{recursive:true});
const host={'../../../extensions.js':'/scripts/extensions.js','../../regex/engine.js':'/scripts/extensions/regex/engine.js','../../../world-info.js':'/scripts/world-info.js','../../../../script.js':'/script.js','../../../utils.js':'/scripts/utils.js'};
const result=await build({entryPoints:['index.js'],bundle:true,format:'esm',platform:'browser',write:false,target:'es2022',plugins:[{name:'script-host',setup(b){
 b.onResolve({filter:/.*/},args=>{if(host[args.path])return {path:host[args.path],external:true};if(args.path.startsWith('.'))return {path:path.resolve(args.resolveDir,args.path.split('?')[0])};});
 b.onLoad({filter:/\.js$/},async args=>{let s=(await readFile(args.path,'utf8')).replaceAll('\r\n','\n');
 if(path.basename(args.path)==='index.js'){
  s=s.slice(0,s.indexOf("if (document.readyState === 'loading')"));
  s=s.replace('const cleanupOpeningReturn = mountOpeningReturnNavigation','scriptReturnCleanup = mountOpeningReturnNavigation');
  s=s.replace("globalThis.addEventListener('pagehide', cleanupOpeningReturn, { once: true });",'');
  s=s.replace(/source\.on\(events\.(CHAT_CHANGED|MESSAGE_SWIPED),/g,'scriptOn(source, events.$1,');
  s=s.replace('await upgradeOpeningReturnRule();\n    scriptReturnCleanup','bindEvents();\n    scriptReturnCleanup');
  s=s.replace('for (let attempt = 0; attempt < 120;', 'for (let attempt = 0; !scriptDisposed && attempt < 120;');
  s+='\n'+await readFile('script-version/lifecycle-source.js','utf8');
 }
 const relative=path.relative(root,args.path).replaceAll('\\','/');
 s=s.replaceAll('import.meta.url',JSON.stringify(base+relative));
 // Legacy status renderers must use hosted resources when the extension is not installed.
 s=s.replaceAll('/scripts/extensions/third-party/status-atelier/',base);
 return {contents:s,loader:'js'};
 });
}}]});
await writeFile('script-version/workbench.mjs',result.outputFiles[0].text);
const content=await readFile('script-version/loader.js','utf8');
const artifact={type:'script',enabled:true,name:'九一 · 状态与开场工坊（脚本版）',id:'jiuyi-status-atelier-script-v1',content,info:'九一｜1.1.0｜酒馆助手全局脚本。保留原状态栏工坊、八款插画开场与动态角色数据。需要 SillyTavern 原生接口；勿与同名扩展同时启用。',button:{enabled:true,buttons:[{name:'制作状态栏',visible:true},{name:'制作开场白',visible:true}]},data:{},export_with:{data:true,button:true}};
await writeFile('script-version/jiuyi-status-atelier.json',JSON.stringify(artifact,null,2)+'\n');
await writeFile('script-version/component-spec.json',JSON.stringify({schemaVersion:1,deliveryMode:'component',kind:'helper-script',items:[{artifactName:'jiuyi-status-atelier',value:artifact}]},null,2)+'\n');
console.log('Workbench bytes',result.outputFiles[0].contents.length,'loader bytes',content.length);

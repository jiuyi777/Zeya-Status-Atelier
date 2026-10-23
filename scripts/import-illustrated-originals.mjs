import {readFile,writeFile,mkdir,copyFile,readdir} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {createHash} from 'node:crypto';
const input=process.argv[2]; if(!input)throw Error('Pass original HTML directory');
const catalog=[['01-双幅飞鸟-开场白主页.html','illustrated-flight','双幅飞鸟'],['02-花笺序页-开场白主页.html','illustrated-botanical','花笺序页'],['03-蓝墨来信-开场白主页.html','illustrated-cobalt','蓝墨来信'],['04-蓝花来信-开场白主页.html','illustrated-blue-letter','蓝花来信'],['星夜云层-开场白主页.html','illustrated-cloud','星夜云层'],['墨迹拼贴-开场白主页.html','illustrated-ink','墨迹拼贴'],['靛蓝序章-开场白主页.html','illustrated-indigo','靛蓝序章'],['花间索引-开场白主页.html','illustrated-index','花间索引']];
await mkdir('assets/opening-illustrated',{recursive:true});await mkdir('opening-illustrated-sources',{recursive:true});
const records=[];const assets=new Map();
function token(k){return '___JIUYI_'+k+'___'}
for(const [file,id,name] of catalog){
 const raw=await readFile(input+'/'+file,'utf8');
 let html=raw.replace(/data:([\w.+/-]+);base64,([A-Za-z0-9+/=\r\n]+)/g,(_,mime,b64)=>{
 const bytes=Buffer.from(b64,'base64'),hash=createHash('sha256').update(bytes).digest('hex');const ext=mime.includes('woff2')?'woff2':mime.includes('webp')?'webp':mime.includes('png')?'png':'bin';const path=hash.slice(0,20)+'.'+ext;assets.set(path,{bytes,mime,sha256:hash});return token('ASSET')+path;});
 const {document:d}=parseHTML(html);
 d.querySelector('meta[http-equiv="Content-Security-Policy"]')?.remove();
 d.querySelectorAll('.sample-editor,.sample-caption').forEach(n=>n.remove());
 d.querySelectorAll('span').forEach(n=>{if(!n.children.length&&/\b03\b/.test(n.textContent))n.textContent=n.textContent.replace(/\b03\b/g,token('COUNT'));});
 d.querySelectorAll('[data-home]').forEach(n=>{n.textContent=token('HOME_'+n.dataset.home);n.classList.remove('is-long')});
 d.title=token('HOME_title')+' · '+name;
 const entries=[...d.querySelectorAll('[data-entry]')],snippets=[];
 for(const n of entries){
 n.dataset.entry=token('INDEX');n.classList.add('zoh-entry');
 n.querySelectorAll('[data-entry-field]').forEach(x=>x.textContent=token('ENTRY_'+x.dataset.entryField));
 n.querySelectorAll('.chapter-folio,.entry-number,.opening-number,.entry-no').forEach(x=>x.textContent=token('NUMBER'));
 n.querySelectorAll('[data-opening-index]').forEach(x=>{x.classList.add('zoh-jump');x.removeAttribute('data-opening-index');x.removeAttribute('data-opening-target');x.setAttribute('aria-label',token('ENTRY_title'));if(x.tagName==='A')x.setAttribute('href','#');});
 snippets.push(n.outerHTML.replace(/>(?:01|02|03)</g,'>'+token('NUMBER')+'<'));
 }
 entries[0].before(d.createTextNode(token('ENTRIES')));entries.forEach(n=>n.remove());
 let behavior='';
 for(const script of [...d.querySelectorAll('script')]){
 let js=script.textContent;
 if(!js.includes('openingPreviewRuntime')){
 const at=js.indexOf('})({');
 if(at>=0){let start=at+3,end=start,depth=0,inString=false,escape=false;for(;end<js.length;end++){const c=js[end];if(inString){if(escape)escape=false;else if(c==='\\')escape=true;else if(c==='"')inString=false;}else{if(c==='"')inString=true;else if(c==='{')depth++;else if(c==='}'&&--depth===0){end++;break;}}}JSON.parse(js.slice(start,end));js=js.slice(0,start)+token('STATE')+js.slice(end);}
 js=js.replace(/document\.querySelector\('\.sample-editor'\)\.hidden = [^;]+;/g,'');behavior+=js+'\n';
 }
 script.remove();
 }
 const source={id,name,html:d.toString(),entries:snippets,behavior};
 await writeFile('opening-illustrated-sources/'+id+'.json',JSON.stringify(source,null,2)+'\n');
 records.push({id,name,source:file,sha256:createHash('sha256').update(raw).digest('hex')});
}
for(const[path,a]of assets)await writeFile('assets/opening-illustrated/'+path,a.bytes);
await writeFile('opening-illustrated-sources/provenance.json',JSON.stringify({source:'User-provided ChatGPT original HTML documents',available:records,missing:['旧街来信-图文错落版.html'],assets:[...assets].map(([path,a])=>({path,mime:a.mime,sha256:a.sha256,bytes:a.bytes.length}))},null,2)+'\n');
console.log({templates:records.length,assets:assets.size});


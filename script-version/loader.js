// 九一 · 状态与开场工坊 1.1.0 — run in a Tavern Helper global script.
(async()=>{
 const host=window.parent,doc=host.document,key='__jiuyiStatusAtelierScriptV1';
 const base='https://cdn.jsdelivr.net/gh/jiuyi777/Zeya-Status-Atelier@script-v1.1.0/';
 if(!host.SillyTavern?.getContext){throw Error('请在酒馆助手的全局脚本中导入并启用。');}
 if(host[key]||doc.getElementById('status-atelier-settings')){host.toastr?.warning('九一工坊已经运行，请停用重复脚本或同名扩展后重试。');return;}
 const owner={stopped:false,api:null};host[key]=owner;
 const nodes=[];let blobUrl='';
 const cleanup=()=>{owner.stopped=true;owner.api?.disposeScriptWorkbench();nodes.forEach(n=>n.remove());if(blobUrl)URL.revokeObjectURL(blobUrl);if(host[key]===owner)delete host[key];};
 window.addEventListener('pagehide',cleanup,{once:true});
 try{
  const response=await fetch(base+'script-version/workbench.mjs',{signal:AbortSignal.timeout(60000)});
  if(!response.ok)throw Error('脚本资源下载失败：'+response.status);
  let code=await response.text();
  code=code.replace(/from\s+(["'])(\/scripts\/[^"']+|\/script\.js)\1/g,(_,quote,file)=>'from '+JSON.stringify(host.location.origin+file));
  if(owner.stopped)return;
  await new Promise((resolve,reject)=>{const link=doc.createElement('link');link.rel='stylesheet';link.href=base+'style.css';const timer=setTimeout(()=>reject(Error('工坊样式下载超时')),60000);link.onload=()=>{clearTimeout(timer);resolve();};link.onerror=()=>{clearTimeout(timer);reject(Error('工坊样式下载失败'));};nodes.push(link);doc.head.append(link);});
  if(owner.stopped){cleanup();return;}
  blobUrl=URL.createObjectURL(new Blob([code],{type:'text/javascript'}));
  await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('工坊启动超时，请检查酒馆版本与控制台错误')),60000);
   owner.ready=()=>{clearTimeout(timer);resolve();};owner.failed=error=>{clearTimeout(timer);reject(error);};
   const element=doc.createElement('script');element.type='module';
   element.textContent=`try { const api=await import(${JSON.stringify(blobUrl)}); const owner=window[${JSON.stringify(key)}]; if(owner&&!owner.stopped){ owner.api=api; await api.mountScriptWorkbench(); if(owner.stopped)api.disposeScriptWorkbench(); else owner.ready(); } } catch(error){window[${JSON.stringify(key)}]?.failed(error);}`;
   nodes.push(element);doc.head.append(element);
  });
  if(owner.stopped){cleanup();return;}
  for(const [label,kind] of [['制作状态栏','status'],['制作开场白','opening']]){
   if(typeof eventOn==='function'&&typeof getButtonEvent==='function')eventOn(getButtonEvent(label),()=>owner.api.openScriptWorkbench(kind));
  }
  host.toastr?.success('九一脚本工坊已就绪，可从脚本按钮或魔杖菜单打开。');
 }catch(error){cleanup();host.toastr?.error(error.message,'九一工坊加载失败');console.error('[九一工坊]',error.message);}
})();

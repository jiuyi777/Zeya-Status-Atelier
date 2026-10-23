let scriptDisposed = false;
let scriptReturnCleanup = () => {};
const scriptSubscriptions = [];
function scriptOn(source,event,handler){source.on(event,handler);scriptSubscriptions.push(()=>(source.removeListener||source.off)?.call(source,event,handler));}
export async function mountScriptWorkbench(){
 if(document.getElementById('status-atelier-settings'))throw Error('已有九一工坊在运行，请先停用同名扩展或重复脚本。');
 if(!globalThis.SillyTavern?.getContext)throw Error('请在 SillyTavern 的酒馆助手全局脚本中启用。');
 scriptDisposed=false;
 await initialize();
 if(scriptDisposed){disposeScriptWorkbench();return;}
 if(!settingsRoot)throw Error('未找到酒馆扩展设置入口。');
}
export function openScriptWorkbench(kind){if(scriptDisposed)throw Error('脚本已停用');openGreetingModal(kind==='status'?'status':'opening');}
export function disposeScriptWorkbench(){
 scriptDisposed=true;scriptReturnCleanup();scriptSubscriptions.splice(0).forEach(stop=>stop());
 globalThis.removeEventListener('message',handleQuestMapEditorMessage);
 clearTimeout(saveTimer);
 settingsRoot?.remove();greetingModal?.remove();questMapEditorOverlay?.remove();
 document.querySelectorAll('#status-atelier-opening-menu-item,#status-atelier-status-menu-item,#status-atelier-entry-dialog,#zoh-global-switch-toast').forEach(n=>n.remove());
 context()?.setExtensionPrompt?.(PROMPT_KEY,'',1,0,false,0);
 settingsRoot=null;greetingModal=null;questMapEditorOverlay=null;
}

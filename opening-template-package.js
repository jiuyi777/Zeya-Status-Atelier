import { normalizeOpeningHomeSettings } from './opening-home-generator.js?v=0.11.39';
// Appearance-only sharing deliberately omits real greetings and worldbook bindings.
const keys=['theme','font','accent','background','cardBackground','text','secondary','introBackground','buttonColor'];
export function createOpeningTemplate(home, name=home.title, author=home.author){
 const source=normalizeOpeningHomeSettings(home);
 return {format:'jiuyi-opening-template',version:1,name:String(name||'未命名模板').slice(0,80),author:String(author||'九一').slice(0,80),appearance:Object.fromEntries(keys.map(k=>[k,source[k]]))};
}
export function parseOpeningTemplate(value){
 if(!value||value.format!=='jiuyi-opening-template'||value.version!==1||!value.appearance||typeof value.appearance!=='object')throw new Error('请选择工坊开场白模板 JSON（版本 1）');
 const normalized=createOpeningTemplate(value.appearance,value.name,value.author);
 if(normalized.appearance.theme!==value.appearance.theme)throw new Error('此模板需要更新工坊后再导入');
 return normalized;
}
export function applyOpeningTemplate(home,value){return {...home,...parseOpeningTemplate(value).appearance};}

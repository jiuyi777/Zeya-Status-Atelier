// A chat-specific renderer; keep the existing Header/Message field contract.
export function wechatConversationRows(text){
 const rows=[];
 for(const line of String(text).split(/\r?\n/)){
  if(!line.trim())continue;
  const match=line.match(/^\s*(我|自己|对方|角色)\s*[:：]\s*(.*)$/);
  if(match)rows.push({outgoing:match[1]==='我'||match[1]==='自己',text:match[2]});
  else if(rows.length)rows[rows.length-1].text+='\n'+line;
  else rows.push({outgoing:false,text:line});
 }
 return rows;
}
function renderWechatMessages(parse){
 const source=document.querySelector('.wc-message-source');
 const list=document.querySelector('.wc-messages');
 for(const row of parse(source.textContent)){
  const message=document.createElement('div');message.className='wc-msg-row'+(row.outgoing?' wc-outgoing':'');
  const avatar=document.createElement('div');avatar.className='wc-avatar '+(row.outgoing?'user-avatar':'char-avatar');
  avatar.setAttribute('aria-label',row.outgoing?'我的头像':'对方头像');avatar.textContent=row.outgoing?'我':'对';
  const bubble=document.createElement('div');bubble.className='wc-bubble';bubble.textContent=row.text;
  message.append(avatar,bubble);list.append(message);
 }
 source.remove();
}
export function buildWechatTemplate(){return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>
<main class="sta-edition wc-conversation" data-family="wechat">
 <header class="wc-header"><span class="wc-title" role="heading" aria-level="1">$1</span><button class="sta-theme" type="button" aria-label="切换到白天版" aria-pressed="true">白天版</button></header>
 <section class="wc-chat" aria-label="聊天记录" tabindex="0"><p class="wc-time">$2</p><div class="wc-messages"></div></section>
 <div class="wc-message-source" hidden>$3</div>
</main>
<style>
:root{--chat:#111;--bar:#191919;--edge:#262626;--ink:#e5e5e5;--muted:#777;--incoming:#2c2c2c;--outgoing:#d4d4d4;--sent-ink:#151515;--avatar:#343434;color-scheme:dark}
:root[data-mode=day]{--chat:#ededed;--bar:#ededed;--edge:#d9d9d9;--ink:#171717;--muted:#999;--incoming:#fff;--outgoing:#d0d0d0;--sent-ink:#171717;--avatar:#ddd;color-scheme:light}
*{box-sizing:border-box;scrollbar-width:none}*::-webkit-scrollbar{display:none}
html,body{margin:0;padding:0;min-width:0;background:transparent}
.wc-conversation{max-width:420px;margin:12px auto;background:var(--chat);color:var(--ink);font:16px/1.5 Huiwen;overflow-wrap:anywhere;border:1px solid var(--edge)}
.wc-header{position:relative;display:flex;align-items:center;justify-content:center;min-height:56px;padding:12px 82px;border-bottom:1px solid var(--edge);background:var(--bar)}
.wc-title{font-size:17px;line-height:1.5;text-align:center;font-weight:500}
.sta-theme{position:absolute;right:12px;top:10px;min-height:36px;padding:6px 9px;border:0;background:transparent;color:var(--muted);font:12px Huiwen;cursor:pointer}
.sta-theme:focus-visible,.wc-chat:focus-visible{outline:2px solid var(--ink);outline-offset:-3px}
.wc-chat{padding:20px 16px 28px;min-height:460px;max-height:620px;overflow-y:auto}
.wc-time{text-align:center;color:var(--muted);font:12px/1.5 Arial,sans-serif;margin:0 0 24px}
.wc-messages{display:flex;flex-direction:column;gap:22px}
.wc-msg-row{display:flex;align-items:flex-start;gap:11px;min-width:0}
.wc-msg-row.wc-outgoing{flex-direction:row-reverse}
.wc-avatar{flex:0 0 40px;width:40px;height:40px;border-radius:5px;background:var(--avatar);color:var(--muted);display:flex;align-items:center;justify-content:center;font-size:14px;background-position:center;background-size:cover}
.wc-bubble{position:relative;max-width:calc(100% - 100px);min-width:34px;min-height:40px;padding:9px 12px;border-radius:4px;background:var(--incoming);color:var(--ink);white-space:pre-wrap;line-height:1.5;font-size:16px}
.wc-bubble:before{content:'';position:absolute;left:-5px;top:15px;width:10px;height:10px;background:inherit;transform:rotate(45deg)}
.wc-outgoing .wc-bubble{background:var(--outgoing);color:var(--sent-ink)}
.wc-outgoing .wc-bubble:before{left:auto;right:-5px}
@media(max-width:360px){.wc-chat{padding-left:12px;padding-right:12px}.wc-bubble{max-width:calc(100% - 74px)}.wc-header{padding-left:70px;padding-right:70px}}
</style><script>(${renderWechatMessages.toString()})(${wechatConversationRows.toString()});</script></body></html>`;}

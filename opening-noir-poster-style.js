// Shared by the workbench, gallery preview and exported opening document.
export const noirPosterStyle = `
.zoh-root[data-theme="noir-poster"]{--paper:#151414;--card:#1c1a1a;--line:#ffffff21;position:relative;isolation:isolate;padding:0 34px 24px;background:var(--paper);border:1px solid #ffffff16}
.zoh-root[data-theme="noir-poster"] .masthead{position:relative;margin:0 -34px;padding:23px 34px 28px;isolation:isolate;border:0;border-bottom:1px solid var(--accent);background:radial-gradient(ellipse at 95% 0,color-mix(in srgb,var(--accent) 13%,transparent),transparent 66%)}
.noir-running-head{display:flex;justify-content:space-between;gap:15px;padding-bottom:20px;margin-bottom:25px;border-bottom:1px solid #ffffff24;color:#b3a49e;font:10px/1.5 ui-monospace,monospace;letter-spacing:.12em}
.noir-running-head span:last-child{white-space:nowrap;color:var(--accent)}
.zoh-root[data-theme="noir-poster"] .subtitle{font:10px/1.6 ui-monospace,monospace;letter-spacing:.2em;color:var(--accent)}
.zoh-root[data-theme="noir-poster"] .masthead h1{max-width:11em;margin:17px 0 24px;font-size:clamp(40px,8vw,68px);line-height:1.13;font-weight:800;letter-spacing:-.055em;text-wrap:balance;animation:noir-title-in .65s cubic-bezier(.2,.7,.2,1) both}
.zoh-root[data-theme="noir-poster"] .byline{font-size:11px;color:#b8aaa3;letter-spacing:.05em}
.zoh-root[data-theme="noir-poster"] .byline span{margin-right:18px;color:#827571}
.zoh-root[data-theme="noir-poster"] .intro{position:relative;border:0;margin:0;padding:26px 0 22px;animation:noir-copy-in .6s .12s both}
.zoh-root[data-theme="noir-poster"] .intro h2{margin:0 0 13px;font:11px/1.6 ui-monospace,monospace;letter-spacing:.18em;color:var(--accent)}
.zoh-root[data-theme="noir-poster"] .intro p{font-size:15px;line-height:1.95;color:#e2d7cd;max-width:42em}
.zoh-root[data-theme="noir-poster"] .worldline{margin-top:18px;padding-top:14px;border-top:1px solid var(--line)}
.zoh-root[data-theme="noir-poster"] .meta{margin:0 0 29px;padding:16px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);gap:22px}
.zoh-root[data-theme="noir-poster"] .meta h2{font-size:10px;color:#9d8e87;letter-spacing:.08em}
.zoh-root[data-theme="noir-poster"] .values span{font-size:12px;color:#c3b8b1}
.zoh-root[data-theme="noir-poster"] .directory-heading{align-items:center;margin:0;padding:0 0 17px}
.zoh-root[data-theme="noir-poster"] .directory-heading h2{font-size:17px;font-weight:500;letter-spacing:.04em}
.zoh-root[data-theme="noir-poster"] .directory-heading>span{font:10px/1.5 ui-monospace,monospace;letter-spacing:.08em;color:#9d8e87}
.zoh-root[data-theme="noir-poster"] .zoh-list{gap:12px}
.zoh-root[data-theme="noir-poster"] .zoh-entry{position:relative;grid-template-columns:46px minmax(0,1fr) 53px;gap:15px;padding:23px 18px;border:1px solid #ffffff24;background:linear-gradient(115deg,#ffffff03,transparent),var(--card);animation:noir-copy-in .5s calc(.18s + var(--scene-order,0)*.07s) both;transition:border-color .2s,background-color .2s}
.zoh-root[data-theme="noir-poster"] .zoh-entry:hover,.zoh-root[data-theme="noir-poster"] .zoh-entry:focus-within{border-color:color-mix(in srgb,var(--accent) 64%,transparent);background-color:#242020}
.zoh-root[data-theme="noir-poster"] .number{font:400 38px/1.15 'Arial Narrow',Impact,sans-serif;letter-spacing:-.06em;color:var(--accent);padding-top:0}
.zoh-root[data-theme="noir-poster"] .entry-copy h3{font-size:20px;font-weight:600;line-height:1.45;letter-spacing:.025em;margin:0 0 5px}
.zoh-root[data-theme="noir-poster"] .route{font:10px/1.5 sans-serif;color:#bba79b;letter-spacing:.1em;margin-top:0}
.zoh-root[data-theme="noir-poster"] .entry-copy p{color:#c7bdb9}
.zoh-root[data-theme="noir-poster"] .entry-copy p{font-size:13px;line-height:1.9;margin-top:13px;white-space:pre-wrap}
.zoh-root[data-theme="noir-poster"] .zoh-jump{align-self:stretch;border:0;border-left:1px dashed #ffffff27;min-width:44px;min-height:60px;gap:9px;padding:10px 0 10px 9px;color:#ddd1c9;font-size:11px}
.zoh-root[data-theme="noir-poster"] .zoh-jump b{font-size:25px;font-weight:400;transition:transform .18s}
.zoh-root[data-theme="noir-poster"] .zoh-jump:hover{background:transparent;color:var(--accent)}
.zoh-root[data-theme="noir-poster"] .zoh-jump:hover b{transform:translate(2px,-2px)}
.zoh-root[data-theme="noir-poster"] .colophon{margin-top:25px;padding-top:17px;border-top:1px solid #ffffff24;font:10px/1.6 ui-monospace,monospace;letter-spacing:.06em;color:#9d8e87}
.zoh-root[data-theme="noir-poster"] .portrait{margin:22px 0 0;border:1px solid #ffffff24}
@keyframes noir-title-in{from{opacity:0;transform:translateY(12px);clip-path:inset(0 0 100% 0)}to{opacity:1;transform:none;clip-path:inset(0)}}
@keyframes noir-copy-in{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}
@media(max-width:560px){
 .zoh-root[data-theme="noir-poster"]{padding:0 21px 21px}
 .zoh-root[data-theme="noir-poster"] .masthead{margin:0 -21px;padding:19px 21px 24px}
 .noir-running-head{font-size:9px;margin-bottom:22px;padding-bottom:16px}
 .zoh-root[data-theme="noir-poster"] .masthead h1{font-size:clamp(34px,11.5vw,52px);margin:15px 0 22px}
 .zoh-root[data-theme="noir-poster"] .intro{padding:23px 0 21px}
 .zoh-root[data-theme="noir-poster"] .intro p{font-size:14px}
 .zoh-root[data-theme="noir-poster"] .meta{gap:16px;margin-bottom:26px}
 .zoh-root[data-theme="noir-poster"] .zoh-entry{grid-template-columns:31px minmax(0,1fr) 44px;gap:11px;padding:18px 12px}
 .zoh-root[data-theme="noir-poster"] .number{font-size:29px}
 .zoh-root[data-theme="noir-poster"] .entry-copy h3{font-size:17px}
 .zoh-root[data-theme="noir-poster"] .entry-copy p{font-size:13px;margin-top:10px}
 .zoh-root[data-theme="noir-poster"] .zoh-jump{padding-left:6px}
}
@media(prefers-reduced-motion:reduce){.zoh-root[data-theme="noir-poster"] *{animation:none!important;transition:none!important}}
`;

// A magazine front page, shared by preview and exported greetings.
export const EDITORIAL_HOME_STYLE = String.raw`
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap");
*{box-sizing:border-box;scrollbar-width:none}*::-webkit-scrollbar{display:none}html,body{margin:0;padding:0;background:transparent}
.zoh-root[data-theme="editorial"]{max-width:760px;margin:auto;color:var(--zoh-text);font:15px/1.8 "Microsoft YaHei","PingFang SC",sans-serif;overflow-wrap:anywhere}
.zoh-page{padding:28px 32px 25px;background:var(--zoh-bg);border-top:7px solid var(--zoh-accent);border-bottom:2px solid var(--zoh-text)}
.zoh-header{padding:0 0 24px;border-bottom:2px solid var(--zoh-text)}
.zoh-header:before{content:"STORY  /  作品特刊";display:block;padding-bottom:19px;font:11px/1.5 ui-monospace,monospace;letter-spacing:.15em;color:var(--zoh-accent)}
.zoh-title{margin:0;font-size:clamp(36px,8vw,65px);line-height:1.2;letter-spacing:-.045em;font-weight:800;text-wrap:balance}
.zoh-subtitle{margin-top:15px;font-size:12px;letter-spacing:.12em;color:var(--zoh-accent)}
.zoh-meta{display:grid;grid-template-columns:.7fr 1fr 1fr;gap:20px;padding:18px 0;margin:0;border-bottom:1px solid #b9aea0}
.zoh-meta>div{min-width:0}.zoh-meta span{display:block;font-size:10px;color:var(--zoh-secondary);letter-spacing:.08em}.zoh-meta strong{display:block;font-size:13px;line-height:1.8;font-weight:500;margin-top:4px}
.zoh-intro{display:grid;grid-template-columns:1fr 2fr;gap:25px;margin:0;padding:29px 0 30px;border-bottom:1px solid #b9aea0}
.zoh-intro h2,.zoh-worldlines h2{margin:0;font-size:16px;font-weight:700;letter-spacing:.06em;color:var(--zoh-accent)}.zoh-intro p{margin:0 0 8px;white-space:pre-wrap;font-family:"Noto Serif SC",SimSun,serif;font-size:16px;line-height:1.95}
.zoh-directory{margin-top:27px}.zoh-directory-head,.zoh-worldlines-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding-bottom:14px;border-bottom:3px solid var(--zoh-text)}
.zoh-directory-head h2{margin:0;font-size:23px;letter-spacing:-.025em;font-weight:700}.zoh-count,.zoh-worldlines-head>span{font-size:11px;color:var(--zoh-accent);white-space:nowrap}
.zoh-list{display:grid;gap:0}.zoh-entry{display:grid;grid-template-columns:54px minmax(0,1fr) 76px;gap:12px;align-items:start;padding:24px 0;border-bottom:1px solid #b9aea0;background:transparent}
.zoh-number{white-space:nowrap;font-variant-numeric:tabular-nums;font:400 45px/1 Georgia,serif;color:var(--zoh-accent)}.zoh-entry-copy{min-width:0}.zoh-entry-copy>div{display:flex;align-items:baseline;flex-wrap:wrap;gap:7px 12px}.zoh-entry-title{margin:0;font-size:19px;line-height:1.5;font-weight:700;letter-spacing:-.015em}
.zoh-route{font-size:10px;color:var(--zoh-accent);letter-spacing:.06em}.zoh-summary{margin:9px 0 0;font-size:14px;line-height:1.85;color:var(--zoh-secondary);white-space:pre-wrap}
.zoh-jump{align-self:end;min-height:44px;min-width:76px;padding:7px 12px;border:1px solid var(--zoh-text);background:transparent;color:var(--zoh-text);font-family:inherit;font-size:12px;font-weight:600;line-height:1.5;cursor:pointer}
.zoh-jump:after{content:" ↗"}.zoh-jump:hover{background:var(--zoh-text);color:var(--zoh-bg)}.zoh-jump:focus-visible{outline:2px solid var(--zoh-accent);outline-offset:4px}.zoh-jump:disabled{opacity:.5;cursor:wait}
.zoh-worldlines{margin:24px 0}.zoh-worldline{padding:16px 0;border-bottom:1px solid #b9aea0}.zoh-worldline h3{margin:0 0 7px;font-size:16px}.zoh-worldline p{margin:0;white-space:pre-wrap;font-size:14px;line-height:1.9}
.zoh-notice{margin-top:15px;font-size:12px}.zoh-notice:empty{display:none}.zoh-current{font-size:10px;color:var(--zoh-accent)}.zoh-switch-toast{position:fixed;bottom:15px;left:15px;right:15px;max-width:600px;margin:auto;padding:12px 16px;background:var(--zoh-text);color:var(--zoh-bg);opacity:0;pointer-events:none}.zoh-switch-toast.is-visible{opacity:1}
@media(max-width:560px){.zoh-page{padding:23px 22px 22px}.zoh-title{font-size:42px}.zoh-meta{grid-template-columns:1fr 1.3fr;gap:13px 18px}.zoh-meta>div:last-child{grid-column:1/-1}.zoh-intro{display:block;padding:24px 0}.zoh-intro h2{margin-bottom:13px}.zoh-intro p{font-size:15px}.zoh-entry{grid-template-columns:43px minmax(0,1fr);gap:10px 12px;padding:22px 0}.zoh-number{font-size:38px}.zoh-entry-title{font-size:18px}.zoh-jump{grid-column:2;justify-self:end}.zoh-directory-head h2{font-size:22px}}
`;

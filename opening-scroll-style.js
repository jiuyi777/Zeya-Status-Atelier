const paperUrl = new URL('./assets/opening-scroll/ink-paper-v2.webp', import.meta.url).href;
const frameUrl = new URL('./assets/opening-scroll/peach-frame-v4.webp', import.meta.url).href;

// Nine-slice frame: four botanical corners keep their proportions; only bare edge segments extend.
export const SCROLL_HOME_STYLE = String.raw`
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap");
html,body{margin:0;padding:0;background:transparent}*{box-sizing:border-box;scrollbar-width:none}*::-webkit-scrollbar{display:none}
.zoh-root[data-theme="scroll"]{position:relative;width:min(100%,720px);display:flow-root;isolation:isolate;margin:0 auto;color:var(--zoh-text);font:16px/1.85 "Noto Serif SC","Source Han Serif SC","Songti SC","SimSun",serif;overflow-wrap:anywhere}
.zoh-root[data-theme="scroll"][data-font="kai"]{font-family:"KaiTi","STKaiti",serif}
.zoh-root[data-font="sans"]{font-family:"Microsoft YaHei",sans-serif}.zoh-root[data-font="serif"]{font-family:"Noto Serif SC","SimSun",serif}.zoh-root[data-font="mono"]{font-family:monospace}.zoh-root[data-font="fangsong"]{font-family:"FangSong",serif}.zoh-root[data-font="clerical"]{font-family:"LiSu",serif}.zoh-root[data-font="rounded"]{font-family:"YouYuan",sans-serif}
.zoh-page{position:relative;isolation:isolate;margin:8px 0;padding:112px 82px 94px}
.zoh-page:before{content:"";position:absolute;inset:0;border:180px solid transparent;border-image:url("${frameUrl}") 360 / 180px / 0 stretch;filter:saturate(.65);pointer-events:none;z-index:-1}
.zoh-page:after{content:"";position:absolute;inset:47px 42px;background:linear-gradient(to bottom,color-mix(in srgb,var(--zoh-bg) 45%,transparent),color-mix(in srgb,var(--zoh-bg) 82%,transparent) 140px,var(--zoh-bg) 260px),url("${paperUrl}") top center/100% auto no-repeat,var(--zoh-bg);border-radius:32px;pointer-events:none;z-index:-2}
.zoh-header{position:relative;text-align:center;padding:10px 0 32px}
.zoh-header:before{content:"花 间 一 笺";display:block;margin-bottom:13px;color:var(--zoh-secondary);font-size:11px;letter-spacing:.3em}
.zoh-title{margin:0;font-weight:700;font-size:clamp(30px,7vw,44px);letter-spacing:.12em;line-height:1.5;text-wrap:balance}
.zoh-subtitle{margin-top:10px;font-size:12px;letter-spacing:.12em;color:var(--zoh-accent);line-height:1.8}
.zoh-meta{display:grid;grid-template-columns:.7fr 1fr 1fr;gap:16px;padding:15px 0 19px;margin:0;border-top:0;border-bottom:2px solid #cec3ae}
.zoh-meta>div{min-width:0}.zoh-meta span{display:block;color:var(--zoh-secondary);font-size:11px;letter-spacing:.1em}.zoh-meta strong{display:block;margin-top:2px;font-size:14px;line-height:1.7;font-weight:600}
.zoh-intro{padding:25px 0 24px;border:0;background:transparent}.zoh-intro h2,.zoh-directory h2,.zoh-worldlines h2{margin:0;font-size:18px;letter-spacing:.13em;color:var(--zoh-accent);font-weight:600}
.zoh-intro h2{display:flex;align-items:center;gap:12px}.zoh-intro h2:after{content:"";width:30px;height:3px;background:var(--zoh-accent);opacity:.55}
.zoh-intro-markdown{padding-top:8px}.zoh-intro p{margin:6px 0;line-height:2;white-space:pre-wrap;font-size:16px}
.zoh-directory{margin-top:3px}.zoh-directory-head,.zoh-worldlines-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 0;border-top:0;border-bottom:3px double #cec3ae}.zoh-count,.zoh-worldlines-head>span{font-size:12px;color:var(--zoh-secondary);white-space:nowrap}
.zoh-list{display:grid;gap:0}.zoh-entry{position:relative;display:grid;grid-template-columns:25px minmax(0,1fr) auto;align-items:start;gap:9px 12px;padding:22px 0;border-bottom:2px solid #d7cebb}
.zoh-entry:last-child{border-bottom:0;padding-bottom:2px}.zoh-entry:not(:last-child):after{content:"";position:absolute;bottom:-4px;left:calc(50% - 4px);width:7px;height:7px;background:var(--zoh-bg);border:2px solid #b5a48a;transform:rotate(45deg)}
.zoh-number{grid-column:1;grid-row:1;color:#9b806c;font:20px/1.5 Georgia,serif;text-align:center;padding:2px 0;border:0}.zoh-number:before{content:"卷";display:block;font:600 11px/1.6 "Noto Serif SC",serif}
.zoh-entry-copy{grid-column:2/-1;grid-row:1;min-width:0}.zoh-entry-copy>div{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 10px}.zoh-entry-title{margin:0;font-size:21px;letter-spacing:.06em;font-weight:600;line-height:1.6}
.zoh-route{color:var(--zoh-accent);font-size:11px;letter-spacing:.08em}.zoh-route:before{content:"〔"}.zoh-route:after{content:"〕"}.zoh-summary{font-size:15px;line-height:1.95;margin:8px 0 0;color:var(--zoh-secondary)}
.zoh-jump{grid-column:3;grid-row:2;justify-self:end;min-width:82px;min-height:44px;margin-top:2px;padding:7px 13px;color:var(--zoh-accent);background:transparent;border:2px solid color-mix(in srgb,var(--zoh-accent) 62%,transparent);border-radius:12px 3px 12px 3px;font:inherit;font-size:16px;line-height:1.5;letter-spacing:.1em;cursor:pointer;transition:background .2s}
.zoh-jump:after{content:" →";font-family:serif}.zoh-jump:hover{background:color-mix(in srgb,var(--zoh-accent) 7%,var(--zoh-bg))}.zoh-jump:focus-visible{outline:2px solid var(--zoh-accent);outline-offset:3px}.zoh-jump:disabled{opacity:.55;cursor:wait}
.zoh-worldlines{margin:0 0 22px}.zoh-worldline-list{display:grid;gap:14px;padding-top:15px}.zoh-worldline h3{margin:0;font-size:17px;font-weight:600}.zoh-worldline p{margin:5px 0;font-size:15px;white-space:pre-wrap;line-height:1.9}
.zoh-notice{margin:15px 0 0;text-align:center;font-size:12px;color:var(--zoh-secondary)}.zoh-notice:empty{display:none}.zoh-current{position:absolute;top:2px;right:0;font-size:11px;color:var(--zoh-accent)}
.zoh-switch-toast{position:fixed;z-index:20;bottom:14px;left:14px;right:14px;max-width:620px;margin:auto;padding:12px 18px;color:var(--zoh-bg);background:var(--zoh-text);opacity:0;pointer-events:none;transition:opacity .2s}.zoh-switch-toast.is-visible{opacity:1}.zoh-switch-toast.is-error{background:#6f2722}
@media(max-width:460px){.zoh-page{margin:4px 0;padding:96px 49px 76px}.zoh-page:before{border-width:140px;border-image-width:140px}.zoh-page:after{inset:37px 33px;border-radius:24px}.zoh-header{padding:12px 0 22px}.zoh-title{font-size:32px;letter-spacing:.08em}.zoh-meta{grid-template-columns:1fr;gap:7px;padding:13px 0 16px}.zoh-meta>div{display:grid;grid-template-columns:64px minmax(0,1fr);gap:8px;align-items:baseline}.zoh-meta strong{margin:0}.zoh-intro{padding:22px 0}.zoh-intro p{font-size:15px}.zoh-directory h2{font-size:17px}.zoh-entry{gap:8px 9px;padding:19px 0}.zoh-entry-title{font-size:20px}.zoh-summary{font-size:15px}.zoh-count{font-size:11px}}
@media(prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important}}
`;

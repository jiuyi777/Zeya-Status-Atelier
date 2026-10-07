const collageCoverUrl = new URL('./assets/opening-collage/travel-cover-v3-cinema.webp', import.meta.url).href;

const collageTapeUrl = new URL('./assets/opening-collage/washi-honey-v1.webp', import.meta.url).href;

// Paper surfaces grow with the user's text; only the cover artwork has a fixed ratio.
export const collageStyle = `
.zoh-root[data-theme="collage"]{--muted:#68746a;--line:#c6bea0;--folder:#e5dfce;--folder-edge:#bfb49c;--folder-inset:#f1ecdf;position:relative;padding:20px 30px 28px;background:repeating-linear-gradient(0deg,#88654d08 0 1px,transparent 1px 4px),var(--paper);border:1px solid #c8c5ab;box-shadow:inset 0 0 28px #88654d08}
.zoh-root[data-theme="collage"] .edition-mark{margin:0 0 16px;padding:0 3px;font-size:10px;letter-spacing:.14em;color:#48796c}
.zoh-root[data-theme="collage"] .edition-mark b{color:#b16d3d;border-bottom:2px solid #b16d3d;padding-bottom:2px}
.zoh-root[data-theme="collage"] .collage-cover{aspect-ratio:3/2;margin:0 -14px;background:url("${collageCoverUrl}") center/cover no-repeat;box-shadow:0 5px 12px #49311d26;transform:rotate(-1.4deg);border:7px solid #f7f0e1}
.zoh-root[data-theme="collage"] .masthead{isolation:isolate;width:90%;margin:-64px 0 26px auto;padding:21px 28px 20px;background:var(--card);border:1px solid #c8b88e;box-shadow:3px 5px 0 #d8c397,4px 6px 0 #b8a277;transform:rotate(1.2deg)}
.zoh-root[data-theme="collage"] .masthead:before{content:"";position:absolute;top:-12px;left:25%;width:112px;height:33px;background:url("${collageTapeUrl}") center/contain no-repeat;opacity:.9;transform:rotate(-5deg);pointer-events:none}
.zoh-root[data-theme="collage"] .masthead:after{content:"";position:absolute;inset:6px;border:1px solid #d4c89f;z-index:-1;pointer-events:none}
.zoh-root[data-theme="collage"] .masthead h1{font:700 clamp(32px,6vw,44px)/1.4 "Noto Serif SC",SimSun,serif;letter-spacing:.08em;margin:9px 0 10px;color:var(--ink)}
.zoh-root[data-theme="collage"] .subtitle{font-size:10px;letter-spacing:.2em;color:var(--accent)}
.zoh-root[data-theme="collage"] .byline{font-size:12px;color:#74775e}
.zoh-root[data-theme="collage"] .portrait{margin:22px 0;transform:rotate(-1deg);padding:7px 7px 23px;background:#fffaf0;box-shadow:2px 4px 10px #4f341d18}
.zoh-root[data-theme="collage"] .journal-leaf{position:relative;margin:32px 7px 38px 0;padding:30px 27px 18px;background:var(--card);border:1px solid #d2c8a6;box-shadow:5px 5px 0 #dfcfaa,6px 6px 0 #b5ac8b;transform:rotate(-.6deg)}
.zoh-root[data-theme="collage"] .journal-leaf:before{content:"";position:absolute;top:-12px;right:22px;width:106px;height:32px;background:url("${collageTapeUrl}") center/contain no-repeat;opacity:.84;transform:rotate(5deg);pointer-events:none}
.zoh-root[data-theme="collage"] .journal-leaf:after{content:"";position:absolute;inset:9px auto 9px 8px;width:5px;background:radial-gradient(ellipse,#b49b8650 0 2px,transparent 2.5px) 0 0/5px 22px;pointer-events:none}
.zoh-root[data-theme="collage"] .intro{margin:0;padding:0 0 18px;border:0;background:transparent}
.zoh-root[data-theme="collage"] .intro h2{display:flex;align-items:center;gap:12px;font-size:13px;font-weight:600;line-height:1.6;letter-spacing:.12em;color:#287c76;margin-bottom:13px}
.zoh-root[data-theme="collage"] .intro h2:after{content:"";height:3px;flex:1;border-block:1px solid #a7b7a0}
.zoh-root[data-theme="collage"] .intro p{font-size:15px;line-height:2.05;background:repeating-linear-gradient(transparent 0 calc(2.05em - 1px),#bea28c28 calc(2.05em - 1px) 2.05em)}
.zoh-root[data-theme="collage"] .worldline{padding-top:14px;margin-top:14px;border-top:1px dashed #d2c8a6}
.zoh-root[data-theme="collage"] .meta{padding:14px 0 0;margin:0;gap:18px;border-top:1px dashed #bfc3a6}
.zoh-root[data-theme="collage"] .meta h2{font-size:10px;color:#6d7e6b}.zoh-root[data-theme="collage"] .values span{font-size:12px;color:#546457}
.zoh-root[data-theme="collage"] .directory{position:relative;padding:23px 16px 19px;background:var(--folder);border:1px solid var(--folder-edge);box-shadow:inset 0 0 0 5px var(--folder-inset)}
.zoh-root[data-theme="collage"] .directory:before{content:"";position:absolute;left:17px;top:-12px;width:110px;height:16px;background:var(--folder);border:1px solid var(--folder-edge);border-bottom:0;border-radius:9px 9px 0 0}
.zoh-root[data-theme="collage"] .directory-heading{position:relative;gap:8px;margin:0 0 23px;padding:0 3px}
.zoh-root[data-theme="collage"] .directory-heading h2{font:600 19px/1.5 "Noto Serif SC",serif;letter-spacing:.02em;color:#446960}.zoh-root[data-theme="collage"] .directory-heading>span{font-size:11px;white-space:nowrap;color:#74776a}
.zoh-root[data-theme="collage"] .zoh-list{gap:19px}
.zoh-root[data-theme="collage"] .zoh-entry{position:relative;grid-template-columns:31px minmax(0,1fr) 49px;gap:10px;padding:21px 13px;background:var(--card);border:1px solid #bca87e;box-shadow:1px 3px 5px #623a2420;transform:rotate(-1.2deg)}
.zoh-root[data-theme="collage"] .zoh-entry:nth-child(even){transform:rotate(.8deg);background:var(--card)}
.zoh-root[data-theme="collage"] .zoh-entry:before,.zoh-root[data-theme="collage"] .zoh-entry:after{content:"";position:absolute;right:63px;width:12px;height:6px;background:var(--folder);border:1px solid #bca87e;pointer-events:none}
.zoh-root[data-theme="collage"] .zoh-entry:before{top:-1px;border-top:0;border-radius:0 0 8px 8px}.zoh-root[data-theme="collage"] .zoh-entry:after{bottom:-1px;border-bottom:0;border-radius:8px 8px 0 0}
.zoh-root[data-theme="collage"] .number{white-space:nowrap;font:italic 26px/1.25 Georgia,serif;color:var(--accent);padding-top:0}
.zoh-root[data-theme="collage"] .entry-copy h3{font-size:17px;line-height:1.6;letter-spacing:.04em;font-weight:600}.zoh-root[data-theme="collage"] .entry-copy p{font-size:13px;line-height:1.85;margin-top:8px;color:#6c7160}.zoh-root[data-theme="collage"] .route{font-size:10px;margin-top:5px;letter-spacing:.13em;color:#a36936}
.zoh-root[data-theme="collage"] .zoh-jump{align-self:stretch;justify-self:stretch;width:49px;min-height:64px;gap:10px;padding:4px 0 4px 10px;border:0;border-left:1px dashed #c4b17f;color:#227970;font-size:12px}.zoh-root[data-theme="collage"] .zoh-jump b{font-size:25px;color:inherit}.zoh-root[data-theme="collage"] .zoh-jump:hover{background:#98b5a329}
.zoh-root[data-theme="collage"] .colophon{margin-top:25px;border-top:1px dashed #b5ac8b;padding-top:13px;color:#667e6e;letter-spacing:.1em}
@media(max-width:560px){
 .zoh-root[data-theme="collage"]{padding:16px 18px 22px}
 .zoh-root[data-theme="collage"] .collage-cover{margin-inline:-7px;border-width:5px}
 .zoh-root[data-theme="collage"] .masthead{width:93%;margin-top:-35px;padding:22px 20px 20px}
 .zoh-root[data-theme="collage"] .masthead h1{font-size:32px}
 .zoh-root[data-theme="collage"] .journal-leaf{padding:25px 21px 18px;margin-top:29px}
 .zoh-root[data-theme="collage"] .directory{padding:22px 11px 18px}
 .zoh-root[data-theme="collage"] .directory-heading h2{font-size:17px}
 .zoh-root[data-theme="collage"] .zoh-entry{grid-template-columns:26px minmax(0,1fr) 43px;gap:8px;padding:18px 10px}
 .zoh-root[data-theme="collage"] .zoh-jump{width:43px;padding-left:8px}
 .zoh-root[data-theme="collage"] .zoh-entry:before,.zoh-root[data-theme="collage"] .zoh-entry:after{right:47px}
 .zoh-root[data-theme="collage"] .entry-copy h3{font-size:16px}
}
`;

// The editor and exported homepage use these same styles.
export const refinedRevisionStyle = `
.zoh-root:is([data-theme="collage"],[data-theme="kinetic"],[data-theme="dossier"]){padding:32px;--line:color-mix(in srgb,var(--ink) 19%,transparent)}
.edition-mark{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:26px;font:10px/1.5 ui-monospace,monospace;letter-spacing:.13em;color:var(--muted)}
.edition-mark b{font-weight:400;white-space:nowrap}
.zoh-root:is([data-theme="collage"],[data-theme="kinetic"],[data-theme="dossier"]) .meta{gap:20px;margin:22px 0}
.zoh-root:is([data-theme="collage"],[data-theme="kinetic"],[data-theme="dossier"]) .meta h2{font-size:10px;letter-spacing:.1em}
.zoh-root:is([data-theme="collage"],[data-theme="kinetic"],[data-theme="dossier"]) .meta .values{gap:2px 10px}
.zoh-root:is([data-theme="collage"],[data-theme="kinetic"],[data-theme="dossier"]) .values span{font-size:12px;line-height:1.8}
.zoh-root:is([data-theme="collage"],[data-theme="kinetic"],[data-theme="dossier"]) .intro p{font-size:14px;line-height:1.95}
.zoh-root:is([data-theme="collage"],[data-theme="kinetic"],[data-theme="dossier"]) .entry-copy p{font-size:13px;line-height:1.85;white-space:pre-wrap}
.zoh-root:is([data-theme="collage"],[data-theme="kinetic"],[data-theme="dossier"]) .zoh-jump{border:0;font-size:11px}

/* A notebook made of separate sheets, with small ink stamps and stitched labels. */
.zoh-root[data-theme="collage"]{--paper:#ede7dc;--card:#fffcf5;--muted:#797064;--ink:#403b33;--accent:#aa5946;background:radial-gradient(#92826a1a .7px,transparent .7px) 0 0/5px 5px,var(--paper);padding:32px 26px}
.zoh-root[data-theme="collage"] .edition-mark{margin-bottom:24px;letter-spacing:.1em;color:#8c7b65}
.zoh-root[data-theme="collage"] .edition-mark b{border:1px solid #aa59467a;padding:3px 8px;color:var(--accent);transform:rotate(-5deg)}
.zoh-root[data-theme="collage"] .masthead{padding:6px 7px 21px;border:0}
.zoh-root[data-theme="collage"] .masthead h1{font-size:34px;letter-spacing:.055em;line-height:1.5;margin:9px 0 12px}
.zoh-root[data-theme="collage"] .subtitle{letter-spacing:.13em;font-size:11px}
.zoh-root[data-theme="collage"] .byline{font-size:12px}
.zoh-root[data-theme="collage"] .meta{padding:15px 7px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin:0 0 27px}
.zoh-root[data-theme="collage"] .intro{position:relative;background:var(--card);border:1px solid #d9cdbb;padding:25px 22px 22px;margin:0 0 32px;box-shadow:3px 4px 0 #d5cbb980;isolation:isolate}
.zoh-root[data-theme="collage"] .intro:before{content:'';position:absolute;width:60px;height:17px;background:#bbc4ae99;top:-9px;left:calc(50% - 30px);transform:rotate(-3deg);border:1px solid #a9b2a026}
.zoh-root[data-theme="collage"] .intro h2{color:#9a715b;margin-bottom:10px}
.zoh-root[data-theme="collage"] .directory-heading{padding:0 4px;margin-bottom:17px}
.zoh-root[data-theme="collage"] .directory-heading h2{font-size:18px}
.zoh-root[data-theme="collage"] .zoh-list{gap:17px}
.zoh-root[data-theme="collage"] .zoh-entry{position:relative;grid-template-columns:29px minmax(0,1fr);gap:10px;background:var(--card);padding:20px 18px 13px;border:1px solid #d3c7b5;box-shadow:2px 3px 0 #d5cbb955}
.zoh-root[data-theme="collage"] .number{font-size:16px;font-style:normal;width:27px;height:27px;text-align:center;line-height:24px;border:1px solid #af78675c;transform:rotate(-6deg)}
.zoh-root[data-theme="collage"] .entry-copy h3{font-size:17px;font-weight:400}
.zoh-root[data-theme="collage"] .entry-copy p{color:#776a5e;margin-top:10px}
.zoh-root[data-theme="collage"] .zoh-jump{grid-column:2;justify-self:end;flex-direction:row;gap:10px;min-width:68px;color:#a3654d;padding:3px 0;min-height:40px}
.zoh-root[data-theme="collage"] .zoh-jump b{font-size:18px}
.zoh-root[data-theme="collage"] .route{font-size:10px;color:#8a8174;margin-top:8px}

/* Blue-and-white editorial typography; entries read as one continuous index. */
.zoh-root[data-theme="kinetic"]{--paper:#f6f6f2;--card:#fff;--ink:#2f343d;--muted:#777c85;--line:#cdd2da;--accent:#314ab4;background:var(--paper)}
.zoh-root[data-theme="kinetic"] .edition-mark{color:var(--accent);border-bottom:1px solid #bcc6dc;padding-bottom:13px;margin-bottom:0}
.zoh-root[data-theme="kinetic"] .masthead{padding:29px 0 24px;border-bottom:0}
.zoh-root[data-theme="kinetic"] .masthead h1{max-width:9em;font:600 clamp(30px,6vw,49px)/1.35 "Microsoft YaHei","PingFang SC",sans-serif;letter-spacing:-.045em;margin:14px 0;color:var(--accent);text-wrap:balance;animation:edition-title .7s ease both}
.zoh-root[data-theme="kinetic"] .subtitle{color:#6e7a9a;letter-spacing:.16em;font-size:10px}
.zoh-root[data-theme="kinetic"] .byline{font-size:11px}
.zoh-root[data-theme="kinetic"] .meta{padding:16px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin:0 0 25px}
.zoh-root[data-theme="kinetic"] .intro{border:0;padding:0 0 26px;margin:0}
.zoh-root[data-theme="kinetic"] .intro h2{color:#6c7897;font-size:10px;letter-spacing:.13em}
.zoh-root[data-theme="kinetic"] .directory-heading{margin:10px 0 0;padding-bottom:12px;border-bottom:1px solid #8796bf}
.zoh-root[data-theme="kinetic"] .directory-heading h2{font:500 13px/1.5 sans-serif;letter-spacing:.13em;color:var(--accent)}
.zoh-root[data-theme="kinetic"] .zoh-list{gap:0}
.zoh-root[data-theme="kinetic"] .zoh-entry{grid-template-columns:36px minmax(0,1fr) 40px;gap:13px;border:0;border-bottom:1px solid var(--line);background:transparent;padding:23px 0}
.zoh-root[data-theme="kinetic"] .number{font:400 25px/1.1 Georgia,serif;color:#8090b8;padding-top:1px}
.zoh-root[data-theme="kinetic"] .entry-copy h3{font-size:16px;font-weight:500;color:var(--accent);letter-spacing:.015em}
.zoh-root[data-theme="kinetic"] .entry-copy p{margin-top:9px;color:#6d737f}
.zoh-root[data-theme="kinetic"] .zoh-jump{width:38px;min-width:38px;height:38px;min-height:38px;border:1px solid #a9b6d8;border-radius:50%;align-self:start;margin-top:2px}
.zoh-root[data-theme="kinetic"] .zoh-jump>span{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
.zoh-root[data-theme="kinetic"] .zoh-jump b{font-size:19px;font-weight:400}
.zoh-root[data-theme="kinetic"] .colophon{border:0;padding-top:2px}
@keyframes edition-title{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:none}}

/* Silver archival ledger: fine rules, document numbers and quiet paper-white text. */
.zoh-root[data-theme="dossier"]{--paper:#202426;--card:#272c2e;--ink:#e5e6df;--muted:#9ca5a4;--accent:#bac8c5;--line:#485153;background:linear-gradient(115deg,#ffffff03,transparent 55%),var(--paper);border:1px solid #485153}
.zoh-root[data-theme="dossier"] .edition-mark{font-size:9px;border-bottom:1px solid #707d7d;padding-bottom:15px;margin-bottom:22px;letter-spacing:.14em}
.zoh-root[data-theme="dossier"] .edition-mark b{color:#dde4dc}
.zoh-root[data-theme="dossier"] .masthead{border:0;padding:3px 0 23px}
.zoh-root[data-theme="dossier"] .masthead h1{font:400 34px/1.5 "Noto Serif SC","Songti SC",SimSun,serif;letter-spacing:.06em;margin:12px 0 14px}
.zoh-root[data-theme="dossier"] .subtitle{font-size:10px;letter-spacing:.18em;color:#9aadaa}
.zoh-root[data-theme="dossier"] .byline{font-size:11px;color:#b4bcba}
.zoh-root[data-theme="dossier"] .meta{border:1px solid #515b5c;padding:16px 18px;margin:0 0 24px;gap:22px}
.zoh-root[data-theme="dossier"] .values span{color:#c8cfca}
.zoh-root[data-theme="dossier"] .intro{border:0;padding:0 0 25px;margin:0}
.zoh-root[data-theme="dossier"] .intro h2{font-size:10px;color:#a8bbb7;letter-spacing:.16em;margin-bottom:12px}
.zoh-root[data-theme="dossier"] .intro p{color:#c1c8c4;font-weight:400}
.zoh-root[data-theme="dossier"] .worldline{border-top:1px solid #485153;padding-top:14px;margin-top:17px}
.zoh-root[data-theme="dossier"] .directory-heading{padding:10px 0 15px;margin:0;border-bottom:1px solid #707d7d}
.zoh-root[data-theme="dossier"] .directory-heading h2{font-size:12px;letter-spacing:.16em;color:#d7dfd9}
.zoh-root[data-theme="dossier"] .zoh-list{gap:0}
.zoh-root[data-theme="dossier"] .zoh-entry{border:0;border-bottom:1px solid var(--line);grid-template-columns:28px minmax(0,1fr);gap:12px;padding:22px 0 15px;background:transparent}
.zoh-root[data-theme="dossier"] .number{font:12px/1.6 ui-monospace,monospace;padding-top:3px;color:#91a5a0}
.zoh-root[data-theme="dossier"] .entry-copy h3{font-weight:400;font-size:16px;letter-spacing:.04em}
.zoh-root[data-theme="dossier"] .route{font-size:10px;color:#94a49e}
.zoh-root[data-theme="dossier"] .entry-copy p{color:#a5b0ab;margin-top:11px}
.zoh-root[data-theme="dossier"] .zoh-jump{grid-column:2;justify-self:end;flex-direction:row;gap:20px;font-size:11px;min-height:40px;color:#d5e0d9;padding:3px 0}
.zoh-root[data-theme="dossier"] .zoh-jump b{font-size:17px;font-weight:400}
.zoh-root[data-theme="dossier"] .colophon{border:0;font:9px/1.5 ui-monospace,monospace;letter-spacing:.12em;color:#8a9b97}
@media(max-width:560px){
 .zoh-root:is([data-theme="collage"],[data-theme="kinetic"],[data-theme="dossier"]){padding:24px 21px}
 .zoh-root[data-theme="collage"] .masthead h1{font-size:29px}
 .zoh-root[data-theme="collage"] .intro{padding:24px 18px 20px}
 .zoh-root[data-theme="collage"] .zoh-entry{padding:18px 15px 11px}
 .zoh-root[data-theme="kinetic"] .masthead h1{font-size:34px}
 .zoh-root[data-theme="kinetic"] .zoh-entry{grid-template-columns:29px minmax(0,1fr) 35px;gap:10px}
 .zoh-root[data-theme="kinetic"] .number{font-size:23px}
 .zoh-root[data-theme="kinetic"] .zoh-jump{width:33px;min-width:33px;height:33px;min-height:33px}
 .zoh-root[data-theme="dossier"] .masthead h1{font-size:29px}
 .zoh-root[data-theme="dossier"] .meta{padding:14px;gap:17px}
 .edition-mark{font-size:9px}
}
@media(prefers-reduced-motion:reduce){.zoh-root *{animation:none!important}}
`;

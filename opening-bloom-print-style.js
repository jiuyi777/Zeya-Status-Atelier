export function buildBloomPrintStyle(data, font, { pencil = false } = {}) {
  return `
${pencil ? '@import url("https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/lxgwwenkai-regular.css");' : ''}
*{box-sizing:border-box;scrollbar-width:none}*::-webkit-scrollbar{display:none}[hidden]{display:none!important}
:root{--paper:#f7f1e4;--ink:${data.ink};--accent:${data.accent};--sage:#7f9c80;--sand:#d1ac6b;--text:color-mix(in srgb,var(--ink) 24%,#4a4138);--warm-text:color-mix(in srgb,var(--accent) 42%,#665445);--font:${font};--ui:'Noto Sans SC','Microsoft YaHei',sans-serif;--grain:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.55 .82' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Cpath fill='%2398845e' opacity='.24' filter='url(%23paper)' d='M0 0h180v180H0z'/%3E%3C/svg%3E")}
body{margin:0;background:transparent;color:var(--text);font:16px/1.85 var(--font)}
button{cursor:pointer;color:inherit;font:inherit}button:focus-visible{outline:2px solid var(--ink);outline-offset:5px}button:disabled{cursor:default}
.bloom-page{position:relative;isolation:isolate;width:calc(100% - 40px);max-width:620px;margin:18px auto;padding:30px 36px 28px;border:1px solid #ac977144;border-radius:3px 7px 4px 6px;background:linear-gradient(110deg,#fffdf555,transparent 40%,#b8995510),var(--paper);box-shadow:inset 0 0 32px #ad89550c,2px 3px 0 #e9dfc8,3px 4px 0 #b8a58966,0 13px 28px #534c3018;container-type:inline-size}
.bloom-page:after{content:'';position:absolute;inset:0;z-index:8;border-radius:inherit;background-image:var(--grain);opacity:.42;mix-blend-mode:multiply;pointer-events:none}
.bloom-head{position:relative;z-index:2;text-align:right}
.eyebrow,.bloom-footer{display:none}
.bloom-head h1{display:inline-block;font:400 14px/1.8 var(--font);letter-spacing:.14em;margin:0;color:var(--warm-text);overflow-wrap:anywhere;text-wrap:balance}
.bloom-scene{position:relative;width:100%;aspect-ratio:4/3;display:grid;place-items:center;perspective:900px}
.bloom-flower{display:block;width:100%;height:100%;padding:0;border:0;background:transparent;transition:transform .24s ease,opacity .24s ease;filter:drop-shadow(0 8px 9px #4b493014)}
.bloom-flower img{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none}
.bloom-flower:hover{filter:drop-shadow(0 10px 11px #4b493026)}
[data-phase=opening] .bloom-flower{transform:translateY(12px);opacity:0}
[data-bloom-state=opening] .bloom-head,[data-bloom-state=opening] .bloom-hint,[data-bloom-state=opening] .bloom-footer{opacity:0;transition:opacity .16s}
.bloom-hint{position:relative;z-index:4;font:12px/1.8 var(--font);color:var(--warm-text)}
.bloom-page:has(.bloom-letter[hidden]){width:100%;max-width:660px;margin:0 auto;padding:0;border:0;border-radius:0;background:transparent;box-shadow:none}
.bloom-page:has(.bloom-letter[hidden]):after{display:none}
.bloom-page:has(.bloom-letter[hidden]) .bloom-head{position:absolute;left:21%;top:20%;width:58%;text-align:center;transform:rotate(-5deg);transform-origin:center;pointer-events:none}
.bloom-page:has(.bloom-letter[hidden]) .bloom-head h1{font-size:clamp(16px,4.2cqi,28px);line-height:1.3;letter-spacing:.12em;margin:0;color:var(--text);pointer-events:auto}
.bloom-page:has(.bloom-letter[hidden]) .eyebrow{display:none}
.bloom-page:has(.bloom-letter[hidden]) .bloom-hint{position:absolute;left:61%;top:67%;width:24%;margin:0;text-align:center;font-size:clamp(10px,1.9cqi,13px);letter-spacing:.14em;color:#173333;transform:rotate(-5deg);pointer-events:none}
.bloom-page:has(.bloom-letter[hidden]) .bloom-footer{display:block;position:absolute;left:61%;top:75%;width:24%;margin:0;text-align:center;font:clamp(10px,1.8cqi,12px)/1.8 var(--font);letter-spacing:.08em;color:#173333;transform:rotate(-5deg);pointer-events:none;z-index:4}
.bloom-letter{position:relative;margin:16px auto 0}
.letter-meta{display:flex;justify-content:space-between;align-items:center;gap:14px;font:10px/1.5 var(--ui);letter-spacing:.08em;color:var(--warm-text)}
.letter-meta button,.bloom-letter>button{border:0;background:transparent;color:var(--warm-text);padding:7px 0;font:13px/1.6 var(--font)}
.bloom-letter h2{font:400 26px/1.6 var(--font);color:var(--text);letter-spacing:.12em;margin:17px 0 16px;overflow-wrap:anywhere}
.bloom-letter h2:focus{outline:none}.letter-intro{font:400 ${data.fontSize}px/1.9 var(--font);white-space:pre-wrap;overflow-wrap:anywhere}
.bloom-page[data-star-page="bloom-home"] .letter-intro{font-size:max(14px,calc(${data.fontSize}px - 1px))}
.letter-publication{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;border-top:1px solid #ab9b773d;border-bottom:1px solid #ab9b773d;padding:15px 0;margin:23px 0;font-family:var(--ui)}
.letter-publication dt{font:10px/1.6 var(--ui);letter-spacing:.1em;color:#8b7b63;margin-bottom:6px}
.letter-publication dd{margin:0;display:flex;flex-wrap:wrap;gap:2px 9px;font:12px/1.8 var(--ui);color:#687269;overflow-wrap:anywhere}
.letter-routes{margin:21px 0}.letter-routes h3{font:400 14px/1.8 var(--font);margin:12px 0 5px}.letter-routes p{font:13px/1.85 var(--font);white-space:pre-wrap;margin:0;color:#687269}
.letter-directory-heading{display:flex;justify-content:space-between;gap:14px;color:#8b7b63;font:11px/1.8 var(--ui);letter-spacing:.08em;padding-bottom:9px;border-bottom:1px solid #ab9b773d}
.bloom-index{margin:24px 0 0}.bloom-entry+.bloom-entry{border-top:1px solid #ab9b7726}.bloom-entry{display:grid;grid-template-columns:26px minmax(0,1fr) 56px;gap:14px;align-items:center;padding:18px 0}
.num{font:italic 400 15px/1.8 Georgia,serif;color:var(--warm-text);align-self:start}
.bloom-entry h3{font:400 18px/1.6 var(--font);overflow-wrap:anywhere;margin:0 0 7px}
.bloom-entry p{font:400 14px/1.8 var(--font);color:#586c62;white-space:pre-wrap;overflow-wrap:anywhere;margin:0}
.bloom-entry button{border:0;background:transparent;color:var(--text);font:13px/1.6 var(--font);white-space:nowrap;padding:10px 3px}
.bloom-entry button:hover,.letter-meta button:hover,.bloom-letter>button:hover{color:var(--warm-text)}
.sign{text-align:right;font:14px/1.8 var(--font);letter-spacing:.1em;color:var(--warm-text);margin:32px 0 4px}
.bloom-cover{display:block;max-width:100%;max-height:300px;object-fit:contain;margin:18px 0}
.inline-picture{margin:18px 0;white-space:normal}.inline-picture img{display:block;max-width:100%;height:auto;max-height:650px;object-fit:contain;margin:auto}
.inline-picture figcaption{text-align:center;color:#586c62;font:12px/1.5 var(--ui);margin-top:8px}
.notice{font:13px/1.6 var(--ui);color:var(--warm-text)}.notice:empty{display:none}
/* The closed cover is only the illustrated envelope; reveal the title with the letter. */
.bloom-pencil{--ink:#647482;--accent:#ad8085;--text:#4a535b;--warm-text:#806e71}
.bloom-pencil:has(.bloom-letter[hidden]) :is(.bloom-head,.bloom-hint,.bloom-footer){display:none}
@media(max-width:600px){
 .bloom-page{width:calc(100% - 16px);margin:10px auto;padding:22px 22px 24px}
 .bloom-head h1{font-size:13px}.bloom-letter{margin-top:14px}.bloom-letter h2{font-size:24px}
 .bloom-entry{grid-template-columns:24px minmax(0,1fr) 47px;gap:8px;padding:15px 0}
 .bloom-entry h3{font-size:17px}.bloom-entry p{font-size:13px}
}
/* A letter sheet and its enclosure share one reading flow. Cover artwork stays untouched. */
.bloom-pencil[data-bloom-state="open"]{--paper:#faf8f2;--text:#48545b;--warm-text:#707d87;max-width:640px;width:calc(100% - 28px);margin:14px auto 24px;padding:30px 38px 22px;border:1px solid #dadbd5;border-radius:1px;background:linear-gradient(105deg,#fffdf8a6,transparent 44%,#e5e6e11a),var(--paper);box-shadow:0 5px 15px #48576612}
.bloom-pencil[data-bloom-state="open"]:before{content:'';position:absolute;inset:7px -6px -7px 5px;z-index:-1;background:transparent;border:0;border-right:4px solid #dce2e4;border-bottom:6px solid #dce2e4;transform:rotate(-.7deg);pointer-events:none}
.bloom-pencil[data-bloom-state="open"]:after{opacity:.16}
.bloom-pencil[data-bloom-state="open"] .bloom-head{text-align:left;padding:0 0 14px;border-bottom:1px solid #a5b1b75e}
.bloom-pencil[data-bloom-state="open"] .bloom-head h1{font:400 17px/1.6 var(--font);letter-spacing:.04em;color:#6c7c87}
.bloom-pencil[data-bloom-state="open"] .bloom-letter{margin:0}
.bloom-pencil .letter-message{padding-top:26px}
.bloom-pencil .letter-message h2{font:400 25px/1.65 var(--font);letter-spacing:.02em;margin:0 0 18px;color:#4a555d}
.bloom-pencil .letter-intro,.bloom-pencil[data-star-page="bloom-home"] .letter-intro{font-size:${data.fontSize}px;line-height:2.15;letter-spacing:.015em}
.bloom-pencil .sign{font:400 18px/1.7 var(--font);letter-spacing:.02em;margin:25px 0 26px;text-align:right;color:#566571}
.bloom-pencil .sign span{font-size:13px;margin-left:8px;color:#849098}
.bloom-pencil .bloom-index{position:relative;margin:0 -38px;padding:23px 38px 0;border-top:1px dashed #aab7bf70;background:linear-gradient(#8498a607,transparent 16px)}
.bloom-pencil .letter-directory-heading{border:0;padding:0 0 6px;color:#7d8c95;font:12px/1.7 var(--font);letter-spacing:.04em}
.bloom-pencil .bloom-entry{grid-template-columns:25px minmax(0,1fr);gap:1px 12px;padding:18px 0 10px;align-items:start}
.bloom-pencil .bloom-entry+.bloom-entry{border-color:#aab7bf40}
.bloom-pencil .num{font:italic 17px/1.8 Georgia,serif;color:#97a7b0}
.bloom-pencil .bloom-entry h3{font:400 19px/1.65 var(--font);margin:0 0 5px;color:#4a5964}
.bloom-pencil .bloom-entry p{font:14px/1.85 var(--font);color:#808b92}
.bloom-pencil .bloom-entry button{grid-column:2;justify-self:end;min-height:44px;padding:8px 0 8px 12px;font:14px/1.8 var(--font);letter-spacing:0;color:#647c8c}
.bloom-pencil .bloom-entry button:hover{color:#304d62;text-decoration:underline;text-underline-offset:5px}
.bloom-pencil .letter-return{display:block;width:100%;text-align:left;min-height:44px;border-top:1px solid #aab7bf50;padding:15px 0 0;margin-top:22px}
@media(max-width:600px){
 .bloom-pencil[data-bloom-state="open"]{width:calc(100% - 26px);padding:22px 25px 15px;margin:10px auto 22px}
 .bloom-pencil .letter-message{padding-top:23px}
 .bloom-pencil .bloom-index{margin:0 -25px;padding:21px 25px 0}
 .bloom-pencil .bloom-entry h3{font-size:18px}
 .bloom-pencil .letter-message h2{font-size:24px}
}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important}}
`;
}

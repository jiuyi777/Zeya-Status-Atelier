export function buildBloomPrintStyle(data, font) {
  return `
*{box-sizing:border-box;scrollbar-width:none}*::-webkit-scrollbar{display:none}[hidden]{display:none!important}
:root{--paper:#f7f1e4;--ink:${data.ink};--accent:${data.accent};--sage:#7f9c80;--sand:#d1ac6b;--text:color-mix(in srgb,var(--ink) 24%,#4a4138);--warm-text:color-mix(in srgb,var(--accent) 42%,#665445);--font:${font};--ui:'Noto Sans SC','Microsoft YaHei',sans-serif;--grain:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.55 .82' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Cpath fill='%2398845e' opacity='.24' filter='url(%23paper)' d='M0 0h180v180H0z'/%3E%3C/svg%3E")}
body{margin:0;background:transparent;color:var(--text);font:16px/1.85 var(--font)}
button{cursor:pointer;color:inherit;font:inherit}button:focus-visible{outline:2px solid var(--ink);outline-offset:5px}button:disabled{cursor:default}
.bloom-page{position:relative;isolation:isolate;width:calc(100% - 40px);max-width:560px;margin:18px auto;padding:32px 42px 34px;border:1px solid #ac977144;border-radius:3px 7px 4px 6px;background:linear-gradient(110deg,#fffdf555,transparent 40%,#b8995510),var(--paper);box-shadow:inset 0 0 32px #ad89550c,2px 3px 0 #e9dfc8,3px 4px 0 #b8a58966,0 13px 28px #534c3018;container-type:inline-size}
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
.bloom-letter h2{font:400 28px/1.6 var(--font);color:var(--text);letter-spacing:.12em;margin:18px 0 20px;overflow-wrap:anywhere}
.bloom-letter h2:focus{outline:none}.letter-intro{font:400 ${data.fontSize}px/2 var(--font);white-space:pre-wrap;overflow-wrap:anywhere}
.bloom-index{margin:26px 0 0}.bloom-entry{display:grid;grid-template-columns:26px minmax(0,1fr) 56px;gap:14px;align-items:center;padding:18px 0}
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
@media(max-width:600px){
 .bloom-page{width:calc(100% - 26px);margin:14px auto;padding:25px 25px 28px}
 .bloom-head h1{font-size:13px}.bloom-letter{margin-top:14px}.bloom-letter h2{font-size:26px}
 .bloom-entry{grid-template-columns:24px minmax(0,1fr) 47px;gap:8px;padding:15px 0}
 .bloom-entry h3{font-size:17px}.bloom-entry p{font-size:13px}
}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important}}
`;
}

const cloudUrl = new URL('./assets/opening-classical/ruyi-cloud-v3.webp', import.meta.url).href;

// Raster clouds keep their aspect ratio; only CSS rules extend with content.
export function withClassicalFrame(documentHtml) {
    return documentHtml.replace('</head>', `<style>
    .zoh-root[data-theme="classical"]{--zoh-text:#304f51!important;--zoh-secondary:#677c76!important;--zoh-accent:#527c80!important;--zoh-bg:#faf7f0!important}
    .zoh-root[data-theme="classical"] .zoh-page{border:0;padding:16px 22px 24px;box-shadow:none;background:var(--zoh-bg)}
    .zoh-root[data-theme="classical"] .zoh-page:before,.zoh-root[data-theme="classical"] .zoh-page:after{display:none}
    .zoh-root[data-theme="classical"] .zoh-header{width:min(100%,480px);margin:0 auto 8px;min-height:120px;padding:26px 16px;border:0;background:none}
    .zoh-root[data-theme="classical"] .zoh-header:before,.zoh-root[data-theme="classical"] .zoh-header:after{display:none}
    .zoh-root[data-theme="classical"] .zoh-title{max-width:100%;font-size:clamp(26px,7vw,40px);line-height:1.5;letter-spacing:.08em}
    .zoh-root[data-theme="classical"] .zoh-subtitle{max-width:100%;font-size:11px;letter-spacing:.08em;margin-top:7px}
    .zoh-root[data-theme="classical"] .zoh-meta{margin:2px 10px 24px;padding:12px 0;border:0;gap:7px}
    .zoh-root[data-theme="classical"] .zoh-meta strong{font-size:14px}
    .zoh-root[data-theme="classical"] :is(.zoh-intro,.zoh-directory){position:relative;margin:0 0 26px;padding:23px 22px 21px;border:1px solid #b49c69;border-radius:18px 2px 18px 2px;background:transparent}
    .zoh-root[data-theme="classical"] .zoh-directory:after{content:"";position:absolute;width:66px;aspect-ratio:2.5;bottom:-13px;right:14px;transform:scaleX(-1);background:var(--zoh-bg) url("${cloudUrl}") center/contain no-repeat;pointer-events:none}
    .zoh-root[data-theme="classical"] .zoh-intro h2:after{display:none}
    .zoh-root[data-theme="classical"] .zoh-intro p{text-indent:0;font-size:15px;line-height:1.9;margin:5px 0}
    .zoh-root[data-theme="classical"] .zoh-directory{margin-top:32px;padding-top:26px;border-radius:2px 16px 2px 16px;box-shadow:0 0 0 3px var(--zoh-bg),0 0 0 4px #b49c6945}
    .zoh-root[data-theme="classical"] .zoh-directory-head{padding:0 0 15px;border-top:0;border-bottom:3px double #b49c6966;gap:8px}
    .zoh-root[data-theme="classical"] :is(.zoh-directory,.zoh-intro) h2{font-size:17px;letter-spacing:.12em}
    .zoh-root[data-theme="classical"] .zoh-entry{grid-template-columns:25px minmax(0,1fr) auto;gap:12px 10px;align-items:start;padding:22px 0;border-bottom:1px solid #b49c6966}
    .zoh-root[data-theme="classical"] .zoh-entry:after{content:"";position:absolute;bottom:-3px;left:calc(50% - 3px);width:5px;height:5px;border:1px solid #ad9563;background:var(--zoh-bg);transform:rotate(45deg)}
    .zoh-root[data-theme="classical"] .zoh-entry:last-child{border-bottom:0;padding-bottom:3px}.zoh-root[data-theme="classical"] .zoh-entry:last-child:after{display:none}
    .zoh-root[data-theme="classical"] .zoh-number{display:block;grid-column:1;grid-row:1;writing-mode:horizontal-tb;letter-spacing:0;width:25px;padding:4px 0;border-top:1px solid #b49c6977;border-bottom:1px solid #b49c6977;font:16px/1.5 Georgia,serif;color:#a28b5e;text-align:center}
    .zoh-root[data-theme="classical"] .zoh-number:before{content:"卷";display:block;margin:0;font:10px/1.5 "KaiTi",serif}.zoh-root[data-theme="classical"] .zoh-number:after{display:none}
    .zoh-root[data-theme="classical"] .zoh-entry-copy{grid-column:2/-1;grid-row:1}
    .zoh-root[data-theme="classical"] .zoh-entry-title{font-size:21px;letter-spacing:.06em}
    .zoh-root[data-theme="classical"] .zoh-entry-copy>div{gap:5px 10px}
    .zoh-root[data-theme="classical"] .zoh-route{padding:1px 7px;border:1px solid #9baf9b70;border-radius:2px;font-size:11px;letter-spacing:.08em}.zoh-root[data-theme="classical"] .zoh-route:before,.zoh-root[data-theme="classical"] .zoh-route:after{content:none}
    .zoh-root[data-theme="classical"] .zoh-summary{margin-top:9px;font-size:15px;line-height:1.95}
    .zoh-root[data-theme="classical"] .zoh-jump{grid-column:3;grid-row:2;justify-self:end;min-width:90px;min-height:44px;padding:7px 14px;border:1px solid #789b97;outline:1px solid #b49c6955;outline-offset:3px;border-radius:1px;color:#426c70;background:transparent;writing-mode:horizontal-tb;letter-spacing:.12em;font-size:15px;font-weight:400}
    .zoh-root[data-theme="classical"] .zoh-jump:after{content:" →";font-family:serif;color:#a28b5e}.zoh-root[data-theme="classical"] .zoh-jump:hover{background:#efe8d9;color:#304f51}
    @media(max-width:460px){.zoh-root[data-theme="classical"] .zoh-page{padding:8px 17px 12px}.zoh-root[data-theme="classical"] .zoh-title{font-size:28px}.zoh-root[data-theme="classical"] :is(.zoh-intro,.zoh-directory){padding-inline:16px}.zoh-root[data-theme="classical"] .zoh-count{font-size:11px}.zoh-root[data-theme="classical"] .zoh-entry-title{font-size:20px}}
    </style></head>`);
}

export const ORIGINAL_ROLE_CARD_IDS = Object.freeze(['archive-status', 'pixel-chat', 'pixel-handheld']);

export function isOriginalRoleCardStructure(structure) {
    return ORIGINAL_ROLE_CARD_IDS.includes(structure);
}

const RAW_ORIGINAL_HTML = Object.freeze({
    'archive-status': "<div class=\"bw-archive-system\">\n    <div class=\"bw-archive-header\" onclick=\"this.parentElement.classList.toggle('open')\">\n        <div class=\"bw-archive-title\">\n            <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n                <path d=\"M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z\"></path>\n            </svg>\n            <span>CONFIDENTIAL ARCHIVE</span>\n        </div>\n        <div class=\"bw-archive-icon\">▼</div>\n    </div>\n    <div class=\"bw-archive-deco-line\"></div>\n\n    <div class=\"bw-archive-body\">\n        <div class=\"bw-archive-inner\">\n            <div class=\"bw-archive-content-wrapper\">\n\n                <div class=\"frost-blue-chapter-hud\">\n\n                    <!-- 每日状态栏 -->\n                    <div class=\"fb-daily-status\">\n                        <div class=\"fb-ds-top-row\">\n                            <div class=\"fb-ds-date\">\n                                <span class=\"fb-ds-label\">DATE</span>\n                                <span class=\"fb-ds-value\" id=\"mvu-time\">N/A</span>\n                            </div>\n                            <div class=\"fb-ds-divider\"></div>\n                            <div class=\"fb-ds-item fb-ds-good\">\n                                <span class=\"fb-ds-icon\">宜</span>\n                                <span class=\"fb-ds-text\" id=\"mvu-good\">N/A</span>\n                            </div>\n                            <div class=\"fb-ds-item fb-ds-bad\">\n                                <span class=\"fb-ds-icon\">忌</span>\n                                <span class=\"fb-ds-text\" id=\"mvu-bad\">N/A</span>\n                            </div>\n                        </div>\n                        <div class=\"fb-ds-info-row\">\n                            <div class=\"fb-ds-info-row-flex\">\n                                <span class=\"fb-ds-info-label\">LOC.</span>\n                                <span class=\"fb-ds-info-value\" id=\"mvu-location\">N/A</span>\n                            </div>\n                        </div>\n                        <div class=\"fb-ds-info-row\">\n                            <div class=\"fb-ds-info-row-flex\">\n                                <span class=\"fb-ds-info-label\">BCAST.</span>\n                                <span class=\"fb-ds-info-value fb-ds-broadcast-value\" id=\"mvu-broadcast\">N/A</span>\n                            </div>\n                        </div>\n                    </div>\n\n                    <!-- 章节卡片 -->\n                    <div class=\"fb-card\" onclick=\"this.classList.toggle('flipped')\">\n                        <div class=\"fb-container fb-front\">\n                            <div class=\"fb-header\">\n                                <div class=\"fb-chapter-decoration\">NOVEL CHAPTER</div>\n                                <div class=\"fb-chapter-title mvu-title\">N/A</div>\n                                <div class=\"fb-chapter-jp-subtitle\" id=\"mvu-front-chapter\">N/A</div>\n                            </div>\n                            <div class=\"fb-content-row\">\n                                <div class=\"fb-avatar-frame\">\n                                    <div class=\"fb-avatar-overlay\"></div>\n                                    <img src=\"https://s41.ax1x.com/2026/03/02/pepK81g.jpg\" onerror=\"this.onerror=null;this.src='/thumbnails/Assistant.png';\" class=\"fb-avatar-img\" alt=\"Assistant\">\n                                </div>\n                                <div class=\"fb-char-name\">Sato</div>\n                                <div class=\"fb-monologue-box\" id=\"mvu-front-thought\">N/A</div>\n                            </div>\n                        </div>\n\n                        <div class=\"fb-container fb-back\">\n                            <div class=\"fb-header\">\n                                <div class=\"fb-chapter-decoration\">NOVEL CHAPTER</div>\n                                <div class=\"fb-chapter-title mvu-title\">N/A</div>\n                                <div class=\"fb-chapter-jp-subtitle\" id=\"mvu-back-chapter\">N/A</div>\n                            </div>\n                            <div class=\"fb-content-row\">\n                                <div class=\"fb-avatar-frame\">\n                                    <div class=\"fb-avatar-overlay-back\"></div>\n                                    <img src=\"https://s41.ax1x.com/2026/03/02/pepKGcQ.jpg\" onerror=\"this.onerror=null;this.src='/thumbnails/Assistant.png';\" class=\"fb-avatar-img\" alt=\"Assistant\">\n                                </div>\n                                <div class=\"fb-char-name\">佐藤原野</div>\n                                <div class=\"fb-monologue-box\" id=\"mvu-back-thought\">N/A</div>\n                            </div>\n                        </div>\n                    </div>\n\n                    <!-- 信件交互模块 -->\n                    <div class=\"fb-letter-wrapper\">\n                        <div class=\"fb-letter-toggle\" onclick=\"this.parentElement.classList.toggle('open')\">\n                            <svg viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\">\n                                <path d=\"M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z\" />\n                            </svg>\n                            <span>查阅信件 / VIEW LETTER</span>\n                        </div>\n                        <div class=\"fb-letter-content\">\n                            <div class=\"fb-letter-content-inner\">\n                                <div class=\"fb-letter-paper-wrapper\">\n                                    <div class=\"fb-blue-tape tape-tl\"></div>\n                                    <div class=\"fb-blue-tape tape-br\"></div>\n                                    <div class=\"fb-letter-paper\">\n                                        <div class=\"fb-letter-to\">To: <span id=\"mvu-letter-to\">N/A</span></div>\n                                        <div class=\"fb-letter-body\" id=\"mvu-letter-body\">N/A</div>\n                                        <div class=\"fb-letter-from\">From: <span id=\"mvu-letter-from\">N/A</span></div>\n                                        <img src=\"https://s41.ax1x.com/2026/03/02/pepn5a6.png\" class=\"fb-letter-stamp\" alt=\"stamp\">\n                                    </div>\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n\n                    <!-- 拍立得界面 -->\n                    <div class=\"fb-polaroid-wrapper\">\n                        <div class=\"fb-polaroid\">\n                            <div class=\"fb-blue-tape tape-top\"></div>\n                            <div class=\"fb-polaroid-img-container\" id=\"mvu-polaroid-container\" data-loc=\"hide\">\n                                <img src=\"https://s41.ax1x.com/2026/03/04/pe9JZE4.jpg\" onerror=\"this.onerror=null;this.src='/thumbnails/Assistant.png';\" class=\"fb-polaroid-img\" alt=\"Polaroid Map\">\n                                <img src=\"https://s41.ax1x.com/2026/03/02/pep3ywj.png\" class=\"fb-polaroid-figure\" id=\"mvu-polaroid-figure\" alt=\"Mini Figure\">\n                                <div class=\"fb-polaroid-filter\"></div>\n                            </div>\n                            <div class=\"fb-polaroid-caption\" id=\"mvu-photo-loc\">N/A</div>\n                        </div>\n                    </div>\n\n                    <!-- 御神签界面 -->\n                    <div class=\"fb-omikuji-container\">\n                        <div class=\"fb-omikuji-title\">御神籤 / OMIKUJI</div>\n                        <div class=\"fb-omikuji-scene\">\n                            <div class=\"fb-omikuji-stick\"></div>\n                            <div class=\"fb-omikuji-cylinder\" onclick=\"\n                                const scene = this.parentElement;\n                                if(!scene.classList.contains('drawn')) {\n                                    this.classList.add('shaking');\n                                    setTimeout(() => {\n                                        this.classList.remove('shaking');\n                                        scene.classList.add('drawn');\n                                    }, 800);\n                                } else {\n                                    scene.classList.remove('drawn');\n                                }\n                            \"></div>\n                        </div>\n                        <div class=\"fb-omikuji-result-box\">\n                            <div class=\"fb-omikuji-hint\">点击摇晃抽签筒</div>\n                        </div>\n                        <div class=\"fb-omikuji-paper-wrapper\">\n                            <div class=\"fb-omikuji-paper-inner\">\n                                <div class=\"fb-omikuji-paper-content\">\n                                    <div class=\"fb-omikuji-level\" id=\"mvu-omi-level\">未知</div>\n                                    <div class=\"fb-omikuji-text\" id=\"mvu-omi-text\">尚未抽签。</div>\n                                    <div class=\"fb-omikuji-close\" onclick=\"\n                                        const scene = this.closest('.fb-omikuji-container').querySelector('.fb-omikuji-scene');\n                                        scene.classList.remove('drawn');\n                                    \">收起签文 / FOLD</div>\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n\n                </div>\n\n            </div>\n        </div>\n    </div>\n\n    <div class=\"bw-archive-footer\">\n        <div class=\"bw-status-indicator\">\n            <div class=\"bw-status-dot\"></div>\n            <span>SECURE CONNECTION</span>\n        </div>\n        <div>SYS.VER.3.2 // AUTHORIZED ONLY</div>\n    </div>\n</div>\r\n",
    'pixel-chat': "<div class=\"status-container\"><div class=\"header-section\"><div class=\"main-title\">✦ <span class=\"js-pixel-title\">X</span> ✦</div><div class=\"sub-title\">「<span class=\"js-pixel-subtitle\">X</span>」</div></div><div class=\"chat-section js-pixel-chats\"></div></div>",
    'pixel-handheld': "<div class=\"phone-wrapper blackberry-phone-instance\">\n        <div class=\"blackberry-phone\">\n            <div class=\"phone-speaker\"></div>\n\n            <div class=\"screen-container\">\n                <div class=\"status-bar\">\n                    <span>4G网络</span>\n                    <span class=\"battery-status\">--% [电]</span>\n                </div>\n                <div class=\"screen-content\">\n                    <!-- 时钟 -->\n                    <div class=\"tab-panel panel-time active\">\n                        <div class=\"clock-face\">\n                            <div class=\"clock-center\"></div>\n                            <div class=\"clock-hand hour-hand\"></div>\n                            <div class=\"clock-hand minute-hand\"></div>\n                        </div>\n                        <div class=\"time-text js-time\">--:--</div>\n                        <div class=\"date-loc js-date-loc\">--月--日 | --</div>\n                    </div>\n\n                    <!-- 天气 -->\n                    <div class=\"tab-panel panel-weather\">\n                        <div class=\"weather-text-icon js-weather-icon\">--</div>\n                        <div class=\"weather-desc js-weather-desc\">正在拉取天气云图...</div>\n                        <div class=\"weather-cute-text js-weather-feel\">\"...\"</div>\n                    </div>\n\n                    <!-- 装扮 -->\n                    <div class=\"tab-panel panel-outfit\">\n                        <div class=\"outfit-title\">今日装扮</div>\n                        <div class=\"outfit-desc js-outfit-desc\">打开衣柜中...</div>\n                    </div>\n\n                    <!-- 日历(想法) -->\n                    <div class=\"tab-panel panel-diary\">\n                        <div class=\"diary-page\">\n                            <div class=\"tape-deco\"></div>\n                            <div class=\"diary-date js-diary-date\">日记 | --</div>\n                            <div class=\"diary-content js-diary-content\">翻开日记本...</div>\n                        </div>\n                    </div>\n\n                    <!-- 待办 -->\n                    <div class=\"tab-panel panel-todo\">\n                        <div class=\"todo-title\">待办清单</div>\n                        <div class=\"todo-list js-todo-list\">\n                            <div class=\"todo-item\"><div class=\"todo-box\"></div><span>查找计划中...</span></div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n\n            <!-- 键盘区 -->\n            <div class=\"keyboard-area\">\n                <div class=\"nav-row\">\n                    <div class=\"btn active\" data-target=\"panel-time\" data-bg=\"#e0fbf5\" data-sbg=\"#bcebde\">时</div>\n                    <div class=\"btn center-btn\" data-target=\"panel-todo\" data-bg=\"#e6f2ff\" data-sbg=\"#c2ddfc\">办</div>\n                    <div class=\"btn\" data-target=\"panel-weather\" data-bg=\"#fff2e6\" data-sbg=\"#ffdcb8\">天</div>\n                </div>\n                <div class=\"nav-row\">\n                    <div class=\"btn\" data-target=\"panel-outfit\" data-bg=\"#f3f0ff\" data-sbg=\"#d9d0ff\">衣</div>\n                    <div class=\"btn\" data-target=\"panel-diary\" data-bg=\"#fff0f5\" data-sbg=\"#ffd6e8\">历</div>\n                </div>\n            </div>\n        </div>\n    </div>\r\n",
});

const ORIGINAL_HTML = Object.freeze({
    ...RAW_ORIGINAL_HTML,
    'archive-status': RAW_ORIGINAL_HTML['archive-status']
        .replace(/佐藤原野|Sato/g, 'X')
        .replace(/src="https:\/\/s41\.ax1x\.com\/2026\/03\/02\/pepK81g\.jpg"/g, 'src=""')
        .replace(/src="https:\/\/s41\.ax1x\.com\/2026\/03\/02\/pepKGcQ\.jpg"/g, 'src=""')
        .replace(/src="https:\/\/s41\.ax1x\.com\/2026\/03\/04\/pe9JZE4\.jpg"/g, 'src=""')
        .replace(/src="https:\/\/s41\.ax1x\.com\/2026\/03\/02\/pep3ywj\.png"/g, 'src=""'),
});

const ORIGINAL_CSS_PATH = Object.freeze({
    'archive-status': './role-card-originals/archive.css',
    'pixel-chat': './role-card-originals/pixel-chat.css',
    'pixel-handheld': './role-card-originals/blackberry.css',
});

const EXPORTED_CSS_PATH = Object.freeze({
    'archive-status': '/scripts/extensions/third-party/status-atelier/role-card-originals/archive.css',
    'pixel-chat': '/scripts/extensions/third-party/status-atelier/role-card-originals/pixel-chat.css',
    'pixel-handheld': '/scripts/extensions/third-party/status-atelier/role-card-originals/blackberry.css',
});

function safeJsonForScript(value) {
    return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

function previewRecords(bundle = {}) {
    const records = { Shared: Array.isArray(bundle.shared) ? bundle.shared : [] };
    for (const item of bundle.pages || []) records[item.page.id] = Array.isArray(item.values) ? item.values : [];
    return records;
}

export function hydrateOriginalRoleCard(shadow, rule, records = {}) {
    const values = new Map();
    (rule.sharedFields || []).forEach((field, index) => values.set(field.id, records.Shared?.[index] || ''));
    (rule.pages || []).forEach(page => {
        const pageValues = records[page.id] || [];
        (page.fields || rule.pageFields || []).forEach((field, index) => values.set(field.id, pageValues[index] || ''));
    });
    const value = id => String(values.get(id) || 'X');
    const setText = (selector, content) => shadow.querySelectorAll(selector).forEach(node => { node.textContent = content; });
    const avatarUrl = String(rule.media?.avatarUrl || '');

    if (rule.structure === 'archive-status') {
        shadow.querySelectorAll('[onclick]').forEach(node => node.removeAttribute('onclick'));
        const textFields = {
            '#mvu-time': 'scene_time',
            '#mvu-good': 'good_omen',
            '#mvu-bad': 'bad_omen',
            '#mvu-location': 'location',
            '#mvu-broadcast': 'broadcast',
            '.mvu-title': 'scene_title',
            '#mvu-front-chapter': 'front_chapter',
            '#mvu-front-thought': 'front_thought',
            '#mvu-back-chapter': 'back_chapter',
            '#mvu-back-thought': 'back_thought',
            '#mvu-letter-to': 'letter_to',
            '#mvu-letter-body': 'letter_body',
            '#mvu-letter-from': 'letter_from',
            '#mvu-photo-loc': 'photo_location',
            '#mvu-omi-level': 'fortune_level',
            '#mvu-omi-text': 'fortune_text',
        };
        Object.entries(textFields).forEach(([selector, id]) => setText(selector, value(id)));
        setText('.fb-char-name', 'X');
        shadow.querySelectorAll('.fb-avatar-img').forEach(image => {
            if (avatarUrl) {
                image.src = avatarUrl;
                image.alt = '当前角色头像';
                image.onerror = () => image.closest('.fb-avatar-frame')?.classList.add('is-placeholder');
            } else {
                image.removeAttribute('src');
                image.alt = 'X';
                image.closest('.fb-avatar-frame')?.classList.add('is-placeholder');
            }
        });
        const archiveImages = Array.isArray(rule.media?.archiveImageUrls) ? rule.media.archiveImageUrls.filter(Boolean) : [];
        const polaroidImage = shadow.querySelector('.fb-polaroid-img');
        const polaroidFrame = shadow.querySelector('.fb-polaroid-img-container');
        shadow.querySelector('.fb-polaroid-figure')?.remove();
        if (polaroidImage && archiveImages.length) {
            polaroidImage.src = archiveImages[Math.floor(Math.random() * archiveImages.length)];
            polaroidImage.alt = rule.media?.imageAlt || '玩家拍立得图片';
            polaroidImage.onerror = () => {
                polaroidImage.removeAttribute('src');
                polaroidFrame?.classList.add('is-placeholder');
            };
        } else if (polaroidImage) {
            polaroidImage.removeAttribute('src');
            polaroidImage.alt = 'X';
            polaroidFrame?.classList.add('is-placeholder');
        }
        const header = shadow.querySelector('.bw-archive-header');
        const card = shadow.querySelector('.fb-card');
        const letter = shadow.querySelector('.fb-letter-toggle');
        const cylinder = shadow.querySelector('.fb-omikuji-cylinder');
        const close = shadow.querySelector('.fb-omikuji-close');
        header?.addEventListener('click', () => header.parentElement?.classList.toggle('open'));
        card?.addEventListener('click', () => card.classList.toggle('flipped'));
        letter?.addEventListener('click', () => letter.parentElement?.classList.toggle('open'));
        cylinder?.addEventListener('click', () => {
            const scene = cylinder.parentElement;
            if (!scene?.classList.contains('drawn')) {
                cylinder.classList.add('shaking');
                window.setTimeout(() => {
                    cylinder.classList.remove('shaking');
                    scene?.classList.add('drawn');
                }, 800);
            } else scene.classList.remove('drawn');
        });
        close?.addEventListener('click', event => {
            event.stopPropagation();
            close.closest('.fb-omikuji-container')?.querySelector('.fb-omikuji-scene')?.classList.remove('drawn');
        });
        return;
    }

    if (rule.structure === 'pixel-chat') {
        setText('.js-pixel-title', value('chat_title'));
        setText('.js-pixel-subtitle', value('chat_subtitle'));
        const page = rule.pages?.[0];
        const pageValues = records[page?.id] || [];
        const chats = (page?.fields || rule.pageFields || [])
            .map((field, index) => ({ field, content: pageValues[index] }))
            .filter(item => /^chat_\\d+$/.test(item.field.id))
            .map(item => String(item.content || 'X'));
        const chatHost = shadow.querySelector('.js-pixel-chats');
        (chats.length ? chats : ['X', 'X', 'X']).forEach(content => {
            const row = document.createElement('div');
            row.className = 'chat-message';
            const avatar = document.createElement('div');
            avatar.className = 'avatar';
            if (avatarUrl) {
                const image = document.createElement('img');
                image.src = avatarUrl;
                image.alt = '当前角色头像';
                image.style.cssText = 'width:100%;height:100%;object-fit:cover';
                image.addEventListener('error', () => { image.remove(); avatar.textContent = 'X'; });
                avatar.append(image);
            } else avatar.textContent = 'X';
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            bubble.textContent = content;
            row.append(avatar, bubble);
            chatHost?.append(row);
        });
        return;
    }

    setText('.js-time', value('scene_time'));
    setText('.js-date-loc', value('scene_date') + ' | ' + value('location'));
    setText('.js-diary-date', '日记 | ' + value('scene_date'));
    setText('.js-weather-icon', value('weather'));
    setText('.js-weather-desc', value('weather'));
    setText('.js-weather-feel', '“' + value('weather_feel') + '”');
    setText('.js-outfit-desc', value('outfit'));
    setText('.js-diary-content', value('diary'));

    const todoList = shadow.querySelector('.js-todo-list');
    todoList?.replaceChildren();
    [...values.keys()].filter(id => /^todo_\\d+$/.test(id)).forEach(id => {
        const item = document.createElement('div');
        item.className = 'todo-item';
        const box = document.createElement('div');
        box.className = 'todo-box';
        const copy = document.createElement('span');
        copy.textContent = value(id);
        item.append(box, copy);
        todoList?.append(item);
    });
    if (todoList && !todoList.children.length) {
        const item = document.createElement('div');
        item.className = 'todo-item';
        item.textContent = 'X';
        todoList.append(item);
    }

    const timeMatch = value('scene_time').match(/(\\d{1,2}):(\\d{2})/);
    if (timeMatch) {
        const hours = Number(timeMatch[1]) % 12;
        const minutes = Number(timeMatch[2]);
        const hourHand = shadow.querySelector('.hour-hand');
        const minuteHand = shadow.querySelector('.minute-hand');
        if (hourHand) hourHand.style.transform = 'rotate(' + ((hours * 30) + (minutes * 0.5)) + 'deg)';
        if (minuteHand) minuteHand.style.transform = 'rotate(' + (minutes * 6) + 'deg)';
    }

    const buttons = [...shadow.querySelectorAll('.btn')];
    const panels = [...shadow.querySelectorAll('.tab-panel')];
    const screen = shadow.querySelector('.screen-content');
    const bar = shadow.querySelector('.status-bar');
    buttons.forEach(button => button.addEventListener('click', () => {
        panels.forEach(panel => panel.classList.remove('active'));
        buttons.forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        shadow.querySelector('.' + button.dataset.target)?.classList.add('active');
        if (screen) screen.style.backgroundColor = button.dataset.bg || '';
        if (bar) bar.style.backgroundColor = button.dataset.sbg || '';
    }));

    const batteryText = shadow.querySelector('.battery-status');
    if (batteryText && typeof navigator.getBattery === 'function') {
        navigator.getBattery().then(battery => {
            const update = () => { batteryText.textContent = Math.floor(battery.level * 100) + '% ' + (battery.charging ? '[充]' : '[电]'); };
            update();
            battery.addEventListener('levelchange', update);
            battery.addEventListener('chargingchange', update);
        }).catch(() => {});
    } else if (batteryText) batteryText.textContent = '88% [电]';
}

export function mountOriginalRoleCard(host, rule, bundle) {
    if (!host || !isOriginalRoleCardStructure(rule?.structure)) return null;
    const shadow = host.shadowRoot || host.attachShadow({ mode: 'open' });
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = new URL(ORIGINAL_CSS_PATH[rule.structure], import.meta.url).href;
    shadow.replaceChildren(stylesheet);
    const stage = document.createElement('div');
    stage.innerHTML = ORIGINAL_HTML[rule.structure];
    while (stage.firstChild) shadow.append(stage.firstChild);
    hydrateOriginalRoleCard(shadow, rule, previewRecords(bundle));
    return shadow;
}

export function buildOriginalRoleCardReplacement(rule) {
    if (!isOriginalRoleCardStructure(rule?.structure)) return '';
    const configJson = safeJsonForScript({
        structure: rule.structure,
        media: rule.media,
        sharedFields: rule.sharedFields,
        pageFields: rule.pageFields,
        pages: rule.pages,
    });
    const htmlJson = safeJsonForScript(ORIGINAL_HTML[rule.structure]);
    const cssPathJson = safeJsonForScript(EXPORTED_CSS_PATH[rule.structure]);
    const hydrateSource = hydrateOriginalRoleCard.toString();
    return '\`\`\`html\n'
        + '<div class="zeya-rolecard-original"><textarea hidden>$1</textarea></div>\n'
        + '<script>\n(function(script){\n'
        + 'var host=script.previousElementSibling;if(!host||!host.classList.contains("zeya-rolecard-original"))return;\n'
        + 'var raw=host.querySelector("textarea").value||"";var records={};\n'
        + 'raw.split(/\\r?\\n/).forEach(function(line){line=line.trim();if(line.charAt(0)!=="["||line.charAt(line.length-1)!=="]")return;var parts=line.slice(1,-1).split("|").map(function(item){return item.trim();});var key=parts.shift();if(key)records[key]=parts;});\n'
        + 'var shadow=host.attachShadow({mode:"open"});var link=document.createElement("link");link.rel="stylesheet";link.href=' + cssPathJson + ';shadow.append(link);\n'
        + 'var stage=document.createElement("div");stage.innerHTML=' + htmlJson + ';while(stage.firstChild)shadow.append(stage.firstChild);\n'
        + '(' + hydrateSource + ')(shadow,' + configJson + ',records);\n'
        + '})(document.currentScript);\n</script>\n\`\`\`';
}

// Compact compositions and their self-contained iframe runtime.
const field = index => `<section class="sa32-field" data-field="${index}"><span data-label="${index}"></span><strong data-value="${index}"></strong></section>`;
const fields = indexes => indexes.map(field).join('');
const note = (index, extra = []) => `<div class="reading-note">${fields([index, ...extra])}</div>`;
const panels = groups => groups.map(items => `<div class="reading-group">${fields(items)}</div>`).join('');


const cinemaReel = `<svg viewBox="0 0 180 190" fill="none" aria-hidden="true"><path d="M31 158h118M43 166h95" stroke="#d9b394"/><circle cx="90" cy="82" r="64" stroke="#d9b394"/><circle cx="90" cy="82" r="56" fill="#e6c6a3"/><g fill="#783e49" stroke="#be8e78"><circle cx="90" cy="51" r="17"/><circle cx="120" cy="73" r="17"/><circle cx="109" cy="109" r="17"/><circle cx="70" cy="108" r="17"/><circle cx="60" cy="73" r="17"/></g><circle cx="90" cy="82" r="9" fill="#783e49" stroke="#d9b394"/><path d="M142 119c31 42-32 22-25 44" stroke="#e6c6a3" stroke-width="6"/><path d="m25 27 4 8 8 4-8 4-4 8-4-8-8-4 8-4Z" fill="#d9b394"/><text x="90" y="185" text-anchor="middle" fill="#d9b394" font-size="9" letter-spacing="3" font-family="Georgia">LAST SCREENING</text></svg>`;
const sunsetWindow = `<svg viewBox="0 0 620 210" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="620" height="210" fill="#d5a28a"/><path d="M0 130Q100 82 210 124t200-3 210-26v115H0Z" fill="#bc8e88"/><circle cx="429" cy="72" r="47" fill="#f5d49c"/><path d="M0 169 80 137l50 21 80-35 91 50 98-37 120 31 101-40v83H0Z" fill="#7e8586"/><path d="M0 192q112-42 217 0t213-8 190 9v17H0Z" fill="#51666c"/><path d="M67 34h70m-53 8h27m396 73h52" stroke="#eed0b2"/><path d="m264 55 8-3 8 3m12 9 6-2 6 2" fill="none" stroke="#6a797e"/><path d="M45 20v160M57 20v145" stroke="#fff0d7" stroke-opacity=".28" stroke-width="4"/></svg>`;

const trainScenes = `<div data-window-scene="dusk">${sunsetWindow}</div><div data-window-scene="dawn" hidden><svg viewBox="0 0 620 210" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="620" height="210" fill="#d9dcd3"/><circle cx="158" cy="92" r="36" fill="#f6d5a2"/><path d="M0 151 103 60 201 154 293 81 406 161 522 88 620 150V210H0Z" fill="#a4b4ac"/><path d="m72 89 31-29 34 33-30-9Z" fill="#eef0e5"/><path d="M0 173Q130 116 282 174T620 152V210H0Z" fill="#698d80"/><path d="M0 191Q180 167 360 199T620 181" stroke="#ece6cf" stroke-width="14" fill="none"/><g fill="#476e63"><path d="m45 195 13-46 13 46Zm470 15 18-65 18 65Zm50-10 13-47 13 47Z"/></g><path d="M40 115h193m58 29h231" stroke="#e9ede3" stroke-width="5" opacity=".65"/></svg></div><div data-window-scene="day" hidden><svg viewBox="0 0 620 210" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="620" height="210" fill="#b9d8df"/><circle cx="459" cy="45" r="25" fill="#fff0c5"/><path d="M68 52h96m180 20h64" stroke="#eff4e9" stroke-width="13" stroke-linecap="round"/><path d="M0 104h620v106H0Z" fill="#5c9caa"/><path d="M0 139q180-12 300 20t320-5" stroke="#9fced0" stroke-width="7" fill="none"/><path d="M0 158Q100 123 182 166T350 210H0Z" fill="#e2cc9f"/><path d="M0 181 42 162 83 177 120 169 187 210H0Z" fill="#7c9a79"/><path d="m354 138 22-4 17 4-7 7h-24Z" fill="#48626a"/><path d="M376 133V92l-22 38Z" fill="#fff1d2"/><path d="M468 170h59m-255-49h39m146 67h88" stroke="#c3e0dc" stroke-width="2"/></svg></div><div data-window-scene="night" hidden><svg viewBox="0 0 620 210" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="620" height="210" fill="#273d55"/><circle cx="440" cy="49" r="27" fill="#e9dfbd"/><g fill="#c9d5d7"><circle cx="80" cy="33" r="2"/><circle cx="203" cy="55" r="1.5"/><circle cx="316" cy="24" r="2"/><circle cx="521" cy="88" r="1.5"/><circle cx="555" cy="31" r="2"/></g><path d="M0 151h27V95h46v31h25V78h49v69h20v-38h52v36h38V89h39v61h33v-44h47v40h52V99h40v51h32v-24h47v20h23v-62h49v65h51v61H0Z" fill="#45586c"/><path d="M0 180h620v30H0Z" fill="#1f3549"/><g stroke="#e9bf7d" stroke-width="4" stroke-dasharray="5 10"><path d="M37 112h24m48-19h26m43 31h31m56-21h22m55 20h21m73-6h22m54 23h30m29-42h32M37 131h24m48-19h26m130 10h22m244 5h32"/></g><path d="M0 188h620M0 201h620" stroke="#a1a4a2" stroke-width="2"/><path d="M0 171q145-24 293 0t327-2" fill="none" stroke="#788c9b" stroke-width="3"/></svg></div>`;

export function compactComposition(preset) {
    const people = `<div class="pocket-identity"><figure class="pocket-avatar"><img data-st-avatar alt="当前角色头像"><span aria-hidden="true">人</span></figure><nav class="pocket-people" aria-label="选择人物"></nav></div>`;
    let content;
    switch (preset.layout) {
        case 'lunar':
            return `<div class="lunar-observatory"><div class="lunar-cover"><div class="lunar-title"><small>NO. 035 / LUNAR OBSERVATIONS</small><h2 data-design-title></h2></div>${people}<div class="lunar-observation"><div class="lunar-chart" aria-hidden="true"><svg viewBox="0 0 280 260" fill="none"><rect x="12" y="12" width="256" height="236" rx="118" stroke="#c8b68c" stroke-opacity=".45"/><circle cx="140" cy="124" r="108" stroke="#d7c392" stroke-dasharray="1 8"/><path d="M18 180C48 230 236 201 264 67M29 57C76 17 214 34 253 178" stroke="#cab788" stroke-opacity=".55"/><circle cx="140" cy="124" r="88" fill="#f3e7c5" stroke="#d9c494" stroke-width="2"/><circle cx="140" cy="124" r="82" stroke="#dccba5" stroke-width=".6"/><g fill="#c8c3aa" opacity=".65"><path d="M88 67c16-10 30-3 27 9s13 8 17 22-13 24-22 18-21 5-30-7-6-31 8-42Z"/><path d="M151 51c15-6 40 13 35 27s-22 13-25 30-28 5-28-9 19-15 13-27-4-17 5-21Z"/><path d="M171 120c16-5 29 6 28 21s-25 24-37 13-12-28 9-34Z"/><path d="M106 146c17-8 27 12 19 23s-11 17-25 9-12-23 6-32Z"/></g><g stroke="#c4b997" stroke-width="1" fill="#e7daba"><circle cx="117" cy="127" r="12"/><circle cx="117" cy="127" r="8" fill="#eddfbb"/><circle cx="169" cy="174" r="16"/><circle cx="169" cy="174" r="11" fill="#efdfba"/><circle cx="197" cy="95" r="8"/><circle cx="86" cy="137" r="7"/><circle cx="137" cy="184" r="6"/><circle cx="150" cy="141" r="5"/><circle cx="105" cy="53" r="4"/></g><g fill="#b8ae90" opacity=".65"><circle cx="108" cy="94" r="2"/><circle cx="118" cy="90" r="1"/><circle cx="96" cy="99" r="1.5"/><circle cx="157" cy="66" r="2"/><circle cx="165" cy="78" r="1.5"/><circle cx="191" cy="141" r="2"/><circle cx="100" cy="170" r="1.5"/><circle cx="132" cy="151" r="1.5"/><circle cx="139" cy="53" r="1"/></g><g stroke="#d5bd83"><path d="m38 48 3 10 10 3-10 3-3 10-3-10-10-3 10-3Z" fill="#eddbab"/><path d="m242 172 3 12 12 3-12 3-3 12-3-12-12-3 12-3Z" fill="#eddbab"/><path d="M58 209h14m-7-7v14M233 38h10m-5-5v10"/><path d="m30 143 6-22 13-4M222 217l18-4 12 13" stroke-opacity=".6"/></g><g fill="#ead6a0"><circle cx="30" cy="143" r="2"/><circle cx="36" cy="121" r="2"/><circle cx="49" cy="117" r="2"/><circle cx="222" cy="217" r="2"/><circle cx="240" cy="213" r="2"/><circle cx="252" cy="226" r="2"/><circle cx="198" cy="20" r="2"/><circle cx="20" cy="91" r="1.5"/></g><path d="M95 233h90" stroke="#c8b68c" stroke-opacity=".65"/><text x="140" y="247" fill="#decca5" font-family="Georgia,serif" font-size="7" text-anchor="middle" letter-spacing="3">THE MOON · XXXV</text></svg><span>月面图绘 · 夜间手记</span></div><div class="lunar-readings">${fields([0,2,6])}</div></div></div><div class="lunar-paper"><div class="lunar-binding" aria-hidden="true"><i></i><i></i><i></i></div><div class="lunar-plan"><span class="lunar-index" aria-hidden="true">01<br>PLAN</span>${note(1)}</div><div class="lunar-notes">${panels([[3,4],[5,7]])}</div><div class="lunar-paper-foot" aria-hidden="true"><span>OBSERVATION NOTES</span><span>◔ ── ◑ ── ● ── ◐ ── ◕</span></div></div></div>`;
        case 'ticket':
            content = `<div class="pocket-ticket-stub"><span class="ticket-admission" aria-hidden="true">ADMIT<br><b>ONE</b></span>${cinemaReel}${fields([0, 5])}<span class="ticket-serial" aria-hidden="true">Nº 0036 · NIGHT SESSION</span></div><div class="pocket-ticket-main"><div class="ticket-print" aria-hidden="true"><span>SCREEN / 01</span><span>一场尚未落幕的故事</span></div><div class="reading-group">${note(1)}${note(3, [2, 4])}</div><div class="reading-group ticket-back">${fields([6, 7])}</div><div class="ticket-barcode" aria-hidden="true"></div></div>`;
            break;
        case 'voices':
            content = `<div class="whisper-envelope"><div class="whisper-address"><span aria-hidden="true">LETTERS BETWEEN US</span>${field(0)}<div class="whisper-stamp" aria-hidden="true">✧<small>PRIVATE<br>037</small></div></div><div class="pocket-whisper">${note(2)}${note(1, [3])}${note(4)}</div><div class="whisper-fold" aria-hidden="true"><span>只写给此刻的你</span><i>W</i></div></div><div class="pocket-pager"><button type="button" data-person-prev aria-label="上一位人物">←</button><span data-person-position></span><button type="button" data-person-next aria-label="下一位人物">→</button></div>`;
            break;
        case 'telegraph':
            content = `<div class="telegraph-machine"><div class="telegraph-nameplate" aria-hidden="true"><span>RAIN PORT / TELEGRAPH</span><b>038</b></div><div class="pocket-signal-head"><div class="telegraph-meter" aria-hidden="true"><div><span>−　 SIGNAL　 ＋</span><i></i></div><small>● ━ ● ● ━</small></div><div class="pocket-meta">${fields([0, 1, 2])}</div></div><div class="telegraph-roller" aria-hidden="true"></div></div><div class="telegraph-paper">${panels([[3, 5], [4, 7]])}<div class="pocket-foot">${field(6)}</div><div class="telegraph-end" aria-hidden="true">··· ─ ─ ·　END OF MESSAGE　· ─ ─ ···</div></div>`;
            break;
        case 'perfume':
            content = `<div class="casebook"><div class="casebook-tab" aria-hidden="true">FIELD NOTES / 039 · 事件档案</div><div class="casebook-cover"><span class="casebook-number" aria-hidden="true">39</span>${field(0)}<span class="casebook-stamp" aria-hidden="true">现场手记<br>ON FILE</span></div><div class="casebook-goal"><span aria-hidden="true">01 / OBJECTIVE</span>${field(1)}</div><div class="casebook-board"><article class="casebook-evidence"><span class="paper-clip" aria-hidden="true"></span><small>02 / CLUES & OBJECTS</small>${fields([3,4])}<div class="evidence-ruler" aria-hidden="true">0　1　2　3　4　5　6　7　8</div></article><article class="casebook-memo"><small>03 / FIELD REPORT</small>${fields([2,5])}</article></div><div class="casebook-foot">${field(6)}<div class="casebook-private"><span aria-hidden="true">PRIVATE / 页边手记</span>${field(7)}</div></div></div>`;
            break;
        case 'vinyl':
            content = `<div class="radio-brand" aria-hidden="true"><span>潮汐音像 / TIDE SOUND</span><b>STEREO · 040</b></div><div class="pocket-radio"><div class="turntable-deck"><div class="pocket-disc" aria-hidden="true"><i><small>TIDE RECORDS</small><b>40</b><em>SIDE A · 33 RPM</em></i></div><div class="record-arm" aria-hidden="true"></div><span class="record-corner" aria-hidden="true">STEREO / 040</span></div><div class="radio-console"><div class="frequency-scale" aria-hidden="true"><span>88　92　96　100　104　108</span><i></i></div><div class="pocket-meta">${fields([0,1,2])}</div><div class="radio-controls"><div class="speaker-grille" aria-hidden="true"></div><span class="radio-knob" aria-hidden="true">FM</span></div></div></div><div class="radio-playlist"><div class="radio-program-head" aria-hidden="true"><span>节目手记</span><small>NOW PLAYING / SIDE A</small></div>${panels([[3], [4], [5,6], [7]])}</div>`;
            break;
        case 'train':
            content = `<div class="train-view"><div class="train-window-label" aria-hidden="true"><span>沿途行车手册</span><span>CAR 04 / SEAT 01</span></div><div class="train-landscape">${trainScenes}<div class="train-window-divider" aria-hidden="true"></div></div><div class="train-sill" aria-hidden="true"></div><span class="train-scene-caption" data-scene-caption></span></div><div class="train-log"><div class="pocket-departure"><span aria-hidden="true">SUNSET LINE<br>旅程记录 / 041</span>${fields([0,4])}</div>${panels([[1,2], [3,5,6], [7]])}</div>`;
            break;
    }
    return `${people}<div class="pocket-scene pocket-${preset.layout}">${content}</div>`;
}

export function compactRuntime(root, config, records, resolveStoryScene) {
    const all = selector => [...root.querySelectorAll(selector)];
    const keys = Object.keys(records).filter(key => /^View[1-9][0-9]*$/.test(key)).sort((a, b) => Number(a.slice(4)) - Number(b.slice(4)));
    const pages = keys.length ? keys.map((id, index) => ({
        id,
        label: records[id][config.labels.length] || (config.ensemble && records[id][0]) || config.pages.find(page => page.id === id)?.label || `角色${index + 1}`,
        labels: config.pages.find(page => page.id === id)?.labels || config.labels,
    })) : config.pages;
    const nav = root.querySelector('.pocket-people');
    let selected = 0;
    let scheduled = false;
    let lastHeight = 0;
    function syncHeight() {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
            scheduled = false;
            if (!root.getClientRects().length) return;
            const style = getComputedStyle(document.body);
            const height = Math.ceil(root.getBoundingClientRect().height + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + 2);
            if (height === lastHeight) return;
            lastHeight = height;
            try { window.parent.postMessage({ type: 'status-atelier:resize', height }, '*'); } catch {}
            try { if (window.frameElement) window.frameElement.style.height = `${height}px`; } catch {}
        });
    }
    function updateScene() {
        if (!root.querySelector('[data-window-scene]')) return;
        const value = records[pages[0].id]?.[0] || '';
        const scene = resolveStoryScene(value);
        all('[data-window-scene]').forEach(node => { node.hidden = node.dataset.windowScene !== (scene || 'dusk'); });
        root.querySelector('[data-scene-caption]').textContent = scene ? ({dawn:'清晨 · 山野薄雾',day:'白昼 · 海岸帆影',dusk:'黄昏 · 群山落日',night:'夜晚 · 城市灯火'})[scene] + ' / 跟随正文时间' : '正文时间待明确 / 黄昏示意';
        syncHeight();
    }
    function selectPerson(index) {
        selected = (index + pages.length) % pages.length;
        const page = pages[selected];
        const values = records[page.id] || [];
        all('[data-value]').forEach(node => { node.textContent = values[Number(node.dataset.value)] || '—'; });
        all('[data-label],[data-label-copy]').forEach(node => { node.textContent = page.labels[Number(node.dataset.label ?? node.dataset.labelCopy)] || ''; });
        all('[data-person-tab]').forEach(node => node.setAttribute('aria-pressed', String(Number(node.dataset.personTab) === selected)));
        const position = root.querySelector('[data-person-position]');
        if (position) position.textContent = `${selected + 1} / ${pages.length} · ${page.label}`;
        const avatar = root.querySelector('[data-st-avatar]');
        // Explicit per-person media wins; resolve host portraits by exact name.
        let url = config.ensembleAvatarUrls[selected] || (selected === 0 ? config.avatarUrl : '');
        try {
            const context = window.parent.SillyTavern?.getContext?.();
            const character = context?.characters?.find(item => item.name === page.label);
            if (!url && character?.avatar) url = context.getThumbnailUrl ? context.getThumbnailUrl('avatar', character.avatar) : '/thumbnail?type=avatar&file=' + encodeURIComponent(character.avatar);
        } catch {}
        if (url) avatar.src = url; else avatar.removeAttribute('src');
        avatar.alt = page.label;
        avatar.nextElementSibling.textContent = page.label.slice(0, 1);
        updateScene();
        syncHeight();
    }
    all('[data-design-title]').forEach(node => { node.textContent = config.title; });
    all('[data-design-subtitle]').forEach(node => { node.textContent = config.subtitle; });
    pages.forEach((page, index) => {
        const button = document.createElement('button');
        button.type = 'button'; button.dataset.personTab = String(index); button.textContent = page.label;
        button.addEventListener('click', () => selectPerson(index));
        nav.appendChild(button);
    });
    root.querySelector('[data-person-prev]')?.addEventListener('click', () => selectPerson(selected - 1));
    root.querySelector('[data-person-next]')?.addEventListener('click', () => selectPerson(selected + 1));
    const fold = root.querySelector('.sa32-fold');
    fold.addEventListener('click', () => {
        const collapsed = root.classList.toggle('is-collapsed');
        fold.setAttribute('aria-expanded', String(!collapsed));
        fold.querySelector('span').textContent = collapsed ? '展开' : '收起';
        syncHeight();
    });
    all('details').forEach(node => node.addEventListener('toggle', syncHeight));
    all('img').forEach(node => {
        node.addEventListener('load', syncHeight);
        node.addEventListener('error', () => { node.removeAttribute('src'); syncHeight(); });
    });
    selectPerson(0);
    if (window.ResizeObserver) new ResizeObserver(syncHeight).observe(root);
    window.addEventListener('resize', syncHeight);
}

// The AI extracts the current scene time from this reply's narrative into the time field.
export function resolveStoryScene(value) {
    const text = String(value || '').trim();
    const digits = {'零':0,'〇':0,'一':1,'二':2,'两':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9};
    const number = part => /^\d+$/.test(part) ? Number(part) : part.includes('十') ? (part.split('十')[0] ? digits[part.split('十')[0]] : 1) * 10 + (digits[part.split('十')[1]] || 0) : digits[part];
    const match = text.match(/(?:^|[^\d])([01]?\d|2[0-3])[:：][0-5]\d|([零〇一二两三四五六七八九十\d]{1,3})[点时]/);
    let hour = match ? number(match[1] || match[2]) : null;
    if (hour !== null && hour >= 0 && hour <= 23) {
        if (/下午|午后|晚上|夜晚|傍晚|PM/i.test(text) && hour < 12) hour += 12;
        if (/凌晨|半夜|午夜|AM/i.test(text) && hour === 12) hour = 0;
        if (/中午/.test(text) && hour < 11) hour += 12;
        return hour < 5 || hour >= 20 ? 'night' : hour < 10 ? 'dawn' : hour < 17 ? 'day' : 'dusk';
    }
    if (/黄昏|傍晚|夕阳|日落|薄暮/.test(text)) return 'dusk';
    if (/凌晨|半夜|午夜|深夜|夜|晚上/.test(text)) return 'night';
    if (/黎明|破晓|清晨|早晨|早上|拂晓/.test(text)) return 'dawn';
    if (/午|白昼|白天|上午|日间/.test(text)) return 'day';
    return null;
}

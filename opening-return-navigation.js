export function homeSwipeIndex(swipes) {
    const matches = (Array.isArray(swipes) ? swipes : []).flatMap((text, index) => String(text).trim() === '【主页】' ? [index] : []);
    return matches.length === 1 ? matches[0] : -1;
}

export async function returnToOpeningHome(ctx, messageElement, helper) {
    const message = ctx?.chat?.[0];
    const target = homeSwipeIndex(message?.swipes);
    if (target < 0) throw new Error('未找到唯一主页，请重新应用开场白主页');
    if (helper?.setChatMessages) {
        await helper.setChatMessages([{ message_id: 0, swipe_id: target }], { refresh: 'affected' });
        return;
    }
    const current = Number(message.swipe_id || 0);
    const direction = target > current ? 'right' : 'left';
    if (!ctx?.swipe?.[direction]) throw new Error('当前环境没有开场白切换接口');
    for (let i = 0; i < Math.abs(target - current); i++) {
        await ctx.swipe[direction].call(messageElement, null, { source: 'jiuyi-opening-home', message });
    }
}

export function mountOpeningReturnNavigation(getContext, enabled, doc = document) {
    let pending = 0;
    const id = 'status-atelier-return-home';
    function render() {
        pending = 0;
        const ctx = getContext();
        const target = homeSwipeIndex(ctx?.chat?.[0]?.swipes);
        const message = doc.querySelector('#chat .mes[mesid="0"]');
        const existing = doc.getElementById(id);
        if (!enabled() || !message || target < 0 || Number(ctx.chat[0].swipe_id || 0) === target) {
            existing?.remove();
            return;
        }
        if (existing && message.contains(existing)) return;
        existing?.remove();
        const button = doc.createElement('button');
        button.id = id;
        button.className = 'menu_button';
        button.textContent = '← 返回作品目录';
        button.style.cssText = 'display:block;margin:10px auto;';
        button.addEventListener('click', async () => {
            button.disabled = true;
            try { await returnToOpeningHome(getContext(), message, globalThis.TavernHelper); }
            catch (error) { button.textContent = error.message; }
            finally { button.disabled = false; }
        });
        (message.querySelector('.mes_block') || message).append(button);
    }
    const observer = new MutationObserver(() => {
        if (!pending) pending = requestAnimationFrame(render);
    });
    observer.observe(doc.querySelector('#chat') || doc.body, { childList: true, subtree: true });
    render();
    return () => { observer.disconnect(); cancelAnimationFrame(pending); doc.getElementById(id)?.remove(); };
}

// This function is serialized into the exported message iframe. It must stay self-contained.
async function portableOpeningReturn() {
    const button = document.getElementById('sta-opening-return');
    const note = document.getElementById('sta-opening-return-note');
    try {
        if (typeof getCurrentMessageId !== 'function' || getCurrentMessageId() !== 0) return;
        if (typeof getChatMessages !== 'function' || typeof setChatMessages !== 'function') {
            note.hidden = false;
            note.textContent = '返回目录需要启用酒馆助手的前端渲染。';
            return;
        }
        async function locate() {
            const rows = await getChatMessages('0', { include_swipes: true });
            const row = rows[0];
            const matches = (row?.swipes || []).flatMap((text, i) => String(text).trim() === '【主页】' ? [i] : []);
            return { row, target: matches.length === 1 ? matches[0] : -1 };
        }
        const initial = await locate();
        if (initial.target < 0 || initial.row.swipe_id === initial.target) return;
        button.hidden = false;
        button.addEventListener('click', async () => {
            button.disabled = true;
            try {
                const latest = await locate();
                if (latest.target < 0) throw new Error('未找到唯一作品目录，请检查这张卡的开场白。');
                await setChatMessages([{ message_id: 0, swipe_id: latest.target }], { refresh: 'affected' });
            } catch (error) {
                note.hidden = false;
                note.textContent = error.message || '返回失败，请重试';
            } finally { button.disabled = false; }
        });
    } catch (error) {
        note.hidden = false;
        note.textContent = error.message || '读取开场白失败';
    }
}

export function buildOpeningReturnRegex() {
    return {
        id: 'jiuyi-opening-return-portable-v1',
        scriptName: '九一 · 开场白返回作品目录',
        disabled: false, runOnEdit: true,
        findRegex: '/^(?!\\s*【主页】)/', trimStrings: [],
        replaceString: '```html\n<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;background:transparent;scrollbar-width:none}*::-webkit-scrollbar{display:none}button{display:block;margin:8px auto;padding:7px 16px;border:1px solid #9c8970;border-radius:4px;background:#f3eadb;color:#594638;font:14px/1.5 serif;cursor:pointer}[hidden]{display:none!important}p{margin:4px;font:13px/1.5 serif;color:#a54b39}</style></head><body><button id="sta-opening-return" type="button" hidden>← 返回作品目录</button><p id="sta-opening-return-note" role="status" hidden></p><script>(' + portableOpeningReturn.toString() + ')();</script></body></html>\n```\n',
        placement: [2], substituteRegex: 0, minDepth: null, maxDepth: null,
        markdownOnly: true, promptOnly: false,
    };
}

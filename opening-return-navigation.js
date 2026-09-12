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

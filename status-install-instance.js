export function createStatusInstallInstance(script, entry, token) {
    const key = String(token).replace(/[^a-zA-Z0-9]/g, '');
    if (!key) throw new Error('状态栏安装标识为空');
    const match = String(script.findRegex || '').match(/^\/?<([^>]+)>/);
    if (!match) throw new Error('无法识别状态栏输出标签，已停止安装以保护已有正则');
    const pattern = match[1];
    const tags = pattern.startsWith('(?:') ? pattern.slice(3, -1).split('|') : [pattern];
    if (tags.some(tag => !/^[\w-]+$/.test(tag))) throw new Error('状态栏输出标签无法安全区分，已停止安装');
    const tag = `sta_${key}`;
    const findRegex = script.findRegex.replaceAll(`<${pattern}>`, `<${tag}>`)
        .replaceAll(`<\\/${pattern}>`, `<\\/${tag}>`).replaceAll(`</${pattern}>`, `</${tag}>`);
    let content = String(entry.content || '');
    for (const oldTag of tags) content = content.replaceAll(`<${oldTag}>`, `<${tag}>`).replaceAll(`</${oldTag}>`, `</${tag}>`);
    if (!content.includes(`<${tag}>`)) throw new Error('世界书与正则标签不一致，已停止安装');
    const label = key.slice(-8);
    return {
        script: {...script, id:`sta-instance-${key}`, statusAtelierInstance:key, scriptName:`${script.scriptName} · ${label}`, findRegex},
        entry: {...entry, automationId:`jiuyi-wb-instance-${key}`, comment:`${entry.comment} · ${label}`, content},
    };
}

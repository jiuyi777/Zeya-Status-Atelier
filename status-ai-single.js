import { normalizeRule } from './rule-generator.js';

// A single response carries both the chosen layout and all of its preview values.
export function parseSingleStatusResult(text, candidates) {
    let data;
    try { data = JSON.parse(String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')); }
    catch { throw new Error('AI 返回的 JSON 格式不完整；本次请求已结束'); }
    const candidate = candidates.find(item => item.key === data?.candidate);
    if (!candidate) throw new Error('AI 返回了候选列表之外的模板；本次请求已结束');
    const rule = normalizeRule(candidate.input);
    const values = (items, fields, name) => {
        if (!Array.isArray(items) || items.length !== fields.length || items.some(value =>
            !['string', 'number'].includes(typeof value) || !String(value).trim())) {
            throw new Error(`AI 返回的 ${name} 字段不完整；本次请求已结束`);
        }
        return items.map(String);
    };
    if (!Array.isArray(data.pages) || data.pages.length !== rule.pages.length) throw new Error('AI 返回的页面不完整；本次请求已结束');
    const shared = values(data.shared, rule.sharedFields, '共享');
    const pages = rule.pages.map(page => {
        const matches = data.pages.filter(item => item?.id === page.id);
        if (matches.length !== 1) throw new Error(`AI 返回的 ${page.id} 页面缺失或重复；本次请求已结束`);
        return { page, values: values(matches[0].values, page.fields || rule.pageFields, page.label) };
    });
    const phoneApps = rule.structure === 'phone'
        ? values(data.phoneApps, rule.pages, '手机应用名称').map(value => value.slice(0, 20)) : [];
    return { candidate, reason: typeof data.reason === 'string' ? data.reason : '', records: { rule, shared, pages, phoneApps, raw: text } };
}

export function singleStatusCatalog(candidates) {
    return candidates.map(item => {
        const rule = normalizeRule(item.input);
        const fields = list => list.map(field => ({ label: field.label, instruction: field.instruction, kind: field.kind }));
        return { candidate: item.key, name: item.name, shared: fields(rule.sharedFields),
            pages: rule.pages.map(page => ({ id: page.id, label: page.label, fields: fields(page.fields || rule.pageFields) })),
            phoneApps: rule.structure === 'phone' ? rule.pages.map(page => page.label) : [] };
    });
}

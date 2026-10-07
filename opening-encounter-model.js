export function encounterSelection(config, value = {}) {
  const place = config.places.find(item => item.id === value.place) || config.places[0];
  const person = config.people.find(item => item.id === value.person) || config.people.find(item => place.people.includes(item.id)) || config.people[0];
  return { place: place.id, person: person.id, scope: value.scope === 'all' ? 'all' : 'nearby', note: String(value.note || '').slice(0,300), names: String(value.names||'').slice(0,100), event: Number.isInteger(value.event)?Math.abs(value.event)%3:0, action: ['approach','observe'].includes(value.action)?value.action:'', visited: !!value.visited };
}

export function encounterScene(config, value) {
 const s=encounterSelection(config,value),p=config.places.find(x=>x.id===s.place),person=config.people.find(x=>x.id===s.person);
 const names=s.names.trim()||person.name;
 const scenes=p.scenes||['一张没有署名的便笺被风卷到近处，上面竟写着小楼的地址。','两位路人争论着一则传闻，说到关键处，同时压低了声音。','有人匆匆送来一只包裹，却发现收件人的名字写得含混不清。'];
 const event=scenes[s.event];
 const follow=s.action==='approach'?'你决定上前问问。对方听见动静，抬起了头，似乎正等着有人开口。':s.action==='observe'?'你决定先看看。短暂的沉默里，四周的低语反而愈发清晰，这件事似乎另有缘由。':'';
 return {names,event,follow,text:`你来到${p.name}。${p.description}\n\n你看见了${names}。${event}${follow?'\n\n'+follow:''}`};
}

export function encounterPool(config, selection) {
  const place = config.places.find(item => item.id === selection.place);
  const nearby = config.people.filter(item => place?.people.includes(item.id));
  return selection.scope === 'all' || !nearby.length ? config.people : nearby;
}

export function encounterDraftRecord(config, value) {
  return { bookScope: config.scope, ...encounterSelection(config, value) };
}

export function randomEncounter(config, value, kind, random = Math.random) {
  const next = encounterSelection(config, value);
  const choose = (items, old) => {
    const fresh = items.filter(item => item.id !== old);
    const pool = fresh.length ? fresh : items;
    return pool[Math.min(pool.length - 1, Math.floor(Math.max(0, random()) * pool.length))];
  };
  if (kind === 'place' || kind === 'all') next.place = choose(config.places, next.place).id;
  if (kind === 'person' || kind === 'all') {next.person = choose(encounterPool(config, next), next.person).id;next.names='';}
  next.event=Math.min(2,Math.floor(Math.max(0,random())*3));next.action='';next.visited=true;
  return next;
}

export function encounterPrompt(config, value, user = '{{user}}') {
  const draft = encounterSelection(config, value);
  const place = config.places.find(item => item.id === draft.place);
  const person = config.people.find(item => item.id === draft.person);
  const scene=encounterScene(config,draft);
  return [
    '请按以下选择，为当前角色卡创作一个新的开场白，并从这里开始故事。',
    `开场地点：${place.name}。${place.description}`,
    `主要出场人物：${scene.names}。`,
    ...config.people.filter(p=>scene.names.includes(p.name)).map(p=>`${p.name}（${p.group}）：${p.description}`),
    `玩家：${user}。`,
    `开场关系：主角现在位于${place.name}，这一幕与${scene.names}相遇或同行。`,
    config.premise,
    '以当前角色卡和已绑定世界书为准，保留人物性格、已有关系及各自住处。未相识的人需自然相遇，不把所有人安排成玩家的熟人；若人物远道而来，交代合理来意和路程。',
    `地图上已发生的情境：${scene.event}`,
    scene.follow?`玩家已选择的行动：${scene.follow}`:'玩家尚未决定如何回应。',
    '从上述相遇接着写，保留玩家选定的人物、地点和事件；未知人物不要擅自赋予世界书角色身份。',
    '直接写出这一次开场正文，交代主角在哪里、与谁在一起、眼前发生什么，以场景、行动和人物对白进入剧情，约 300–500 字。留下玩家可以回应的余地，不替玩家说话、行动或决定；不要输出选项清单或制作说明。',
    draft.note ? `本次补充：${draft.note}` : '',
  ].filter(Boolean).join('\n');
}

// The same transaction is exercised by the preview harness and the Tavern adapter.
export async function submitEncounter(config, value, host) {
  if (host.busy) throw new Error('正在开始这场相遇，请稍等。');
  host.busy = true;
  try {
    const identity = host.identity();
    host.check(identity);
    if (host.messages().length !== 1) throw new Error('这段聊天已经开始了。请在新聊天中选择新的开场。');
    const draft = encounterSelection(config, value);
    const message = encounterPrompt(config, draft, host.user());
    await host.save(draft);
    host.check(identity);
    const before=host.snapshot();
    const result=await host.generate(message);
    const text=typeof result==='string'?result:result?.content;
    if(!text?.trim())throw new Error('没有收到开场正文，地图和选择已保留，可以重试。');
    host.pending=text;
    host.check(identity);
    if(host.snapshot()!==before||host.messages().length!==1)throw new Error('生成期间开场或聊天已变化，正文暂存在下方，未覆盖聊天。');
    await host.commit(text,draft);
    host.pending='';
    return { submitted: true, text };
  } finally { host.busy = false; }
}

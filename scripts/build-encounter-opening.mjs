import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { Script } from 'node:vm';
import { buildEncounterDocument, buildEncounterRegex, ENCOUNTER_MARKER } from '../opening-encounter.js';

const bookPath=process.argv[2];
if(!bookPath)throw new Error('Usage: node scripts/build-encounter-opening.mjs <worldbook.json> [output-directory]');
const out=path.resolve(process.argv[3]||'output/江湖偶遇簿-v0.3.0');
const source=await fs.readFile(bookPath,'utf8'),book=JSON.parse(source),entries=Object.values(book.entries||{}).filter(e=>!e.disable);
if(!entries.some(e=>e.comment==='小楼·四人住处'))throw new Error('This scene adapter requires the supplied 扬州小楼 worldbook.');
const people=[];
for(const entry of entries){
 const text=entry.content||'',single=text.match(/<character_information character="([^"]+)"/);
 const group=entry.comment.replace(/^(?:阵营与NPC|NPC|少年NPC|人物)·/,'');
 if(single){
  const name=single[1],line=text.match(/^\s*身份:\s*(.+)$/m)?.[1]||'';
  people.push({id:`person-${entry.uid}`,name,group:entry.uid<6?'小楼常住':({31:'听风楼',32:'惊潮岛',33:'游历江湖',34:'燕子门',35:'照夜教',36:'夜渡行'}[entry.uid]||group),description:line.replace(/<user>/g,'你').replace(/^[男女]，[^，。]*岁，/,'').split('。')[0]+'。',sourceUid:entry.uid});
 }else if(/NPC/.test(entry.comment)){
  for(const [i,m]of [...text.matchAll(/^([^\s:<>]{2,8}): \|\n([^\n]+)/gm)].entries())people.push({id:`person-${entry.uid}-${i}`,name:m[1],group,description:m[2].trim().replace(/^[男女]，[^，。]*岁，/,'').replace(/<user>/g,'你').split('。')[0]+'。',sourceUid:entry.uid});
 }
}
if(new Set(people.map(p=>p.name)).size!==people.length)throw new Error('Duplicate people need explicit resolution');
const defs=[
 ['小楼','柳桥巷尽头的一方小院。温如晦、陆临和林栀与你同住，来客会在门外递帖。',[2],[3,4,5,25,26],[40,37],[39,34],'house'],
 ['青石桥','巷口的桥边有半闲茶棚。可以喝一盏茶、听说书，也可能听到一个与自己有关的传闻。',[7],[3,4,5,27],[57,58],[61,55],'bridge'],
 ['东市','听风楼、旧书铺与商行各有门庭，消息和日常买卖在同一条街上流转。',[7],[15,27,28],[78,25],[78,20],'market'],
 ['南河埠','船只靠岸，脚行卸货。沧浪会分舵、仓房和水陆交接处都在这里。',[7],[17,19,23,32],[77,72],[80,74],'wharf'],
 ['西门演武场','门外的演武场供切磋、验兵器与选镖师，望岳镖局就在附近。',[7],[21,24,33],[18,48],[18,49],'gate'],
 ['三岔河','城外下游的水榭与画舫。夜渡行在不同岸边验货议价，去处由引路人告知。',[7],[20,36],[42,88],[38,86],'boat'],
 ['春水舫','三岔河上独立经营的曲宴画舫，闻百事以照影之名在这里迎客。',[7,31],[31,20]],
 ['温家别院','温家设在扬州西郊的别院，从城中坐车约一个时辰。',[6,7],[3]],
 ['西城小院','照夜教在扬州租下的小院，罗含章在此留信待客。',[7],[18,35]],
 ['青云山','洛城东北的青云剑派。访客通常先在山脚青溪镇落脚。',[6,8],[11]],
 ['铁衣门石堡','雁门关南半日路程的石堡，门中正为边地筹集粮药与护运支援。',[8,10],[12]],
 ['悬壶谷','青蘅岭中的医药门派，谷口药镇可留信问诊；从扬州西南远行而来。',[6,8],[13]],
 ['般若寺','洛城西南、伏牛山中的寺院，有行脚僧往来，也有人专程访友。',[6,8],[14]],
 ['藏锋山庄','洛城东南鸣铁坡上的铸兵山庄，山庄外有铁匠街和客舍。',[6,8],[16]],
 ['临潮镇','扬州顺水约两日的水运城镇，沧浪会总舵设在这里。',[6,8],[17,19,32]],
 ['石燕渡','扬州东南行一日的渡口，燕子门在这里落脚，送信与寻物的生意不歇。',[6,7],[22,34]],
 ['惊潮岛','东海埠外的岛群，要乘海船进出。人物的来去受风浪和船期影响。',[6,8],[19,32]],
 ['落霞岭','南疆月牙渡后的山岭，照夜教总坛在岭背石寨。',[6,8],[18,35]],
 ['云京','洛城以北三日的都城，六扇门总署在此，来往各有公务。',[6,8],[23]],
];
const places=defs.map(([name,description,sourceUids,personUids,map,mobile,art],i)=>({id:`place-${i}`,name,description,sourceUids,people:people.filter(p=>personUids.includes(p.sourceUid)).map(p=>p.id),...(map?{map,mobile,art}:{})}));
const sceneSets=[
 ['院门外响起两下轻叩。来人放下一张请帖，口口声声称要拜会那位隐世高人。','桌上的茶还温着，一封送错的信却写着你的名号。信封里只有半张食谱。','一只猫叼着钱袋跃上院墙，门外两拨人竟都说那是自家的。'],
 ['茶棚里有人讲起一位从不出手的高人，越说越像你。旁边的人已经转头望过来了。','一阵风将半页账单卷过桥面，追来的小贩却把它当成了什么暗号。','桥头一位卖伞人迟迟不肯收摊，说有人约好来取一把旧伞，却始终没出现。'],
 ['旧书铺把一本菜谱郑重锁进木匣，门口竟有人在争着出价。','摊贩认错了前来取货的人，将一个写着“务必轻拿”的盒子递到跟前。','一张寻物启事被人贴了又撕，旁边留着半个清晰的鞋印。'],
 ['一只刚靠岸的货船少了半筐橘子，船家却比丢了整箱银子还着急。','脚夫们为一箱会响的货物停了手，箱中传出的竟是一声猫叫。','一位船客拿着两张同名船票，站在码头上左右为难。'],
 ['演武场上忽然安静下来：一柄借来的剑不见了，留下的却是根擀面杖。','镖师们围着一张走错路的地图，谁也不肯先承认认反了方向。','一位少年抱着断成两截的木刀，在门边等了许久，似乎不敢走进去。'],
 ['水面漂来一盏没有点亮的灯，灯底系着一张约人吃面的字条。','岸边两位接头人对不上暗号，却都坚持自己没有找错地方。','画舫上的曲子忽然停了，有人从窗里探出头，找一位从未见过的客人。']
];
places.forEach((p,i)=>{if(sceneSets[i])p.scenes=sceneSets[i];});
const config={version:'0.3.0',mapUrl:process.env.ENCOUNTER_MAP_URL||'https://raw.githubusercontent.com/jiuyi777/Zeya-Status-Atelier/f5f3093f7c8013fce0cfc29266b34040b2cf1a78/assets/opening-encounter/yangzhou-flat-map-v3.webp',scope:crypto.createHash('sha256').update(source).digest('hex').slice(0,12),bookName:book.originalData?.name||'其实真的什么都不知道啊！',premise:'本作是架空梁朝的武侠误会喜剧。玩家是扬州小楼的老板，毫无武功，也不知道未接触的江湖秘密；江湖人误以为玩家是高手。小楼常住者只有玩家、温如晦、陆临、林栀。误会不赋予玩家真功夫或全知。',places,people};
const rule=buildEncounterRegex(config),json=JSON.stringify(rule,null,2);
const html=buildEncounterDocument(config,{preview:true,installJson:json});
for(const doc of [html,rule.replaceString])for(const m of doc.matchAll(/<script>([\s\S]*?)<\/script>/g))new Script(m[1]);
if(!rule.replaceString.includes('<body>')||!rule.replaceString.includes('</body>'))throw new Error('Incomplete HTML document');
await fs.mkdir(out,{recursive:true});
await fs.writeFile(path.join(out,'config.json'),JSON.stringify(config,null,2));
await fs.writeFile(path.join(out,'index.html'),html);
await fs.writeFile(path.join(out,'酒馆内页面.html'),buildEncounterDocument(config));
await fs.writeFile(path.join(out,'开场白标记.txt'),ENCOUNTER_MARKER+'\n');
await fs.writeFile(path.join(out,'component-spec.json'),JSON.stringify({schemaVersion:1,deliveryMode:'component',kind:'regex',items:[{artifactName:'jianghu-encounter',value:rule}]},null,2));
await fs.writeFile(path.join(out,'使用说明.md'),`# 江湖偶遇簿 · v0.3.0

点地图地点进入场景，点击人物圆点或随机遇见，也可以输入多个人名。见闻会立即显示，选择“上前问问”或“先看看”可推进这次相遇。点击“就从这里开始”，酒馆模型会根据当前情境生成开场正文，保存在当前聊天首楼的新开场页，并自动切到正文；原有开场页仍保留。

配合原世界书、角色卡及酒馆助手 HTML 渲染使用。停用旧的同名正则后，导入新版局部正则。额外开场白填写：${ENCOUNTER_MARKER}。

使用当前酒馆模型和预设。不会把提示词发成一条玩家聊天消息。开始故事前需连接模型；生成失败保留地图。切换聊天、首楼或新增消息时，生成结果不会覆盖新的内容。

地图是独立的压缩 WebP 图片，不嵌入角色卡。${config.mapUrl?'图片链接：'+config.mapUrl:'图床链接待接入；当前仅本地预览可显示底图，导入包暂不交付。'}

预览中的相遇片段由本地事件生成，用于试玩交互；完整 AI 开场在酒馆内生成。地图为原创虚构城镇，城外地点使用场景代表图，不作为实测地理位置。
`);
console.log(JSON.stringify({out,places:places.length,people:people.length,regexBytes:Buffer.byteLength(json),sourcePreserved:true}));

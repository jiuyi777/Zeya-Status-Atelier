import { mkdir, writeFile, cp } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PORTRAIT_FREE_PRESETS, buildPortraitFreePreview } from '../status-portrait-free.js';
import { buildRegexScript, buildWorldbookJson, parseStatusOutput } from '../rule-generator.js';

const output = resolve(process.argv[2] || 'outputs/portrait-free');
await mkdir(output, { recursive: true });
const source = fileURLToPath(new URL('../status-portrait-free/', import.meta.url));
await cp(resolve(source, 'fonts'), resolve(output, 'release-assets/fonts'), { recursive: true });
await cp(resolve(source, 'assets'), resolve(output, 'release-assets/assets'), { recursive: true });
const demo = [
  ['林赛','旧港书店的晚班店员','初夏 · 晚上十点四十分','暮雨书店二楼 · 临街旧窗边','米白针织衫、深色长裙，袖口还留着细小的雨痕。','有些疲倦。捧住茶杯时，紧绷的肩背慢慢松下来。','将未读完的书合上，把一张旧车票轻轻夹进书页。','渐渐靠近','72','他留下最后一盏灯，也没有催促她离开。','我想再多待一会儿。等雨停，或者，等他问我明天还来不来。','把这本书带回去。下次见面时，还书，也把没说完的话说完。'],
  ['艾登','暂住旧港的旅行者','初夏 · 晚上十点四十分','暮雨书店二楼 · 靠近楼梯的书架','深蓝衬衫卷起袖口，外套搭在椅背上。','情绪平稳，留意窗边的人是否觉得冷。','关掉走廊的灯，把干毛巾放在茶杯旁边。','愿意等候','68','她没有急着告别，让这一晚多了一点余地。','雨已经小了。我还没想好，能不能用明天的天气当作再见面的理由。','等她读完这一页，再送她去末班车站。'],
];
for (const preset of PORTRAIT_FREE_PRESETS) {
  const input = { structure:preset.id, title:preset.title, subtitle:preset.subtitle, tagName:'portrait_status',
    pagesText:preset.pagesText, sharedFieldsText:'', pageFieldsText:preset.fields.map(field=>field.join('|')).join('\n') };
  const raw = `<portrait_status>\n${demo.map((values,i)=>`[View${i+1}|${[...values,values[0]].join('|')}]`).join('\n')}\n</portrait_status>`;
  const parsed = parseStatusOutput(input, raw);
  const regex = buildRegexScript(input);
  const pattern = new RegExp(regex.findRegex.slice(1,regex.findRegex.lastIndexOf('/')),'i');
  const exported = raw.replace(pattern,regex.replaceString).replace(/^```html\s*/, '').replace(/\s*```$/, '')
    .replaceAll('https://raw.githubusercontent.com/jiuyi777/Zeya-Status-Atelier/v0.11.37/status-portrait-free/', './release-assets/');
  await writeFile(resolve(output,`release-${preset.template}.html`),exported);
  await writeFile(resolve(output,`preview-${preset.template}.html`),buildPortraitFreePreview(parsed.rule, parsed.pages, {assetBase:'./release-assets/'}));
  await writeFile(resolve(output,`release-${preset.template}.json`),JSON.stringify(regex,null,2));
  await writeFile(resolve(output,`worldbook-${preset.template}.json`),JSON.stringify(buildWorldbookJson(input),null,2));
  console.log(`${preset.title}: ${Buffer.byteLength(regex.replaceString)} bytes; preview, exported HTML, regex and worldbook written`);
}

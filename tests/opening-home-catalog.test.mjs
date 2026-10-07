import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { Script } from 'node:vm';
import { HOME_TEMPLATES, LEGACY_HOME_TEMPLATES, openingPreviewHref } from '../opening-home-catalog.js';
import { buildOpeningHomePreviewDocument, buildOpeningHomeRegex, normalizeOpeningHomeSettings } from '../opening-home-generator.js';
import { createOpeningTemplate, parseOpeningTemplate } from '../opening-template-package.js';
import { buildBloomPage } from '../opening-bloom-letter.js';

test('the full catalog preserves all 12 early and 13 later designs with working preview targets',()=>{
 assert.equal(HOME_TEMPLATES.length,25);assert.equal(LEGACY_HOME_TEMPLATES.length,12);
 assert.equal(new Set(HOME_TEMPLATES.map(t=>t.id)).size,25);
 const later=HOME_TEMPLATES.filter(t=>!LEGACY_HOME_TEMPLATES.includes(t));
 assert.deepEqual(later.map(t=>Number(t.name.match(/^\d+/)?.[0])),Array.from({length:13},(_,i)=>i+14));
 for(const t of HOME_TEMPLATES){
  assert.equal(normalizeOpeningHomeSettings(t.values).theme,t.id);
  assert.equal(parseOpeningTemplate(createOpeningTemplate(t.values,t.name)).appearance.theme,t.id);
  const route=openingPreviewHref(t.id).split('?')[0];
  assert.ok(existsSync(new URL('../'+route,import.meta.url)),route);
  const settings={...t.values,title:'目录回归样本',intro:'作品简介',entries:[{title:'开场一',summary:'第一段故事',target:1}]};
  const preview=buildOpeningHomePreviewDocument(settings),output=buildOpeningHomeRegex(settings).replaceString;
  assert.ok(preview.includes('目录回归样本'),t.id);
  assert.match(output,/^```html\n<!DOCTYPE html>/i);assert.match(output,/<body>[\s\S]*<\/body>/);
  for(const html of [preview,output])for(const match of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))assert.doesNotThrow(()=>new Script(match[1]),t.id);
 }
 assert.throws(()=>openingPreviewHref('unknown'));
});
test('workbench and gallery use the same catalog and approved letter art reaches preview and export',()=>{
 for(const file of ['index.js','opening-template-gallery.js'])assert.match(readFileSync(new URL('../'+file,import.meta.url),'utf8'),/import \{[^}]*HOME_TEMPLATES[^}]*\} from '.\/opening-home-catalog/);
 const candidate=buildBloomPage({},'home',{preview:true,artVariant:'pencil'});
 assert.match(candidate,/letter-pencil-blush-v2.webp/);assert.match(candidate,/bloom-pencil/);assert.match(candidate,/data-bloom-interaction/);
 assert.match(buildBloomPage(),/https:\/\/raw.githubusercontent.com\/[^" ]+letter-pencil-blush-v2.webp/);
 assert.match(buildBloomPage({},'home',{artVariant:'pencil'}),/letter-pencil-blush-v2/);
 for(const theme of ['classical','scroll','collage','glass']){const exported=buildOpeningHomeRegex({theme}).replaceString;assert.doesNotMatch(exported,/file:\/\/|http:\/\/(?:localhost|127\.0\.0\.1)/);assert.match(exported,/https:\/\/raw.githubusercontent.com\/jiuyi777\/Zeya-Status-Atelier\/v0.11.41\/assets\//);}
});

import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

test('shared portrait runtimes respect none, character and explicit URL sources', async () => {
    for (const file of ['status-beauty-05-09.js','status-beauty-16-20.js','status-beauty-32-41.js']) {
        const source = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
        const start = source.indexOf(file.includes('32-41') ? 'var avatar=((' : 'var avatar=config.photoUrl;');
        const end = source.indexOf("image.removeAttribute('src');});});", start) + "image.removeAttribute('src');});});".length;
        assert.ok(start >= 0 && end > start, file);
        for (const [avatarSource, url, expected] of [['none','stale.png',''],['character','','host.png'],['url','custom.png','custom.png'],['url','','']]) {
            const image = {src:'old.png',addEventListener(){},removeAttribute(){this.src='';}};
            vm.runInNewContext(source.slice(start,end), {
                config:{avatarSource,photoUrl:url,avatarUrl:url,ensembleAvatarUrls:[]},
                character:{avatar:'character.png'},ctx:{getThumbnailUrl:()=> 'host.png'},thumb:()=> 'host.png',
                root:{querySelectorAll:()=>[image]},
            });
            assert.equal(image.src,expected,`${file}: ${avatarSource}`);
            assert.equal(image.hidden,!expected,`${file}: visibility`);
        }
    }
});

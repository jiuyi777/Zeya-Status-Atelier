import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRegexScript, PHONE_SHELL_STYLES } from '../rule-generator.js';

test('interactive status exports include the complete iframe document', () => {
    const inputs = [
        ...PHONE_SHELL_STYLES.map(shellStyle => ({ structure: 'phone', phoneDesktop: { shellStyle } })),
        ...['custom', 'profile', 'chat', 'quest'].map(structure => ({ structure })),
    ];
    for (const input of inputs) {
        const rule = JSON.parse(JSON.stringify(buildRegexScript(input)));
        const html = rule.replaceString;
        assert.ok(/^```html\s*<!doctype html>/i.test(html), JSON.stringify(input));
        assert.ok(/<meta charset="UTF-8">/i.test(html));
        assert.equal((html.match(/<body>/gi) || []).length, 1);
        assert.equal((html.match(/<\/body>/gi) || []).length, 1);
        assert.ok(/<\/body>\s*<\/html>\s*```$/.test(html));
        for (const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
            assert.doesNotThrow(() => new Function(script[1]));
        }
    }
});

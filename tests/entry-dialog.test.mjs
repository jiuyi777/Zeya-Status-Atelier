import test from 'node:test';
import assert from 'node:assert/strict';

import {
    ENTRY_DIALOG_PAGE_SIZE,
    entryDialogBindingKey,
    mountAndShowEntryDialog,
    paginateEntryDialogEntries,
} from '../entry-dialog.js';

test('moves the UID dialog out of a hidden drawer before making the page modal', () => {
    const calls = [];
    let closeEventReceived = false;
    const hiddenDrawer = { style: { display: 'none' } };
    const body = {
        append(node) {
            calls.push('append-to-body');
            node.parentElement = this;
        },
    };
    const dialog = new EventTarget();
    dialog.open = false;
    dialog.parentElement = hiddenDrawer;
    dialog.showModal = function showModal() {
        assert.equal(this.parentElement, body, 'showModal must not run under the hidden drawer');
        calls.push('show-modal');
        this.open = true;
    };
    dialog.addEventListener('close-request', () => { closeEventReceived = true; });

    mountAndShowEntryDialog(dialog, body);

    assert.deepEqual(calls, ['append-to-body', 'show-modal']);
    assert.equal(dialog.parentElement, body);
    assert.equal(dialog.open, true);
    dialog.dispatchEvent(new Event('close-request'));
    assert.equal(closeEventReceived, true, 'moving the existing dialog node must preserve its listeners');
});

test('paginates a huge worldbook and keeps existing bindings first and searchable', () => {
    const book = '超大世界书';
    const entries = Array.from({ length: 5000 }, (_, uid) => ({ uid, comment: `条目 ${uid}` }));
    const selectedKeys = new Set([entryDialogBindingKey(book, 4999)]);

    const firstPage = paginateEntryDialogEntries(entries, { book, selectedKeys });
    assert.equal(firstPage.total, 5000);
    assert.equal(firstPage.items.length, ENTRY_DIALOG_PAGE_SIZE);
    assert.equal(firstPage.items[0].uid, 4999);
    assert.equal(firstPage.items[0].selected, true);
    assert.ok(firstPage.pageCount > 1);

    const byUid = paginateEntryDialogEntries(entries, { book, selectedKeys, query: 'UID 4999' });
    assert.equal(byUid.total, 1);
    assert.equal(byUid.items[0].uid, 4999);
    assert.equal(byUid.items[0].selected, true);

    const byTitle = paginateEntryDialogEntries(entries, { book, selectedKeys, query: '条目 4321' });
    assert.equal(byTitle.total, 1);
    assert.equal(byTitle.items[0].uid, 4321);
});

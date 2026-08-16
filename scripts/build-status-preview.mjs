import { copyFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'slider-design-study.html');
const output = join(root, 'status-atelier-status-preview.html');

await copyFile(source, output);
console.log(output);

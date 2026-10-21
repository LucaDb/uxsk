import { build } from 'esbuild';
import { copyFile, mkdir, rm } from 'node:fs/promises';

const dist = new URL('../dist/', import.meta.url);
const output = new URL('extension/', dist);
const source = new URL('../src/extension/', import.meta.url);
await rm(dist, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await build({ entryPoints: [new URL('background.ts', source).pathname], outfile: new URL('uisk.js', output).pathname, bundle: true, platform: 'browser', target: 'chrome120', format: 'iife' });
for (const file of ['manifest.json']) {
  await copyFile(new URL(file, source), new URL(file, output));
}
await mkdir(new URL('icons/', output), { recursive: true });
for (const file of ['icon16.png', 'icon32.png', 'icon48.png', 'icon128.png']) {
  await copyFile(new URL(`icons/${file}`, source), new URL(`icons/${file}`, output));
}

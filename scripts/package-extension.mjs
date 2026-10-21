import { spawnSync } from 'node:child_process';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const extensionDir = join(root, 'dist', 'extension');
const manifest = JSON.parse(await readFile(join(extensionDir, 'manifest.json'), 'utf8'));

if (manifest.manifest_version !== 3 || !manifest.name || !manifest.version) {
  throw new Error('The built extension manifest is missing required release metadata.');
}

const packagedPaths = [
  manifest.background?.service_worker,
  ...Object.values(manifest.icons ?? {}),
  ...Object.values(manifest.action?.default_icon ?? {})
].filter((path) => typeof path === 'string');

for (const path of packagedPaths) {
  await readFile(join(extensionDir, path));
}

const artifactDir = join(root, 'artifacts');
const archive = resolve(artifactDir, `uisk-v${manifest.version}.zip`);
await mkdir(artifactDir, { recursive: true });
await rm(archive, { force: true });

const result = spawnSync('zip', ['-q', '-X', '-r', archive, '.'], {
  cwd: extensionDir,
  stdio: 'inherit'
});

if (result.error) throw result.error;
if (result.status !== 0) throw new Error(`zip exited with status ${result.status}`);

console.log(`Packaged ${manifest.name} ${manifest.version}: ${archive}`);

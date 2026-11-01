import {cpSync, readFileSync, rmSync, writeFileSync} from 'node:fs';

// Only Firefox runs source/background.ts: Chrome ignores background.scripts in Manifest V3 but flags it as an error,
// so the build splits distribution/ into a Chrome package without it and distribution-firefox/ with it.
const firefox = 'distribution-firefox';

rmSync(firefox, {recursive: true, force: true});
cpSync('distribution', firefox, {recursive: true});
rmSync('distribution/background.js');

const manifest = JSON.parse(readFileSync(`${firefox}/manifest.json`, 'utf8')) as Record<string, unknown>;
manifest.background = {scripts: ['background.js']};
writeFileSync(`${firefox}/manifest.json`, `${JSON.stringify(manifest, null, '\t')}\n`);

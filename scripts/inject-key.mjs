import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const path = 'js/app.js';
const token = '__ARCA_OPENROUTER_KEY__';
const key = process.env.OPENROUTER_KEY || '';

if (!existsSync(path)) {
  console.log('inject-key: app.js not found, skipping');
  process.exit(0);
}

let src = readFileSync(path, 'utf8');
if (src.includes(token)) {
  writeFileSync(path, src.split(token).join(key));
  console.log('inject-key: OPENROUTER_KEY injected (' + (key ? 'present' : 'empty') + ')');
} else {
  console.log('inject-key: token not found, no change');
}

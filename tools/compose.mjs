// ============================================
// CARD COMPOSITOR  (offline / build-time)
// ============================================
// Wraps each generated illustration (tools/art/<provider>/<id>.png) in the
// game's stone/parchment SVG frame and writes a self-contained card SVG (art
// embedded as base64) to tools/out/<id>.svg — zero runtime deps; the game can
// render the SVG directly.
//
//   node tools/compose.mjs --provider openai
//
// Cards missing their art PNG are skipped (logged), so you can compose whatever
// has been generated so far.

import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CARDS } from './cards.config.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(
  process.argv.slice(2).flatMap((a, i, arr) =>
    a.startsWith('--') ? [[a.slice(2), arr[i + 1]?.startsWith('--') || arr[i + 1] === undefined ? true : arr[i + 1]]] : [])
);
const provider = args.provider || 'openai';
const artDir = join(HERE, 'art', provider);
const outDir = join(HERE, 'out');

const exists = (p) => access(p).then(() => true, () => false);

function frameSVG(card, artHref) {
  const corners = [[30, 30], [330, 30], [30, 474], [330, 474]]
    .map(([x, y]) => `<g transform="translate(${x},${y})"><circle r="4" fill="#d4af37"/><circle r="8" fill="none" stroke="#c9a961" stroke-width="1" opacity="0.6"/></g>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 504" font-family="Georgia, 'Times New Roman', serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241c14"/><stop offset="1" stop-color="#140f0a"/></linearGradient>
    <radialGradient id="vig" cx="0.5" cy="0.42" r="0.7"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.4"/></radialGradient>
    <clipPath id="panel"><rect x="46" y="92" width="268" height="300" rx="8"/></clipPath>
  </defs>
  <rect x="6" y="6" width="348" height="492" rx="18" fill="url(#bg)" stroke="#3d2817" stroke-width="10"/>
  <rect x="14" y="14" width="332" height="476" rx="13" fill="none" stroke="${card.accent}" stroke-width="1.5" opacity="0.85"/>
  <rect x="18" y="18" width="324" height="468" rx="11" fill="none" stroke="#c9a961" stroke-width="2"/>
  ${corners}
  <rect x="34" y="34" width="292" height="40" rx="6" fill="#2c2416" stroke="#c9a961" stroke-width="1.2"/>
  <text x="180" y="60" text-anchor="middle" fill="#e8c878" font-size="20" font-weight="700" letter-spacing="1.5">${card.name}</text>
  <!-- generated art clipped into the panel -->
  <g clip-path="url(#panel)">
    <rect x="46" y="92" width="268" height="300" fill="#f1e2c9"/>
    <image href="${artHref}" x="46" y="92" width="268" height="300" preserveAspectRatio="xMidYMid slice"/>
    <rect x="46" y="92" width="268" height="300" fill="url(#vig)"/>
  </g>
  <rect x="46" y="92" width="268" height="300" rx="8" fill="none" stroke="#7a5c38" stroke-width="2"/>
  <g transform="translate(58,104)"><circle r="23" fill="#1a1410" stroke="${card.accent}" stroke-width="2.5"/>
    <text x="0" y="-1" text-anchor="middle" fill="#f1e2c9" font-size="22" font-weight="700">${card.value}</text>
    <text x="0" y="16" text-anchor="middle" fill="${card.accent}" font-size="14">${card.suit}</text></g>
  <rect x="100" y="402" width="160" height="26" rx="13" fill="${card.accent}" opacity="0.92"/>
  <text x="180" y="420" text-anchor="middle" fill="#1a1410" font-size="13" font-weight="700" letter-spacing="2">${card.type}</text>
  <text x="180" y="456" text-anchor="middle" fill="#cbb892" font-size="12" font-style="italic">${card.flavor}</text>
</svg>`;
}

(async () => {
  await mkdir(outDir, { recursive: true });
  let done = 0;
  for (const card of CARDS) {
    const art = join(artDir, `${card.id}.png`);
    if (!(await exists(art))) { console.log(`· skip ${card.id} (no art at ${art})`); continue; }
    const b64 = (await readFile(art)).toString('base64');
    const svg = frameSVG(card, `data:image/png;base64,${b64}`);
    await writeFile(join(outDir, `${card.id}.svg`), svg);
    console.log(`✓ ${card.id}.svg`);
    done++;
  }
  console.log(`composed ${done} card(s) -> ${outDir}`);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });

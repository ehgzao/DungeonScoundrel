// ============================================
// CARD ART OPTIMIZER  (offline / build-time)
// ============================================
// Resizes + compresses the raw 1024px PNGs (tools/art/<provider>/) into
// web-ready WebP under public/assets/cards/adventure/. Uses headless Chromium's
// canvas (no sharp/imagemagick dependency).
//
//   node tools/optimize.mjs --provider gemini [--size 640] [--q 0.82]

import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
// Resolve playwright flexibly: bare specifier for users who `npm i -D playwright`,
// or an absolute path via PLAYWRIGHT_MODULE for non-local node_modules.
const _pw = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const chromium = _pw.chromium || _pw.default?.chromium;

const HERE = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(
  process.argv.slice(2).flatMap((a, i, arr) =>
    a.startsWith('--') ? [[a.slice(2), arr[i + 1]?.startsWith('--') || arr[i + 1] === undefined ? true : arr[i + 1]]] : [])
);
const provider = args.provider || 'gemini';
const SIZE = +(args.size || 640);
const Q = +(args.q || 0.82);
const srcDir = join(HERE, 'art', provider);
const outDir = join(HERE, '..', 'public', 'assets', 'cards', 'adventure');

(async () => {
  await mkdir(outDir, { recursive: true });
  const files = (await readdir(srcDir)).filter((f) => f.endsWith('.png'));
  const b = await chromium.launch();
  const p = await b.newPage();
  let totalIn = 0, totalOut = 0;
  for (const f of files) {
    const id = f.replace(/\.png$/, '');
    const buf = await readFile(join(srcDir, f));
    totalIn += buf.length;
    const dataUrl = `data:image/png;base64,${buf.toString('base64')}`;
    const webpB64 = await p.evaluate(async ({ dataUrl, SIZE, Q }) => {
      const img = new Image();
      img.src = dataUrl;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = SIZE; c.height = SIZE;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      return c.toDataURL('image/webp', Q).split(',')[1];
    }, { dataUrl, SIZE, Q });
    const out = Buffer.from(webpB64, 'base64');
    totalOut += out.length;
    await writeFile(join(outDir, `${id}.webp`), out);
    console.log(`✓ ${id}.webp  ${(buf.length / 1024 / 1024).toFixed(1)}MB -> ${(out.length / 1024).toFixed(0)}KB`);
  }
  await b.close();
  console.log(`done: ${files.length} cards, ${(totalIn / 1048576).toFixed(0)}MB -> ${(totalOut / 1048576).toFixed(1)}MB  -> ${outDir}`);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });

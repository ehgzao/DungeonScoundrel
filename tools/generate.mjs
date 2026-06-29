// ============================================
// CARD ART GENERATOR  (offline / build-time)
// ============================================
// Generates the central illustration for each card via OpenAI or Gemini, saving
// raw PNGs to tools/art/<id>.png. Keys come from env — NEVER commit them and
// NEVER ship this in the static site.
//
//   OPENAI_API_KEY=sk-...     node tools/generate.mjs --provider openai
//   GEMINI_API_KEY=...        node tools/generate.mjs --provider gemini
//   node tools/generate.mjs --provider openai --dry-run   # writes prompts only
//
// Model ids are overridable (APIs change): OPENAI_IMAGE_MODEL, GEMINI_IMAGE_MODEL.
// Node 18+ (global fetch). No npm deps.

import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CARDS, promptFor } from './cards.config.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(
  process.argv.slice(2).flatMap((a, i, arr) =>
    a.startsWith('--') ? [[a.slice(2), arr[i + 1]?.startsWith('--') || arr[i + 1] === undefined ? true : arr[i + 1]]] : [])
);
const provider = args.provider || 'openai';
const dryRun = !!args['dry-run'];
const outDir = join(HERE, args.out || 'art', provider);

const OPENAI_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const GEMINI_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';

async function genOpenAI(prompt) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not set');
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      prompt,
      size: '1024x1024',
      quality: 'medium',
      background: 'transparent',
      n: 1,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error('OpenAI: no image in response');
  return Buffer.from(b64, 'base64');
}

// refBuf (optional): a previously generated card image used as a STYLE anchor so
// the whole deck shares one palette/lighting/framing — gemini-2.5-flash-image
// accepts image parts as references. This is the deck-consistency mechanism.
async function genGemini(prompt, refBuf) {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
  const parts = [];
  if (refBuf) {
    parts.push({ text: 'Use the attached image as the exact style reference — match its palette, lighting, ink/woodcut rendering, framing and scale. Keep the SAME treatment, only change the subject.' });
    parts.push({ inlineData: { mimeType: 'image/png', data: refBuf.toString('base64') } });
  }
  parts.push({ text: prompt });
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }] }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const rparts = json.candidates?.[0]?.content?.parts || [];
  const img = rparts.find((p) => p.inlineData?.data);
  if (!img) throw new Error('Gemini: no inlineData image in response (model may not be an image model)');
  return Buffer.from(img.inlineData.data, 'base64');
}

const gen = provider === 'gemini' ? genGemini : genOpenAI;

(async () => {
  await mkdir(outDir, { recursive: true });
  console.log(`provider=${provider} model=${provider === 'gemini' ? GEMINI_MODEL : OPENAI_MODEL} dryRun=${dryRun}`);

  // Style anchor for deck consistency (Gemini only). --ref <path> locks every
  // card to one approved image; otherwise the first generated card becomes the
  // anchor for the rest.
  let anchor = null;
  if (args.ref && !dryRun) {
    anchor = await readFile(args.ref);
    console.log(`style anchor: ${args.ref}`);
  }

  const skipExisting = !!args['skip-existing'];
  const noAnchor = !!args['no-anchor'];
  // --match a,b,c : only process card ids containing one of the substrings.
  const matches = typeof args.match === 'string' ? args.match.split(',').map(s => s.trim()).filter(Boolean) : null;
  if (noAnchor) anchor = null;
  for (const card of CARDS) {
    if (matches && !matches.some(m => card.id.includes(m))) continue;
    const prompt = promptFor(card);
    if (dryRun) {
      await writeFile(join(outDir, `${card.id}.prompt.txt`), prompt);
      console.log(`· [dry] ${card.id} -> prompt written`);
      continue;
    }
    const target = join(outDir, `${card.id}.png`);
    if (skipExisting && await access(target).then(() => true, () => false)) {
      console.log(`· skip ${card.id} (exists)`);
      if (!noAnchor && !anchor && provider === 'gemini') anchor = await readFile(target);
      continue;
    }
    try {
      const buf = await gen(prompt, anchor);
      await writeFile(join(outDir, `${card.id}.png`), buf);
      console.log(`✓ ${card.id} (${(buf.length / 1024).toFixed(0)}KB)${anchor ? ' [anchored]' : ' [no-anchor]'}`);
      // First successful Gemini card becomes the anchor for the rest (unless --no-anchor).
      if (!noAnchor && !anchor && provider === 'gemini') anchor = buf;
    } catch (e) {
      console.error(`✗ ${card.id}: ${e.message}`);
    }
  }
  console.log(`done -> ${outDir}`);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });

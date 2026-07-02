/**
 * Minimal end-to-end smoke test — the highest-cost failure class here is
 * "the page loads but a script in the hand-maintained load order broke",
 * which no unit test would catch. This drives the REAL flow headlessly:
 *   load → menu → new game → class select → first action, in BOTH modes,
 * with zero console errors / page errors as the bar.
 *
 * Run locally:  node tests/smoke.mjs
 * CI:           .github/workflows/smoke.yml
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const PORT = 8931;

// Playwright: node_modules in CI, global install in the dev sandbox.
let pw;
try { pw = await import('playwright'); }
catch { pw = await import('/opt/node22/lib/node_modules/playwright/index.js'); }
const chromium = pw.chromium || pw.default?.chromium;

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  // Path-traversal guard: resolve against ROOT and refuse anything that
  // escapes it (local test server, but no reason to ship the anti-pattern).
  const file = path.resolve(ROOT, '.' + path.posix.normalize(p));
  if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});
await new Promise((r) => server.listen(PORT, r));

const browser = await chromium.launch();
let failures = 0;
const check = (name, cond, extra = '') => {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${cond ? '' : ' ' + extra}`);
  if (!cond) failures++;
};

async function run(mode) {
  console.log(`\n[smoke] ${mode}`);
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  // External services (Firebase, fonts) are unreachable in CI — not errors we own.
  const IGNORE = /ERR_CONNECTION|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED|net::/;
  page.on('console', (m) => { if (m.type() === 'error' && !IGNORE.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e.message)));

  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    localStorage.setItem('dungeon_scoundrel_adventure_intro_seen', '1');
    localStorage.setItem('dungeon_scoundrel_tutorial_completed', 'true');
  });

  check('menu visible', await page.isVisible(mode === 'adventure' ? '#btnStartAdventure' : '#btnStartClassic'));
  await page.click(mode === 'adventure' ? '#btnStartAdventure' : '#btnStartClassic');
  await page.waitForTimeout(300);
  await page.fill('#playerNameInput', 'Smoke');
  await page.click('#btnStartGameModal');
  await page.waitForTimeout(300);
  await page.click('.class-card[data-class="scoundrel"]');
  await page.waitForTimeout(200);
  await page.click('#btnConfirmClass');
  await page.waitForTimeout(1500);

  if (mode === 'classic') {
    check('game started', await page.evaluate(() => window.game && window.game.dungeon.length > 0));
    await page.click('#btnDrawRoom');
    await page.waitForTimeout(600);
    check('room drawn (4 cards)', await page.evaluate(() => document.querySelectorAll('#room .card').length === 4));
    // Play one card end-to-end (whatever it is — the click path must not throw)
    await page.click('#room .card');
    await page.waitForTimeout(600);
    check('card resolved', await page.evaluate(() => document.querySelectorAll('#room .card').length <= 3));
  } else {
    check('map open', await page.evaluate(() => !!document.querySelector('#adventureMapModal.active')));
    check('has reachable nodes', await page.evaluate(() => document.querySelectorAll('.adv-node.adv-reachable').length > 0));
    await page.click('.adv-node.adv-reachable'); // row 0 is always combat
    await page.waitForTimeout(1200);
    check('combat hand dealt', await page.evaluate(() => document.querySelectorAll('#room .card').length > 0));
  }

  check('zero page errors', errors.length === 0, errors.join(' | ').slice(0, 500));
  await ctx.close();
}

// Layout invariant: the hero-select grid (a mandatory step) must show all six
// heroes without scrolling — it silently overflowed at laptop/zoomed viewports
// for two releases because functional clicks pass even on a clipped screen.
async function heroSelectFits(viewport) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  await page.evaluate(() => localStorage.setItem('dungeon_scoundrel_tutorial_completed', 'true'));
  await page.click('#btnStartClassic');
  await page.waitForTimeout(300);
  await page.fill('#playerNameInput', 'Smoke');
  await page.click('#btnStartGameModal');
  await page.waitForTimeout(400);
  const r = await page.evaluate(() => {
    const mc = document.querySelector('#classSelectionModal .modal-content');
    const mb = mc.getBoundingClientRect();
    const cards = [...document.querySelectorAll('.class-card')];
    return {
      noScroll: mc.scrollHeight <= mc.clientHeight + 4,
      allInside: cards.every(c => { const b = c.getBoundingClientRect(); return b.bottom <= mb.bottom + 2 && b.top >= mb.top - 2; }),
      count: cards.length,
    };
  });
  check(`hero select fits ${viewport.width}x${viewport.height}`, r.noScroll && r.allInside && r.count === 6, JSON.stringify(r));
  await ctx.close();
}

await run('classic');
await run('adventure');
console.log('\n[smoke] layout');
await heroSelectFits({ width: 1280, height: 800 });
await heroSelectFits({ width: 1100, height: 640 });

await browser.close();
server.close();
console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll smoke checks passed');
process.exit(failures ? 1 : 0);

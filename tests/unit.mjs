/**
 * Table-driven unit tests for the PURE game math — the code the smoke test
 * exercises but never asserts on (a damage/gold/pricing regression passes a
 * "doesn't throw" click-through). Node has no browser globals, so the
 * browser-facing modules get minimal stubs before import.
 *
 * Run: node tests/unit.mjs   (wired into the smoke CI workflow)
 */

// ---- browser stubs (modules assign window.* at import time) ----
globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
globalThis.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener: () => {}, createElement: () => ({ style: {}, classList: { add() {}, remove() {} } }), body: { classList: { add() {}, remove() {}, toggle() {} } } };
try { globalThis.navigator = { userAgent: 'node' }; } catch (_) { /* Node >=21 defines a getter-only navigator — fine as-is */ }

// Import with the SAME ?v= the modules use among themselves — a bare
// specifier here resolves to a different URL and loads a SECOND instance
// of game-state (the split-brain the bump script guards against; this test
// tripped it on its first run).
const { readFileSync } = await import('node:fs');
const V = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
const { game, ascensionEffects, seedRunRng, runRand } = await import(`../public/src/js/modules/game-state.js?v=${V}`);
const { shopDiscount, discountedPrice } = await import(`../public/src/js/modules/game-economy.js?v=${V}`);

let failures = 0;
const check = (name, actual, expected) => {
    const ok = Object.is(actual, expected);
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : `  << got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`}`);
    if (!ok) failures++;
};

// ---------- ascensionEffects ----------
console.log('[unit] ascensionEffects');
check('A0 is the identity', JSON.stringify(ascensionEffects(0)),
    JSON.stringify({ bossHpMult: 1, depthSlope: 0.03, priceMult: 1, maxHpDelta: 0, eliteBonus: 0.25, campfireHeal: 0.30, goldMult: 1, chipWaveBase: 1, potionDelta: 0, bossStrikeDelta: 0, scoreMult: 1 }));
check('A1 boss mult', ascensionEffects(1).bossHpMult, 1.15);
check('A2 depth slope', ascensionEffects(2).depthSlope, 0.045);
check('A3 price mult', ascensionEffects(3).priceMult, 1.2);
check('A4 max HP delta', ascensionEffects(4).maxHpDelta, -2);
check('A7 gold mult', ascensionEffects(7).goldMult, 0.75);
check('A10 boss mult stacks (1.15*1.2)', ascensionEffects(10).bossHpMult, 1.15 * 1.20);
check('A10 score mult', ascensionEffects(10).scoreMult, 2);
check('null/undefined -> A0', ascensionEffects(undefined).scoreMult, 1);

// ---------- seeded run RNG ----------
console.log('[unit] runRand');
seedRunRng(12345);
const a = [runRand(), runRand(), runRand()];
seedRunRng(12345);
const b = [runRand(), runRand(), runRand()];
check('same seed -> same stream', JSON.stringify(a), JSON.stringify(b));
check('stream stays in [0,1)', a.every(x => x >= 0 && x < 1), true);
seedRunRng(null);
check('unseeded -> Math.random passthrough (no throw)', typeof runRand(), 'number');
seedRunRng(0);
check('seed 0 coerces to a valid state (not passthrough)', (() => { const x = runRand(); seedRunRng(0); return runRand() === x; })(), true);

// ---------- economy: shopDiscount / discountedPrice ----------
console.log('[unit] economy');
game.relics = [];
game.ascension = 0;
window.permanentUnlocks = window.permanentUnlocks || {};
const basePermanent = { ...window.permanentUnlocks };
check('no relics, no unlocks -> full price', discountedPrice(100), 100);
game.relics = [{ id: 'dice' }]; // Lucky Dice
const withDice = discountedPrice(100);
check('lucky dice discounts below 100', withDice < 100, true);
game.relics = [];
game.ascension = 3;
check('A3 charges 20% more', discountedPrice(100), 120);
game.ascension = 0;
check('price floors at 0', discountedPrice(0), 0);
Object.assign(window.permanentUnlocks, basePermanent);

console.log(failures ? `\n${failures} unit check(s) FAILED` : '\nAll unit checks passed');
process.exit(failures ? 1 : 0);

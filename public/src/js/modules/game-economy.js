/**
 * ============================================
 * GAME ECONOMY MODULE
 * ============================================
 * The pricing/purchase rules shared by BOTH shops — the Classic corner shop
 * (game-shop.js) and the Adventure map merchant (adventure-run.js). The item
 * sets stay mode-specific by design; the RULES must not drift between modes:
 *   - which discounts apply (Merchant Friend unlock, Lucky Dice, Crystal)
 *   - how a completed purchase is recorded (lifetime stats → achievements)
 * Classic-only mechanics (Old Key free item, the per-purchase anti-exploit
 * price multiplier) intentionally stay in game-shop.js.
 *
 * @module game-economy
 */

import { game, permanentUnlocks } from './game-state.js?v=1.7.3';

/** Combined discount multiplier from unlocks + relics (multiplicative). */
export function shopDiscount() {
    let discount = 1.0;
    if (permanentUnlocks.shopDiscount) discount *= 0.8;              // Merchant Friend unlock (20%)
    if (game.relics.some(r => r.id === 'dice')) discount *= 0.95;    // Lucky Dice (5%)
    if (game.relics.some(r => r.id === 'crystal')) discount *= 0.85; // Crystal (15%)
    return discount;
}

/** Base price → what the player actually pays (before per-mode multipliers). */
export function discountedPrice(basePrice) {
    return Math.max(0, Math.floor(basePrice * shopDiscount()));
}

/**
 * One write-through path for the bookkeeping every purchase shares:
 * lifetime itemsBought (Shopaholic achievement) + achievement re-check.
 */
export function recordPurchase() {
    if (window.storage) {
        window.storage.update('scoundrel_lifetime_stats', (s) => {
            s.itemsBought = (s.itemsBought || 0) + 1;
            return s;
        });
    } else {
        try {
            const saved = localStorage.getItem('scoundrel_lifetime_stats');
            const stats = saved ? JSON.parse(saved) : {};
            stats.itemsBought = (stats.itemsBought || 0) + 1;
            localStorage.setItem('scoundrel_lifetime_stats', JSON.stringify(stats));
        } catch (_) { /* storage unavailable — skip the counter, not the sale */ }
    }
    if (typeof window.checkAchievements === 'function') window.checkAchievements();
}

// Classic-script consumers (adventure-run.js) reach this via window.*
window.GameEconomy = { shopDiscount, discountedPrice, recordPurchase };

/**
 * ============================================
 * GAME RELICS MODULE
 * ============================================
 * Relic system management
 * 
 * @module game-relics
 * @version 1.0.0
 * @author Gabriel Lima
 */

// Import game state
import { game, runRand } from './game-state.js?v=1.8.2';

// DOM Elements (will be initialized after DOM loads)
let relicsList;

// Initialize DOM elements
function initRelicsElements() {
    relicsList = document.getElementById('relicsList');
}

// Call init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRelicsElements);
} else {
    initRelicsElements();
}

/**
 * Safely escape string for use in single-quoted JavaScript inline attributes
 * IMPORTANT: Backslashes must be escaped BEFORE single quotes
 * @param {string} str - String to escape
 * @returns {string} Safely escaped string
 */
function escapeForSingleQuotedJs(str) {
    if (!str) return '';
    return str
        .replace(/\\/g, '\\\\')  // Escape backslashes first
        .replace(/'/g, "\\'");    // Then escape single quotes
}

/**
 * Candidate relics of a rarity the player doesn't own yet (falls back to
 * owned ones if the pool is exhausted). Used by the grant AND by the
 * Adventure pick-1-of-3 reward UI.
 */
export function relicChoicesByRarity(rarity, count = 1) {
    const RELICS = window.RELICS;
    if (!RELICS) return [];
    let available = RELICS.filter(r => r.rarity === rarity && !game.relics.find(gr => gr.id === r.id));
    if (available.length === 0) available = RELICS.filter(r => r.rarity === rarity);
    // sample without replacement
    const pool = [...available];
    const picks = [];
    while (pool.length && picks.length < count) {
        picks.push(pool.splice(Math.floor(runRand() * pool.length), 1)[0]);
    }
    return picks;
}

/**
 * Grant one specific relic (the single acquisition path: pushes, counts for
 * the Priest unlock, applies immediate effects, announces, refreshes UI).
 */
export function giveSpecificRelic(relic) {
    if (!relic) return;
    const RELIC_CONFIG = window.RELIC_CONFIG || {};
    game.relics.push({ ...relic, used: false });
    game.stats.relicsCollected++;  // Track for Priest unlock

    // Apply immediate health effects
    if (relic.effect === 'smallHealth') {
        game.maxHealth += RELIC_CONFIG.SMALL_HEALTH_BONUS;
        game.health += RELIC_CONFIG.SMALL_HEALTH_BONUS;
    }
    if (relic.effect === 'maxHealth') {
        game.maxHealth += RELIC_CONFIG.MEDIUM_HEALTH_BONUS;
        game.health += RELIC_CONFIG.MEDIUM_HEALTH_BONUS;
    }
    if (relic.effect === 'bigHealth') {
        game.maxHealth += RELIC_CONFIG.BIG_HEALTH_BONUS;
        game.health += RELIC_CONFIG.BIG_HEALTH_BONUS;
    }
    if (relic.effect === 'tinyHealth') {
        game.maxHealth += RELIC_CONFIG.TINY_HEALTH_BONUS;
        game.health += RELIC_CONFIG.TINY_HEALTH_BONUS;
    }

    // BUGFIX: Charm relic gives +10 gold when obtained
    if (relic.effect === 'startGold') {
        if (typeof window.earnGold === 'function') {
            window.earnGold(10);
        } else {
            game.gold += 10;
        }
    }

    const rarityColors = { common: '⚪', uncommon: '🟢', rare: '🔵', legendary: '🟠' };
    if (typeof window.showMessage === 'function') {
        window.showMessage(`${rarityColors[relic.rarity] || '⚪'} Relic: ${relic.name}!`, 'success');
    }

    updateRelicsDisplay();
    if (typeof window.updateUI === 'function') window.updateUI();
}

/**
 * Give relic by specific rarity
 */
export function giveRelicByRarity(rarity) {
    const picks = relicChoicesByRarity(rarity, 1);
    if (picks.length === 0) {
        if (typeof window.showMessage === 'function') {
            window.showMessage('No relics of this rarity available!', 'warning');
        }
        return;
    }
    giveSpecificRelic(picks[0]);
}

/**
 * Give random relic (defaults to common for unlocks)
 */
export function giveRandomRelic(rarityFilter = 'common') {
    giveRelicByRarity(rarityFilter);
}

/**
 * Give rare relic (helper function)
 */
export function giveRareRelic() {
    giveRelicByRarity('rare');
}

/**
 * Update relics display in UI
 */
// Codex discovery: any relic ever held is permanently revealed. Recorded at
// render time so every acquisition path (grants, event pushes, unlock starts)
// is covered without instrumenting each one.
function recordSeenRelics() {
    if (!window.storage || !game.relics.length) return;
    try {
        const seen = window.storage.get('scoundrel_seen_relics', []);
        const set = new Set(Array.isArray(seen) ? seen : []);
        const before = set.size;
        game.relics.forEach(r => set.add(r.id));
        if (set.size > before) window.storage.set('scoundrel_seen_relics', [...set]);
    } catch (_) {}
}

export function updateRelicsDisplay() {
    recordSeenRelics();
    if (!relicsList) {
        console.error('[RELICS] relicsList element not initialized!');
        return;
    }
    
    if (game.relics.length === 0) {
        relicsList.innerHTML = '<div class="relic-effect">No relics yet.</div>';
        return;
    }
    
    relicsList.innerHTML = game.relics.map(r => {
        let dynamicInfo = '';
        let dynamicDesc = r.description;
        
        // Add dynamic info for Mirror Shield
        if (game.mirrorShield > 0 && (r.id === 'shield' || r.name.includes('Mirror'))) {
            dynamicInfo = ` (${game.mirrorShield} shield remaining)`;
            dynamicDesc += ` | Shield: ${game.mirrorShield} damage`;
        }
        
        // Add dynamic info for Mirror Shard
        if (r.id === 'mirror_shard') {
            if (r.usedThisRoom) {
                dynamicInfo = ' (Used this room)';
                dynamicDesc += ' | Used this room';
            } else {
                dynamicInfo = ' (Ready)';
                dynamicDesc += ' | Ready to reflect';
            }
        }
        
        // Illustrated icon (CARD-4 relics) with graceful emoji fallback. The
        // relic name is "<emoji> <Name>"; show the icon and drop the leading emoji.
        const ver = window.ADV_ART_VER || '1';
        const parts = String(r.name).split(' ');
        const emoji = parts[0];
        const label = parts.slice(1).join(' ') || r.name;
        const icon = `<img class="relic-icon" src="assets/relics/relic_${r.id}.webp?v=${ver}" alt=""
             onerror="this.outerHTML='<span class=&quot;relic-emoji&quot;>${emoji}</span>'">`;

        return `
            <div class="relic-item rarity-${r.rarity || 'common'} ${r.used ? 'used' : ''}"
                 title="${dynamicDesc}${r.used ? ' (Used)' : ''}"
                 onmouseenter="showTooltip(this, '${escapeForSingleQuotedJs(dynamicDesc)}', 'bottom')"
                 onmouseleave="hideTooltip()"
                 style="cursor: help;">
                ${icon}
                <div class="relic-text">
                    <div class="relic-name">${label}${dynamicInfo}</div>
                    <div class="relic-effect">${r.description}</div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Get bonus from relics
 */
export function getRelicBonus(type) {
    let bonus = 0;
    game.relics.forEach(r => {
        if (r.effect === type) {
            // Power bonuses - CRITICAL: Only apply if weapon is equipped
            if (type === 'smallPower' && game.equippedWeapon) bonus += 1;
            if (type === 'power' && game.equippedWeapon) bonus += 2;
            if (type === 'bigPower' && game.equippedWeapon) bonus += 3;
            // Berserker Ring: desperation pays — big bonus at half HP or less
            if (type === 'lowHpPower' && game.equippedWeapon && game.health * 2 <= game.maxHealth) bonus += 4;
            
            // Heal bonuses
            if (type === 'smallHealBonus') bonus += 1;
            if (type === 'healBonus') bonus += 2;
            
            // Gold bonuses
            if (type === 'smallGoldPerRoom') bonus += 2;
            if (type === 'goldPerRoom') bonus += 3;
        }
    });
    
    // Crown: Double all stat bonuses from relics
    if (game.relics.some(r => r.id === 'crown')) {
        bonus *= 2;
    }
    
    // Sum all potion-heal bonus types — the single source for potion heals
    // (game-combat.js handlePotion + the game.js tooltip). Healing Charm's
    // smallHealBonus was dead before this existed.
    if (type === 'totalHealBonus') {
        bonus += getRelicBonus('smallHealBonus');
        bonus += getRelicBonus('healBonus');
    }

    // Sum all power types for total weapon bonus — THE single source every
    // damage path uses (game.js, game-combat.js, game-classes.js). Adding a
    // new power-family effect? Add it here and it applies everywhere.
    if (type === 'totalPower') {
        bonus += getRelicBonus('smallPower');
        bonus += getRelicBonus('power');
        bonus += getRelicBonus('bigPower');
        bonus += getRelicBonus('lowHpPower');
    }
    
    return bonus;
}

// Global exposure for compatibility
window.relicChoicesByRarity = relicChoicesByRarity;
window.giveSpecificRelic = giveSpecificRelic;
window.giveRelicByRarity = giveRelicByRarity;
window.giveRandomRelic = giveRandomRelic;
window.giveRareRelic = giveRareRelic;
window.updateRelicsDisplay = updateRelicsDisplay;
window.getRelicBonus = getRelicBonus;


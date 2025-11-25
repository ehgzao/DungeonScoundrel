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
import { game } from './game-state.js';

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
 * Give relic by specific rarity
 */
export function giveRelicByRarity(rarity) {
    // Access RELICS from global scope (loaded by game-data.js)
    const RELICS = window.RELICS;
    if (!RELICS) {
        console.error('[RELICS] RELICS array not found!');
        return;
    }
    
    // Access RELIC_CONFIG from global scope
    const RELIC_CONFIG = window.RELIC_CONFIG;
    if (!RELIC_CONFIG) {
        console.error('[RELICS] RELIC_CONFIG not found!');
        return;
    }
    
    let available = RELICS.filter(r => r.rarity === rarity && !game.relics.find(gr => gr.id === r.id));
    
    // If no new relics of this rarity, allow duplicates
    if (available.length === 0) {
        available = RELICS.filter(r => r.rarity === rarity);
    }
    
    if (available.length === 0) {
        if (typeof window.showMessage === 'function') {
            window.showMessage('No relics of this rarity available!', 'warning');
        }
        return;
    }
    
    const randomRelic = available[Math.floor(Math.random() * available.length)];
    game.relics.push({...randomRelic, used: false});
    game.stats.relicsCollected++;  // Track for Priest unlock
    
    // Apply immediate health effects
    if (randomRelic.effect === 'smallHealth') { 
        game.maxHealth += RELIC_CONFIG.SMALL_HEALTH_BONUS; 
        game.health += RELIC_CONFIG.SMALL_HEALTH_BONUS; 
    }
    if (randomRelic.effect === 'maxHealth') { 
        game.maxHealth += RELIC_CONFIG.MEDIUM_HEALTH_BONUS; 
        game.health += RELIC_CONFIG.MEDIUM_HEALTH_BONUS; 
    }
    if (randomRelic.effect === 'bigHealth') { 
        game.maxHealth += RELIC_CONFIG.BIG_HEALTH_BONUS; 
        game.health += RELIC_CONFIG.BIG_HEALTH_BONUS; 
    }
    if (randomRelic.effect === 'tinyHealth') {
        game.maxHealth += RELIC_CONFIG.TINY_HEALTH_BONUS;
        game.health += RELIC_CONFIG.TINY_HEALTH_BONUS;
    }

    // BUGFIX: Charm relic gives +10 gold when obtained
    if (randomRelic.effect === 'startGold') {
        if (typeof window.earnGold === 'function') {
            window.earnGold(10);
        } else {
            game.gold += 10;
        }
    }

    const rarityColors = { common: '⚪', uncommon: '🟢', rare: '🔵', legendary: '🟠' };
    if (typeof window.showMessage === 'function') {
        window.showMessage(`${rarityColors[rarity]} Relic: ${randomRelic.name}!`, 'success');
    }
    
    updateRelicsDisplay();
    if (typeof window.updateUI === 'function') window.updateUI();
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
export function updateRelicsDisplay() {
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
        
        return `
            <div class="relic-item ${r.used ? 'used' : ''}"
                 title="${dynamicDesc}${r.used ? ' (Used)' : ''}"
                 onmouseenter="showTooltip(this, '${escapeForSingleQuotedJs(dynamicDesc)}', 'bottom')"
                 onmouseleave="hideTooltip()"
                 style="cursor: help;">
                <div class="relic-name">${r.name}${dynamicInfo}</div>
                <div class="relic-effect">${r.description}</div>
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
    
    // Sum all power types for total weapon bonus
    if (type === 'totalPower') {
        bonus += getRelicBonus('smallPower');
        bonus += getRelicBonus('power');
        bonus += getRelicBonus('bigPower');
    }
    
    return bonus;
}

// Global exposure for compatibility
window.giveRelicByRarity = giveRelicByRarity;
window.giveRandomRelic = giveRandomRelic;
window.giveRareRelic = giveRareRelic;
window.updateRelicsDisplay = updateRelicsDisplay;
window.getRelicBonus = getRelicBonus;


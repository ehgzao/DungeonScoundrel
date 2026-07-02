/**
 * ============================================
 * GAME STATE MODULE
 * ============================================
 * Central game state management
 * 
 * @module game-state
 * @version 1.0.0
 * @author Gabriel Lima
 */

// Import constants
import {
    HEALTH,
    GOLD,
    GAME_MODES
} from '../config/game-constants.js';

// ============================================
// GAME STATE OBJECT
// ============================================
export const game = {
    deck: [],
    relics: [],
    heldCard: null,
    discardPile: [],
    lastActionWasAvoid: false,
    gameOver: false,
    gameTimerInterval: null,
    gameStartTime: 0,
    undoAvailable: false,
    lastGameState: null,
    potionsUsed: 0,
    difficulty: GAME_MODES.NORMAL,
    combo: 0,
    score: 0,
    health: HEALTH.DEFAULT_START,
    maxHealth: HEALTH.DEFAULT_MAX,
    equippedWeapon: null,
    dungeon: [],
    room: [],
    gold: GOLD.DEFAULT_START,
    totalGoldEarned: 0,
    stats: {},
    settings: {
        soundEnabled: true,
        musicEnabled: true
    },
    dodgeActive: false,
    doubleDamage: false,
    berserkStacks: 0,
    mirrorShield: 0,
    obliterateMode: false,
    // Additional state (added during gameplay)
    selectedClass: null,
    playerClass: null,
    classData: null,
    classAbilityCooldown: 0,
    classAbilityActive: false,
    classAbilityCounter: 0,
    rageStrikeActive: false,
    seenEvents: [],
    shopPriceMultiplier: 1.0,
    finalBossDefeated: false,
    finalBossSpawned: false,
    endlessLevel: 0,
    eventTriggeredThisRoom: false,
    firstAttackDone: false,
    dodgeCounter: 0,
    // Fields historically assigned from outside this module — declared here so
    // the literal stays the complete, readable schema of the run state.
    mode: 'classic',            // 'classic' | 'adventure' (set by startGame from the mode selector)
    adventureRun: false,        // true while an Adventure run drives progression (adventure-run.js)
    heldCardIndex: 0,           // which held card is displayed (Rogue can hold 2)
    criticalWarningShown: false,// low-HP warning shown once per dip below the threshold
    gameTimerPausedAt: 0,       // timer pause bookkeeping (tab hidden)
    lastDamageSource: null      // what hurt us last — the death recap's "slain by"
};

// ============================================
// PERMANENT STATS (LocalStorage)
// ============================================
export let permanentStats = {};

// ============================================
// PERMANENT UNLOCKS
// ============================================
export let permanentUnlocks = {
    startHealth: false,
    startGold: false,
    betterDrops: false,
    extraRelic: false,
    strongerWeapons: false,
    masterHealer: false,
    richStart: false,
    comboMaster: false,
    bigStart: false,
    ultraWeapons: false,
    godMode: false,
    relicMaster: false,
    shopDiscount: false,
    durablePlus: false,
    startPower: false,
    comboGod: false,
    megaHealth: false,
    eventLuck: false,
    berserkMaster: false,
    mirrorMaster: false,
    dodgeMaster: false,
    criticalStrike: false,
    lifeSteal: false,
    thornsArmor: false
};

// ============================================
// HELPER FUNCTION (for UNLOCKS)
// ============================================
function getTotalStat(statName) {
    const saved = localStorage.getItem('scoundrel_lifetime_stats');
    if (!saved) return 0;
    try {
        const stats = JSON.parse(saved);
        return stats[statName] || 0;
    } catch (e) {
        console.error('Error parsing lifetime stats:', e);
        return 0;
    }
}

// ============================================
// UNLOCKS ARRAY
// ============================================
export const UNLOCKS = [
    // Tier 1: Beginner (Easy)
    { id: 'startHealth', name: '❤️ Tough Start', description: 'Start each run with +5 max HP', requirement: 'Clear 10 rooms', check: () => getTotalStat('roomsCleared') >= 10 },
    { id: 'startGold', name: '💰 Rich Start', description: 'Start each run with 30 gold', requirement: 'Earn 200 gold (lifetime)', check: () => getTotalStat('totalGoldEarned') >= 200 },
    { id: 'betterDrops', name: '🎲 Lucky Drops', description: 'Better card quality in rooms', requirement: 'Clear 20 rooms', check: () => getTotalStat('roomsCleared') >= 20 },
    { id: 'extraRelic', name: '🏺 Relic Seeker', description: 'Start each run with 1 random relic', requirement: 'Collect 10 relics (lifetime)', check: () => getTotalStat('relicsCollected') >= 10 },
    { id: 'strongerWeapons', name: '⚔️ Weapon Master', description: 'All weapons deal +1 damage', requirement: 'Equip 30 weapons (lifetime)', check: () => getTotalStat('weaponsEquipped') >= 30 },
    { id: 'masterHealer', name: '💊 Master Healer', description: 'All potions heal +2 HP', requirement: 'Use 20 potions (lifetime)', check: () => getTotalStat('potionsUsed') >= 20 },
    { id: 'richStart', name: '💎 Wealthy Start', description: 'Start each run with 50 gold total', requirement: 'Earn 500 gold (lifetime)', check: () => getTotalStat('totalGoldEarned') >= 500 },
    { id: 'comboMaster', name: '🔥 Combo Master', description: 'Start each run with 1x combo', requirement: 'Reach 10x combo', check: () => getTotalStat('maxCombo') >= 10 },
    
    // Tier 2: Intermediate (Normal)
    { id: 'bigStart', name: '💪 Big Start', description: 'Start each run with +15 max HP total', requirement: 'Win on Normal difficulty', check: () => getTotalStat('normalWins') >= 1 },
    { id: 'ultraWeapons', name: '🗡️ Ultra Weapons', description: 'All weapons deal +2 damage total', requirement: 'Equip 50 weapons (lifetime)', check: () => getTotalStat('weaponsEquipped') >= 50 },
    { id: 'godMode', name: '👑 God Mode', description: 'Start with +15 HP, 100 gold, 2 relics', requirement: 'Win on Hard difficulty', check: () => getTotalStat('hardWins') >= 1 },
    { id: 'relicMaster', name: '🏆 Relic Master', description: 'Start each run with 3 random relics', requirement: 'Collect 30 relics (lifetime)', check: () => getTotalStat('relicsCollected') >= 30 },
    { id: 'shopDiscount', name: '🏪 Merchant Friend', description: 'All shop items 20% cheaper', requirement: 'Visit shop 20 times (lifetime)', check: () => getTotalStat('shopsVisited') >= 20 },
    { id: 'durablePlus', name: '🔨 Durable Weapons', description: 'All weapons have +1 durability', requirement: 'Break 20 weapons (lifetime)', check: () => getTotalStat('weaponsBroken') >= 20 },
    { id: 'startPower', name: '⚡ Power Start', description: 'Start each run with a weapon in room', requirement: 'Win 3 games (any difficulty)', check: () => getTotalStat('gamesWon') >= 3 },
    { id: 'comboGod', name: '🔥🔥 Combo God', description: 'Start with 2x combo + combo damage 2x', requirement: 'Reach 20x combo', check: () => getTotalStat('maxCombo') >= 20 },
    
    // Tier 3: Advanced (Hard)
    { id: 'megaHealth', name: '❤️❤️ Mega Health', description: 'Start each run with +35 max HP total', requirement: 'Win on Hard 3 times', check: () => getTotalStat('hardWins') >= 3 },
    { id: 'eventLuck', name: '🍀 Event Luck', description: '+50% event chance', requirement: 'Complete 30 events (lifetime)', check: () => getTotalStat('eventsCompleted') >= 30 },
    { id: 'berserkMaster', name: '🔥 Berserk Master', description: 'Berserk cards give +7 damage (instead of +5)', requirement: 'Use 10 Berserk cards (lifetime)', check: () => getTotalStat('berserkUses') >= 10 },
    { id: 'mirrorMaster', name: '🪞 Mirror Master', description: 'Mirror Shield starts with 5 charges', requirement: 'Reflect 100 damage (lifetime)', check: () => getTotalStat('damageReflected') >= 100 },
    { id: 'dodgeMaster', name: '🛡️ Dodge Master', description: 'Dodge cards avoid 2 attacks (instead of 1)', requirement: 'Dodge 20 attacks (lifetime)', check: () => getTotalStat('attacksDodged') >= 20 },
    { id: 'criticalStrike', name: '💥 Critical Strike', description: '10% chance to deal 3x damage', requirement: 'Deal 500 damage (lifetime)', check: () => getTotalStat('totalDamage') >= 500 },
    { id: 'lifeSteal', name: '🧛 Life Steal', description: 'Heal 1 HP on every perfect kill', requirement: 'Kill 100 monsters (lifetime)', check: () => getTotalStat('monstersSlain') >= 100 },
    { id: 'thornsArmor', name: '🌵 Thorns Armor', description: 'Reflect 2 damage to all attackers', requirement: 'Take 200 damage (lifetime)', check: () => getTotalStat('totalDamage') >= 200 }
];

// ============================================
// GLOBAL EXPOSURE (for compatibility)
// ============================================
window.game = game;
window.permanentStats = permanentStats;
window.permanentUnlocks = permanentUnlocks;
window.UNLOCKS = UNLOCKS;


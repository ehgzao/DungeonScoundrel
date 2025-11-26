/**
 * ============================================
 * GAME CLASSES MODULE
 * ============================================
 * Player classes system: definitions, abilities, passives
 * 
 * @module game-classes
 * @version 1.0.0
 * @author Gabriel Lima
 * 
 * Dependências:
 * - game-state.js (game object)
 * - game-constants.js (CLASS_COOLDOWNS, POTIONS, COMBAT, HEALTH)
 * 
 * Usado por:
 * - game.js (main game logic)
 */

// ============================================
// IMPORTS
// ============================================
import { game } from './game-state.js';
import {
    CLASS_COOLDOWNS,
    POTIONS,
    COMBAT,
    HEALTH
} from '../config/game-constants.js';

// ============================================
// CLASS DEFINITIONS
// ============================================
export const CLASSES = {
    scoundrel: {
        name: 'SCOUNDREL',
        motivation: '"I have no honor, no glory, only survival in the dark."',
        mechanics: '<strong>⚔️ Passive:</strong> None - Pure skill and luck<br><br><strong>✨ Active:</strong> None - Just you and your wits<br><br><em style="color: #8b7355; font-size: 0.9em;">This is the baseline class. Master the basics before seeking power.</em>',
        icon: '🎭',
        unlocked: true,
        unlockRequirement: 'Always available',
        passive: {},
        active: null
    },
    knight: {
        name: 'KNIGHT',
        motivation: '"Honor and steel shall guide my path through the darkness."',
        mechanics: '<strong>🛡️ Passive:</strong> +5 Max HP | Weapons have +1 durability<br><br><strong>⚔️ Active (Shield Bash):</strong> Deal damage equal to your weapon value to the first monster in the room. Cooldown: 3 rooms.',
        icon: '🛡️',
        unlocked: false,
        unlockRequirement: 'Win on Easy difficulty',
        passive: { maxHpBonus: 5, weaponDurabilityBonus: 1 },
        active: {
            name: 'Shield Bash',
            description: 'Deal weapon damage to first monster',
            cooldown: CLASS_COOLDOWNS.WARRIOR,
            icon: '🛡️'
        }
    },
    rogue: {
        name: 'ROGUE',
        motivation: '"In shadows I thrive, through cunning I survive."',
        mechanics: '<strong>🗡️ Passive:</strong> Can hold 2 cards instead of 1 | Start with 1 extra gold per room<br><br><strong>🔪 Active (Shadow Strike):</strong> Next monster takes double weapon damage and doesn\'t break combo. Cooldown: 4 rooms.',
        icon: '🗡️',
        unlocked: false,
        unlockRequirement: 'Win on Normal difficulty',
        passive: { maxHoldCards: 2, bonusGoldPerRoom: 1 },
        active: {
            name: 'Shadow Strike',
            description: 'Next monster: 2x damage, combo safe',
            cooldown: CLASS_COOLDOWNS.ROGUE,
            icon: '🔪'
        }
    },
    dancer: {
        name: 'DANCER',
        motivation: '"Grace in motion, life in every step, death in every turn."',
        mechanics: '<strong>💃 Passive:</strong> Potions heal +3 HP | Can use 2 potions per room | Higher event chance (luck)<br><br><strong>✨ Active (Healing Dance):</strong> Heal 5 HP and gain +2 weapon damage for next 2 monsters. Cooldown: 5 rooms.',
        icon: '💃',
        unlocked: false,
        unlockRequirement: 'Win on Hard difficulty',
        passive: { potionHealBonus: 3, maxPotionsPerRoom: POTIONS.DANCER_MAX_PER_ROOM, eventChanceBonus: 15 },
        active: {
            name: 'Healing Dance',
            description: 'Heal 5 HP + damage buff',
            cooldown: CLASS_COOLDOWNS.DANCER,
            icon: '✨'
        }
    },
    berserker: {
        name: 'BERSERKER',
        motivation: '"Through pain I find power. Through fury I find victory."',
        mechanics: '<strong>💢 Passive (Bloodlust):</strong> Damage increases as HP decreases<br>• +1 damage at ≤70% HP<br>• +2 damage at ≤50% HP<br>• +3 damage at ≤30% HP<br><br><strong>⚔️ Active (Rage Strike):</strong> Sacrifice 5 HP for triple damage (3x) on next 3 attacks. Breaks combo. Cooldown: 4 rooms.<br><em style="color: #ff6b6b; font-size: 0.9em;">⚠️ Cannot use if HP ≤ 5</em>',
        icon: '💢',
        unlocked: false,
        unlockRequirement: 'Win on Hard + Kill 5 bosses total',
        passive: { bloodlust: true },
        active: {
            name: 'Rage Strike',
            description: 'Sacrifice 5 HP: 3x damage for 3 attacks, breaks combo',
            cooldown: CLASS_COOLDOWNS.BERSERKER,
            icon: '⚔️'
        }
    },
    priest: {
        name: 'PRIEST',
        motivation: '"The light protects me. The divine guides me. Chaos shall be purified."',
        mechanics: '<strong>🕊️ Passive (Divine Blessing):</strong> 15% chance to negate damage completely | Potions heal +2 HP | Start with +2 Max HP<br><br><strong>📿 Active (Purification):</strong> Permanently remove the strongest monster from current dungeon OR transform a monster into a potion. Cooldown: 6 rooms.<br><em style="color: #ffd700; font-size: 0.9em;">✨ Strategic: Eliminate threats before facing them</em>',
        icon: '📿',
        unlocked: false,
        unlockRequirement: 'Collect 20 relics + 10 events + 5 wins total',
        passive: { divineBlessing: true, potionHealBonus: 2, startMaxHpBonus: 2 },
        active: {
            name: 'Purification',
            description: 'Remove strongest monster or convert to potion',
            cooldown: 6,
            icon: '📿'
        }
    }
};

// ============================================
// PASSIVE ICONS (for UI)
// ============================================
export const PASSIVE_ICONS = {
    knight: [
        { icon: '❤️', text: '+5 HP', title: 'Start with +5 Max HP' },
        { icon: '🔨', text: '+1 Dur', title: 'Weapons last +1 use' }
    ],
    rogue: [
        { icon: '📌', text: 'x2 Hold', title: 'Can hold 2 cards' },
        { icon: '💰', text: '+1 Gold', title: '+1 gold per room' }
    ],
    dancer: [
        { icon: '💊', text: '+3 HP', title: 'Potions heal +3 HP' },
        { icon: '💊', text: 'x2 Use', title: 'Use 2 potions per room' },
        { icon: '🎲', text: '+15%', title: '+15% event chance' }
    ],
    berserker: [
        { icon: '💢', text: 'Bloodlust', title: 'Damage increases as HP decreases' },
        { icon: '⚔️', text: 'High Risk', title: '+1/+2/+3 damage at ≤70%/50%/30% HP' }
    ],
    priest: [
        { icon: '🕊️', text: '15% Dodge', title: '15% chance to dodge damage' },
        { icon: '💊', text: '+2 HP', title: 'Potions heal +2 HP' },
        { icon: '❤️', text: '+2 HP', title: 'Start with +2 Max HP' }
    ]
};

// ============================================
// CLASS UNLOCK CHECKING
// ============================================

/**
 * Check and update class unlock states based on lifetime stats
 * @returns {void}
 */
export function checkClassUnlocks() {
    // Access storage from global scope (loaded by helpers.js)
    const storage = window.storage;
    if (!storage) {
        console.warn('[CLASSES] Storage not available');
        return;
    }
    
    const stats = storage.get('scoundrel_lifetime_stats', {});
    
    // Knight unlocks after Easy win
    if (stats.easyWins >= 1) {
        CLASSES.knight.unlocked = true;
    }
    
    // Rogue unlocks after Normal win
    if (stats.normalWins >= 1) {
        CLASSES.rogue.unlocked = true;
    }
    
    // Dancer unlocks after Hard win
    if (stats.hardWins >= 1) {
        CLASSES.dancer.unlocked = true;
    }
    
    // Berserker unlocks after Hard win + 5 bosses killed
    if (stats.hardWins >= 1 && (stats.bossesKilled || 0) >= 5) {
        CLASSES.berserker.unlocked = true;
    }
    
    // Priest unlocks after 20 relics + 10 events + 5 wins
    const totalRelics = stats.totalRelicsCollected || 0;
    const totalEvents = stats.eventsTriggered || 0;
    const totalWins = stats.gamesWon || 0;
    
    if (totalRelics >= 20 && totalEvents >= 10 && totalWins >= 5) {
        CLASSES.priest.unlocked = true;
    }
}

// ============================================
// BLOODLUST HELPER (Berserker Passive)
// ============================================

/**
 * Calculate Berserker's Bloodlust damage bonus based on current HP
 * @returns {number} Bonus damage (0-3)
 */
export function getBloodlustBonus() {
    if (!game.classData || !game.classData.passive.bloodlust) return 0;
    // CRITICAL: Bloodlust bonus ONLY applies if weapon is equipped
    if (!game.equippedWeapon) return 0;
    const hpPercent = (game.health / game.maxHealth) * 100;
    if (hpPercent <= 30) return 3;
    if (hpPercent <= 50) return 2;
    if (hpPercent <= 70) return 1;
    return 0;
}

// ============================================
// CLASS ABILITIES
// ============================================

/**
 * Use the current class's active ability
 * Uses global window.* functions for compatibility
 */
export function useClassAbility() {
    // Get dependencies from global scope (exposed by game.js)
    const showMessage = window.showMessage;
    const playSound = window.playSound;
    const updateUI = window.updateUI;
    
    if (!game.classData) return;
    
    // Scoundrel has no ability
    if (!game.classData.active) {
        showMessage('❌ Scoundrel has no special abilities!', 'warning');
        playSound('error');
        return;
    }
    
    // Check cooldown
    if (game.classAbilityCooldown > 0) {
        showMessage(`⏳ Ability on cooldown! ${game.classAbilityCooldown} rooms remaining.`, 'warning');
        playSound('error');
        return;
    }
    
    // Execute ability based on class
    if (game.playerClass === 'knight') {
        useKnightAbility();
    } else if (game.playerClass === 'rogue') {
        useRogueAbility();
    } else if (game.playerClass === 'dancer') {
        useDancerAbility();
    } else if (game.playerClass === 'berserker') {
        useBerserkerAbility();
    } else if (game.playerClass === 'priest') {
        usePriestAbility();
    }
    
    updateAbilityUI();
}

/**
 * Knight: Shield Bash - Deal weapon damage to first monster
 */
function useKnightAbility() {
    const showMessage = window.showMessage;
    const playSound = window.playSound;
    const getCardType = window.getCardType;
    const getRelicBonus = window.getRelicBonus;
    const earnGold = window.earnGold;
    const updateUI = window.updateUI;
    const checkGameState = window.checkGameState;
    const createParticles = window.createParticles;
    
    if (!game.equippedWeapon) {
        showMessage('⚠️ Need a weapon equipped to use Shield Bash!', 'warning');
        playSound('error');
        return;
    }
    
    const firstMonster = game.room.find(c => getCardType(c) === 'monster');
    if (!firstMonster) {
        showMessage('⚠️ No monsters in room!', 'warning');
        playSound('error');
        return;
    }
    
    const powerBonus = getRelicBonus('power') + getRelicBonus('bigPower');
    const damage = game.equippedWeapon.numValue + powerBonus;
    firstMonster.numValue -= damage;
    
    if (firstMonster.numValue <= 0) {
        const index = game.room.indexOf(firstMonster);
        game.room.splice(index, 1);
        game.discardPile.push(firstMonster);
        game.stats.monstersSlain++;

        // BUGFIX: Monster Tooth bonus for Shield Bash kills
        if (game.relics.some(r => r.id === 'tooth')) {
            earnGold(1);
        }

        showMessage(`🛡️ Shield Bash! Monster defeated!`, 'success');
    } else {
        showMessage(`🛡️ Shield Bash! Dealt ${damage} damage! (${firstMonster.numValue} HP left)`, 'success');
    }
    
    game.classAbilityCooldown = game.classData.active.cooldown;
    playSound('special');
    createParticles(window.innerWidth / 2, window.innerHeight / 2, '#c9a961', 40);
    updateUI();
    checkGameState();
}

/**
 * Rogue: Shadow Strike - Next monster 2x damage, combo safe
 */
function useRogueAbility() {
    const showMessage = window.showMessage;
    const playSound = window.playSound;
    const createParticles = window.createParticles;
    const updateUI = window.updateUI;
    
    game.classAbilityActive = true;
    game.classAbilityCounter = 1; // Next monster only
    game.classAbilityCooldown = game.classData.active.cooldown;
    
    showMessage('🔪 Shadow Strike activated! Next kill: 2x damage, combo safe!', 'success');
    playSound('special');
    createParticles(window.innerWidth / 2, window.innerHeight / 2, '#667eea', 40);
    updateUI();
}

/**
 * Dancer: Healing Dance - Heal 5 HP + damage buff
 */
function useDancerAbility() {
    const showMessage = window.showMessage;
    const playSound = window.playSound;
    const createParticles = window.createParticles;
    const updateUI = window.updateUI;
    
    game.health = Math.min(game.maxHealth, game.health + 5);
    game.classAbilityActive = true;
    game.classAbilityCounter = 2; // Next 2 monsters
    game.classAbilityCooldown = game.classData.active.cooldown;
    
    showMessage('✨ Healing Dance! +5 HP and damage buff for 2 attacks!', 'success');
    playSound('heal');
    createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd93d', 50);
    updateUI();
}

/**
 * Berserker: Rage Strike - Sacrifice 5 HP for 3x damage
 */
function useBerserkerAbility() {
    const showMessage = window.showMessage;
    const playSound = window.playSound;
    const createParticles = window.createParticles;
    const screenShake = window.screenShake;
    const updateUI = window.updateUI;
    
    if (game.health <= HEALTH.CRITICAL_THRESHOLD) {
        showMessage(`⚠️ Not enough HP! Need more than ${HEALTH.CRITICAL_THRESHOLD} HP to use Rage Strike.`, 'danger');
        playSound('error');
        return;
    }
    
    // Sacrifice HP
    game.health -= 5;
    
    // Activate 3x damage buff
    game.classAbilityActive = true;
    game.classAbilityCounter = 3; // 3 attacks (buffed for balance)
    game.rageStrikeActive = true; // Special flag for triple damage
    game.classAbilityCooldown = game.classData.active.cooldown;
    
    // Break combo (high risk)
    if (game.combo > 0) {
        showMessage(`💢 Rage Strike! -5 HP, next attack: 3x damage! ⚠️ Combo broken! (Lost ${game.combo}x)`, 'warning');
        game.combo = 0;
    } else {
        showMessage('💢 Rage Strike! -5 HP, next attack: 3x damage!', 'warning');
    }
    
    playSound('special');
    screenShake();
    createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ff6b6b', 60);
    updateUI();
}

/**
 * Priest: Purification - Remove strongest monster or convert to potion
 * ONLY targets monsters in the ROOM (must have visible monsters)
 */
function usePriestAbility() {
    const showMessage = window.showMessage;
    const playSound = window.playSound;
    const getCardType = window.getCardType;
    const createParticles = window.createParticles;
    const updateUI = window.updateUI;
    
    // ONLY target monsters in the ROOM (visible)
    const roomMonsters = game.room.filter(c => getCardType(c) === 'monster' && !c.isBoss);
    
    // Must have monsters in the room to use ability
    if (roomMonsters.length === 0) {
        showMessage('⚠️ No monsters in the room! Enter a chamber first.', 'warning');
        playSound('error');
        return;
    }
    
    const targetMonsters = roomMonsters;
    const useRoom = true; // Always room now
    
    // Find strongest monster from the priority list
    const strongestMonster = targetMonsters.reduce((max, card) => 
        card.numValue > max.numValue ? card : max
    );
    
    const targetArray = useRoom ? game.room : game.dungeon;
    const index = targetArray.indexOf(strongestMonster);
    const locationText = useRoom ? '(in room)' : '(in dungeon)';
    
    // Show styled modal for choice
    showPurificationModal(strongestMonster, locationText, (choice) => {
        if (choice === 'remove') {
            // Remove permanently
            targetArray.splice(index, 1);
            if (useRoom) game.discardPile.push(strongestMonster);
            showMessage(`📿 Purification! ${strongestMonster.value}${strongestMonster.suit} removed from existence!`, 'success');
        } else if (choice === 'transform') {
            // Transform to potion with value = monster damage (max 10)
            const monsterValue = strongestMonster.numValue;
            const potionValue = Math.min(monsterValue, 10); // Cap at 10
            const isMaxed = monsterValue > 10;
            
            const newPotion = {
                value: potionValue.toString(),
                suit: '♥',
                numValue: potionValue,
                suitName: 'hearts'
            };
            targetArray[index] = newPotion;
            
            const maxText = isMaxed ? ' (MAX)' : '';
            showMessage(`📿 Purification! Monster transformed into ${potionValue}♥ potion!${maxText}`, 'success');
        }
        
        game.classAbilityCooldown = game.classData.active.cooldown;
        playSound('special');
        createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd700', 70);
        updateUI();
    });
}

/**
 * Show styled modal for Purification choice
 */
function showPurificationModal(monster, location, callback) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.style.zIndex = '10000';
    overlay.innerHTML = `
        <div class="modal-content" style="max-width: 400px; border: 2px solid #ffd700;">
            <h2 style="color: #ffd700; margin-top: 0;">📿 PURIFICATION</h2>
            <p style="color: #ddd; line-height: 1.6;">
                <strong>Target:</strong> ${monster.value}${monster.suit} (${monster.numValue} HP) ${location}
            </p>
            <p style="color: #aaa; font-size: 0.9em;">Choose your purification method:</p>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                <button class="btn btn-primary" id="btnPurifyRemove" style="background: linear-gradient(135deg, #ff6b6b, #ee5a52);">
                    🔥 Remove Forever
                </button>
                <button class="btn btn-primary" id="btnPurifyTransform" style="background: linear-gradient(135deg, #6bcf7f, #4ecdc4);">
                    💚 Transform to Potion
                </button>
            </div>
            <button class="btn" id="btnPurifyCancel" style="margin-top: 15px; background: #444; width: 100%;">
                ❌ Cancel
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
    
    document.getElementById('btnPurifyRemove').onclick = () => {
        overlay.remove();
        callback('remove');
    };
    document.getElementById('btnPurifyTransform').onclick = () => {
        overlay.remove();
        callback('transform');
    };
    document.getElementById('btnPurifyCancel').onclick = () => {
        overlay.remove();
        // Don't call callback - ability not used
    };
}

// ============================================
// ABILITY UI UPDATE
// ============================================

/**
 * Update the class ability button UI state
 */
export function updateAbilityUI() {
    const btn = document.getElementById('btnClassAbility');
    const cooldownDisplay = document.getElementById('abilityCooldownDisplay');
    const desc = document.getElementById('abilityDescription');
    
    if (!btn || !game.classData) return;
    
    // Scoundrel has no ability - disable button
    if (!game.classData.active) {
        btn.disabled = true;
        btn.style.opacity = '0.3';
        btn.style.display = 'none'; // Hide button for Scoundrel
        if (cooldownDisplay) cooldownDisplay.style.display = 'none';
        if (desc) desc.textContent = 'No abilities available';
        return;
    }
    
    // Show button for classes with abilities
    btn.style.display = 'block';
    
    if (game.classAbilityCooldown > 0) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        if (cooldownDisplay) {
            cooldownDisplay.textContent = `${game.classAbilityCooldown} rooms`;
            cooldownDisplay.style.display = 'block';
        }
    } else {
        btn.disabled = false;
        btn.style.opacity = '1';
        if (cooldownDisplay) cooldownDisplay.style.display = 'none';
    }
    
    // Show active buff
    if (desc) {
        if (game.classAbilityActive && game.classAbilityCounter > 0) {
            desc.innerHTML = `<strong style="color: #6bcf7f;">✨ ACTIVE! ${game.classAbilityCounter} uses left</strong>`;
        } else {
            desc.textContent = game.classData.active.description;
        }
    }
}

// ============================================
// START GAME WITH CLASS
// ============================================

/**
 * Initialize game state with selected class
 * @param {string} className - The class ID to start with
 */
export function startGameWithClass(className) {
    game.playerClass = className;
    game.classData = CLASSES[className];
    game.classAbilityCooldown = 0;
    game.classAbilityActive = false;
    game.classAbilityCounter = 0;
    // Call startGame from global scope (exposed by game.js)
    if (typeof window.startGame === 'function') {
        window.startGame();
    }
}

// ============================================
// GET PASSIVE ICONS
// ============================================

/**
 * Get passive icons for current player class
 * @returns {Array} Array of passive icon objects
 */
export function getPassiveIcons() {
    return PASSIVE_ICONS[game.playerClass] || [];
}

// ============================================
// GLOBAL EXPOSURE (for compatibility)
// ============================================
window.CLASSES = CLASSES;
window.checkClassUnlocks = checkClassUnlocks;
window.getBloodlustBonus = getBloodlustBonus;
window.updateAbilityUI = updateAbilityUI;
window.PASSIVE_ICONS = PASSIVE_ICONS;

/**
 * ============================================
 * GAME COMBAT MODULE
 * ============================================
 * Combat system: card handling, damage calculation, weapon/potion mechanics
 *
 * @module game-combat
 * @version 1.0.0
 * @author Gabriel Lima
 *
 * Dependências:
 * - game, permanentUnlocks (from game-state.js)
 * - COMBO, COMBAT, POTIONS, BOSS, TIMING, UI (from game-constants.js)
 * - getBloodlustBonus (from game-classes.js)
 * - window.showMessage, window.playSound, window.createParticles,
 *   window.showDamageNumber, window.screenShake, window.updateUI,
 *   window.earnGold, window.resetCombo, window.checkGameState,
 *   window.checkAchievements, window.updateRunningScore,
 *   window.getRelicBonus, window.updateRelicsDisplay, window.showCombo
 *   (exposed by game.js/helpers.js)
 */

// ============================================
// IMPORTS
// ============================================
import { game, permanentUnlocks, runRand } from './game-state.js?v=1.8.2';
import { COMBO, COMBAT, POTIONS, BOSS, TIMING, UI } from '../config/game-constants.js?v=1.8.2';
import { getBloodlustBonus } from './game-classes.js?v=1.8.2';

// ============================================
// COMBAT HELPER FUNCTIONS
// ============================================

/**
 * Game Log (stub - UI was removed for cleaner layout)
 * @param {string} message - Log message
 * @param {string} type - Log type (info, heal, danger, etc)
 */
export function addLog(message, type = 'info') {
    // (The log UI was removed for a cleaner layout)
}

/**
 * Calculate berserk bonus damage
 * @returns {number} Berserk bonus (0, 5, or 7)
 */
export function getBerserkBonus() {
    if (game.berserkStacks <= 0) return 0;
    // CRITICAL: Berserk bonus ONLY applies if weapon is equipped
    if (!game.equippedWeapon) return 0;
    return permanentUnlocks.berserkMaster ? 7 : 5;
}

/**
 * Calculate combo bonus damage
 * @returns {number} Combo bonus
 */
export function getComboBonus() {
    if (game.combo === 0) return 0;
    
    // CRITICAL: Combo bonus ONLY applies if weapon is equipped
    // Without weapon, you cannot deal damage regardless of combo
    if (!game.equippedWeapon) return 0;
    
    // Combo God: +2 damage per combo level (stacks with base)
    // Base: 2 combo = +1, 3 combo = +2, etc.
    // With Combo God: 2 combo = +2, 3 combo = +4, etc.
    const comboMultiplier = permanentUnlocks.comboGod ? 2 : 1;
    let bonus = game.combo >= COMBO.COMBO_MASTER_START + 1 ? (game.combo - 1) * comboMultiplier : 0;
    
    // Fire Ring: +1 damage per combo stack
    if (game.relics.some(r => r.id === 'ring_fire') && game.combo >= 1) {
        bonus += game.combo;
    }
    
    return bonus;
}

/**
 * Determine card type from card object
 * @param {Object} card - Card object
 * @returns {string} Card type: 'special', 'monster', 'weapon', 'potion'
 */
export function getCardType(card) {
    if (card.special) return 'special';
    if (card.isBoss) return 'monster'; // Boss is a monster!
    if (card.suitName === 'clubs' || card.suitName === 'spades') return 'monster';
    if (card.suitName === 'diamonds') return 'weapon';
    if (card.suitName === 'hearts') return 'potion';
}

// ============================================
// CARD HANDLERS
// ============================================

/**
 * Handle special card usage
 * @param {Object} card - Special card object
 * @param {number} index - Card index in room
 */
export function handleSpecial(card, index) {
    game.room.splice(index, 1);
    game.discardPile.push(card);
    game.stats.specialsUsed++;
    
    window.playSound('special');
    addLog(`Used special: ${card.special.name}`, 'heal');
    card.special.effect();
    
    window.updateUI();
    window.checkGameState();
    window.checkAchievements();
}

/**
 * Handle weapon equip
 * @param {Object} weapon - Weapon card object
 * @param {number} index - Card index in room
 */
export function handleWeapon(weapon, index) {
    if (game.equippedWeapon) {
        game.discardPile.push(game.equippedWeapon);
    }
    
    // BREAKING COMBO: Equiping weapon breaks combo (strategic choice!)
    if (game.combo > 0) {
        const brokenCombo = game.combo;
        window.resetCombo();
        if (brokenCombo >= 3) {
            window.showMessage(`💔 ${brokenCombo}x combo broken! (equipped weapon)`, 'warning');
        }
    }
    
    game.equippedWeapon = weapon;
    game.room.splice(index, 1);
    game.stats.weaponsEquipped++;
    
    // Set durability based on difficulty
    const durabilityMap = { easy: 3, normal: 2, hard: 1, endless: 2 };
    game.equippedWeapon.maxDurability = durabilityMap[game.difficulty] || 2;
    
    // Apply Knight bonus (+1 durability)
    if (game.classData && game.classData.passive.weaponDurabilityBonus) {
        game.equippedWeapon.maxDurability += game.classData.passive.weaponDurabilityBonus;
    }
    
    // Apply permanent unlock bonus (+1 durability)
    if (permanentUnlocks.durablePlus) {
        game.equippedWeapon.maxDurability += 1;
    }
    
    // Gloves relic: +1 durability
    if (game.relics.some(r => r.id === 'gloves')) {
        game.equippedWeapon.maxDurability += 1;
    }
    
    game.equippedWeapon.durability = game.equippedWeapon.maxDurability;
    
    // Master Smith: +1 damage when equipping weapon
    if (game.relics.some(r => r.id === 'master_smith')) {
        game.equippedWeapon.numValue += 1;
        window.showMessage('🔨 Master Smith enhanced your weapon (+1 damage)!', 'success');
    }
    
    // Check for Durable Weapons relic
    if (game.relics.some(r => r.id === 'durable_weapons')) {
        game.equippedWeapon.maxDurability = 999; // Infinite durability
        game.equippedWeapon.durability = 999;
    }
    
    window.playSound('equip');
    const powerBonus = window.getRelicBonus('totalPower');
    addLog(`Equipped ${weapon.value}${weapon.suit}!`, 'equip');
    window.showMessage(`⚔️ Equipped weapon with value ${weapon.numValue + powerBonus}! (${game.equippedWeapon.durability}/${game.equippedWeapon.maxDurability} uses)`, 'success');
    
    window.updateUI();
    window.checkGameState();
    window.checkAchievements();
}

/**
 * Handle potion usage
 * @param {Object} potion - Potion card object
 * @param {number} index - Card index in room
 */
export function handlePotion(potion, index) {
    // Calculate max potions per room
    // Base: 1 per room (DEFAULT_MAX_PER_ROOM)
    // Dancer passive: 2 per room (maxPotionsPerRoom)
    // Herb relic: 2 per room (DANCER_MAX_PER_ROOM)
    let maxPotionsPerRoom = POTIONS.DEFAULT_MAX_PER_ROOM;
    
    // Dancer class passive: 2 potions per room
    if (game.classData && game.classData.passive.maxPotionsPerRoom) {
        maxPotionsPerRoom = game.classData.passive.maxPotionsPerRoom;
    }
    
    // Herb relic: 2 potions per room (stacks with Dancer = still 2, not 4)
    if (game.relics.some(r => r.id === 'herb')) {
        maxPotionsPerRoom = Math.max(maxPotionsPerRoom, POTIONS.DANCER_MAX_PER_ROOM);
    }
    
    // Check if potion limit reached (per room - resets each room)
    if (game.potionsUsed >= maxPotionsPerRoom) {
        window.showMessage(`Only ${maxPotionsPerRoom} potion(s) per room! Discarding...`, 'warning');
        game.room.splice(index, 1);
        game.discardPile.push(potion);
        addLog(`Discarded potion ${potion.value}${potion.suit}`, 'info');
        window.updateUI();
        window.checkGameState();
        return;
    }

    // POTIONS DO NOT BREAK COMBO! (Strategic choice - different from weapons)
    // This allows for healing while maintaining combo chains
    
    const healBonus = window.getRelicBonus('totalHealBonus');
    // Add class bonus (Dancer: +3 HP)
    const classHealBonus = (game.classData && game.classData.passive.potionHealBonus) || 0;
    const ascPotion = window.ascensionEffects ? window.ascensionEffects(game.ascension).potionDelta : 0; // A9
    const heal = Math.max(1, potion.numValue + healBonus + classHealBonus + ascPotion);
    
    const oldHealth = game.health;
    game.health = Math.min(game.health + heal, game.maxHealth);
    const actualHeal = game.health - oldHealth;

    // Count the potion against the per-room limit whenever it is consumed,
    // even at full HP — otherwise potions drunk at full HP bypass the limit.
    game.potionsUsed++;
    game.stats.potionsUsed++;

    if (actualHeal > 0) {
        game.stats.totalHealing += actualHeal;
        window.showDamageNumber(actualHeal, 'heal');
        window.playSound('heal');
        addLog(`Used ${potion.value}${potion.suit}, healed ${actualHeal} HP`, 'heal');
        window.showMessage(`💚 Healed ${actualHeal} HP!`, 'success');
    } else {
         window.showMessage(`💚 HP is full!`, 'info');
    }
    
    game.room.splice(index, 1);
    game.discardPile.push(potion);
    window.updateUI();
    window.checkGameState();
    window.checkAchievements();
}

/**
 * Handle monster combat - the core combat function
 * @param {Object} monster - Monster card object
 * @param {number} index - Card index in room
 */
export function handleMonster(monster, index) {
    const powerBonus = window.getRelicBonus('totalPower');
    const baseWeapon = game.equippedWeapon ? game.equippedWeapon.numValue : 0;
    // Capture original values for the "One Shot Wonder" secret (10-value monster, 2-value weapon)
    const origMonsterValue = monster.numValue;
    
    // Calculate all bonuses using helpers (DRY principle)
    const berserkBonus = getBerserkBonus();
    const bloodlustBonus = getBloodlustBonus();
    const comboBonus = getComboBonus();
    
    // Power Gauntlet: +3 damage on first attack each room
    let gauntletBonus = 0;
    if (game.equippedWeapon && game.relics.some(r => r.id === 'gauntlet') && !game.firstAttackDone) {
        gauntletBonus = COMBAT.GAUNTLET_BONUS;
        game.firstAttackDone = true; // Mark first attack as done
    }
    
    // Thunder Gauntlet: 20% chance to deal double damage (flag only)
    let thunderCrit = false;
    if (game.relics.some(r => r.id === 'warrior') && runRand() < 0.2) {
        thunderCrit = true;
    }
    
    // Critical Strike permanent unlock: 10% chance to deal 3x damage (flag only)
    let criticalHit = false;
    if (permanentUnlocks.criticalStrike && runRand() < 0.1) {
        criticalHit = true;
    }
    
    // Add class ability bonuses
    let classBonus = 0;
    let rogueDoubleActive = false;
    let berserkerTripleActive = false;
    // CRITICAL: Class abilities ONLY apply if weapon is equipped
    if (game.equippedWeapon && game.classAbilityActive && game.classAbilityCounter > 0) {
        if (game.playerClass === 'rogue') {
            // Rogue: 2x damage on next attack
            rogueDoubleActive = true;
        } else if (game.playerClass === 'dancer') {
            // Dancer: +2 damage for next 2 monsters
            classBonus = COMBAT.DANCER_DAMAGE_BONUS;
        } else if (game.playerClass === 'berserker' && game.rageStrikeActive) {
            // Berserker: 3x damage on next attack
            berserkerTripleActive = true;
        }
    }
    
    const totalWeapon = baseWeapon + powerBonus + berserkBonus + classBonus + bloodlustBonus + comboBonus + gauntletBonus;
    let effectiveWeapon = game.doubleDamage ? totalWeapon * 2 : totalWeapon;
    
    // Thunder Gauntlet: 20% chance to deal double damage
    if (thunderCrit) {
        effectiveWeapon *= 2;
    }
    
    // Critical Strike permanent unlock: 10% chance to deal 3x damage
    if (criticalHit) {
        effectiveWeapon *= 3;
    }
    
    // Apply Rogue Shadow Strike (2x damage)
    if (rogueDoubleActive) {
        effectiveWeapon *= 2;
    }
    
    // Apply Berserker Rage Strike (3x damage)
    if (berserkerTripleActive) {
        effectiveWeapon *= 3;
    }
    
    // Track if weapon durability was already reduced (for boss battles)
    let weaponDurabilityReduced = false;
    
    // Boss battle: reduce HP instead of instant kill
    if (monster.isBoss) {
        // SPECIAL CASE: Boss without weapon - boss attacks once and flees!
        if (!game.equippedWeapon) {
            // Adventure bosses carry a capped .strike — their numValue is an
            // HP pool, and taking 26-46 damage for one click was an instant
            // unfair death. Classic bosses have no .strike: unchanged.
            const bossDamage = monster.strike || monster.numValue;
            game.health -= bossDamage;
            game.stats.totalDamage += bossDamage;
            game.lastDamageSource = monster.bossName || 'the Boss';
            window.resetCombo();

            // ADVENTURE: the boss is a one-off map encounter. Removing it would
            // empty the room and make checkGameState -> afterEncounterCleared count
            // the node as CLEARED, handing out the relic/victory for free. Keep the
            // boss in the room; the player must equip a weapon to actually beat it
            // (clicking with no weapon just keeps taking damage -> death, no free clear).
            if (game.adventureRun) {
                window.showMessage(`👹 ${monster.bossName || 'Boss'} struck you! Equip a weapon to fight it. -${bossDamage} HP`, 'danger');
                window.playSound('damage');
                window.screenShake();
                if (game.health <= 0) { window.updateUI(); window.checkGameState(); return; }
                window.updateUI();
                return;
            }

            // Remove boss from room
            game.room.splice(index, 1);
            game.discardPile.push(monster);
            
            window.showMessage(`👹 ${monster.bossName || 'Boss'} attacked and fled! -${bossDamage} HP (NO REWARD!)`, 'danger');
            window.playSound('damage');
            window.screenShake();
            window.createParticles(window.innerWidth / 2, window.innerWidth / 2, '#ff6b6b', 60);
            
            // Break combo
            window.resetCombo();
            
            // Check if player survived
            if (game.health <= 0) {
                window.updateUI();
                window.checkGameState(); // Will trigger death
                return;
            }
            
            // DECISION: If dungeon is empty, this is a "Boss Fled" victory (with penalty)
            // If dungeon has cards, boss respawns for another attempt
            if (game.dungeon.length === 0) {
                // Boss fled, dungeon empty = Victory with penalty (endGame gets
                // the 'boss_fled' reason directly — no flag needed)
                window.showMessage(`🏃 The ${monster.bossName || 'Boss'} fled into the shadows!`, 'warning');
                setTimeout(() => {
                    window.endGame('boss_fled');
                }, 1500);
            } else {
                // Dungeon has cards - boss will respawn, player can get weapon
                game.finalBossSpawned = false; // Allow respawn
                setTimeout(() => {
                    window.showMessage(`⚠️ No weapon! Find one and face the boss again!`, 'warning');
                }, 1500);
                window.updateUI();
                window.checkGameState();
            }
            return;
        }
        
        monster.numValue -= effectiveWeapon;

        // A boss hit is an attack: consume the same one-shot buffs the normal
        // path consumes below (both boss branches return before that block, so
        // Power/Berserk/Shadow Strike/Rage Strike used to multiply EVERY boss
        // hit and still be active after the fight).
        if (game.doubleDamage) game.doubleDamage = false;
        if (game.berserkStacks > 0 && berserkBonus > 0) {
            game.berserkStacks--;
            window.showMessage(`🔥 Berserk +5 damage! (${game.berserkStacks} left)`, 'info');
        }
        if (game.classAbilityActive && game.classAbilityCounter > 0) {
            game.classAbilityCounter--;
            if (game.classAbilityCounter === 0) {
                game.classAbilityActive = false;
                game.rageStrikeActive = false;
                window.showMessage('✨ Class ability buff expired!', 'info');
            }
        }

        // Weapon durability for boss attacks
        if (game.equippedWeapon && game.equippedWeapon.durability < 999) {
            game.equippedWeapon.durability--;
            weaponDurabilityReduced = true; // Mark that durability was already reduced
            
            if (game.equippedWeapon.durability <= 0) {
                // Weapon broke!
                window.showMessage(`💔 Your weapon broke!`, 'danger');
                window.playSound('error');
                game.discardPile.push(game.equippedWeapon);
                game.equippedWeapon = null;
                
                // Check if room is now cleared after weapon broke
                window.updateUI();
                window.checkGameState();
            }
        }
        
        if (monster.numValue <= 0) {
            // Boss defeated!
            game.stats.monstersSlain++;
            game.stats.bossesKilled++;  // Track for Berserker unlock

            // BUGFIX: Monster Tooth bonus for boss kills
            if (game.relics.some(r => r.id === 'tooth')) {
                window.earnGold(1);
            }

            // Check if this is the final boss
            if (monster.bossNumber === BOSS.FINAL_BOSS_NUMBER) {
                game.finalBossDefeated = true;
            }

            game.room.splice(index, 1);
            // Bosses are one-off encounter cards. In Adventure the discard is
            // recycled into the persistent run deck, so a defeated (≤0 HP)
            // boss would circulate forever and re-pay boss gold each cycle.
            if (!game.adventureRun) game.discardPile.push(monster);

            // Adventure: the fight ends when the guardian falls — surviving
            // entourage cards scatter back into the run deck (they are the
            // player's persistent deck cards, they must not be lost), which
            // empties the room so checkGameState clears the encounter.
            if (game.adventureRun && game.room.length) {
                game.dungeon.push(...game.room.splice(0));
            }

            // Boss gold based on difficulty
            const bossGoldByDifficulty = {
                easy: Math.floor(runRand() * 16) + 25,    // 25-40 gold
                normal: Math.floor(runRand() * 11) + 20,  // 20-30 gold
                hard: Math.floor(runRand() * 11) + 18,    // 18-28 gold (was 15-25: Hard paid least for the hardest fights)
                endless: Math.floor(runRand() * 11) + 20  // 20-30 gold
            };
            const bossGold = bossGoldByDifficulty[game.difficulty] || 20;
            window.earnGold(bossGold);
            
            // Victory messages based on boss
            const victoryMessages = [
                '⚔️ The Knight falls silent. The curse is broken...',
                '💉 The Warden collapses. The path ahead is now open.',
                '✨ The Shadow dissolves into nothingness. Light returns.',
                '🌟 The Abyss Keeper is no more. You are the legend now.'
            ];
            
            const victoryMsg = victoryMessages[Math.min(monster.bossNumber - 1, victoryMessages.length - 1)];
            
            window.showMessage(`👹 ${monster.bossName} DEFEATED! +${bossGold} GOLD!`, 'success');
            setTimeout(() => window.showMessage(victoryMsg, 'success'), TIMING.EVENT_DELAY);
            
            window.createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd700', 80);
            window.playSound('special');
            
            // Increment combo for boss kill
            game.combo++;
            game.stats.maxCombo = Math.max(game.stats.maxCombo, game.combo);
            
            window.updateUI();
            window.checkGameState();
            window.checkAchievements();
            return;
        } else {
            // Boss still alive - show HP remaining
            window.showMessage(`⚔️ Hit boss for ${effectiveWeapon} damage! Boss HP: ${monster.numValue}`, 'info');
            window.playSound('attack');
            window.updateUI();
            // DON'T return - let player continue in same room with boss
            return;
        }
    }
    
    let damage = Math.max(0, monster.numValue - effectiveWeapon);
    
    // === RELIC DEFENSE SYSTEM (BEFORE DAMAGE CALCULATION) ===
    
    // Mirror Shard: Reflect 2 damage once per room (BEFORE taking damage)
    const mirrorShardRelic = game.relics.find(r => r.id === 'mirror_shard');
    if (mirrorShardRelic && !mirrorShardRelic.usedThisRoom && damage > 0) {
        mirrorShardRelic.usedThisRoom = true;
        const reflectDamage = 2;
        monster.numValue -= reflectDamage;
        window.showMessage(`🪞 Mirror Shard reflected ${reflectDamage} damage!`, 'info');
        
        // Check if reflection killed the monster
        if (monster.numValue <= 0) {
            game.room.splice(index, 1);
            game.discardPile.push(monster);
            game.stats.monstersSlain++;
            game.combo++;
            game.stats.maxCombo = Math.max(game.stats.maxCombo, game.combo);
            
            // Monster Tooth bonus
            if (game.relics.some(r => r.id === 'tooth')) {
                window.earnGold(1);
            }
            
            addLog(`Mirror Shard defeated ${monster.value}${monster.suit}!`, 'success');
            window.showMessage('🪞 Mirror Shard killed the monster!', 'success');
            window.playSound('special');
            window.updateUI();
            window.checkGameState();
            return;
        }
    }
    
    // Thorns Armor permanent unlock: Reflect 2 damage (doesn't prevent damage to player)
    if (permanentUnlocks.thornsArmor && damage > 0) {
        monster.numValue -= 2;
        window.showMessage('🌵 Thorns Armor reflected 2 damage!', 'info');
        
        // Check if thorns killed the monster
        if (monster.numValue <= 0) {
            game.room.splice(index, 1);
            game.discardPile.push(monster);
            game.stats.monstersSlain++;
            
            // Still take damage but monster is dead
            game.health -= damage;
            game.stats.totalDamage += damage;
            window.showDamageNumber(damage, 'damage');
            
            // Monster Tooth bonus
            if (game.relics.some(r => r.id === 'tooth')) {
                window.earnGold(1);
            }
            
            addLog(`Thorns Armor defeated ${monster.value}${monster.suit}!`, 'success');
            window.showMessage('🌵 Thorns Armor killed the monster (after taking damage)!', 'warning');
            window.resetCombo();
            window.updateUI();
            window.checkGameState();
            return;
        }
    }
    
    // Weak Thorns: Reflect 1 damage (doesn't prevent damage to player) (stacks with thornsArmor)
    if (game.relics.some(r => r.id === 'weak_thorns') && damage > 0) {
        monster.numValue -= 1;
        window.showMessage('🌿 Weak Thorns reflected 1 damage!', 'info');
        
        // Check if thorns killed the monster
        if (monster.numValue <= 0) {
            game.room.splice(index, 1);
            game.discardPile.push(monster);
            game.stats.monstersSlain++;
            
            // Still take damage but monster is dead
            game.health -= damage;
            game.stats.totalDamage += damage;
            window.showDamageNumber(damage, 'damage');
            
            // Monster Tooth bonus
            if (game.relics.some(r => r.id === 'tooth')) {
                window.earnGold(1);
            }
            
            addLog(`Weak Thorns defeated ${monster.value}${monster.suit}!`, 'success');
            window.showMessage('🌿 Weak Thorns killed the monster (after taking damage)!', 'warning');
            window.resetCombo();
            window.updateUI();
            window.checkGameState();
            return;
        }
    }
    
    // Iron Armor: Reduce ALL damage by 1 (permanent effect)
    if (game.relics.some(r => r.id === 'armor') && damage > 0) {
        const originalDamage = damage;
        damage = Math.max(0, damage - 1);
        if (damage < originalDamage) {
            if (damage === 0) {
                window.showMessage(`🦾 Iron Armor absorbed all ${originalDamage} damage!`, 'success');
            } else {
                window.showMessage(`🦾 Iron Armor reduced damage! (${originalDamage} → ${damage})`, 'info');
            }
        }
    }
    
    // Stone Relic - Reduce first damage by 1 each room (stacks with armor)
    let stoneRelic = game.relics.find(r => r.id === 'stone' && !r.stoneUsed);
    if (stoneRelic && damage > 0) {
        stoneRelic.stoneUsed = true;
        const originalDamage = damage;
        damage = Math.max(0, damage - 1);
        if (damage === 0) {
            window.showMessage(`🪨 Stone absorbed all ${originalDamage} damage!`, 'success');
        } else {
            window.showMessage(`🪨 Stone reduced damage by 1! (${originalDamage} → ${damage})`, 'info');
        }
    }
    
    // Track if weapon was used for ATTACK (not just defense)
    // If dodge is active, weapon is not used (even if perfect kill)
    let weaponWasUsed = !game.dodgeActive;

    // Track if attack was made (for Power consumption)
    // Power should consume when attacking (with or without weapon)
    // But NOT when using defensive abilities (Dodge, Divine Blessing, etc)
    let attackWasMade = !game.dodgeActive;

    window.playSound('attack');

    // BUGFIX: Cloak relic negates first damage of the room
    const cloakRelic = game.relics.find(r => r.id === 'cloak' && !r.usedThisRoom);
    if (cloakRelic && damage > 0) {
        cloakRelic.usedThisRoom = true;
        damage = 0;
        window.showMessage('🧥 Cloak blocked damage!', 'success');
        weaponWasUsed = false;
        attackWasMade = false;
        game.combo++;
        game.stats.maxCombo = Math.max(game.stats.maxCombo, game.combo);
    }

    // Dodge (dodgeMaster: avoids 2 attacks instead of 1)
    if (game.dodgeActive && damage > 0) {
        // dodgeMaster unlock: dodge lasts 2 attacks
        if (!permanentUnlocks.dodgeMaster) {
            game.dodgeActive = false;
        } else {
            // Track dodge counter for dodgeMaster
            if (!game.dodgeCounter) game.dodgeCounter = 2;
            game.dodgeCounter--;
            if (game.dodgeCounter <= 0) {
                game.dodgeActive = false;
                game.dodgeCounter = 0;
            }
        }
        window.playSound('special');
        addLog(`Dodged attack from ${monster.value}${monster.suit}!`, 'heal');
        window.showMessage('🛡️ Dodged! No damage!', 'success');
    }
    // Priest Divine Blessing - 15% chance to dodge
    else if (damage > 0 && game.classData && game.classData.passive.divineBlessing && runRand() < COMBAT.DIVINE_BLESSING_CHANCE) {
        weaponWasUsed = false; // Divine Blessing = no weapon used
        attackWasMade = false; // Divine Blessing = no attack made
        window.playSound('special');
        addLog(`Divine Blessing! Dodged attack from ${monster.value}${monster.suit}!`, 'heal');
        window.showMessage('🕊️ Divine Blessing! No damage!', 'success');
        window.createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd700', 40);
        game.combo++;
        game.stats.maxCombo = Math.max(game.stats.maxCombo, game.combo);
    } 
    // Mirror Shield - Reflect damage
    else if (damage > 0 && game.mirrorShield > 0) {
        const reflected = Math.min(damage, game.mirrorShield);
        game.mirrorShield -= reflected;
        const remaining = damage - reflected;
        
        if (remaining > 0) {
            game.health -= remaining;
            game.stats.totalDamage += remaining;
            game.lastDamageSource = `a ${monster.value}${monster.suit} monster`;
            window.showDamageNumber(remaining, 'damage');
            window.playSound('damage');
        }
        
        window.showMessage(`🪞 Mirror reflected ${reflected} damage! Shield: ${game.mirrorShield}`, 'success');
        window.createParticles(window.innerWidth / 2, window.innerHeight / 2, '#a8edea', 30);
        
        if (remaining <= 0) {
            weaponWasUsed = false; // Mirror blocked all = no weapon used
            attackWasMade = false; // Mirror blocked all = no attack made
            game.combo++;
            game.stats.maxCombo = Math.max(game.stats.maxCombo, game.combo);
        } else {
            window.resetCombo();
        }
    }
    // Perfect Kill (ONLY if weapon is equipped!)
    else if (game.equippedWeapon && damage <= 0) {
        game.combo++;
        game.stats.maxCombo = Math.max(game.stats.maxCombo, game.combo);
        if (game.combo >= COMBO.COMBO_MASTER_START + 1) {
            window.showCombo(game.combo);
            window.playSound('combo');
        }
        
        // Lifesteal (relic + permanent unlock)
        let lifesteal = game.relics.filter(r => r.id === 'vampire').length * 2;
        
        // Permanent unlock: lifeSteal (1 HP on perfect kill)
        if (permanentUnlocks.lifeSteal) {
            lifesteal += 1;
        }
        
        if (lifesteal > 0) {
            game.health = Math.min(game.maxHealth, game.health + lifesteal);
            window.showMessage(`🧛 +${lifesteal} HP from Vampirism!`, 'success');
        }
        
        // Monster Tooth: +1 gold per monster
        if (game.relics.some(r => r.id === 'tooth')) {
            window.earnGold(1);
        }
        
        addLog(`Defeated ${monster.value}${monster.suit}! (Combo: ${game.combo})`, 'info');
        if (criticalHit) {
            window.showMessage(`💥 MEGA CRITICAL! ${game.combo}x COMBO!`, 'success');
            window.createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ff6b6b', 50);
        } else if (thunderCrit) {
            window.showMessage(`⚡ CRITICAL HIT! ${game.combo}x COMBO!`, 'success');
            window.createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd93d', 30);
        } else {
            window.showMessage(`⚔️ Perfect kill! ${game.combo}x COMBO!`, 'success');
        }
    }
    // TAKE DAMAGE: Monster hits you
    else {
        game.health -= damage;
        game.stats.totalDamage += damage;
        // Run-recap: remember the last thing that hurt us (shown on death)
        game.lastDamageSource = monster.isCurse
            ? `a ${monster.numValue}-power curse`
            : `a ${monster.value}${monster.suit} monster`;
        window.showDamageNumber(damage, 'damage');
        window.playSound('damage');

        // Different messages depending on whether weapon is equipped
        if (!game.equippedWeapon) {
            addLog(`No weapon! Took ${damage} damage from ${monster.value}${monster.suit}`, 'danger');
            window.showMessage(`⚠️ NO WEAPON! -${damage} HP`, 'danger');
        } else {
            addLog(`Monster hit you for ${damage} damage! ${monster.value}${monster.suit}`, 'danger');
            window.showMessage(`💥 Monster hits you! -${damage} HP`, 'danger');
        }

        window.screenShake();

        // BUGFIX: Rogue Shadow Strike is "combo safe" - don't reset combo
        const isRogueShadowStrikeActive = (
            game.playerClass === 'rogue' &&
            game.classAbilityActive &&
            game.classAbilityCounter > 0
        );

        if (!isRogueShadowStrikeActive) {
            window.resetCombo();
        }
    }
    
    // Reset Power (doubleDamage) ONLY if attack was made
    // Power consumes when attacking (with or without weapon)
    // But NOT when using defensive abilities (Dodge, Divine Blessing, Mirror, Cloak)
    if (attackWasMade && game.doubleDamage) {
        game.doubleDamage = false;
    }
    
    // Consume Berserk stack ONLY if attack was made
    // Same logic as Power: consumes when attacking, not when defending
    if (attackWasMade && game.berserkStacks > 0 && berserkBonus > 0) {
        game.berserkStacks--;
        window.showMessage(`🔥 Berserk +5 damage! (${game.berserkStacks} left)`, 'info');
    }
    
    // Weapon durability system - ONLY if weapon was actually USED
    // AND durability wasn't already reduced (boss battles reduce durability earlier)
    if (weaponWasUsed && game.equippedWeapon && game.equippedWeapon.durability < 999 && !weaponDurabilityReduced) {
        game.equippedWeapon.durability--;
        
        if (game.equippedWeapon.durability <= 0) {
            // Weapon broke!
            window.showMessage(`💔 Your weapon broke!`, 'danger');
            window.playSound('error');
            game.discardPile.push(game.equippedWeapon);
            game.equippedWeapon = null;
        } else {
            // Show remaining durability
            const emoji = game.equippedWeapon.durability === 1 ? '⚠️' : '⚔️';
            addLog(`${emoji} Weapon: ${game.equippedWeapon.durability}/${game.equippedWeapon.maxDurability} uses left`, 'info');
        }
    }
    
    // Decrement class ability counter ONLY if attack was made
    // Same logic as Power and Berserk: consumes when attacking, not when defending
    if (attackWasMade && game.classAbilityActive && game.classAbilityCounter > 0) {
        game.classAbilityCounter--;
        if (game.classAbilityCounter === 0) {
            game.classAbilityActive = false;
            game.rageStrikeActive = false; // Reset Berserker flag
            window.showMessage('✨ Class ability buff expired!', 'info');
        }
    }
    
    game.stats.monstersSlain++;
    // Secret: One Shot Wonder — defeat a 10-value monster with a 2-value weapon
    if (!monster.isBoss && baseWeapon === 2 && origMonsterValue === 10 && typeof window.unlockAchievement === 'function') {
        window.unlockAchievement('secret_1');
    }
    game.room.splice(index, 1);
    game.discardPile.push(monster);

    // Monster gold (difficulty-based, with boss bonus)
    if (monster.isBoss) {
        // Boss gold rewards (much more generous!)
        const bossGoldByDifficulty = {
            easy: Math.floor(runRand() * 16) + 25,    // 25-40 gold
            normal: Math.floor(runRand() * 11) + 20,  // 20-30 gold
            hard: Math.floor(runRand() * 11) + 18,    // 18-28 gold (was 15-25: Hard paid least for the hardest fights)
            endless: Math.floor(runRand() * 11) + 20  // 20-30 gold
        };
        const bossGold = bossGoldByDifficulty[game.difficulty] || 20;
        window.earnGold(bossGold);
        window.showMessage(`👹 BOSS DEFEATED! +${bossGold} gold!`, 'success');
        window.createParticles(window.innerWidth / 2, window.innerHeight / 2, '#d4af37', 50);
    } else {
        // Normal monster gold
        const goldByDifficulty = {
            easy: Math.floor(runRand() * 4) + 3,    // 3-6 gold
            normal: Math.floor(runRand() * 3) + 2,  // 2-4 gold
            hard: Math.floor(runRand() * 3) + 2,    // 2-4 gold (buffed from 1-2)
            endless: Math.floor(runRand() * 3) + 2  // 2-4 gold
        };
        let baseGold = goldByDifficulty[game.difficulty] || 2;
        // A7: monsters carry less gold on high Ascension
        const goldMult = window.ascensionEffects ? window.ascensionEffects(game.ascension).goldMult : 1;
        if (goldMult !== 1) baseGold = Math.max(1, Math.floor(baseGold * goldMult));
        window.earnGold(baseGold);
    }
    
    // Revive
    if (game.health <= 0) {
        const phoenix = game.relics.find(r => r.id === 'phoenix' && !r.used);
        if (phoenix) {
            phoenix.used = true;
            game.health = 10;
            window.showMessage('🐦 Phoenix Feather activated! Revived with 10 HP!', 'success');
            window.playSound('special');
            window.updateRelicsDisplay();
        }
    }
    
    window.updateRunningScore(); // Update score
    window.updateUI();
    window.checkGameState();
    window.checkAchievements();
}

// ============================================
// UNDO SYSTEM
// ============================================

/**
 * Save game state before action (for undo on Easy/Normal)
 */
export function saveGameState() {
    // Deep-copy the card objects: combat mutates them in place (boss HP,
    // sharpened weapons), so a shallow [...array] snapshot would let those
    // mutations survive an undo (hit boss → undo → hit again = free kill).
    game.lastGameState = {
        health: game.health,
        gold: game.gold,
        totalGoldEarned: game.totalGoldEarned,
        stats: { ...game.stats }, // else kill→undo loops inflate score/lifetime stats
        room: game.room.map(c => ({ ...c })),
        dungeon: game.dungeon.map(c => ({ ...c })),
        discardPile: game.discardPile.map(c => ({ ...c })),
        equippedWeapon: game.equippedWeapon ? {...game.equippedWeapon} : null,
        potionsUsed: game.potionsUsed,
        combo: game.combo,
        heldCard: game.heldCard ? (Array.isArray(game.heldCard) ? [...game.heldCard] : {...game.heldCard}) : null
    };
    game.undoAvailable = true;
}

/**
 * Undo the last move (restore previous state)
 */
export function undoLastMove() {
    if (!game.undoAvailable || !game.lastGameState) {
        window.showMessage('❌ No move to undo!', 'warning');
        return;
    }
    
    // Restore game state
    game.health = game.lastGameState.health;
    game.gold = game.lastGameState.gold;
    game.totalGoldEarned = game.lastGameState.totalGoldEarned;
    game.stats = { ...game.lastGameState.stats };
    game.room = game.lastGameState.room.map(c => ({ ...c }));
    game.dungeon = game.lastGameState.dungeon.map(c => ({ ...c }));
    game.discardPile = game.lastGameState.discardPile.map(c => ({ ...c }));
    game.equippedWeapon = game.lastGameState.equippedWeapon ? {...game.lastGameState.equippedWeapon} : null;
    game.potionsUsed = game.lastGameState.potionsUsed;
    game.combo = game.lastGameState.combo;
    game.heldCard = game.lastGameState.heldCard ? (Array.isArray(game.lastGameState.heldCard) ? [...game.lastGameState.heldCard] : {...game.lastGameState.heldCard}) : null;
    
    game.undoAvailable = false;
    game.lastGameState = null;
    
    window.showMessage('↩️ Move undone!', 'info');
    window.playSound('cardFlip');
    window.updateUI();
}

// ============================================
// CARD CLICK HANDLER (main entry point)
// ============================================

/**
 * Handle card click - routes to appropriate handler
 * @param {Object} card - Card object
 * @param {number} index - Card index in room
 */
export function handleCardClick(card, index) {
    if (game.gameOver) return;
    
    // Save state for undo (Easy/Normal only)
    if (game.difficulty === 'easy' || game.difficulty === 'normal') {
        saveGameState();
    }

    // Obliterate mode - remove ANY card permanently
    if (game.obliterateMode) {
        game.room.splice(index, 1);
        // Don't add to discard - it's obliterated!
        game.obliterateMode = false;
        window.showMessage('💥 Card OBLITERATED from existence!', 'success');
        window.playSound('special');
        window.createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ff6b6b', 40);
        
        // Track obliteration for achievement
        // Guarded write-through (storage.update try/catches the parse) — a raw
        // JSON.parse here threw mid-card-resolution on a corrupt key.
        if (window.storage) window.storage.update('scoundrel_lifetime_stats', (s) => { s.cardsObliterated = (s.cardsObliterated || 0) + 1; return s; });
        
        window.updateUI();
        window.checkGameState();
        window.checkAchievements();
        return;
    }

    const cardType = getCardType(card);

    if (cardType === 'monster') handleMonster(card, index);
    else if (cardType === 'weapon') handleWeapon(card, index);
    else if (cardType === 'potion') handlePotion(card, index);
    else if (cardType === 'special') handleSpecial(card, index);
}

// ============================================
// GLOBAL EXPOSURE (for compatibility)
// ============================================
window.addLog = addLog;
window.getBerserkBonus = getBerserkBonus;
window.getComboBonus = getComboBonus;
window.getCardType = getCardType;
window.handleSpecial = handleSpecial;
window.handleWeapon = handleWeapon;
window.handlePotion = handlePotion;
window.handleMonster = handleMonster;
window.saveGameState = saveGameState;
window.undoLastMove = undoLastMove;
window.handleCardClick = handleCardClick;

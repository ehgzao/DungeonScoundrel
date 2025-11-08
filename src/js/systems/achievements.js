/**
 * Achievements System Module
 * Handles achievement tracking, unlocking, and persistence
 * 50 total achievements across 4 tiers: Bronze, Silver, Gold, Platinum
 */

import { storage } from '../utils/storage.js';
import { STORAGE_KEYS } from '../utils/constants.js';

/**
 * Achievement System
 * Manages the 50-achievement progression system
 */
export class AchievementSystem {
    constructor(dependencies) {
        this.getLifetimeStat = dependencies.getLifetimeStat;
        this.showMessage = dependencies.showMessage || (() => {});
        this.playSound = dependencies.playSound || (() => {});
        this.updateAchievementCounter = dependencies.updateAchievementCounter || (() => {});
        
        // Define all 50 achievements
        this.ACHIEVEMENTS = this._defineAchievements();
        
        console.log('[ACHIEVEMENTS] System initialized with 50 achievements');
    }

    /**
     * Define all 50 achievements
     * @private
     */
    _defineAchievements() {
        return [
            // 🥉 BRONZE (25) - Easy achievements
            { id: 'first_blood', tier: 'bronze', icon: '⚔️', title: 'First Blood', description: 'Defeat your first monster', check: () => this.getLifetimeStat('monstersSlain') >= 1 },
            { id: 'baby_steps', tier: 'bronze', icon: '👶', title: 'Baby Steps', description: 'Clear your first room', check: () => this.getLifetimeStat('roomsCleared') >= 1 },
            { id: 'armed', tier: 'bronze', icon: '🗡️', title: 'Armed & Ready', description: 'Equip your first weapon', check: () => this.getLifetimeStat('weaponsEquipped') >= 1 },
            { id: 'healer', tier: 'bronze', icon: '💊', title: 'Healer', description: 'Use your first potion', check: () => this.getLifetimeStat('potionsUsed') >= 1 },
            { id: 'gold_digger', tier: 'bronze', icon: '💰', title: 'Gold Digger', description: 'Earn 100 gold (lifetime)', check: () => this.getLifetimeStat('totalGoldEarned') >= 100 },
            { id: 'shopper', tier: 'bronze', icon: '🛒', title: 'Window Shopper', description: 'Open the shop for the first time', check: () => this.getLifetimeStat('shopsVisited') >= 1 },
            { id: 'combo_starter', tier: 'bronze', icon: '🔥', title: 'Combo Starter', description: 'Get a 3x combo', check: () => this.getLifetimeStat('maxCombo') >= 3 },
            { id: 'monster_slayer', tier: 'bronze', icon: '⚔️', title: 'Monster Slayer', description: 'Defeat 10 monsters', check: () => this.getLifetimeStat('monstersSlain') >= 10 },
            { id: 'room_clearer', tier: 'bronze', icon: '🏰', title: 'Room Clearer', description: 'Clear 5 rooms', check: () => this.getLifetimeStat('roomsCleared') >= 5 },
            { id: 'warrior', tier: 'bronze', icon: '⚔️', title: 'Warrior', description: 'Equip 5 different weapons', check: () => this.getLifetimeStat('weaponsEquipped') >= 5 },
            { id: 'healthy', tier: 'bronze', icon: '💚', title: 'Healthy', description: 'Use 5 potions (lifetime)', check: () => this.getLifetimeStat('potionsUsed') >= 5 },
            { id: 'rich', tier: 'bronze', icon: '💎', title: 'Getting Rich', description: 'Earn 500 gold (lifetime)', check: () => this.getLifetimeStat('totalGoldEarned') >= 500 },
            { id: 'special_user', tier: 'bronze', icon: '✨', title: 'Special Forces', description: 'Use 3 special cards', check: () => this.getLifetimeStat('specialsUsed') >= 3 },
            { id: 'survivor', tier: 'bronze', icon: '❤️', title: 'Survivor', description: 'Complete a run with less than 5 HP', check: () => false }, // Checked in-game
            { id: 'avoidance', tier: 'bronze', icon: '🚪', title: 'Avoidance', description: 'Avoid 3 dungeons (lifetime)', check: () => this.getLifetimeStat('roomsAvoided') >= 3 },
            { id: 'collector', tier: 'bronze', icon: '🔮', title: 'Collector', description: 'Have 3 relics in a single run', check: () => false }, // Checked in-game
            { id: 'hoarder', tier: 'bronze', icon: '📌', title: 'Card Hoarder', description: 'Use hold mechanic 10 times', check: () => this.getLifetimeStat('cardsHeld') >= 10 },
            { id: 'easy_win', tier: 'bronze', icon: '🟢', title: 'Easy Victory', description: 'Win a game on Easy difficulty', check: () => this.getLifetimeStat('easyWins') >= 1 },
            { id: 'first_win', tier: 'bronze', icon: '🏆', title: 'First Victory', description: 'Win your first game', check: () => this.getLifetimeStat('gamesWon') >= 1 },
            { id: 'adventurer', tier: 'bronze', icon: '🗺️', title: 'Adventurer', description: 'Clear 20 rooms (lifetime)', check: () => this.getLifetimeStat('roomsCleared') >= 20 },
            { id: 'music_lover', tier: 'bronze', icon: '🎵', title: 'Music Lover', description: 'Win a game with music ON', check: () => false }, // Checked in-game
            { id: 'gambler', tier: 'bronze', icon: '🎰', title: 'Gambler', description: 'Use the Gamble card 5 times', check: () => this.getLifetimeStat('gambleCards') >= 5 },
            { id: 'destroyer', tier: 'bronze', icon: '💥', title: 'Destroyer', description: 'Obliterate 3 cards (lifetime)', check: () => this.getLifetimeStat('cardsObliterated') >= 3 },
            { id: 'time_traveler', tier: 'bronze', icon: '⏰', title: 'Time Traveler', description: 'Use Time Warp card', check: () => this.getLifetimeStat('timeWarps') >= 1 },
            { id: 'berserker_ach', tier: 'bronze', icon: '🔥', title: 'Berserker', description: 'Use Berserk mode 3 times', check: () => this.getLifetimeStat('berserkUses') >= 3 },
            
            // 🥈 SILVER (15) - Medium achievements
            { id: 'veteran', tier: 'silver', icon: '🎖️', title: 'Veteran', description: 'Win 5 games', check: () => this.getLifetimeStat('gamesWon') >= 5 },
            { id: 'massacre', tier: 'silver', icon: '⚔️', title: 'Massacre', description: 'Defeat 50 monsters', check: () => this.getLifetimeStat('monstersSlain') >= 50 },
            { id: 'dungeon_master', tier: 'silver', icon: '🏰', title: 'Dungeon Master', description: 'Clear 50 rooms', check: () => this.getLifetimeStat('roomsCleared') >= 50 },
            { id: 'normal_win', tier: 'silver', icon: '🟡', title: 'Normal Victory', description: 'Win on Normal difficulty', check: () => this.getLifetimeStat('normalWins') >= 1 },
            { id: 'combo_master', tier: 'silver', icon: '🔥', title: 'Combo Master', description: 'Get a 7x combo', check: () => this.getLifetimeStat('maxCombo') >= 7 },
            { id: 'wealthy', tier: 'silver', icon: '💰', title: 'Wealthy', description: 'Earn 2000 gold (lifetime)', check: () => this.getLifetimeStat('totalGoldEarned') >= 2000 },
            { id: 'relic_hunter', tier: 'silver', icon: '🔮', title: 'Relic Hunter', description: 'Have 5 relics in a single run', check: () => false }, // Checked in-game
            { id: 'arsenal', tier: 'silver', icon: '⚔️', title: 'Arsenal', description: 'Equip 25 weapons (lifetime)', check: () => this.getLifetimeStat('weaponsEquipped') >= 25 },
            { id: 'pharmacist', tier: 'silver', icon: '💊', title: 'Pharmacist', description: 'Use 25 potions (lifetime)', check: () => this.getLifetimeStat('potionsUsed') >= 25 },
            { id: 'special_ops', tier: 'silver', icon: '✨', title: 'Special Ops', description: 'Use 15 special cards', check: () => this.getLifetimeStat('specialsUsed') >= 15 },
            { id: 'speedrun', tier: 'silver', icon: '⏱️', title: 'Speedrunner', description: 'Win a game in under 1 minute', check: () => false }, // Checked in-game
            { id: 'iron_will', tier: 'silver', icon: '💪', title: 'Iron Will', description: 'Win with exactly 1 HP', check: () => false }, // Checked in-game
            { id: 'perfect_run', tier: 'silver', icon: '✨', title: 'Perfect Run', description: 'Clear 10 rooms with 10x combo', check: () => false }, // Checked in-game
            { id: 'shopaholic', tier: 'silver', icon: '🛍️', title: 'Shopaholic', description: 'Buy 30 items from shop (lifetime)', check: () => this.getLifetimeStat('itemsBought') >= 30 },
            { id: 'event_master', tier: 'silver', icon: '🎲', title: 'Event Master', description: 'Complete 20 events', check: () => this.getLifetimeStat('eventsCompleted') >= 20 },
            
            // 🥇 GOLD (9) - Hard achievements (5 secret)
            { id: 'legend', tier: 'gold', icon: '👑', title: 'Legend', description: 'Win 10 games', check: () => this.getLifetimeStat('gamesWon') >= 10 },
            { id: 'hard_win', tier: 'gold', icon: '🔴', title: 'Hard Victory', description: 'Win on Hard difficulty', check: () => this.getLifetimeStat('hardWins') >= 1 },
            { id: 'genocide', tier: 'gold', icon: '☠️', title: 'Genocide', description: 'Defeat 200 monsters', check: () => this.getLifetimeStat('monstersSlain') >= 200 },
            { id: 'conqueror', tier: 'gold', icon: '🏆', title: 'Conqueror', description: 'Clear 100 rooms', check: () => this.getLifetimeStat('roomsCleared') >= 100 },
            { id: 'combo_god', tier: 'gold', icon: '🔥', title: 'Combo God', description: 'Get a 15x combo', check: () => this.getLifetimeStat('maxCombo') >= 15 },
            { id: 'millionaire', tier: 'gold', icon: '💰', title: 'Millionaire', description: 'Earn 10,000 gold (lifetime)', check: () => this.getLifetimeStat('totalGoldEarned') >= 10000 },
            { id: 'secret_1', tier: 'gold', icon: '❓', title: '???', description: 'Secret Achievement', check: () => false, secret: true },
            { id: 'secret_2', tier: 'gold', icon: '❓', title: '???', description: 'Secret Achievement', check: () => false, secret: true },
            { id: 'secret_3', tier: 'gold', icon: '❓', title: '???', description: 'Secret Achievement', check: () => false, secret: true },
            
            // 💎 PLATINUM (1) - Ultimate achievement
            { id: 'platinum_trophy', tier: 'platinum', icon: '💎', title: 'Platinum Trophy', description: 'Unlock all other achievements', check: () => this.loadAchievements().length >= 49 }
        ];
    }

    /**
     * Load unlocked achievements from storage
     * @returns {Array<string>} Array of unlocked achievement IDs
     */
    loadAchievements() {
        return storage.get(STORAGE_KEYS.ACHIEVEMENTS, []);
    }

    /**
     * Save unlocked achievements to storage
     * @param {Array<string>} unlockedIds - Array of achievement IDs
     */
    saveAchievements(unlockedIds) {
        storage.set(STORAGE_KEYS.ACHIEVEMENTS, unlockedIds);
    }

    /**
     * Unlock a specific achievement
     * @param {string} achievementId - ID of achievement to unlock
     */
    unlockAchievement(achievementId) {
        const unlocked = this.loadAchievements();
        
        if (!unlocked.includes(achievementId)) {
            unlocked.push(achievementId);
            this.saveAchievements(unlocked);
            
            // Find achievement data
            const achievement = this.ACHIEVEMENTS.find(a => a.id === achievementId);
            if (achievement) {
                // Show notification
                this.showMessage(`🏆 Achievement Unlocked: ${achievement.icon} ${achievement.title}!`, 'success');
                this.playSound('special');
                
                // Update counter
                this.updateAchievementCounter();
                
                console.log('[ACHIEVEMENTS] Unlocked:', achievement.title);
            }
        }
    }

    /**
     * Check all achievements and unlock new ones
     */
    checkAllAchievements() {
        const unlocked = this.loadAchievements();
        const newlyUnlocked = [];
        
        this.ACHIEVEMENTS.forEach(achievement => {
            if (!unlocked.includes(achievement.id) && achievement.check()) {
                newlyUnlocked.push(achievement.id);
            }
        });
        
        // Unlock all newly achieved
        newlyUnlocked.forEach(id => this.unlockAchievement(id));
        
        return newlyUnlocked;
    }

    /**
     * Check achievements (main entry point)
     * Called from game after events
     */
    checkAchievements() {
        this.checkAllAchievements();
    }

    /**
     * Get achievement by ID
     * @param {string} id - Achievement ID
     * @returns {Object|null} Achievement object
     */
    getAchievement(id) {
        return this.ACHIEVEMENTS.find(a => a.id === id) || null;
    }

    /**
     * Get achievements by tier
     * @param {string} tier - Tier name
     * @returns {Array} Array of achievements
     */
    getAchievementsByTier(tier) {
        return this.ACHIEVEMENTS.filter(a => a.tier === tier);
    }

    /**
     * Get unlock progress
     * @returns {Object} Progress statistics
     */
    getProgress() {
        const unlocked = this.loadAchievements();
        
        return {
            total: this.ACHIEVEMENTS.length,
            unlocked: unlocked.length,
            bronze: this.ACHIEVEMENTS.filter(a => a.tier === 'bronze' && unlocked.includes(a.id)).length,
            silver: this.ACHIEVEMENTS.filter(a => a.tier === 'silver' && unlocked.includes(a.id)).length,
            gold: this.ACHIEVEMENTS.filter(a => a.tier === 'gold' && unlocked.includes(a.id)).length,
            platinum: this.ACHIEVEMENTS.filter(a => a.tier === 'platinum' && unlocked.includes(a.id)).length,
            percentage: Math.round((unlocked.length / this.ACHIEVEMENTS.length) * 100)
        };
    }
}

/**
 * Initialize achievement system and expose globally
 */
export function initializeAchievementSystem(dependencies) {
    const achievementSystem = new AchievementSystem(dependencies);
    
    // Expose functions globally (for backwards compatibility)
    window.loadAchievements = () => achievementSystem.loadAchievements();
    window.saveAchievements = (ids) => achievementSystem.saveAchievements(ids);
    window.unlockAchievement = (id) => achievementSystem.unlockAchievement(id);
    window.checkAchievements = () => achievementSystem.checkAchievements();
    window.checkAllAchievements = () => achievementSystem.checkAllAchievements();
    
    console.log('[ACHIEVEMENTS] System initialized and exposed globally');
    
    return achievementSystem;
}

export default AchievementSystem;

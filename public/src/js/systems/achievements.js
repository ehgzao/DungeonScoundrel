/* ============================================
   ACHIEVEMENTS SYSTEM
   50 Achievements (Bronze, Silver, Gold, Platinum)
   Extracted from game.js
   ============================================ */

// ===== 50 ACHIEVEMENTS SYSTEM =====
const ACHIEVEMENTS = [
    // 🥉 BRONZE (25) - Fáceis
    { id: 'tutorial_master', tier: 'bronze', icon: '🎓', title: 'Tutorial Master', description: 'Complete the in-game tutorial', check: () => localStorage.getItem('dungeon_scoundrel_tutorial_completed') === 'true' },
    { id: 'first_blood', tier: 'bronze', icon: '⚔️', title: 'First Blood', description: 'Defeat your first monster', check: () => getLifetimeStat('monstersSlain') >= 1 },
    { id: 'baby_steps', tier: 'bronze', icon: '👶', title: 'Baby Steps', description: 'Clear your first room', check: () => getLifetimeStat('roomsCleared') >= 1 },
    { id: 'armed', tier: 'bronze', icon: '🗡️', title: 'Armed & Ready', description: 'Equip your first weapon', check: () => getLifetimeStat('weaponsEquipped') >= 1 },
    { id: 'healer', tier: 'bronze', icon: '💊', title: 'Healer', description: 'Use your first potion', check: () => getLifetimeStat('potionsUsed') >= 1 },
    { id: 'gold_digger', tier: 'bronze', icon: '💰', title: 'Gold Digger', description: 'Earn 100 gold (lifetime)', check: () => getLifetimeStat('totalGoldEarned') >= 100 },
    { id: 'shopper', tier: 'bronze', icon: '🛒', title: 'Window Shopper', description: 'Open the shop for the first time', check: () => getLifetimeStat('shopsVisited') >= 1 },
    { id: 'combo_starter', tier: 'bronze', icon: '🔥', title: 'Combo Starter', description: 'Get a 3x combo', check: () => getLifetimeStat('maxCombo') >= 3 },
    { id: 'monster_slayer', tier: 'bronze', icon: '⚔️', title: 'Monster Slayer', description: 'Defeat 10 monsters', check: () => getLifetimeStat('monstersSlain') >= 10 },
    { id: 'room_clearer', tier: 'bronze', icon: '🏰', title: 'Room Clearer', description: 'Clear 5 rooms', check: () => getLifetimeStat('roomsCleared') >= 5 },
    { id: 'warrior', tier: 'bronze', icon: '⚔️', title: 'Warrior', description: 'Equip 5 different weapons', check: () => getLifetimeStat('weaponsEquipped') >= 5 },
    { id: 'healthy', tier: 'bronze', icon: '💚', title: 'Healthy', description: 'Use 5 potions (lifetime)', check: () => getLifetimeStat('potionsUsed') >= 5 },
    { id: 'rich', tier: 'bronze', icon: '💎', title: 'Getting Rich', description: 'Earn 500 gold (lifetime)', check: () => getLifetimeStat('totalGoldEarned') >= 500 },
    { id: 'special_user', tier: 'bronze', icon: '✨', title: 'Special Forces', description: 'Use 3 special cards', check: () => getLifetimeStat('specialsUsed') >= 3 },
    { id: 'survivor', tier: 'bronze', icon: '❤️', title: 'Survivor', description: 'Complete a run with less than 5 HP', check: () => false }, // Checked during game
    { id: 'avoidance', tier: 'bronze', icon: '🚪', title: 'Avoidance', description: 'Avoid 3 dungeons (lifetime)', check: () => getLifetimeStat('roomsAvoided') >= 3 },
    { id: 'collector', tier: 'bronze', icon: '🔮', title: 'Collector', description: 'Have 3 relics in a single run', check: () => false }, // Checked during game
    { id: 'hoarder', tier: 'bronze', icon: '📌', title: 'Card Hoarder', description: 'Use hold mechanic 10 times', check: () => getLifetimeStat('cardsHeld') >= 10 },
    { id: 'easy_win', tier: 'bronze', icon: '🟢', title: 'Easy Victory', description: 'Win a game on Easy difficulty', check: () => getLifetimeStat('easyWins') >= 1 },
    { id: 'first_win', tier: 'bronze', icon: '🏆', title: 'First Victory', description: 'Win your first game', check: () => getLifetimeStat('gamesWon') >= 1 },
    { id: 'adventurer', tier: 'bronze', icon: '🗺️', title: 'Adventurer', description: 'Clear 20 rooms (lifetime)', check: () => getLifetimeStat('roomsCleared') >= 20 },
    { id: 'music_lover', tier: 'bronze', icon: '🎵', title: 'Music Lover', description: 'Win a game with music ON', check: () => false }, // Checked during game
    { id: 'gambler', tier: 'bronze', icon: '🎰', title: 'Gambler', description: 'Use the Gamble card 5 times', check: () => getLifetimeStat('gambleCards') >= 5 },
    { id: 'destroyer', tier: 'bronze', icon: '💥', title: 'Destroyer', description: 'Obliterate 3 cards (lifetime)', check: () => getLifetimeStat('cardsObliterated') >= 3 },
    { id: 'time_traveler', tier: 'bronze', icon: '⏰', title: 'Time Traveler', description: 'Use Time Warp card', check: () => getLifetimeStat('timeWarps') >= 1 },
    { id: 'berserker_ach', tier: 'bronze', icon: '🔥', title: 'Berserker', description: 'Use Berserk mode 3 times', check: () => getLifetimeStat('berserkUses') >= 3 },
    
    // 🥈 SILVER (15) - Médias
    { id: 'veteran', tier: 'silver', icon: '🎖️', title: 'Veteran', description: 'Win 5 games', check: () => getLifetimeStat('gamesWon') >= 5 },
    { id: 'massacre', tier: 'silver', icon: '⚔️', title: 'Massacre', description: 'Defeat 50 monsters', check: () => getLifetimeStat('monstersSlain') >= 50 },
    { id: 'dungeon_master', tier: 'silver', icon: '🏰', title: 'Dungeon Master', description: 'Clear 50 rooms', check: () => getLifetimeStat('roomsCleared') >= 50 },
    { id: 'normal_win', tier: 'silver', icon: '🟡', title: 'Normal Victory', description: 'Win on Normal difficulty', check: () => getLifetimeStat('normalWins') >= 1 },
    { id: 'combo_master', tier: 'silver', icon: '🔥', title: 'Combo Master', description: 'Get a 7x combo', check: () => getLifetimeStat('maxCombo') >= 7 },
    { id: 'wealthy', tier: 'silver', icon: '💰', title: 'Wealthy', description: 'Earn 2000 gold (lifetime)', check: () => getLifetimeStat('totalGoldEarned') >= 2000 },
    { id: 'relic_hunter', tier: 'silver', icon: '🔮', title: 'Relic Hunter', description: 'Have 5 relics in a single run', check: () => false }, // Checked during game
    { id: 'arsenal', tier: 'silver', icon: '⚔️', title: 'Arsenal', description: 'Equip 25 weapons (lifetime)', check: () => getLifetimeStat('weaponsEquipped') >= 25 },
    { id: 'pharmacist', tier: 'silver', icon: '💊', title: 'Pharmacist', description: 'Use 25 potions (lifetime)', check: () => getLifetimeStat('potionsUsed') >= 25 },
    { id: 'special_ops', tier: 'silver', icon: '✨', title: 'Special Ops', description: 'Use 15 special cards', check: () => getLifetimeStat('specialsUsed') >= 15 },
    { id: 'speedrun', tier: 'silver', icon: '⏱️', title: 'Speedrunner', description: 'Win a game in under 1 minute', check: () => false }, // Checked during game
    { id: 'iron_will', tier: 'silver', icon: '💪', title: 'Iron Will', description: 'Win with exactly 1 HP', check: () => false }, // Checked during game
    { id: 'perfect_run', tier: 'silver', icon: '✨', title: 'Perfect Run', description: 'Clear 10 rooms with 10x combo', check: () => false }, // Checked during game
    { id: 'shopaholic', tier: 'silver', icon: '🛍️', title: 'Shopaholic', description: 'Buy 30 items from shop (lifetime)', check: () => getLifetimeStat('itemsBought') >= 30 },
    { id: 'event_master', tier: 'silver', icon: '🎲', title: 'Event Master', description: 'Complete 20 events', check: () => getLifetimeStat('eventsCompleted') >= 20 },
    
    // 🥇 GOLD (9) - Difíceis (5 secretas)
    { id: 'legend', tier: 'gold', icon: '👑', title: 'Legend', description: 'Win 10 games', check: () => getLifetimeStat('gamesWon') >= 10 },
    { id: 'hard_win', tier: 'gold', icon: '🔴', title: 'Hard Victory', description: 'Win on Hard difficulty', check: () => getLifetimeStat('hardWins') >= 1 },
    { id: 'genocide', tier: 'gold', icon: '☠️', title: 'Genocide', description: 'Defeat 200 monsters', check: () => getLifetimeStat('monstersSlain') >= 200 },
    { id: 'conqueror', tier: 'gold', icon: '🏆', title: 'Conqueror', description: 'Clear 100 rooms', check: () => getLifetimeStat('roomsCleared') >= 100 },
    
    // 🔒 SECRET GOLDS (5)
    { id: 'secret_1', tier: 'gold', icon: '🎯', title: 'One Shot Wonder', description: 'Defeat a 10-value monster with a 2-value weapon', check: () => false, secret: true },
    { id: 'secret_2', tier: 'gold', icon: '🍀', title: 'Lucky 7', description: 'Win with exactly 7 HP, 7 cards left, and 777 score', check: () => false, secret: true },
    { id: 'secret_3', tier: 'gold', icon: '🎰', title: 'High Roller', description: 'Win 10 Gamble cards in a row', check: () => false, secret: true },
    { id: 'secret_4', tier: 'gold', icon: '💎', title: 'Minimalist', description: 'Win with only 1 relic', check: () => false, secret: true },
    { id: 'secret_5', tier: 'gold', icon: '🌟', title: 'Untouchable', description: 'Win without taking any damage', check: () => false, secret: true },
    
    // 💎 PLATINUM (1) - Todas as outras
    { id: 'platinum', tier: 'platinum', icon: '💎', title: 'Master Scoundrel', description: 'Unlock ALL other achievements', check: () => {
        const unlockedAchs = JSON.parse(localStorage.getItem('dungeon_scoundrel_achievements') || '[]');
        return unlockedAchs.length >= 50; // All except platinum itself (51 total - 1 platinum)
    }}
];

// ============================================
// ACHIEVEMENTS FUNCTIONS
// ============================================
// ACHIEVEMENTS SYSTEM
// ============================================
function getLifetimeStat(stat) {
    const stats = storage.get('scoundrel_lifetime_stats', {});
    return stats[stat] || 0;
}

function loadAchievements() {
    return storage.get('dungeon_scoundrel_achievements', []);
}

function saveAchievements(unlockedIds) {
    storage.set('dungeon_scoundrel_achievements', unlockedIds);
}

function unlockAchievement(achievementId) {
    const unlocked = loadAchievements();
    if (!unlocked.includes(achievementId)) {
        unlocked.push(achievementId);
        saveAchievements(unlocked);
        
        const ach = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (ach) {
            showAchievementToast(ach);
            // Safe calls to functions that may not be loaded yet
            if (typeof playSound !== 'undefined') playSound('special');
            if (typeof createParticles !== 'undefined') {
                createParticles(window.innerWidth / 2, window.innerHeight / 3, '#ffd700', 50);
            }
        }
        
        updateAchievementCounter();
        return true;
    }
    return false;
}

// Track active achievement toasts for stacking
let achievementToastCount = 0;

function showAchievementToast(achievement) {
    const toast = document.createElement('div');
    toast.className = 'message success achievement-toast';
    
    // Position à direita, empilhado progressivamente
    const topPosition = 80 + (achievementToastCount * 130); // 130px de espaço entre toasts
    achievementToastCount++;
    
    toast.style.cssText = `
        position: fixed; 
        top: ${topPosition}px; 
        right: 20px; 
        z-index: 9999; 
        min-width: 320px;
        max-width: 350px;
        animation: slideInRight 0.5s ease;
        box-shadow: 0 10px 40px rgba(255, 215, 0, 0.4);
    `;
    
    toast.innerHTML = `
        <div style="font-size: 1.3em;">🏆 ACHIEVEMENT!</div>
        <div style="font-size: 1.1em; margin-top: 5px;">${achievement.icon} ${achievement.title}</div>
        <div style="font-size: 0.9em; margin-top: 3px; opacity: 0.8;">${achievement.description}</div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => {
            toast.remove();
            achievementToastCount--;
        }, 500);
    }, 4000);
}

function checkAllAchievements() {
    let newlyUnlocked = [];
    const unlocked = loadAchievements();
    
    ACHIEVEMENTS.forEach(ach => {
        if (!unlocked.includes(ach.id) && ach.check()) {
            if (unlockAchievement(ach.id)) {
                newlyUnlocked.push(ach.title);
            }
        }
    });
    
    return newlyUnlocked;
}

function updateAchievementCounter() {
    const unlocked = loadAchievements();
    achievementCounter.textContent = `${unlocked.length}/50`;
}

function updateAchievementsDisplay() {
    const unlocked = loadAchievements();
    
    // Update counters
    const bronze = ACHIEVEMENTS.filter(a => a.tier === 'bronze');
    const silver = ACHIEVEMENTS.filter(a => a.tier === 'silver');
    const gold = ACHIEVEMENTS.filter(a => a.tier === 'gold');
    const platinum = ACHIEVEMENTS.filter(a => a.tier === 'platinum');
    
    const bronzeUnlocked = bronze.filter(a => unlocked.includes(a.id)).length;
    const silverUnlocked = silver.filter(a => unlocked.includes(a.id)).length;
    const goldUnlocked = gold.filter(a => unlocked.includes(a.id)).length;
    const platinumUnlocked = platinum.filter(a => unlocked.includes(a.id)).length;
    
    document.getElementById('achievementStats').textContent = `${unlocked.length}/50 Unlocked`;
    document.getElementById('bronzeCount').textContent = `${bronzeUnlocked}/25`;
    document.getElementById('silverCount').textContent = `${silverUnlocked}/15`;
    document.getElementById('goldCount').textContent = `${goldUnlocked}/9`;
    document.getElementById('platinumCount').textContent = `${platinumUnlocked}/1`;
    
    // Render achievement cards
    achievementsList.innerHTML = ACHIEVEMENTS.map(ach => {
        const isUnlocked = unlocked.includes(ach.id);
        const isSecret = ach.secret && !isUnlocked;
        
        return `
            <div class="achievement-card ${ach.tier} ${isUnlocked ? 'unlocked' : 'locked'} ${isSecret ? 'secret' : ''}">
                <div class="achievement-header">
                    <span class="achievement-medal">${ach.icon}</span>
                    <span class="achievement-title">${isSecret ? '???' : ach.title}</span>
                </div>
                ${!isSecret ? `<div class="achievement-description">${ach.description}</div>` : ''}
            </div>
        `;
    }).join('');
}

// Expose globally for codex.js
window.ACHIEVEMENTS = ACHIEVEMENTS;
window.loadAchievements = loadAchievements;

// Log module load
console.log('[ACHIEVEMENTS] 50 Achievements system loaded');
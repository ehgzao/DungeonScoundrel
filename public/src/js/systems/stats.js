/* ============================================
   STATS SYSTEM
   Permanent Stats (LocalStorage)
   Extracted from game.js
   ============================================ */

// ============================================
function loadPermanentStats() {
    const saved = localStorage.getItem('scoundrel_permanent_stats');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Update global
            Object.assign(permanentStats, parsed);
            return parsed; // Return for Cloud Save
        } catch(e) {
            permanentStats = { gamesWon: 0, hardWins: 0, fastestWin: 0 };
            return permanentStats;
        }
    } else {
        permanentStats = { gamesWon: 0, hardWins: 0, fastestWin: 0 };
        return permanentStats;
    }
}

function savePermanentStats() {
    localStorage.setItem('scoundrel_permanent_stats', JSON.stringify(permanentStats));
    
    // Auto-save to cloud if logged in
    if (window.currentUser && window.saveProgressToCloud) {
        window.saveProgressToCloud().catch(err => console.warn('Cloud auto-save failed:', err));
    }
}

// Expose functions globally for firebase-auth.js
window.loadPermanentStats = loadPermanentStats;
window.savePermanentStats = savePermanentStats;

function getTotalStat(stat) {
    const stats = storage.get('scoundrel_lifetime_stats', {});
    return stats[stat] || 0;
}

function updateLifetimeStats(reason = '', gaveUp = false) {
    storage.update('scoundrel_lifetime_stats', stats => ({
        ...stats,
        // Track deaths only for real deaths (not victories, not gave up)
        deaths: (reason === 'death' && !gaveUp) ? (stats.deaths || 0) + 1 : (stats.deaths || 0),
        monstersSlain: (stats.monstersSlain || 0) + game.stats.monstersSlain,
        roomsCleared: (stats.roomsCleared || 0) + game.stats.roomsCleared,
        potionsUsed: (stats.potionsUsed || 0) + game.stats.potionsUsed,
        totalGoldEarned: (stats.totalGoldEarned || 0) + game.totalGoldEarned,
        maxCombo: Math.max((stats.maxCombo || 0), game.stats.maxCombo),
        weaponsEquipped: (stats.weaponsEquipped || 0) + game.stats.weaponsEquipped,
        specialsUsed: (stats.specialsUsed || 0) + game.stats.specialsUsed,
        roomsAvoided: (stats.roomsAvoided || 0) + game.stats.roomsAvoided,
        cardsHeld: (stats.cardsHeld || 0) + game.stats.cardsHeld,
        gamesWon: (stats.gamesWon || 0) + game.stats.gamesWon,
        // Difficulty-specific wins
        easyWins: game.stats.gamesWon > 0 && game.difficulty === 'easy' ? (stats.easyWins || 0) + 1 : (stats.easyWins || 0),
        normalWins: game.stats.gamesWon > 0 && game.difficulty === 'normal' ? (stats.normalWins || 0) + 1 : (stats.normalWins || 0),
        hardWins: game.stats.gamesWon > 0 && game.difficulty === 'hard' ? (stats.hardWins || 0) + 1 : (stats.hardWins || 0),
        // Class unlock tracking
        bossesKilled: (stats.bossesKilled || 0) + game.stats.bossesKilled,
        totalRelicsCollected: (stats.totalRelicsCollected || 0) + game.stats.relicsCollected,
        eventsTriggered: (stats.eventsTriggered || 0) + game.stats.eventsTriggered
    }));
    
    // Check achievements after updating stats
    checkAllAchievements();
    
    // Check for newly available upgrades
    checkNewUnlocksAvailable();
}

function checkNewUnlocksAvailable() {
    // Check which upgrades just became available
    const newlyAvailable = [];
    
    UNLOCKS.forEach(unlock => {
        const isUnlocked = permanentUnlocks[unlock.id];
        const wasChecked = localStorage.getItem(`upgrade_notified_${unlock.id}`);
        
        // If not yet unlocked, not yet notified, and now available
        if (!isUnlocked && !wasChecked && unlock.check()) {
            newlyAvailable.push(unlock);
            // Mark as notified so we don't show again
            localStorage.setItem(`upgrade_notified_${unlock.id}`, 'true');
        }
    });
    
    // Show toast for each new upgrade (with delay between them)
    newlyAvailable.forEach((unlock, index) => {
        setTimeout(() => {
            showUpgradeAvailableToast(unlock);
        }, index * 2000); // 2s delay between notifications
    });
}

function showUpgradeAvailableToast(unlock) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 120px;
        right: 20px;
        background: linear-gradient(135deg, #ffd700 0%, #c9a961 100%);
        color: #1a1410;
        padding: 15px 20px;
        border-radius: 12px;
        font-family: 'Cinzel', serif;
        font-weight: 600;
        font-size: 0.95em;
        z-index: 10000;
        box-shadow: 0 8px 24px rgba(255, 215, 0, 0.6), 0 0 0 3px rgba(255, 215, 0, 0.3);
        animation: slideInRight 0.5s ease-out, pulse 2s ease-in-out infinite;
        cursor: pointer;
        max-width: 320px;
    `;
    
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 2em;">🎁</div>
            <div>
                <div style="font-size: 1.1em; margin-bottom: 4px;">UPGRADE AVAILABLE!</div>
                <div style="font-size: 0.85em; opacity: 0.9;">${unlock.name}</div>
                <div style="font-size: 0.75em; opacity: 0.75; margin-top: 2px;">${unlock.requirement}</div>
            </div>
        </div>
    `;
    
    // Click to open CODEX
    toast.onclick = () => {
        toast.remove();
        // Open CODEX upgrades tab
        const codexBtn = document.getElementById('btnCodEx');
        if (codexBtn) codexBtn.click();
    };
    
    document.body.appendChild(toast);
    
    // Remove after 6 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.5s ease-in';
        setTimeout(() => toast.remove(), 500);
    }, 6000);
    
    // Play sound
    playSound('special');
}

// ============================================


// Log module load

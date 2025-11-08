// ============================================
// CODEX SYSTEM - Unified UI for Upgrades, Relics, Achievements
// ============================================
// Version: 1.3.2
// Author: Gabriel Lima
// Date: 2025-01-08

/**
 * Opens the CODEX modal with the specified tab
 * @param {string} tab - Tab to open: 'upgrades', 'relics', or 'achievements'
 */
function openCodex(tab = 'upgrades') {
    console.log('[CODEX] Opening CODEX with tab:', tab);
    
    // Populate all tabs
    populateUpgradesList();
    populateRelicsGlossary('all');
    populateAchievementsList();
    
    // Switch to requested tab
    switchCodexTab(tab);
    
    // Open modal
    const codexModal = document.getElementById('codexModal');
    codexModal.classList.add('active');
    
    // Accessibility
    if (typeof trapFocus === 'function') {
        trapFocus(codexModal);
    }
    if (typeof hapticFeedback === 'function') {
        hapticFeedback('light');
    }
}

/**
 * Switches between CODEX tabs
 * @param {string} tabName - Tab to switch to: 'upgrades', 'relics', or 'achievements'
 */
function switchCodexTab(tabName) {
    console.log('[CODEX] Switching to tab:', tabName);
    
    // Hide all content
    document.querySelectorAll('.codex-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Reset all tab styles
    document.querySelectorAll('.codex-tab').forEach(tab => {
        tab.style.background = 'linear-gradient(180deg, #3d3328 0%, #2a2318 100%)';
        tab.style.borderColor = '#5a4a38';
        tab.style.color = '#c9a961';
    });
    
    // Show selected content
    const tabNameCapitalized = tabName.charAt(0).toUpperCase() + tabName.slice(1);
    const content = document.getElementById(`codexContent${tabNameCapitalized}`);
    if (content) {
        content.style.display = 'block';
    }
    
    // Highlight selected tab
    const selectedTab = document.getElementById(`codexTab${tabNameCapitalized}`);
    if (selectedTab) {
        selectedTab.style.background = 'linear-gradient(180deg, #4a3d2f 0%, #342820 100%)';
        selectedTab.style.borderColor = '#d4af37';
        selectedTab.style.color = '#d4af37';
    }
}

/**
 * Populates the Upgrades list in CODEX
 */
function populateUpgradesList() {
    const upgradesList = document.getElementById('upgradesList');
    if (!upgradesList) {
        console.warn('[CODEX] upgradesList element not found');
        return;
    }
    
    // Check if UNLOCKS array exists
    if (typeof UNLOCKS === 'undefined' || !window.UNLOCKS) {
        console.warn('[CODEX] UNLOCKS data not available');
        upgradesList.innerHTML = '<p style="text-align: center; color: #aaa;">Upgrades data not available. Please start a game first.</p>';
        return;
    }
    
    // Check if permanentUnlocks exists
    if (typeof permanentUnlocks === 'undefined' || !window.permanentUnlocks) {
        console.warn('[CODEX] permanentUnlocks not available');
        upgradesList.innerHTML = '<p style="text-align: center; color: #aaa;">Loading upgrades data...</p>';
        return;
    }
    
    try {
        upgradesList.innerHTML = UNLOCKS.map(unlock => {
            const isUnlocked = permanentUnlocks[unlock.id];
            const canUnlock = !isUnlocked && (typeof unlock.check === 'function' ? unlock.check() : false);
            
            return `
            <div class="unlock-item ${isUnlocked ? 'unlocked' : (canUnlock ? '' : 'locked')}">
                <div class="item-info">
                    <div class="item-name">${unlock.name}</div>
                    <div class="item-description">${unlock.description}</div>
                    <div class="unlock-requirement">
                        ${isUnlocked ? '✅ UNLOCKED' : 
                          (canUnlock ? '✨ READY TO UNLOCK!' : `🔒 ${unlock.requirement}`)}
                    </div>
                </div>
                ${!isUnlocked && canUnlock ? `
                    <button class="buy-btn" onclick="unlockUpgradeWrapper('${unlock.id}')">
                        Unlock
                    </button>
                ` : ''}
            </div>
            `;
        }).join('');
    } catch (error) {
        console.error('[CODEX] Error populating upgrades:', error);
        upgradesList.innerHTML = '<p style="text-align: center; color: #ff6b6b;">Error loading upgrades. Please refresh the page.</p>';
    }
}

/**
 * Populates the Relics glossary in CODEX
 * @param {string} rarityFilter - Rarity to filter: 'all', 'common', 'uncommon', 'rare', 'legendary'
 */
function populateRelicsGlossary(rarityFilter = 'all') {
    const glossary = document.getElementById('relicsGlossary');
    if (!glossary) {
        console.warn('[CODEX] relicsGlossary element not found');
        return;
    }
    
    // Check if RELICS array exists
    if (typeof RELICS === 'undefined' || !window.RELICS) {
        console.warn('[CODEX] RELICS data not available');
        glossary.innerHTML = '<p style="text-align: center; color: #aaa;">Relics data not available. Please start a game first.</p>';
        return;
    }
    
    let filteredRelics = rarityFilter === 'all' 
        ? RELICS 
        : RELICS.filter(r => r.rarity === rarityFilter);
    
    const rarityOrder = ['common', 'uncommon', 'rare', 'legendary'];
    const rarityColors = {
        common: { bg: 'rgba(170, 170, 170, 0.1)', border: '#aaa', emoji: '⚪', name: 'Common' },
        uncommon: { bg: 'rgba(107, 207, 127, 0.1)', border: '#6bcf7f', emoji: '🟢', name: 'Uncommon' },
        rare: { bg: 'rgba(74, 158, 255, 0.1)', border: '#4a9eff', emoji: '🔵', name: 'Rare' },
        legendary: { bg: 'rgba(255, 152, 0, 0.1)', border: '#ff9800', emoji: '🟠', name: 'Legendary' }
    };
    
    let html = '';
    
    if (rarityFilter === 'all') {
        // Group by rarity
        rarityOrder.forEach(rarity => {
            const relicsInRarity = RELICS.filter(r => r.rarity === rarity);
            if (relicsInRarity.length === 0) return;
            
            const colors = rarityColors[rarity];
            html += `
                <div style="margin-bottom: 25px;">
                    <h3 style="color: ${colors.border}; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 1.1em; font-family: 'Cinzel', serif;">
                        ${colors.emoji} ${colors.name} (${relicsInRarity.length})
                    </h3>
                    <div style="display: grid; gap: 10px;">
            `;
            
            relicsInRarity.forEach(relic => {
                html += createRelicCard(relic, colors);
            });
            
            html += `
                    </div>
                </div>
            `;
        });
    } else {
        // Single rarity
        const colors = rarityColors[rarityFilter];
        html += '<div style="display: grid; gap: 10px;">';
        filteredRelics.forEach(relic => {
            html += createRelicCard(relic, colors);
        });
        html += '</div>';
    }
    
    glossary.innerHTML = html;
}

/**
 * Creates HTML for a single relic card
 * @param {Object} relic - Relic object
 * @param {Object} colors - Color scheme for the rarity
 * @returns {string} HTML string
 */
function createRelicCard(relic, colors) {
    // Split name into icon and text
    const nameParts = relic.name.split(' ');
    const icon = nameParts[0];
    const name = nameParts.slice(1).join(' ');
    
    return `
        <div style="
            background: ${colors.bg};
            border: 2px solid ${colors.border};
            border-radius: 8px;
            padding: 12px 15px;
            transition: all 0.2s ease;
            cursor: default;
        " onmouseover="this.style.borderColor='#c9a961'; this.style.transform='translateX(5px)'" onmouseout="this.style.borderColor='${colors.border}'; this.style.transform='translateX(0)'">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                <span style="font-size: 1.3em;">${icon}</span>
                <span style="color: #d4af37; font-weight: bold; font-size: 1.05em; font-family: 'Cinzel', serif;">${name}</span>
            </div>
            <p style="color: #ddd; font-size: 0.9em; margin: 0; line-height: 1.5;">${relic.description}</p>
        </div>
    `;
}

/**
 * Populates the Achievements list in CODEX
 */
function populateAchievementsList() {
    const achievementsList = document.getElementById('achievementsList');
    if (!achievementsList) {
        console.warn('[CODEX] achievementsList element not found');
        return;
    }
    
    // Check if ACHIEVEMENTS array exists
    if (typeof ACHIEVEMENTS === 'undefined' || !window.ACHIEVEMENTS) {
        console.warn('[CODEX] ACHIEVEMENTS data not available');
        achievementsList.innerHTML = '<p style="text-align: center; color: #aaa;">Achievements data not available. Please start a game first.</p>';
        return;
    }
    
    const categories = ['bronze', 'silver', 'gold', 'platinum'];
    const tierColors = {
        bronze: '#cd7f32',
        silver: '#c0c0c0',
        gold: '#ffd700',
        platinum: '#e5e4e2'
    };
    const tierIcons = {
        bronze: '🥉',
        silver: '🥈',
        gold: '🥇',
        platinum: '💎'
    };
    
    let html = '';
    
    categories.forEach(tier => {
        const tierAchievements = ACHIEVEMENTS.filter(a => a.tier === tier);
        if (tierAchievements.length === 0) return;
        
        html += `
            <div style="margin-bottom: 20px;">
                <h3 style="color: ${tierColors[tier]}; text-transform: uppercase; margin-bottom: 10px; font-family: 'Cinzel', serif; letter-spacing: 0.05em;">
                    ${tierIcons[tier]} ${tier} (${tierAchievements.length})
                </h3>
                <div style="display: grid; gap: 8px;">
        `;
        
        tierAchievements.forEach(achievement => {
            const unlocked = playerAchievements && playerAchievements[achievement.id];
            html += `
                <div style="
                    background: ${unlocked ? 'rgba(107, 207, 127, 0.1)' : 'rgba(90, 74, 56, 0.3)'};
                    border: 2px solid ${unlocked ? '#6bcf7f' : '#5a4a38'};
                    border-radius: 6px;
                    padding: 10px 12px;
                    opacity: ${unlocked ? '1' : '0.6'};
                    transition: all 0.2s ease;
                " onmouseover="this.style.borderColor='${unlocked ? '#d4af37' : '#6b5a48'}'" onmouseout="this.style.borderColor='${unlocked ? '#6bcf7f' : '#5a4a38'}'">
                    <div style="font-weight: bold; margin-bottom: 4px; color: ${unlocked ? '#6bcf7f' : '#c9a961'};">
                        ${unlocked ? '✅' : '🔒'} ${achievement.name}
                    </div>
                    <div style="font-size: 0.85em; color: #bbb;">
                        ${achievement.description}
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    achievementsList.innerHTML = html;
    
    // Update stats
    if (playerAchievements) {
        const unlockedCount = Object.keys(playerAchievements).length;
        const statsElement = document.getElementById('achievementStatsCodex');
        if (statsElement) {
            statsElement.textContent = `${unlockedCount}/50 Unlocked`;
        }
        
        const bronzeCount = ACHIEVEMENTS.filter(a => a.tier === 'bronze' && playerAchievements[a.id]).length;
        const silverCount = ACHIEVEMENTS.filter(a => a.tier === 'silver' && playerAchievements[a.id]).length;
        const goldCount = ACHIEVEMENTS.filter(a => a.tier === 'gold' && playerAchievements[a.id]).length;
        const platinumCount = ACHIEVEMENTS.filter(a => a.tier === 'platinum' && playerAchievements[a.id]).length;
        
        const bronzeEl = document.getElementById('bronzeCountCodex');
        const silverEl = document.getElementById('silverCountCodex');
        const goldEl = document.getElementById('goldCountCodex');
        const platinumEl = document.getElementById('platinumCountCodex');
        
        if (bronzeEl) bronzeEl.textContent = `${bronzeCount}/25`;
        if (silverEl) silverEl.textContent = `${silverCount}/15`;
        if (goldEl) goldEl.textContent = `${goldCount}/9`;
        if (platinumEl) platinumEl.textContent = `${platinumCount}/1`;
    }
}

/**
 * Filters relics by rarity and updates UI
 * @param {string} rarity - Rarity to filter by
 */
function filterRelicsByRarity(rarity) {
    console.log('[CODEX] Filtering relics by:', rarity);
    
    populateRelicsGlossary(rarity);
    
    // Update button styles
    document.querySelectorAll('.rarity-filter-btn').forEach(btn => {
        if (btn.dataset.rarity === rarity) {
            btn.classList.add('active');
            btn.style.opacity = '1';
            btn.style.transform = 'scale(1.05)';
        } else {
            btn.classList.remove('active');
            btn.style.opacity = '0.6';
            btn.style.transform = 'scale(1)';
        }
    });
}

// ============================================
// INITIALIZATION
// ============================================

// Wait for DOM and game to be ready
function initializeCodex() {
    console.log('[CODEX] Initializing CODEX system...');
    
    // Set up button event listeners with null safety
    const btnCodex = document.getElementById('btnCodex');
    const btnTopRelics = document.getElementById('btnTopRelics');
    const btnTopCodex = document.getElementById('btnTopCodex');
    
    if (btnCodex) {
        btnCodex.onclick = () => openCodex('upgrades');
        console.log('[CODEX] Welcome screen button initialized');
    } else {
        console.warn('[CODEX] btnCodex not found - will retry later');
    }
    
    if (btnTopRelics) {
        btnTopRelics.onclick = () => openCodex('relics');
        console.log('[CODEX] In-game Relics button initialized');
    } else {
        console.warn('[CODEX] btnTopRelics not found - OK if not in game yet');
    }
    
    if (btnTopCodex) {
        btnTopCodex.onclick = () => openCodex('upgrades');
        console.log('[CODEX] In-game Codex button initialized');
    } else {
        console.warn('[CODEX] btnTopCodex not found - OK if not in game yet');
    }
    
    console.log('[CODEX] Initialization complete');
}

// Initialize after DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeCodex, 100); // Small delay to ensure game.js elements exist
    });
} else {
    setTimeout(initializeCodex, 100); // Small delay to ensure game.js elements exist
}

// ============================================
// EXPOSE FUNCTIONS GLOBALLY
// ============================================

window.openCodex = openCodex;
window.switchCodexTab = switchCodexTab;
window.filterRelicsByRarity = filterRelicsByRarity;

console.log('[CODEX] Module loaded successfully');

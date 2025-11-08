/**
 * CODEX System Module
 * Handles Upgrades, Relics, and Achievements display and filtering
 */

/**
 * CODEX System
 * Manages the unified encyclopedia of upgrades, relics, and achievements
 */
export class CodexSystem {
    constructor(dependencies) {
        this.achievements = dependencies.achievements || [];
        this.unlocks = dependencies.unlocks || [];
        this.relics = dependencies.relics || [];
        this.permanentUnlocks = dependencies.permanentUnlocks || {};
        this.loadAchievements = dependencies.loadAchievements || (() => []);
        this.trapFocus = dependencies.trapFocus || (() => {});
        this.hapticFeedback = dependencies.hapticFeedback || (() => {});
        
        console.log('[CODEX] System initialized');
    }

    /**
     * Open CODEX modal with specified tab
     * @param {string} tab - Tab to open ('upgrades', 'relics', 'achievements')
     */
    openCodex(tab = 'upgrades') {
        console.log('[CODEX] Opening CODEX with tab:', tab);
        this.populateUpgrades();
        this.populateRelics('all');
        this.populateAchievements();
        this.switchTab(tab);
        
        const codexModal = document.getElementById('codexModal');
        if (codexModal) {
            codexModal.classList.add('active');
            this.trapFocus(codexModal);
            this.hapticFeedback('light');
        }
    }

    /**
     * Switch between CODEX tabs
     * @param {string} tabName - Name of tab to switch to
     */
    switchTab(tabName) {
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
        if (content) content.style.display = 'block';
        
        // Highlight selected tab
        const selectedTab = document.getElementById(`codexTab${tabNameCapitalized}`);
        if (selectedTab) {
            selectedTab.style.background = 'linear-gradient(180deg, #4a3d2f 0%, #342820 100%)';
            selectedTab.style.borderColor = '#d4af37';
            selectedTab.style.color = '#d4af37';
        }
    }

    /**
     * Populate upgrades list
     */
    populateUpgrades() {
        const upgradesList = document.getElementById('upgradesList');
        if (!upgradesList) return;
        
        upgradesList.innerHTML = this.unlocks.map(unlock => {
            const isUnlocked = this.permanentUnlocks[unlock.id];
            const canUnlock = !isUnlocked && unlock.check();
            
            return `
                <div class="unlock-item ${isUnlocked ? 'unlocked' : (canUnlock ? '' : 'locked')}">
                    <div class="item-info">
                        <div class="item-name">${unlock.name}</div>
                        <div class="item-description">${unlock.description}</div>
                        <div class="unlock-requirement">
                            ${isUnlocked ? '✅ UNLOCKED' : (canUnlock ? '✨ READY TO UNLOCK!' : `🔒 ${unlock.requirement}`)}
                        </div>
                    </div>
                    ${!isUnlocked && canUnlock ? `<button class="buy-btn" onclick="unlockUpgradeWrapper('${unlock.id}')">Unlock</button>` : ''}
                </div>
            `;
        }).join('');
    }

    /**
     * Populate relics glossary
     * @param {string} rarityFilter - Rarity to filter by ('all', 'common', 'uncommon', 'rare', 'legendary')
     */
    populateRelics(rarityFilter = 'all') {
        const glossary = document.getElementById('relicsGlossary');
        if (!glossary) return;
        
        const filteredRelics = rarityFilter === 'all' 
            ? this.relics 
            : this.relics.filter(r => r.rarity === rarityFilter);
        
        const rarityOrder = ['common', 'uncommon', 'rare', 'legendary'];
        const rarityColors = {
            common: { bg: 'rgba(170, 170, 170, 0.1)', border: '#aaa', emoji: '⚪', name: 'Common' },
            uncommon: { bg: 'rgba(107, 207, 127, 0.1)', border: '#6bcf7f', emoji: '🟢', name: 'Uncommon' },
            rare: { bg: 'rgba(74, 158, 255, 0.1)', border: '#4a9eff', emoji: '🔵', name: 'Rare' },
            legendary: { bg: 'rgba(255, 152, 0, 0.1)', border: '#ff9800', emoji: '🟠', name: 'Legendary' }
        };
        
        let html = '';
        
        if (rarityFilter === 'all') {
            // Show all rarities grouped
            rarityOrder.forEach(rarity => {
                const relicsInRarity = this.relics.filter(r => r.rarity === rarity);
                if (relicsInRarity.length === 0) return;
                
                const colors = rarityColors[rarity];
                html += `<div style="margin-bottom: 25px;">`;
                html += `<h3 style="color: ${colors.border}; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 1.1em; font-family: 'Cinzel', serif;">`;
                html += `${colors.emoji} ${colors.name} (${relicsInRarity.length})`;
                html += `</h3>`;
                html += `<div style="display: grid; gap: 10px;">`;
                
                relicsInRarity.forEach(relic => {
                    html += this._renderRelicCard(relic, colors);
                });
                
                html += `</div></div>`;
            });
        } else {
            // Show single rarity
            const colors = rarityColors[rarityFilter];
            html += '<div style="display: grid; gap: 10px;">';
            
            filteredRelics.forEach(relic => {
                html += this._renderRelicCard(relic, colors);
            });
            
            html += '</div>';
        }
        
        glossary.innerHTML = html;
    }

    /**
     * Render a single relic card
     * @private
     */
    _renderRelicCard(relic, colors) {
        const nameParts = relic.name.split(' ');
        const icon = nameParts[0];
        const name = nameParts.slice(1).join(' ');
        
        return `
            <div style="background: ${colors.bg}; border: 2px solid ${colors.border}; border-radius: 8px; padding: 12px 15px; transition: all 0.2s ease;" 
                 onmouseover="this.style.borderColor='#c9a961'; this.style.transform='translateX(5px)'" 
                 onmouseout="this.style.borderColor='${colors.border}'; this.style.transform='translateX(0)'">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <span style="font-size: 1.3em;">${icon}</span>
                    <span style="color: #d4af37; font-weight: bold; font-size: 1.05em; font-family: 'Cinzel', serif;">${name}</span>
                </div>
                <p style="color: #ddd; font-size: 0.9em; margin: 0; line-height: 1.5;">${relic.description}</p>
            </div>
        `;
    }

    /**
     * Populate achievements list
     */
    populateAchievements() {
        const achievementsListCodex = document.getElementById('achievementsListCodex');
        if (!achievementsListCodex) return;
        
        const unlockedIds = this.loadAchievements();
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
            const tierAchievements = this.achievements.filter(a => a.tier === tier);
            if (tierAchievements.length === 0) return;
            
            html += `<div style="margin-bottom: 20px;">`;
            html += `<h3 style="color: ${tierColors[tier]}; text-transform: uppercase; margin-bottom: 10px; font-family: 'Cinzel', serif; letter-spacing: 0.05em;">`;
            html += `${tierIcons[tier]} ${tier} (${tierAchievements.length})`;
            html += `</h3>`;
            html += `<div style="display: grid; gap: 8px;">`;
            
            tierAchievements.forEach(achievement => {
                const unlocked = unlockedIds.includes(achievement.id);
                html += `
                    <div style="background: ${unlocked ? 'rgba(107, 207, 127, 0.1)' : 'rgba(90, 74, 56, 0.3)'}; 
                                border: 2px solid ${unlocked ? '#6bcf7f' : '#5a4a38'}; 
                                border-radius: 6px; padding: 10px 12px; 
                                opacity: ${unlocked ? '1' : '0.6'}; 
                                transition: all 0.2s ease;" 
                         onmouseover="this.style.borderColor='${unlocked ? '#d4af37' : '#6b5a48'}'" 
                         onmouseout="this.style.borderColor='${unlocked ? '#6bcf7f' : '#5a4a38'}'">
                        <div style="font-weight: bold; margin-bottom: 4px; color: ${unlocked ? '#6bcf7f' : '#c9a961'};">
                            ${unlocked ? '✅' : '🔒'} ${achievement.icon} ${achievement.title}
                        </div>
                        <div style="font-size: 0.85em; color: #bbb;">${achievement.description}</div>
                    </div>
                `;
            });
            
            html += `</div></div>`;
        });
        
        achievementsListCodex.innerHTML = html;
        
        // Update stats
        this._updateAchievementStats(unlockedIds);
    }

    /**
     * Update achievement statistics display
     * @private
     */
    _updateAchievementStats(unlockedIds) {
        const unlockedCount = unlockedIds.length;
        const statsElement = document.getElementById('achievementStatsCodex');
        if (statsElement) {
            statsElement.textContent = `${unlockedCount}/50 Unlocked`;
        }
        
        const bronzeCount = this.achievements.filter(a => a.tier === 'bronze' && unlockedIds.includes(a.id)).length;
        const silverCount = this.achievements.filter(a => a.tier === 'silver' && unlockedIds.includes(a.id)).length;
        const goldCount = this.achievements.filter(a => a.tier === 'gold' && unlockedIds.includes(a.id)).length;
        const platinumCount = this.achievements.filter(a => a.tier === 'platinum' && unlockedIds.includes(a.id)).length;
        
        const bronzeEl = document.getElementById('bronzeCountCodex');
        const silverEl = document.getElementById('silverCountCodex');
        const goldEl = document.getElementById('goldCountCodex');
        const platinumEl = document.getElementById('platinumCountCodex');
        
        if (bronzeEl) bronzeEl.textContent = `${bronzeCount}/25`;
        if (silverEl) silverEl.textContent = `${silverCount}/15`;
        if (goldEl) goldEl.textContent = `${goldCount}/9`;
        if (platinumEl) platinumEl.textContent = `${platinumCount}/1`;
    }

    /**
     * Filter relics by rarity
     * @param {string} rarity - Rarity to filter by
     */
    filterRelicsByRarity(rarity) {
        this.populateRelics(rarity);
        this._updateFilterButtons('.rarity-filter-btn', 'rarity', rarity);
    }

    /**
     * Filter upgrades by status
     * @param {string} status - Status to filter by ('all', 'unlocked', 'available', 'locked')
     */
    filterUpgradesByStatus(status) {
        const upgradesList = document.getElementById('upgradesList');
        if (!upgradesList) return;
        
        let filteredUnlocks = this.unlocks;
        
        if (status === 'unlocked') {
            filteredUnlocks = this.unlocks.filter(u => this.permanentUnlocks[u.id]);
        } else if (status === 'available') {
            filteredUnlocks = this.unlocks.filter(u => !this.permanentUnlocks[u.id] && u.check());
        } else if (status === 'locked') {
            filteredUnlocks = this.unlocks.filter(u => !this.permanentUnlocks[u.id] && !u.check());
        }
        
        upgradesList.innerHTML = filteredUnlocks.map(unlock => {
            const isUnlocked = this.permanentUnlocks[unlock.id];
            const canUnlock = !isUnlocked && unlock.check();
            
            return `
                <div class="unlock-item ${isUnlocked ? 'unlocked' : (canUnlock ? '' : 'locked')}">
                    <div class="item-info">
                        <div class="item-name">${unlock.name}</div>
                        <div class="item-description">${unlock.description}</div>
                        <div class="unlock-requirement">
                            ${isUnlocked ? '✅ UNLOCKED' : (canUnlock ? '✨ READY TO UNLOCK!' : `🔒 ${unlock.requirement}`)}
                        </div>
                    </div>
                    ${!isUnlocked && canUnlock ? `<button class="buy-btn" onclick="unlockUpgradeWrapper('${unlock.id}')">Unlock</button>` : ''}
                </div>
            `;
        }).join('');
        
        this._updateFilterButtons('.upgrade-filter-btn', 'status', status);
    }

    /**
     * Filter achievements by tier
     * @param {string} tier - Tier to filter by ('all', 'bronze', 'silver', 'gold', 'platinum')
     */
    filterAchievementsByTier(tier) {
        const achievementsListCodex = document.getElementById('achievementsListCodex');
        if (!achievementsListCodex) return;
        
        const unlockedIds = this.loadAchievements();
        const filteredAchievements = tier === 'all' 
            ? this.achievements 
            : this.achievements.filter(a => a.tier === tier);
        
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
        
        if (tier === 'all') {
            // Show all tiers grouped
            const categories = ['bronze', 'silver', 'gold', 'platinum'];
            categories.forEach(t => {
                const tierAchievements = this.achievements.filter(a => a.tier === t);
                if (tierAchievements.length === 0) return;
                
                html += `<div style="margin-bottom: 20px;">`;
                html += `<h3 style="color: ${tierColors[t]}; text-transform: uppercase; margin-bottom: 10px; font-family: 'Cinzel', serif; letter-spacing: 0.05em;">`;
                html += `${tierIcons[t]} ${t} (${tierAchievements.length})`;
                html += `</h3>`;
                html += `<div style="display: grid; gap: 8px;">`;
                
                tierAchievements.forEach(achievement => {
                    const unlocked = unlockedIds.includes(achievement.id);
                    html += `
                        <div style="background: ${unlocked ? 'rgba(107, 207, 127, 0.1)' : 'rgba(90, 74, 56, 0.3)'}; 
                                    border: 2px solid ${unlocked ? '#6bcf7f' : '#5a4a38'}; 
                                    border-radius: 6px; padding: 10px 12px; 
                                    opacity: ${unlocked ? '1' : '0.6'}; 
                                    transition: all 0.2s ease;" 
                             onmouseover="this.style.borderColor='${unlocked ? '#d4af37' : '#6b5a48'}'" 
                             onmouseout="this.style.borderColor='${unlocked ? '#6bcf7f' : '#5a4a38'}'">
                            <div style="font-weight: bold; margin-bottom: 4px; color: ${unlocked ? '#6bcf7f' : '#c9a961'};">
                                ${unlocked ? '✅' : '🔒'} ${achievement.icon} ${achievement.title}
                            </div>
                            <div style="font-size: 0.85em; color: #bbb;">${achievement.description}</div>
                        </div>
                    `;
                });
                
                html += `</div></div>`;
            });
        } else {
            // Show single tier
            html += '<div style="display: grid; gap: 8px;">';
            
            filteredAchievements.forEach(achievement => {
                const unlocked = unlockedIds.includes(achievement.id);
                html += `
                    <div style="background: ${unlocked ? 'rgba(107, 207, 127, 0.1)' : 'rgba(90, 74, 56, 0.3)'}; 
                                border: 2px solid ${unlocked ? '#6bcf7f' : '#5a4a38'}; 
                                border-radius: 6px; padding: 10px 12px; 
                                opacity: ${unlocked ? '1' : '0.6'}; 
                                transition: all 0.2s ease;" 
                         onmouseover="this.style.borderColor='${unlocked ? '#d4af37' : '#6b5a48'}'" 
                         onmouseout="this.style.borderColor='${unlocked ? '#6bcf7f' : '#5a4a38'}'">
                        <div style="font-weight: bold; margin-bottom: 4px; color: ${unlocked ? '#6bcf7f' : '#c9a961'};">
                            ${unlocked ? '✅' : '🔒'} ${achievement.icon} ${achievement.title}
                        </div>
                        <div style="font-size: 0.85em; color: #bbb;">${achievement.description}</div>
                    </div>
                `;
            });
            
            html += '</div>';
        }
        
        achievementsListCodex.innerHTML = html;
        this._updateFilterButtons('.achievement-filter-btn', 'tier', tier);
    }

    /**
     * Update filter button styles
     * @private
     */
    _updateFilterButtons(selector, dataAttribute, activeValue) {
        document.querySelectorAll(selector).forEach(btn => {
            if (btn.dataset[dataAttribute] === activeValue) {
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
}

/**
 * Create and expose CODEX system globally (for backwards compatibility)
 * This will be called from game.js once dependencies are ready
 */
export function initializeCodexSystem(dependencies) {
    const codexSystem = new CodexSystem(dependencies);
    
    // Expose functions globally for onclick handlers (temporary until we remove inline onclick)
    window.openCodex = (tab) => codexSystem.openCodex(tab);
    window.switchCodexTab = (tabName) => codexSystem.switchTab(tabName);
    window.filterRelicsByRarity = (rarity) => codexSystem.filterRelicsByRarity(rarity);
    window.filterUpgradesByStatus = (status) => codexSystem.filterUpgradesByStatus(status);
    window.filterAchievementsByTier = (tier) => codexSystem.filterAchievementsByTier(tier);
    
    console.log('[CODEX] System initialized and exposed globally');
    
    return codexSystem;
}

export default CodexSystem;

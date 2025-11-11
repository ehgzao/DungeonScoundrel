// ============================================
// CODEX SYSTEM (Unified UI)
// Upgrades, Relics, Achievements
// ============================================
// Version: 1.5.0
// Author: Gabriel Lima
// Date: 2025-11-11

console.log('[CODEX] Initializing CODEX system...');

function openCodex(tab = 'upgrades') {
    console.log('[CODEX] Opening CODEX with tab:', tab);
    populateCodexUpgrades();
    populateCodexRelics('all');
    populateCodexAchievements();
    switchCodexTab(tab);
    const codexModal = document.getElementById('codexModal');
    if (codexModal) {
        codexModal.classList.add('active');
        trapFocus(codexModal);
        hapticFeedback('light');
    }
}

function switchCodexTab(tabName) {
    document.querySelectorAll('.codex-content').forEach(content => content.style.display = 'none');
    document.querySelectorAll('.codex-tab').forEach(tab => {
        tab.style.background = 'linear-gradient(180deg, #3d3328 0%, #2a2318 100%)';
        tab.style.borderColor = '#5a4a38';
        tab.style.color = '#c9a961';
    });
    const tabNameCapitalized = tabName.charAt(0).toUpperCase() + tabName.slice(1);
    const content = document.getElementById(`codexContent${tabNameCapitalized}`);
    if (content) content.style.display = 'block';
    const selectedTab = document.getElementById(`codexTab${tabNameCapitalized}`);
    if (selectedTab) {
        selectedTab.style.background = 'linear-gradient(180deg, #4a3d2f 0%, #342820 100%)';
        selectedTab.style.borderColor = '#d4af37';
        selectedTab.style.color = '#d4af37';
    }
}

function populateCodexUpgrades() {
    const upgradesList = document.getElementById('upgradesList');
    if (!upgradesList) return;
    
    // AUTO-SORT: Available first, then unlocked, then locked
    const sortedUnlocks = [...UNLOCKS].sort((a, b) => {
        const aUnlocked = permanentUnlocks[a.id];
        const bUnlocked = permanentUnlocks[b.id];
        const aAvailable = !aUnlocked && a.check();
        const bAvailable = !bUnlocked && b.check();
        
        // Priority: Available > Unlocked > Locked
        if (aAvailable && !bAvailable) return -1;
        if (!aAvailable && bAvailable) return 1;
        if (aUnlocked && !bUnlocked && !bAvailable) return -1;
        if (!aUnlocked && bUnlocked && !aAvailable) return 1;
        return 0;
    });
    
    upgradesList.innerHTML = sortedUnlocks.map(unlock => {
        const isUnlocked = permanentUnlocks[unlock.id];
        const canUnlock = !isUnlocked && unlock.check();
        return `<div class="unlock-item ${isUnlocked ? 'unlocked' : (canUnlock ? '' : 'locked')}"><div class="item-info"><div class="item-name">${unlock.name}</div><div class="item-description">${unlock.description}</div><div class="unlock-requirement">${isUnlocked ? '✅ UNLOCKED' : (canUnlock ? '✨ READY TO UNLOCK!' : `🔒 ${unlock.requirement}`)}</div></div>${!isUnlocked && canUnlock ? `<button class="buy-btn" onclick="unlockUpgradeWrapper('${unlock.id}')">Unlock</button>` : ''}</div>`;
    }).join('');
}

function populateCodexRelics(rarityFilter = 'all') {
    const glossary = document.getElementById('relicsGlossary');
    if (!glossary) return;
    
    let filteredRelics = rarityFilter === 'all' ? RELICS : RELICS.filter(r => r.rarity === rarityFilter);
    const rarityOrder = ['common', 'uncommon', 'rare', 'legendary'];
    const rarityColors = {common: {bg: 'rgba(170, 170, 170, 0.1)', border: '#aaa', emoji: '⚪', name: 'Common'}, uncommon: {bg: 'rgba(107, 207, 127, 0.1)', border: '#6bcf7f', emoji: '🟢', name: 'Uncommon'}, rare: {bg: 'rgba(74, 158, 255, 0.1)', border: '#4a9eff', emoji: '🔵', name: 'Rare'}, legendary: {bg: 'rgba(255, 152, 0, 0.1)', border: '#ff9800', emoji: '🟠', name: 'Legendary'}};
    let html = '';
    if (rarityFilter === 'all') {
        rarityOrder.forEach(rarity => {
            const relicsInRarity = RELICS.filter(r => r.rarity === rarity);
            if (relicsInRarity.length === 0) return;
            const colors = rarityColors[rarity];
            html += `<div style="margin-bottom: 25px;"><h3 style="color: ${colors.border}; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 1.1em; font-family: 'Cinzel', serif;">${colors.emoji} ${colors.name} (${relicsInRarity.length})</h3><div style="display: grid; gap: 10px;">`;
            relicsInRarity.forEach(relic => {
                const nameParts = relic.name.split(' ');
                const icon = nameParts[0];
                const name = nameParts.slice(1).join(' ');
                html += `<div style="background: ${colors.bg}; border: 2px solid ${colors.border}; border-radius: 8px; padding: 12px 15px; transition: all 0.2s ease;" onmouseover="this.style.borderColor='#c9a961'; this.style.transform='translateX(5px)'" onmouseout="this.style.borderColor='${colors.border}'; this.style.transform='translateX(0)'"><div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;"><span style="font-size: 1.3em;">${icon}</span><span style="color: #d4af37; font-weight: bold; font-size: 1.05em; font-family: 'Cinzel', serif;">${name}</span></div><p style="color: #ddd; font-size: 0.9em; margin: 0; line-height: 1.5;">${relic.description}</p></div>`;
            });
            html += `</div></div>`;
        });
    } else {
        const colors = rarityColors[rarityFilter];
        html += '<div style="display: grid; gap: 10px;">';
        filteredRelics.forEach(relic => {
            const nameParts = relic.name.split(' ');
            const icon = nameParts[0];
            const name = nameParts.slice(1).join(' ');
            html += `<div style="background: ${colors.bg}; border: 2px solid ${colors.border}; border-radius: 8px; padding: 12px 15px; transition: all 0.2s ease;" onmouseover="this.style.borderColor='#c9a961'; this.style.transform='translateX(5px)'" onmouseout="this.style.borderColor='${colors.border}'; this.style.transform='translateX(0)'"><div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;"><span style="font-size: 1.3em;">${icon}</span><span style="color: #d4af37; font-weight: bold; font-size: 1.05em; font-family: 'Cinzel', serif;">${name}</span></div><p style="color: #ddd; font-size: 0.9em; margin: 0; line-height: 1.5;">${relic.description}</p></div>`;
        });
        html += '</div>';
    }
    glossary.innerHTML = html;
}

function populateCodexAchievements() {
    const achievementsListCodex = document.getElementById('achievementsListCodex');
    if (!achievementsListCodex) return;
    
    // Load unlocked achievements
    const unlockedIds = loadAchievements();
    
    const categories = ['bronze', 'silver', 'gold', 'platinum'];
    const tierColors = {bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', platinum: '#e5e4e2'};
    const tierIcons = {bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎'};
    let html = '';
    categories.forEach(tier => {
        const tierAchievements = ACHIEVEMENTS.filter(a => a.tier === tier);
        if (tierAchievements.length === 0) return;
        html += `<div style="margin-bottom: 20px;"><h3 style="color: ${tierColors[tier]}; text-transform: uppercase; margin-bottom: 10px; font-family: 'Cinzel', serif; letter-spacing: 0.05em;">${tierIcons[tier]} ${tier} (${tierAchievements.length})</h3><div style="display: grid; gap: 8px;">`;
        tierAchievements.forEach(achievement => {
            const unlocked = unlockedIds.includes(achievement.id);
            html += `<div style="background: ${unlocked ? 'rgba(107, 207, 127, 0.1)' : 'rgba(90, 74, 56, 0.3)'}; border: 2px solid ${unlocked ? '#6bcf7f' : '#5a4a38'}; border-radius: 6px; padding: 10px 12px; opacity: ${unlocked ? '1' : '0.6'}; transition: all 0.2s ease;" onmouseover="this.style.borderColor='${unlocked ? '#d4af37' : '#6b5a48'}'" onmouseout="this.style.borderColor='${unlocked ? '#6bcf7f' : '#5a4a38'}'"><div style="font-weight: bold; margin-bottom: 4px; color: ${unlocked ? '#6bcf7f' : '#c9a961'};">${unlocked ? '✅' : '🔒'} ${achievement.icon} ${achievement.title}</div><div style="font-size: 0.85em; color: #bbb;">${achievement.description}</div></div>`;
        });
        html += `</div></div>`;
    });
    achievementsListCodex.innerHTML = html;
    
    // Update stats
    const unlockedCount = unlockedIds.length;
    const statsElement = document.getElementById('achievementStatsCodex');
    if (statsElement) statsElement.textContent = `${unlockedCount}/50 Unlocked`;
    const bronzeCount = ACHIEVEMENTS.filter(a => a.tier === 'bronze' && unlockedIds.includes(a.id)).length;
    const silverCount = ACHIEVEMENTS.filter(a => a.tier === 'silver' && unlockedIds.includes(a.id)).length;
    const goldCount = ACHIEVEMENTS.filter(a => a.tier === 'gold' && unlockedIds.includes(a.id)).length;
    const platinumCount = ACHIEVEMENTS.filter(a => a.tier === 'platinum' && unlockedIds.includes(a.id)).length;
    const bronzeEl = document.getElementById('bronzeCountCodex');
    const silverEl = document.getElementById('silverCountCodex');
    const goldEl = document.getElementById('goldCountCodex');
    const platinumEl = document.getElementById('platinumCountCodex');
    if (bronzeEl) bronzeEl.textContent = `${bronzeCount}/25`;
    if (silverEl) silverEl.textContent = `${silverCount}/15`;
    if (goldEl) goldEl.textContent = `${goldCount}/9`;
    if (platinumEl) platinumEl.textContent = `${platinumCount}/1`;
}

function filterCodexRelicsByRarity(rarity) {
    populateCodexRelics(rarity);
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

function filterUpgradesByStatus(status) {
    const upgradesList = document.getElementById('upgradesList');
    if (!upgradesList) return;
    
    // Save active filter for re-application after unlock
    window.activeUpgradeFilter = status;
    
    let filteredUnlocks = UNLOCKS;
    
    if (status === 'unlocked') {
        filteredUnlocks = UNLOCKS.filter(u => permanentUnlocks[u.id]);
    } else if (status === 'available') {
        filteredUnlocks = UNLOCKS.filter(u => !permanentUnlocks[u.id] && u.check());
    } else if (status === 'locked') {
        filteredUnlocks = UNLOCKS.filter(u => !permanentUnlocks[u.id] && !u.check());
    }
    
    upgradesList.innerHTML = filteredUnlocks.map(unlock => {
        const isUnlocked = permanentUnlocks[unlock.id];
        const canUnlock = !isUnlocked && unlock.check();
        return `<div class="unlock-item ${isUnlocked ? 'unlocked' : (canUnlock ? '' : 'locked')}"><div class="item-info"><div class="item-name">${unlock.name}</div><div class="item-description">${unlock.description}</div><div class="unlock-requirement">${isUnlocked ? '✅ UNLOCKED' : (canUnlock ? '✨ READY TO UNLOCK!' : `🔒 ${unlock.requirement}`)}</div></div>${!isUnlocked && canUnlock ? `<button class="buy-btn" onclick="unlockUpgradeWrapper('${unlock.id}')">Unlock</button>` : ''}</div>`;
    }).join('');
    
    // Update button styles
    document.querySelectorAll('.upgrade-filter-btn').forEach(btn => {
        if (btn.dataset.status === status) {
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

function filterAchievementsByTier(tier) {
    const achievementsListCodex = document.getElementById('achievementsListCodex');
    if (!achievementsListCodex) return;
    
    const unlockedIds = loadAchievements();
    let filteredAchievements = tier === 'all' ? ACHIEVEMENTS : ACHIEVEMENTS.filter(a => a.tier === tier);
    
    const tierColors = {bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', platinum: '#e5e4e2'};
    const tierIcons = {bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎'};
    
    let html = '';
    
    if (tier === 'all') {
        const categories = ['bronze', 'silver', 'gold', 'platinum'];
        categories.forEach(t => {
            const tierAchievements = ACHIEVEMENTS.filter(a => a.tier === t);
            if (tierAchievements.length === 0) return;
            html += `<div style="margin-bottom: 20px;"><h3 style="color: ${tierColors[t]}; text-transform: uppercase; margin-bottom: 10px; font-family: 'Cinzel', serif; letter-spacing: 0.05em;">${tierIcons[t]} ${t} (${tierAchievements.length})</h3><div style="display: grid; gap: 8px;">`;
            tierAchievements.forEach(achievement => {
                const unlocked = unlockedIds.includes(achievement.id);
                html += `<div style="background: ${unlocked ? 'rgba(107, 207, 127, 0.1)' : 'rgba(90, 74, 56, 0.3)'}; border: 2px solid ${unlocked ? '#6bcf7f' : '#5a4a38'}; border-radius: 6px; padding: 10px 12px; opacity: ${unlocked ? '1' : '0.6'}; transition: all 0.2s ease;" onmouseover="this.style.borderColor='${unlocked ? '#d4af37' : '#6b5a48'}'" onmouseout="this.style.borderColor='${unlocked ? '#6bcf7f' : '#5a4a38'}'"><div style="font-weight: bold; margin-bottom: 4px; color: ${unlocked ? '#6bcf7f' : '#c9a961'};">${unlocked ? '✅' : '🔒'} ${achievement.icon} ${achievement.title}</div><div style="font-size: 0.85em; color: #bbb;">${achievement.description}</div></div>`;
            });
            html += `</div></div>`;
        });
    } else {
        html += '<div style="display: grid; gap: 8px;">';
        filteredAchievements.forEach(achievement => {
            const unlocked = unlockedIds.includes(achievement.id);
            html += `<div style="background: ${unlocked ? 'rgba(107, 207, 127, 0.1)' : 'rgba(90, 74, 56, 0.3)'}; border: 2px solid ${unlocked ? '#6bcf7f' : '#5a4a38'}; border-radius: 6px; padding: 10px 12px; opacity: ${unlocked ? '1' : '0.6'}; transition: all 0.2s ease;" onmouseover="this.style.borderColor='${unlocked ? '#d4af37' : '#6b5a48'}'" onmouseout="this.style.borderColor='${unlocked ? '#6bcf7f' : '#5a4a38'}'"><div style="font-weight: bold; margin-bottom: 4px; color: ${unlocked ? '#6bcf7f' : '#c9a961'};">${unlocked ? '✅' : '🔒'} ${achievement.icon} ${achievement.title}</div><div style="font-size: 0.85em; color: #bbb;">${achievement.description}</div></div>`;
        });
        html += '</div>';
    }
    
    achievementsListCodex.innerHTML = html;
    
    // Update button styles
    document.querySelectorAll('.achievement-filter-btn').forEach(btn => {
        if (btn.dataset.tier === tier) {
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

// Initialize CODEX buttons
const btnCodex = document.getElementById('btnCodex');
const btnTopRelics = document.getElementById('btnTopRelics');

if (btnCodex) {
    btnCodex.onclick = () => openCodex('upgrades');
    console.log('[CODEX] Welcome screen button initialized');
}
if (btnTopRelics) {
    btnTopRelics.onclick = () => openCodex('relics');
    console.log('[CODEX] In-game Relics button initialized');
}

// Expose CODEX functions globally
window.openCodex = openCodex;
window.switchCodexTab = switchCodexTab;
window.filterRelicsByRarity = filterCodexRelicsByRarity;
window.filterUpgradesByStatus = filterUpgradesByStatus;
window.filterAchievementsByTier = filterAchievementsByTier;

console.log('[CODEX] System initialized successfully');

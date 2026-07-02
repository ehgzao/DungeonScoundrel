// ============================================
// CODEX SYSTEM (Unified UI)
// Upgrades, Relics, Achievements
// ============================================
// Version: 1.5.0
// Author: Gabriel Lima
// Date: 2025-11-11


function openCodex(tab = 'upgrades') {
    populateCodexUpgrades();
    populateCodexRelics('all');
    populateCodexAchievements();
    populateCodexStats();
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

// Discovery state: a relic is revealed once it has ever been held in a run
// (recorded by game-relics.js). Unseen relics show as "?" — the glossary is a
// long-tail goal, not a spoiler sheet.
function seenRelicIds() {
    try {
        const stored = window.storage ? window.storage.get('scoundrel_seen_relics', []) : JSON.parse(localStorage.getItem('scoundrel_seen_relics') || '[]');
        const seen = new Set(Array.isArray(stored) ? stored : []);
        // relics held right now count as discovered even before the next save
        if (window.game && Array.isArray(window.game.relics)) window.game.relics.forEach(r => seen.add(r.id));
        return seen;
    } catch (_) { return new Set(); }
}

function relicTileHTML(relic, colors, ver, discovered) {
    if (!discovered) {
        return `<div style="background: rgba(90, 74, 56, 0.2); border: 2px dashed #5a4a38; border-radius: 8px; padding: 12px 15px; opacity: 0.65;"><div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;"><span style="width:36px;height:36px;flex:0 0 36px;border-radius:6px;border:1px solid #5a4a38;background:#140f0a;display:inline-flex;align-items:center;justify-content:center;color:#8b7355;font-weight:bold;font-size:1.2em;">?</span><span style="color: #8b7355; font-weight: bold; font-size: 1.05em; font-family: 'Cinzel', serif;">Undiscovered</span></div><p style="color: #8b7355; font-size: 0.9em; margin: 0; line-height: 1.5;">Find this relic in a run to reveal it.</p></div>`;
    }
    const nameParts = relic.name.split(' ');
    const icon = nameParts[0];
    const name = nameParts.slice(1).join(' ');
    return `<div style="background: ${colors.bg}; border: 2px solid ${colors.border}; border-radius: 8px; padding: 12px 15px; transition: all 0.2s ease;" onmouseover="this.style.borderColor='#c9a961'; this.style.transform='translateX(5px)'" onmouseout="this.style.borderColor='${colors.border}'; this.style.transform='translateX(0)'"><div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;"><img src="assets/relics/relic_${relic.id}.webp?v=${ver}" alt="" style="width:36px;height:36px;flex:0 0 36px;border-radius:6px;object-fit:cover;border:1px solid #5a4a38;background:#140f0a;" onerror="this.outerHTML='<span style=&quot;font-size:1.3em;&quot;>${icon}</span>'"><span style="color: #d4af37; font-weight: bold; font-size: 1.05em; font-family: 'Cinzel', serif;">${name}</span></div><p style="color: #ddd; font-size: 0.9em; margin: 0; line-height: 1.5;">${relic.description}</p></div>`;
}

function populateCodexRelics(rarityFilter = 'all') {
    const glossary = document.getElementById('relicsGlossary');
    if (!glossary) return;
    
    const seen = seenRelicIds();
    let filteredRelics = rarityFilter === 'all' ? RELICS : RELICS.filter(r => r.rarity === rarityFilter);
    const ver = window.ADV_ART_VER || '1'; // illustrated relic icon cache-bust
    const rarityOrder = ['common', 'uncommon', 'rare', 'legendary'];
    const rarityColors = {common: {bg: 'rgba(170, 170, 170, 0.1)', border: '#aaa', emoji: '⚫', name: 'Common'}, uncommon: {bg: 'rgba(107, 207, 127, 0.1)', border: '#6bcf7f', emoji: '💚', name: 'Uncommon'}, rare: {bg: 'rgba(74, 158, 255, 0.1)', border: '#4a9eff', emoji: '💎', name: 'Rare'}, legendary: {bg: 'rgba(255, 152, 0, 0.1)', border: '#ff9800', emoji: '🔥', name: 'Legendary'}};
    let html = '';
    if (rarityFilter === 'all') {
        rarityOrder.forEach(rarity => {
            const relicsInRarity = RELICS.filter(r => r.rarity === rarity);
            if (relicsInRarity.length === 0) return;
            const colors = rarityColors[rarity];
            const found = relicsInRarity.filter(r => seen.has(r.id)).length;
            html += `<div style="margin-bottom: 25px;"><h3 style="color: ${colors.border}; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 1.1em; font-family: 'Cinzel', serif;">${colors.emoji} ${colors.name} (${found}/${relicsInRarity.length} discovered)</h3><div style="display: grid; gap: 10px;">`;
            relicsInRarity.forEach(relic => { html += relicTileHTML(relic, colors, ver, seen.has(relic.id)); });
            html += `</div></div>`;
        });
    } else {
        const colors = rarityColors[rarityFilter];
        html += '<div style="display: grid; gap: 10px;">';
        filteredRelics.forEach(relic => { html += relicTileHTML(relic, colors, ver, seen.has(relic.id)); });
        html += '</div>';
    }
    glossary.innerHTML = html;
}

// Lifetime career stats — the data has always been collected for unlock gates;
// this finally shows it back to the player. Read-only.
function populateCodexStats() {
    const grid = document.getElementById('lifetimeStatsGrid');
    if (!grid) return;
    const s = window.storage ? window.storage.get('scoundrel_lifetime_stats', {}) : {};
    const n = (k) => s[k] || 0;
    const fmtTime = (secs) => secs > 0 ? `${Math.floor(secs / 60)}m ${secs % 60}s` : '—';
    const winRate = (n('gamesWon') + n('deaths')) > 0 ? Math.round(100 * n('gamesWon') / (n('gamesWon') + n('deaths'))) + '%' : '—';
    const sections = [
        ['🏆 Career', [
            ['Games won', n('gamesWon')], ['Deaths', n('deaths')], ['Win rate', winRate],
            ['Fastest win', fmtTime(n('fastestWin'))], ['Best combo', n('maxCombo') + 'x'],
        ]],
        ['🎴 By mode & difficulty', [
            ['Classic wins', n('classicWins')], ['Adventure wins', n('adventureWins')],
            ['Easy wins', n('easyWins')], ['Normal wins', n('normalWins')], ['Hard wins', n('hardWins')],
        ]],
        ['⚔️ Combat', [
            ['Monsters slain', n('monstersSlain')], ['Rooms cleared', n('roomsCleared')],
            ['Damage taken', n('totalDamage')], ['Weapons equipped', n('weaponsEquipped')],
            ['Weapons broken', n('weaponsBroken')], ['Rooms evaded', n('roomsAvoided')],
        ]],
        ['💰 Economy & spoils', [
            ['Gold earned', n('totalGoldEarned')], ['Items bought', n('itemsBought')],
            ['Shop visits', n('shopsVisited')], ['Relics collected', n('relicsCollected')],
            ['Potions used', n('potionsUsed')], ['Events completed', n('eventsCompleted')],
        ]],
    ];
    grid.innerHTML = sections.map(([title, rows]) => `
        <div style="margin-bottom: 20px;">
            <h3 style="color: #c9a961; margin-bottom: 10px; font-family: 'Cinzel', serif; letter-spacing: 0.05em;">${title}</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px;">
                ${rows.map(([label, val]) => `<div style="background: rgba(0,0,0,0.3); border: 1px solid #5a4a38; border-radius: 8px; padding: 10px 12px;"><div style="color: #a89a85; font-size: 0.8em;">${label}</div><div style="color: #e8c878; font-size: 1.3em; font-weight: bold; font-family: 'Cinzel', serif;">${val}</div></div>`).join('')}
            </div>
        </div>`).join('');
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
    if (statsElement) statsElement.textContent = `${unlockedCount}/${ACHIEVEMENTS.length} Unlocked`;
    const bronzeTotal = ACHIEVEMENTS.filter(a => a.tier === 'bronze');
    const silverTotal = ACHIEVEMENTS.filter(a => a.tier === 'silver');
    const goldTotal = ACHIEVEMENTS.filter(a => a.tier === 'gold');
    const platinumTotal = ACHIEVEMENTS.filter(a => a.tier === 'platinum');
    const bronzeCount = bronzeTotal.filter(a => unlockedIds.includes(a.id)).length;
    const silverCount = silverTotal.filter(a => unlockedIds.includes(a.id)).length;
    const goldCount = goldTotal.filter(a => unlockedIds.includes(a.id)).length;
    const platinumCount = platinumTotal.filter(a => unlockedIds.includes(a.id)).length;
    const bronzeEl = document.getElementById('bronzeCountCodex');
    const silverEl = document.getElementById('silverCountCodex');
    const goldEl = document.getElementById('goldCountCodex');
    const platinumEl = document.getElementById('platinumCountCodex');
    if (bronzeEl) bronzeEl.textContent = `${bronzeCount}/${bronzeTotal.length}`;
    if (silverEl) silverEl.textContent = `${silverCount}/${silverTotal.length}`;
    if (goldEl) goldEl.textContent = `${goldCount}/${goldTotal.length}`;
    if (platinumEl) platinumEl.textContent = `${platinumCount}/${platinumTotal.length}`;
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
}
if (btnTopRelics) {
    btnTopRelics.onclick = () => openCodex('relics');
}

// Expose CODEX functions globally
window.openCodex = openCodex;
window.switchCodexTab = switchCodexTab;
window.filterRelicsByRarity = filterCodexRelicsByRarity;
window.filterUpgradesByStatus = filterUpgradesByStatus;
window.filterAchievementsByTier = filterAchievementsByTier;
window.populateCodexStats = populateCodexStats;


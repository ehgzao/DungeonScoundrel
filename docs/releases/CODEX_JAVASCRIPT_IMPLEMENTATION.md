# 📚 CODEX JavaScript Implementation Guide

**Date**: 2025-01-08  
**Feature**: Unified CODEX System  
**Version**: v1.3.2

---

## 🎯 FUNCTIONS TO ADD

### 1. Button References (Line ~783)
```javascript
const btnCodex = document.getElementById('btnCodex');
const btnTopRelics = document.getElementById('btnTopRelics');
const btnTopCodex = document.getElementById('btnTopCodex');
```

### 2. Event Listeners (Line ~1230)
```javascript
// Welcome screen
btnCodex.onclick = () => openCodex('upgrades');

// In-game buttons
btnTopRelics.onclick = () => openCodex('relics');
btnTopCodex.onclick = () => openCodex('upgrades');
```

### 3. openCodex() Function
```javascript
function openCodex(tab = 'upgrades') {
    // Populate all tabs
    populateUpgradesList();
    populateRelicsGlossary('all');
    populateAchievementsList();
    
    // Switch to requested tab
    switchCodexTab(tab);
    
    // Open modal
    document.getElementById('codexModal').classList.add('active');
    trapFocus(document.getElementById('codexModal'));
    hapticFeedback('light');
}
```

### 4. switchCodexTab() Function
```javascript
function switchCodexTab(tabName) {
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
    document.getElementById(`codexContent${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).style.display = 'block';
    
    // Highlight selected tab
    const selectedTab = document.getElementById(`codexTab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
    selectedTab.style.background = 'linear-gradient(180deg, #4a3d2f 0%, #342820 100%)';
    selectedTab.style.borderColor = '#d4af37';
    selectedTab.style.color = '#d4af37';
}
```

### 5. populateUpgradesList() Function
```javascript
function populateUpgradesList() {
    const upgradesList = document.getElementById('upgradesList');
    upgradesList.innerHTML = UNLOCKS.map(unlock => {
        const isUnlocked = permanentUnlocks[unlock.id];
        const canUnlock = !isUnlocked && unlock.check();
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
    `}).join('');
}
```

### 6. populateRelicsGlossary() Function
```javascript
function populateRelicsGlossary(rarityFilter = 'all') {
    const glossary = document.getElementById('relicsGlossary');
    
    let filteredRelics = rarityFilter === 'all' 
        ? RELICS 
        : RELICS.filter(r => r.rarity === rarityFilter);
    
    const rarityOrder = ['common', 'uncommon', 'rare', 'legendary'];
    const rarityColors = {
        common: { bg: 'rgba(170, 170, 170, 0.1)', border: '#aaa', emoji: '⚪' },
        uncommon: { bg: 'rgba(107, 207, 127, 0.1)', border: '#6bcf7f', emoji: '🟢' },
        rare: { bg: 'rgba(74, 158, 255, 0.1)', border: '#4a9eff', emoji: '🔵' },
        legendary: { bg: 'rgba(255, 152, 0, 0.1)', border: '#ff9800', emoji: '🟠' }
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
                    <h3 style="color: ${colors.border}; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 1.1em;">
                        ${colors.emoji} ${rarity} (${relicsInRarity.length})
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
        const colors = rarityColors[rarityFilter];
        html += '<div style="display: grid; gap: 10px;">';
        filteredRelics.forEach(relic => {
            html += createRelicCard(relic, colors);
        });
        html += '</div>';
    }
    
    glossary.innerHTML = html;
}

function createRelicCard(relic, colors) {
    return `
        <div style="
            background: ${colors.bg};
            border: 2px solid ${colors.border};
            border-radius: 8px;
            padding: 12px 15px;
            transition: all 0.2s ease;
        " onmouseover="this.style.borderColor='#c9a961'; this.style.transform='translateX(5px)'" onmouseout="this.style.borderColor='${colors.border}'; this.style.transform='translateX(0)'">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                <span style="font-size: 1.2em;">${relic.name.split(' ')[0]}</span>
                <span style="color: #d4af37; font-weight: bold; font-size: 1.05em;">${relic.name.substring(relic.name.indexOf(' ') + 1)}</span>
            </div>
            <p style="color: #ddd; font-size: 0.9em; margin: 0; line-height: 1.5;">${relic.description}</p>
        </div>
    `;
}
```

### 7. populateAchievementsList() Function
```javascript
function populateAchievementsList() {
    const achievementsList = document.getElementById('achievementsList');
    const categories = ['bronze', 'silver', 'gold', 'platinum'];
    
    let html = '';
    categories.forEach(tier => {
        const tierAchievements = ACHIEVEMENTS.filter(a => a.tier === tier);
        const tierColors = {
            bronze: '#cd7f32',
            silver: '#c0c0c0',
            gold: '#ffd700',
            platinum: '#e5e4e2'
        };
        
        html += `
            <div style="margin-bottom: 20px;">
                <h3 style="color: ${tierColors[tier]}; text-transform: uppercase; margin-bottom: 10px;">
                    ${tier === 'bronze' ? '🥉' : tier === 'silver' ? '🥈' : tier === 'gold' ? '🥇' : '💎'} 
                    ${tier} (${tierAchievements.length})
                </h3>
                <div style="display: grid; gap: 8px;">
        `;
        
        tierAchievements.forEach(achievement => {
            const unlocked = playerAchievements[achievement.id];
            html += `
                <div style="
                    background: ${unlocked ? 'rgba(107, 207, 127, 0.1)' : 'rgba(90, 74, 56, 0.3)'};
                    border: 2px solid ${unlocked ? '#6bcf7f' : '#5a4a38'};
                    border-radius: 6px;
                    padding: 10px 12px;
                    opacity: ${unlocked ? '1' : '0.6'};
                ">
                    <div style="font-weight: bold; margin-bottom: 4px;">
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
    const unlockedCount = Object.keys(playerAchievements).length;
    document.getElementById('achievementStatsCodex').textContent = `${unlockedCount}/50 Unlocked`;
    
    const bronzeCount = ACHIEVEMENTS.filter(a => a.tier === 'bronze' && playerAchievements[a.id]).length;
    const silverCount = ACHIEVEMENTS.filter(a => a.tier === 'silver' && playerAchievements[a.id]).length;
    const goldCount = ACHIEVEMENTS.filter(a => a.tier === 'gold' && playerAchievements[a.id]).length;
    const platinumCount = ACHIEVEMENTS.filter(a => a.tier === 'platinum' && playerAchievements[a.id]).length;
    
    document.getElementById('bronzeCountCodex').textContent = `${bronzeCount}/25`;
    document.getElementById('silverCountCodex').textContent = `${silverCount}/15`;
    document.getElementById('goldCountCodex').textContent = `${goldCount}/9`;
    document.getElementById('platinumCountCodex').textContent = `${platinumCount}/1`;
}
```

### 8. Global Functions (Window scope)
```javascript
// Expose functions globally
window.switchCodexTab = switchCodexTab;
window.filterRelicsByRarity = (rarity) => {
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
};
```

---

## 📍 INSERTION POINTS

1. **Button references**: After line 782 (with other button declarations)
2. **Event listeners**: After line 1230 (with other onclick assignments)
3. **Functions**: After openUnlocks() function (around line 6430)
4. **Global exports**: After window.closeEventWrapper (around line 6480)

---

## ✅ TESTING CHECKLIST

After implementation:
- [ ] Click CODEX button from menu
- [ ] Verify UPGRADES tab opens by default
- [ ] Click RELICS tab
- [ ] Test rarity filters (All, Common, Uncommon, Rare, Legendary)
- [ ] Click ACHIEVEMENTS tab
- [ ] Click 📖 RELICS button in-game (opens to RELICS tab)
- [ ] Click 📚 CODEX button in-game (opens to UPGRADES tab)
- [ ] Verify all data populates correctly
- [ ] Test close button
- [ ] Test ESC key

---

**Status**: Ready for implementation  
**Estimated time**: 30 minutes  
**Risk level**: Low (isolated feature)

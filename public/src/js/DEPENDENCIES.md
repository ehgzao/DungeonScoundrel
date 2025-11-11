# 🔗 Module Dependencies - Dungeon Scoundrel

## Load Order (CRITICAL - Do not change!)

```
1. error-handler.js          (Must load first - catches all errors)
2. inline-scripts.js          (Waitlist, email, bug reports)
3. firebase-auth.js           (Authentication)
4. helpers.js                 (Utilities - exposes trapFocus, hapticFeedback)
5. achievements.js            (Exposes ACHIEVEMENTS, loadAchievements)
6. game-data.js               (Exposes RELICS, SHOP_ITEMS, EVENTS)
7. stats.js                   (Stats tracking)
8. leaderboard.js             (Leaderboard system)
9. audio-context.js           (Audio initialization)
10. music.js                  (Music system - exposes music)
11. game.js                   (Main game - exposes UNLOCKS, permanentUnlocks, game, etc.)
12. codex.js                  (MUST load AFTER game.js - depends on UNLOCKS, permanentUnlocks)
```

---

## Module Dependencies Map

### **codex.js** depends on:
- ✅ `UNLOCKS` (from game.js)
- ✅ `permanentUnlocks` (from game.js)
- ✅ `RELICS` (from game-data.js)
- ✅ `ACHIEVEMENTS` (from achievements.js)
- ✅ `loadAchievements()` (from achievements.js)
- ✅ `trapFocus()` (from helpers.js)
- ✅ `hapticFeedback()` (from helpers.js)

### **game.js** depends on:
- ✅ `RELICS` (from game-data.js)
- ✅ `SHOP_ITEMS` (from game-data.js)
- ✅ `EVENTS` (from game-data.js)
- ✅ `ACHIEVEMENTS` (from achievements.js)
- ✅ `checkAllAchievements()` (from achievements.js)
- ✅ `storage` (from helpers.js)
- ✅ `debounce()` (from helpers.js)
- ✅ `music` (from music.js)
- ✅ `audioContext` (from audio-context.js)

### **leaderboard.js** depends on:
- ✅ `game` (from game.js) - BUT only called at runtime, not at load time
- ✅ `playerNameInput` (from game.js) - BUT only called at runtime

### **achievements.js** depends on:
- ✅ `storage` (from helpers.js)
- ✅ `getLifetimeStat()` (from stats.js)

### **music.js** depends on:
- ✅ `audioContext` (from audio-context.js)

---

## Global Exposures

### From **helpers.js**:
```javascript
window.showTooltip
window.hideTooltip
window.screenShake
window.createParticles
window.showDamageNumber
window.showCombo
window.startInteractiveTutorial
window.trapFocus
window.hapticFeedback
```

### From **achievements.js**:
```javascript
window.ACHIEVEMENTS
window.loadAchievements
```

### From **game-data.js**:
```javascript
window.RELICS
window.SHOP_ITEMS
window.EVENTS
```

### From **music.js**:
```javascript
window.music
```

### From **leaderboard.js**:
```javascript
window.showLeaderboard
window.loadLeaderboardForDifficulty
window.switchLeaderboardDifficulty
```

### From **game.js**:
```javascript
window.game
window.playerNameInput
window.permanentUnlocks
window.UNLOCKS
window.createCardElement
window.createMiniCardElement
window.getCardType
window.playSound
window.showTutorial
window.showMessage
window.earnGold
window.giveRandomRelic
window.updateUI
window.updateRelicsDisplay
window.takeDamage
window.resetCombo
window.buyItem
window.handleCardClick
window.unlockUpgradeWrapper
window.tryGiveUp
window.closeShopWrapper
window.closeEventWrapper
window.confirmGiveUp
```

### From **codex.js**:
```javascript
window.openCodex
window.switchCodexTab
window.filterRelicsByRarity
window.filterUpgradesByStatus
window.filterAchievementsByTier
```

---

## ⚠️ CRITICAL RULES

1. **NEVER load codex.js before game.js**
   - codex.js needs UNLOCKS and permanentUnlocks from game.js

2. **NEVER load game.js before game-data.js**
   - game.js needs RELICS, SHOP_ITEMS, EVENTS

3. **NEVER load music.js before audio-context.js**
   - music.js needs audioContext

4. **ALWAYS load helpers.js early**
   - Many modules depend on helper functions

5. **ALWAYS load error-handler.js first**
   - Catches errors from all other modules

---

## Version: v1.5.1
**Last Updated:** 2025-11-11
**Author:** Gabriel Lima

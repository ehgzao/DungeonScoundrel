# 🔗 Module Dependencies - Dungeon Scoundrel

## Load Order (CRITICAL - Do not change!)

Current `index.html` order (defer; modules are deferred by spec and run in document order with the classic `defer` scripts):

```
1.  silent-logging.js          (logging shims - first)
2.  error-handler.js           (global error capture)
3.  inline-scripts.js          (waitlist, email, bug reports)
4.  firebase-config.js         (Firebase web config)
5.  firebase-auth.js           [MODULE] (authentication)
6.  helpers.js                 (utilities - storage, trapFocus, hapticFeedback, startInteractiveTutorial)
7.  mobile-optimization.js
8.  offline-storage.js
9.  achievements.js            (ACHIEVEMENTS, unlockAchievement, checkAchievements)
10. game-data.js               (RELICS, SHOP_ITEMS, EVENTS)
11. stats.js                   (lifetime stats; updateLifetimeStats)
12. leaderboard.js             (leaderboard; switchLeaderboardMode/Sort)
13. audio-context.js
14. music.js                   (window.music)
15. init-emailjs.js
16. firebase-ready.js
17. game.js                    [MODULE] (main loop; exposes game, drawRoom, checkGameState, STORAGE_KEYS, createCardElement, …)
18. codex.js                   (AFTER game.js - needs UNLOCKS/permanentUnlocks/RELICS)
19. adventure-map.js           [MODULE] (window.AdventureMap - procedural map)
20. adventure-run.js           (AFTER game.js - window.AdventureRun; reuses window.drawRoom/checkGameState)
21. in-game-tutorial.js        (AFTER game.js - window.InGameTutorial; Classic first-play)
22. register-sw.js             (service worker)
```

> game.js + game-sounds.js are ES modules; the Adventure/tutorial/codex classic
> scripts load **after** game.js and consume its `window.*` API (engine reuse via
> the `game.adventureRun` flag, not monkey-patching).

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
window.switchLeaderboardMode    // Classic / Adventure board
window.switchLeaderboardSort    // Top Score / Fastest
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
window.drawRoom          // engine entry reused by Adventure
window.checkGameState    // Adventure intercepts here via game.adventureRun
window.STORAGE_KEYS      // for in-game-tutorial.js
window.sanitizePlayerName
window.ADV_ART_VER
```

### From **adventure-map.js** / **adventure-run.js** / **in-game-tutorial.js**:
```javascript
window.AdventureMap        // generateAdventureMap, start, renderInto, openScreen…
window.AdventureRun        // start, enter, afterEncounterCleared… (reuses window.drawRoom/checkGameState)
window.InGameTutorial      // check, isActive, skip, complete (+ legacy checkAndStartTutorial/skipTutorial/completeTutorial)
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

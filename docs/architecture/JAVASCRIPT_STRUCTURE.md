# 📁 JavaScript Structure - Dungeon Scoundrel

## 🗂️ Folder Organization

```
src/js/
├── config/            # Configuration
│   └── game-constants.js
├── core/              # Core systems (audio, errors, auth)
│   ├── audio-context.js
│   ├── error-handler.js
│   ├── firebase-auth.js
│   └── silent-logging.js
├── data/              # Game data (relics, events, shop, adventures)
│   ├── game-data.js
│   └── adventures.js
├── features/          # Standalone features
│   └── inline-scripts.js
├── modules/           # ES6 modules + Adventure mode
│   ├── game-state.js
│   ├── game-events.js
│   ├── game-shop.js
│   ├── game-relics.js
│   ├── game-sounds.js
│   ├── adventure-map.js
│   ├── adventure-run.js
│   └── in-game-tutorial.js
├── systems/           # Game systems (achievements, music, stats)
│   ├── achievements.js
│   ├── codex.js
│   ├── leaderboard.js
│   ├── music.js
│   └── stats.js
├── utils/             # Utility functions
│   ├── helpers.js
│   ├── mobile-optimization.js
│   └── offline-storage.js
└── game.js            # Main game logic (ES module)
```

---

## 📋 File Descriptions

### **Core Systems**
- `audio-context.js` - Web Audio API initialization
- `error-handler.js` - Global error handling
- `firebase-auth.js` - Firebase authentication & cloud sync

### **Data**
- `game-data.js` - Relics, events, shop items, special cards
- `adventures.js` - Adventure mode acts (`ACTS`) + per-class narrative (`ADVENTURES`: motivation, opening, finalBoss, ending)

### **Features**
- `inline-scripts.js` - Waitlist, email system, bug reports

### **Modules** (ES6 + Adventure mode)
- `game-state.js` / `game-events.js` / `game-shop.js` / `game-relics.js` - ES6 modules imported by `game.js`
- `game-sounds.js` - ES6 module: `playSound` / `soundEffects` (extracted from game.js)
- `adventure-map.js` - ES6 module: `window.AdventureMap` — procedural Slay-the-Spire map
- `adventure-run.js` - Classic script: `window.AdventureRun` — Adventure run orchestrator (loads after game.js)
- `in-game-tutorial.js` - Classic script: `window.InGameTutorial` — Classic first-play tutorial (extracted from game.js, loads after game.js)

### **Systems**
- `achievements.js` - Achievement tracking & unlocking
- `codex.js` - Encyclopedia / CODEX system (classic script, loads after game.js)
- `leaderboard.js` - Firebase leaderboard integration
- `music.js` - Dark atmospheric music system
- `stats.js` - Lifetime & permanent stats tracking

### **Utils**
- `helpers.js` - Storage, utility functions
- `mobile-optimization.js` - Mobile/PWA optimizations
- `offline-storage.js` - IndexedDB for saves

### **Main**
- `game.js` - Core game logic, UI updates (ES module). The interactive tutorial and sound effects moved out (see `modules/in-game-tutorial.js`, `modules/game-sounds.js`)

---

## 🔗 Load Order (index.html)

1. `core/silent-logging.js` (loads first, before `<head>` scripts)
2. `core/error-handler.js` (must load early)
3. Firebase config (`src/config/firebase-config.js`, gitignored)
4. `features/inline-scripts.js` (waitlist & email, `defer`)
5. `core/firebase-auth.js` (authentication, `type=module` `defer`)
6. `utils/helpers.js` (utilities, `defer`)
7. `utils/mobile-optimization.js` (`defer`)
8. `utils/offline-storage.js` (IndexedDB, `defer`)
9. `systems/achievements.js` (`defer`)
10. `data/game-data.js` (game data, `defer`)
11. `systems/stats.js` (stats tracking, `defer`)
12. `systems/leaderboard.js` (`defer`)
13. `core/audio-context.js` (audio init, `defer`)
14. `systems/music.js` (music system, `defer`)
15. `init-emailjs.js` / `firebase-ready.js` (`defer`)
16. **`game.js`** (main game logic — `type=module` `defer`; imports `modules/game-state.js`, `game-events.js`, `game-shop.js`, `game-relics.js`, `game-sounds.js`)
17. `systems/codex.js` (classic script, loads **after** game.js)
18. `modules/adventure-map.js` (`type=module` `defer`)
19. `modules/adventure-run.js` (classic script, loads **after** game.js + adventure-map.js)
20. `modules/in-game-tutorial.js` (classic script, loads **after** game.js)
21. `register-sw.js` (service worker registration, `defer`)

### Module vs. classic-script contract
- `game.js`, `firebase-auth.js`, and `adventure-map.js` are **ES modules** (`type=module`); `game.js` `import`s its `modules/*` ES dependencies directly.
- `adventure-run.js`, `in-game-tutorial.js`, and `codex.js` are **classic scripts** loaded *after* `game.js`, so they consume the engine through `window.*` (e.g. `window.game`, `window.drawRoom`, `window.checkGameState`, `window.showMessage`, `window.STORAGE_KEYS`) rather than `import`. ES modules execute deferred and in order, so `game.js` has finished and exposed its `window.*` API by the time these run.
- Adventure mode reuses the existing engine via flags rather than monkey-patching: `game.adventureRun` gates the linear-room behaviour inside `drawRoom`/`checkGameState`, and a cleared adventure room calls `window.AdventureRun.afterEncounterCleared()`. `window.drawRoom` / `window.checkGameState` are exposed for the map encounters.

---

## ✅ Best Practices

- ✅ **Modular structure** - Each file has a single responsibility
- ✅ **No duplicates** - All DOM declarations centralized in `game.js`
- ✅ **Global exposure** - Functions exposed via `window.*` for cross-module use
- ✅ **Clean organization** - Files grouped by purpose
- ✅ **No dead code** - Unused files removed

---

## 🚀 Version: v1.5.0
**Last Updated:** 2026-06-30
**Author:** Gabriel Lima

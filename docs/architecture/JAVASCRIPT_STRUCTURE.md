# 📁 JavaScript Structure - Dungeon Scoundrel

## 🗂️ Folder Organization

```
src/js/
├── core/              # Core systems (audio, errors, auth)
│   ├── audio-context.js
│   ├── error-handler.js
│   └── firebase-auth.js
├── data/              # Game data (relics, events, shop)
│   └── game-data.js
├── features/          # Standalone features
│   └── inline-scripts.js
├── systems/           # Game systems (achievements, music, stats)
│   ├── achievements.js
│   ├── leaderboard.js
│   ├── music.js
│   └── stats.js
├── utils/             # Utility functions
│   └── helpers.js
└── game.js            # Main game logic (includes CODEX)
```

---

## 📋 File Descriptions

### **Core Systems**
- `audio-context.js` - Web Audio API initialization
- `error-handler.js` - Global error handling
- `firebase-auth.js` - Firebase authentication & cloud sync

### **Data**
- `game-data.js` - Relics, events, shop items, special cards

### **Features**
- `inline-scripts.js` - Waitlist, email system, bug reports

### **Systems**
- `achievements.js` - Achievement tracking & unlocking
- `leaderboard.js` - Firebase leaderboard integration
- `music.js` - Dark atmospheric music system
- `stats.js` - Lifetime & permanent stats tracking

### **Utils**
- `helpers.js` - Storage, tutorial, utility functions

### **Main**
- `game.js` - Core game logic, CODEX system, UI updates

---

## 🔗 Load Order (index.html)

1. `error-handler.js` (must load first)
2. `inline-scripts.js` (waitlist & email)
3. `firebase-auth.js` (authentication)
4. `helpers.js` (utilities)
5. `achievements.js` (achievement system)
6. `game-data.js` (game data)
7. `stats.js` (stats tracking)
8. `leaderboard.js` (leaderboard)
9. `audio-context.js` (audio init)
10. `music.js` (music system)
11. `game.js` (main game logic)

---

## ✅ Best Practices

- ✅ **Modular structure** - Each file has a single responsibility
- ✅ **No duplicates** - All DOM declarations centralized in `game.js`
- ✅ **Global exposure** - Functions exposed via `window.*` for cross-module use
- ✅ **Clean organization** - Files grouped by purpose
- ✅ **No dead code** - Unused files removed (e.g., old `codex.js`)

---

## 🚀 Version: v1.5.0
**Last Updated:** 2025-11-11
**Author:** Gabriel Lima

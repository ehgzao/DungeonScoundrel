# 🏗️ Dungeon Scoundrel - Modular Architecture

**Version:** 2.0  
**Last Updated:** 2025-11-08

---

## 📁 Folder Structure

```
src/js/
├── core/              ← Core game logic
│   ├── game.js        (Main game loop, state management)
│   ├── config.js      (Game configuration)
│   └── state.js       (Game state management)
│
├── systems/           ← Independent game systems
│   ├── codex.js       (CODEX system - Upgrades, Relics, Achievements)
│   ├── shop.js        (Merchant system)
│   ├── combat.js      (Combat & card mechanics)
│   ├── achievements.js (Achievement tracking)
│   ├── music.js       (Music & sound management)
│   └── leaderboard.js (Score tracking)
│
├── ui/                ← UI components
│   ├── modals.js      (Modal management)
│   ├── cards.js       (Card rendering)
│   └── events.js      (Event handling & delegation)
│
└── utils/             ← Utilities & helpers
    ├── constants.js   (All game constants) ✅
    ├── storage.js     (localStorage wrapper) ✅
    └── helpers.js     (Helper functions) ✅
```

---

## 🎯 Design Principles

### 1. **Separation of Concerns**
Each module has a single, clear responsibility.

### 2. **ES6 Modules**
Uses `import`/`export` for clean dependencies.

### 3. **No Global Pollution**
Everything is scoped within modules.

### 4. **Easy Testing**
Pure functions, easy to unit test.

### 5. **Future-Proof**
Ready for TypeScript, bundlers (Vite/Webpack).

---

## 📦 Module Responsibilities

### **utils/constants.js**
```javascript
// All game constants
export const SUITS = { ... };
export const CLASSES = { ... };
export const ACHIEVEMENTS = { ... };
```

### **utils/storage.js**
```javascript
// Safe localStorage operations
export const storage = {
    get(key, defaultValue),
    set(key, value),
    remove(key)
};
```

### **utils/helpers.js**
```javascript
// Utility functions
export function shuffleArray(arr) { ... }
export function formatTime(seconds) { ... }
export function clamp(value, min, max) { ... }
```

### **core/game.js**
```javascript
// Main game loop
import { CLASSES } from '../utils/constants.js';
import { storage } from '../utils/storage.js';

export class Game {
    constructor() { ... }
    start() { ... }
    update() { ... }
}
```

### **systems/codex.js**
```javascript
// CODEX system
export function openCodex(tab) { ... }
export function switchCodexTab(tabName) { ... }
export function populateCodexUpgrades() { ... }
```

### **systems/shop.js**
```javascript
// Shop system
export function openShop() { ... }
export function buyItem(item, price) { ... }
export function updateShopDisplay() { ... }
```

### **systems/achievements.js**
```javascript
// Achievement tracking
export function checkAchievements() { ... }
export function unlockAchievement(id) { ... }
export function loadAchievements() { ... }
```

### **ui/modals.js**
```javascript
// Modal management
export function openModal(id) { ... }
export function closeModal(id) { ... }
export function showMessage(text, type) { ... }
```

### **ui/events.js**
```javascript
// Event delegation (no onclick inline!)
export function initializeEventListeners() { ... }
export function handleButtonClick(event) { ... }
```

---

## 🔄 Migration Strategy

### **Phase 1: Utilities** ✅
- [x] Extract constants
- [x] Extract storage wrapper
- [x] Extract helpers

### **Phase 2: Systems**
- [ ] Extract CODEX system
- [ ] Extract shop system
- [ ] Extract achievements
- [ ] Extract music system

### **Phase 3: UI**
- [ ] Extract modal management
- [ ] Extract card rendering
- [ ] Remove onclick inline

### **Phase 4: Core**
- [ ] Refactor main game loop
- [ ] Create Game class
- [ ] Clean state management

### **Phase 5: Mobile**
- [ ] Fix mobile CSS with clean structure
- [ ] Test responsive design
- [ ] Validate all systems

---

## 🚀 Benefits

### Before:
```javascript
// game.js (7,220 lines)
// Everything in one file
// onclick inline everywhere
// Global variables
// Hard to maintain
```

### After:
```javascript
// Modular structure
// Clear responsibilities
// Easy to test
// Easy to maintain
// Ready for scale
```

---

## 📚 Usage Examples

### **Importing constants:**
```javascript
import { CLASSES, DIFFICULTIES } from './utils/constants.js';

const scoundrel = CLASSES.scoundrel;
const hardMode = DIFFICULTIES.hard;
```

### **Using storage:**
```javascript
import { storage } from './utils/storage.js';

// Save game
storage.set('game_state', gameData);

// Load game
const savedGame = storage.get('game_state', defaultState);
```

### **Using helpers:**
```javascript
import { shuffleArray, formatTime } from './utils/helpers.js';

const deck = shuffleArray(cards);
const timeStr = formatTime(120); // "02:00"
```

---

## 🧪 Testing

Each module can be tested independently:

```javascript
// test/utils/storage.test.js
import { storage } from '../src/js/utils/storage.js';

test('storage.set saves correctly', () => {
    storage.set('test_key', { value: 123 });
    const result = storage.get('test_key');
    expect(result.value).toBe(123);
});
```

---

## 🔮 Future Enhancements

1. **TypeScript Migration**
   - Add type safety
   - Better IDE support
   - Catch bugs at compile time

2. **Build System**
   - Vite/Webpack
   - Code splitting
   - Tree shaking
   - Minification

3. **Testing Framework**
   - Jest/Vitest
   - Unit tests
   - Integration tests
   - E2E tests

4. **CI/CD**
   - GitHub Actions
   - Automated testing
   - Automated deployment

---

## 📝 Development Guidelines

### **When creating a new module:**

1. **Single Responsibility**
   ```javascript
   // ✅ GOOD
   // shop.js - only shop logic
   export function openShop() { ... }
   export function buyItem() { ... }
   
   // ❌ BAD
   // shop.js - mixed responsibilities
   export function openShop() { ... }
   export function checkAchievements() { ... } // Wrong file!
   ```

2. **Clear Exports**
   ```javascript
   // ✅ GOOD - Named exports
   export function doSomething() { ... }
   export const VALUE = 123;
   
   // ❌ BAD - Default exports can be confusing
   export default { ... };
   ```

3. **Documentation**
   ```javascript
   /**
    * Opens the shop modal
    * @returns {void}
    */
   export function openShop() { ... }
   ```

4. **Error Handling**
   ```javascript
   export function riskyOperation() {
       try {
           // operation
       } catch (error) {
           console.error('Operation failed:', error);
           return fallback;
       }
   }
   ```

---

## 🆘 Troubleshooting

### **Module not found**
```javascript
// Make sure path is correct
import { storage } from './utils/storage.js'; // ✅
import { storage } from 'utils/storage.js';   // ❌ Missing ./
```

### **Circular dependencies**
```javascript
// Avoid importing modules that import each other
// Use events or dependency injection instead
```

### **Global variables**
```javascript
// ❌ AVOID
window.myGlobalVar = 123;

// ✅ USE
export const myVar = 123;
```

---

## 📞 Contact

For questions about the architecture, check:
- `docs/development/REFACTOR_PROGRESS.md`
- `docs/development/V1_3_2_CHECKLIST.md`

---

**Happy Coding! 🎮**

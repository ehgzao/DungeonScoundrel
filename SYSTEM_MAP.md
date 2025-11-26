# 🗺️ DUNGEON SCOUNDREL - SYSTEM MAP

**Gerado em:** 2025-11-26
**Versão do jogo:** 1.4.3
**Propósito:** Documento de referência para modularização segura

---

## 📋 0.1 INVENTÁRIO DE SCRIPTS

### Scripts no index.html (ordem de carregamento)

| # | Script | Tipo | Atributos | Tamanho |
|---|--------|------|-----------|---------|
| 1 | `src/js/core/error-handler.js` | Normal | - | 2.2KB |
| 2 | `src/js/features/inline-scripts.js` | Normal | - | 35KB |
| 3 | `src/config/firebase-config.js` | Normal | - | 0.7KB |
| 4 | `src/js/core/firebase-auth.js` | **Module** | - | 20KB |
| 5 | `src/js/utils/helpers.js` | Normal | - | 36KB |
| 6 | `src/js/utils/mobile-optimization.js` | Normal | - | 10KB |
| 7 | `src/js/utils/offline-storage.js` | Normal | - | 16KB |
| 8 | `src/js/systems/achievements.js` | Normal | - | 14.5KB |
| 9 | `src/js/data/game-data.js` | Normal | - | 28KB |
| 10 | `src/js/systems/stats.js` | Normal | - | 6KB |
| 11 | `src/js/systems/leaderboard.js` | Normal | - | 8KB |
| 12 | `src/js/core/audio-context.js` | Normal | - | 0.6KB |
| 13 | `src/js/systems/music.js` | Normal | - | 20KB |
| 14 | EmailJS CDN | External | - | CDN |
| 15 | `src/js/init-emailjs.js` | Normal | defer | 0.3KB |
| 16 | `src/js/firebase-ready.js` | Normal | defer | 1KB |
| 17 | `src/js/game.js` | **Module** | defer | **205KB** |
| 18 | `src/js/systems/codex.js` | Normal | defer | 16KB |

### Arquivos JS Auxiliares (não carregados diretamente)

| Arquivo | Tamanho | Usado por |
|---------|---------|-----------|
| `src/js/config/game-constants.js` | 14.5KB | game.js, game-state.js, game-classes.js |
| `src/js/modules/game-state.js` | 8KB | game.js, game-classes.js |
| `src/js/modules/game-events.js` | 6KB | game.js |
| `src/js/modules/game-shop.js` | 10.5KB | game.js |
| `src/js/modules/game-relics.js` | 7KB | game.js |
| `src/js/modules/game-classes.js` | ~18KB | game.js |
| `src/js/modules/game-sounds.js` | ~10KB | game.js |
| `src/js/modules/game-deck.js` | ~12KB | game.js ✨ **NOVO** |

---

## 📊 0.2 GRAFO DE DEPENDÊNCIAS

### Arquivos ES6 Modules (import/export)

| Arquivo | Importa de | Exporta |
|---------|------------|---------|
| `game.js` | `game-constants.js`, `game-state.js`, `game-events.js`, `game-shop.js`, `game-relics.js`, `game-classes.js`, `game-sounds.js` | Expõe globalmente via `window.*` |
| `game-classes.js` | `game-state.js`, `game-constants.js` | `CLASSES`, `PASSIVE_ICONS`, `checkClassUnlocks`, `getBloodlustBonus`, `useClassAbility`, `updateAbilityUI`, `startGameWithClass`, `getPassiveIcons` |
| `game-sounds.js` | `game-state.js` | `playSound`, `soundEffects` |
| `game-deck.js` | `game-state.js`, `game-constants.js` | `specialCards`, `createDeck`, `shuffleDeck`, `balanceEasyModeDeck` |
| `game-constants.js` | - | `HEALTH`, `GOLD`, `CARDS`, `COMBO`, `BOSS`, `DIFFICULTY`, `EVENT_CONFIG`, `POTIONS`, `RELIC_CONFIG`, `ACHIEVEMENT_CONFIG`, `UI`, `TIMING`, `SHOP_PRICES`, `SHOP_VALUES`, `CLASS_COOLDOWNS`, `KEYS`, `STORAGE_KEYS`, `GAME_MODES`, `CARD_TYPES`, `SUITS`, `LOG_TYPES`, `MESSAGE_TYPES`, `SPECIAL_CARDS`, `COMBAT`, `LUCKY_DRAW` |
| `game-state.js` | `game-constants.js` | `game`, `permanentStats`, `permanentUnlocks`, `UNLOCKS` |
| `game-events.js` | `game-state.js` | `triggerRandomEvent`, `showEventModal`, `closeEventWrapper` |
| `game-shop.js` | `game-state.js` | `updateShopDisplay`, `buyItem`, `openShop`, `closeShop` |
| `game-relics.js` | `game-state.js` | `giveRelicByRarity`, `giveRandomRelic`, `giveRareRelic`, `updateRelicsDisplay`, `getRelicBonus` |
| `firebase-auth.js` | Firebase CDN (ESM) | `db`, `auth` (via window) |

### Arquivos Tradicionais (variáveis globais)

| Arquivo | Cria Globais (window.*) | Usa Globais |
|---------|-------------------------|-------------|
| `error-handler.js` | - | - |
| `inline-scripts.js` | `joinWaitlist` | `emailjs` |
| `firebase-config.js` | `__firebase_config`, `__app_id` | - |
| `helpers.js` | `storage`, `showTooltip`, `hideTooltip`, `screenShake`, `createParticles`, `showDamageNumber`, `showCombo`, `startInteractiveTutorial`, `trapFocus`, `hapticFeedback`, `setButtonLoading`, `pulseElement`, `shakeElement`, `checkMobileOrientation` | `mobileOptimization` |
| `mobile-optimization.js` | `mobileOptimization` | - |
| `offline-storage.js` | `offlineStorage` | - |
| `achievements.js` | `ACHIEVEMENTS`, `loadAchievements`, `saveAchievements`, `checkAllAchievements`, `updateAchievementCounter`, `unlockAchievement` | `storage` |
| `game-data.js` | `RELICS`, `EVENTS`, `SHOP_ITEMS`, `CLASSES` | `game`, `takeDamage`, `showMessage`, `updateRelicsDisplay`, `earnGold`, `updateUI` |
| `stats.js` | `loadPermanentStats`, `savePermanentStats` | `storage` |
| `leaderboard.js` | `showLeaderboard`, `loadLeaderboardForDifficulty`, `submitScoreToLeaderboard`, `switchLeaderboardDifficulty` | `db`, `auth`, `game` |
| `audio-context.js` | `audioContext` | - |
| `music.js` | `music` | `audioContext` |
| `codex.js` | `openCodex`, `switchCodexTab`, `filterRelicsByRarity`, `filterUpgradesByStatus`, `filterAchievementsByTier` | `UNLOCKS`, `permanentUnlocks`, `RELICS`, `ACHIEVEMENTS`, `trapFocus`, `hapticFeedback` |
| `firebase-ready.js` | `FirebaseReady` (Promise) | `db`, `auth` |
| `init-emailjs.js` | - | `emailjs` |

### Exposições do game.js para window.*

```javascript
// Funções expostas
window.playSound
window.showTutorial
window.startInteractiveTutorial
window.showMessage
window.earnGold
window.giveRandomRelic
window.giveRelicByRarity
window.updateUI
window.updateRelicsDisplay
window.takeDamage
window.resetCombo
window.buyItem
window.handleCardClick
window.getCardType
window.loadUnlocks
window.saveUnlocks

// Estado e dados
window.game
window.playerNameInput
window.permanentUnlocks
window.UNLOCKS
window.RELIC_CONFIG
window.createCardElement
window.createMiniCardElement
```

---

## 📜 0.3 ORDEM DE CARREGAMENTO

```
┌─────────────────────────────────────────────────────────────────┐
│ FASE 1: CORE & ERROR HANDLING                                   │
├─────────────────────────────────────────────────────────────────┤
│ 1. error-handler.js      → Global error handler                 │
│ 2. inline-scripts.js     → Waitlist, bug report, contact forms  │
│ 3. firebase-config.js    → Firebase credentials                 │
│ 4. firebase-auth.js      → Firebase init + Google Auth (MODULE) │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FASE 2: UTILITIES                                               │
├─────────────────────────────────────────────────────────────────┤
│ 5. helpers.js            → storage, tooltip, particles, etc.    │
│ 6. mobile-optimization.js → Mobile device detection/optimization│
│ 7. offline-storage.js    → IndexedDB offline storage            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FASE 3: SYSTEMS & DATA                                          │
├─────────────────────────────────────────────────────────────────┤
│ 8. achievements.js       → 50 achievements system               │
│ 9. game-data.js          → RELICS, EVENTS, SHOP_ITEMS, CLASSES  │
│ 10. stats.js             → Permanent stats (localStorage)       │
│ 11. leaderboard.js       → Firebase leaderboard                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FASE 4: AUDIO                                                   │
├─────────────────────────────────────────────────────────────────┤
│ 12. audio-context.js     → AudioContext initialization          │
│ 13. music.js             → DarkAtmosphericMusic class           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FASE 5: EXTERNAL & INIT                                         │
├─────────────────────────────────────────────────────────────────┤
│ 14. EmailJS CDN          → Email sending library                │
│ 15. init-emailjs.js      → EmailJS initialization (defer)       │
│ 16. firebase-ready.js    → Firebase ready promise (defer)       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FASE 6: MAIN GAME (ES6 MODULE)                                  │
├─────────────────────────────────────────────────────────────────┤
│ 17. game.js              → Main game engine (MODULE, defer)     │
│     ├── imports game-constants.js                               │
│     ├── imports game-state.js                                   │
│     ├── imports game-events.js                                  │
│     ├── imports game-shop.js                                    │
│     └── imports game-relics.js                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FASE 7: POST-GAME                                               │
├─────────────────────────────────────────────────────────────────┤
│ 18. codex.js             → CODEX UI (after game.js for UNLOCKS) │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔌 0.4 PONTOS DE INTEGRAÇÃO EXTERNA

### Firebase
- **SDK Version:** 11.6.1 (Modular/ESM)
- **Services:** Auth (Google + Anonymous), Firestore
- **Arquivos:** `firebase-config.js`, `firebase-auth.js`
- **Globais:** `window.db`, `window.auth`
- **Promise:** `window.FirebaseReady`

### Netlify
- **Config:** `netlify.toml`
- **Publish Dir:** `public/`
- **Headers:** CSP, CORS, Cache
- **No Functions:** Static site only

### Service Worker
- **Arquivo:** `public/sw.js`
- **Generator:** Workbox
- **Config:** `workbox-config.js`
- **Status:** ⚠️ Não está registrando (BACKLOG P0-1)

### EmailJS
- **Service:** Bug reports, contact, waitlist
- **CDN:** `https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js`
- **Init:** `init-emailjs.js`
- **Public Key:** `JhH3cSIF6g3y73-Yk`

### LocalStorage Keys
```javascript
// Principais
'scoundrel_lifetime_stats'     // Estatísticas permanentes
'scoundrel_unlocks'            // Upgrades desbloqueados
'dungeon_scoundrel_achievements' // Achievements
'dungeon_scoundrel_tutorial_completed'
'dungeon_scoundrel_tutorial_skipped'
'dungeon_scoundrel_played_before'
'dismissedMobileWarning'        // Mobile waitlist dismissed

// Leaderboard cache
'leaderboard_cache_*'
```

---

## ⚠️ 0.5 RISCOS E DEPENDÊNCIAS CRÍTICAS

### Dependências Circulares Potenciais
1. `game-data.js` usa `game`, `takeDamage`, `showMessage` → definidos em `game.js`
2. `codex.js` usa `UNLOCKS`, `permanentUnlocks` → definidos/expostos por `game.js`
3. Módulos usam `window.*` functions que são expostas DEPOIS do carregamento

### Ordem Crítica
1. `audio-context.js` **DEVE** carregar antes de `music.js`
2. `helpers.js` **DEVE** carregar antes de `achievements.js` (usa `storage`)
3. `game.js` **DEVE** carregar antes de `codex.js` (expõe `UNLOCKS`)

### Arquivos que NÃO podem virar ES6 Modules facilmente
- `achievements.js` → Usado por `game-data.js` via global
- `game-data.js` → Usado por múltiplos arquivos via global
- `codex.js` → Depende de globais do `game.js`

---

## 📁 ESTRUTURA DE PASTAS

```
public/
├── src/
│   ├── config/
│   │   ├── firebase-config.js         # Credenciais Firebase
│   │   ├── firebase-config.local.js   # (gitignored)
│   │   └── firebase-config.template.js
│   ├── js/
│   │   ├── config/
│   │   │   └── game-constants.js      # Constantes (ES6 Module)
│   │   ├── core/
│   │   │   ├── audio-context.js       # AudioContext global
│   │   │   ├── error-handler.js       # Error handler global
│   │   │   └── firebase-auth.js       # Firebase + Auth (ES6 Module)
│   │   ├── data/
│   │   │   └── game-data.js           # RELICS, EVENTS, CLASSES
│   │   ├── features/
│   │   │   └── inline-scripts.js      # Waitlist, forms
│   │   ├── modules/
│   │   │   ├── game-classes.js        # Class system (ES6 Module)
│   │   │   ├── game-events.js         # Random events (ES6 Module)
│   │   │   ├── game-relics.js         # Relic system (ES6 Module)
│   │   │   ├── game-shop.js           # Shop system (ES6 Module)
│   │   │   ├── game-sounds.js         # Sound effects (ES6 Module) ✨ NOVO
│   │   │   └── game-state.js          # Game state (ES6 Module)
│   │   ├── systems/
│   │   │   ├── achievements.js        # 50 achievements
│   │   │   ├── codex.js               # Codex UI
│   │   │   ├── leaderboard.js         # Firebase leaderboard
│   │   │   ├── music.js               # Music system
│   │   │   └── stats.js               # Permanent stats
│   │   ├── utils/
│   │   │   ├── helpers.js             # Utility functions
│   │   │   ├── mobile-optimization.js # Mobile optimizations
│   │   │   └── offline-storage.js     # IndexedDB storage
│   │   ├── firebase-ready.js          # Firebase ready promise
│   │   ├── game.js                    # 🔴 MAIN ENGINE (205KB!)
│   │   └── init-emailjs.js            # EmailJS init
│   └── styles/
│       ├── animations.css
│       ├── buttons.css
│       ├── scrollbar.css
│       ├── styles.css
│       ├── variables.css
│       └── components/
│           └── waitlist.css
├── assets/
│   ├── icons/
│   └── images/
├── index.html
├── sw.js
└── site.webmanifest
```

---

## 🎯 PRÓXIMOS PASSOS PARA MODULARIZAÇÃO

### Ordem Recomendada de Extração (do game.js)

| Prioridade | Sistema | Linhas Aprox. | Dependências | Status |
|------------|---------|---------------|--------------|--------|
| 1 | Sistema de Classes | ~340 | Baixa - isolado | ✅ **CONCLUÍDO** |
| 2 | Sistema de Deck/Cartas | ~270 | Média - usa game state | ✅ **CONCLUÍDO** |
| 3 | Sistema de Combate | ~600 | Alta - usa muitos sistemas | 🔴 Pendente |
| 4 | Sistema de Tutorial | ~200 | Baixa - já em helpers.js | ✅ **JÁ EXISTE** |
| 5 | Sistema de Sons (SFX) | ~270 | Baixa - isolado | ✅ **CONCLUÍDO** |
| 6 | Sistema de UI Manager | ~500 | Alta - muito acoplado | 🔴 Pendente |

### Padrão de Extração Seguro
1. Criar novo arquivo com exports
2. Adicionar import no game.js
3. Expor via `window.*` para manter compatibilidade
4. Testar antes de remover código duplicado
5. Remover código original do game.js

---

## 📝 NOTAS IMPORTANTES

1. **game.js é monolítico (205KB, 4867 linhas)** - Principal alvo de modularização
2. **Muitos scripts dependem de window.*** - Não podemos migrar tudo para ES6 Modules de uma vez
3. **Ordem de carregamento é CRÍTICA** - Alterações devem manter a sequência
4. **CODEX carrega por ÚLTIMO** - Depende de `UNLOCKS` exposto pelo game.js
5. **Firebase usa SDK Modular (v9+)** - Não há objeto global `firebase`

---

**Documento mantido por:** Gabriel Lima
**Próxima revisão:** Antes de cada item do backlog de modularização

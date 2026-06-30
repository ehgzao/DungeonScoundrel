# 🗺️ MAPA DE DEPENDÊNCIAS - DUNGEON SCOUNDREL

## 📋 **ORDEM DE CARREGAMENTO (index.html)**

```
 1. silent-logging.js         ✅ Sem dependências (carrega primeiro)
 2. error-handler.js          ✅ Sem dependências
 3. Firebase Config           ✅ Sem dependências
 4. inline-scripts.js         ✅ Sem dependências (EmailJS externo)
 5. firebase-auth.js          ⚠️ Depende: Firebase (type=module)
 6. helpers.js                ✅ Sem dependências
 7. mobile-optimization.js    ✅ Sem dependências
 8. offline-storage.js        ✅ Sem dependências (IndexedDB)
 9. achievements.js           ⚠️ Depende: helpers (playSound, createParticles)
10. game-data.js              ✅ Sem dependências
11. stats.js                  ⚠️ Depende: helpers (storage)
12. leaderboard.js            ⚠️ Depende: Firebase
13. audio-context.js          ✅ Sem dependências
14. music.js                  ⚠️ Depende: audioContext
15. game.js                   ⚠️ type=module — importa modules/game-state, game-events,
                                  game-shop, game-relics, game-sounds; depende de TUDO acima
16. codex.js                  ⚠️ Classic script DEPOIS de game.js — usa window.*
17. adventure-map.js          ⚠️ type=module — importa data/adventures.js
18. adventure-run.js          ⚠️ Classic script DEPOIS de game.js + adventure-map.js — usa window.*
19. in-game-tutorial.js       ⚠️ Classic script DEPOIS de game.js — usa window.*
20. register-sw.js            ✅ Registro do Service Worker
```

> **Module vs. classic script:** `game.js`, `firebase-auth.js` e `adventure-map.js` são
> ES modules (`type=module`); os demais (`codex.js`, `adventure-run.js`,
> `in-game-tutorial.js`) são scripts clássicos carregados DEPOIS de `game.js` e
> consomem o engine via `window.*`. Como módulos ES executam deferidos e em ordem,
> `game.js` já expôs sua API `window.*` quando esses scripts rodam.

---

## ⚠️ **PROBLEMAS IDENTIFICADOS:**

### **1. achievements.js**
- ❌ Usa `playSound()` que está em game.js
- ❌ Usa `createParticles()` que está em game.js
- ✅ **SOLUÇÃO:** Verificar se existem antes de usar

### **2. music.js**
- ✅ Agora limpo, sem dependências de game
- ✅ Expõe `window.music`

### **3. game.js**
- ✅ Expõe funções necessárias via `window.*`
- ⚠️ Precisa expor MAIS funções

---

## 🔧 **FUNÇÕES QUE PRECISAM SER GLOBAIS:**

### **Já Expostas ✅:**
- `window.showTooltip` (helpers.js)
- `window.hideTooltip` (helpers.js)
- `window.screenShake` (helpers.js)
- `window.music` (music.js)
- `window.showLeaderboard` (leaderboard.js)
- `window.loadLeaderboardForDifficulty` (leaderboard.js)
- `window.openCodex` (game.js)
- `window.playSound` (modules/game-sounds.js — extraído de game.js)
- `window.drawRoom` (game.js — usado pelas encontros do mapa Adventure)
- `window.checkGameState` (game.js — chama AdventureRun.afterEncounterCleared no Adventure)
- `window.STORAGE_KEYS` (game.js — para in-game-tutorial.js)
- `window.AdventureMap` / `window.generateAdventureMap` (modules/adventure-map.js)
- `window.AdventureRun` (modules/adventure-run.js)
- `window.InGameTutorial` (modules/in-game-tutorial.js — extraído de game.js;
  também expõe os nomes legados `checkAndStartTutorial`, `skipTutorial`, `completeTutorial`)

### **Faltam Expor ⚠️:**
- `createParticles` (usado em achievements.js)
- `showMessage` (usado em vários lugares)
- `showDamageNumber` (usado em vários lugares)
- `earnGold` (usado em game-data.js)
- `giveRandomRelic` (usado em game-data.js)
- `updateUI` (usado em game-data.js)
- `updateRelicsDisplay` (usado em game-data.js)
- `takeDamage` (usado em game-data.js)

---

## 🎯 **PLANO DE CORREÇÃO:**

1. ✅ Expor funções faltantes em game.js
2. ✅ Adicionar verificações de existência em achievements.js
3. ✅ Documentar todas as dependências
4. ✅ Testar ordem de carregamento

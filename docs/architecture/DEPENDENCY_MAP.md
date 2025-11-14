# 🗺️ MAPA DE DEPENDÊNCIAS - DUNGEON SCOUNDREL

## 📋 **ORDEM DE CARREGAMENTO (index.html)**

```
1. error-handler.js          ✅ Sem dependências
2. inline-scripts.js          ✅ Sem dependências (EmailJS externo)
3. Firebase Config (inline)   ✅ Sem dependências
4. firebase-auth.js           ⚠️ Depende: Firebase
5. helpers.js                 ✅ Sem dependências
6. achievements.js            ⚠️ Depende: helpers (playSound, createParticles)
7. game-data.js              ✅ Sem dependências
8. stats.js                   ⚠️ Depende: helpers (storage)
9. leaderboard.js            ⚠️ Depende: Firebase
10. audio-context.js          ✅ Sem dependências
11. music.js                  ⚠️ Depende: audioContext
12. game.js                   ⚠️ Depende: TUDO acima
```

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
- `window.playSound` (game.js)
- `window.showTutorial` (game.js)
- `window.startInteractiveTutorial` (game.js)

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

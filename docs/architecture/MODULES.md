# 📦 MÓDULOS DO DUNGEON SCOUNDREL

**Data:** 2026-06-30  
**Fase:** 1.2 - Modularização do game.js (+ modo Adventure)

---

## 📊 VISÃO GERAL

### **Objetivo:**
Dividir o monolítico `game.js` em módulos menores e mais gerenciáveis, e adicionar o modo Adventure (mapa procedural) reusando o engine existente.

### **Progresso Atual:**
- ✅ **Completo:** game-state, game-events, game-shop, game-relics, game-sounds, in-game-tutorial, adventure-map, adventure-run
- ⏳ **Pendente:** game-cards
- ⏸️ **Pausado:** game-combat, game-ui

> **Tipos:** módulos ES6 importados por `game.js` (game-state, game-events, game-shop, game-relics, game-sounds) vs. scripts clássicos carregados depois e que usam `window.*` (in-game-tutorial, adventure-run; também codex). `adventure-map.js` é ES module (`type=module`).

---

## ✅ MÓDULOS CRIADOS

### **1. modules/game-state.js** ✅
**Status:** Completo (v1.6.4)  
**Linhas:** 165  
**Criado:** 2025-11-11

#### **Conteúdo:**
- `game` object - Estado central do jogo
- `permanentStats` object - Estatísticas permanentes
- `permanentUnlocks` object - Desbloqueios permanentes
- `UNLOCKS` array - Definições de desbloqueios
- Funções de inicialização

#### **Dependências:**
- ✅ `config/game-constants.js` (ES6 module)

#### **Exposição Global:**
```javascript
window.game = game;
window.permanentStats = permanentStats;
window.permanentUnlocks = permanentUnlocks;
window.UNLOCKS = UNLOCKS;
```

#### **Importado Por:**
- `game.js`
- `game-events.js`
- `game-shop.js`
- `game-relics.js`

#### **Teste:**
- ✅ game object existe
- ✅ permanentUnlocks existe
- ✅ UNLOCKS array existe
- ✅ Jogo inicia sem erros

---

### **2. modules/game-events.js** ✅
**Status:** Completo (v1.6.8)  
**Linhas:** 185  
**Criado:** 2025-11-11

#### **Conteúdo:**
- `triggerRandomEvent()` - Dispara evento aleatório
- `showEventModal()` - Exibe modal de evento
- `closeEventWrapper()` - Fecha modal de evento

#### **Dependências:**
- ✅ `modules/game-state.js` (game)
- ✅ `data/game-data.js` (EVENTS - global)
- ✅ `utils/helpers.js` (trapFocus - global)

#### **Exposição Global:**
```javascript
window.triggerRandomEvent = triggerRandomEvent;
window.showEventModal = showEventModal;
window.closeEventWrapper = closeEventWrapper;
```

#### **Importado Por:**
- `game.js`

#### **Teste:**
- ✅ Eventos aparecem aleatoriamente
- ✅ Modal abre e fecha corretamente
- ✅ Escolhas aplicam efeitos
- ✅ Sem erros no console

---

### **3. modules/game-shop.js** ✅
**Status:** Completo (v1.6.12)  
**Linhas:** 290  
**Criado:** 2025-11-11

#### **Conteúdo:**
- `updateShopDisplay()` - Atualiza lista de itens
- `buyItem()` - Compra item da loja
- `openShop()` - Abre modal da loja
- `closeShop()` - Fecha modal da loja

#### **Dependências:**
- ✅ `modules/game-state.js` (game, permanentUnlocks)
- ✅ `data/game-data.js` (SHOP_ITEMS - global)
- ✅ `config/game-constants.js` (SHOP_PRICES - global)

#### **Exposição Global:**
```javascript
window.updateShopDisplay = updateShopDisplay;
window.buyItem = buyItem;
window.openShop = openShop;
window.closeShop = closeShop;
window.closeShopWrapper = closeShopWrapper;
```

#### **Importado Por:**
- `game.js`

#### **Teste:**
- ✅ Shop abre ao clicar no botão Merchant
- ✅ Itens exibidos corretamente
- ✅ Compra funciona e atualiza gold
- ✅ Desconto de 10% aplicado corretamente
- ✅ Shop fecha corretamente

---

### **4. modules/game-relics.js** ✅
**Status:** Completo (v1.6.17)  
**Linhas:** 200  
**Criado:** 2025-11-11

#### **Conteúdo:**
- `giveRelicByRarity()` - Dá relíquia por raridade
- `giveRandomRelic()` - Dá relíquia aleatória
- `giveRareRelic()` - Dá relíquia rara
- `updateRelicsDisplay()` - Atualiza UI de relíquias
- `getRelicBonus()` - Calcula bônus de relíquias

#### **Dependências:**
- ✅ `modules/game-state.js` (game)
- ✅ `data/game-data.js` (RELICS - global)
- ✅ `config/game-constants.js` (RELIC_CONFIG - global)
- ✅ `utils/helpers.js` (showMessage, updateUI - global)

#### **Exposição Global:**
```javascript
window.giveRelicByRarity = giveRelicByRarity;
window.giveRandomRelic = giveRandomRelic;
window.giveRareRelic = giveRareRelic;
window.updateRelicsDisplay = updateRelicsDisplay;
window.getRelicBonus = getRelicBonus;
```

#### **Importado Por:**
- `game.js`

#### **Teste:**
- ✅ Relíquias são dadas corretamente
- ✅ Display atualiza com nova relíquia
- ✅ Efeitos de HP aplicados imediatamente
- ✅ Bônus calculados corretamente
- ✅ Sem erros no console

---

### **5. modules/game-sounds.js** ✅
**Status:** Completo  
**Tipo:** ES6 module (importado por game.js)

#### **Conteúdo:**
- `soundEffects` object - Definições de efeitos via Web Audio API (cardDraw, attack, damage, heal, equip, victory, defeat, etc.)
- `playSound(soundName)` - Toca um efeito sonoro pelo nome

#### **Dependências:**
- ✅ `modules/game-state.js` (game.settings.soundEnabled)
- ✅ `core/audio-context.js` (window.audioContext, window.sfxMasterGain — globais)

#### **Exposição Global:**
```javascript
window.playSound = playSound;
```

#### **Importado Por:**
- `game.js`

#### **Nota:** Extraído de game.js (`soundEffects` + `playSound`).

---

### **6. modules/in-game-tutorial.js** ✅
**Status:** Completo  
**Tipo:** Classic script (carrega APÓS game.js)

#### **Conteúdo:**
- Tutorial interativo do modo Classic (primeira partida no Easy), com 13 passos (`STEPS`)
- `check()` - Inicia o tutorial se ainda não visto, no Easy e fora do Adventure
- `showStep()` / `skip()` / `complete()` - Fluxo de passos, spotlight e modais

#### **Dependências (via window.*):**
- `window.game`, `window.drawRoom`, `window.showMessage`, `window.unlockAchievement`
- `window.pauseGameTimer` / `window.resumeGameTimer`
- `window.disableGameButtons` / `window.enableGameButtons`
- `window.STORAGE_KEYS`

#### **Exposição Global:**
```javascript
window.InGameTutorial = { check, isActive, skip, complete, showStep };
window.checkAndStartTutorial = check; // nomes legados
window.skipTutorial = skip;
window.completeTutorial = complete;
```

#### **Nota:** Extraído de game.js (TD-3) — comportamento inalterado, é um *pure move*. Suprimido no modo Adventure (que é map-driven).

---

### **7. modules/adventure-map.js** ✅
**Status:** Completo  
**Tipo:** ES6 module (`type=module`)

#### **Conteúdo:**
- `generateAdventureMap(playerClass, seed)` - Gera mapa procedural ramificado estilo Slay-the-Spire (3 atos), com garantias de balanceamento (campfire antes de cada boss, ≥1 loja por ato, elites limitados, caminho sempre conectado)
- `NODE_TYPES` - Tipos de nó: combat, elite, event, shop, rest, treasure, boss, finalboss
- `AdventureMap` - Estado de navegação (`start`, `reachable`, `select`, `node`) + renderização (`renderInto`, `openScreen`, `closeScreen`, `preview`)

#### **Dependências:**
- ✅ `data/adventures.js` (ACTS, ADVENTURES, adventureFor)

#### **Exposição Global:**
```javascript
window.AdventureMap = AdventureMap;
window.generateAdventureMap = generateAdventureMap;
```

---

### **8. modules/adventure-run.js** ✅
**Status:** Completo  
**Tipo:** Classic script (carrega APÓS game.js + adventure-map.js)

#### **Conteúdo (`window.AdventureRun`):**
- Orquestrador de uma run do Adventure pelo mapa procedural — cada nó dispara um encontro reusando o engine existente
- Combate em ondas (waves por dificuldade: Easy 1 · Normal 2 · Hard 3), escalando dano por profundidade
- Boss / final boss (arte ilustrada por classe / por ato)
- Rest/campfire (curar OU remover ameaça), treasure / cursed chest, shop/merchant (deck-building), eventos de escolha
- Injeção de curse no deck, finais por classe (`_ending`)

#### **Dependências (via window.*):**
- `window.AdventureMap`, `window.game`
- `window.drawRoom`, `window.checkGameState` (intercepção via flag `game.adventureRun`; sala limpa chama `AdventureRun.afterEncounterCleared()`)
- `window.giveRelicByRarity`, `window.earnGold`, `window.updateUI`, `window.showMessage`, `window.endGame`, `window.storage`, `window.checkAchievements`

#### **Exposição Global:**
```javascript
window.AdventureRun = AR;
```

#### **Nota:** O modo Classic permanece intocado — Adventure reusa o engine sem monkey-patching.

---

## ⏳ MÓDULOS PENDENTES

---

### **9. modules/game-cards.js** ⏳
**Status:** Pendente  
**Linhas Estimadas:** ~600  
**Prioridade:** Alta

#### **Conteúdo Planejado:**
- `handleCardClick()` - Gerencia clique em carta
- `handleMonster()` - Lógica de monstros
- `handleWeapon()` - Lógica de armas
- `handlePotion()` - Lógica de poções
- `handleSpecial()` - Lógica de cartas especiais
- `holdCard()` - Sistema de segurar carta
- `getCardType()` - Identifica tipo de carta

#### **Dependências:**
- `modules/game-state.js` (game)
- `modules/game-combat.js` (funções de combate)
- `utils/helpers.js` (várias)

#### **Risco:** MÉDIO (muitas dependências)

---

### **10. modules/game-combat.js** ⏸️
**Status:** Pausado  
**Linhas Estimadas:** ~1,200  
**Prioridade:** Média

#### **Conteúdo Planejado:**
- `calculateDamage()` - Calcula dano
- `applyDamage()` - Aplica dano
- `checkGameState()` - Verifica estado do jogo
- `resetCombo()` - Reseta combo
- `getBerserkBonus()` - Calcula bônus berserk
- `getComboBonus()` - Calcula bônus combo
- `getBloodlustBonus()` - Calcula bônus bloodlust

#### **Dependências:**
- `modules/game-state.js` (game)
- `modules/game-ui.js` (updateUI)
- `utils/helpers.js` (várias)

#### **Risco:** ALTO (sistema complexo)
#### **Nota:** Precisa dividir em funções menores ANTES de modularizar

---

### **11. modules/game-ui.js** ⏸️
**Status:** Pausado  
**Linhas Estimadas:** ~800  
**Prioridade:** Média

#### **Conteúdo Planejado:**
- `updateUI()` - Atualiza UI completa (387 linhas!)
- `updateRunningScore()` - Atualiza score
- `createCardElement()` - Cria elemento de carta
- `renderRoom()` - Renderiza sala
- `renderHeldCards()` - Renderiza cartas seguradas
- `showMessage()` - Exibe mensagem

#### **Dependências:**
- `modules/game-state.js` (game)
- `config/game-constants.js` (várias)
- `utils/helpers.js` (várias)

#### **Risco:** ALTO (updateUI() tem 387 linhas)
#### **Nota:** Dividir updateUI() em funções menores PRIMEIRO

---

## 📈 ESTATÍSTICAS

### **Módulos ES6 extraídos de game.js:**
- game-state.js: 165 linhas
- game-events.js: 185 linhas
- game-shop.js: 290 linhas
- game-relics.js: 200 linhas
- game-sounds.js: ~330 linhas (soundEffects + playSound)
- in-game-tutorial.js: ~400 linhas (classic script; tutorial extraído de game.js)

### **Modo Adventure (novo):**
- adventure-map.js: ~320 linhas (mapa procedural)
- adventure-run.js: ~510 linhas (orquestrador de run)
- data/adventures.js: ~60 linhas (ACTS + ADVENTURES por classe)

### **Pendentes:**
- game-cards, game-combat, game-ui (ainda em game.js)

---

## 🎯 PADRÕES ESTABELECIDOS

### **Estrutura de Módulo:**
```javascript
/**
 * ============================================
 * MODULE NAME
 * ============================================
 * Description
 * 
 * @module module-name
 * @version 1.0.0
 * @author Gabriel Lima
 */

// Import dependencies
import { dependency } from './path.js';

// DOM Elements (initialized after DOM loads)
let element;

// Initialize DOM elements
function initElements() {
    element = document.getElementById('id');
}

// Call init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initElements);
} else {
    initElements();
}

// Export functions
export function functionName() {
    // Implementation
}

// Global exposure for compatibility
window.functionName = functionName;

console.log('✅ module-name.js loaded');
```

### **Importação em game.js:**
```javascript
// Import module
import {
    functionName1,
    functionName2
} from './modules/module-name.js';
```

### **Exposição Global:**
```javascript
// Expose for legacy code
window.functionName = functionName;
```

---

## 🔍 DEPENDÊNCIAS ENTRE MÓDULOS

```
game-state.js (base, ES6)
    ↓
    ├── game-events.js (ES6)
    ├── game-shop.js (ES6)
    ├── game-relics.js (ES6)
    ├── game-sounds.js (ES6)
    ├── game-cards.js (pendente)
    │       ↓
    │   game-combat.js (pendente)
    └── game-ui.js (pendente)

data/adventures.js
    ↓
adventure-map.js (ES6) ──► adventure-run.js (classic, via window.*)
                                 ↑ reusa o engine de game.js (window.drawRoom, etc.)

in-game-tutorial.js (classic, via window.* — extraído de game.js)
```

---

## ⚠️ LIÇÕES APRENDIDAS

### **✅ O que funcionou:**
1. Começar com módulos simples (game-state.js)
2. Testar cada módulo isoladamente
3. Commit após cada sucesso
4. Manter exposição global para compatibilidade
5. Documentar dependências claramente

### **❌ O que evitar:**
1. Não modularizar funções grandes sem dividir antes
2. Não esquecer de expor funções globalmente
3. Não criar dependências circulares
4. Não fazer múltiplos módulos sem testar

### **💡 Próximos Passos:**
1. Criar game-cards.js (médio risco)
2. Dividir updateUI() antes de criar game-ui.js
3. Dividir combate antes de criar game-combat.js

---

## 📚 REFERÊNCIAS

- **Plano Completo:** `PHASE_1.2_PLAN.md`
- **Progresso:** `REFACTORING_PROGRESS.md`
- **Backlog:** `BACKLOG_PRIORIZADO.md`
- **Dependências:** `DEPENDENCY_MAP.md`

---

**Última Atualização:** 2026-06-30

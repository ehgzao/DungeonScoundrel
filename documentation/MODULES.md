# 📦 MÓDULOS DO DUNGEON SCOUNDREL

**Data:** 2025-11-11  
**Fase:** 1.2 - Modularização do game.js  
**Progresso:** 4/7 módulos (57%)

---

## 📊 VISÃO GERAL

### **Objetivo:**
Dividir o monolítico `game.js` (5,096 linhas) em módulos menores e mais gerenciáveis.

### **Progresso Atual:**
- ✅ **Completo:** 4 módulos (840 linhas extraídas)
- ⏳ **Pendente:** 3 módulos
- ⏸️ **Pausado:** 2 módulos (combat, ui)

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

## ⏳ MÓDULOS PENDENTES

### **5. modules/game-tutorial.js** ⏳
**Status:** Pendente  
**Linhas Estimadas:** ~400  
**Prioridade:** Alta

#### **Conteúdo Planejado:**
- `startInGameTutorial()` - Inicia tutorial in-game
- `showTutorialStep()` - Exibe passo do tutorial
- `completeTutorial()` - Completa tutorial
- `skipTutorial()` - Pula tutorial

#### **Dependências:**
- `modules/game-state.js` (game)
- `utils/helpers.js` (disableGameButtons, enableGameButtons)

#### **Risco:** BAIXO (funções bem definidas)

---

### **6. modules/game-cards.js** ⏳
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

### **7. modules/game-combat.js** ⏸️
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

### **8. modules/game-ui.js** ⏸️
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

### **Linhas Extraídas:**
- game-state.js: 165 linhas
- game-events.js: 185 linhas
- game-shop.js: 290 linhas
- game-relics.js: 200 linhas
- **Total:** 840 linhas (~16.5% do game.js original)

### **Linhas Restantes:**
- game.js atual: ~4,200 linhas
- Pendentes: ~2,800 linhas (tutorial + cards + combat + ui)

### **Progresso:**
- ✅ Completo: 4/7 módulos (57%)
- ⏳ Pendente: 3/7 módulos (43%)

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
game-state.js (base)
    ↓
    ├── game-events.js
    ├── game-shop.js
    ├── game-relics.js
    ├── game-tutorial.js (pendente)
    ├── game-cards.js (pendente)
    │       ↓
    │   game-combat.js (pendente)
    └── game-ui.js (pendente)
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
1. Criar game-tutorial.js (baixo risco)
2. Criar game-cards.js (médio risco)
3. Dividir updateUI() antes de criar game-ui.js
4. Dividir combate antes de criar game-combat.js

---

## 📚 REFERÊNCIAS

- **Plano Completo:** `PHASE_1.2_PLAN.md`
- **Progresso:** `REFACTORING_PROGRESS.md`
- **Backlog:** `BACKLOG_PRIORIZADO.md`
- **Dependências:** `DEPENDENCY_MAP.md`

---

**Última Atualização:** 2025-11-11 19:35

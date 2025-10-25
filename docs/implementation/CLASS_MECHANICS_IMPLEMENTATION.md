# 🎭 CLASS MECHANICS - IMPLEMENTATION GUIDE

## ✅ SISTEMA COMPLETADO:

### 1. UI Implementada:
- ✅ Modal de seleção de classes (após dificuldade)
- ✅ 3 classes: Knight, Rogue, Dancer
- ✅ Avatar + nome do player (painel esquerdo)
- ✅ Botão de habilidade especial (painel direito)
- ✅ Descrições e mecânicas exibidas

### 2. Estrutura de Dados:
```javascript
CLASSES = {
    knight: {
        passive: { maxHpBonus: 5, weaponDurabilityBonus: 1 },
        active: { name: 'Shield Bash', cooldown: 3 }
    },
    rogue: {
        passive: { maxHoldCards: 2, bonusGoldPerRoom: 1 },
        active: { name: 'Shadow Strike', cooldown: 4 }
    },
    dancer: {
        passive: { potionHealBonus: 3, maxPotionsPerRoom: 2 },
        active: { name: 'Healing Dance', cooldown: 5 }
    }
}
```

---

## 🔧 PRÓXIMAS IMPLEMENTAÇÕES NECESSÁRIAS:

### A) Integrar Passivos no startGame():
```javascript
// Aplicar bonus de HP (Knight)
if (game.classData.passive.maxHpBonus) {
    game.maxHealth += game.classData.passive.maxHpBonus;
    game.health = game.maxHealth;
}

// Atualizar UI com avatar e classe
document.getElementById('playerAvatar').src = `assets/avatar-${game.playerClass}.jpg`;
document.getElementById('playerNameDisplay').textContent = playerNameInput.value.trim();
document.getElementById('playerClassDisplay').textContent = game.classData.name;
```

### B) Integrar no Sistema de Hold (holdCard function):
```javascript
// Check max hold cards (Rogue can hold 2)
const maxHold = game.classData.passive.maxHoldCards || 1;
if (game.heldCards && game.heldCards.length >= maxHold) {
    showMessage('❌ Hold slots full!', 'warning');
    return;
}
```

### C) Integrar no Equip Weapon (Durability):
```javascript
// Knight: weapons have +1 durability
game.equippedWeapon.uses += (game.classData.passive.weaponDurabilityBonus || 0);
```

### D) Integrar no Sistema de Gold (Rogue):
```javascript
// Rogue: +1 gold per room cleared
if (game.classData.passive.bonusGoldPerRoom) {
    game.gold += game.classData.passive.bonusGoldPerRoom;
}
```

### E) Integrar no Sistema de Potions (Dancer):
```javascript
// Dancer: potions heal +3 HP
const healBonus = game.classData.passive.potionHealBonus || 0;
heal += healBonus;

// Dancer: can use 2 potions per room
const maxPotions = game.classData.passive.maxPotionsPerRoom || 1;
if (game.potionsUsed >= maxPotions) {
    // Block potion use
}
```

### F) Implementar Habilidades Ativas:

#### KNIGHT - Shield Bash:
```javascript
function useKnightAbility() {
    if (game.classAbilityCooldown > 0) return;
    if (!game.equippedWeapon) return;
    
    const firstMonster = game.room.find(c => getCardType(c) === 'monster');
    if (!firstMonster) return;
    
    const damage = game.equippedWeapon.numValue;
    firstMonster.numValue -= damage;
    
    if (firstMonster.numValue <= 0) {
        // Remove monster
        const index = game.room.indexOf(firstMonster);
        game.room.splice(index, 1);
        game.discardPile.push(firstMonster);
    }
    
    game.classAbilityCooldown = 3;
    showMessage(`🛡️ Shield Bash! Dealt ${damage} damage!`, 'success');
}
```

#### ROGUE - Shadow Strike:
```javascript
function useRogueAbility() {
    if (game.classAbilityCooldown > 0) return;
    
    game.classAbilityActive = true;
    game.classAbilityCounter = 1; // Next monster only
    game.classAbilityCooldown = 4;
    
    showMessage('🔪 Shadow Strike activated! Next kill: 2x damage, combo safe!', 'success');
}

// In attack monster logic:
if (game.classAbilityActive && game.classAbilityCounter > 0) {
    effectiveWeapon *= 2;
    // Don't break combo
    game.classAbilityCounter--;
    if (game.classAbilityCounter === 0) game.classAbilityActive = false;
}
```

#### DANCER - Healing Dance:
```javascript
function useDancerAbility() {
    if (game.classAbilityCooldown > 0) return;
    
    game.health = Math.min(game.maxHealth, game.health + 5);
    game.classAbilityActive = true;
    game.classAbilityCounter = 2; // Next 2 monsters
    game.classAbilityCooldown = 5;
    
    showMessage('✨ Healing Dance! +5 HP and damage buff!', 'success');
}

// In attack monster logic:
let weaponBonus = 0;
if (game.classAbilityActive && game.classAbilityCounter > 0) {
    weaponBonus = 2;
    game.classAbilityCounter--;
    if (game.classAbilityCounter === 0) game.classAbilityActive = false;
}
effectiveWeapon += weaponBonus;
```

### G) Sistema de Cooldown:
```javascript
// Em drawRoom() ou checkGameState():
if (game.classAbilityCooldown > 0) {
    game.classAbilityCooldown--;
}

// Update UI:
function updateAbilityUI() {
    const btn = document.getElementById('btnClassAbility');
    const cooldownDisplay = document.getElementById('abilityCooldownDisplay');
    const icon = document.getElementById('abilityIcon');
    const name = document.getElementById('abilityName');
    const desc = document.getElementById('abilityDescription');
    
    icon.textContent = game.classData.active.icon;
    name.textContent = game.classData.active.name;
    desc.textContent = game.classData.active.description;
    
    if (game.classAbilityCooldown > 0) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        cooldownDisplay.textContent = `${game.classAbilityCooldown} rooms`;
        cooldownDisplay.style.display = 'block';
    } else {
        btn.disabled = false;
        btn.style.opacity = '1';
        cooldownDisplay.style.display = 'none';
    }
    
    // Show active buff
    if (game.classAbilityActive && game.classAbilityCounter > 0) {
        desc.innerHTML = `<strong style="color: #6bcf7f;">ACTIVE! ${game.classAbilityCounter} uses left</strong>`;
    }
}
```

---

## 📦 ARQUIVOS NECESSÁRIOS:

### Por favor, salve as imagens dos avatares em:
- `assets/avatar-knight.jpg` (Imagem 2 - Cavaleiro com elmo)
- `assets/avatar-rogue.jpg` (Imagem 1 - Rogue encapuzado)
- `assets/avatar-dancer.jpg` (Imagem 3 - Dançarina)

---

## 🎯 PRÓXIMOS PASSOS:

1. ✅ Salvar imagens dos avatares
2. ⏳ Integrar passivos no startGame()
3. ⏳ Integrar hold system (Rogue 2 cards)
4. ⏳ Integrar weapon durability (Knight)
5. ⏳ Integrar gold bonus (Rogue)
6. ⏳ Integrar potion system (Dancer)
7. ⏳ Implementar habilidades ativas
8. ⏳ Implementar sistema de cooldown
9. ⏳ Testar todas as mecânicas

---

**Status:** Sistema de UI completo. Mecânicas precisam ser integradas no gameplay existente.

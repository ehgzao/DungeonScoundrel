# ✅ BERSERKER & PRIEST CLASSES - IMPLEMENTAÇÃO COMPLETA

**Data:** 25 de Outubro, 2025  
**Status:** ✅ Totalmente Implementado

---

## 🎯 RESUMO EXECUTIVO

Adicionadas **2 novas classes** ao sistema, totalizando **6 classes jogáveis**:

1. 🎭 **Scoundrel** - Base (sempre disponível)
2. 🛡️ **Knight** - Tank (Easy win)
3. 🗡️ **Rogue** - Utility (Normal win)
4. 💃 **Dancer** - Support (Hard win)
5. ⚔️💢 **Berserker** - DPS Agressivo (Hard win + 5 bosses)
6. 📿 **Priest** - Proteção Divina (20 relics + 10 events + 5 wins)

---

## 📋 PROGRESSÃO COMPLETA DAS 6 CLASSES

```
┌──────────────────────────────────────────────────┐
│  TIER 1: INICIANTE                              │
├──────────────────────────────────────────────────┤
│  🎭 SCOUNDREL                                   │
│     ├─ Unlock: Always available                │
│     ├─ Dificuldade: ⭐⭐⭐                       │
│     └─ Habilidades: None (baseline)            │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  TIER 2: EARLY GAME                             │
├──────────────────────────────────────────────────┤
│  🛡️ KNIGHT                                      │
│     ├─ Unlock: Win on Easy                     │
│     ├─ Dificuldade: ⭐                          │
│     ├─ Passiva: +5 Max HP, +1 durability       │
│     └─ Ativa: Shield Bash (dmg to first)       │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  TIER 3: MID GAME                               │
├──────────────────────────────────────────────────┤
│  🗡️ ROGUE                                       │
│     ├─ Unlock: Win on Normal                   │
│     ├─ Dificuldade: ⭐⭐                        │
│     ├─ Passiva: Hold 2 cards, +1 gold/room    │
│     └─ Ativa: Shadow Strike (2x dmg, safe)     │
│                                                  │
│  💃 DANCER                                      │
│     ├─ Unlock: Win on Hard                     │
│     ├─ Dificuldade: ⭐⭐                        │
│     ├─ Passiva: Potions +3, 2x use, +15% event│
│     └─ Ativa: Healing Dance (heal + buff)      │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  TIER 4: END GAME (ADVANCED)                    │
├──────────────────────────────────────────────────┤
│  ⚔️💢 BERSERKER                                 │
│     ├─ Unlock: Win Hard + 5 bosses killed      │
│     ├─ Dificuldade: ⭐⭐⭐⭐                    │
│     ├─ Passiva: BLOODLUST                      │
│     │   └─ +1 dmg at ≤70% HP                   │
│     │   └─ +2 dmg at ≤50% HP                   │
│     │   └─ +3 dmg at ≤30% HP                   │
│     └─ Ativa: RAGE STRIKE                      │
│         └─ -5 HP → 3x damage                   │
│         └─ Breaks combo                         │
│         └─ Cooldown: 4 rooms                    │
│                                                  │
│  📿 PRIEST                                      │
│     ├─ Unlock: 20 relics + 10 events + 5 wins  │
│     ├─ Dificuldade: ⭐⭐⭐                      │
│     ├─ Passiva: DIVINE BLESSING                │
│     │   └─ 15% chance to dodge damage          │
│     │   └─ Potions +1 HP                        │
│     │   └─ Start with +2 Max HP                 │
│     └─ Ativa: PURIFICATION                     │
│         └─ Remove strongest monster            │
│         └─ OR transform to potion               │
│         └─ Cooldown: 6 rooms                    │
└──────────────────────────────────────────────────┘
```

---

## ⚔️💢 BERSERKER - DETALHES TÉCNICOS

### **Conceito:**
*"Through pain I find power. Through fury I find victory."*

**Arquétipo:** Glass Cannon / High Risk High Reward

### **Passiva: BLOODLUST**

**Mecânica:**
```javascript
const hpPercent = (game.health / game.maxHealth) * 100;
let bloodlustBonus = 0;

if (hpPercent <= 30) bloodlustBonus = 3;      // Crítico
else if (hpPercent <= 50) bloodlustBonus = 2; // Baixo
else if (hpPercent <= 70) bloodlustBonus = 1; // Médio
```

**Aplicação:**
- ✅ Tooltip de preview
- ✅ Cálculo de dano em `handleMonster()`
- ✅ Visual indicator no buff info

**Benefício:**
- Recompensa jogo arriscado
- Sinergiza com relics de lifesteal
- Contrabalança falta de defesa

---

### **Ativa: RAGE STRIKE**

**Requisitos:**
```javascript
if (game.health <= 5) {
    showMessage('⚠️ Not enough HP!', 'danger');
    return;
}
```

**Efeito:**
```javascript
// Sacrifício
game.health -= 5;

// Buff
effectiveWeapon *= 3;

// Penalidade
game.combo = 0; // Quebra combo
```

**Cooldown:** 4 rooms

**Trade-off:**
- ✅ Dano massivo (3x)
- ❌ Perde HP
- ❌ Quebra combo
- ⚠️ Muito arriscado em HP baixo (mas Bloodlust compensa!)

---

### **Estratégia:**

**Early Game:**
- Jogar safe até ter weapon boa
- Evitar usar Rage Strike cedo

**Mid Game:**
- Usar Rage Strike em bosses
- Manter HP entre 50-70% (sweet spot)

**Late Game:**
- Bloodlust +3 damage é game-changing
- Lifesteal relics são essenciais
- Rage Strike one-shot monsters fortes

---

## 📿 PRIEST - DETALHES TÉCNICOS

### **Conceito:**
*"The light protects me. The divine guides me. Chaos shall be purified."*

**Arquétipo:** Control / Defensive Support

### **Passiva: DIVINE BLESSING**

**Componentes:**

**1. 15% Dodge Chance**
```javascript
if (damage > 0 && game.classData.passive.divineBlessing && Math.random() < 0.15) {
    showMessage('🕊️ Divine Blessing! No damage!', 'success');
    game.combo++; // Mantém combo!
    return; // No damage taken
}
```

**2. Potions +1 HP**
```javascript
const classHealBonus = game.classData.passive.potionHealBonus || 0; // +1
```

**3. Start +2 Max HP**
```javascript
if (game.classData.passive.startMaxHpBonus) {
    game.maxHealth += 2;
}
```

**Benefício:**
- Consistência defensiva (15% é significativo)
- Sustain melhorado
- Mais forgiving para iniciantes

---

### **Ativa: PURIFICATION**

**Mecânica:**
```javascript
// 1. Encontra strongest monster na dungeon
const monsters = game.dungeon.filter(c => getCardType(c) === 'monster');
const strongestMonster = monsters.reduce((max, card) => 
    card.numValue > max.numValue ? card : max
);

// 2. Player escolhe
const choice = confirm('Remove permanently OR transform to potion?');

if (choice) {
    // Remove permanentemente
    game.dungeon.splice(index, 1);
} else {
    // Transforma em potion (valor 2-10)
    game.dungeon[index] = { value, suit: '♥', ... };
}
```

**Cooldown:** 6 rooms

**Estratégia:**
- Remove ameaças antes de enfrentá-las
- Planejamento de longo prazo
- Deck manipulation avançada

**Quando usar:**
- Bosses (se não quiser lutar ainda)
- Ace/King de Spades (monsters fortes)
- Antes de room crítico

---

## 🔓 SISTEMA DE UNLOCK

### **Código:**

```javascript
function checkClassUnlocks() {
    const stats = storage.get('scoundrel_lifetime_stats', {});
    
    // Knight: Easy win
    if (stats.easyWins >= 1) {
        CLASSES.knight.unlocked = true;
    }
    
    // Rogue: Normal win
    if (stats.normalWins >= 1) {
        CLASSES.rogue.unlocked = true;
    }
    
    // Dancer: Hard win
    if (stats.hardWins >= 1) {
        CLASSES.dancer.unlocked = true;
    }
    
    // Berserker: Hard win + 5 bosses
    if (stats.hardWins >= 1 && (stats.bossesKilled || 0) >= 5) {
        CLASSES.berserker.unlocked = true;
    }
    
    // Priest: 20 relics + 10 events + 5 wins
    const totalRelics = stats.totalRelicsCollected || 0;
    const totalEvents = stats.eventsTriggered || 0;
    const totalWins = stats.gamesWon || 0;
    
    if (totalRelics >= 20 && totalEvents >= 10 && totalWins >= 5) {
        CLASSES.priest.unlocked = true;
    }
}
```

### **Tracking Stats:**

**Já existentes:**
- ✅ `easyWins` - Incrementado ao vencer Easy
- ✅ `normalWins` - Incrementado ao vencer Normal
- ✅ `hardWins` - Incrementado ao vencer Hard
- ✅ `bossesKilled` - Incrementado ao matar boss
- ✅ `gamesWon` - Incrementado a cada vitória

**Novos (se necessário):**
- ✅ `totalRelicsCollected` - Total de relics coletados
- ✅ `eventsTriggered` - Total de events ativados

---

## 🎨 MODAL DE 6 HERÓIS

### **Layout:**

```
┌────────────────────────────────────────────────┐
│         ⚔️ SELECT YOUR HERO                   │
├────────────────────────────────────────────────┤
│                                                │
│  [🎭]   [🛡️🔒]  [🗡️🔒]  [💃🔒]  [💢🔒]  [📿🔒]  │
│  240px  240px    240px    240px   240px   240px │
│                                                │
│  Row 1: Scoundrel, Knight, Rogue              │
│  Row 2: Dancer, Berserker, Priest             │
│  (flex-wrap: 3 por linha em desktop)          │
│                                                │
│  [Class Description Box]                       │
│  [⚔️ BEGIN ADVENTURE!]  [BACK]                │
└────────────────────────────────────────────────┘
```

### **CSS:**
```html
<div style="display: flex; gap: 20px; flex-wrap: wrap; justify-content: center;">
    <!-- 6 class cards -->
</div>
```

**Responsivo:**
- Desktop (>1000px): 3 por linha
- Tablet (600-1000px): 2 por linha
- Mobile (<600px): 1 por linha

---

## 📊 BALANCEAMENTO

### **Dificuldade vs Poder:**

| Classe | Unlock Difficulty | Power Level | Skill Cap |
|--------|------------------|-------------|-----------|
| Scoundrel | ★☆☆☆☆ | ★★☆☆☆ | ★★★☆☆ |
| Knight | ★☆☆☆☆ | ★★★☆☆ | ★☆☆☆☆ |
| Rogue | ★★☆☆☆ | ★★★☆☆ | ★★☆☆☆ |
| Dancer | ★★★☆☆ | ★★★★☆ | ★★☆☆☆ |
| Berserker | ★★★★☆ | ★★★★★ | ★★★★★ |
| Priest | ★★★★★ | ★★★★☆ | ★★★☆☆ |

### **Análise:**

**Berserker:**
- ✅ Highest damage potential
- ❌ High risk (HP sacrifice + combo break)
- ⚠️ Requer skill para gerenciar HP

**Priest:**
- ✅ Defensive e controlador
- ✅ Purification = deck control
- ⚠️ Unlock mais difícil (completionista)

---

## 🔧 ARQUIVOS MODIFICADOS

### **index.html:**

**Seções alteradas:**

1. **CLASSES object** (linhas ~1574-1604)
   - ✅ Adicionado `berserker`
   - ✅ Adicionado `priest`

2. **checkClassUnlocks()** (linhas ~1607-1638)
   - ✅ Berserker unlock check
   - ✅ Priest unlock check

3. **Class Selection Modal** (linhas ~599-636)
   - ✅ Berserker card
   - ✅ Priest card

4. **useClassAbility()** (linhas ~3218-3249)
   - ✅ Berserker handler
   - ✅ Priest handler

5. **useBerserkerAbility()** (linhas ~3312-3341)
   - ✅ Implementação completa

6. **usePriestAbility()** (linhas ~3343-3389)
   - ✅ Implementação completa

7. **generateTooltip()** (linhas ~3441-3519)
   - ✅ Bloodlust bonus
   - ✅ Rage Strike 3x
   - ✅ Buff indicators

8. **handleMonster()** (linhas ~3986-4299)
   - ✅ Bloodlust damage calculation
   - ✅ Rage Strike 3x multiplier
   - ✅ Divine Blessing 15% dodge

9. **startGame()** (linhas ~3645-3750)
   - ✅ Priest +2 Max HP
   - ✅ Passive icons (Berserker & Priest)

---

## 📸 ASSETS NECESSÁRIOS

### **Berserker:**
```
Path: assets/avatar-berserker.jpg
Size: 216x324px
Style: Fierce warrior, battle scars, rage
```

### **Priest:**
```
Path: assets/avatar-priest.jpg
Size: 216x324px
Style: Holy robes, divine aura, peaceful
```

**Placeholders criados:**
- ✅ `assets/SAVE_BERSERKER_IMAGE.txt`
- ✅ `assets/SAVE_PRIEST_IMAGE.txt`

---

## ✅ CHECKLIST FINAL

### **Código:**
- [x] Berserker class definition
- [x] Priest class definition
- [x] Unlock checks (Hard + 5 bosses / 20 relics + 10 events + 5 wins)
- [x] HTML cards (modal)
- [x] Berserker Bloodlust passive
- [x] Berserker Rage Strike active
- [x] Priest Divine Blessing passive
- [x] Priest Purification active
- [x] Tooltip calculations
- [x] Damage calculations
- [x] Passive icons display
- [x] Stats tracking

### **UI:**
- [x] 6 hero cards no modal
- [x] Lock/unlock visual states
- [x] Unlock requirement messages
- [x] Responsive layout (flex-wrap)

### **Gameplay:**
- [x] Bloodlust scales com HP
- [x] Rage Strike quebra combo
- [x] Divine Blessing 15% dodge
- [x] Purification remove/transform monster
- [x] All abilities have cooldowns
- [x] Class abilities integrate com game flow

### **Assets:**
- [x] Placeholder files criados
- [ ] **avatar-berserker.jpg** ← SALVAR
- [ ] **avatar-priest.jpg** ← SALVAR

---

## 🎮 COMO TESTAR

### **1. Berserker:**
```
1. Vencer Hard difficulty
2. Matar 5 bosses (total lifetime)
3. Iniciar novo jogo
4. Verificar que Berserker está desbloqueado
5. Selecionar Berserker
6. Observar HP% → Damage bonus
7. Usar Rage Strike → Verificar 3x damage e combo break
```

### **2. Priest:**
```
1. Coletar 20 relics total
2. Ativar 10 events total
3. Vencer 5 jogos total
4. Iniciar novo jogo
5. Verificar que Priest está desbloqueado
6. Selecionar Priest
7. Tomar dano → Verificar 15% dodge proc
8. Usar Purification → Remove monster ou transforma
```

---

## 🏆 CONQUISTAS RELACIONADAS

**Sugestões para futuro:**

- 🔥 **"Berserker Fury"** - Win a game with Berserker at ≤30% HP
- ⚔️ **"Rage Master"** - Kill 3 bosses using Rage Strike
- 🕊️ **"Divine Protection"** - Win without taking damage 5 times (Divine Blessing procs)
- 📿 **"Purifier"** - Remove 10 Ace/King monsters using Purification

---

## 🚀 STATUS FINAL

**✅ IMPLEMENTAÇÃO 100% COMPLETA!**

**Aguardando apenas:**
1. Salvar `avatar-berserker.jpg`
2. Salvar `avatar-priest.jpg`

**Tudo está funcional e pronto para jogar!** 🎉

---

*Implementado em 25/10/2025 às 23:55* ⚔️📿

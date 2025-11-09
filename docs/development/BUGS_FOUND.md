# 🐛 BUGS ENCONTRADOS - Análise Profunda

**Data:** 2025-11-09  
**Revisor:** Dev Especialista  
**Status:** ⚠️ BUGS CRÍTICOS ENCONTRADOS

---

## 🔴 BUGS CRÍTICOS

### **BUG #1: Relíquias não ativam efeitos imediatamente**
**Severidade:** 🔴 CRÍTICA  
**Localização:** `game.js` linha 6011-6038 - função `giveRelicByRarity()`

**Problema:**
Quando uma relíquia é recebida, apenas efeitos de SAÚDE são aplicados imediatamente:
```javascript
// Apenas estes são aplicados ao receber:
if (randomRelic.effect === 'smallHealth') { game.maxHealth += 3; game.health += 3; }
if (randomRelic.effect === 'maxHealth') { game.maxHealth += 5; game.health += 5; }
if (randomRelic.effect === 'bigHealth') { game.maxHealth += 10; game.health += 10; }
if (randomRelic.effect === 'tinyHealth') { game.maxHealth += 1; game.health += 1; }
```

**Relíquias afetadas:**
- ✨ Charm (startGold) - Deveria dar +10 gold imediatamente
- 🦷 Monster Tooth (monsterGold) - OK (passivo)
- 💍 Bronze Ring (smallPower) - OK (aplicado via getRelicBonus)
- E outras...

**Impacto:**
- Charm não dá os 10 gold ao receber
- Usuário não vê efeito imediato
- Confusão sobre funcionamento

**Fix necessário:**
Adicionar aplicação imediata para `startGold`:
```javascript
if (randomRelic.effect === 'startGold') { 
    earnGold(10); 
    showMessage('+10 gold from Charm!', 'success');
}
```

---

### **BUG #2: Carta Berserk não mostra +5 na arma claramente**
**Severidade:** 🟡 MÉDIA  
**Localização:** `game.js` - Sistema de cartas especiais

**Problema:**
Usuário solicitou que quando Berserk é usado:
- Se tem arma: mostrar +5 na arma equipada
- Se não tem arma: mostrar +5 em "mãos livres"

**Estado atual:**
```javascript
game.berserkStacks = game.relics.some(r => r.id === 'hourglass') ? 4 : 3; 
showMessage('🔥 BERSERK MODE! Next 3 attacks +5 damage!', 'success');
```

**Problema:**
- Apenas mostra mensagem
- Não mostra visualmente na arma/UI
- Usuário não vê o +5 claramente

**Fix necessário:**
1. Atualizar display da arma para mostrar +5 temporário
2. Se sem arma, criar indicador visual de dano base
3. Feedback visual claro e persistente durante berserk

---

### **BUG #3: Dano das cartas nem sempre é claro**
**Severidade:** 🟡 MÉDIA  
**Localização:** Sistema de cálculo de dano

**Problema:**
Usuário solicitou que o dano SEMPRE seja claro para o usuário.

**Situações problemáticas:**
1. Cartas de número com arma: dano não é óbvio
2. Combo damage: usuário não vê preview
3. Modificadores temporários (berserk): não visível na carta
4. Relíquias de dano: usuário não sabe total antes de jogar

**Fix necessário:**
Implementar sistema de preview de dano:
- Mostrar dano total calculado na carta antes de jogar
- Incluir todos os modificadores
- Tooltip ou número grande visível

---

## 🟡 BUGS MÉDIOS

### **BUG #4: Upgrades não mudam filtro automaticamente ao unlock**
**Severidade:** 🟡 MÉDIA  
**Localização:** Sistema de CODEX

**Problema:**
Quando usuário desbloqueia um upgrade:
- Deveria mudar automaticamente para filtro "AVAILABLE" ou "UNLOCKED"
- Deveria ter feedback visual forte
- Deveria destacar o novo upgrade

**Estado atual:**
Não implementado - CODEX system ainda não integrado

**Fix necessário:**
Ao desbloquear upgrade:
1. Abrir CODEX automaticamente (opcional)
2. Mudar para aba Upgrades
3. Aplicar filtro "UNLOCKED" ou "AVAILABLE"
4. Destacar o novo upgrade (animação/pulse)
5. Mensagem clara

---

### **BUG #5: Itens de arma podem ser comprados sem ter arma**
**Severidade:** 🟡 MÉDIA  
**Localização:** Shop system

**Problema:**
Usuário solicitou que upgrades de arma só possam ser comprados se tiver arma equipada.

**Itens afetados:**
- Weapon Repair (15 gold)
- Weapon Upgrade (+1 damage, 25 gold)
- Weapon Upgrade (+2 damage, 40 gold)

**Estado atual:**
Preciso verificar se há validação

**Fix necessário:**
Adicionar check antes da compra:
```javascript
if (needsWeapon && !game.equippedWeapon) {
    showMessage('⚠️ You need a weapon first!', 'warning');
    return;
}
```

---

## 🟢 BUGS MENORES

### **BUG #6: Performance após modularização**
**Severidade:** 🟢 BAIXA  
**Status:** ⏳ PRECISA TESTAR

**Problema:**
Usuário solicitou garantia de que a modularização melhorou (ou pelo menos não piorou) a performance.

**Métricas a verificar:**
- Tempo de carregamento inicial
- FPS durante gameplay
- Uso de memória
- Re-renders desnecessários

**Fix necessário:**
1. Benchmark antes/depois
2. Otimizar imports se necessário
3. Lazy loading de módulos pesados

---

### **BUG #7: Classes - Mecânicas e Unlock Logic**
**Severidade:** 🟢 BAIXA  
**Status:** ⏳ PRECISA VERIFICAR

**Problema:**
Verificar se todas as 5 classes:
- Têm mecânicas únicas funcionando
- Seguem lógica de unlock combinada
- Stats iniciais corretos

**Classes:**
1. Scoundrel (base)
2. Knight
3. Mage
4. Ranger
5. Berserker

**Fix necessário:**
Testar cada classe individualmente

---

### **BUG #8: Bug de tela branca**
**Severidade:** 🔴 CRÍTICA (se ainda existe)  
**Status:** ⏳ PRECISA TESTAR

**Problema:**
Usuário mencionou bug de tela branca anterior. Preciso verificar se ainda acontece.

**Proteções atuais:**
- Error handler global (linhas 4-43)
- Try-catch em Firebase
- Unhandled rejection handler

**Fix necessário:**
Testar extensivamente e adicionar mais logs se necessário

---

## 📊 RESUMO

```
🔴 Bugs Críticos:   1 (Relíquias startGold)
🟡 Bugs Médios:     4 (Berserk visual, dano claro, upgrades, shop)
🟢 Bugs Menores:    3 (Performance, classes, tela branca)
─────────────────────
Total encontrados:  8 bugs
```

---

## 🎯 PRIORIDADE DE FIX

### **AGORA (Imediato):**
1. Fix relíquia Charm (startGold)
2. Verificar bug tela branca
3. Sistema de preview de dano

### **DEPOIS (Logo após integração):**
4. Visual feedback para Berserk
5. Shop restrições de arma
6. Upgrades auto-filter
7. Performance benchmark

### **POR ÚLTIMO:**
8. Classes testing completo

---

**Próximo passo:** Começar fixes dos bugs críticos

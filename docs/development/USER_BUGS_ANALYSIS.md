# 🐛 ANÁLISE COMPLETA - BUGS DO USUÁRIO

## 📊 RESUMO EXECUTIVO

**Total de Bugs Reportados:** 25
**Já Corrigidos:** 4 ✅
**Precisam Correção:** 21 ⚠️
**Críticos:** 3 🔥

---

## 🔥 BUGS CRÍTICOS (PRIORIDADE MÁXIMA)

### **BUG #CRIT-1: basePrice is not defined**
**Status:** ❌ **NÃO CORRIGIDO**  
**Severidade:** 🔥 CRÍTICO (Game breaking)  
**Descrição:** Erro fatal na shop: `ReferenceError: basePrice is not defined`  
**Localização:** `updateShopDisplay()` linha ~6230  
**Impacto:** Jogo quebra ao abrir shop  
**Prioridade:** **MÁXIMA** - FIXAR AGORA

### **BUG #CRIT-2: Música de vitória trava (chiado)**
**Status:** ❌ **NÃO CORRIGIDO**  
**Severidade:** 🔥 CRÍTICO (UX)  
**Descrição:** "A música de vitória trava no final e fica um chiado INSUPORTÁVEL"  
**Impacto:** Experiência de vitória arruinada  
**Prioridade:** **ALTA**

### **BUG #CRIT-3: Hall of Fame travado**
**Status:** ❌ **NÃO CORRIGIDO**  
**Severidade:** 🔥 CRÍTICO  
**Descrição:** "Hall of Fame está travado no envio se a pontuação for menor"  
**Solução:** Enviar automaticamente sem input do player  
**Prioridade:** **ALTA**

---

## ✅ BUGS JÁ CORRIGIDOS (4)

### **1. ✅ Upgrades não migram de filtro**
**Status:** ✅ **CORRIGIDO**  
**Fix:** Auto-sort implementado (commit 0c6653d)  
**Descrição:** Upgrades agora ordenam automaticamente: Available → Unlocked → Locked

### **2. ✅ Shop validation (sem arma)**
**Status:** ✅ **CORRIGIDO**  
**Fix:** Warning "⚔️ Need Weapon" implementado  
**Descrição:** Itens de arma mostram aviso claro quando não há arma

### **3. ✅ Berserk visual feedback**
**Status:** ✅ **PARCIALMENTE CORRIGIDO**  
**Fix:** Indicator no topo-direito mostra stacks  
**Nota:** Ainda falta mostrar +5 na carta de arma (ver BUG #1)

### **4. ✅ Card damage preview**
**Status:** ✅ **CORRIGIDO** (bonus!)  
**Fix:** Badge em todas cartas de monstro  
**Descrição:** Mostra dano calculado antes de clicar

---

## ⚠️ BUGS PENDENTES - GAMEPLAY (12)

### **BUG #1: Berserk +5 na carta de arma**
**Status:** ❌ **NÃO CORRIGIDO**  
**Descrição:** "Berserk card deve aparecer um +5 ao lado do número na carta de arma equipada"  
**Solução:** Adicionar badge "+5" na carta de arma quando berserkStacks > 0  
**Prioridade:** MÉDIA

### **BUG #2: Master Smith não afeta equipagem**
**Status:** ❌ **NÃO CORRIGIDO**  
**Descrição:** "Master Smith deve afetar quando é equipada"  
**Localização:** Verificar relic 'master_smith' e handleWeapon()  
**Prioridade:** MÉDIA

### **BUG #3: Mirror hover info**
**Status:** ❌ **NÃO CORRIGIDO**  
**Descrição:** "Mirror deve dizer no hover o dano total tomado, tal igual a Berserker faz"  
**Solução:** Adicionar tooltip dinâmico no Mirror relic  
**Prioridade:** BAIXA

### **BUG #4: Candle relic confuso**
**Status:** ❌ **NÃO CORRIGIDO**  
**Descrição:** "Para que serve a candle??? Ver mais uma carta no deck? Onde?"  
**Problema:** Funcionalidade não está clara  
**Solução:** Melhorar tooltip OU remover relic se inútil  
**Prioridade:** MÉDIA

### **BUG #5: Dodge remove durabilidade**
**Status:** ❌ **NÃO CORRIGIDO**  
**Descrição:** "O Dodge não pode tirar durabilidade da arma"  
**Solução:** Dodge não deve consumir weapon durability  
**Prioridade:** MÉDIA

### **BUG #6: Weapon repair em arma cheia**
**Status:** ❌ **NÃO CORRIGIDO**  
**Descrição:** "O weapon repair com durabilidade cheia não poderia aumentar a durabilidade em +1?"  
**Solução:** Se durability === maxDurability, increase maxDurability += 1  
**Prioridade:** BAIXA (Quality of Life)

### **BUG #7: Cartas de ataque sem arma**
**Status:** ❌ **NÃO CORRIGIDO**  
**Descrição:** "As cartas que melhoram ataque não deveriam funcionar sem arma..."  
**Pergunta:** Deveria funcionar no soco (fist damage)?  
**Prioridade:** DESIGN DECISION

### **BUG #8: Card removal aleatório**
**Status:** ❌ **NÃO CORRIGIDO**  
**Descrição:** "A carta removida não pode ser aleatória, precisa ser um monstro 10+"  
**Solução:** Player escolhe qual carta remover (UI de seleção)  
**Prioridade:** ALTA

### **BUG #9: Lucky Drawn muito punitivo**
**Status:** ❌ **NÃO CORRIGIDO**  
**Descrição:** "Pode puxar 4 cartas de monstro. Não dá lucro"  
**Solução:** Limitar a 3 cartas com probabilidades: 40% poção, 40% arma, 20% monstro  
**Prioridade:** ALTA (Balance)

### **BUG #10: Easy ainda difícil**
**Status:** ❌ **NÃO CORRIGIDO**  
**Descrição:** "Player veterano teve muita dificuldade com RNG"  
**Solução:** Algoritmo especial para Easy (10 primeiras salas):  
   - 70% monstros dão <5 dano  
   - 70% armas dão 4-8 dano  
**Prioridade:** ALTA (Balance)

### **BUG #11: Sinalizar total ataque AKQJ**
**Status:** ❌ **NÃO CORRIGIDO**  
**Descrição:** "Sinalizar melhor o total do ataque entre A K Q J"  
**Contexto:** Provavelmente se refere a combo bonus  
**Prioridade:** BAIXA

### **BUG #12: Pontuação negativa**
**Status:** ❌ **DESIGN QUESTION**  
**Descrição:** "Faz sentido manter uma pontuação negativa?"  
**Solução:** Definir se score pode ser negativo ou mínimo 0  
**Prioridade:** MÉDIA (Design)

---

## ⚠️ BUGS PENDENTES - UX/UI (6)

### **BUG #13: Popup de upgrade desbloqueado**
**Status:** ❌ **NÃO CORRIGIDO**  
**Descrição:** "Precisa aparecer um popup quando algum upgrade é liberado"  
**Solução:** Toast notification quando unlock é disponível  
**Prioridade:** MÉDIA

### **BUG #14: Sugestão de gastar gold**
**Status:** ❌ **NÃO CORRIGIDO**  
**Descrição:** "Se o player tem dinheiro, aparecer pop up sugerindo gastar moedas"  
**Solução:** Hint sutil quando gold > 50 e shop disponível  
**Prioridade:** BAIXA

### **BUG #15: Itens do Merchant têm efeito imediato**
**Status:** ❌ **NÃO CORRIGIDO**  
**Descrição:** "Todo item comprado no Merchant precisa fazer efeito na rodada atual"  
**Problema:** Alguns itens só funcionam na próxima sala  
**Prioridade:** ALTA (UX)

### **BUG #16: Tutorial primeira run**
**Status:** ❌ **NÃO CORRIGIDO**  
**Descrição:** "Usuário fica MUITO PERDIDO. Primeira run precisa ter script explicando tudo"  
**Solução:** Tutorial interativo na primeira jogada  
**Prioridade:** ALTA (Onboarding)

### **BUG #17: Mobile responsiveness**
**Status:** ❌ **NÃO CORRIGIDO**  
**Descrição:** "Elementos precisam ficar proporcionais à tela, não valores fixos"  
**Solução:** Migrar para layout totalmente responsivo (%, vw, vh)  
**Prioridade:** MÉDIA (Mobile)

### **BUG #18: Browser detection bug report**
**Status:** ❌ **NÃO CORRIGIDO**  
**Descrição:** "Bug report lista vários navegadores, sem ser específico"  
**Solução:** Usar `navigator.userAgent` parsing para detectar browser específico  
**Prioridade:** BAIXA

---

## ⚠️ BUGS PENDENTES - SEGURANÇA/INFRA (3)

### **BUG #19: Bug report spam**
**Status:** ❌ **NÃO CORRIGIDO**  
**Descrição:** "Robô pode abusar do sistema e enviar milhões de emails"  
**Solução:** Implementar CAPTCHA no bug report (reCAPTCHA v3)  
**Prioridade:** MÉDIA (Security)

### **BUG #20: Score system "mal feito"**
**Status:** ❌ **NÃO CORRIGIDO**  
**Descrição:** Feedback negativo sobre sistema de pontuação  
**Ação:** Revisar e balancear fórmula de score  
**Prioridade:** MÉDIA

### **BUG #21: Migração para React**
**Status:** ❌ **DESIGN DECISION**  
**Descrição:** "Precisamos migrar para React para mobile funcionar?"  
**Nota:** Decisão de arquitetura de longo prazo  
**Prioridade:** BAIXA (Futuro)

---

## 📊 ESTATÍSTICAS

```
TOTAL DE BUGS: 25

POR SEVERIDADE:
🔥 Críticos: 3
⚠️ Altos: 5
📌 Médios: 11
📍 Baixos: 6

POR STATUS:
✅ Corrigidos: 4 (16%)
❌ Pendentes: 21 (84%)

POR CATEGORIA:
- Gameplay/Balance: 12
- UX/UI: 6
- Críticos: 3
- Segurança/Infra: 3
- Design Decisions: 3
```

---

## 🎯 PRIORIZAÇÃO RECOMENDADA

### **SPRINT 1 - CRÍTICOS (AGORA)**
1. 🔥 Fix basePrice error na shop
2. 🔥 Fix música de vitória (chiado)
3. 🔥 Fix Hall of Fame auto-submit

### **SPRINT 2 - ALTOS (PRÓXIMA SESSÃO)**
4. Card removal: player escolhe
5. Lucky Drawn: balancear probabilidades
6. Easy difficulty: algoritmo mais amigável
7. Merchant items: efeito imediato
8. Tutorial primeira run

### **SPRINT 3 - MÉDIOS**
9-19. Resto dos bugs médios

### **BACKLOG - BAIXOS/DESIGN**
20-25. Decisões de design e melhorias futuras

---

**PRÓXIMO PASSO:** Fixar os 3 bugs críticos AGORA! 🚀

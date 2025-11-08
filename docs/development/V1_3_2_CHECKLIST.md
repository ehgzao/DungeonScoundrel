# ✅ V1.3.2 - CHECKLIST DE TESTES COMPLETO

**Versão:** v1.3.2  
**Data:** 2025-11-08  
**Objetivo:** Garantir 100% de funcionalidade antes do deploy

---

## 🎮 SISTEMAS PRINCIPAIS

### 1. INICIALIZAÇÃO & MENU
- [ ] Página carrega sem erros
- [ ] Música do menu toca
- [ ] Botões do menu respondem
- [ ] 📚 CODEX abre no menu
- [ ] Hall of Fame carrega
- [ ] Learn to Play funciona
- [ ] Soundboard abre

### 2. CRIAÇÃO DE JOGO
- [ ] Modal "New Game" abre
- [ ] Input de nome funciona (3-10 chars)
- [ ] Seleção de classe funciona
- [ ] Seleção de dificuldade funciona
- [ ] Botão "Start" inicia jogo
- [ ] Tela de jogo carrega corretamente

### 3. BARRA SUPERIOR (IN-GAME)
- [ ] **ESQUERDA**: HP, Gold, Deck, Rooms mostram corretamente
- [ ] **CENTRO**: 📖 Relics | ⏱️ Timer | 🏆 Achievements
- [ ] Timer está CENTRALIZADO
- [ ] 📖 Relics abre CODEX (aba Relics)
- [ ] 🏆 Achievements abre CODEX (aba Achievements)
- [ ] **DIREITA**: 🎵 Play/Pause funciona
- [ ] Volume slider funciona
- [ ] 🏳️ Give Up funciona

### 4. SISTEMA CODEX (COMPLETO)
#### Aba UPGRADES:
- [ ] Abre corretamente
- [ ] Lista todos os upgrades
- [ ] Filtros funcionam:
  - [ ] ALL
  - [ ] ✅ UNLOCKED
  - [ ] ✨ AVAILABLE
  - [ ] 🔒 LOCKED
- [ ] Botão "Unlock" funciona
- [ ] Status atualiza após unlock

#### Aba RELICS:
- [ ] Abre corretamente
- [ ] Mostra todas as relics
- [ ] Filtros funcionam:
  - [ ] ALL
  - [ ] ⚪ COMMON
  - [ ] 🟢 UNCOMMON
  - [ ] 🔵 RARE
  - [ ] 🟠 LEGENDARY
- [ ] Descrições corretas
- [ ] Visual organizado por rarity

#### Aba ACHIEVEMENTS:
- [ ] Abre corretamente
- [ ] Mostra todos os 50 achievements
- [ ] Nomes e ícones corretos (não "UNDEFINED")
- [ ] Filtros funcionam:
  - [ ] ALL
  - [ ] 🥉 BRONZE
  - [ ] 🥈 SILVER
  - [ ] 🥇 GOLD
  - [ ] 💎 PLATINUM
- [ ] Status locked/unlocked correto
- [ ] Contador atualiza (X/50)

### 5. GAMEPLAY - CORE LOOP
- [ ] Deck shuffle no início
- [ ] Botão "Draw Room" funciona
- [ ] Cartas aparecem na sala
- [ ] Clique em carta funciona
- [ ] Números visuais aparecem (damage, heal)
- [ ] HP atualiza
- [ ] Gold atualiza
- [ ] Combo system funciona
- [ ] Botão "Avoid" funciona (penalidade correta)
- [ ] Timer incrementa

### 6. CARTAS ESPECIAIS
- [ ] 🛡️ Dodge evita próximo dano
- [ ] ⚡ Power dobra dano
- [ ] 💊 Super Potion cura full HP
- [ ] 💰 Treasure +5 Max HP
- [ ] 🔥 Berserk +5 damage (3 ataques)
- [ ] ⏰ Time Warp +2 cartas
- [ ] 🌟 Lucky Draw escolhe carta
- [ ] 🪞 Mirror Shield reflete dano
- [ ] 🎰 Gamble 50/50

### 7. SISTEMA DE COMBATE
- [ ] Monstros aparecem
- [ ] Dano calculado corretamente
- [ ] Arma equipada aplica dano
- [ ] Relics aplicam efeitos
- [ ] Morte de monstro dá gold
- [ ] XP sobe após kill
- [ ] Level up funciona

### 8. MERCHANT/SHOP
- [ ] Botão 🏺 MERCHANT funciona
- [ ] Shop abre sem erros
- [ ] Itens listados corretamente
- [ ] Preços mostram desconto (se houver)
- [ ] Old Key dá item grátis
- [ ] Compra funciona
- [ ] Gold deduzido
- [ ] Preços aumentam após compra
- [ ] Close volta ao jogo

### 9. EVENTOS
- [ ] Eventos aparecem aleatoriamente
- [ ] Texto do evento correto
- [ ] Opções funcionam
- [ ] Efeitos aplicados (HP, gold, relics)
- [ ] Modal fecha após escolha
- [ ] Holy Necklace +2 HP funciona

### 10. RELICS
- [ ] Relics aparecem
- [ ] Equipa corretamente
- [ ] Efeitos aplicam:
  - [ ] Berserker Ring +2 damage
  - [ ] Lucky Charm +10% gold
  - [ ] Hourglass cartas extras
  - [ ] Vampire Fang lifesteal
  - [ ] Phoenix Feather revive
  - [ ] etc.
- [ ] Display de relics atualiza
- [ ] Tooltip mostra descrição

### 11. ACHIEVEMENTS
- [ ] Achievements desbloqueiam automaticamente
- [ ] Notificação aparece
- [ ] SaveLocalStorage funciona
- [ ] Contador atualiza
- [ ] Stats lifetime funcionam

### 12. GAME OVER / VITÓRIA
- [ ] Derrota mostra tela correta
- [ ] Vitória mostra tela correta
- [ ] Score calculado corretamente
- [ ] Leaderboard atualiza
- [ ] Stats salvos
- [ ] Achievements verificados
- [ ] Botão "New Game" funciona
- [ ] Música muda (defeat/victory)

### 13. MUSIC & SOUND
- [ ] Menu music toca
- [ ] Gameplay music toca
- [ ] Shop music toca
- [ ] Victory music toca
- [ ] Defeat music toca
- [ ] SFX funcionam:
  - [ ] Card draw
  - [ ] Card flip
  - [ ] Hit/damage
  - [ ] Heal
  - [ ] Gold
  - [ ] Error
- [ ] Volume controla tudo
- [ ] Play/Pause funciona

### 14. SAVE/LOAD
- [ ] Permanent unlocks salvam
- [ ] Lifetime stats salvam
- [ ] Achievements salvam
- [ ] Leaderboard salva
- [ ] Settings salvam
- [ ] Reload página mantém progresso

### 15. CLOUD SYNC (Firebase)
- [ ] Login Google funciona
- [ ] Save to cloud funciona
- [ ] Load from cloud funciona
- [ ] Sync icon atualiza
- [ ] Erro tratado gracefully

### 16. RESPONSIVIDADE
- [ ] Desktop funciona
- [ ] Tablet funciona
- [ ] Mobile landscape funciona
- [ ] Mobile portrait mostra aviso

---

## 🐛 BUGS CONHECIDOS CORRIGIDOS

✅ openShop() estava faltando  
✅ updateShopDisplay() estava faltando  
✅ playerAchievements undefined  
✅ Achievement names "UNDEFINED"  
✅ Timer não centralizado  
✅ Botões redundantes removidos  

---

## ⚠️ MELHORIAS FUTURAS (v2.0)

- Separar game.js em módulos
- Remover onclick inline do HTML
- Migrar para TypeScript
- Build system (webpack/vite)
- Testes automatizados
- CI/CD pipeline

---

## 📝 NOTAS FINAIS

**Status Atual:** ✅ Funcional  
**Pronto para Deploy:** 🟡 Aguardando teste final do usuário  
**Próxima Versão:** v1.3.2 → Produção

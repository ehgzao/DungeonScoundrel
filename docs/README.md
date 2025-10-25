# 🎴 Dungeon Scoundrel - Roguelike Card Game

Um jogo de cartas roguelike inspirado em Balatro e Slay the Spire, desenvolvido em HTML/CSS/JavaScript puro.

## 🎮 Como Jogar

### Objetivo
Limpe todas as cartas da dungeon sem que sua vida chegue a zero!

### Mecânicas Principais

**1. Entrar ou Evitar Dungeons**
- **Enter Dungeon**: Revela 4 cartas para jogar
- **Avoid Dungeon**: Descarta 3 cartas do topo (não pode evitar duas vezes seguidas)

**2. Tipos de Cartas**
- **♠️ ♣️ Monstros (Espadas e Paus)**: Clique para lutar. Dano = Valor do Monstro - Valor da Arma
- **♦️ Armas (Ouros)**: Clique para equipar. Substitui arma atual
- **♥️ Poções (Copas)**: Clique para curar. Limite de 1 por dungeon
- **✨ Especiais**: 10 cartas únicas com efeitos poderosos (veja lista abaixo)

**3. ⚔️ Sistema de Durabilidade de Armas** (NOVO!)
- Armas agora têm **durabilidade limitada** por dificuldade:
  - 🟢 **Easy**: 3 ataques antes de quebrar
  - 🟡 **Normal**: 2 ataques antes de quebrar
  - 🔴 **Hard**: 1 ataque antes de quebrar
- **Indicador Visual** na arma equipada:
  - Barra colorida (verde/amarelo/vermelho)
  - Contador de usos (⚔️ 2/3 ou ⚠️ 1/3)
- **Relíquias Especiais**:
  - 🛠️ **Eternal Forge** (Lendária): Durabilidade infinita
  - 🔨 **Master Smith** (Rara): Auto-reparo ao limpar sala
- **Loja**: 🔧 Weapon Repair (20 gold) restaura durabilidade

**4. Sistema Hold**
- **Desktop**: Clique direito em uma carta para guardar
- **Mobile**: Pressione e segure por 500ms (com feedback háptico)
- Apenas 1 carta pode ser guardada por vez
- Clique na carta guardada para usá-la

**5. Progressão**
- 🪙 **Gold**: Ganhe matando monstros e limpando salas
- 🏪 **Shop**: Compre curas, relíquias e upgrades
- 🔮 **Relíquias**: Bônus permanentes durante a run
- 🎲 **Eventos**: Escolhas aleatórias após limpar salas
- 🔓 **Unlocks**: Progresso permanente entre runs

## ✨ Características

### 🎨 Visual "Juice" (Inspirado em Balatro)
- **Partículas**: Explosões coloridas em ações importantes
- **Shake de Tela**: Ao receber dano
- **Números Flutuantes**: Dano, cura e combos visuais
- **Animações**: Cards com hover, flip e entrada suaves
- **Combos**: Efeitos especiais ao derrotar monstros sem dano

### 🎵 Sistema de Som Procedural
- ✅ 15+ efeitos sonoros 8-bit (Web Audio API)
- ✅ **5 trilhas musicais** procedurais dinâmicas
  - 🎮 Dungeon Crawler
  - ⚔️ Boss Battle
  - 🗡️ Hero's Journey
  - 🌃 Neon Dreams
  - 🏆 Victory Lap
- ✅ Controles de música (play/pause/next)
- ✅ Toggle de som e música separados

### 🏆 Sistema de Conquistas (NOVO!)
- **50 Conquistas Totais**:
  - 🥉 **25 Bronze** - Conquistas fáceis para iniciantes
  - 🥈 **15 Prata** - Conquistas médias para jogadores experientes
  - 🥇 **9 Ouro** - Conquistas difíceis (5 secretas 🔒)
  - 💎 **1 Platina** - Master Scoundrel (desbloquear todas as outras)
- **Barra Compacta**: Contador visível na top bar (0/50)
- **Modal Expansível**: Ver todas as conquistas com filtros por tier
- **Toast Notifications**: Alerta visual ao desbloquear
- **Conquistas Secretas**: 5 conquistas ouro escondidas para descobrir
- **Progress Tracking**: Sistema completo de estatísticas vitalícias
- **Unlocks Permanentes**: Progresso que persiste entre runs
- **Leaderboard**: Sistema de ranking com Firebase

### 📱 Totalmente Responsivo
- Layout adaptável para desktop, tablet e mobile
- Controles touch otimizados
- Suporte a long-press para hold em dispositivos móveis

## 🎯 Dificuldades

- **🟢 Easy**: 25 HP iniciais
- **🟡 Normal**: 20 HP iniciais (1.5x multiplicador de pontos)
- **🔴 Hard**: 15 HP iniciais (2.5x multiplicador de pontos)

## ✨ Cartas Especiais (Novas!)

### 🆕 10 Cartas Únicas com Efeitos Poderosos

1. **🛡️ Dodge**: Evite completamente o próximo dano
2. **⚡ Power Strike**: Sua próxima arma causa 2x mais dano
3. **💊 Super Potion**: Cure até HP máximo instantaneamente
4. **💰 Treasure**: Ganhe +5 HP máximo permanente
5. **🔥 Berserk**: Próximos 3 ataques causam +5 de dano extra
6. **⏰ Time Warp**: Compre 2 cartas extras nesta sala
7. **💥 Obliterate**: Remove uma carta permanentemente do jogo
8. **🎲 Lucky Draw**: Continue comprando até encontrar uma arma
9. **🪞 Mirror Shield**: Reflita os próximos 10 pontos de dano
10. **🎰 Gamble**: 50% chance de +10 HP ou -5 HP

> **Dica Estratégica**: Cartas especiais aparecem aleatoriamente no baralho. Use-as sabiamente para situações difíceis!

## 🔮 Relíquias Disponíveis

- **🧛 Vampiric Fang**: Cure 2 HP ao derrotar monstros
- **⚔️ Berserker Ring**: +2 de dano em todas as armas
- **🛡️ Crystal Shield**: +5 HP máximo
- **🍀 Lucky Charm**: +50% gold
- **💚 Healing Amulet**: Poções curam +2 HP
- **⚡ Thunder Gauntlet**: 20% chance de dano crítico
- **🏰 Fortress Armor**: Escudo de 1 HP por sala
- **💰 Golden Idol**: +3 gold por sala limpa
- **🔥 Combo Master**: Efeitos de combo mais fortes
- **🐦 Phoenix Feather**: Reviva uma vez com 10 HP (lendária)
- **👑 Midas Touch**: Dobra todo o gold (lendária)
- E mais!

## 🎪 Shop

- 💊 Poções pequenas, médias e elixires
- ❤️ Recipientes de coração (+5 ou +10 HP máximo)
- ⚔️ Upgrades de arma (+2 ou +5)
- 🔮 Relíquias misteriosas e raras
- 🔥 Remoção de cartas (em breve)

## 📊 Sistema de Pontuação

### Vitória
```
Pontuação = ((Base + HP + Gold + Combo + Monstros) - Tempo) × Dificuldade
```
- Base: 1000 pontos
- HP Bonus: HP restante × 20
- Gold Bonus: Gold total × 5
- Combo Bonus: Combo máximo × 10
- Monster Bonus: Monstros mortos × 2
- Time Penalty: Segundos × 2

### Derrota
```
Pontuação = HP atual - ∑(Valor dos monstros no descarte)
```

## 🚀 Tecnologias

- **HTML5**: Estrutura semântica
- **CSS3**: Animações, gradientes, flexbox
- **JavaScript (Vanilla)**: Lógica do jogo
- **Web Audio API**: Som procedural
- **Firebase**: Leaderboard e autenticação
- **LocalStorage**: Saves e unlocks

## 📦 Arquitetura

O jogo é um **arquivo HTML monolítico** (~3400 linhas) para facilitar deploy e futuras melhorias:
- CSS inline para performance
- JavaScript modular dentro de um único arquivo
- Sem dependências externas (exceto Firebase para leaderboard)

## 🎨 Design

- **Cores**: Paleta dark com acentos vibrantes
- **Tipografia**: Segoe UI, sans-serif moderna
- **Layout**: Horizontal com 3 painéis (relíquias, centro, hold/descarte)
- **Responsivo**: Media queries para mobile, tablet e desktop

## 🔧 Como Executar

1. Abra `index.html` em qualquer navegador moderno
2. Ou use um servidor local:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx serve
   ```
3. Acesse `http://localhost:8000`

## 🎯 Roadmap Futuro

- [x] **Mais tipos de cartas especiais** ✅ (10 cartas implementadas!)
- [ ] Sistema de classes/personagens
- [ ] Mais eventos e escolhas
- [ ] Achievements visuais com toast
- [ ] Remoção de cartas no shop
- [ ] Boss fights especiais
- [ ] Daily challenges
- [ ] Modo endless

## 👤 Créditos

Desenvolvido como um roguelike card game inspirado em:
- **Balatro**: Sistema de juice e feedback visual
- **Slay the Spire**: Progressão, relíquias e eventos
- **Scoundrel (Original)**: Mecânica de cartas e combate

## 📄 Licença

Este projeto é open source e está disponível para uso pessoal e educacional.

---

**🎴 Boa sorte, Scoundrel! Que a fortuna esteja com você na dungeon!**

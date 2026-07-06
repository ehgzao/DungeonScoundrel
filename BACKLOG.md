# 📋 DUNGEON SCOUNDREL - BACKLOG UNIFICADO

**Última atualização:** 2026-07-06
**Versão atual:** 1.7.1 (batch 1 pós-auditoria: robustez, balance, headers)

> **Auditoria completa 2026-07-06** (5 reviews paralelos + verificação de produção
> ao vivo): lista priorizada entregue no chat da sessão. Executando em batches.
> Batch 1 (este release) = itens S de robustez/segurança/balance. Próximos:
> mobile soft-gate, Daily 100% seeded, cache fase 2 + split CSS + build step
> esbuild (TB-9 CONFIRMADO: produção NÃO minifica), Firestore hardening
> (allowlist de collections + hasOnly + App Check), ascension (TB-8).
**Single Source of Truth para planejamento**

> Remediação do audit já entregue (PRs #22–#27): XSS escaping, Firestore rules,
> design tokens, achievements obteníveis, deal-flip/touch hold, CSS deferral,
> **Firebase lazy-load**, **PWA icons PNG 192/512 + maskable (PWA 100)**,
> **CSP: removido `script 'unsafe-inline'` (handlers isolados em `script-src-attr`)**
> e CSP consolidada numa fonte (netlify.toml). Lighthouse: Perf 90 / A11y 100 /
> BP 100 / SEO 100 / PWA 100.

---

## 📊 SUMÁRIO EXECUTIVO

### Estado Atual do Código

| Arquivo | Tamanho | Status |
|---------|---------|--------|
| `game.js` | **200KB** | 🔴 Crítico - Precisa modularização |
| `helpers.js` | 35KB | 🟡 Grande - Revisar |
| `inline-scripts.js` | 34KB | 🟡 Revisar necessidade |
| `game-data.js` | 28KB | 🟢 OK - Dados |
| Outros módulos | <20KB cada | 🟢 OK |

### Sistemas Modularizados vs Não Modularizados

#### ✅ JÁ MODULARIZADO (Separados do game.js)
| Sistema | Arquivo | Linhas |
|---------|---------|--------|
| Estado do jogo | `modules/game-state.js` | ~300 |
| Eventos aleatórios | `modules/game-events.js` | ~200 |
| Sistema de loja | `modules/game-shop.js` | ~400 |
| Sistema de relíquias | `modules/game-relics.js` | ~250 |
| Achievements | `systems/achievements.js` | ~500 |
| Música | `systems/music.js` | ~650 |
| Leaderboard | `systems/leaderboard.js` | ~300 |
| Stats permanentes | `systems/stats.js` | ~200 |
| Codex | `systems/codex.js` | ~600 |
| Firebase Auth | `core/firebase-auth.js` | ~700 |
| Helpers/Utils | `utils/helpers.js` | ~1200 |
| Offline Storage | `utils/offline-storage.js` | ~600 |
| Mobile Optimization | `utils/mobile-optimization.js` | ~400 |
| Constantes | `config/game-constants.js` | ~500 |
| Dados do jogo | `data/game-data.js` | ~900 |

#### 🔴 NÃO MODULARIZADO (Dentro do game.js - 4867 linhas)
| Sistema | Linhas Aprox. | Prioridade |
|---------|--------------|------------|
| Sistema de Classes | ~300 | Alta |
| Sistema de Combate | ~600 | Alta |
| Sistema de Deck/Cartas | ~400 | Alta |
| Sistema de Tutorial | ~400 | Média |
| Sistema de Sons (SFX) | ~200 | Média |
| Sistema de UI/Update | ~500 | Média |
| Sistema de Tooltips | ~200 | Baixa |
| Game Over/Victory | ~300 | Baixa |
| Keyboard Shortcuts | ~100 | Baixa |
| DOM Elements | ~100 | Baixa |

---

## 🎯 PRIORIZAÇÃO POR IMPACTO

### 🔴 PRIORIDADE CRÍTICA - Impacto Alto no Player

#### P0 - Bloqueadores (Fazer Imediatamente)
| ID | Tarefa | Impacto | Esforço | Status |
|----|--------|---------|---------|--------|
| P0-1 | **Service Worker não registra** - PWA quebrado | Player | 2h | 🟢 Concluído (registro externalizado em `register-sw.js`; PWA 100) |
| P0-2 | **Configurar variáveis Netlify** - Deploy funcional | Deploy | 30min | 🟢 Concluído |
| P0-3 | **Testar Leaderboard em produção** | Player | 1h | 🟢 Concluído |
| P0-4 | **Testar Cloud Save em produção** | Player | 1h | 🟢 Concluído |

#### P1 - Alta Prioridade (Esta semana)
| ID | Tarefa | Impacto | Esforço | Status |
|----|--------|---------|---------|--------|
| P1-1 | **LCP alto (3.7s)** - Otimizar carregamento inicial | UX | 4h | 🟢 Concluído (v1.4.3) |
| P1-2 | **Unused JS (180KB!)** - Remover código morto | Performance | 8h | 🔴 Pendente |
| P1-3 | **Minificar JS** - Reduzir tamanho de download | Performance | 2h | 🟢 Concluído (Netlify) |
| P1-4 | **Minificar CSS** - Reduzir tamanho | Performance | 1h | 🟢 Concluído (Netlify) |

---

### 🟡 PRIORIDADE ALTA - Impacto Lighthouse

#### P2 - Otimizações de Performance (Próximas 2 semanas)
| ID | Tarefa | Impacto | Esforço | Status |
|----|--------|---------|---------|--------|
| P2-1 | **Render-blocking resources** - defer scripts | Lighthouse | 2h | 🟢 Concluído (v1.4.3) |
| P2-2 | **Unused CSS (10KB)** - Purge CSS não usado | Lighthouse | 3h | 🔴 Pendente |
| P2-3 | **Imagens responsivas** - Servir tamanho correto | Lighthouse | 4h | 🟢 Concluído (Netlify) |
| P2-4 | **Cache headers** - Otimizar TTL | Lighthouse | 1h | 🟢 Concluído |
| P2-5 | **Preconnect fonts** - Corrigir crossorigin | Lighthouse | 30min | 🟢 Concluído (v1.4.3) |

#### P3 - PWA Compliance (Próximas 2 semanas)
| ID | Tarefa | Impacto | Esforço | Status |
|----|--------|---------|---------|--------|
| P3-1 | **Splash Screen** - Configurar no manifest | PWA | 1h | 🔴 Pendente |
| P3-2 | **Maskable Icon** - Criar ícone com safe zone | PWA | 2h | 🟢 Concluído (icon-maskable-512.png, safe zone 80%) |
| P3-3 | **Offline mode** - Garantir funcionamento | PWA | 4h | 🔴 Pendente |

---

### 🟢 PRIORIDADE MÉDIA - Melhorias Técnicas

#### P4 - Modularização do game.js (Próximo mês)
| ID | Tarefa | Impacto | Esforço | Status |
|----|--------|---------|---------|--------|
| P4-1 | **Extrair Sistema de Classes** → `modules/game-classes.js` | Manutenibilidade | 4h | 🟢 Concluído |
| P4-2 | **Extrair Sistema de Combate** → `modules/game-combat.js` | Manutenibilidade | 6h | 🟢 Concluído |
| P4-3 | **Extrair Sistema de Deck** → `modules/game-deck.js` | Manutenibilidade | 4h | 🟢 Concluído |
| P4-4 | **Extrair Sistema de Tutorial** → `systems/tutorial.js` | Manutenibilidade | 3h | 🔴 Pendente |
| P4-5 | **Extrair Sistema de Sons** → `systems/sfx.js` | Manutenibilidade | 2h | 🔴 Pendente |
| P4-6 | **Extrair Sistema de UI** → `systems/ui-manager.js` | Manutenibilidade | 4h | ⚪ Cancelado (complexo) |

#### P5 - Limpeza de Código
| ID | Tarefa | Impacto | Esforço | Status |
|----|--------|---------|---------|--------|
| P5-1 | **Revisar inline-scripts.js** - Mover para módulos | Organização | 3h | 🔴 Pendente |
| P5-2 | **Revisar helpers.js** - Dividir por responsabilidade | Organização | 4h | 🔴 Pendente |
| P5-3 | **Remover console.logs** de produção | Qualidade | 1h | 🔴 Pendente |
| P5-4 | **Documentar funções públicas** | Manutenibilidade | 4h | 🔴 Pendente |

---

### 🔵 PRIORIDADE BAIXA - Nice to Have

#### P6 - UX/UI Melhorias
| ID | Tarefa | Impacto | Esforço | Status |
|----|--------|---------|---------|--------|
| P6-1 | **Responsividade CODEX mobile** | UX | 3h | 🔴 Pendente |
| P6-2 | **Tooltips touch-friendly** | Mobile | 4h | 🔴 Pendente |
| P6-3 | **Gestos swipe** para navegação | Mobile | 4h | 🔴 Pendente |

#### P7 - Documentação
| ID | Tarefa | Impacto | Esforço | Status |
|----|--------|---------|---------|--------|
| P7-1 | **Atualizar CHANGELOG** para v1.4.3 | Documentação | 30min | 🔴 Pendente |
| P7-2 | **Criar README para desenvolvedores** | Onboarding | 2h | 🔴 Pendente |
| P7-3 | **Documentar arquitetura** | Manutenibilidade | 3h | 🔴 Pendente |

---

### 🎲 GAME BALANCE - Rebalance de Dificuldades

#### GB - Balanceamento (precisa decisão de design do dono)
| ID | Tarefa | Impacto | Esforço | Status |
|----|--------|---------|---------|--------|
| GB-1 | **Rebalancear frequência de eventos por dificuldade** | Player (game feel) | 2-3h | 🔴 Pendente |
| GB-2 | **Remover constantes mortas de evento** (`EVENT_CONFIG.BASE_CHANCE/EASY_REDUCTION/HARD_INCREASE`) | Limpeza | 15min | 🔴 Pendente |

**GB-1 — diagnóstico (aterrado no código, não suposição):**

Reportado pelo dono: *"o fácil está com muitos eventos seguidos"*. Confirmado.

- A chance de evento por sala vem de `EVENT_CONFIG` (`config/game-constants.js`),
  lida em `game.js:1784-1790`:
  - `CHANCE_EASY: 0.40` ← **a MAIOR de todas**
  - `CHANCE_NORMAL: 0.30`
  - `CHANCE_HARD: 0.20`
  - `CHANCE_ENDLESS: 0.25`
  - A curva está **invertida**: Easy dispara mais eventos que Hard.
- Bônus somam de forma aditiva **sem teto** (`game.js:1792-1805`):
  Dancer `+0.15`, unlock `eventLuck` `+0.50`, relíquia Compass `+0.10`.
  No Easy isso chega a `0.40 + 0.50 + 0.15 + 0.10 = 1.15` → evento garantido
  em praticamente toda sala = "muitos eventos seguidos".
- Há um cap de **1 evento por sala** (`game.eventTriggeredThisRoom`, `game.js:1808`),
  então o problema é a frequência sala-a-sala, não múltiplos na mesma sala.
- Constantes mortas: `BASE_CHANCE: 0.15`, `EASY_REDUCTION: 0.05`, `HARD_INCREASE: 0.05`
  (`game-constants.js:99-103`) — modelo antigo, nunca referenciado (ver GB-2).

**Propostas (a escolher com o dono — números são decisão de game feel):**
1. **Inverter a curva** para casar com a expectativa: `easy 0.20 / normal 0.25 / hard 0.30 / endless 0.30`.
2. **Manter "easy = mais ajuda"** mas separar eventos benéficos de prejudiciais
   (easy enviesa pro bom), em vez de só ter mais eventos.
3. **Clampar a soma de bônus** (ex: teto `0.60`) pra empilhamento de unlocks/relíquias
   não saturar em 100%.



## 🎮 MODES & ADVENTURE — ROADMAP (shirt size + impacto)

**Sizes:** S ≤2h · M ~meio dia · L 1–2 dias · XL multi-dia.
**Impacto:** 🔴 alto · 🟡 médio · ⚪ baixo.

### ✅ Já entregue (Adventure)
Deck ilustrado (31 cartas, Gemini), mapa procedural StS (balance: fogueira pré-boss,
loja/ato, elites limitados, 100% alcançável), endgame único por classe, wiring do
run (combate/boss/rest/treasure/shop/event), escala por profundidade, deck
persistente + cull na fogueira, crop de margem das cartas.

### A. Onboarding & Modos
| ID | Item | Size | Imp | Status |
|----|------|------|-----|--------|
| ON-1 | Redesign do menu inicial explicando Classic vs Adventure (+ entrada de cada modo) | M | 🔴 | ✅ Feito |
| ON-2 | Refazer tutorial: Classic (zerar masmorra c/ 1 baralho) + Adventure (mapa/nós/deckbuild) | L | 🟡 | ✅ Feito |
| ON-3 | Mover seletor de modo do new-game pro menu principal | S | 🟡 | Pendente |

### B. Legibilidade & Arte da carta
| ID | Item | Size | Imp | Status |
|----|------|------|-----|--------|
| CARD-1 | Cor/borda + glyph por tipo (ler o tipo na hora) | S | 🔴 | ✅ Feito |
| CARD-2 | Reduzir margens (crop retrato) | S | 🔴 | ✅ Feito |
| CARD-3 | Variar ilustrações (menos uniformes; moldura por tipo) — regen | M | 🟡 | ✅ Feito (regen 31 cartas: moldura por tipo + composição por carta) |
| CARD-4 | Bosses + relics ilustrados | M | 🟡 | ✅ Feito (8 bosses + 51 ícones de relic ilustrados) |

### C. Polimento do mapa
| ID | Item | Size | Imp | Status |
|----|------|------|-----|--------|
| MAP-1 | Tirar cara de grid: arestas curvas/orgânicas + jitter nos nós | S | 🟡 | ⏭️ Descopado (usuário aprovou linhas retas + nós opacos) |
| MAP-2 | Marcador de posição atual + caminho percorrido | S | 🟡 | ✅ Feito |
| MAP-3 | Tooltip nos nós (o que tem dentro) | S | ⚪ | ✅ Feito (hover/focus + aria-label) |

### D. Profundidade & balanço do Adventure (não-trivial)
| ID | Item | Size | Imp | Status |
|----|------|------|-----|--------|
| ADV-1 | Dificuldade = nº de mãos por encontro (easy 1 / normal 2 / hard 3) | M | 🔴 | ✅ Feito |
| ADV-2 | Mercador no mapa: comprar/vender/upgrade de carta (deckbuild completo) | L | 🔴 | ✅ Feito |
| ADV-3 | Tirar mercador do canto da tela (só no mapa, em Adventure) | S | 🟡 | ✅ Feito |
| ADV-4 | Nós de evento: escolhas reais (não só boon) | M | 🟡 | ✅ Feito (5 eventos com trade-off) |
| ADV-5 | Relics como recompensa (elite/tesouro/boss) → variedade de build | M | 🔴 | ✅ Feito |
| ADV-6 | Sistemas anti-trivial (ver notas state-of-art) | L | 🔴 | ✅ Feito (baú amaldiçoado + carta-maldição no deck + combates forçados + fogueiras limitadas) |

### E. Achievements & Leaderboard
| ID | Item | Size | Imp | Status |
|----|------|------|-----|--------|
| ACH-1 | Achievements de zerar por modo (Classic & Adventure) × dificuldade | M | 🔴 | ✅ Feito |
| ACH-2 | Achievements de tempo (speedrun) | S | 🟡 | ✅ Feito |
| ACH-3 | Zerar Adventure com cada classe (6) | S | 🟡 | ✅ Feito |
| LB-1 | Seções no leaderboard por modo (Classic/Adventure) + manter tabs de dificuldade | M | 🔴 | ✅ Feito |
| LB-2 | Leaderboard por tempo (clear mais rápido) | M | 🟡 | ✅ Feito (toggle Top Score / Fastest) |

### F. Dívida técnica (antiga)
| ID | Item | Size | Imp | Status |
|----|------|------|-----|--------|
| TD-1 | Extrair 233 estilos inline → classes | L | ⚪ | 🟡 Parcial (padrões mais repetidos → .panel-box/.class-card-frame/.img-cover/.class-card-title; 25 inline removidos) |
| TD-2 | Mobile portrait dedicado | XL | 🟡 | Adiado (desktop-first) |
| TD-3 | Modularizar game.js (tutorial/sfx) | L | ⚪ | ✅ Feito (sfx→game-sounds.js; tutorial→in-game-tutorial.js; game.js -438 linhas) |
| TD-4 | Integrar event-system completo nos nós de evento | M | 🟡 | ⏭️ Superado por ADV-4 (eventos próprios do Adventure com escolhas/curse) |

### 🧠 Notas state-of-art (deixar o Adventure NÃO-trivial)
- **Legibilidade primeiro (StS):** tipo = cor + glyph + silhueta, lido em 0.1s.
- **Tensão:** curas escassas (poucas fogueiras), deck incha se não fizer cull, durabilidade de arma pesa mais com encontros de várias mãos, elite = risco/recompensa, boss telegrafado, ouro escasso.
- **Variedade de build:** relics vindos de nós; peso de nós/eventos por classe ligado à motivação.
- **Pacing:** escala por profundidade (feito) + mãos por dificuldade + HP de boss escalado.
- **Anti-trivial:** não dá pra evitar tudo (alguns combates forçados); cartas de maldição/condições; fogueiras limitadas; baú amaldiçoado risco/recompensa.

### 🗺️ Ordem recomendada
1. **CARD-1 + MAP-1** (S, polimento visível) → 2. **ADV-1** mãos/dificuldade (feel central) →
3. **ON-1** menu → 4. **ADV-5** relics-recompensa + **ADV-2** mercador/deckbuild →
5. **ACH-1 + LB-1** (meta dos modos) → 6. **ON-2** tutorial → 7. **CARD-3/4** arte (key) →
8. **ADV-4/6** profundidade.

**Status:** roadmap Adventure completo — sequência 1–8 + polimento (MAP-3, LB-2) +
arte completa (CARD-3 regen, CARD-4 bosses + relics).
**Restante:** ON-3 (mover seletor de modo — já escolhido no menu, baixa prioridade),
TD-1/3/4 (dívida técnica antiga, fora do escopo Adventure).

---

## 🔧 OPTIMIZATION PASS (v1.5.1) — resultados & propostas

### ✅ Entregue nesta pass
Escape soft-locks (map/intro/game-over) + watchdog de recuperação · resets de
run (finalBossSpawned/undo/relics) · victory gates (Evade não pula o Dungeon
Lord; morte não spawna boss) · integridade do Undo (deep-copy + stats) ·
consumo de buffs em boss · boss não recicla no deck do Adventure · depth
scaling idempotente · relics mortas revividas (Bronze Ring, Healing Charm,
Crown×gold, per-room flags no Adventure) · pick-1-of-3 relic rewards · death
recap · HUD chips (combo/wave) · curse cards visíveis · raridade na sidebar ·
sons no Adventure · a11y (teclado, aria-live, dialog roles, reduced-motion,
contraste, touch targets) · game-economy.js compartilhado · smoke test em CI.

**v1.7.0 (boss fairness + perf):** boss entourage no Adventure (3 cartas do run
deck junto ao boss; horda "regroups" com chip damage = strike/2; strike com cap
10/12/14 em vez do HP pool como dano; rusted blade 4♦ como failsafe se o deck
ficou sem armas; sweep das cartas sobreviventes de volta ao deck na vitória) ·
arte re-masterizada para o tamanho real de exibição (4.4MB→~1.3MB, −70%) ·
prefetch idle da arte no início do run · service worker cache-first p/ /assets/ ·
**fix crítico de cache**: /src/js e /src/styles eram `immutable` 1 ano com URLs
sem versão (imports de módulos ES e todos os <link> de CSS) — jogadores
recorrentes ficavam com módulos/CSS antigos misturados a scripts novos após
cada release; agora `max-age=0, must-revalidate`.

### 📋 Track B — propostas restantes (design notes na PR da pass)
| ID | Item | Size | Imp | Status |
|----|------|------|-----|--------|
| TB-2 | Famílias de synergy de relics (3-4 tags que combinam) | L | 🔴 | 🔴 Proposto |
| TB-3 | Codex com discovery ("?" até encontrar) | M | 🟡 | 🟢 Concluído (v1.6.0) |
| TB-4 | Tela de lifetime stats / carreira (dados já existem) | M | 🟡 | 🟢 Concluído (v1.6.0 — aba Stats no Codex) |
| TB-6 | Daily Run com seed compartilhada + seção no leaderboard | L | 🔴 | 🟢 Concluído (v1.6.0 — mapa seeded/dia; draws de carta ainda variam) |
| TB-7 | Mecânica única por final boss (ligada à motivação) | L | 🟡 | 🟡 Parcial (v1.7.0: boss entourage/waves é a base estrutural; mecânicas por-boss seguem propostas) |
| TB-8 | Ascension ladder pós-Hard | XL | 🟡 | 🔴 Proposto (design doc primeiro) |
| TB-9 | Verificar minificação em PRODUÇÃO (Netlify `[build.processing]` não roda em deploy previews — Lighthouse do preview acusa JS/CSS não minificados). Se prod também não minifica, adicionar build step (esbuild) validado pelo smoke local | M | 🟡 | 🔴 Novo (v1.7.0) |

### ⚠️ Limitações conhecidas (não corrigidas nesta pass)
- Firestore ainda confia em `score`/`time` enviados pelo cliente (precisa de
  scoring server-authoritative — flag da QA pass anterior, segue aberto).
- Phoenix Feather não dispara em mortes por strike/regroup de boss (dano fora
  do fluxo normal de combate) — comportamento antigo, agora documentado.
- Foco não retorna ao elemento que abriu o modal ao fechar (a11y).
- Top-bar central pode colidir com os chips em 1024–1280px (sem breakpoint).
- Inline styles em template literals JS (codex/adventure-run/tutorial/shop)
  — segunda pass de TD-1 ainda pendente.

## 📈 ÉPICOS FUTUROS

### Epic F1 - Mobile-First (Planejado)
- [ ] Layout totalmente responsivo
- [ ] Controles otimizados para toque
- [ ] Performance mobile
- [ ] Paridade desktop vs mobile

### Epic F2 - Expansão de Conteúdo (Planejado)
- [ ] Novas classes jogáveis
- [ ] Pacotes extras de relics
- [ ] Novos bosses
- [ ] Novos eventos narrativos

### Epic F3 - Desafios Diários/Semanais (Ideia)
- [ ] Desafios diários com modificadores
- [ ] Desafios semanais com rank
- [ ] Recompensas cosméticas

### Epic F4 - Social & Compartilhamento (Ideia)
- [ ] Compartilhamento de runs
- [ ] Perfis públicos simples
- [ ] Compartilhar em redes sociais

### Epic F5 - UX Avançada & Acessibilidade (Proposta)
- [ ] Opções de acessibilidade (daltônico, fontes)
- [ ] Controles avançados de áudio
- [ ] Melhor feedback de erros
- [ ] Histórico de runs

### Epic F6 - Analytics Internas (Ideia)
- [ ] Telemetria agregada de runs
- [ ] Painel interno simples
- [ ] Flags para experimentos leves

---

## 📊 MÉTRICAS LIGHTHOUSE ATUAIS

| Métrica | Valor | Meta | Status |
|---------|-------|------|--------|
| FCP (First Contentful Paint) | 2.0s | <1.8s | 🟡 |
| LCP (Largest Contentful Paint) | 3.7s | <2.5s | 🔴 |
| Speed Index | 3.1s | <3.4s | 🟢 |
| TTI (Time to Interactive) | - | <3.8s | - |
| Total Blocking Time | - | <200ms | - |
| CLS (Cumulative Layout Shift) | - | <0.1 | - |

### Oportunidades de Economia
| Área | Economia Potencial |
|------|-------------------|
| Unused JavaScript | 180KB |
| Unminified JavaScript | 34KB |
| Unused CSS | 10.6KB |
| Unminified CSS | 5.7KB |
| Responsive Images | 30KB |
| Duplicated JavaScript | 3.8KB |
| **TOTAL** | **~264KB** |

---

## 🗓️ ROADMAP SUGERIDO

### Sprint 1 (Esta semana)
- [ ] P0-1: Corrigir Service Worker
- [x] P0-2: Configurar Netlify env vars ✅
- [x] P0-3: Testar Leaderboard ✅
- [x] P0-4: Testar Cloud Save ✅
- [ ] P1-3: Minificar JS
- [ ] P1-4: Minificar CSS

### Sprint 2 (Próxima semana)
- [ ] P1-1: Otimizar LCP
- [ ] P1-2: Remover código não utilizado (180KB)
- [ ] P2-1: Render-blocking resources
- [ ] P2-5: Preconnect fonts

### Sprint 3 (Semana 3)
- [ ] P2-2: Purge CSS
- [ ] P2-3: Imagens responsivas
- [ ] P3-1: Splash Screen
- [ ] P3-2: Maskable Icon

### Sprint 4+ (Mês seguinte)
- [ ] P4-1 a P4-6: Modularização do game.js
- [ ] P5-1 a P5-4: Limpeza de código

---

## 📝 NOTAS DE IMPLEMENTAÇÃO

### Configuração Netlify (P0-2) ✅ CONCLUÍDO

**Solução final aplicada:**
- Firebase config com credenciais diretas no repo (keys são públicas por design)
- Variável `SECRETS_SCAN_SMART_DETECTION_ENABLED=false` no Netlify
- CSP headers atualizados com gstatic.com e googleapis.com
- Deploy funcionando em produção desde 2025-11-26

### Service Worker (P0-1)
O Service Worker não está sendo registrado corretamente. Verificar:
1. `sw.js` existe em `public/`
2. Registro no `index.html`
3. Escopo correto

### Modularização (P4)
Ordem sugerida de extração:
1. Classes (mais isolado)
2. Deck/Cartas (depende pouco de outros sistemas)
3. Combate (core do jogo)
4. Tutorial (menos crítico)
5. Sons (pequeno)
6. UI Manager (mais integrado)

---

## 📌 CONVENÇÕES

- **🔴 Pendente** - Não iniciado
- **🟡 Em progresso** - Trabalho em andamento
- **🟢 Concluído** - Implementado e testado
- **⚪ Cancelado** - Descartado

### Estimativas de Esforço
- **30min - 1h**: Tarefa simples
- **2-4h**: Tarefa média
- **6-8h**: Tarefa complexa
- **1-2 dias**: Epic/Feature grande

---

**Mantido por:** Dungeon Scoundrel Dev Team
**Próxima revisão:** Após conclusão do Sprint 1

# 📋 DUNGEON SCOUNDREL - BACKLOG UNIFICADO

**Última atualização:** 2025-11-25
**Versão atual:** 1.4.3
**Single Source of Truth para planejamento**

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
| P0-1 | **Service Worker não registra** - PWA quebrado | Player | 2h | 🔴 Pendente |
| P0-2 | **Configurar variáveis Netlify** - Deploy funcional | Deploy | 30min | 🟡 Aguardando usuário |
| P0-3 | **Testar Leaderboard em produção** | Player | 1h | 🔴 Pendente |
| P0-4 | **Testar Cloud Save em produção** | Player | 1h | 🔴 Pendente |

#### P1 - Alta Prioridade (Esta semana)
| ID | Tarefa | Impacto | Esforço | Status |
|----|--------|---------|---------|--------|
| P1-1 | **LCP alto (3.7s)** - Otimizar carregamento inicial | UX | 4h | 🔴 Pendente |
| P1-2 | **Unused JS (180KB!)** - Remover código morto | Performance | 8h | 🔴 Pendente |
| P1-3 | **Minificar JS** - Reduzir tamanho de download | Performance | 2h | 🔴 Pendente |
| P1-4 | **Minificar CSS** - Reduzir tamanho | Performance | 1h | 🔴 Pendente |

---

### 🟡 PRIORIDADE ALTA - Impacto Lighthouse

#### P2 - Otimizações de Performance (Próximas 2 semanas)
| ID | Tarefa | Impacto | Esforço | Status |
|----|--------|---------|---------|--------|
| P2-1 | **Render-blocking resources** - 157ms de economia | Lighthouse | 2h | 🔴 Pendente |
| P2-2 | **Unused CSS (10KB)** - Purge CSS não usado | Lighthouse | 3h | 🔴 Pendente |
| P2-3 | **Imagens responsivas** - Servir tamanho correto | Lighthouse | 4h | 🔴 Pendente |
| P2-4 | **Cache headers** - Otimizar TTL | Lighthouse | 1h | 🟢 Implementado |
| P2-5 | **Preconnect fonts** - Corrigir crossorigin | Lighthouse | 30min | 🔴 Pendente |

#### P3 - PWA Compliance (Próximas 2 semanas)
| ID | Tarefa | Impacto | Esforço | Status |
|----|--------|---------|---------|--------|
| P3-1 | **Splash Screen** - Configurar no manifest | PWA | 1h | 🔴 Pendente |
| P3-2 | **Maskable Icon** - Criar ícone com safe zone | PWA | 2h | 🔴 Pendente |
| P3-3 | **Offline mode** - Garantir funcionamento | PWA | 4h | 🔴 Pendente |

---

### 🟢 PRIORIDADE MÉDIA - Melhorias Técnicas

#### P4 - Modularização do game.js (Próximo mês)
| ID | Tarefa | Impacto | Esforço | Status |
|----|--------|---------|---------|--------|
| P4-1 | **Extrair Sistema de Classes** → `modules/game-classes.js` | Manutenibilidade | 4h | 🔴 Pendente |
| P4-2 | **Extrair Sistema de Combate** → `modules/game-combat.js` | Manutenibilidade | 6h | 🔴 Pendente |
| P4-3 | **Extrair Sistema de Deck** → `modules/game-deck.js` | Manutenibilidade | 4h | 🔴 Pendente |
| P4-4 | **Extrair Sistema de Tutorial** → `systems/tutorial.js` | Manutenibilidade | 3h | 🔴 Pendente |
| P4-5 | **Extrair Sistema de Sons** → `systems/sfx.js` | Manutenibilidade | 2h | 🔴 Pendente |
| P4-6 | **Extrair Sistema de UI** → `systems/ui-manager.js` | Manutenibilidade | 4h | 🔴 Pendente |

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

## 📈 ÉPICOS FUTUROS (Do PRODUCT_BACKLOG_EPICS.md)

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
- [ ] P0-2: Configurar Netlify env vars
- [ ] P0-3: Testar Leaderboard
- [ ] P0-4: Testar Cloud Save
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

### Configuração Netlify (P0-2)
Arquivo `.env.netlify` criado com as variáveis:
```
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
```

**Ação necessária:** Importar via Netlify Dashboard > Site settings > Build & deploy > Environment variables > Import variables

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

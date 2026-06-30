# 📁 ESTRUTURA DO PROJETO - Dungeon Scoundrel

## 🎯 ORGANIZAÇÃO ATUAL (v1.4.3)

```
DungeonScoundrel/
├── 📁 public/                          # Arquivos públicos (servidos)
│   ├── 📁 assets/                      # Assets de produção
│   │   ├── 📁 images/                  # Imagens do jogo (WebP otimizado)
│   │   │   ├── avatar-*.webp          # Avatares das classes (6)
│   │   │   ├── avatar-*.jpg           # Fallback JPG (6)
│   │   │   ├── dungeon-bg.webp        # Background do jogo
│   │   │   └── title-logo.webp        # Logo do jogo
│   │   ├── 📁 cards/                   # Arte de cartas (Adventure)
│   │   │   └── 📁 adventure/           # 39 webp: 31 cartas do deck + 8 retratos de boss
│   │   ├── 📁 relics/                  # 51 ícones de relíquias ilustrados (webp)
│   │   └── 📁 icons/                   # Ícones e favicons
│   │       ├── favicon-*.svg          # Ícones SVG
│   │       └── icon-*.png             # PWA icons
│   │
│   ├── 📁 src/
│   │   ├── 📁 js/
│   │   │   ├── 📁 config/              # Configurações
│   │   │   │   └── game-constants.js   # Constantes centralizadas
│   │   │   ├── 📁 core/                # Núcleo do jogo
│   │   │   │   ├── audio-context.js    # Contexto de áudio Web API
│   │   │   │   ├── error-handler.js    # Handler global de erros
│   │   │   │   ├── firebase-auth.js    # Autenticação Firebase
│   │   │   │   └── silent-logging.js   # Logging silencioso (carrega 1º)
│   │   │   ├── 📁 data/                # Dados do jogo
│   │   │   │   ├── game-data.js        # Relics, Shop, Events data
│   │   │   │   └── adventures.js       # ACTS + ADVENTURES por classe (Adventure)
│   │   │   ├── 📁 features/            # Features específicas
│   │   │   │   └── inline-scripts.js   # Scripts inline necessários
│   │   │   ├── 📁 modules/             # Módulos ES6 + modo Adventure
│   │   │   │   ├── game-state.js       # Estado global do jogo
│   │   │   │   ├── game-events.js      # Sistema de eventos
│   │   │   │   ├── game-shop.js        # Sistema de loja
│   │   │   │   ├── game-relics.js      # Sistema de relíquias
│   │   │   │   ├── game-sounds.js      # Efeitos sonoros (extraído de game.js)
│   │   │   │   ├── adventure-map.js    # window.AdventureMap — mapa procedural (ES6)
│   │   │   │   ├── adventure-run.js    # window.AdventureRun — orquestrador (classic)
│   │   │   │   └── in-game-tutorial.js # window.InGameTutorial — tutorial Classic (classic)
│   │   │   ├── 📁 systems/             # Sistemas do jogo
│   │   │   │   ├── achievements.js     # Sistema de conquistas
│   │   │   │   ├── codex.js            # Sistema CODEX (classic, após game.js)
│   │   │   │   ├── leaderboard.js      # Placar global
│   │   │   │   ├── music.js            # Sistema de música
│   │   │   │   └── stats.js            # Estatísticas do jogador
│   │   │   ├── 📁 utils/               # Utilitários
│   │   │   │   ├── helpers.js          # Funções auxiliares
│   │   │   │   ├── mobile-optimization.js  # Otimizações mobile
│   │   │   │   └── offline-storage.js  # IndexedDB para saves
│   │   │   └── game.js                 # ⚠️ Arquivo principal (ES module)
│   │   │
│   │   ├── 📁 css/
│   │   │   └── styles.css              # Estilos principais
│   │   │
│   │   └── 📁 config/
│   │       └── firebase-config.js      # Configuração Firebase (gitignored)
│   │
│   ├── index.html                      # Página principal (~1,523 linhas)
│   ├── privacy-policy.html             # Política de privacidade
│   ├── site.webmanifest                # Manifest PWA
│   └── sw.js                           # Service Worker (gerado)
│
├── 📁 docs/                            # Documentação (20 arquivos)
│   ├── 📁 guides/                      # Roadmaps e planejamento
│   │   ├── MOBILE_ROADMAP.md           # Roadmap mobile completo
│   │   ├── BACKLOG_PRIORIZADO.md       # Backlog priorizado
│   │   └── PHASE_1.2_PLAN.md           # Plano Fase 1.2
│   ├── 📁 architecture/                # Estrutura técnica
│   │   ├── PROJECT_STRUCTURE.md        # Este arquivo
│   │   ├── MODULES.md                  # Documentação de módulos
│   │   └── DEPENDENCY_MAP.md           # Mapa de dependências
│   ├── 📁 releases/                    # Changelog e releases
│   │   ├── CHANGELOG.md                # Histórico de versões
│   │   ├── RELEASE_v1.4.0.md           # Notas da v1.4.0
│   │   └── BUG_FIXES_REPORT.md         # Relatório de bugs
│   ├── 📁 security/                    # Auditorias de segurança
│   │   ├── SECURITY_AUDIT.md           # Auditoria completa
│   │   └── CRITICAL_VERIFICATION.md    # Verificações críticas
│   ├── 📁 development/                 # Processo de desenvolvimento
│   │   ├── REFACTORING_PROGRESS.md     # Progresso da refatoração
│   │   └── MORNING_REVIEW.md           # Reviews de desenvolvimento
│   ├── 📁 mobile/                      # Implementação mobile
│   │   └── MOBILE_PROGRESS.md          # Progresso mobile/PWA
│   ├── 📁 merge-history/               # Histórico de merges (arquivado)
│   │   ├── MERGE_ANALYSIS.md           # Análise de merge
│   │   ├── MERGE_GUIDE.md              # Guia de merge
│   │   ├── MERGE_STATUS.md             # Status de merge
│   │   ├── VERIFICATION_COMPLETE.md    # Verificação completa
│   │   └── FINAL_STATUS.md             # Status final
│   └── README.md                       # Índice de documentação
│
├── 📁 scripts/                         # Scripts de build/deploy
│   ├── run-local.bat                   # Servidor local (Windows)
│   ├── deploy-latest.bat               # Deploy automatizado
│   └── modularize.py                   # Script de modularização
│
├── 📁 tools/                           # Pipeline de arte (build-time, offline)
│   ├── cards.config.mjs                # Manifesto do deck + bosses + relics (prompts)
│   ├── generate.mjs                    # Gera arte via OpenAI/Gemini (keys via env)
│   ├── optimize.mjs                    # PNG → WebP (Chromium headless)
│   ├── compose.mjs                     # Embute a arte na moldura SVG do card
│   ├── README.md                       # Como rodar o pipeline
│   └── 📁 art/ + out/                  # Saída regenerável (git-ignored)
│
├── 📄 README.md                        # Documentação principal
├── 📄 SECURITY.md                      # Política de segurança
├── 📄 CONTRIBUTING.md                  # Guia de contribuição
├── 📄 LICENSE                          # Licença MIT
├── 📄 package.json                     # Dependências npm
├── 📄 package-lock.json                # Lock de versões
├── 📄 workbox-config.js                # Configuração Service Worker
├── 📄 netlify.toml                     # Configuração Netlify
└── 📄 .gitignore                       # Arquivos ignorados

```

---

## 📊 ESTATÍSTICAS DO PROJETO

### **Código JavaScript:**
- **Módulos ES6 importados por game.js:** game-state, game-events, game-shop, game-relics, game-sounds
- **Scripts clássicos pós-game.js (via window.*):** codex, adventure-run, in-game-tutorial
- **ES module standalone:** adventure-map (importa data/adventures.js)
- **Maior arquivo:** game.js (ES module)
- **Arquivos principais:**
  - `game.js` - Lógica principal (ES module)
  - `index.html` - Interface
  - `styles.css` - Estilos

### **Documentação:**
- **Total de arquivos:** 20 arquivos .md
- **Linhas totais:** 7,169 linhas
- **Categorias:** 7 (guides, architecture, releases, security, development, mobile, merge-history)
- **Estrutura:** Organizada e categorizada

### **Assets:**
- **Imagens:** 18 arquivos (WebP + fallback JPG)
- **Tamanho total:** ~9.5MB (otimizado)
- **Formato principal:** WebP (94% menor que JPEG)

### **PWA:**
- **Service Worker:** Workbox 7.0
- **Cache size:** 11.5MB (49 arquivos)
- **PWA Score:** 100/100
- **Offline:** ✅ Totalmente funcional

---

## 🏗️ ARQUITETURA MODULAR

### **Separação de Responsabilidades:**

**1. Núcleo (Core):**
- `game.js` - Lógica principal e combate (ES module)
- `audio-context.js` - Contexto Web Audio API
- `error-handler.js` - Tratamento global de erros
- `silent-logging.js` - Logging silencioso (carrega primeiro)
- `firebase-auth.js` - Autenticação

**2. Módulos (Modules):**
- `game-state.js` - Estado global (ES6, importado por game.js)
- `game-events.js` - Eventos do jogo (ES6)
- `game-shop.js` - Sistema de loja (ES6)
- `game-relics.js` - Sistema de relíquias (ES6)
- `game-sounds.js` - Efeitos sonoros (ES6, extraído de game.js)
- `adventure-map.js` - Mapa procedural do Adventure (ES6; `window.AdventureMap`)
- `adventure-run.js` - Orquestrador de run do Adventure (classic, após game.js; `window.AdventureRun`)
- `in-game-tutorial.js` - Tutorial interativo do Classic (classic, após game.js; `window.InGameTutorial`, extraído de game.js)

**3. Sistemas (Systems):**
- `achievements.js` - Conquistas
- `codex.js` - Enciclopédia do jogo (classic, após game.js)
- `leaderboard.js` - Placar global
- `music.js` - Sistema de música procedural
- `stats.js` - Estatísticas do jogador

**4. Utilitários (Utils):**
- `helpers.js` - Funções auxiliares
- `mobile-optimization.js` - Otimizações mobile/PWA
- `offline-storage.js` - IndexedDB para saves

**5. Dados (Data):**
- `game-data.js` - Dados estáticos (relics, shop, events)
- `adventures.js` - Adventure: `ACTS` + `ADVENTURES` por classe (motivation, opening, finalBoss, ending)
- `game-constants.js` - Constantes globais

**6. Modo Adventure (Slay-the-Spire style):**
- Mapa procedural ramificado (3 atos) gerado por run, com tipos de nó: combat, elite, event, shop/merchant, rest/campfire, treasure (alguns *cursed chests*), boss e final boss por classe.
- `adventure-run.js` reusa o engine existente via `window.drawRoom` / `window.checkGameState` (intercepção pela flag `game.adventureRun`), sem alterar o modo Classic.
- Arte ilustrada em `public/assets/cards/adventure/` (deck + bosses) e `public/assets/relics/`.

---

## 🎯 PRÓXIMAS MELHORIAS

### **Modularização Pendente:**

**Fase 2 - Próximos Módulos:**
1. ✅ **game-tutorial** - Extraído como `modules/in-game-tutorial.js` (classic script)
2. ✅ **game-sounds** - Extraído como `modules/game-sounds.js` (ES6)
3. ⏳ **game-cards.js** (~600 linhas) - Sistema de cartas
4. ⏳ **game-ui.js** (~800 linhas) - Interface do usuário
5. ⏳ **game-combat.js** (~1,200 linhas) - Sistema de combate

**Objetivo:** Continuar reduzindo o tamanho de game.js

### **Melhorias de Performance:**
- [ ] Lazy loading de módulos não-críticos
- [ ] Code splitting para módulos grandes
- [ ] Tree shaking de dependências não utilizadas
- [ ] Minificação e bundling para produção

### **Qualidade de Código:**
- [ ] Adicionar ESLint com configuração
- [ ] Adicionar Prettier para formatação
- [ ] Configurar pre-commit hooks
- [ ] Adicionar JSDoc em todos os módulos

---

## 📦 GESTÃO DE ASSETS

### **Estrutura de Assets:**
- **✅ `/public/assets/`** - Assets de produção (única fonte)
- **`/public/assets/cards/adventure/`** - 39 webp: 31 cartas do deck (monster 2-14, weapon 2-10, potion 2-10) + 8 retratos de boss (act1, act2, e um por classe)
- **`/public/assets/relics/`** - 51 ícones de relíquias ilustrados (webp), keyed por id de relíquia
- **❌ `/assets/`** - Removido (era duplicata)

### **Otimizações:**
- **WebP:** Todas as imagens em formato WebP (-94% tamanho)
- **Fallback:** JPG para navegadores antigos
- **Lazy Loading:** Carregamento sob demanda
- **Service Worker:** Cache inteligente de todos os assets

### **Convenção de Nomes:**
```
avatar-{class}.webp       # Avatares das classes
avatar-{class}.jpg        # Fallback JPG
dungeon-bg.webp           # Background principal
title-logo.webp           # Logo do jogo
icon-{size}.png           # PWA icons
favicon-*.svg             # Favicons
cards/adventure/{monster|weapon|potion}_{v}.webp  # Carta por tipo+valor
cards/adventure/boss_{act1|act2|<class>}.webp     # Retratos de boss
relics/relic_{id}.webp    # Ícones de relíquia
```

### **Pipeline de Arte (build-time, offline — `tools/`):**
A arte é gerada **uma vez na máquina do dev** e commitada; nada disso roda no site estático e nenhuma API key é embarcada.
1. `tools/cards.config.mjs` - Manifesto: prompts por carta/boss/relíquia + estilo.
2. `tools/generate.mjs` - Gera PNGs via **OpenAI** (`gpt-image-1`) ou **Gemini** (`gemini-2.5-flash-image`); keys lidas de env (`OPENAI_API_KEY` / `GEMINI_API_KEY`), **nunca** commitadas.
3. `tools/optimize.mjs` - Redimensiona/comprime PNG → WebP (Chromium headless via Playwright) para `public/assets/`.
4. `tools/compose.mjs` - Embute a arte na moldura SVG do card (saída auto-contida).

`tools/art/` e `tools/out/` são git-ignored (regeneráveis).

---

## 🔧 CONFIGURAÇÃO E BUILD

### **Dependências (package.json):**
```json
{
  "name": "dungeon-scoundrel",
  "version": "1.4.3",
  "devDependencies": {
    "workbox-cli": "^7.0.0"
  }
}
```

### **Scripts npm:**
- `npm run dev` - Servidor local (Python http.server)
- `npm run build:sw` - Gerar Service Worker (Workbox)
- `npm run deploy` - Deploy para Netlify

### **Workbox Configuration:**
- **Estratégia:** CacheFirst para assets, NetworkFirst para HTML
- **Cache name:** `dungeon-scoundrel-v1`
- **Max age:** 30 dias
- **Arquivos cached:** 49 arquivos (11.5MB)

---

## 🌐 DEPLOYMENT

### **Netlify:**
- **URL:** https://dungeonscoundrel.com
- **Branch:** `main`
- **Build command:** `npm run build:sw`
- **Publish directory:** `public/`
- **Auto-deploy:** ✅ Ativado

### **Headers de Segurança:**
```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

## 📝 CONVENÇÕES DE CÓDIGO

### **JavaScript:**
- **Estilo:** ES6+ (const/let, arrow functions, template literals)
- **Naming:**
  - `camelCase` para variáveis e funções
  - `PascalCase` para classes
  - `UPPER_CASE` para constantes
- **Módulos:** Exportar funções relevantes, evitar poluir namespace global

### **HTML:**
- **Indentação:** 4 espaços
- **Semântica:** Usar tags apropriadas (<section>, <article>)
- **Acessibilidade:** ARIA labels onde necessário

### **CSS:**
- **Naming:** BEM (Block__Element--Modifier)
- **Custom Properties:** Usar variáveis CSS para cores e valores
- **Mobile-first:** Media queries para desktop

---

## 🔗 LINKS ÚTEIS

- **Produção:** https://dungeonscoundrel.com
- **Local:** http://localhost:8080
- **GitHub:** https://github.com/ehgzao/DungeonScoundrel
- **Documentação:** [/docs](../README.md)
- **Roadmap Mobile:** [/docs/guides/MOBILE_ROADMAP.md](../guides/MOBILE_ROADMAP.md)

---

## 📅 INFORMAÇÕES DA VERSÃO

- **Versão atual:** v1.4.34 (asset cache-busting em index.html)
- **Última atualização deste doc:** 2026-06-30
- **Status:** ✅ Estrutura organizada e otimizada (+ modo Adventure)

---

**Made with ❤️ by [ehgzao](https://github.com/ehgzao)**

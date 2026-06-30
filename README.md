<div align="center">

<img width="1310" height="165" alt="Image" src="https://github.com/user-attachments/assets/de61f7a0-3c7a-4ae4-b621-2b8e532061c3" />


**A Dark Medieval Roguelike Card Game — now with two modes**

[![Netlify Status](https://api.netlify.com/api/v1/badges/6f6196d2-a8fd-451b-bb55-d57f2a5ad668/deploy-status)](https://app.netlify.com/projects/dungeonscoundrel/deploys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.5.0-blue.svg)](https://github.com/ehgzao/DungeonScoundrel/releases)
[![PWA](https://img.shields.io/badge/PWA-100-brightgreen.svg)](https://web.dev/progressive-web-apps/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[🎮 Play Now](https://dungeonscoundrel.com/) | [🛡️ Security](SECURITY.md) | [🤝 Contributing](CONTRIBUTING.md) | [🐛 Report Bug](https://github.com/ehgzao/DungeonScoundrel/issues)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Two Game Modes](#-two-game-modes)
- [Features](#-features)
- [How to Play](#-how-to-play)
- [Classes](#-classes)
- [Card Art Pipeline](#-card-art-pipeline)
- [Technologies](#-technologies)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Performance & PWA](#-performance--pwa)
- [Security](#-security)
- [Contributing](#-contributing)
- [Documentation](#-documentation)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🎯 About

**Dungeon Scoundrel** is a **progressive web app (PWA)** roguelike deck‑building card game. Fight monsters, equip weapons, drink potions and collect relics to survive the dark. It ships with **two distinct modes** that share one engine: the pure **Classic** run and the procedural, illustrated **Adventure** mode.

- **🃏 Card‑based combat** — damage = monster value − weapon value; perfect kills build combos
- **🔮 Progressive unlocks** — permanent upgrades and 6 unlockable heroes across runs
- **🏆 Deep meta** — 58 achievements and a per‑mode global leaderboard (rank by score *or* fastest clear)
- **🎵 Dynamic audio** — procedural Web Audio music with contextual themes
- **📱 Play anywhere** — desktop, mobile, tablet, and fully offline after first load

---

## 🎴 Two Game Modes

### ⚔️ Classic
The original Scoundrel run. One full deck — clear the whole dungeon, chamber by chamber, without your health hitting zero. Minibosses appear deep in the run, then a final boss. The corner **Merchant** lets you spend gold mid‑run. This is the pure‑skill baseline and is intentionally kept faithful to the original.

### 🗺️ Adventure
A Slay‑the‑Spire‑style descent layered on the same engine:

- **Procedural branching map** across 3 acts — choose your path node by node (hover any node for a tooltip).
- **Node types:** ⚔️ Battle · 💀 Elite (drops a relic) · ❓ Event (real choices) · 🏛️ Merchant · 🔥 Campfire · 🎁 Treasure · 👹 Boss · ☠️ Final Boss.
- **Illustrated deck** — every card is hand‑inked art; a coloured border + glyph tell you the type at a glance.
- **Difficulty = waves** per encounter: Easy 1 · Normal 2 · Hard 3 (deeper nodes also hit harder).
- **Deck‑building** — your run deck persists. Cull threats at campfires, buy/sharpen cards at the map merchant.
- **Risk/reward depth** — cursed chests (extra loot but a curse joins your deck), choice‑driven events, limited campfires.
- **Per‑class endgame** — each hero descends for their own reason and faces a **unique final boss + ending** tied to that motivation.

Pick a mode from the main menu. Class unlocks, achievements (except the mode‑exclusive ones) and the leaderboard all work across **both** modes.

---

## ✨ Features

### 🎮 Core
- ✅ **4 difficulties:** Easy, Normal, Hard, Endless
- ✅ **Full card deck:** Monsters (♠♣), Weapons (♦), Potions (♥), Specials (✨)
- ✅ **Combo system** — chain perfect kills for damage bonuses
- ✅ **Hold mechanic** — right‑click / long‑press to stash a card
- ✅ **Boss battles** — Classic minibosses + final boss; Adventure act bosses + per‑class finale

### 🗺️ Adventure depth
- ✅ Procedural map (fully connected, never impossible — a campfire before every boss, ≥1 shop per act, capped elites)
- ✅ Persistent run deck + deck‑building (cull / buy / sharpen)
- ✅ Choice events, cursed chests, curse cards
- ✅ Relic rewards from elites/treasure/bosses → build variety
- ✅ Six unique per‑class final bosses & endings

### 🎨 Art
- ✅ **31 illustrated deck cards** + **8 boss portraits** + **51 relic icons** — one cohesive dark dungeon‑synth woodcut style
- ✅ Generated **offline at build time** (the site never embeds an API key) — see [Card Art Pipeline](#-card-art-pipeline)

### 🔓 Progression & meta
- ✅ **6 classes** — one shared unlock system, satisfiable in either mode
- ✅ **53 relics** (51 illustrated) across 4 rarity tiers
- ✅ **58 achievements** — including per‑mode, per‑difficulty, speedrun and clear‑every‑hero
- ✅ **Global leaderboard** — separate Classic / Adventure boards, sortable by **Top Score** or **Fastest** clear (Firebase)

### 📱 Polish & platform
- 🌙 Dark medieval theme · 🎵 dynamic music · 🎨 particles/screen‑shake · ♿ ARIA + keyboard nav
- 🌐 **PWA** — installable, offline‑capable, auto‑update

---

## 🎮 How to Play

### Classic
1. **Objective:** clear the whole dungeon deck without your HP reaching 0.
2. **Each turn:** **⚔️ Enter Chamber** (draw 4 cards) or **🛡️ Evade** (send 3 cards to the bottom). You cannot Evade twice in a row.
3. **Clear the chamber:** use or discard all 4 cards to advance.

### Adventure
1. **Objective:** descend the map to your hero's own final boss and defeat it.
2. **Pick a node** each step (only connected nodes ahead are selectable). Combat plays out inside the node — across multiple waves on higher difficulty.
3. **Build between fights:** heal or cull at campfires, deck‑build at merchants, weigh cursed chests and event choices.

### Card types & combat (both modes)
- **Monsters** (♠♣) — click to fight. `Damage Taken = Monster Value − Weapon Value` (0 if your weapon is stronger).
- **Weapons** (♦) — click to equip (replaces current; weapons have durability).
- **Potions** (♥) — heal (limited uses per room).
- **Specials** (✨) — one‑time powerful effects.
- **Combo:** perfect kills (no damage taken) chain for bonus damage; breaks on damage or re‑equip.

---

## 👥 Classes

One unlock system, shared by both modes. Scoundrel is always available; the rest unlock from your lifetime stats.

| Class | Unlock Requirement | Passive | Active | Playstyle |
|-------|-------------------|---------|--------|-----------|
| 🎭 **Scoundrel** | Always unlocked | None | None | Pure‑skill baseline |
| 🛡️ **Knight** | Win on Easy | +5 HP, +1 durability | Shield Bash | Tanky, consistent |
| 🗡️ **Rogue** | Win on Normal | 2 hold slots, +1 gold/room | Shadow Strike | Flexible combos |
| 💃 **Dancer** | Win on Hard | Potions +HP, 2/room, +events | Healing Dance | Sustain |
| 💢 **Berserker** | Hard win + 5 bosses | Bloodlust at low HP | Rage Strike | High risk/reward |
| 📿 **Priest** | 20 relics + 10 events + 5 wins | Dodge chance, +potion HP | Purification | Safe, strategic |

Each hero also has a unique **Adventure** motivation, final boss and ending (see `public/src/js/data/adventures.js`).

---

## 🖌 Card Art Pipeline

The illustrated Adventure deck, boss portraits and relic icons are generated **offline, at build time** — the shipped static site **never contains an API key**.

```bash
# 1) generate raw PNGs (provider key from env only)
GEMINI_API_KEY=... node tools/generate.mjs --provider gemini
# (OpenAI also supported: OPENAI_API_KEY=... node tools/generate.mjs --provider openai)

# 2) optimize -> web-ready WebP under public/assets/
node tools/optimize.mjs --provider gemini --size 760 --ratio 0.706
```

- `tools/cards.config.mjs` — the manifest: deck cards, bosses and relic icons + the shared style preamble.
- `tools/generate.mjs` — OpenAI/Gemini image generation (`--dry-run`, `--skip-existing`, `--no-anchor`, `--match`).
- `tools/optimize.mjs` — headless‑canvas resize/crop → WebP (`--match`, `--outdir`).
- Keys are read from environment variables only; `tools/.gitignore` excludes raw art and `.env`.

---

## 🛠 Technologies

- **Frontend:** HTML5, CSS3 (custom properties, animations), **vanilla ES6+ JavaScript** (modular, no frameworks), Web Audio API.
- **PWA & performance:** Service Worker (Workbox), IndexedDB + localStorage, lazy loading, adaptive performance.
- **Backend & services:** Firebase Firestore (leaderboard + cloud saves), Firebase Auth (anonymous), EmailJS (bug reports), Netlify (hosting/CI/CD/CDN).
- **Build‑time art:** Node 18+ image‑gen pipeline (OpenAI / Gemini) — offline, never shipped.

---

## 🚀 Getting Started

### Prerequisites
- A modern browser; Node.js 18+ for development.

### Quick start
```bash
git clone https://github.com/ehgzao/DungeonScoundrel.git
cd DungeonScoundrel
npm install
npm run build:sw      # generate the Service Worker
npm run dev           # serves public/ at http://localhost:8080
```

### Alternative static servers
```bash
python -m http.server 8080 --directory public
npx serve public
php -S localhost:8080 -t public
```

---

## 💻 Development

### Project structure
```
DungeonScoundrel/
├── public/                       # Production site (served)
│   ├── index.html
│   ├── assets/
│   │   ├── images/               # Class avatars, backgrounds (WebP)
│   │   ├── icons/                # Favicons / PWA icons
│   │   ├── cards/adventure/      # 31 illustrated deck cards + 8 boss portraits
│   │   └── relics/               # 51 illustrated relic icons
│   └── src/
│       ├── js/
│       │   ├── game.js           # Main loop (type=module)
│       │   ├── modules/          # adventure-map, adventure-run, in-game-tutorial,
│       │   │                     #   game-combat/deck/shop/relics/events/classes/state, game-sounds
│       │   ├── systems/          # achievements, stats, leaderboard, music, codex
│       │   ├── data/             # game-data (relics/shop), adventures (per-class endgame)
│       │   ├── utils/            # helpers, mobile-optimization, offline-storage
│       │   ├── core/             # firebase-auth, audio-context, error-handler
│       │   └── config/           # game-constants, firebase config
│       └── styles/               # CSS
├── tools/                        # Build-time AI card-art pipeline (keys env-only)
├── docs/                         # Architecture, releases, security, performance docs
├── scripts/                      # Build / dev helper scripts
├── firestore.rules · firebase.json · netlify.toml · workbox-config.js
└── README · SECURITY · CONTRIBUTING · BACKLOG · SYSTEM_MAP · LICENSE
```

> **Architecture note:** `game.js` is an ES module and exposes shared functions on `window.*`. Classic scripts loaded **after** it (`adventure-run.js`, `in-game-tutorial.js`, `codex.js`, …) consume those globals. Keep this load order in mind when moving code across the module/classic boundary.

### npm scripts
```bash
npm run dev        # local dev server (public/)
npm run build:sw   # generate the Service Worker
npm run deploy     # deploy to Netlify (production)
```

### Conventions
- ES6+, `const` over `let`, descriptive names, JSDoc on functions.
- One responsibility per module; clear exports / `window.*` surface.
- Bump the `?v=` cache‑bust in `index.html` when you change shipped JS/CSS.
- Branch → PR → CI (Netlify deploy preview) → squash‑merge.

---

## 📊 Performance & PWA

- **Installable PWA** (100/100 PWA score) — add to home screen on any device.
- **Offline**: fully playable after first load (Service Worker caches assets).
- **Fast**: lazy‑loaded images, WebP everywhere, adaptive performance for low‑end devices.
- See [docs/PERFORMANCE_MAP.md](docs/PERFORMANCE_MAP.md) and [docs/LIGHTHOUSE_BACKLOG.md](docs/LIGHTHOUSE_BACKLOG.md).

---

## 🔒 Security

Review the [Security Policy](SECURITY.md) for reporting and supported versions. Highlights:

- ✅ HTTPS‑only (Netlify), CSP headers
- ✅ Firestore security rules; anonymous auth only
- ✅ Input sanitization + output escaping on all shared/user data (leaderboard, names, profile)
- ✅ No secrets in the shipped site — image‑gen keys are build‑time/env only

**Found a vulnerability?** Report it privately via [GitHub Security Advisories](https://github.com/ehgzao/DungeonScoundrel/security/advisories/new).

---

## 🤝 Contributing

Contributions of code, art, music and docs are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

**Good first areas:** new relics/events, Adventure balance, UI/UX polish, localization, accessibility, additional card/boss art.

---

## 📚 Documentation

- [SECURITY.md](SECURITY.md) — security policy & reporting
- [CONTRIBUTING.md](CONTRIBUTING.md) — contribution guide
- [BACKLOG.md](BACKLOG.md) — roadmap & shirt‑sized backlog (Adventure, art, QA)
- [SYSTEM_MAP.md](SYSTEM_MAP.md) — high‑level system map
- [docs/architecture/](docs/architecture/) — modules, structure, dependency maps
- [docs/releases/CHANGELOG.md](docs/releases/CHANGELOG.md) — version history
- [docs/security/SECURITY_AUDIT.md](docs/security/SECURITY_AUDIT.md) — security audit
- [docs/guides/MOBILE_ROADMAP.md](docs/guides/MOBILE_ROADMAP.md) — mobile plan

---

## 🗺️ Roadmap

### ✅ 1.5.0 — Adventure Update (current)
- ✅ Adventure mode: procedural map, illustrated deck, deck‑building, waves‑by‑difficulty
- ✅ Per‑class final bosses & endings; relic rewards; choice events; cursed chests
- ✅ Full illustrated art set (deck + bosses + relics), built offline
- ✅ Mode‑aware achievements & dual leaderboards (score / fastest)
- ✅ Classic and Adventure tutorials + updated Rules Reference
- ✅ Full cross‑system QA pass (state, logic, security, UI)

### 🔄 Next
- ⏳ Interactive (step‑by‑step) Adventure walkthrough
- ⏳ More events & relics; per‑class node weighting
- ⏳ Mobile‑portrait dedicated layout; tap tooltips
- ⏳ Additional languages

### 🔮 Longer term
- Native apps (Capacitor), daily challenges, more heroes, mod/level‑editor support.

---

## 📜 License

MIT — see [LICENSE](LICENSE). Copyright (c) 2025 ehgzao.

---

## 🙏 Acknowledgments

- **Inspiration:** Balatro (polish), Slay the Spire (run structure), Inscryption (atmosphere).
- **Fonts:** Cinzel, Cinzel Decorative, MedievalSharp (Google Fonts).
- **Art:** class avatars & backgrounds via Midjourney; the illustrated Adventure deck, boss portraits and relic icons generated with Google **Gemini** (`gemini-2.5-flash-image`), composed offline by the `tools/` pipeline.
- **Tech:** Firebase, Netlify, EmailJS, Workbox, Web Audio API.

---

<div align="center">

**Made with ❤️ by [ehgzao](https://github.com/ehgzao)** · ⭐ Star the repo if you enjoy it!

[🎮 Play Now](https://dungeonscoundrel.com/) | [🛡️ Security](SECURITY.md) | [🐛 Report Issue](https://github.com/ehgzao/DungeonScoundrel/issues)

**Version 1.5.0 — Adventure Update** · PWA 100/100 · Offline Ready

*Free and open source. No ads, no tracking, no microtransactions.*

</div>

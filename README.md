<div align="center">
  
<img width="1310" height="165" alt="Image" src="https://github.com/user-attachments/assets/de61f7a0-3c7a-4ae4-b621-2b8e532061c3" />


**A Dark Medieval Roguelike Card Game**

[![Netlify Status](https://api.netlify.com/api/v1/badges/6f6196d2-a8fd-451b-bb55-d57f2a5ad668/deploy-status)](https://app.netlify.com/projects/dungeonscoundrel/deploys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.4.3-blue.svg)](https://github.com/ehgzao/DungeonScoundrel/releases)
[![PWA](https://img.shields.io/badge/PWA-100-brightgreen.svg)](https://web.dev/progressive-web-apps/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[🎮 Play Now](https://dungeonscoundrel.com/) | [📱 Mobile Roadmap](docs/guides/MOBILE_ROADMAP.md) | [🛡️ Security](SECURITY.md) | [🐛 Report Bug](https://github.com/ehgzao/DungeonScoundrel/issues)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [NEW: Mobile & PWA](#-new-mobile--pwa)
- [How to Play](#-how-to-play)
- [Classes](#-classes)
- [Technologies](#-technologies)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Performance](#-performance)
- [Security](#-security)
- [Contributing](#-contributing)
- [Documentation](#-documentation)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🎯 About

**Dungeon Scoundrel** is a **progressive web app (PWA)** roguelike deck-building card game where you navigate through treacherous dungeons using a standard deck of cards. Fight monsters, collect weapons, use potions, and unlock powerful relics to survive the depths!

### 🎲 Game Concept

- **🃏 Card-Based Combat**: Use a deck of 50 cards (Monsters, Weapons, Potions, Specials)
- **⚔️ Strategic Gameplay**: Manage resources, build combos, and choose when to fight or flee
- **🔮 Progressive Unlocks**: Earn permanent upgrades across multiple runs
- **👥 6 Unique Classes**: Each with distinct playstyles and abilities
- **🏆 Achievement System**: 50 achievements to unlock
- **🎵 Dynamic Music**: Procedural soundtrack with multiple themes
- **📱 Play Anywhere**: Desktop, mobile, tablet - even offline!

---

## ✨ Features

### 🎮 Core Gameplay
- ✅ **4 Difficulty Levels**: Easy, Normal, Hard, Endless
- ✅ **50-Card Deck System**: Monsters (♠♣), Weapons (♦), Potions (♥), Specials (✨)
- ✅ **Boss Battles**: Epic fights every 10 rooms
- ✅ **Combo System**: Chain perfect kills for damage bonuses
- ✅ **Hold Mechanic**: Strategic card management
- ✅ **Events & Shops**: Random encounters with meaningful choices

### 🎭 Classes (6 Total)
- **Scoundrel** 🎭 - Pure skill, no abilities (always unlocked)
- **Knight** 🛡️ - Tank with Shield Bash and +5 HP
- **Rogue** 🗡️ - Double hold slots, Shadow Strike
- **Dancer** 💃 - Healing specialist with extra luck
- **Berserker** 💢 - High risk/reward with Bloodlust
- **Priest** 📿 - Divine protection and Purification

### 🔓 Progression
- **22 Permanent Unlocks**: Start with bonuses each run
- **53 Relics**: Passive and active effects across 4 rarity tiers
- **50 Achievements**: Bronze, Silver, Gold, Platinum
- **Global Leaderboard**: Firebase-powered rankings

### 🎨 Polish & UX
- 🌙 **Dark Medieval Theme** - Pixel-art inspired UI
- 🎵 **Dynamic Music System** - 5 contextual tracks (menu, gameplay, boss, victory, defeat)
- 🎨 **Visual Effects** - Particles, screen shake, animations
- ♿ **Accessibility** - ARIA labels, keyboard navigation
- 📱 **Mobile-Optimized** - Touch controls, haptic feedback
- 🌐 **PWA Complete** - Install as app, offline capable

---

## 🆕 NEW: Mobile & PWA

### **Version 1.4.3 - Lighthouse Performance Update!**

#### ✅ Progressive Web App (PWA)
- **Install as App**: Add to home screen on any device
- **Offline Mode**: Play without internet after first load
- **Service Worker**: Smart caching of all assets (11.5MB)
- **Auto-Updates**: Notifies when new version available
- **PWA Score**: 100/100 on Lighthouse

#### 📱 Mobile Optimizations
- **Lazy Loading**: Images load on-demand (-94% initial load)
- **Adaptive Performance**: Detects device capabilities automatically
- **Reduced Animations**: Optimized for low-end devices
- **Touch-Friendly**: Long-press to hold, tap to play
- **Responsive Layout**: Perfect on phones, tablets, desktops

#### 💾 Enhanced Storage
- **IndexedDB**: Robust save system with backup/restore
- **LocalStorage Fallback**: Works everywhere
- **Cloud Sync**: Optional Firebase integration
- **Multiple Saves**: Store progress safely

#### 📊 Performance Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Assets Size** | 9.5MB | 550KB | **-94%** 🎉 |
| **Load Time** | ~5s | ~2s | **-60%** 🚀 |
| **FPS (Mobile)** | 30 | 60 | **+100%** ⚡ |
| **PWA Score** | 60 | 100 | **+40** ✨ |
| **Offline** | ❌ | ✅ | **Working!** 💯 |

See [Mobile Roadmap](docs/guides/MOBILE_ROADMAP.md) for complete details.

---

## 🎮 How to Play

### Basic Rules

1. **🎯 Objective**: Clear all 50 cards without dying (HP ≤ 0)

2. **🏃 Actions Each Turn**:
   - **Enter Dungeon** (Draw 4 cards) OR
   - **Avoid Dungeon** (Discard 3 cards from top)
   - ⚠️ Cannot avoid twice in a row (unless you have Four Leaf Clover)

3. **🃏 Card Types**:
   - **Monsters** (♠ Spades, ♣ Clubs) - Enemies to fight
   - **Weapons** (♦ Diamonds) - Equip to deal damage
   - **Potions** (♥ Hearts) - Heal HP (1 per room limit)
   - **Specials** (✨) - Powerful one-time effects

4. **⚔️ Combat**:
   ```
   Damage Taken = Monster Value - Your Weapon Value
   ```
   - Perfect kill (no damage) = Build combo!
   - Taking damage = Reset combo to 0
   - No weapon = Take full monster damage

5. **🔥 Combo System**:
   - Chain perfect kills for bonus damage
   - 2x combo = +1 damage, 3x = +2 damage, etc.
   - Breaks when taking damage or equipping new weapon
   - Higher combos = Better score multiplier

### Advanced Mechanics

- **Hold System**: Save cards for later (Right-click or long-press on mobile)
- **Weapon Durability**: Weapons break after X uses (varies by difficulty)
- **Boss Rooms**: Every 10th room, face powerful multi-HP bosses
- **Events**: Random encounters with risk/reward choices
- **Shop**: Buy upgrades with gold (costs score penalty!)
- **Relics**: Passive and active effects that stack

---

## 👥 Classes

| Class | Unlock Requirement | Passive Ability | Active Ability | Playstyle |
|-------|-------------------|-----------------|----------------|-----------|
| 🎭 **Scoundrel** | Always unlocked | None | None | Pure skill baseline |
| 🛡️ **Knight** | Win on Easy | +5 HP, +1 Durability | Shield Bash (3 CD) | Tanky and consistent |
| 🗡️ **Rogue** | Win on Normal | 2 Hold slots, +1 Gold/room | Shadow Strike (4 CD) | Flexible combos |
| 💃 **Dancer** | Win on Hard | Potions +3 HP, 2 uses/room, +15% events | Healing Dance (5 CD) | Sustain specialist |
| 💢 **Berserker** | Hard + 5 bosses | Bloodlust: +dmg at low HP | Rage Strike (4 CD) | High risk/reward |
| 📿 **Priest** | 20 relics + 10 events + 5 wins | 15% dodge, Potions +2 HP | Purification (6 CD) | Safe and strategic |

---

## 🛠 Technologies

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom properties, animations, responsive design
- **Vanilla JavaScript ES6+** - Modular architecture, no frameworks
- **Web Audio API** - Procedural sound effects and music

### PWA & Performance
- **Service Workers** - Workbox 7.0 for smart caching
- **IndexedDB** - Robust client-side database
- **Lazy Loading** - Progressive image loading
- **Adaptive Performance** - Device-specific optimizations

### Backend & Services
- **Firebase Firestore** - Leaderboard and cloud saves
- **Firebase Auth** - Anonymous authentication
- **EmailJS** - Bug reporting system
- **Netlify** - Hosting, CI/CD, CDN

### Tools & Build
- **npm** - Package management
- **Workbox CLI** - Service Worker generation
- **Git** - Version control
- **ESLint** (recommended) - Code quality

---

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js 14+ (for development)
- Internet connection (initial load only, then works offline!)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/ehgzao/DungeonScoundrel.git
   cd DungeonScoundrel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Generate Service Worker**
   ```bash
   npm run build:sw
   ```

4. **Run locally**
   ```bash
   npm run dev
   # Opens at http://localhost:8080
   ```

5. **Play!**
   - Desktop: Open in browser
   - Mobile: Add to home screen for app-like experience

### Alternative: Static Server

```bash
# Python
python -m http.server 8080

# Node.js
npx serve public

# PHP
php -S localhost:8080 -t public
```

---

## 💻 Development

### Project Structure

```
DungeonScoundrel/
├── public/                    # Production files (served)
│   ├── index.html            # Main game file
│   ├── assets/               # Images, icons
│   │   ├── images/           # Avatars, backgrounds (WebP optimized)
│   │   └── icons/            # Favicons
│   ├── src/
│   │   ├── js/
│   │   │   ├── modules/      # Game modules (state, shop, relics, events)
│   │   │   ├── systems/      # Game systems (achievements, stats, music)
│   │   │   ├── utils/        # Utilities (helpers, mobile-optimization, offline-storage)
│   │   │   ├── data/         # Game data (relics, shop items)
│   │   │   └── core/         # Core systems (Firebase, audio, errors)
│   │   ├── css/              # Stylesheets
│   │   └── config/           # Firebase configuration
│   ├── sw.js                 # Service Worker (generated)
│   └── site.webmanifest      # PWA manifest
├── docs/                      # Project documentation
│   ├── guides/               # Roadmaps and planning
│   ├── architecture/         # Technical structure
│   ├── releases/             # Changelog and releases
│   ├── security/             # Security audits
│   ├── development/          # Dev process
│   ├── mobile/               # Mobile implementation
│   └── merge-history/        # Archived merge docs
├── scripts/                   # Build and deploy scripts
├── package.json              # npm configuration
├── workbox-config.js         # Service Worker config
├── SECURITY.md               # Security policy (245 lines)
├── README.md                 # This file
└── LICENSE                   # MIT License
```

### npm Scripts

```bash
npm run dev          # Start local development server
npm run build:sw     # Generate Service Worker
npm run deploy       # Deploy to Netlify (production)
```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Code in `public/` directory
   - Test in multiple browsers
   - Check mobile responsiveness

3. **Test thoroughly**
   - All difficulty levels
   - All classes and abilities
   - Mobile/desktop compatibility
   - Offline functionality
   - Achievement unlocking

4. **Commit with meaningful messages**
   ```bash
   git commit -m "feat: Add Lucky Horseshoe relic"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style Guide

- **JavaScript**: ES6+, `const` over `let`, descriptive names
- **HTML**: Semantic markup, ARIA labels
- **CSS**: BEM naming, CSS custom properties
- **Comments**: JSDoc for functions, explain complex logic
- **Modules**: One responsibility per file, clear exports

---

## 📊 Performance

### Current Metrics (v1.4.3)

#### Desktop
- **Load Time**: < 2s (4G connection)
- **FPS**: 60fps constant
- **Lighthouse Score**: 95/100
  - Performance: 92
  - Accessibility: 98
  - Best Practices: 95
  - SEO: 97
  - **PWA: 100** ⭐

#### Mobile
- **Load Time**: ~2s (4G), instant after cache
- **FPS**: 60fps on mid-range devices
- **Battery**: Optimized (reduced animations on low-end)
- **Data Usage**: 550KB initial, 0KB after cache

#### Offline
- ✅ **100% functional** after first load
- ✅ Service Worker caches 49 files (11.5MB)
- ✅ All game features work offline
- ✅ Leaderboard syncs when online

### Optimization Techniques

- **Lazy Loading**: Images load on-demand
- **WebP Format**: 94% smaller than JPEG
- **Code Splitting**: Modular architecture
- **Adaptive Performance**: Device detection
- **Smart Caching**: Workbox strategies
- **Reduced Animations**: Mobile/low-end optimization

See [Mobile Progress Report](docs/mobile/MOBILE_PROGRESS.md) for detailed metrics.

---

## 🔒 Security

We take security seriously. Please review our [Security Policy](SECURITY.md) for:

- **Supported Versions**: Which versions receive security updates
- **Reporting Vulnerabilities**: How to report security issues privately
- **Response Timeline**: What to expect when reporting
- **Security Features**: Built-in protections
- **Hall of Fame**: Contributors who helped secure the game

### Quick Security Tips

- ✅ HTTPS-only (enforced by Netlify)
- ✅ Content Security Policy headers
- ✅ Firebase security rules
- ✅ Input sanitization
- ✅ No sensitive data in localStorage
- ✅ Anonymous authentication only

**Found a vulnerability?** Please report it privately via [GitHub Security Advisories](https://github.com/ehgzao/DungeonScoundrel/security/advisories/new).

---

## 🤝 Contributing

We love contributions! Whether it's code, art, music, or documentation - all help is welcome.

### Quick Start for Contributors

1. **Fork** the repository
2. **Clone** your fork
3. **Create** a feature branch
4. **Make** your changes
5. **Test** thoroughly
6. **Commit** with clear messages
7. **Push** to your fork
8. **Open** a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Areas We Need Help

- 🎨 **UI/UX Design**: Visual improvements, animations
- 🎵 **Music & Sound**: Additional tracks, SFX variations
- 🌍 **Localization**: Translate to other languages
- 🐛 **Bug Fixes**: Check [open issues](https://github.com/ehgzao/DungeonScoundrel/issues)
- ⚡ **Performance**: Optimize code and assets
- 📚 **Documentation**: Tutorials, guides, API docs
- 🎮 **Game Design**: New relics, classes, mechanics
- 🧪 **Testing**: QA on different devices

---

## 📚 Documentation

### Main Docs
- **[README.md](README.md)** - This file (overview and setup)
- **[SECURITY.md](SECURITY.md)** - Security policy and reporting
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines
- **[LICENSE](LICENSE)** - MIT License

### Mobile & PWA
- **[Mobile Roadmap](docs/guides/MOBILE_ROADMAP.md)** - Complete mobile implementation guide (1308 lines)
- **[Mobile Progress](docs/mobile/MOBILE_PROGRESS.md)** - Phase 1 tracking (Weeks 1-2 complete)
- **[Merge Analysis](docs/merge-history/MERGE_ANALYSIS.md)** - Code review and compatibility analysis
- **[Merge Guide](docs/merge-history/MERGE_GUIDE.md)** - Git workflow for mobile branch

### Development
- **[CHANGELOG.md](docs/releases/CHANGELOG.md)** - Version history and changes
- **[BACKLOG_PRIORIZADO.md](docs/guides/BACKLOG_PRIORIZADO.md)** - Prioritized feature backlog
- **[MODULES.md](docs/architecture/MODULES.md)** - Module architecture documentation

**Total Documentation**: 4100+ lines across 11 files

---

## 🗺️ Roadmap

### ✅ Version 1.4.3 (Current - COMPLETE)
- ✅ Mobile PWA implementation (Phase 1)
- ✅ Service Worker and offline mode
- ✅ IndexedDB for robust saves
- ✅ Performance optimizations (60 FPS mobile, -60% load time)
- ✅ Cloud saves working
- ✅ Security audit and improvements

### 🔄 Version 1.5.0 (Next - Planned)
- ⏳ Additional language support
- ⏳ Advanced tutorial for experienced players
- ⏳ Tutorial replay option in menu
- ⏳ Touch-friendly UI improvements
- ⏳ Mobile tooltips (tap instead of hover)

### 📱 Version 2.0 (Future - Q1 2026)
- [ ] Native mobile apps (Capacitor)
- [ ] iOS App Store release
- [ ] Google Play Store release
- [ ] In-App Purchases (remove ads, starter packs)
- [ ] Push notifications (daily rewards)
- [ ] Native features (Game Center, Google Play Games)

### 🎮 Version 2.5 (Future - Q2 2026)
- [ ] Multiplayer mode (async PvP)
- [ ] Daily challenges with leaderboard
- [ ] Seasonal events
- [ ] New class: Mage 🧙
- [ ] More relics (70 total)
- [ ] Card crafting system

### 🔧 Version 3.0 (Long-term Vision)
- [ ] Mod support (custom cards, relics)
- [ ] Level editor (community dungeons)
- [ ] Steam release (desktop app)
- [ ] Achievements via Steam/Epic
- [ ] Cloud save sync across platforms
- [ ] Localization (10+ languages)

See [Mobile Roadmap](docs/guides/MOBILE_ROADMAP.md) for detailed Phase 2 planning.

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License - Copyright (c) 2025 ehgzao

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

[Full license text in LICENSE file]
```

---

## 🙏 Acknowledgments

### Inspiration
- **Balatro** - UI/UX design and visual polish
- **Slay the Spire** - Roguelike deck-building mechanics
- **Inscryption** - Card game innovation and atmosphere

### Assets
- **Google Fonts** - Cinzel, Cinzel Decorative, MedievalSharp
- **AI-Generated Art** - Class avatars and background (via Midjourney)
- **Custom Pixel Art** - UI elements and icons

### Technologies
- **Firebase** - Backend as a Service
- **Netlify** - Hosting and CI/CD
- **EmailJS** - Email integration
- **Workbox** - PWA toolkit by Google
- **Web Audio API** - Procedural audio synthesis

### Community
- All contributors and playtesters
- The roguelike community on Reddit
- Open source maintainers
- Early access players who provided feedback

---

## 📞 Contact & Support

### Play & Connect
- **🌐 Play Now**: [dungeonscoundrel.com](https://dungeonscoundrel.com/)
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/ehgzao/DungeonScoundrel/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/ehgzao/DungeonScoundrel/discussions)
- **📧 Email**: hello@dungeonscoundrel.com (or use in-game bug report)

### Developer
- **👨‍💻 GitHub**: [@ehgzao](https://github.com/ehgzao)
- **🔗 Repository**: [DungeonScoundrel](https://github.com/ehgzao/DungeonScoundrel)

### Resources
- **📚 Full Documentation**: [docs/](docs/)
- **🛡️ Security Policy**: [SECURITY.md](SECURITY.md)
- **🛡️ Security Audit**: [SECURITY_AUDIT.md](docs/security/SECURITY_AUDIT.md)
- **🗺️ Mobile Roadmap**: [MOBILE_ROADMAP.md](docs/guides/MOBILE_ROADMAP.md)
- **📝 Changelog**: [CHANGELOG.md](docs/releases/CHANGELOG.md)

---

## 🎯 Quick Links

| Resource | Description |
|----------|-------------|
| [🎮 Play Game](https://dungeonscoundrel.com/) | Start playing now (PWA, works offline!) |
| [📱 Mobile Guide](docs/guides/MOBILE_ROADMAP.md) | Complete mobile implementation roadmap |
| [🛡️ Security](SECURITY.md) | Report vulnerabilities, security policy |
| [🐛 Report Bug](https://github.com/ehgzao/DungeonScoundrel/issues/new) | Found a bug? Let us know |
| [✨ Request Feature](https://github.com/ehgzao/DungeonScoundrel/issues/new) | Have an idea? Share it |
| [📖 Documentation](docs/) | Read all docs (organized by category) |
| [🤝 Contributing](CONTRIBUTING.md) | Join the development |
| [📜 License](LICENSE) | MIT License details |

---

<div align="center">

**Made with ❤️ by [ehgzao](https://github.com/ehgzao)**

⭐ **Star this repo if you enjoy the game!** ⭐

[![Star on GitHub](https://img.shields.io/github/stars/ehgzao/DungeonScoundrel?style=social)](https://github.com/ehgzao/DungeonScoundrel)
[![Fork on GitHub](https://img.shields.io/github/forks/ehgzao/DungeonScoundrel?style=social)](https://github.com/ehgzao/DungeonScoundrel/fork)

[🎮 Play Now](https://dungeonscoundrel.com/) | [📱 Mobile Roadmap](docs/guides/MOBILE_ROADMAP.md) | [🛡️ Security](SECURITY.md) | [🐛 Report Issue](https://github.com/ehgzao/DungeonScoundrel/issues)

**Version 1.4.3** | **PWA Score: 100/100** | **Offline Ready** | **Lighthouse Optimized**

---

*Dungeon Scoundrel is a free, open-source game. No ads, no tracking, no microtransactions.*

</div>

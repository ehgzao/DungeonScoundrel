# 🎮 Dungeon Scoundrel

<div align="center">

![Dungeon Scoundrel Logo](assets/title-logo.png)

**A Roguelike Card Game Adventure**

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://dungeonscoundrel.netlify.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)](https://github.com/ehgzao/DungeonScoundrel/releases)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[🎮 Play Now](https://dungeonscoundrel.netlify.app/) | [📖 Documentation](docs/) | [🐛 Report Bug](https://github.com/ehgzao/DungeonScoundrel/issues) | [✨ Request Feature](https://github.com/ehgzao/DungeonScoundrel/issues)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [How to Play](#-how-to-play)
- [Classes](#-classes)
- [Technologies](#-technologies)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🎯 About

**Dungeon Scoundrel** is a roguelike deck-building card game where you navigate through treacherous dungeons using a standard deck of cards. Fight monsters, collect weapons, use potions, and unlock powerful relics to survive the depths!

### 🎲 Game Concept

- **🃏 Card-Based Combat**: Use a deck of 50 cards (Monsters, Weapons, Potions, Specials)
- **⚔️ Strategic Gameplay**: Manage resources, build combos, and choose when to fight or flee
- **🔮 Progressive Unlocks**: Earn permanent upgrades across multiple runs
- **👥 6 Unique Classes**: Each with distinct playstyles and abilities
- **🏆 Achievement System**: 50 achievements to unlock
- **🎵 Original Music**: Immersive soundtrack with multiple themes

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
- **Scoundrel** 🎭 - Pure skill, no abilities
- **Knight** 🛡️ - Tanky with Shield Bash
- **Rogue** 🗡️ - Double hold, Shadow Strike
- **Dancer** 💃 - Healing specialist, extra luck
- **Berserker** 💢 - High risk/reward, Bloodlust passive
- **Priest** 📿 - Divine protection, Purification ability

### 🔓 Progression
- **22 Permanent Unlocks**: Start with bonuses each run
- **53 Relics**: Passive and active effects
- **50 Achievements**: Bronze, Silver, Gold, Platinum tiers
- **Leaderboard**: Firebase-powered global rankings

### 🎨 Polish
- 🌙 Beautiful pixel-art inspired UI
- 🎵 Dynamic music system (menu, gameplay, boss, victory, defeat)
- 🎨 Particle effects and screen shake
- 📱 Mobile-friendly with haptic feedback
- ♿ Accessibility features (ARIA labels, keyboard navigation)
- 🌐 PWA-ready (offline capable)

---

## 🎮 How to Play

### Basic Rules

1. **🎯 Objective**: Clear all cards from the deck without dying (HP ≤ 0)

2. **🏃 Actions Each Turn**:
   - **Enter Dungeon** (Draw 4 cards) OR
   - **Avoid Dungeon** (Discard 3 cards from top)
   - ⚠️ Cannot avoid twice in a row (unless you have Four Leaf Clover relic)

3. **🃏 Card Types**:
   - **Monsters** (♠ Spades, ♣ Clubs): Fight them with weapons
   - **Weapons** (♦ Diamonds): Equip to deal damage
   - **Potions** (♥ Hearts): Heal HP (1 per room limit)
   - **Specials** (✨): Powerful one-time effects

4. **⚔️ Combat**:
   ```
   Damage Taken = Monster Value - Your Weapon Value
   ```
   - Perfect kill (no damage) = Build combo!
   - Taking damage = Reset combo
   - No weapon = Take full damage

5. **🔥 Combo System**:
   - Chain perfect kills: 2x combo = +1 damage, 3x = +2, etc.
   - Breaks when taking damage or equipping new weapon
   - Higher combos = Better score

### Advanced Mechanics

- **Hold System**: Save cards for later (Right-click or long-press)
- **Weapon Durability**: Weapons break after X uses (difficulty-dependent)
- **Boss Rooms**: Every 10th room, face powerful bosses with multiple HP
- **Events**: Random encounters with choices (heal, gold, relics, etc.)
- **Shop**: Buy upgrades with gold (costs score penalty!)

---

## 👥 Classes

| Class | Unlock | Passive | Active | Playstyle |
|-------|--------|---------|--------|-----------|
| 🎭 **Scoundrel** | Always | None | None | Baseline, pure skill |
| 🛡️ **Knight** | Win on Easy | +5 HP, +1 Durability | Shield Bash (3 cooldown) | Tank, consistent |
| 🗡️ **Rogue** | Win on Normal | Hold 2 cards, +1 Gold/room | Shadow Strike (4 cooldown) | Flexible, combo-safe |
| 💃 **Dancer** | Win on Hard | Potions +3 HP, 2 uses/room, +15% events | Healing Dance (5 cooldown) | Sustain, luck |
| 💢 **Berserker** | Hard + 5 bosses | Bloodlust (+1/+2/+3 damage at low HP) | Rage Strike (4 cooldown) | High risk/reward |
| 📿 **Priest** | 20 relics + 10 events + 5 wins | 15% dodge, Potions +2 HP, +2 Max HP | Purification (6 cooldown) | Strategic, safe |

---

## 🛠 Technologies

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom variables, animations, responsive design
- **Vanilla JavaScript** - No frameworks, pure performance

### Backend & Services
- **Firebase Firestore** - Leaderboard database
- **Firebase Auth** - Anonymous authentication
- **EmailJS** - Bug reporting system
- **Netlify** - Hosting and CI/CD

### Audio
- **Web Audio API** - Procedural sound effects
- **Dynamic Music System** - Context-aware soundtrack

### Tools & Build
- **Git** - Version control
- **Netlify CLI** - Deployment
- **ESLint** (recommended) - Code quality

---

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for leaderboard features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ehgzao/DungeonScoundrel.git
   cd DungeonScoundrel
   ```

2. **Open locally**
   ```bash
   # Simple HTTP server (Python)
   python -m http.server 8080

   # OR using Node.js
   npx serve .
   
   # OR just open index.html in browser (some features may not work)
   ```

3. **Visit**
   ```
   http://localhost:8080
   ```

### Configuration

#### Firebase Setup (Optional - for leaderboard)

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Enable Anonymous Authentication
4. Copy your config to `src/config/firebase-config.js`:

```javascript
// src/config/firebase-config.js
window.__firebase_config = JSON.stringify({
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
});
```

5. Add Firestore security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/public/data/{collection}/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 💻 Development

### Project Structure
```
DungeonScoundrel/
├── assets/              # Images, icons
│   ├── avatar-*.jpg     # Class avatars
│   ├── dungeon-bg.jpg   # Background
│   └── title-logo.png   # Game logo
├── docs/                # Documentation
│   ├── guides/          # How-to guides
│   ├── systems/         # System documentation
│   └── development/     # Dev notes
├── src/
│   ├── config/          # Firebase config
│   └── styles/          # CSS files
├── index.html           # Main game file (437 KB)
├── README.md            # This file
├── CHANGELOG.md         # Version history
├── CONTRIBUTING.md      # Contribution guide
├── LICENSE              # MIT License
└── netlify.toml         # Netlify config
```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Edit `index.html` for game logic
   - Edit `src/styles/styles.css` for styling
   - Test locally

3. **Test thoroughly**
   - Test all difficulty levels
   - Test all classes
   - Check mobile responsiveness
   - Verify achievements unlock correctly

4. **Commit with meaningful messages**
   ```bash
   git commit -m "feat: Add new relic - Lucky Horseshoe"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style Guide

- **JavaScript**: Use ES6+ features, prefer `const`, descriptive names
- **HTML**: Semantic markup, accessibility attributes
- **CSS**: Use CSS variables, mobile-first approach
- **Comments**: Document complex logic, use JSDoc for functions

---

## 🚢 Deployment

### Automated Deployment (Netlify)

Netlify automatically deploys on push to `main` branch.

**Manual Deploy**:
```bash
# Using deployment script
./deploy-latest.bat

# OR using Netlify CLI
netlify deploy --prod
```

### Build Optimization (Recommended)

```bash
# Minify HTML
html-minifier --collapse-whitespace --remove-comments index.html -o dist/index.html

# Compress images to WebP
cwebp -q 85 assets/*.jpg -o assets/*.webp

# Test production build
netlify dev
```

---

## 🤝 Contributing

We love contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Quick Start for Contributors

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Areas We Need Help

- 🎨 **UI/UX Design**: Improve visual polish
- 🎵 **Music**: Additional tracks or sound effects
- 🌍 **Localization**: Translate to other languages
- 🐛 **Bug Fixes**: Check [Issues](https://github.com/ehgzao/DungeonScoundrel/issues)
- ⚡ **Performance**: Optimize code and assets
- 📚 **Documentation**: Improve guides and tutorials

---

## 📊 Performance

- **Load Time**: < 2s (on 4G connection)
- **Lighthouse Score**: 85/100
- **Mobile-Friendly**: ✅ Yes
- **Offline Support**: 🔜 Coming soon (PWA)

See [OPTIMIZATION_REPORT.md](OPTIMIZATION_REPORT.md) for details.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License - Copyright (c) 2025 ehgzao
```

---

## 🙏 Acknowledgments

### Inspiration
- **Balatro** - UI/UX design inspiration
- **Slay the Spire** - Roguelike mechanics
- **Inscryption** - Card game innovation

### Assets
- **Google Fonts** - Cinzel, Cinzel Decorative, MedievalSharp
- **AI-Generated Art** - Class avatars and backgrounds

### Technologies
- **Firebase** - Backend services
- **Netlify** - Hosting
- **EmailJS** - Email integration
- **Web Audio API** - Procedural audio

### Special Thanks
- All contributors and playtesters
- The roguelike community
- Open source maintainers

---

## 📞 Contact & Support

- **🌐 Website**: [dungeonscoundrel.netlify.app](https://dungeonscoundrel.netlify.app/)
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/ehgzao/DungeonScoundrel/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/ehgzao/DungeonScoundrel/discussions)
- **📧 Email**: Use in-game bug report feature

---

## 🗺️ Roadmap

### Version 1.2.0 (Planned)
- [ ] Multiplayer mode (async PvP)
- [ ] Daily challenges
- [ ] More relics (70 total)
- [ ] New class: Mage
- [ ] Card crafting system

### Version 2.0.0 (Future)
- [ ] Full PWA support
- [ ] Mobile apps (iOS/Android)
- [ ] Mod support
- [ ] Custom card creator
- [ ] Dungeon editor

---

<div align="center">

**Made with ❤️ by [ehgzao](https://github.com/ehgzao)**

⭐ Star this repo if you enjoy the game! ⭐

[🎮 Play Now](https://dungeonscoundrel.netlify.app/) | [📖 Docs](docs/) | [🐛 Report Issue](https://github.com/ehgzao/DungeonScoundrel/issues)

</div>

# 🎴 Dungeon Scoundrel

**A Dark Medieval Roguelike Card Game**

A challenging, atmospheric roguelike card game inspired by Fear and Hunger's dark medieval aesthetic. Face deadly monsters, collect powerful relics, and prove your skill across 4 difficulties with 6 unique character classes.

**[▶️ Play Now](https://dungeonscoundrel.netlify.app)** | **[📋 Changelog](CHANGELOG.md)** | **[🤝 Contributing](CONTRIBUTING.md)** | **[📁 Structure](docs/PROJECT_STRUCTURE.md)**

---

## ✨ Features

- 🏰 **4 Difficulty Modes** - Easy, Normal, Hard, and Endless
- ⚔️ **6 Unique Classes** - Each with special abilities and playstyles
- 🎵 **Dark Atmospheric Music** - 5 unique procedurally generated tracks
- 🏆 **50 Achievements** - Bronze, Silver, Gold, and Platinum tiers
- 🗝️ **Permanent Unlocks** - Progress that carries between runs
- 👹 **Epic Boss Battles** - Face powerful bosses every 10 rooms
- 🔮 **30+ Relics** - Unique powers and synergies
- 📊 **Global Leaderboard** - Compete with players worldwide
- ⌨️ **Keyboard Shortcuts** - Full desktop support for faster gameplay

---

## 🗡️ Character Classes

Choose your hero and unlock more through gameplay!

### **🎭 Scoundrel** _(Always Available)_
**The Survivor**
- **Passive:** None - Pure skill and survival
- **Active:** None - Rely on your wits
- 🎯 Perfect for learning the game mechanics

### **🛡️ Knight** _(Unlock: Win on Easy)_
**The Tank**
- **Passive:** +5 Max HP | Weapons have +1 durability
- **Active:** Shield Bash - Deal weapon damage to first monster (Cooldown: 3 rooms)
- 🎯 Defensive playstyle with extra survivability

### **🗡️ Rogue** _(Unlock: Win on Normal)_
**The Utility Master**
- **Passive:** Hold 2 cards | +1 gold per room
- **Active:** Shadow Strike - Next attack: 2x damage, doesn't break combo (Cooldown: 4 rooms)
- 🎯 Strategic playstyle with card management

### **💃 Dancer** _(Unlock: Win on Hard)_
**The Support**
- **Passive:** Potions heal +3 HP | Use 2 potions per room | +15% event chance
- **Active:** Healing Dance - Heal 5 HP + damage buff for 2 attacks (Cooldown: 5 rooms)
- 🎯 Sustain-focused with powerful healing

### **⚔️ Berserker** _(Unlock: Win on Hard + Kill 5 Bosses)_
**The Glass Cannon**
- **Passive:** Bloodlust - Damage increases as HP decreases (+1/+2/+3 at ≤70%/50%/30% HP)
- **Active:** Rage Strike - Sacrifice 5 HP for 3x damage, breaks combo (Cooldown: 4 rooms)
- 🎯 High risk, high reward aggressive playstyle

### **📿 Priest** _(Unlock: 20 Relics + 10 Events + 5 Wins)_
**The Divine Protector**
- **Passive:** 15% dodge chance | Potions heal +1 HP | Start with +2 Max HP
- **Active:** Purification - Remove strongest monster OR transform to potion (Cooldown: 6 rooms)
- 🎯 Control and defensive playstyle with strategic choices

---

## 🎮 How to Play

### Objective
Clear all cards from the dungeon deck without your health reaching zero!

### Card Types
- **♠️ ♣️ Monsters** - Fight and take damage
- **♦️ Weapons** - Equip to reduce damage
- **♥️ Potions** - Heal yourself (1 per dungeon)
- **✨ Special Cards** - Unique effects

### Controls

**Mouse:**
- **Left-click** cards to use them
- **Right-click** cards to hold for later
- **Click buttons** to draw rooms, avoid, or use abilities

**Keyboard Shortcuts (Desktop):**
- **Space** or **D** - Draw Room
- **A** - Avoid Room
- **Q** - Use Class Ability
- **U** - Undo Last Move
- **S** - Open Shop
- **1-5** - Click cards 1-5 in room
- **ESC** - Close any modal

**Strategy:**
- Manage your health carefully
- Save cards strategically with right-click
- Build combos for bonus points
- Always bring weapons to boss fights!

---

## 🚀 Quick Start

### Play Online
👉 **[Play Now](https://dungeonscoundrel.netlify.app)** _(No installation required!)_

### Run Locally

```bash
# Clone the repository
git clone https://github.com/ehgzao/DungeonScoundrel.git
cd DungeonScoundrel

# Open index.html in your browser
# Or use a local server:
npx http-server
# Access http://localhost:8080
```

---

## 📊 Game Statistics

- **Size:** 291 KB (optimized!)
- **Load Time:** < 2 seconds on 3G
- **Performance:** 60 FPS on all devices
- **Browser Support:** Chrome, Firefox, Safari, Edge

---

## 🎵 Music System

The game features a **Dark Atmospheric Music System** with 5 unique tracks:
- 🏰 **Dark Awakening** - Menu theme
- ⚔️ **Into the Depths** - Gameplay theme
- 🏺 **Merchant's Shadow** - Shop theme
- 👑 **Triumph in Darkness** - Victory theme
- 💀 **The Final Darkness** - Defeat theme

All music is **procedurally generated** using Web Audio API!

---

## 🗂️ Project Structure

```
DungeonScoundrel/
├── index.html              # Main game file
├── README.md               # This file
├── LICENSE                 # MIT License
├── favicon.svg             # Game icon
├── netlify.toml            # Deployment config
├── site.webmanifest        # PWA manifest
│
├── assets/                 # Static assets
│   └── icons/              # Alternative icons
│
├── src/                    # Source files
│   ├── styles/             # CSS files
│   │   └── styles.css      # Main stylesheet
│   └── config/             # Configuration
│       └── firebase-config.js
│
├── docs/                   # Documentation
│   ├── INDEX.md            # Documentation index
│   ├── implementation/     # Implementation guides
│   ├── systems/            # System documentation
│   └── archive/            # Historical documents
│
└── backups/                # Project backups
```

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Music:** Web Audio API (procedural generation)
- **Storage:** LocalStorage + IndexedDB
- **Backend:** Firebase (leaderboards & auth)
- **Deployment:** Netlify
- **No frameworks** - Pure vanilla JS for maximum performance!

---

## 🎯 Difficulty Scaling

| Difficulty | Starting HP | Starting Gold | Weapon Durability | Gold Rewards | Event Chance |
|------------|-------------|---------------|-------------------|--------------|--------------|
| 🟢 Easy    | 20 HP       | 30 🪙         | 3 uses            | High         | 40%          |
| 🟡 Normal  | 15 HP       | 15 🪙         | 2 uses            | Balanced     | 30%          |
| 🔴 Hard    | 10 HP       | 0 🪙          | 1 use             | Low          | 20%          |
| ♾️ Endless | 15 HP       | 15 🪙         | 2 uses            | Balanced     | 25%          |

---

## 🏆 Achievements

50 unique achievements across 4 tiers:
- 🥉 **Bronze** (25) - Getting started
- 🥈 **Silver** (15) - Intermediate challenges
- 🥇 **Gold** (9) - Expert gameplay
- 💎 **Platinum** (1) - Ultimate mastery

---

## 📈 Roadmap

- [x] Core gameplay mechanics
- [x] Dark atmospheric music system
- [x] 50 achievements
- [x] Global leaderboard
- [x] Desktop/tablet optimization
- [x] Boss battles
- [x] Professional polish
- [x] Interactive tutorial
- [x] Keyboard shortcuts
- [ ] Daily challenges
- [ ] More special cards
- [ ] Steam release (maybe?)

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/AmazingFeature

# 3. Commit your changes
git commit -m 'Add some AmazingFeature'

# 4. Push to the branch
git push origin feature/AmazingFeature

# 5. Open a Pull Request
```

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎨 Credits

### Development
- **Vibe Coded** using [Windsurf IDE](https://codeium.com/windsurf) with Cascade AI
- All code, music, and game design created through **AI-assisted pair programming**

### Inspiration
- Classic roguelike card games (Slay the Spire, Monster Train)
- Medieval dark fantasy aesthetics
- Procedural music generation techniques

### Assets
- **Fonts:** Google Fonts (Cinzel, MedievalSharp)
- **Icons:** Unicode emojis
- **Music:** Procedurally generated (Web Audio API)
- **No external assets** - Everything is code-generated!

---

## 📞 Contact

- **GitHub:** [@ehgzao](https://github.com/ehgzao)
- **Issues:** [Report a bug](https://github.com/ehgzao/DungeonScoundrel/issues)
- **Discussions:** [Join the discussion](https://github.com/ehgzao/DungeonScoundrel/discussions)

---

## 🌟 Support

If you enjoyed the game:
- ⭐ **Star this repository**
- 🐛 **Report bugs** in Issues
- 💡 **Suggest features** in Discussions
- 🎮 **Share with friends**

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/ehgzao/DungeonScoundrel?style=social)
![GitHub forks](https://img.shields.io/github/forks/ehgzao/DungeonScoundrel?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/ehgzao/DungeonScoundrel?style=social)

---

<div align="center">

**Made with ⚔️ and 🎵 using [Windsurf](https://codeium.com/windsurf)**

*Vibe coded in a single session - October 2025*

[Play Now](https://dungeonscoundrel.netlify.app) • [Report Bug](https://github.com/ehgzao/DungeonScoundrel/issues) • [Request Feature](https://github.com/ehgzao/DungeonScoundrel/issues)

</div>

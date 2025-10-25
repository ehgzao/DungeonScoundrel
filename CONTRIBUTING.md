# Contributing to Dungeon Scoundrel

First off, thank you for considering contributing to Dungeon Scoundrel! 🎉

## 🎯 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates.

**When reporting a bug, please include:**
- **Description** - Clear description of the issue
- **Steps to Reproduce** - Step-by-step instructions
- **Expected Behavior** - What should happen
- **Actual Behavior** - What actually happens
- **Screenshots** - If applicable
- **Browser** - Chrome, Firefox, Safari, etc.
- **Device** - Desktop, Mobile, Tablet

### 💡 Suggesting Features

Feature suggestions are welcome! Please:
- Check if the feature has already been suggested
- Provide a clear description of the feature
- Explain why it would be useful
- Consider the scope and complexity

### 🔧 Pull Requests

1. **Fork** the repository
2. **Create a branch** (`git checkout -b feature/AmazingFeature`)
3. **Make your changes**
4. **Test thoroughly**
5. **Commit** with clear messages (`git commit -m 'Add: Amazing new feature'`)
6. **Push** to your branch (`git push origin feature/AmazingFeature`)
7. **Open a Pull Request**

#### Commit Message Format

```
Type: Short description

- Detailed point 1
- Detailed point 2

Examples:
Add: New relic system
Fix: Boss gold reward not scaling
Update: Music volume controls
Refactor: Achievement notification system
```

**Types:** `Add`, `Fix`, `Update`, `Refactor`, `Remove`, `Docs`

---

## 📝 Code Guidelines

### Style
- Use **2 spaces** for indentation
- Use **camelCase** for variables and functions
- Use **PascalCase** for classes
- Add **comments** for complex logic
- Keep functions **small and focused**

### Best Practices
- **Test** your changes thoroughly
- **No console.logs** in production code
- **Comment** complex algorithms
- **Maintain** existing code style
- **Update documentation** if needed

---

## 🧪 Testing

Before submitting a PR, please test:

### Core Gameplay
- [ ] Start a new game on each difficulty
- [ ] Complete at least one full run
- [ ] Test all card types (monsters, weapons, potions)
- [ ] Verify damage calculations
- [ ] Check victory and defeat screens

### Features
- [ ] Music system (all 5 tracks)
- [ ] Achievement unlocks
- [ ] Shop functionality
- [ ] Boss battles
- [ ] Hold system
- [ ] Undo button (Easy/Normal)

### Cross-Browser
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if possible)

### Mobile
- [ ] Touch controls
- [ ] Landscape orientation
- [ ] Performance

---

## 📚 Documentation

If your contribution changes functionality:
- Update relevant `docs/` files
- Add comments to complex code
- Update README.md if needed

---

## 🎨 Adding Content

### New Cards
```javascript
// Special card template
{
    value: 'J', 
    suit: '✨', 
    numValue: 11,
    special: {
        name: 'Card Name',
        description: 'What it does',
        effect: () => {
            // Your code here
        }
    }
}
```

### New Relics
```javascript
{
    id: 'relic_id',
    name: 'Relic Name',
    description: 'What it does',
    rarity: 'common', // common, uncommon, rare, legendary
    icon: '🔮'
}
```

### New Achievements
```javascript
{
    id: 'achievement_id',
    title: 'Achievement Title',
    description: 'How to unlock',
    tier: 'bronze', // bronze, silver, gold, platinum
    icon: '🏆',
    check: () => {
        // Return true if unlocked
        return condition;
    }
}
```

---

## 🚀 Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/DungeonScoundrel.git
cd DungeonScoundrel

# Create a branch
git checkout -b feature/my-feature

# Make changes
# Test thoroughly!

# Commit
git add .
git commit -m "Add: My awesome feature"

# Push
git push origin feature/my-feature

# Create PR on GitHub
```

---

## ❓ Questions?

- Open an [Issue](https://github.com/yourusername/DungeonScoundrel/issues)
- Start a [Discussion](https://github.com/yourusername/DungeonScoundrel/discussions)

---

## 📜 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Not Acceptable

- Harassment or discriminatory language
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

---

## 🎉 Recognition

Contributors will be:
- Listed in the README
- Mentioned in release notes
- Forever appreciated! ⚔️

---

**Thank you for contributing! 🏰⚔️🎵**

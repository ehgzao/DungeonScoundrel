# Contributing to Dungeon Scoundrel

First off, thank you for considering contributing to Dungeon Scoundrel! It's people like you that make this game better for everyone.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Areas We Need Help](#areas-we-need-help)

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our commitment to providing a welcoming and inclusive environment. Please be respectful and considerate in all interactions.

## 🎯 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the [issue list](https://github.com/ehgzao/DungeonScoundrel/issues) to avoid duplicates.

**When filing a bug report, include:**
- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior** vs what actually happened
- **Screenshots** if applicable
- **Browser/device info** (Chrome 120, Mobile Safari iOS 17, etc.)
- **Game version** (check footer or about modal)

You can also use the in-game bug report feature (settings menu).

### 💡 Suggesting Features

Feature suggestions are tracked as [GitHub issues](https://github.com/ehgzao/DungeonScoundrel/issues).

**When suggesting a feature, include:**
- **Clear title and description**
- **Use case** - Why is this feature needed?
- **Expected behavior** - How should it work?
- **Mockups/examples** if applicable
- **Impact** - Who benefits from this feature?

### 🎨 Contributing Code

We love receiving pull requests! Here's how to get started.

## 🚀 Getting Started

### Prerequisites

- **Node.js** 14+ (for development tools)
- **Git** for version control
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Text editor** (VS Code, Sublime, etc.)

### Setup

1. **Fork** the repository on GitHub

2. **Clone** your fork locally
   ```bash
   git clone https://github.com/YOUR-USERNAME/DungeonScoundrel.git
   cd DungeonScoundrel
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Create a branch** for your changes
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

5. **Run the game locally**
   ```bash
   npm run dev
   # Opens at http://localhost:8080
   ```

6. **Make your changes** and test thoroughly

## 💻 Development Workflow

### Project Structure

```
DungeonScoundrel/
├── public/                 # Production files (what gets served)
│   ├── index.html         # Main game file
│   ├── assets/            # Images, icons (WebP optimized)
│   └── src/
│       ├── js/
│       │   ├── modules/   # Game modules (state, shop, relics)
│       │   ├── systems/   # Game systems (achievements, stats)
│       │   ├── utils/     # Utilities (helpers, mobile)
│       │   └── core/      # Core systems (Firebase, audio)
│       └── css/           # Stylesheets
└── docs/                  # Documentation
```

### Key Files

- **public/index.html** - Main game HTML (1500+ lines)
- **public/src/js/game.js** - Core game logic (4800+ lines)
- **public/src/js/modules/** - Modular game systems
- **public/src/css/styles.css** - All styles
- **workbox-config.js** - Service Worker configuration

### Making Changes

1. **Read the code** you're changing to understand context
2. **Follow existing patterns** in the codebase
3. **Test your changes** in multiple browsers
4. **Test on mobile** if UI changes (Chrome DevTools mobile emulator)
5. **Check for console errors** (F12 in browser)
6. **Test edge cases** (low HP, no cards, etc.)

## 📝 Code Style Guidelines

### JavaScript

- **Use ES6+ features**: `const`, `let`, arrow functions, template literals
- **Naming conventions**:
  - `camelCase` for variables and functions
  - `PascalCase` for classes
  - `UPPER_CASE` for constants
- **Functions**: Keep them small and focused
- **Comments**: Explain *why*, not *what*
  ```javascript
  // Good
  // Shuffle deck to prevent pattern memorization
  shuffleDeck();

  // Bad
  // Shuffles the deck
  shuffleDeck();
  ```
- **No unused variables or functions**
- **Use strict equality**: `===` instead of `==`

### HTML

- **Semantic markup**: Use appropriate tags (`<section>`, `<article>`, etc.)
- **ARIA labels**: For accessibility
- **Indentation**: 4 spaces
- **Attributes order**: id, class, data-*, src/href, other

### CSS

- **BEM naming** for classes: `block__element--modifier`
  ```css
  .card { }
  .card__title { }
  .card--active { }
  ```
- **CSS custom properties** for colors and values
  ```css
  :root {
      --color-primary: #4ecdc4;
  }
  ```
- **Mobile-first**: Start with mobile styles, add desktop via media queries

### Modules

- **One responsibility** per module
- **Clear exports**: Use `export` or `window.GameModule = ...`
- **Import order**: Core modules first, utilities last

## 📬 Commit Message Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature for the user
- **fix**: Bug fix for the user
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons)
- **refactor**: Code refactoring (no functional changes)
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Build process, dependencies, tooling

### Examples

```bash
feat(relics): Add Lucky Horseshoe relic with 15% luck boost

- Implemented passive luck boost effect
- Added relic icon and description
- Updated relic pool and drop rates

Closes #123
```

```bash
fix(combat): Prevent negative HP from causing display glitch

When HP went below 0, UI showed "-1 HP" instead of death screen.
Now clamps HP to minimum of 0 before updating display.

Fixes #456
```

## 🔀 Pull Request Process

### Before Submitting

- [ ] **Test thoroughly** on desktop and mobile
- [ ] **Check console** for errors or warnings
- [ ] **Review your own code** - would you approve this PR?
- [ ] **Update documentation** if needed
- [ ] **Follow code style** guidelines
- [ ] **Write clear commit messages**

### Submitting

1. **Push your branch** to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request** on GitHub
   - Use a clear, descriptive title
   - Reference related issues (`Closes #123`)
   - Describe what changed and why
   - Include screenshots for UI changes
   - List testing steps

3. **Respond to feedback**
   - Address reviewer comments
   - Push additional commits if needed
   - Be patient and respectful

### PR Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issues
Closes #(issue number)

## Screenshots (if applicable)
Before/after screenshots for UI changes

## Testing
- [ ] Tested on Desktop (Chrome, Firefox)
- [ ] Tested on Mobile (iOS Safari, Android Chrome)
- [ ] No console errors
- [ ] All game modes work (Easy, Normal, Hard, Endless)
- [ ] Achievements unlock correctly
- [ ] Save/load works

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated (if needed)
- [ ] No breaking changes (or documented if necessary)
```

## 🧪 Testing

### Manual Testing Checklist

**Core Gameplay:**
- [ ] Start new game on all difficulties
- [ ] Play through 10+ rooms
- [ ] Test all card types (Monsters, Weapons, Potions, Specials)
- [ ] Verify combat calculations
- [ ] Test hold mechanic
- [ ] Test combo system
- [ ] Defeat a boss (room 10, 20, etc.)

**Features:**
- [ ] Shop purchases work
- [ ] Events display and function correctly
- [ ] Relics activate properly
- [ ] Achievements unlock
- [ ] Save/load game
- [ ] Settings persist

**Classes:**
- [ ] Test each class's passive ability
- [ ] Test each class's active ability
- [ ] Verify unlock requirements

**Mobile/PWA:**
- [ ] Touch controls responsive
- [ ] Install as PWA works
- [ ] Offline mode functions
- [ ] Service Worker updates

**Edge Cases:**
- [ ] HP = 0 triggers death
- [ ] Deck empty handled gracefully
- [ ] High combo numbers display correctly
- [ ] Very long game sessions stable

### Browser Testing

**Minimum:** Test in Chrome (desktop and mobile emulator)

**Ideal:** Test in:
- Chrome (desktop + mobile)
- Firefox (desktop)
- Safari (desktop + iOS)
- Edge (desktop)

## 🎨 Areas We Need Help

### High Priority

- 🐛 **Bug Fixes** - Check [open issues](https://github.com/ehgzao/DungeonScoundrel/issues)
- 🎵 **Music & Sound** - Additional tracks, SFX variations
- 📱 **Mobile Testing** - Real device testing (iOS, Android)
- 🌍 **Localization** - Translate to other languages

### Medium Priority

- 🎨 **UI/UX Improvements** - Visual polish, animations
- ⚡ **Performance** - Optimize code and assets
- 📚 **Documentation** - Tutorials, guides, JSDoc comments
- 🧪 **Testing** - Automated tests, QA on different devices

### Long Term

- 🎮 **Game Design** - New relics, classes, mechanics
- 🔧 **Tooling** - Build process, linting, formatting
- 🏗️ **Architecture** - Code refactoring, modernization

## 📞 Questions?

- **💬 GitHub Discussions**: [Ask questions](https://github.com/ehgzao/DungeonScoundrel/discussions)
- **🐛 Issues**: [Report bugs or request features](https://github.com/ehgzao/DungeonScoundrel/issues)
- **📧 Email**: hello@dungeonscoundrel.com
- **📖 Documentation**: Check [/docs](docs/) folder

## 🙏 Thank You!

Every contribution, no matter how small, helps make Dungeon Scoundrel better. We appreciate your time and effort!

---

**Made with ❤️ by the Dungeon Scoundrel community**

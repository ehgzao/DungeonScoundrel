# Changelog

All notable changes to Dungeon Scoundrel will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-26

### Added
- **6 Playable Classes**: Scoundrel, Knight, Rogue, Dancer, Berserker, Priest
- **Class Unlock System**: Progressive unlocks based on achievements
- **Keyboard Shortcuts**: Full desktop keyboard support (D=Draw, A=Avoid, Q=Ability, 1-5=Cards, ESC=Close)
- **Interactive Tutorial**: 9-step comprehensive tutorial with keyboard shortcuts guide
- **Desktop Optimization**: Removed mobile code, optimized for desktop/tablet
- **Enhanced Security**: Input sanitization and localStorage error handling
- **Performance Improvements**: Particle limit system, optimized relic iterations
- **4 Difficulty Modes**: Easy, Normal, Hard, Endless
- **50 Achievements**: Complete achievement system with lifetime tracking
- **Boss Battles**: Every 10th room with unique bosses
- **Relic System**: 30+ unique relics with various effects
- **Event System**: Random events with strategic choices
- **Shop System**: Buy upgrades, relics, and healing
- **Score System**: Complex scoring with bonuses and penalties
- **Leaderboard**: Firebase integration for global scores
- **Music System**: Adaptive music for different game states
- **Sound Effects**: Complete audio feedback system

### Changed
- **Viewport**: Optimized for desktop (min 1024px)
- **UI**: Fear and Hunger inspired dark medieval aesthetic
- **Performance**: 80% less array iterations in room clear
- **Security**: Consistent input sanitization across all inputs

### Removed
- **Mobile Support**: Removed orientation warnings and touch handlers
- **Deprecated Code**: Cleaned up unused mobile-specific code

### Fixed
- **XSS Prevention**: Player name sanitization in all locations
- **Storage Errors**: Comprehensive error handling for localStorage
- **Memory Leaks**: Proper timer cleanup and event listener management
- **Particle Performance**: Limited to 150 max active particles

### Security
- Input sanitization against XSS attacks
- LocalStorage quota exceeded handling
- Firebase error handling with offline fallback
- Secure player name validation

---

## [0.9.0] - 2025-10-25

### Added
- Initial class system implementation
- Basic game mechanics
- UI redesign

### Changed
- Visual style to dark medieval theme
- Card system mechanics

---

## Project Milestones

- **v1.0.0** - Full Release (October 26, 2025)
- **v0.9.0** - Class System (October 25, 2025)
- **v0.1.0** - Initial Prototype (October 2025)

---

## Links

- [GitHub Repository](https://github.com/yourusername/dungeon-scoundrel)
- [Play Online](https://dungeonscoundrel.netlify.app)
- [Report Issues](https://github.com/yourusername/dungeon-scoundrel/issues)

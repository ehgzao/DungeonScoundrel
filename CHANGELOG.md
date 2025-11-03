# Changelog

All notable changes to Dungeon Scoundrel will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.2] - 2025-11-03

### 🎯 Speedrunner System Overhaul

#### **Score Changes**
- **Changed**: Speedrun bonus now awards:
  - **+1000 points** for completing run in **under 1 minute**
  - **+500 points** for completing run in **1-5 minutes**
  - **0 points** for runs over 5 minutes
- **Previous**: +500 (<5min), +250 (<10min)
- **Impact**: Speedrunning is now significantly more rewarding and challenging

#### **Achievement Changes**
- **Fixed**: "Speedrunner" achievement now unlocks **only** for runs under 1 minute
- **Previous**: Unlocked for runs under 10 minutes
- **Description Updated**: "Win a game in under 1 minute"

#### **Permanent Unlock Changes**
- **Fixed**: "Speedrunner" unlock now requires winning under **1 minute**
- **Previous**: Required under 5 minutes
- **Description Updated**: "Gain 2x gold for winning under 1 minute"
- **Check Updated**: `< 60` seconds instead of `< 300`

#### **Text Updates**
- Updated speedrun references in 3 locations:
  - Main tutorial (How to Play)
  - Pro Tips section
  - Interactive tutorial score breakdown

### 🐛 Critical Bug Fixes

#### **Shop Modal Bug (Bug #14)** 🔴
- **Fixed**: Clicking X button on Shop modal left game buttons disabled
- **Root Cause**: Button called `classList.remove()` directly instead of `closeShop()` function
- **Impact**: Players couldn't continue game after shopping if they closed with X button
- **Solution**: Created `closeShopWrapper()` global function and updated button onclick handler

#### **Event Modal Bug (Bug #15)** 🔴
- **Fixed**: Clicking X button on Event modal left game buttons disabled
- **Root Cause**: Same issue as Shop modal - direct DOM manipulation without re-enabling buttons
- **Impact**: Players couldn't continue game after events if they closed with X button
- **Solution**: Created `closeEventWrapper()` global function with proper button re-enabling logic

#### **Code Duplication (Bug #16)**
- **Fixed**: Achievement unlock code was duplicated (speedrun, iron_will, perfect_run checked twice)
- **Impact**: Minor performance issue, no functional impact
- **Solution**: Removed duplicate achievement checks

### 🔧 Technical Improvements

- **Global Function Wrappers**: Added window-scoped wrappers for modal close handlers
- **Consistent Modal Behavior**: All modals now properly re-enable game buttons when closed
- **Code Quality**: Removed redundant code blocks

### 🎮 Gameplay Impact

- **Speedrunning**: Now a true high-skill challenge with 2x reward for sub-1-minute runs
- **Modal UX**: Fixed critical usability issues preventing game continuation
- **Achievement Balance**: Speedrunner achievement now properly reflects elite-tier difficulty

### 🙏 Special Thanks

Bugs reported and fixed thanks to playtesting feedback from the community.

---

## [1.1.1] - 2025-11-03

### ✨ Added

- **Motivational Modal System**: Encouraging messages appear on 1st death and every 5th death
- **"Dreams Never Get Old" Message**: Beautiful bilingual quote (English/Portuguese) with special animations
- **Musical Pause Moment**: Game music pauses during motivational modals for contemplation
- **Golden Glow Animations**: Gentle visual effects on motivational modals
- **Version Badge**: Clickable v1.1.1 badge on welcome screen
- **What's New Modal**: Interactive changelog viewer with all bug fixes and features

### 🐛 Critical Bug Fixes

This release fixes **13 critical bugs** discovered during comprehensive code review:

#### **Game State Initialization (Bugs #1-3)**
- **Fixed**: `game.firstAttackDone` not initialized (Power Gauntlet broke)
- **Fixed**: `game.criticalWarningShown` not initialized (HP warning system broke)
- **Fixed**: `game.rageStrikeActive` not initialized (Berserker ability broke)
- **Impact**: All per-room flags now properly reset and initialize

#### **Data Structure (Bug #4)**
- **Fixed**: Duplicate properties in `game` object (`gameOver`, `gameStartTime`, `gameTimerInterval`, `lastActionWasAvoid`, `relics`)
- **Impact**: Cleaner code, prevents potential conflicts

#### **Relic System (Bugs #5-7)**
- **Fixed**: `healing_study` relic not healing (+1 HP per room now works)
- **Fixed**: `Iron Armor` relic not reducing damage (-1 damage reduction now works)
- **Fixed**: `Thunder Gauntlet` (warrior) relic not implemented (20% double damage now works)
- **Impact**: All 25 relics now fully functional

#### **Permanent Unlocks (Bugs #8-11)**
- **Fixed**: `criticalStrike` unlock not applying (10% chance for 3x damage now works)
- **Fixed**: `lifeSteal` unlock not healing (+1 HP on perfect kills now works)
- **Fixed**: `thornsArmor` unlock not reflecting damage (reflects 2 damage now)
- **Fixed**: `dodgeMaster` unlock not working (dodge now lasts 2 attacks)
- **Impact**: All 29 permanent unlocks now fully functional

#### **Critical Logic Error (Bug #12)** 🔴
- **Fixed**: Thunder Gauntlet and Critical Strike modifying `effectiveWeapon` before variable existed
- **Root Cause**: Variable used before declaration (JavaScript execution order bug)
- **Impact**: These mechanics were completely non-functional since release
- **Solution**: Moved multiplication logic after variable definition

#### **Endless Mode Freeze (Bug #13)** 🔴
- **Fixed**: Endless mode freezing with white screen when deck runs out
- **Root Cause**: `checkGameState()` didn't auto-reload deck when both `dungeon` and `room` were empty
- **Impact**: Game would freeze requiring page reload
- **Solution**: Added auto-reload logic with automatic room draw in `checkGameState()`

### 🎯 Testing & Verification

- ✅ All 25 relics tested and verified
- ✅ All 29 permanent unlocks tested and verified
- ✅ All 6 class abilities tested and verified
- ✅ Game state initialization verified
- ✅ Combat damage calculation verified
- ✅ Per-room flag reset system verified
- ✅ Endless mode progression verified
- ✅ Rogue multi-card hold system verified

### 📈 Code Quality Improvements

- **DRY Principle**: Helper functions for bonus calculations
- **Code Organization**: Better separation of concerns
- **Comments**: Improved inline documentation
- **Maintainability**: Clearer variable naming and logic flow

### 🔒 Stability

- No breaking changes to save data
- Backwards compatible with existing localStorage data
- All features now working as originally designed

### 🙏 Special Thanks

Bugs discovered through comprehensive code review and invaluable playtesting feedback from:
- **Carol**
- **Baka***
- **Kamui**
- **Leon**
- **Breno**

Thank you for playing and helping make Dungeon Scoundrel better! 🎮✨

---

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

- **v1.1.2** - Speedrunner Overhaul & Modal Fixes (November 3, 2025) ⚡ **3 bugs fixed**
- **v1.1.1** - Critical Bug Fixes (November 3, 2025) ⭐ **13 bugs fixed**
- **v1.0.0** - Full Release (October 26, 2025)
- **v0.9.0** - Class System (October 25, 2025)
- **v0.1.0** - Initial Prototype (October 2025)

---

## Links

- [GitHub Repository](https://github.com/ehgzao/DungeonScoundrel)
- [Play Online](https://dungeonscoundrel.netlify.app)
- [Report Issues](https://github.com/ehgzao/DungeonScoundrel/issues)

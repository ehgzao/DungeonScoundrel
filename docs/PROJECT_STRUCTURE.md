# 📁 Project Structure

**Dungeon Scoundrel** - Professional folder organization

---

## Directory Tree

```
DungeonScoundrel/
│
├── 📁 assets/                      # Game assets and media
│   ├── avatar-berserker.jpg        # Class avatar images
│   ├── avatar-dancer.jpg
│   ├── avatar-knight.jpg
│   ├── avatar-priest.jpg
│   ├── avatar-rogue.jpg
│   ├── avatar-scoundrel.jpg
│   ├── dungeon-bg.jpg              # Background image
│   ├── title-logo.png              # Game title logo
│   └── icons/                      # Icon assets
│
├── 📁 src/                         # Source code
│   ├── config/                     # Configuration files
│   │   └── firebase-config.js      # Firebase setup
│   └── styles/                     # CSS stylesheets
│       └── styles.css              # Main stylesheet
│
├── 📁 docs/                        # Documentation
│   ├── development/                # Development docs
│   │   ├── BUGS_FOUND_REVIEW2.md
│   │   ├── CODE_REVIEW_2_COMPLETED.md
│   │   ├── CODE_REVIEW_AND_OPTIMIZATIONS.md
│   │   ├── DESKTOP_OPTIMIZATION_COMPLETED.md
│   │   ├── FEAR_AND_HUNGER_STYLE_UPDATE.md
│   │   ├── SCROLLBAR_FIX.md
│   │   ├── TITLE_IMAGE_TEST.md
│   │   ├── UI_FINAL_FIXES.md
│   │   ├── UI_FIXES_FINAL.md
│   │   ├── UI_IMPROVEMENTS.md
│   │   └── UI_REDESIGN_SUMMARY.md
│   │
│   ├── implementation/             # Feature implementations
│   │   ├── BERSERKER_PRIEST_IMPLEMENTATION.md
│   │   ├── CLASS_MECHANICS_COMPLETE.md
│   │   ├── CLASS_MECHANICS_IMPLEMENTATION.md
│   │   └── SCOUNDREL_CLASS_SYSTEM.md
│   │
│   ├── guides/                     # Setup and usage guides
│   │   ├── BACKUP_INFO.md
│   │   ├── GITHUB_READY.md
│   │   ├── GITHUB_SETUP.md
│   │   └── STRUCTURE.md
│   │
│   ├── archive/                    # Historical documents
│   │   ├── FINAL_CORRECTIONS.md
│   │   ├── IMPLEMENTATION_SUMMARY.md
│   │   └── ORGANIZATION_COMPLETE.md
│   │
│   └── PROJECT_STRUCTURE.md        # This file
│
├── 📁 backups/                     # Backup files
│   ├── index.html.backup           # HTML backup
│   └── styles.css.backup           # CSS backup
│
├── 📄 index.html                   # Main game file (328 KB)
├── 📄 favicon.svg                  # Browser favicon
├── 📄 site.webmanifest             # PWA manifest
├── 📄 netlify.toml                 # Netlify config
│
├── 📄 README.md                    # Project readme
├── 📄 CHANGELOG.md                 # Version history
├── 📄 CONTRIBUTING.md              # Contribution guidelines
├── 📄 LICENSE                      # MIT License
│
└── 📄 .gitignore                   # Git ignore rules

```

---

## 📂 Folder Descriptions

### `/assets/`
Game media files including character avatars, backgrounds, and UI elements.
- **Images**: JPG format, optimized for web
- **Logo**: PNG with transparency
- **Total size**: ~9 MB

### `/src/`
Application source code separated by concern.
- **config/**: External service configurations
- **styles/**: CSS stylesheets (70 KB)

### `/docs/`
Complete project documentation organized by category.

#### `/docs/development/`
Technical documentation about development process, code reviews, optimizations, and UI improvements.

#### `/docs/implementation/`
Feature implementation details, particularly the class system and game mechanics.

#### `/docs/guides/`
Setup guides, deployment instructions, and project structure information.

#### `/docs/archive/`
Historical documents from previous development phases.

### `/backups/`
Backup copies of critical files for rollback purposes.

---

## 📊 File Statistics

### Size Distribution
- **index.html**: 328 KB (main game logic)
- **styles.css**: 70 KB (styling)
- **Assets**: ~9 MB (images)
- **Documentation**: ~150 KB (markdown files)

### Code Organization
- **HTML**: Single-file application (index.html)
- **CSS**: Modular stylesheet (styles.css)
- **JavaScript**: Embedded in HTML (ES6 modules)
- **Config**: External Firebase config

---

## 🔧 Configuration Files

### `netlify.toml`
Netlify deployment configuration with redirects and headers.

### `site.webmanifest`
Progressive Web App manifest for installability.

### `.gitignore`
Git exclusions for node_modules, build files, and sensitive data.

---

## 📝 Documentation Standards

### Naming Convention
- **UPPERCASE**: Documentation files (README.md, CHANGELOG.md)
- **lowercase**: Source files (index.html, styles.css)
- **PascalCase**: Feature docs (FeatureName.md)

### Organization
- **By Type**: Development, implementation, guides
- **By Date**: Archive for historical reference
- **By Purpose**: Clear folder structure

---

## 🚀 Quick Navigation

**For Developers:**
- Start here: `/docs/guides/GITHUB_SETUP.md`
- Code reviews: `/docs/development/CODE_REVIEW_*.md`
- Implementation: `/docs/implementation/`

**For Players:**
- Play: Open `index.html`
- Learn: Check in-game tutorial
- Contribute: Read `CONTRIBUTING.md`

**For Deployment:**
- Setup: `netlify.toml`
- Firebase: `src/config/firebase-config.js`
- Manifest: `site.webmanifest`

---

## 📦 Build Output

This is a **static site** - no build process required.

**Deployment-ready files:**
- `index.html` (main)
- `assets/` (required)
- `src/` (required)
- `favicon.svg`
- `site.webmanifest`
- `netlify.toml`

---

*Last Updated: October 26, 2025*

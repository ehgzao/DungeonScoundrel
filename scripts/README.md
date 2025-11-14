# Scripts Directory

Collection of build, development, and asset processing scripts for Dungeon Scoundrel.

## Directory Structure

```
scripts/
├── build/          Build and deployment scripts
├── dev/            Development and code tools
└── assets/         Asset processing and optimization
```

---

## Build Scripts (`/build`)

### `build-production.ps1`
**Purpose:** Build the game for production deployment
**Usage:** `powershell ./scripts/build/build-production.ps1`
**What it does:**
- Generates Service Worker with Workbox
- Minifies assets
- Prepares production build

### `deploy-latest.bat`
**Purpose:** Deploy to Netlify (production)
**Usage:** `./scripts/build/deploy-latest.bat`
**What it does:**
- Runs build process
- Deploys to Netlify
- Updates production site

### `run-local.bat`
**Purpose:** Start local development server
**Usage:** `./scripts/build/run-local.bat`
**What it does:**
- Starts Python HTTP server on port 8080
- Serves `/public` directory
- Auto-opens browser

**Alternative:** Use `npm run dev` from root

---

## Development Scripts (`/dev`)

### `extract-js-safe.py`
**Purpose:** Extract JavaScript from HTML into separate files
**Usage:** `python scripts/dev/extract-js-safe.py`
**What it does:**
- Safely extracts inline JS from `index.html`
- Creates modular JS files
- Preserves code structure
- Handles errors gracefully

### `minify-safe.ps1`
**Purpose:** Minify JavaScript and CSS files for production
**Usage:** `powershell ./scripts/dev/minify-safe.ps1`
**What it does:**
- Minifies all .js files
- Minifies all .css files
- Creates .min.js and .min.css versions
- Comprehensive error handling

### `modularize.py`
**Purpose:** Refactor monolithic code into ES6 modules
**Usage:** `python scripts/dev/modularize.py`
**What it does:**
- Analyzes code dependencies
- Splits large files into modules
- Maintains functionality
- Improves code organization

### `google-apps-script-automation.js`
**Purpose:** Google Apps Script for automated tasks
**Usage:** Copy to Google Apps Script editor
**What it does:**
- Automates spreadsheet operations
- Game data management
- Analytics tracking

---

## Asset Scripts (`/assets`)

### `convert-to-webp.ps1`
**Purpose:** Convert images to WebP format
**Usage:** `powershell ./scripts/assets/convert-to-webp.ps1`
**What it does:**
- Converts JPG/PNG to WebP
- Reduces image size by ~90%
- Maintains quality
- Creates optimized assets

**Requirements:** cwebp (WebP encoder) must be installed

---

## Requirements

### Windows Scripts (.ps1, .bat)
- Windows PowerShell 5.1+
- Python 3.7+ (for .py scripts)

### Cross-platform
- Node.js 14+ (for npm scripts)
- Python 3.7+

---

## Best Practices

1. **Always backup before running scripts**
2. **Test locally before deploying**
3. **Run build scripts from repository root**
4. **Check script permissions** (`chmod +x` on Unix)

---

## Troubleshooting

### "Script cannot be loaded" (PowerShell)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Python not found"
Install Python 3.7+ and add to PATH

### "npm command not found"
Install Node.js from https://nodejs.org

---

## Migration Notes

**2025-11-14:** Scripts reorganized into subdirectories
- Removed duplicate/outdated scripts
- Kept only "safe" versions with error handling
- Consolidated from 12 to 8 scripts

---

**For help:** Check individual script comments or contact maintainers

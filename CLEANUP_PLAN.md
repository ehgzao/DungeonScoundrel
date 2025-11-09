# 🗂️ PROJECT CLEANUP PLAN - v1.4.0

## ❌ FILES TO REMOVE (Redundant/Outdated)

### Root Level
- [ ] `src/` - **ENTIRE FOLDER** (código antigo, duplicado de public/src/)
- [ ] `dist/` - **ENTIRE FOLDER** (vazio, não usado)

### Public Folder
- [ ] `public/index.html.backup` - Backup desnecessário (está no git)

### Scripts (Keep only essentials)
- [x] **KEEP:** `scripts/run-local.bat` - Dev server
- [x] **KEEP:** `scripts/deploy-latest.bat` - Deploy automation
- [ ] `scripts/convert-to-webp.ps1` - Já usado, mover para /archive
- [ ] `scripts/convert-webp-simple.ps1` - Já usado, mover para /archive
- [ ] `scripts/extract-js-safe.py` - Já usado, mover para /archive
- [ ] `scripts/extract-js.ps1` - Já usado, mover para /archive
- [ ] `scripts/extract-js.py` - Já usado, mover para /archive
- [ ] `scripts/minify-safe.ps1` - Já usado, mover para /archive
- [ ] `scripts/minify-simple.ps1` - Já usado, mover para /archive
- [ ] `scripts/build-production.ps1` - Não usado, mover para /archive

### Docs (Consolidate)
- [ ] `docs/PROJECT_ORGANIZATION_COMPLETE.md` - Merge com FINAL
- [ ] `docs/PROJECT_ORGANIZATION_FINAL.md` - Merge com COMPLETE
- [x] **KEEP:** `docs/README.md`
- [x] **KEEP:** `docs/INDEX.md`
- [x] **KEEP:** `docs/PROJECT_STRUCTURE.md`

## ✅ FINAL STRUCTURE (Clean & Professional)

```
DungeonScoundrel/
├── .git/
├── .gitignore
├── LICENSE
├── README.md
├── CHANGELOG.md
├── RELEASE_v1.4.0.md
├── DEVELOPMENT.md
├── VERIFY-AUTHOR.md
├── netlify.toml
│
├── public/                    # 🎯 DEPLOYED FILES
│   ├── index.html
│   ├── favicon.svg
│   ├── og-image.png
│   ├── site.webmanifest
│   ├── assets/
│   │   ├── images/
│   │   ├── audio/
│   │   └── fonts/
│   └── src/
│       ├── js/
│       │   └── game.js        # 🎮 MAIN GAME FILE
│       └── styles/
│           └── mobile.css
│
├── scripts/                   # 🛠️ UTILITIES
│   ├── run-local.bat         # Dev server
│   ├── deploy-latest.bat     # Deploy
│   └── archive/              # Old/used scripts
│
├── docs/                      # 📚 DOCUMENTATION
│   ├── README.md
│   ├── INDEX.md
│   └── PROJECT_STRUCTURE.md
│
└── assets/                    # 📦 SOURCE ASSETS
    └── original-images/       # Pre-WebP originals
```

## 🎯 BENEFITS

- ✅ **No Redundancy**: Single source of truth (public/)
- ✅ **Clear Structure**: Easy to navigate
- ✅ **Lightweight**: No duplicate/unused files
- ✅ **Professional**: Production-ready organization
- ✅ **Git History**: All deletions tracked
- ✅ **Rollback Safe**: Can restore from git if needed

## 📊 SAVINGS

**Before:**
- Folders: 8
- Root files: 24+
- Complexity: High

**After:**
- Folders: 4 main
- Root files: 10 essential
- Complexity: Low

**Estimated reduction:** ~40% less clutter

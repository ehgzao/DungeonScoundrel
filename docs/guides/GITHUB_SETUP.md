# 🚀 GitHub Setup Guide

Complete step-by-step guide to publish **Dungeon Scoundrel** on GitHub.

---

## ✅ Prerequisites

Before starting, make sure you have:
- [x] GitHub account ([Create one here](https://github.com/join))
- [x] Git installed ([Download here](https://git-scm.com/))
- [x] Game files ready (you're here!)

---

## 📋 Step-by-Step Guide

### Step 1: Configure Git (First Time Only)

Open your terminal/command prompt and run:

```bash
# Set your name
git config --global user.name "Your Name"

# Set your email (use your GitHub email)
git config --global user.email "your.email@example.com"

# Verify configuration
git config --list
```

---

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click **"+"** (top right) → **"New repository"**
3. Fill in the details:
   - **Repository name:** `DungeonScoundrel` (or your preferred name)
   - **Description:** `A dark medieval roguelike card game - Vibe coded with Windsurf`
   - **Visibility:** Public ✅ (recommended for portfolios)
   - **Initialize repository:** ❌ NO (we already have files)
4. Click **"Create repository"**

---

### Step 3: Initialize Local Repository

Open terminal in your project folder:

```powershell
# Navigate to project folder
cd C:\Users\ehgli\CascadeProjects\DungeonScoundrel

# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Dungeon Scoundrel - Complete game v1.0"
```

---

### Step 4: Connect to GitHub

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual GitHub info:

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Verify remote
git remote -v

# Should show:
# origin  https://github.com/YOUR_USERNAME/YOUR_REPO.git (fetch)
# origin  https://github.com/YOUR_USERNAME/YOUR_REPO.git (push)
```

---

### Step 5: Push to GitHub

```bash
# Push to GitHub (first time)
git push -u origin main

# Or if your default branch is 'master':
git push -u origin master
```

**If you get an authentication error:**
- Modern GitHub requires Personal Access Token (PAT)
- See "Authentication Setup" section below

---

### Step 6: Verify on GitHub

1. Go to your repository URL: `https://github.com/YOUR_USERNAME/YOUR_REPO`
2. You should see all your files!
3. Check if README.md is displayed nicely

---

## 🔐 Authentication Setup

GitHub requires **Personal Access Token** (PAT) instead of password:

### Create PAT:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `Dungeon Scoundrel`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
5. Click **"Generate token"**
6. **COPY THE TOKEN NOW** (you won't see it again!)

### Use PAT:

When git asks for password, use your **PAT instead**.

**Or configure credential helper:**

```bash
# Windows
git config --global credential.helper wincred

# Mac/Linux
git config --global credential.helper store
```

---

## 🌐 Deploy to Netlify (Bonus)

Make your game playable online!

### Option A: Connect GitHub to Netlify

1. Go to [Netlify](https://netlify.com)
2. Sign up with GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Select **GitHub** → Choose your repository
5. Build settings:
   - **Build command:** (leave empty)
   - **Publish directory:** `.` (root)
6. Click **"Deploy site"**
7. Your game is live! Get your URL

### Option B: Drag & Drop

1. Go to [Netlify](https://netlify.com) → **"Sites"**
2. Drag & drop your project folder
3. Done! Get your URL

---

## 📝 Update README URLs

After deploying, update your README.md:

```markdown
# Replace these:
[![Play Now](https://img.shields.io/badge/Play-Now-success?style=for-the-badge)](YOUR_NETLIFY_URL_HERE)

# And:
👉 **[Play Now](YOUR_NETLIFY_URL_HERE)**

# And GitHub links:
![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/YOUR_REPO?style=social)
```

Commit and push changes:

```bash
git add README.md
git commit -m "Update: Add live game URL"
git push
```

---

## 🔄 Future Updates

When you make changes to your game:

```bash
# 1. Check what changed
git status

# 2. Add changes
git add .

# 3. Commit with message
git commit -m "Add: New feature description"

# 4. Push to GitHub
git push

# Netlify will auto-deploy if connected!
```

---

## 📊 Recommended Repository Settings

### 1. Add Topics

Go to your repo → Click ⚙️ next to "About" → Add topics:
- `roguelike`
- `card-game`
- `javascript`
- `html5-game`
- `web-audio-api`
- `medieval`
- `procedural-music`
- `windsurf`
- `ai-assisted`

### 2. Add Description

```
A dark medieval roguelike card game with procedural music - Vibe coded with Windsurf AI
```

### 3. Add Website

Add your Netlify URL in the "Website" field

### 4. Enable Discussions

Settings → Features → ✅ Discussions

### 5. Create Releases

After pushing:
1. Go to **Releases** → **Create a new release**
2. Tag: `v1.0.0`
3. Title: `v1.0.0 - Initial Release`
4. Description:
```markdown
# 🎉 Dungeon Scoundrel v1.0.0

First public release!

## ✨ Features
- 4 difficulty modes
- 5 atmospheric music tracks
- 50 achievements
- Epic boss battles
- Mobile support
- Vibe coded with Windsurf ⚡

[Play Now](YOUR_URL)
```

---

## 🎯 SEO & Discoverability

### Add Social Preview

1. Go to Settings → Social preview
2. Upload a screenshot (1280x640px recommended)
3. This shows when sharing your repo

### Share Your Game

- Reddit: r/roguelikes, r/gamedev, r/WebGames
- Twitter: #gamedev #roguelike #indiegame
- Discord: Gaming communities
- Hacker News: Show HN
- itch.io: Alternative platform

---

## 🐛 Troubleshooting

### Error: "Repository not found"
```bash
# Check remote URL
git remote -v

# Update if wrong
git remote set-url origin https://github.com/CORRECT_USERNAME/CORRECT_REPO.git
```

### Error: "Permission denied"
- Check you're logged into correct GitHub account
- Regenerate PAT and try again
- Use SSH instead of HTTPS

### Error: "Branch diverged"
```bash
# Pull latest changes first
git pull origin main

# Then push
git push
```

### Large Files Error
- Git has 100 MB file limit
- Check `backups/` folder
- Make sure it's in `.gitignore`

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Repository is public on GitHub
- [ ] README displays correctly
- [ ] All files are present (except backups/)
- [ ] No sensitive data (API keys, etc.)
- [ ] Game is playable (if deployed)
- [ ] Links in README work
- [ ] License file is present
- [ ] .gitignore working (no node_modules/, etc.)

---

## 🎉 You're Done!

Your game is now:
- ✅ Version controlled
- ✅ Publicly accessible
- ✅ Ready for contributions
- ✅ Portfolio-ready
- ✅ Shareable with the world!

**Next steps:**
1. Share your game on social media
2. Post on game communities
3. Gather feedback
4. Iterate and improve!

---

## 📞 Need Help?

- [GitHub Docs](https://docs.github.com)
- [Git Handbook](https://guides.github.com/introduction/git-handbook/)
- [Netlify Docs](https://docs.netlify.com)

---

**Made with ⚔️ using [Windsurf](https://codeium.com/windsurf)**

Good luck with your launch! 🚀🏰⚔️

@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 DEPLOY v1.1.0 - Critical Bug Fixes
echo ========================================
echo.

echo 📋 Step 1: Checking git status...
git status
echo.

echo ❓ Ready to deploy? This will:
echo    - Add all changes
echo    - Commit with release notes
echo    - Create tag v1.1.0
echo    - Push to GitHub
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

echo.
echo 📦 Step 2: Adding all changes...
git add .
if errorlevel 1 (
    echo ❌ Error adding files!
    pause
    exit /b 1
)
echo ✅ Files added successfully!
echo.

echo 📝 Step 3: Committing changes...
git commit -m "v1.1.0 - Critical Bug Fixes Release" -m "🐛 CRITICAL BUGS FIXED (12 total):" -m "" -m "Game State Initialization:" -m "- Fixed game.firstAttackDone not initialized" -m "- Fixed game.criticalWarningShown not initialized" -m "- Fixed game.rageStrikeActive not initialized" -m "" -m "Data Structure:" -m "- Removed duplicate properties in game object" -m "" -m "Relic System:" -m "- Fixed healing_study relic not healing" -m "- Fixed Iron Armor not reducing damage" -m "- Fixed Thunder Gauntlet not implemented" -m "" -m "Permanent Unlocks:" -m "- Fixed criticalStrike unlock (10%% 3x damage)" -m "- Fixed lifeSteal unlock (+1 HP perfect kills)" -m "- Fixed thornsArmor unlock (reflect 2 damage)" -m "- Fixed dodgeMaster unlock (2 attacks dodge)" -m "" -m "Critical Logic Error:" -m "- Fixed Thunder Gauntlet/Critical Strike using variable before declaration" -m "" -m "✅ All 25 relics fully functional" -m "✅ All 29 permanent unlocks fully functional" -m "✅ All 6 class abilities verified" -m "✅ Backwards compatible with save data" -m "" -m "See CHANGELOG.md for full details."
if errorlevel 1 (
    echo ❌ Error committing changes!
    echo    Tip: Make sure you have changes to commit
    pause
    exit /b 1
)
echo ✅ Changes committed successfully!
echo.

echo 🏷️  Step 4: Creating tag v1.1.0...
git tag -a v1.1.0 -m "v1.1.0 - Critical Bug Fixes" -m "" -m "12 critical bugs fixed:" -m "- Game state initialization (3 bugs)" -m "- Duplicate properties (1 bug)" -m "- Relic system (3 bugs)" -m "- Permanent unlocks (4 bugs)" -m "- Critical logic error (1 bug)" -m "" -m "All features now working as designed."
if errorlevel 1 (
    echo ⚠️  Warning: Tag v1.1.0 might already exist
    echo    Continuing with push...
    echo.
) else (
    echo ✅ Tag v1.1.0 created successfully!
    echo.
)

echo 🌐 Step 5: Pushing to GitHub main branch...
git push origin main
if errorlevel 1 (
    echo ❌ Error pushing to main branch!
    echo    Check your internet connection and GitHub credentials
    pause
    exit /b 1
)
echo ✅ Successfully pushed to main!
echo.

echo 🏷️  Step 6: Pushing tag to GitHub...
git push origin v1.1.0
if errorlevel 1 (
    echo ⚠️  Warning: Error pushing tag
    echo    The tag might already exist on remote
    echo    Main branch was pushed successfully though!
    echo.
) else (
    echo ✅ Tag pushed successfully!
    echo.
)

echo ========================================
echo ✅ DEPLOY COMPLETE!
echo ========================================
echo.
echo 🎯 Next steps:
echo    1. Check Netlify deploy status:
echo       https://app.netlify.com/sites/dungeonscoundrel/deploys
echo.
echo    2. Wait 2-3 minutes for build to complete
echo.
echo    3. Test the live site:
echo       https://dungeonscoundrel.netlify.app
echo.
echo    4. (Optional) Create GitHub Release:
echo       https://github.com/ehgzao/DungeonScoundrel/releases/new
echo       - Tag: v1.1.0
echo       - Title: v1.1.0 - Critical Bug Fixes 🐛
echo.
echo 🎉 Your game is now live with all 12 bug fixes!
echo.
echo ========================================
echo.
pause
@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 DEPLOY v1.1.1 - Critical Bug Fixes
echo ========================================
echo.

echo 📋 Step 1: Checking git status...
git status
echo.

echo ❓ Ready to deploy v1.1.1? This release includes:
echo    - 13 critical bugs fixed
echo    - Version badge with changelog modal
echo    - Special thanks to Carol, Kamui, Leon & Breno
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
git commit -m "v1.1.1 - Critical Bug Fixes Release" -m "🐛 CRITICAL BUGS FIXED (13 total):" -m "" -m "Game State Initialization:" -m "- Fixed game.firstAttackDone not initialized" -m "- Fixed game.criticalWarningShown not initialized" -m "- Fixed game.rageStrikeActive not initialized" -m "" -m "Data Structure:" -m "- Removed duplicate properties in game object" -m "" -m "Relic System:" -m "- Fixed healing_study relic not healing" -m "- Fixed Iron Armor not reducing damage" -m "- Fixed Thunder Gauntlet not implemented" -m "" -m "Permanent Unlocks:" -m "- Fixed criticalStrike unlock (10%% 3x damage)" -m "- Fixed lifeSteal unlock (+1 HP perfect kills)" -m "- Fixed thornsArmor unlock (reflect 2 damage)" -m "- Fixed dodgeMaster unlock (2 attacks dodge)" -m "" -m "Critical Logic Errors:" -m "- Fixed Thunder Gauntlet/Critical Strike variable order bug" -m "- Fixed Endless mode white screen freeze" -m "" -m "UI Improvements:" -m "- Added version badge v1.1.1 (clickable)" -m "- Added What's New modal with changelog" -m "- Added special thanks section" -m "" -m "✅ All 25 relics fully functional" -m "✅ All 29 permanent unlocks fully functional" -m "✅ All 6 class abilities verified" -m "✅ Endless mode verified" -m "✅ Backwards compatible with save data" -m "" -m "🙏 Special thanks to Carol, Kamui, Leon & Breno for testing!" -m "" -m "See CHANGELOG.md for full details."
if errorlevel 1 (
    echo ❌ Error committing changes!
    pause
    exit /b 1
)
echo ✅ Changes committed successfully!
echo.

echo 🏷️  Step 4: Creating tag v1.1.1...
git tag -a v1.1.1 -m "v1.1.1 - Critical Bug Fixes" -m "" -m "13 critical bugs fixed" -m "Special thanks to Carol, Kamui, Leon & Breno" -m "" -m "All features now working as designed."
if errorlevel 1 (
    echo ⚠️  Warning: Tag v1.1.1 might already exist
    echo    Continuing with push...
    echo.
) else (
    echo ✅ Tag v1.1.1 created successfully!
    echo.
)

echo 🌐 Step 5: Pushing to GitHub main branch...
git push origin main
if errorlevel 1 (
    echo ❌ Error pushing to main branch!
    pause
    exit /b 1
)
echo ✅ Successfully pushed to main!
echo.

echo 🏷️  Step 6: Pushing tag to GitHub...
git push origin v1.1.1
if errorlevel 1 (
    echo ⚠️  Warning: Error pushing tag
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
echo    1. Netlify: https://app.netlify.com/sites/dungeonscoundrel/deploys
echo    2. Wait 2-3 minutes for build
echo    3. Test: https://dungeonscoundrel.netlify.app
echo    4. Click v1.1.1 badge to see changelog!
echo.
echo 🙏 Thanks to Carol, Kamui, Leon & Breno!
echo.
echo 🎉 Your game is live with all 13 bug fixes!
echo ========================================
echo.
pause
@echo off
echo ========================================
echo   DUNGEON SCOUNDREL - GIT DEPLOY v1.1.2
echo ========================================
echo.

echo [1/5] Checking Git status...
git status
echo.

echo [2/5] Adding all changes...
git add .
echo.

echo [3/5] Creating commit...
git commit -m "Release v1.1.2: Speedrunner overhaul and modal bug fixes

## Speedrunner System Overhaul
- Changed scoring: +1000 (<1min), +500 (1-5min), 0 (>5min)
- Fixed achievement: now requires <1 minute (was <10 minutes)
- Fixed unlock: now requires <1 minute (was <5 minutes)
- Updated all speedrunner text references (3 locations)

## Critical Bug Fixes
- Fixed Shop modal X button not re-enabling game buttons (Bug #14)
- Fixed Event modal X button not re-enabling game buttons (Bug #15)
- Removed duplicate achievement unlock code (Bug #16)

## Technical Improvements
- Added closeShopWrapper() global function
- Added closeEventWrapper() global function
- Consistent modal close behavior across all modals

## Documentation
- Updated CHANGELOG.md with v1.1.2 release notes
- Documented all bug fixes and gameplay changes

Version: v1.1.2"
echo.

echo [4/5] Pushing to remote...
git push
echo.

echo [5/5] Tagging release...
git tag -a v1.1.2 -m "Release v1.1.2: Speedrunner overhaul and modal bug fixes"
git push --tags
echo.

echo ========================================
echo   DEPLOY COMPLETE! v1.1.2
echo ========================================
echo.
echo Changes deployed:
echo - Speedrunner scoring overhaul
echo - 3 critical bug fixes
echo - CHANGELOG updated
echo.
pause
@echo off
REM ====================================================================
REM DUNGEON SCOUNDREL - DEPLOYMENT SCRIPT
REM Version: Latest (Consolidates all previous versions)
REM ====================================================================

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         DUNGEON SCOUNDREL - DEPLOYMENT WIZARD                  ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check for uncommitted changes
echo [1/6] Checking for uncommitted changes...
git status --porcelain > nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Not a git repository
    pause
    exit /b 1
)

git diff-index --quiet HEAD --
if errorlevel 1 (
    echo.
    echo ⚠️  WARNING: You have uncommitted changes!
    echo.
    git status --short
    echo.
    set /p CONTINUE="Continue anyway? (y/N): "
    if /i not "%CONTINUE%"=="y" (
        echo Deployment cancelled.
        pause
        exit /b 1
    )
)

echo ✅ Git repository OK
echo.

REM Get current version
echo [2/6] Current version check...
for /f "tokens=*" %%a in ('git describe --tags --abbrev=0 2^>nul') do set CURRENT_VERSION=%%a
if "%CURRENT_VERSION%"=="" set CURRENT_VERSION=v1.0.0
echo Current version: %CURRENT_VERSION%
echo.

REM Ask for new version
echo [3/6] Version bump...
echo.
echo Select version bump type:
echo   1. Patch (bug fixes)      - %CURRENT_VERSION% → vX.X.(X+1)
echo   2. Minor (new features)   - %CURRENT_VERSION% → vX.(X+1).0
echo   3. Major (breaking)       - %CURRENT_VERSION% → v(X+1).0.0
echo   4. Custom version
echo   5. Cancel
echo.
set /p VERSION_TYPE="Your choice (1-5): "

if "%VERSION_TYPE%"=="5" (
    echo Deployment cancelled.
    pause
    exit /b 0
)

if "%VERSION_TYPE%"=="4" (
    set /p NEW_VERSION="Enter new version (e.g., v1.2.0): "
) else (
    REM Auto-increment based on choice
    REM This is simplified - you'd need more complex logic for real auto-increment
    set /p NEW_VERSION="Enter new version: "
)

echo New version will be: %NEW_VERSION%
echo.

REM Get commit message
echo [4/6] Commit message...
set /p COMMIT_MSG="Enter commit message (or press Enter for default): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Release %NEW_VERSION%

echo Commit: %COMMIT_MSG%
echo.

REM Confirm deployment
echo [5/6] Deployment confirmation...
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║ DEPLOYMENT SUMMARY                                             ║
echo ╠════════════════════════════════════════════════════════════════╣
echo ║ Version:  %NEW_VERSION%                                    
echo ║ Message:  %COMMIT_MSG%
echo ║ Branch:   main                                                 ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
set /p CONFIRM="Proceed with deployment? (y/N): "
if /i not "%CONFIRM%"=="y" (
    echo Deployment cancelled.
    pause
    exit /b 0
)

echo.
echo [6/6] Deploying...
echo.

REM Git operations
echo ► Adding all changes...
git add .
if errorlevel 1 goto :error

echo ► Committing...
git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
    echo ⚠️  Nothing to commit or commit failed
)

echo ► Creating tag %NEW_VERSION%...
git tag -a %NEW_VERSION% -m "Release %NEW_VERSION%: %COMMIT_MSG%"
if errorlevel 1 goto :error

echo ► Pushing to origin...
git push origin main
if errorlevel 1 goto :error

echo ► Pushing tags...
git push origin --tags
if errorlevel 1 goto :error

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║ ✅ DEPLOYMENT SUCCESSFUL!                                      ║
echo ╠════════════════════════════════════════════════════════════════╣
echo ║ Version:  %NEW_VERSION%                                    
echo ║ Status:   Deployed to GitHub                                   ║
echo ║ Netlify:  Will auto-deploy in ~2 minutes                       ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 🌐 Check deployment status:
echo    https://app.netlify.com/
echo.
echo 🎮 Live site:
echo    https://dungeonscoundrel.netlify.app/
echo.

pause
exit /b 0

:error
echo.
echo ❌ ERROR: Deployment failed!
echo.
pause
exit /b 1

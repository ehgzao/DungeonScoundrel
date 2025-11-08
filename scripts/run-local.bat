@echo off
REM ====================================================================
REM DUNGEON SCOUNDREL - LOCAL SERVER
REM Starts a local HTTP server to avoid CORS issues
REM ====================================================================

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         DUNGEON SCOUNDREL - LOCAL SERVER                       ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found!
    echo.
    echo Please install Python from https://www.python.org/
    echo OR use another method:
    echo.
    echo 1. Node.js: npx serve .
    echo 2. PHP: php -S localhost:8080
    echo 3. VS Code: Install "Live Server" extension
    echo.
    pause
    exit /b 1
)

echo ✅ Python found!
echo.
echo Starting local server on http://localhost:8080
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║ 🎮 Open your browser and visit:                                ║
echo ║                                                                 ║
echo ║    http://localhost:8080                                       ║
echo ║                                                                 ║
echo ║ Press CTRL+C to stop the server                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Start Python HTTP server
python -m http.server 8080

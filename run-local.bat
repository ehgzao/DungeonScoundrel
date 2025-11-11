@echo off
echo ========================================
echo DUNGEON SCOUNDREL - LOCAL SERVER
echo ========================================
echo.
echo Starting local server on http://localhost:8080
echo Press Ctrl+C to stop
echo.
cd public
python -m http.server 8080

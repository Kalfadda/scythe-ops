@echo off
echo ========================================
echo    ScytheView - Building Application
echo ========================================
echo.

cd /d "%~dp0"

echo Installing dependencies if needed...
call npm install

echo.
echo Building Tauri application...
call npm run tauri build

echo.
echo ========================================
echo    Build Complete!
echo ========================================
echo.
echo Installer location: src-tauri\target\release\bundle\
pause

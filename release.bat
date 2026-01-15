@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Scythe Ops Release Script
echo ========================================
echo.

:: Step 1: Run the signed build
echo [1/6] Building signed release...
call build-signed.bat
if errorlevel 1 (
    echo ERROR: Build failed!
    exit /b 1
)
echo.

:: Step 2: Extract version from tauri.conf.json
echo [2/6] Extracting version...
for /f "tokens=2 delims=:," %%a in ('findstr /C:"\"version\":" src-tauri\tauri.conf.json') do (
    set "VERSION=%%~a"
    set "VERSION=!VERSION: =!"
    set "VERSION=!VERSION:"=!"
    goto :got_version
)
:got_version
echo Version: %VERSION%
echo.

:: Step 3: Generate latest.json
echo [3/6] Generating latest.json...
set "NSIS_DIR=src-tauri\target\release\bundle\nsis"
set "BUNDLE_DIR=src-tauri\target\release\bundle"
set "SIG_FILE=%NSIS_DIR%\Scythe Ops_%VERSION%_x64-setup.exe.sig"

:: Read signature from file
set /p SIGNATURE=<"%SIG_FILE%"

:: Get current timestamp
for /f %%a in ('powershell -command "Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'"') do set "TIMESTAMP=%%a"

:: Write latest.json
(
echo {
echo   "version": "%VERSION%",
echo   "notes": "See release notes on GitHub",
echo   "pub_date": "%TIMESTAMP%",
echo   "platforms": {
echo     "windows-x86_64": {
echo       "signature": "%SIGNATURE%",
echo       "url": "https://github.com/Kalfadda/scythe-ops/releases/download/v%VERSION%/Scythe.Ops_%VERSION%_x64-setup.exe"
echo     }
echo   }
echo }
) > "%BUNDLE_DIR%\latest.json"
echo latest.json generated.
echo.

:: Step 4: Git commit and push
echo [4/6] Committing changes to git...
git add -A
git commit -m "Release v%VERSION%"
if errorlevel 1 (
    echo No changes to commit or commit failed, continuing...
)
echo.

echo [5/6] Pushing to GitHub...
git pull --rebase
git push
if errorlevel 1 (
    echo ERROR: Failed to push to GitHub!
    exit /b 1
)
echo.

:: Step 5: Create GitHub release
echo [6/6] Creating GitHub release v%VERSION%...
gh release create "v%VERSION%" ^
    "%NSIS_DIR%\Scythe Ops_%VERSION%_x64-setup.exe" ^
    "%NSIS_DIR%\Scythe Ops_%VERSION%_x64-setup.exe.sig" ^
    "src-tauri\target\release\bundle\msi\Scythe Ops_%VERSION%_x64_en-US.msi" ^
    "src-tauri\target\release\bundle\msi\Scythe Ops_%VERSION%_x64_en-US.msi.sig" ^
    "%BUNDLE_DIR%\latest.json" ^
    --title "v%VERSION%" ^
    --notes "Release v%VERSION% - See commit history for changes"

if errorlevel 1 (
    echo ERROR: Failed to create GitHub release!
    exit /b 1
)

echo.
echo ========================================
echo Release v%VERSION% published successfully!
echo https://github.com/Kalfadda/scythe-ops/releases/tag/v%VERSION%
echo ========================================

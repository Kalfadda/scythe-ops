@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Scythe Ops Release Script
echo ========================================
echo.

:: Step 1: Increment version and build with signing
echo [1/5] Incrementing version and building...
set TAURI_SIGNING_PRIVATE_KEY=dW50cnVzdGVkIGNvbW1lbnQ6IHJzaWduIGVuY3J5cHRlZCBzZWNyZXQga2V5ClJXUlRZMEl5UnZlbFZMaDZTdm03RklHR2Z1MVZReUtmUlBlZ2o3MkF0T3RTQ3NDNCt0UUFBQkFBQUFBQUFBQUFBQUlBQUFBQXJCakZGcmFNYUIvOWZvbGlNd3g3TUVMbDZkNmFJR3lnTUVyZWd3NkZWQ3VKNXlCSGYxdXZmUzBYbUVUKzFLRE5rOEl6aHUwbnI0dk43TnJ5WGpXMEthRzRvcHNjN1VPV1pPbFNRODh0Uk0wQWxTTlBKYzZDd3d2Z2ZtZWIzMG5La05EeWtGQnA3S289Cg==
set TAURI_SIGNING_PRIVATE_KEY_PASSWORD=scythe
call npm run release
if errorlevel 1 (
    echo ERROR: Build failed!
    exit /b 1
)
echo.

:: Step 2: Extract version from tauri.conf.json
echo [2/5] Extracting version...
for /f "tokens=2 delims=:," %%a in ('findstr /C:"\"version\":" src-tauri\tauri.conf.json') do (
    set "VERSION=%%~a"
    set "VERSION=!VERSION: =!"
    set "VERSION=!VERSION:"=!"
    goto :got_version
)
:got_version
echo Version: %VERSION%
echo.

:: Step 3: Generate latest.json with signature
echo [3/5] Generating latest.json...
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
echo [4/5] Committing and pushing to GitHub...
git add -A
git commit -m "Release v%VERSION%"
if errorlevel 1 (
    echo No changes to commit, continuing...
)
git push
if errorlevel 1 (
    echo ERROR: Failed to push to GitHub!
    exit /b 1
)
echo.

:: Step 5: Create GitHub release
echo [5/5] Creating GitHub release v%VERSION%...
gh release create "v%VERSION%" ^
    "%NSIS_DIR%\Scythe Ops_%VERSION%_x64-setup.exe" ^
    "%NSIS_DIR%\Scythe Ops_%VERSION%_x64-setup.exe.sig" ^
    "src-tauri\target\release\bundle\msi\Scythe Ops_%VERSION%_x64_en-US.msi" ^
    "src-tauri\target\release\bundle\msi\Scythe Ops_%VERSION%_x64_en-US.msi.sig" ^
    "%BUNDLE_DIR%\latest.json" ^
    --title "v%VERSION%" ^
    --generate-notes

if errorlevel 1 (
    echo ERROR: Failed to create GitHub release!
    exit /b 1
)

echo.
echo ========================================
echo Release v%VERSION% published successfully!
echo https://github.com/Kalfadda/scythe-ops/releases/tag/v%VERSION%
echo ========================================

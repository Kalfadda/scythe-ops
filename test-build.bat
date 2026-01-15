@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Scythe Ops Test Build Script
echo ========================================
echo This builds and signs without version increment or GitHub release.
echo.

:: Step 1: Build with signing (no version increment)
echo [1/3] Building with signing...
set TAURI_SIGNING_PRIVATE_KEY=dW50cnVzdGVkIGNvbW1lbnQ6IHJzaWduIGVuY3J5cHRlZCBzZWNyZXQga2V5ClJXUlRZMEl5UnZlbFZMaDZTdm03RklHR2Z1MVZReUtmUlBlZ2o3MkF0T3RTQ3NDNCt0UUFBQkFBQUFBQUFBQUFBQUlBQUFBQXJCakZGcmFNYUIvOWZvbGlNd3g3TUVMbDZkNmFJR3lnTUVyZWd3NkZWQ3VKNXlCSGYxdXZmUzBYbUVUKzFLRE5rOEl6aHUwbnI0dk43TnJ5WGpXMEthRzRvcHNjN1VPV1pPbFNRODh0Uk0wQWxTTlBKYzZDd3d2Z2ZtZWIzMG5La05EeWtGQnA3S289Cg==
set TAURI_SIGNING_PRIVATE_KEY_PASSWORD=scythe
call npm run tauri build
if errorlevel 1 (
    echo ERROR: Build failed!
    exit /b 1
)
echo.

:: Step 2: Extract version from tauri.conf.json
echo [2/3] Extracting version...
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
echo [3/3] Generating latest.json...
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
echo   "notes": "Test build - not released",
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

echo ========================================
echo Test build v%VERSION% completed!
echo.
echo Installers located at:
echo   NSIS: %NSIS_DIR%\Scythe Ops_%VERSION%_x64-setup.exe
echo   MSI:  src-tauri\target\release\bundle\msi\Scythe Ops_%VERSION%_x64_en-US.msi
echo.
echo Or run directly:
echo   src-tauri\target\release\scytheops.exe
echo ========================================

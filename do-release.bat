@echo off
cd /d E:\ScytheView
for /f "usebackq delims=" %%a in ("src-tauri\.tauri-updater-key") do set "TAURI_SIGNING_PRIVATE_KEY=%%a"
set TAURI_SIGNING_PRIVATE_KEY_PASSWORD=
echo Key loaded successfully
npm run tauri build

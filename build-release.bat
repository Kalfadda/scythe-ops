@echo off
setlocal enabledelayedexpansion
set /p TAURI_SIGNING_PRIVATE_KEY=<src-tauri\.tauri-updater-key
call npm run tauri build
endlocal

@echo off
title BarCode Studio - Remote Host
echo ========================================================
echo   Starting BarCode Studio Dev Server & Cloudflare Tunnel
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting Vite Server...
start "Vite Dev Server" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Cloudflare Tunnel...
if exist "C:\Users\ASTOROTH-X\bin\cloudflared.exe" (
    "C:\Users\ASTOROTH-X\bin\cloudflared.exe" tunnel --url http://localhost:5173
) else (
    echo cloudflared.exe not found at C:\Users\ASTOROTH-X\bin\cloudflared.exe
    pause
)

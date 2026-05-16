@echo off
chcp 65001 >nul
cd /d "%~dp0"
title YK Music Center - Yerel Site
echo.
echo  Oykü Music Center - yerel sunucu baslatiliyor...
echo.

if not exist "node_modules\next\dist\bin\next" (
  echo  Paketler kuruluyor (ilk sefer, 1-2 dk)...
  call npm.cmd install
  if errorlevel 1 (
    echo  HATA: npm install basarisiz.
    pause
    exit /b 1
  )
)

call scripts\setup-local.cmd
if errorlevel 1 (
  echo.
  echo  Kurulum tamamlanamadi. Yukaridaki hatayi kontrol edin.
  pause
  exit /b 1
)

echo.
echo  Tarayicida acin:  http://localhost:3000
echo  Durdurmak icin:   Ctrl+C
echo.
node node_modules\next\dist\bin\next dev
pause

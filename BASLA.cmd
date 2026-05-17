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

call scripts\free-port-3003.cmd

echo.
echo  Oykü Music Center (bu proje):
echo  Site:             http://localhost:3003
echo  Admin giris:      http://localhost:3003/admin/login
echo.
echo  NOT: localhost:3000 baska projedir — Music Center icin 3003 kullanin.
echo  Durdurmak icin:   Ctrl+C
echo.
echo  (Internetten giris icin CANLI-SITE.cmd - istege bagli)
echo.
node node_modules\next\dist\bin\next dev -p 3003
pause

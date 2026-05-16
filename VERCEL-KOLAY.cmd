@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Vercel - 3 adim kurulum
cls
echo.
echo  ============================================================
echo    VERCEL - Sadece 3 kopyala-yapistir (2 dakika)
echo  ============================================================
echo.
echo  ADIM 1) Tarayici acilacak - Vercel projenize girin
echo         (yk-music-center veya benzer isim)
echo.
echo  ADIM 2) Settings - Environment Variables - Add New
echo         Asagidaki 3 satiri TEK TEK ekleyin (Production):
echo.
echo  -------- KOPYALA --------

if exist ".env" (
  for /f "usebackq tokens=1,* delims==" %%a in (`findstr /i /b "DATABASE_URL JWT_SECRET NEXT_PUBLIC_APP_URL" .env 2^>nul`) do (
    echo  %%a=%%b
  )
) else (
  echo  DATABASE_URL=file:./prisma/dev.db
  echo  JWT_SECRET=(en az 32 karakter rastgele metin)
  echo  NEXT_PUBLIC_APP_URL=https://PROJE-ADINIZ.vercel.app
)

echo  -------------------------
echo.
echo  ADIM 3) Deployments - en ustteki - ... menu - Redeploy
echo          "Clear build cache" isaretleyin - Redeploy
echo.
echo  Stale yazanlari YOK SAYIN. Sadece en ust satira bakin.
echo.
pause
start https://vercel.com/dashboard
echo.
echo  Dashboard acildi. 3 degiskeni ekleyip Redeploy yapin.
echo.
pause

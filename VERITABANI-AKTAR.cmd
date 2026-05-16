@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Veritabani - Canli site + yerel (Turso YOK)
cls
echo.
echo  ============================================================
echo    OGRENCILERI CANLI SITEYE AKTAR (Turso gerekmez)
echo  ============================================================
echo.
echo  ADIM 1) vercel.com - Integrations - Neon - Install
echo         Projeyi baglayin. Settings - Environment Variables:
echo         DATABASE_URL=file:./dev.db VARSA SILIN (canli site bozulur)
echo.
echo  ADIM 2) Neon - DATABASE_URL veya POSTGRES_PRISMA_URL KOPYALA
echo.
echo  ADIM 3) Bu klasorde .env dosyasi acin, su satiri ekleyin:
echo         DATABASE_URL=(kopyaladiginiz adres)
echo         (tirnak isareti olmadan da olur)
echo.
echo  ADIM 4) Asagida Enter - yerel ogrenciler buluta aktarilacak
echo.
pause

if not exist ".env" (
  echo.
  echo  .env yok. ADIM 3 u yapin, dosyayi kaydedin, bu pencereyi tekrar acin.
  pause
  exit /b 1
)

call npm.cmd install
call npm.cmd run prisma:generate
echo.
echo  Aktarim basliyor...
call npm.cmd run db:upload-local
if errorlevel 1 (
  echo.
  echo  Aktarim basarisiz. .env icinde DATABASE_URL dogru mu?
  pause
  exit /b 1
)

echo.
echo  ADIM 5) Vercel - Deployments - Redeploy (son commit ile)
echo.
echo  Sonra canli sitede /admin - ogrenci listesi gorunmeli.
echo.
pause
start https://vercel.com/dashboard

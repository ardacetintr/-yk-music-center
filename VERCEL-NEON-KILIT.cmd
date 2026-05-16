@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Vercel - DATABASE_URL kilitli (normal)
cls
echo.
echo  DATABASE_URL KILITLI GORUNUYORSA — PANIK YOK
echo  =============================================
echo.
echo  Neon bagladiginizda Vercel bu satiri KILITLER.
echo  Elle duzenlemeniz gerekmez; Neon yonetir.
echo.
echo  1) Kilitli satirin DEGERINE bakin (goster/göz ikonu):
echo     - postgresql://... veya postgres://...  = DOGRU, dokunmayin
echo     - file:./dev.db                       = YANLIS, asagidaki 2. adim
echo.
echo  2) file:./dev.db ise (nadir):
echo     Vercel - Storage - Neon veritabaniniz
echo     - Projects: projeyi cikarip tekrar baglayin
echo     VEYA Integrations - Neon - Manage - projeyi yeniden bagla
echo     Sonra Deployments - Redeploy
echo.
echo  3) postgresql ise:
echo     Deployments - son deploy Ready olsun
echo     Canli site /admin - giris
echo     "Verileri yukle (96 ogrenci)" dugmesine basin
echo.
echo  Yerel bilgisayarda ogrenci aktarimi icin:
echo     Neon - Connection string - .env dosyasina DATABASE_URL=...
echo     VERITABANI-AKTAR.cmd
echo.
pause
start https://vercel.com/dashboard

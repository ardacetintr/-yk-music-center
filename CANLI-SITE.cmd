@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Canli site - istege bagli
cls
echo.
echo  ============================================================
echo    CANLI SITE (internetten giris) - Istege bagli
echo  ============================================================
echo.
echo  Sadece okulda admin girisi:
echo    BASLA.cmd - http://localhost:3000/admin/login
echo    Baska kurulum gerekmez.
echo.
echo  -----------------------------------------------------------
echo  Musteri evinden Chrome ile giris:
echo  -----------------------------------------------------------
echo.
echo  1) vercel.com - projeniz - Integrations - Turso - Add
echo     (Otomatik baglanir, elle kopyalama yok)
echo.
echo  2) Environment Variables:
echo     JWT_SECRET = en az 32 karakter
echo     NEXT_PUBLIC_APP_URL = https://xxx.vercel.app
echo.
echo  3) Deployments - Redeploy
echo.
echo  Admin: 05064363881 / savasay1305
echo.
pause
start https://vercel.com/dashboard

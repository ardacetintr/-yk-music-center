@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Vercel Production - Postgres baglantisi
cls
echo.
echo  VERI NEON'DA VAR — CANLI SITE BAGLANAMIYOR
echo  ==========================================
echo.
echo  Sebep: Vercel Production ortaminda postgres adresi yok.
echo  (Neon bagli gorunur ama env Production'a yazilmamis olabilir.)
echo.
echo  COZUM (2 dk):
echo.
echo  1) Bu klasordeki .env dosyasini acin
echo  2) DATABASE_URL= satirindaki postgresql://... adresini KOPYALAYIN
echo  3) vercel.com - Projeniz - Settings - Environment Variables
echo  4) Add New:
echo       Name:   YK_DATABASE_URL
echo       Value:  (yapistir)
echo       Environment: sadece PRODUCTION isaretli
echo  5) Save
echo  6) Deployments - Redeploy
echo.
echo  Not: DATABASE_URL kilitli kalabilir; YK_DATABASE_URL kullanilir.
echo.
pause
notepad ".env"
start https://vercel.com/dashboard

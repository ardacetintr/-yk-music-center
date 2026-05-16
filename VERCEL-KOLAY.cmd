@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo  Okul icinde: BASLA.cmd yeterli.
echo  Internetten: CANLI-SITE.cmd
pause
start https://vercel.com/dashboard

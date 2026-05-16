@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Neon icindeki veriler - eski -^> yeni
cls
echo.
echo  ESKI Neon (patient-silence) icindeki TABLOLARI
echo  YENI Neon (green-star) icine kopyalar.
echo.
echo  Yedek: prisma\data\neon-backup-eski.json
echo  Eski baglanti: .env.backup-neon-eski
echo  Yeni baglanti: .env (green-star)
echo.
pause
call npm.cmd install
call npm.cmd run prisma:generate
call npm.cmd run db:copy-neon
pause

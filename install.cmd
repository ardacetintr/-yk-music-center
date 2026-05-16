@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo  Paketler kuruluyor...
call npm.cmd install
if errorlevel 1 goto fail

echo  Yerel ayarlar kontrol ediliyor...
call scripts\setup-local.cmd
if errorlevel 1 goto fail

echo.
echo  Kurulum tamam. Siteyi acmak icin BASLA.cmd calistirin.
goto end

:fail
echo  Kurulum basarisiz.
pause
exit /b 1

:end
pause

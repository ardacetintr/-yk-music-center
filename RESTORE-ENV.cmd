@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist ".env.backup-neon-eski" (
  echo Yedek yok.
  pause
  exit /b 1
)
copy /Y ".env" ".env.oncesi-restore" >nul
powershell -NoProfile -Command "$b=(Get-Content '.env.backup-neon-eski'|?{$_ -match '^DATABASE_URL='}); (Get-Content '.env')|%%{if($_ -match '^DATABASE_URL='){$b}else{$_}}|Set-Content '.env'"
echo Tamam: eski Neon (patient-silence) .env ye geri alindi.
pause

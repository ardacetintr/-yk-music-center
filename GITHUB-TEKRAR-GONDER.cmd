@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo  Vercel icin yeniden deploy tetikleniyor...
git commit --allow-empty -m "chore: trigger Vercel redeploy"
git push origin main
if errorlevel 1 (
  echo  Push basarisiz - internet veya GitHub girisini kontrol edin.
) else (
  echo  Tamam. Vercel 1-2 dk icinde yeni deploy baslatir.
)
pause

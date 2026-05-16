@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Ogrencileri canli siteye aktar
cls
echo.
echo  ============================================================
echo    YEREL OGRENCILER (dev.db) -^> NEON (canli site)
echo  ============================================================
echo.
echo  ONEMLI — IKI FARKLI YER:
echo.
echo  [A] VERCEL (canli site) — DATABASE_URL KILITLI = NORMAL
echo      Neon yonetir. Buraya dokunmayin.
echo      Canli /admin icinde "Verileri yukle" yeterli olabilir.
echo.
echo  [B] BU BILGISAYAR — .env dosyasi (proje klasoru)
echo      Sadece asagidaki aktarim icin Neon adresini BURAYA yazariz.
echo      Vercel'deki kilitli satiri kopyalayip .env ye yapistirin.
echo.
echo  ----------------------------------------------------------
echo  Neon adresi nereden?
echo    vercel.com - Storage - Neon veritabani
echo    veya Integrations - Neon - Connection string
echo    postgresql:// ile baslayan uzun metin
echo.
echo  .env ornegi (file:./dev.db SATIRINI SILIN veya ustune yazin):
echo    DATABASE_URL=postgresql://....neon.tech/....?sslmode=require
echo.
echo  ----------------------------------------------------------
echo  Hazirsaniz Enter — dev.db -^> Neon aktarimi baslar
echo  (Sadece canli admin kullanacaksaniz Esc ile cikis, /admin acin)
echo.
pause

if not exist "prisma\dev.db" (
  echo.
  echo  HATA: prisma\dev.db yok. Once okulda BASLA.cmd ile kayit yapilmis olmali.
  pause
  exit /b 1
)

if not exist ".env" (
  echo.
  echo  .env yok — olusturuluyor...
  copy /Y ".env.example" ".env" >nul 2>&1
  echo  Not Defteri aciliyor. Neon postgresql adresini DATABASE_URL= satirina yapistirin.
  echo  file:./dev.db varsa silin. Kaydedin, bu dosyayi tekrar calistirin.
  notepad ".env"
  pause
  exit /b 0
)

findstr /I /C:"file:./dev.db" /C:"file:.\dev.db" ".env" >nul 2>&1
if not errorlevel 1 (
  echo.
  echo  UYARI: .env icinde hala file:./dev.db var!
  echo  Neon postgresql adresiyle DEGISTIRIN. Not Defteri aciliyor...
  notepad ".env"
  echo  Kaydettikten sonra Enter...
  pause
)

findstr /I "postgresql://" ".env" >nul 2>&1
if errorlevel 1 (
  findstr /I "postgres://" ".env" >nul 2>&1
  if errorlevel 1 (
    echo.
    echo  UYARI: .env icinde postgresql:// adresi gorunmuyor.
    echo  Neon baglanti satirini ekleyin. Not Defteri aciliyor...
    notepad ".env"
    echo  Kaydettikten sonra Enter...
    pause
  )
)

call npm.cmd install
call npm.cmd run prisma:generate
echo.
echo  Aktarim: prisma\dev.db -^> Neon (Vercel bulutu)...
call npm.cmd run db:upload-local
if errorlevel 1 (
  echo.
  echo  Aktarim basarisiz.
  echo  - .env icinde DATABASE_URL postgresql:// mi?
  echo  - Neon sifresi dogru mu?
  pause
  exit /b 1
)

echo.
echo  ============================================================
echo  TAMAM — Ogrenciler Neon'a yuklendi.
echo  ============================================================
echo.
echo  Son adim: vercel.com - Deployments - Redeploy (istege bagli)
echo  Canli site: /admin — liste gorunmeli (gerekirse Verileri yukle)
echo.
pause
start https://vercel.com/dashboard
TAMAM

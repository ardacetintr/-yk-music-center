@echo off
setlocal
cd /d "%~dp0\.."

if not exist ".env" (
  if not exist ".env.example" (
    echo.
    echo  HATA: .env.example bulunamadi.
    exit /b 1
  )
  copy /Y ".env.example" ".env" >nul
  echo  .env dosyasi olusturuldu.
)

if not exist "node_modules\prisma" (
  echo  Paketler eksik, once: npm.cmd install
  exit /b 1
)

call npm.cmd run prisma:generate >nul 2>&1
if errorlevel 1 (
  echo  prisma generate basarisiz.
  exit /b 1
)

findstr /i "postgresql:// postgres://" .env >nul 2>&1
if errorlevel 1 (
  echo.
  echo  UYARI: .env icinde Postgres URL yok — sadece yerel sqlite kullaniliyor olabilir.
  echo  Canli site icin: VERITABANI-AKTAR.cmd
  echo.
) else (
  echo  Veritabani kontrol ediliyor...
  call npm.cmd run db:setup
  if errorlevel 1 (
    echo  Veritabani kurulumu basarisiz.
    exit /b 1
  )
)

exit /b 0

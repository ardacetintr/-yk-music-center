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
  echo  Prisma paketleri eksik, once: npm.cmd install
  exit /b 1
)

call npm.cmd run prisma:generate >nul 2>&1
if errorlevel 1 (
  echo  prisma generate basarisiz.
  exit /b 1
)

if not exist "prisma\dev.db" (
  echo  Veritabani ilk kez kuruluyor (1-2 dk)...
  call npm.cmd run db:setup
  if errorlevel 1 (
    echo  Veritabani kurulumu basarisiz.
    exit /b 1
  )
  echo  Veritabani hazir.
)

exit /b 0

@echo off
setlocal
rem 3003 — YK Music Center yerel portu (3000 baska projede kalabilir)
set "FOUND=0"
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3003" ^| findstr "LISTENING"') do (
  set "FOUND=1"
  echo  Port 3003 — PID %%a kapatiliyor...
  taskkill /F /PID %%a >nul 2>&1
)
if "%FOUND%"=="0" (
  echo  Port 3003 bos.
) else (
  echo  Port 3003 temizlendi.
  ping -n 2 127.0.0.1 >nul
)
endlocal

@echo off
setlocal
rem 3000 portunda kalan eski Next.js / node surecini kapatir (site acilmiyorsa)
set "FOUND=0"
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3000" ^| findstr "LISTENING"') do (
  set "FOUND=1"
  echo  Port 3000 — PID %%a kapatiliyor...
  taskkill /F /PID %%a >nul 2>&1
)
if "%FOUND%"=="0" (
  echo  Port 3000 bos.
) else (
  echo  Port 3000 temizlendi.
  ping -n 2 127.0.0.1 >nul
)
endlocal

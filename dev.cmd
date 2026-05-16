@echo off
cd /d "%~dp0"
if not exist "node_modules\next\dist\bin\next" (
  echo Paketler yuklu degil. Once calistirin: npm.cmd install
  pause
  exit /b 1
)
echo Site: http://localhost:3000
node node_modules\next\dist\bin\next dev

@echo off
cd /d "%~dp0\.."
call scripts\free-port-3000.cmd
node node_modules\next\dist\bin\next dev -p 3000

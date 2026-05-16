@echo off
cd /d "%~dp0"
npm.cmd install
if errorlevel 1 pause

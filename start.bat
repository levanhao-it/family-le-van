@echo off
echo ============================================
echo  FAMILY GENEALOGY PLATFORM — SETUP & RUN
echo ============================================
echo.
echo Installing dependencies...
cd /d "%~dp0"
call npm install
echo.
echo Starting development server...
call npm run dev
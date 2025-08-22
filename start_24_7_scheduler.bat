@echo off
echo ========================================
echo    24/7 PIR Sensor Scheduler
echo ========================================
echo Starting continuous operation...
echo This will run 24/7 until manually stopped
echo.
echo To STOP the scheduler:
echo   - Press Ctrl+C in this window
echo   - Or close this command window
echo.
echo Scheduler will auto-restart on errors
echo ========================================
echo.

cd /d "d:\GRT-AI"

:restart
echo [%date% %time%] Starting PIR Scheduler...
node scheduler.js

echo.
echo [%date% %time%] Scheduler stopped. Restarting in 10 seconds...
echo Press Ctrl+C now to prevent restart
timeout /t 10 /nobreak >nul
goto restart

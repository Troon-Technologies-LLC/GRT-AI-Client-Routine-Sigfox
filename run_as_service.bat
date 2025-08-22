@echo off
echo ========================================
echo    PIR Scheduler - Windows Service Mode
echo ========================================
echo.
echo Starting scheduler as background service...
echo This will run hidden in the background
echo.
echo To stop: Run stop_scheduler.bat
echo ========================================
echo.

cd /d "d:\GRT-AI"

REM Start the scheduler in background (minimized window)
start /min "PIR_Scheduler_24_7" cmd /c "start_24_7_scheduler.bat"

echo Scheduler started in background!
echo Check Task Manager for "PIR_Scheduler_24_7" process
echo.
pause

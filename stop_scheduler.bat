@echo off
echo ========================================
echo    STOP PIR Sensor Scheduler
echo ========================================
echo.
echo Stopping all Node.js processes (scheduler)...
taskkill /f /im node.exe
echo.
echo All scheduler processes have been terminated.
echo ========================================
pause

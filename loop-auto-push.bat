@echo off
echo.
echo [Git Auto Push Loop Started - Every 60 Seconds]
echo Press Ctrl+C to stop.
echo.

:loop
call auto-push.bat
timeout /t 60 >nul
goto loop

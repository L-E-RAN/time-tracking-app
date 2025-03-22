@echo off
cd /d %~dp0

:loop
echo ===== Auto Git Sync =====
echo [%date% %time%] Adding files...
git add .

echo [%date% %time%] Committing...
git commit -m "Auto sync - " & Now

echo [%date% %time%] Pushing...
git push

echo [%date% %time%] Done. Waiting 1 minute...
timeout /t 60 >nul
goto loop

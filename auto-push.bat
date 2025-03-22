@echo off
cd /d %~dp0

:loop
echo ===== Auto Git Sync =====
echo [%date% %time%] Adding files...
git add .

echo [%date% %time%] Committing...
git commit -m "🔄 Auto sync" >nul 2>&1

echo [%date% %time%] Pushing...
git push

echo [%date% %time%] Done. Waiting 3 minutes...
timeout /t 60 >nul
goto loop

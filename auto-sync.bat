@echo off
cd "C:\Users\Eliran Ashwal\Desktop\time-tracking-app"

:loop
git add .

:: בדיקה אם יש שינויים לצורך commit
git diff --cached --quiet
if errorlevel 1 (
    git commit -m "Auto update on %date% %time%" > NUL 2>&1
    git push origin main
)

timeout /t 60
goto loop

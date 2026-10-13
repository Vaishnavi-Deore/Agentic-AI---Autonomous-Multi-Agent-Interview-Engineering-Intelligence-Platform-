@echo off
TITLE PrepMind AI - Push to GitHub
color 0b

echo =========================================================================
echo              PrepMind AI - Push Project to GitHub
echo =========================================================================
echo.

echo Pushing commits to https://github.com/Vaishnavi-Deore/PrepMind-AI.git ...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo =========================================================================
    echo  SUCCESS! All project files have been pushed to GitHub!
    echo  View repository: https://github.com/Vaishnavi-Deore/PrepMind-AI
    echo =========================================================================
) else (
    echo.
    echo [NOTE] If the push failed with "Repository not found":
    echo 1. Open your browser: https://github.com/new
    echo 2. Set Repository Name: PrepMind-AI
    echo 3. Keep "Initialize with README" UNCHECKED (empty repo)
    echo 4. Click "Create repository"
    echo 5. Run this script again!
)

echo.
pause

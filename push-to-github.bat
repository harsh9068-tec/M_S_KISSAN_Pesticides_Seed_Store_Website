@echo off
title Push M/S KISSAN Store to GitHub
color 0A
echo ============================================================================
echo   M/S KISSAN PESTICIDES ^& SEED STORE - PUSH CHANGES TO GITHUB
echo ============================================================================
echo.
echo Checking git status...
git status
echo.
echo Attempting to push local commits to origin main...
echo.
git push origin main

if errorlevel 1 (
    echo.
    echo ============================================================================
    echo [NOTICE] Push could not complete.
    echo Possible reasons:
    echo  1. Network / Wi-Fi is offline or blocking connection to GitHub.
    echo  2. Git authentication needs refresh: run 'git credential-manager github login'
    echo ============================================================================
) else (
    echo.
    echo ============================================================================
    echo [SUCCESS] All commits and security updates successfully pushed to GitHub!
    echo ============================================================================
)
echo.
pause

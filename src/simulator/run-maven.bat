@echo off
REM Pharmacy POS Simulator - Maven Run Script
REM This script runs the simulator directly with Maven (no build needed if already compiled)

echo ===================================================================
echo    PHARMACY POS SIMULATOR - MAVEN EXEC
echo ===================================================================
echo.

mvn exec:java

pause

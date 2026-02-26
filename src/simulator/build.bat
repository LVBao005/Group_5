@echo off
REM Pharmacy POS Simulator - Build Only Script
REM This script only builds the project without running it

echo ===================================================================
echo    PHARMACY POS SIMULATOR - BUILD
echo ===================================================================
echo.

echo [INFO] Cleaning and building project...
echo.

mvn clean package

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Build completed successfully!
    echo.
    echo To run the simulator, use one of these commands:
    echo   1. run.bat
    echo   2. run-maven.bat
    echo   3. java -jar target\pos-simulator-1.0-SNAPSHOT.jar
) else (
    echo.
    echo [ERROR] Build failed! Please check the error messages above.
)

echo.
pause

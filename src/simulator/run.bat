@echo off
REM Pharmacy POS Simulator - Quick Start Script
REM This script will compile and run the simulator

echo ===================================================================
echo    PHARMACY POS SIMULATOR - QUICK START
echo ===================================================================
echo.

REM Check if Maven is installed
where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Maven is not installed or not in PATH!
    echo Please install Maven and add it to your PATH.
    echo Download: https://maven.apache.org/download.cgi
    pause
    exit /b 1
)

REM Check if Java is installed
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java is not installed or not in PATH!
    echo Please install Java JDK 17 or higher.
    pause
    exit /b 1
)

echo [INFO] Checking if project needs to be built...
echo.

REM Check if JAR exists
if not exist "target\pos-simulator-1.0-SNAPSHOT.jar" (
    echo [INFO] JAR not found. Building project...
    echo.
    call mvn clean package
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Build failed! Please check the error messages above.
        pause
        exit /b 1
    )
    echo.
    echo [SUCCESS] Build completed successfully!
    echo.
) else (
    echo [INFO] JAR found. Skipping build. (Run 'mvn clean package' to rebuild)
    echo.
)

echo ===================================================================
echo    STARTING SIMULATOR
echo ===================================================================
echo.

REM Run the simulator
java -jar target\pos-simulator-1.0-SNAPSHOT.jar

pause

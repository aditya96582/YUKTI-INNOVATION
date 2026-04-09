@echo off
REM CampusConnect AI - Quick Installation Script for Windows
REM This script sets up the entire project in one command

echo.
echo ========================================
echo   CampusConnect AI - Installation
echo ========================================
echo.

REM Check Node.js installation
echo Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed.
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js detected: 
node -v
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd server
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed
echo.

REM Set up environment file
if not exist .env (
    echo Creating environment file...
    copy .env.example .env
    echo [OK] Environment file created (server\.env)
    echo [INFO] You can edit this file to configure MongoDB and other settings
) else (
    echo [INFO] Environment file already exists
)
echo.

REM Install frontend dependencies
echo Installing frontend dependencies...
cd ..
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed
echo.

REM Success message
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Start the backend server:
echo    cd server ^&^& npm start
echo.
echo 2. In a new terminal, start the frontend:
echo    npm run dev
echo.
echo 3. Open your browser at:
echo    http://localhost:8080
echo.
echo Optional: Configure MongoDB
echo    Edit server\.env and set:
echo    USE_MONGODB=true
echo    MONGODB_URI=mongodb://localhost:27017/campusconnect
echo.
echo Documentation:
echo    - Quick Start: SETUP_GUIDE.md
echo    - Full Docs: CAMPUSCONNECT_AI_IMPLEMENTATION.md
echo    - Summary: IMPLEMENTATION_SUMMARY.md
echo.
echo Happy coding! 🎉
echo.
pause

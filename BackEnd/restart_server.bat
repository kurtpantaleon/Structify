@echo off
echo ===================================
echo    Structify Server Restart Tool
echo ===================================
echo.

:menu
echo Choose an option:
echo 1. Start Server
echo 2. Restart Server (Stop then Start)
echo 3. Stop Server
echo 4. Update Dependencies and Restart
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto restart
if "%choice%"=="3" goto stop
if "%choice%"=="4" goto update
if "%choice%"=="5" goto end

echo Invalid choice. Please try again.
goto menu

:start
echo.
echo Starting Structify Server...
start cmd /k "cd /d %~dp0 && node server.js"
echo Server started in a new window.
echo.
goto menu

:stop
echo.
echo Stopping Structify Server...
taskkill /FI "WINDOWTITLE eq *node server.js*" /F
echo Server stopped.
timeout /t 5
echo.
goto menu

:restart
echo.
echo Restarting Structify Server...
echo Step 1: Stopping server...
taskkill /FI "WINDOWTITLE eq *node server.js*" /F
echo Server stopped.
echo Waiting 5 seconds...
timeout /t 5
echo Step 2: Starting server...
start cmd /k "cd /d %~dp0 && node server.js"
echo Server restarted in a new window.
echo.
goto menu

:update
echo.
echo Updating Dependencies and Restarting Server...
echo Step 1: Stopping server...
taskkill /FI "WINDOWTITLE eq *node server.js*" /F
echo Server stopped.
echo Step 2: Installing dependencies...
call npm install
echo Step 3: Starting server...
start cmd /k "cd /d %~dp0 && node server.js"
echo Server restarted with updated dependencies.
echo.
goto menu

:end
echo.
echo Thank you for using the Server Restart Tool.
echo.
pause

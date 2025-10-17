@echo off
echo ============================================
echo   NIGHTWATCH TEST QUICK CHECK
echo ============================================
echo.

echo Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js not found!
    exit /b 1
)

echo.
echo Installing dependencies (if needed)...
if not exist node_modules (
    npm install
)

echo.
echo Running setup verification...
call npm run setup

echo.
echo ============================================
echo   RUNNING TEST WITH AUTO-SERVER
echo ============================================
echo.
echo The test will:
echo 1. Automatically start the game server
echo 2. Run Chrome headless tests
echo 3. Stop the server when done
echo.

call npm run test:headless

echo.
echo ============================================
echo   TEST COMPLETE
echo ============================================
echo.
echo Check tests_output folder for results
echo Screenshots (if any failures) in: tests_output\screenshots
echo.
pause
@echo off
echo Starting QR Attendance Server...
echo.

REM Try Node.js first (most reliable)
node --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    node server.js
    goto :end
)

REM Try Python
python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using Python...
    python -m http.server 8000
    goto :end
)

REM Try Python3
python3 --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using Python3...
    python3 -m http.server 8000
    goto :end
)

REM If nothing works, show error
echo ========================================
echo ERROR: No server software found!
echo ========================================
echo.
echo You need either Node.js or Python installed.
echo.
echo OPTION 1 (Recommended): Install Node.js
echo   Download from: https://nodejs.org/
echo   Install and restart this script
echo.
echo OPTION 2: Install Python
echo   Download from: https://www.python.org/downloads/
echo   Check "Add Python to PATH" during installation
echo.
echo After installing either one, run this script again.
echo.
pause
goto :end

:end

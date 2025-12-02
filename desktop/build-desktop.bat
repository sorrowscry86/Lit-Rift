@echo off
setlocal EnableDelayedExpansion

echo ======================================
echo   Lit-Rift Desktop Build Script (Windows)
echo ======================================
echo.

:: Get script directory (resolved to absolute path)
set "SCRIPT_DIR=%~dp0"
:: Remove trailing backslash
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

:: Get project root (parent directory of script dir)
for %%I in ("%SCRIPT_DIR%\..") do set "PROJECT_ROOT=%%~fI"

echo [1/5] Checking prerequisites...

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed
    exit /b 1
)

:: Check for Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Python is not installed
    exit /b 1
)

:: Check for PyInstaller
where pyinstaller >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing PyInstaller...
    pip install pyinstaller
)

echo Prerequisites OK
echo.

echo [2/5] Building React frontend...
cd "%PROJECT_ROOT%\frontend"

:: Install dependencies if needed
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

:: Build production React app
call npm run build

echo Frontend built
echo.

echo [3/5] Bundling Flask backend with PyInstaller...
cd "%PROJECT_ROOT%\backend"

:: Install backend dependencies if needed
python -c "import flask" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing backend dependencies...
    pip install -r requirements.txt
)

:: Run PyInstaller
pyinstaller lit-rift.spec --clean

echo Backend bundled
echo.

echo [4/5] Copying files to desktop directory...

:: Copy React build to desktop
if exist "%SCRIPT_DIR%\build" rmdir /s /q "%SCRIPT_DIR%\build"
xcopy /E /I /Y "%PROJECT_ROOT%\frontend\build" "%SCRIPT_DIR%\build"

:: Copy backend dist to desktop
if exist "%SCRIPT_DIR%\backend-dist" rmdir /s /q "%SCRIPT_DIR%\backend-dist"
xcopy /E /I /Y "%PROJECT_ROOT%\backend\dist\lit-rift-backend" "%SCRIPT_DIR%\backend-dist"

echo Files copied
echo.

echo [5/5] Installing Electron dependencies...
cd "%SCRIPT_DIR%"

:: Install Electron dependencies if needed
if not exist "node_modules" (
    call npm install
)

echo Electron dependencies installed
echo.

echo ======================================
echo   Build Complete!
echo ======================================
echo.
echo To run the desktop app in development mode:
echo   cd desktop ^& npm run dev
echo.
echo To package for distribution:
echo   cd desktop ^& npm run build
echo.
echo Platform-specific builds:
echo   npm run build:win   - Windows (NSIS, Portable, MSI)
echo   npm run build:mac   - macOS (DMG, ZIP)
echo   npm run build:linux - Linux (AppImage, DEB, RPM)
echo.

pause

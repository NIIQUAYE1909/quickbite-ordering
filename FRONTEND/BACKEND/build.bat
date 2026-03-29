@echo off
REM =============================================
REM QuickBite - Build Script for Windows
REM =============================================
REM This script compiles the Java backend
REM Run before deploying to Render
REM =============================================

echo ==========================================
echo   QuickBite - Building for Production
echo ==========================================

cd /d "%~dp0"

echo.
echo Compiling Java source files...

REM Compile all Java files in src/ directory
REM The MySQL driver is only needed at runtime, not for compilation.
javac -cp "src" -d out src\*.java

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Compilation successful!
    echo.
    echo Output directory: out\
    echo Ready for deployment to Render!
) else (
    echo.
    echo Compilation failed!
    exit /b 1
)

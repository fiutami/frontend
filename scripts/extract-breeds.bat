@echo off
REM FIUTAMI - Script rapido per estrarre testo dai PDF delle razze
REM
REM Uso: extract-breeds.bat
REM      oppure: extract-breeds.bat "C:\percorso\sorgente" "C:\percorso\output"

echo ============================================================
echo FIUTAMI - Estrazione PDF Razze
echo ============================================================
echo.

REM Installa pdf-parse se non presente
call npm list pdf-parse >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Installazione pdf-parse...
    call npm install pdf-parse --save-dev
    echo.
)

REM Esegui estrazione
if "%~1"=="" (
    echo Uso percorsi predefiniti...
    node scripts/pdf-to-normalized-txt.js
) else (
    echo Sorgente: %1
    echo Output: %2
    node scripts/pdf-to-normalized-txt.js "%~1" "%~2"
)

echo.
echo ============================================================
echo Completato! Controlla la cartella content\breeds\raw
echo ============================================================
pause

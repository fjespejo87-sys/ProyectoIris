@echo off
echo ============================================
echo   IRIS - Residencias de Mayores
echo ============================================
echo.

cd /d "%~dp0"

echo Iniciando el servidor backend (Python)...
start "IRIS Backend" cmd /k "cd /d "%~dp0backend" && python -m uvicorn main:app --reload --port 8000"

timeout /t 3 /nobreak > nul

echo Iniciando el frontend (React)...
start "IRIS Frontend" cmd /k "cd /d "%~dp0frontend" && set NODE_OPTIONS=--use-system-ca && npm run dev"

timeout /t 5 /nobreak > nul

echo.
echo ============================================
echo  La aplicacion esta arrancando...
echo  Abre el navegador en: http://localhost:5173
echo ============================================
echo.

start http://localhost:5173

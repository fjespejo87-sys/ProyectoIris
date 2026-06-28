@echo off
echo ============================================
echo   INSTALACION - Proyecto Iris
echo ============================================
echo.

cd /d "%~dp0"

echo [1/3] Instalando dependencias del backend Python...
cd backend
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Fallo la instalacion de Python. Asegurate de tener Python 3.10+ instalado.
    pause
    exit /b 1
)
cd ..

echo.
echo [2/3] Instalando dependencias del frontend Node.js...
cd frontend
set NODE_OPTIONS=--use-system-ca
npm install
if errorlevel 1 (
    echo ERROR: Fallo npm install.
    pause
    exit /b 1
)
npm approve-scripts esbuild 2>nul
cd ..

echo.
echo [3/3] Instalacion completada!
echo.
echo SIGUIENTE PASO: Configura tu email en backend\.env
echo    - Abre backend\.env con el Bloc de notas
echo    - Rellena GMAIL_USER con tu email de Gmail
echo    - Rellena GMAIL_APP_PASSWORD con tu contrasena de aplicacion
echo.
echo Despues ejecuta: arrancar.bat
echo.
pause

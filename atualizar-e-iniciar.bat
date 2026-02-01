@echo off
echo ========================================
echo NC - Atualizacao e Inicializacao
echo ========================================
echo.
echo [1/2] Instalando dependencias atualizadas...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Falha na instalacao!
    pause
    exit /b 1
)
echo.
echo [2/2] Iniciando servidor...
echo.
echo ========================================
echo   Servidor NC
echo ========================================
echo.
echo Aguarde 3 segundos...
timeout /t 3 /nobreak >nul
echo.
echo Abrindo navegador em http://localhost:3000
start http://localhost:3000
echo.
echo ========================================
echo   ATENCAO: Logs de Email aparecerao aqui!
echo ========================================
echo.
call npm run dev

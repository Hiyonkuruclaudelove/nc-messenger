@echo off
echo ========================================
echo NC - Servidor de Mensagens
echo ========================================
echo.
echo Iniciando servidor...
echo.
echo Aguarde 3 segundos...
timeout /t 3 /nobreak >nul
echo.
echo Abrindo navegador em http://localhost:3000
start http://localhost:3000
echo.
echo ========================================
echo Os codigos de verificacao aparecerao aqui!
echo ========================================
echo.
npm run dev

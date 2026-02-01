@echo off
cls
echo ========================================
echo NC - Reiniciando Servidor
echo ========================================
echo.
echo Aguarde 5 segundos antes de abrir o navegador...
echo O servidor precisa inicializar primeiro!
echo.
timeout /t 5 /nobreak
echo.
echo Abrindo navegador em http://localhost:3000
start http://localhost:3000
echo.
echo ========================================
echo LOGS DE EMAIL APARECERAO AQUI!
echo ========================================
echo.
cd c:\xampp\htdocs\NcApk
call npm run dev

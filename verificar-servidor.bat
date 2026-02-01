@echo off
echo ========================================
echo NC - Verificacao do Servidor
echo ========================================
echo.
echo Testando se o servidor esta rodando...
echo.
curl -s http://localhost:3000/api/health
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo [ERRO] Servidor NAO esta rodando!
    echo ========================================
    echo.
    echo Execute: reiniciar.bat
    echo.
) else (
    echo.
    echo ========================================
    echo [OK] Servidor esta funcionando!
    echo ========================================
    echo.
)
pause

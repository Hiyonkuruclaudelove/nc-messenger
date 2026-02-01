@echo off
echo ========================================
echo NC - Instalacao de Dependencias
echo ========================================
echo.
echo Instalando pacotes npm...
echo Isso pode levar alguns minutos...
echo.
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Falha na instalacao!
    echo.
    pause
    exit /b 1
)
echo.
echo ========================================
echo Instalacao concluida com sucesso!
echo ========================================
echo.
echo Para iniciar o servidor, execute:
echo   iniciar.bat
echo.
echo Ou pressione qualquer tecla para iniciar agora...
pause
cls
call iniciar.bat

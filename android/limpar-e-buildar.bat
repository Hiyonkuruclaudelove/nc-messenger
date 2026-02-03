@echo off
echo Limpando cache do Gradle (transforms) para evitar NullPointerException...
if exist ".gradle\caches\transforms" (
  rmdir /s /q ".gradle\caches\transforms"
  echo Cache transforms removido.
) else (
  echo Pasta transforms nao encontrada.
)
echo.
echo Executando clean e assembleDebug...
call gradlew-android.bat clean
call gradlew-android.bat assembleDebug
pause

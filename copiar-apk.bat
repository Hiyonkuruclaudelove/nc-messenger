@echo off
REM Copia o APK gerado pelo Android Studio para a pasta de download do servidor.
REM Execute depois de: Build -^> Build Bundle(s) / APK(s) -^> Build APK(s)

set APK_ORIGEM=android\app\build\outputs\apk\debug\app-debug.apk
set APK_DESTINO=public\apk\nc-messenger.apk

if not exist "%APK_ORIGEM%" (
  echo APK nao encontrado em: %APK_ORIGEM%
  echo Gere o APK no Android Studio primeiro: Build -^> Build Bundle(s) / APK(s) -^> Build APK(s)
  exit /b 1
)

if not exist "public\apk" mkdir public\apk
copy /Y "%APK_ORIGEM%" "%APK_DESTINO%"
echo APK copiado para %APK_DESTINO%
echo Agora o download esta disponivel em: /download
exit /b 0

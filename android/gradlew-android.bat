@echo off
REM Define JAVA_HOME para o JDK/JRE do Android Studio (use jre ou jbr conforme sua instalacao)
if exist "C:\Program Files\Android\Android Studio\jbr" (
  set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
) else if exist "C:\Program Files\Android\Android Studio\jre" (
  set "JAVA_HOME=C:\Program Files\Android\Android Studio\jre"
) else (
  echo JAVA_HOME nao encontrado. Ajuste este script com o caminho do JDK do Android Studio.
  pause
  exit /b 1
)
call gradlew.bat %*

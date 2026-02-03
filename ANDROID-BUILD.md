# 📱 Gerar APK do NC Messenger

Este guia gera um APK Android instalável a partir do app web, para disponibilizar na página de download. O APK funciona em **qualquer telefone Android 5.0+** com as permissões necessárias e **sem erro de instalação**.

---

## Pré-requisitos

1. **Node.js** (já usado no projeto)
2. **Android Studio** (para compilar o APK)
   - Download: https://developer.android.com/studio
   - Durante a instalação, marque: **Android SDK**, **Android SDK Platform**, **Android Virtual Device**

3. **Java 17** (geralmente já vem com o Android Studio)

---

## Passo a passo

### 1. Instalar dependências e criar o projeto Android

No terminal, na pasta do projeto (`c:\xampp\htdocs\NcApk`):

```bash
npm install
npx cap add android
```

Isso cria a pasta `android/` com o projeto Android.

### 2. Ajustar versão mínima do Android (evitar erro de instalação)

Edite o arquivo **`android/variables.gradle`** e garanta:

```gradle
ext {
    minSdkVersion = 22
    compileSdkVersion = 34
    targetSdkVersion = 34
    ...
}
```

- `minSdkVersion = 22` → Android 5.1+ (compatível com a maioria dos aparelhos e evita problemas de permissão em versões antigas).
- Se quiser Android 5.0 exatamente, use `21`, mas `22` é mais estável para instalação.

### 3. Permissões e configuração para instalação sem erro

Edite **`android/app/src/main/AndroidManifest.xml`**.

Dentro de `<manifest>`, **adicione** (ou confira) estas permissões:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

Na tag **`<application>`**, adicione ou ajuste:

```xml
<application
    android:allowBackup="true"
    android:usesCleartextTraffic="true"
    ...>
```

- `allowBackup="true"` → evita bloqueios em alguns dispositivos.
- `usesCleartextTraffic="true"` → permite HTTP além de HTTPS (útil se o servidor for local ou sem HTTPS).

Salve o arquivo.

### 4. Sincronizar e abrir no Android Studio

```bash
npx cap sync android
npx cap open android
```

O Android Studio abre o projeto em `android/`.

### 5. Compilar o APK

No Android Studio:

1. Menu **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**.
2. Espere terminar. O APK será gerado em:
   - **Debug:** `android/app/build/outputs/apk/debug/app-debug.apk`
   - **Release (se configurado):** `android/app/build/outputs/apk/release/app-release.apk`

### 6. Colocar o APK na pasta de download

**Windows:** na pasta do projeto, execute o script:

```batch
copiar-apk.bat
```

Ele copia o APK gerado para `public/apk/nc-messenger.apk`.

**Ou manualmente:**

- **Windows (PowerShell):**
  ```powershell
  Copy-Item "android\app\build\outputs\apk\debug\app-debug.apk" "public\apk\nc-messenger.apk"
  ```
- **Linux/macOS:**
  ```bash
  cp android/app/build/outputs/apk/debug/app-debug.apk public/apk/nc-messenger.apk
  ```

### 7. Servir o APK na sua tela de download

1. Suba o servidor (`npm run dev` ou `npm start`).
2. Acesse a página de download: **http://localhost:3000/download**
3. O botão **“Baixar APK”** fará o download de `nc-messenger.apk`.

---

## Resumo dos comandos (após Android Studio instalado)

```bash
cd c:\xampp\htdocs\NcApk
npm install
npx cap add android
# Editar android/variables.gradle e android/app/src/main/AndroidManifest.xml (ver acima)
npx cap sync android
npx cap open android
# No Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
# Depois copiar app-debug.apk para public/apk/nc-messenger.apk
```

---

## Permissões no APK (resumo)

| Permissão | Uso |
|-----------|-----|
| `INTERNET` | Acesso à API e WebSocket |
| `ACCESS_NETWORK_STATE` | Saber se há rede |
| `POST_NOTIFICATIONS` | Notificações push (Android 13+) |

Com `minSdkVersion` 22, `allowBackup="true"` e `usesCleartextTraffic="true"`, o APK tende a instalar sem erro em qualquer telefone compatível.

---

## APK de release (opcional)

Para distribuir um APK assinado (release):

1. No Android Studio: **Build** → **Generate Signed Bundle / APK** → **APK**.
2. Crie ou use um keystore e preencha alias e senhas.
3. Copie o `app-release.apk` gerado para `public/apk/nc-messenger.apk`.

Assim o mesmo arquivo continua sendo servido na sua tela de download.

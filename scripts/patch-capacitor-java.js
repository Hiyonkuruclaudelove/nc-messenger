/**
 * Corrige JavaVersion.VERSION_21 para VERSION_11 no Capacitor,
 * para compatibilidade com AGP 7.2.2 e Gradle 7.4 (Android Studio antigo).
 * Roda após npm install (postinstall) e após cap sync.
 */
const fs = require('fs');
const path = require('path');

function patchFile(filePath, label) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('JavaVersion.VERSION_21')) {
    content = content.replace(/JavaVersion\.VERSION_21/g, 'JavaVersion.VERSION_11');
    fs.writeFileSync(filePath, content);
    console.log('patch-capacitor-java: ' + label + ' ajustado para Java 11.');
  }
}

const root = path.join(__dirname, '..');

patchFile(
  path.join(root, 'node_modules', '@capacitor', 'android', 'capacitor', 'build.gradle'),
  'build.gradle do Capacitor (node_modules)'
);

patchFile(
  path.join(root, 'android', 'capacitor-cordova-android-plugins', 'build.gradle'),
  'build.gradle capacitor-cordova-android-plugins'
);

// Java 11: corrige "pattern matching for instanceof" (Java 16+) em Bridge.java
const bridgePath = path.join(root, 'node_modules', '@capacitor', 'android', 'capacitor', 'src', 'main', 'java', 'com', 'getcapacitor', 'Bridge.java');
if (fs.existsSync(bridgePath)) {
  let bridge = fs.readFileSync(bridgePath, 'utf8');
  const oldCode = 'if (webView instanceof CapacitorWebView capacitorWebView) {';
  const newCode = 'if (webView instanceof CapacitorWebView) {\n                CapacitorWebView capacitorWebView = (CapacitorWebView) webView;';
  if (bridge.includes(oldCode)) {
    bridge = bridge.replace(oldCode, newCode);
    fs.writeFileSync(bridgePath, bridge);
    console.log('patch-capacitor-java: Bridge.java (instanceof) ajustado para Java 11.');
  }
}

// Java 11: corrige "switch expression" (Java 12+) em WebViewLocalServer.java
const webViewPath = path.join(root, 'node_modules', '@capacitor', 'android', 'capacitor', 'src', 'main', 'java', 'com', 'getcapacitor', 'WebViewLocalServer.java');
if (fs.existsSync(webViewPath)) {
  let webView = fs.readFileSync(webViewPath, 'utf8');
  if (webView.includes('return switch (code) {')) {
    webView = webView.replace(/case (\d+) -> "([^"]+)";/g, 'case $1: return "$2";');
    webView = webView.replace(/default -> "Unknown";\s*\};/s, 'default: return "Unknown";\n        }');
    webView = webView.replace('return switch (code) {', 'switch (code) {');
    fs.writeFileSync(webViewPath, webView);
    console.log('patch-capacitor-java: WebViewLocalServer.java (switch expression) ajustado para Java 11.');
  }
}

// compileSdk 33: corrige VANILLA_ICE_CREAM e windowOptOutEdgeToEdgeEnforcement (API 35) em CapacitorWebView.java
const capacitorWebViewPath = path.join(root, 'node_modules', '@capacitor', 'android', 'capacitor', 'src', 'main', 'java', 'com', 'getcapacitor', 'CapacitorWebView.java');
if (fs.existsSync(capacitorWebViewPath)) {
  let cw = fs.readFileSync(capacitorWebViewPath, 'utf8');
  if (cw.includes('Build.VERSION_CODES.VANILLA_ICE_CREAM')) {
    cw = cw.replace(
      '        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM && configEdgeToEdge.equals("auto")) {\n            TypedValue value = new TypedValue();\n            boolean foundOptOut = getContext().getTheme().resolveAttribute(android.R.attr.windowOptOutEdgeToEdgeEnforcement, value, true);',
      '        // VANILLA_ICE_CREAM = API 35; use literal when compiling with SDK < 35\n        int apiVanillaIceCream = 35;\n        if (Build.VERSION.SDK_INT >= apiVanillaIceCream && configEdgeToEdge.equals("auto")) {\n            TypedValue value = new TypedValue();\n            int attrId = getContext().getResources().getIdentifier("windowOptOutEdgeToEdgeEnforcement", "attr", "android");\n            boolean foundOptOut = attrId != 0 && getContext().getTheme().resolveAttribute(attrId, value, true);'
    );
    fs.writeFileSync(capacitorWebViewPath, cw);
    console.log('patch-capacitor-java: CapacitorWebView.java (API 35) ajustado para compileSdk 33.');
  }
}

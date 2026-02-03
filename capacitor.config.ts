/**
 * Capacitor - empacota o app web NC como APK Android
 * Gera APK instalável em qualquer Android 5.0+
 */
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nc.messenger',
  appName: 'NC Messenger',
  webDir: 'public',
  server: {
    // Em produção o app carrega do mesmo host (API + WebSocket no mesmo servidor)
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;

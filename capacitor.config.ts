import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.imissyou.app',
  appName: 'I Miss You',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    backgroundColor: '#F7F2E9',
    allowMixedContent: true,
    captureInput: true
  }
};

export default config;

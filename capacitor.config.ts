import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.imissyou.app',
  appName: 'I Miss You',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;

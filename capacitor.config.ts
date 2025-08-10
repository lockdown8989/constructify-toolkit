import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.cf2c1411239a41fba1e0a8276b3f45dd',
  appName: 'teampulse-schedule',
  webDir: 'dist',
  server: {
    url: 'https://cf2c1411-239a-41fb-a1e0-a8276b3f45dd.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK'
    }
  }
};

export default config;
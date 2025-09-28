import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.miapp.escaner',
  appName: 'Mi Escáner PDF',
  webDir: 'out',
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    },
    Filesystem: {
      permissions: ['read', 'write']
    },
    Share: {
      permissions: ['read', 'write']
    }
  }
};

export default config;

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.edu.poligran.pymelocalia',
  appName: 'PymeLocal IA',
  webDir: 'dist/pymelocal-ia/browser',
  plugins: {
    LocalNotifications: {
      iconColor: '#1967D2',
    },
  },
};

export default config;

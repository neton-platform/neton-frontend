import { defineConfig } from '@vben/vite-config';
import { loadEnv } from 'vite';

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiPrefix = env.VITE_GLOB_API_URL || '/admin-api';
  const apiTarget = env.VITE_BASE_URL || 'http://127.0.0.1:8080';

  return {
    application: {},
    vite: {
      server: {
        proxy: {
          [apiPrefix]: {
            changeOrigin: true,
            // mock代理目标地址
            target: apiTarget,
            ws: true,
          },
        },
      },
    },
  };
});

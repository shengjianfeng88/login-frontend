import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  base: '/',
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-styled-components'],
      },
    }),
    tsconfigPaths(),
  ],
  server: {
    // 正确的 history fallback 写法
    fs: {
      strict: true,
    },
    proxy: {
      '/upload': {
        target: 'https://tryon-advanced.faishion.ai',
        changeOrigin: true,
        secure: false,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
          'Access-Control-Allow-Credentials': 'true'
        }
      },
      '/api/auth/test-history': {
        target: 'http://192.168.10.12:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // history fallback 放在 build 或 preview 阶段配置
  build: {
    outDir: 'dist',
  },
});

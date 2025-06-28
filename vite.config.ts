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
    port: 5173,
    fs: {
      strict: true,
    },
    proxy: {
      // '/upload': {
      //   target: 'https://staging-api-auth.faishion.ai', // 你的本地后端服务器地址
      //   changeOrigin: true,
      //   secure: false,
      //   configure: (proxy, options) => {
      //     proxy.on('proxyReq', (proxyReq, req) => {
      //       console.log(
      //         `Proxy request: ${req.method} ${req.url} -> ${options.target}${req.url}`
      //       );
      //     });
      //     proxy.on('proxyRes', (proxyRes, req) => {
      //       console.log(
      //         `Proxy response: ${proxyRes.statusCode} for ${req.url}`
      //       );
      //     });
      //   },
      // },
      '/health': {
        target: 'http://chatbot.faishion.ai',
        changeOrigin: true,
        secure: false,
      },
      '/chat': {
        target: 'http://chatbot.faishion.ai',
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

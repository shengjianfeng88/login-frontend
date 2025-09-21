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
      // 主要API代理 - 代理到认证服务
      '/v1': {
        target: 'https://api-auth.faishion.ai',
        changeOrigin: true,
        secure: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log(
              `Proxy request: ${req.method} ${req.url} -> https://api-auth.faishion.ai${req.url}`
            );
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log(
              `Proxy response: ${proxyRes.statusCode} for ${req.url}`
            );
          });
        },
      },
      // 聊天机器人API代理
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
      // 历史记录API代理
      '/history': {
        target: 'https://tryon-history.faishion.ai',
        changeOrigin: true,
        secure: false,
      },
      // 收藏功能API代理
      '/favorite': {
        target: 'https://tryon-history.faishion.ai',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/favorite/, '/history'),
      },
    },
  },
  // history fallback 放在 build 或 preview 阶段配置
  build: {
    outDir: 'dist',
  },
});

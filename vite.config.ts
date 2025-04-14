import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  base: '/',
  plugins: [react(), tsconfigPaths()],
  server: {
    // 正确的 history fallback 写法
    fs: {
      strict: true,
    },
  },
  // history fallback 放在 build 或 preview 阶段配置
  build: {
    outDir: 'dist',
  },
})

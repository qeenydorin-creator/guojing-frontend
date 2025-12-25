
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-quill-new', 'quill'],
    esbuildOptions: {
      // Handle CommonJS modules properly
      mainFields: ['module', 'main'],
    }
  },
  build: {
    commonjsOptions: {
      include: [/react-quill-new/, /node_modules/],
      transformMixedEsModules: true
    }
  },
  server: {
    proxy: {
      // 代理所有 /api 开头的请求到 Python 后端（含 /api/uploads 静态文件）
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      // 显式覆盖上传静态访问，确保返回的 /api/uploads/... 可同源访问
      '/api/uploads': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    }
  }
});

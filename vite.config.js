import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          // 将React相关库单独打包
          'react-vendor': ['react', 'react-dom'],
          // 将第三方库单独打包
          'vendor': ['react-toastify', 'browser-image-compression'],
        },
      },
    },
    // 启用压缩（使用esbuild，更快且无需额外依赖）
    minify: 'esbuild',
    // 如果需要使用terser，需要先安装: npm install -D terser
    // minify: 'terser',
    // terserOptions: {
    //   compress: {
    //     drop_console: true,
    //     drop_debugger: true,
    //   },
    // },
    // 优化chunk大小警告阈值
    chunkSizeWarningLimit: 1000,
    // 启用source map（生产环境可选）
    sourcemap: false,
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-toastify', 'browser-image-compression'],
  },
  // 服务器配置
  server: {
    // 启用HTTP/2
    http2: false,
    // 预热常用文件
    warmup: {
      clientFiles: ['./src/main.jsx', './src/App.jsx'],
    },
  },
})

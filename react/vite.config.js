import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    outDir: '../public/js', // 输出到 Express 静态目录
    emptyOutDir: true,
    rollupOptions: {
      input: {
        page1: path.resolve(__dirname, 'src/page1/index.jsx'),
        page2: path.resolve(__dirname, 'src/page2/index.jsx'),
      },
      output: {
        format: 'es',
        name: '[name]', // 按入口名称生成不同的全局变量
        entryFileNames: '[name]/index.es.js',
        assetFileNames: '[name]/assets/[name]-[hash][extname]',
        // 禁用内联动态导入
        inlineDynamicImports: false,
      },
    },
  },
});

import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022', sourcemap: false,
    rollupOptions: { output: { entryFileNames: 'assets/app.js', chunkFileNames: 'assets/[name].js', assetFileNames: 'assets/[name][extname]' } }
  },
  server: { host: '127.0.0.1' }
});

// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,  // Frontend port
    proxy: {
      '/api': {
        target: 'https://catalog-management-system-dev-ak3ogf6zea-uc.a.run.app',
        changeOrigin: true,
        secure: false, // accept self-signed certs while proxying (dev only)
        rewrite: (path) => path.replace(/^\/api/, ''), // so /api/cms/products -> /cms/products on target
      },
    },
  },
});

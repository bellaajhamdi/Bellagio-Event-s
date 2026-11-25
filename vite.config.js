import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        produits: resolve(import.meta.dirname, 'produits.html'),
        services: resolve(import.meta.dirname, 'services.html'),
        contact: resolve(import.meta.dirname, 'contact.html'),
        admin: resolve(import.meta.dirname, 'admin.html'),
      },
    },
  },
});

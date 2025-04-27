import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
    import { resolve } from 'path';
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: resolve(__dirname, 'vitest.setup.js'),
  },
     server: {
    host: '0.0.0.0', // so it binds to public IP
    port: 5173,      // or whatever port you're using
    allowedHosts: ['ec2-54-191-62-131.us-west-2.compute.amazonaws.com']
     }
});

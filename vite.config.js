import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [tailwindcss(), react()] ,
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: resolve(__dirname, 'vitest.setup.js'),
  },
  server: {
    host: '0.0.0.0',  // Bind to all network interfaces
    port: 5173,       // Match the containerPort in your deployment
    hmr: {
      // Configure HMR for WebSockets
      clientPort: 30517, // The nodePort from your service
      // Use the appropriate hostname accessible from your browser
      // This might need to be your cluster's external IP or hostname
      host: '192.168.64.3',
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
    cors: true,
  },
});

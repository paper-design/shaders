import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { watch } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'watch-workspace-packages',
      configureServer(server) {
        const packagesToWatch = ['../packages/shaders/dist', '../packages/shaders-react/dist'];

        packagesToWatch.forEach((packagePath) => {
          watch(join(__dirname, packagePath), { recursive: true }, async () => {
            // Invalidate all modules to ensure fresh imports
            server.moduleGraph.invalidateAll();

            server.ws.send({
              type: 'full-reload',
              path: '*',
            });
          });
        });
      },
    },
  ],
  optimizeDeps: {
    force: true, // Force dependency pre-bundling
  },
  server: {
    hmr: {
      protocol: 'ws',
    },
  },
});

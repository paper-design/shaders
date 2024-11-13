import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { watch } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "watch-workspace-packages",
      configureServer(server) {
        // Watch the dist directories of workspace packages
        const packagesToWatch = [
          "../packages/shaders/dist",
          "../packages/shaders-react/dist",
        ];

        packagesToWatch.forEach((packagePath) => {
          watch(join(__dirname, packagePath), { recursive: true }, async () => {
            // Clear module cache
            server.moduleGraph.invalidateAll();
            // Force reoptimization
            await server.restart();
          });
        });
      },
    },
  ],
  resolve: {
    preserveSymlinks: true,
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  define: {
    global: "globalThis",
  },
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "node:async_hooks": path.resolve(__dirname, "src/stubs/async_hooks.ts"),
      "async_hooks": path.resolve(__dirname, "src/stubs/async_hooks.ts"),
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "use-sync-external-store",
      "use-sync-external-store/shim/with-selector",
    ],
  },
});

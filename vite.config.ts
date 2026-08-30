import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const appVersion = (
  JSON.parse(readFileSync(path.join(rootDir, "package.json"), "utf-8")) as {
    version: string;
  }
).version;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(
      process.env.VITE_APP_VERSION || appVersion,
    ),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (
            id.includes("/react-dom/") ||
            id.includes("/react/") ||
            id.includes("/scheduler/")
          ) {
            return "react-vendor";
          }

          if (id.includes("/zustand/")) {
            return "zustand-vendor";
          }
        },
      },
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.integration.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/engine/**/*.ts",
        "src/utils/**/*.ts",
        "src/save/**/*.ts",
        "src/hooks/**/*.ts",
      ],
      exclude: ["**/*.test.ts", "**/*.integration.test.ts", "src/engine/index.ts"],
    },
  },
});

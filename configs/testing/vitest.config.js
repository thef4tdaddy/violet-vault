import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules/**",
        "dist/**",
        "coverage/**",
        "**/*.config.js",
        "**/*.config.ts",
        "src/test/**",
        "**/*.d.ts",
        "src/main.jsx",
      ],
      thresholds: {
        global: {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60,
        },
      },
    },
    testTimeout: 30000, // 30s timeout to prevent crashes during high load
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});

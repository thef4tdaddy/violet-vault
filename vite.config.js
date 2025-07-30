import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    sentryVitePlugin({
      org: "f4tdaddy",
      project: "violet-vault",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  define: {
    "process.env": {},
    global: {},
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "recharts", "lucide-react"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: true,
    minify: "esbuild",
  },
  esbuild: {
    // In production, you'll want to drop console logs and debuggers
    // drop: ["console", "debugger"],
  },
});

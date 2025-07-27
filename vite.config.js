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
  optimizeDeps: {
    include: ["firebase/app", "firebase/firestore", "recharts"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          charts: ["recharts"],
          icons: ["lucide-react"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: true,
    minify: "esbuild",
  },
  esbuild: {
    // Temporarily enable console logs in production for debugging
    // drop: ["console", "debugger"],
  },
});

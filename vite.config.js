import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
// https://vitejs.dev/config/
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
    // Fix for some Firebase compatibility issues
    global: "globalThis",
  },
  optimizeDeps: {
    include: ["firebase/app", "firebase/firestore", "recharts"],
    exclude: [],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for core React libraries
          react: ["react", "react-dom"],
          // Charts chunk for recharts and analytics
          charts: ["recharts"],
          // Icons chunk for lucide-react
          icons: ["lucide-react"],
        },
      },
    },
    // Optimize chunk size limits
    chunkSizeWarningLimit: 1000,
    // Enable gzip compression hints
    reportCompressedSize: true,
    // Minify for production (esbuild is faster than terser)
    minify: "esbuild",
  },
  // Performance optimizations
  esbuild: {
    // Remove console logs in production
    drop: ["console", "debugger"],
  },
});

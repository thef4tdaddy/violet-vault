import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Avoid multiple copies of React which can cause
  // "Invalid hook call" errors during development
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  // Increase memory limits and optimize for build performance
  server: {
    hmr: {
      overlay: false, // Disable error overlay for better performance
    },
  },
  define: {
    "process.env": {},
    global: {},
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor libraries into separate chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('firebase')) {
              return 'firebase-vendor';
            }
            if (id.includes('dexie')) {
              return 'dexie-vendor';
            }
            if (id.includes('recharts') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            return 'vendor';
          }
          
          // Split large app modules
          if (id.includes('utils/firebaseSync')) {
            return 'firebase-sync';
          }
          if (id.includes('utils/budgetHistory')) {
            return 'budget-history';
          }
          if (id.includes('db/budgetDb')) {
            return 'database';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false, // Disable verbose size reporting
    minify: false, // Keep disabled for faster builds
    sourcemap: false, // Disable sourcemaps for faster builds
  },
  esbuild: {
    // Only drop debugger statements in production, keep console for Highlight.io
    drop: process.env.NODE_ENV === "production" ? ["debugger"] : [],
  },
});

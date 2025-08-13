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
        manualChunks: {
          // Keep React together to avoid module issues
          vendor: ["react", "react-dom", "lucide-react"],
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
          charts: ["recharts"],
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

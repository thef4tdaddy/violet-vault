import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
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
    chunkSizeWarningLimit: 3000, // Increased from 1000 to 3000 to accommodate large bundles
    reportCompressedSize: process.env.NODE_ENV === "production", // Enable size reporting in production
    minify: process.env.NODE_ENV === "production" ? "terser" : false, // Enable minification in production
    sourcemap: false, // Disable sourcemaps for faster builds
    // Terser options for better compression
    terserOptions: process.env.NODE_ENV === "production" ? {
      compress: {
        drop_console: false, // Keep console for Highlight.io
        drop_debugger: true,
        pure_funcs: ["console.debug"], // Remove debug statements
      },
    } : {},
  },
  esbuild: {
    // Only drop debugger statements in production, keep console for Highlight.io
    drop: process.env.NODE_ENV === "production" ? ["debugger"] : [],
  },
});

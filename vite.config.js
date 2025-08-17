import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: "react",
    }),
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
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Keep React together to avoid module issues
          if (id.includes('react') || id.includes('react-dom')) {
            return 'vendor-react';
          }
          
          // Firebase SDK into separate chunk
          if (id.includes('firebase')) {
            return 'vendor-firebase';
          }
          
          // Charts and visualization libraries
          if (id.includes('recharts') || id.includes('chart')) {
            return 'vendor-charts';
          }
          
          // UI libraries
          if (id.includes('lucide-react') || id.includes('@headlessui')) {
            return 'vendor-ui';
          }
          
          // Crypto and encryption utilities
          if (id.includes('crypto') || id.includes('encryption')) {
            return 'vendor-crypto';
          }
          
          // HTML to canvas and export utilities
          if (id.includes('html2canvas') || id.includes('jspdf')) {
            return 'vendor-export';
          }
          
          // Large utility libraries
          if (id.includes('lodash') || id.includes('date-fns') || id.includes('moment')) {
            return 'vendor-utils';
          }
          
          // Node modules that aren't specifically chunked above
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
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

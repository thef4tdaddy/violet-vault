import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["images/favicon.ico", "images/icon-192x192.png", "images/icon-512x512.png"],
      manifest: {
        name: "VioletVault",
        short_name: "VioletVault",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#0b0f14",
        theme_color: "#6b46c1",
        description: "Privacy-first envelope budgeting.",
        icons: [
          {
            src: "images/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable any",
          },
          {
            src: "images/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable any",
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/(_|api|auth)\//],
      },
    }),
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

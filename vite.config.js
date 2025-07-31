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
      silent: true, // Reduce Sentry plugin verbosity
    }),
  ],
  // Avoid multiple copies of React which can cause
  // "Invalid hook call" errors during development
  resolve: {
    dedupe: ["react", "react-dom"],
  },
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
    reportCompressedSize: false, // Disable verbose size reporting
    minify: true, // Enable minification for production
  },
  esbuild: {
    // Drop console logs and debuggers in production
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
  },
});

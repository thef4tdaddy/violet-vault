import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Fix for some Firebase compatibility issues
    global: "globalThis",
  },
  optimizeDeps: {
    include: ["firebase/app", "firebase/firestore"],
  },
});

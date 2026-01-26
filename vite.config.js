import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { execSync } from "child_process";

// Get git commit information at build time
const getGitInfo = () => {
  try {
    // Get current branch
    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf8",
    }).trim();

    // Get last commit date for current branch (with full timestamp)
    const commitDate = execSync("git log -1 --format=%cI", {
      encoding: "utf8",
    }).trim();

    // Get commit hash (short)
    const commitHash = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim().substring(0, 7);

    // Get commit author date (alternative format)
    const authorDate = execSync("git log -1 --format=%aI", {
      encoding: "utf8",
    }).trim();

    // Get commit message (first line only)
    const commitMessage = execSync("git log -1 --format=%s", {
      encoding: "utf8",
    }).trim();

    console.log("🔧 Git Info Injection:", {
      branch,
      commitDate,
      commitHash,
      message: commitMessage.substring(0, 50) + "...",
    });

    return {
      branch,
      commitDate,
      authorDate,
      commitHash,
      commitMessage,
    };
  } catch (error) {
    console.warn("Failed to get git info:", error.message);
    return {
      branch: "unknown",
      commitDate: new Date().toISOString(),
      authorDate: new Date().toISOString(),
      commitHash: "unknown",
      commitMessage: "Build without git",
    };
  }
};

export default defineConfig(() => {
  const gitInfo = getGitInfo();

  // Mode detection
  const isProduction = process.env.NODE_ENV === "production";
  const viteNodeEnv = process.env.VITE_NODE_ENV || (isProduction ? "production" : "development");
  const isDevelopmentMode = viteNodeEnv === "development";

  // Enable debug mode for staging branches
  const isStagedBranch = ["develop", "feat/polygot-rewrite"].includes(gitInfo.branch);
  const enableDebugBuild = isStagedBranch && isProduction;

  return {
    plugins: [react(), tailwindcss()],
    // Avoid multiple copies of React which can cause
    // "Invalid hook call" errors during development
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: {
        buffer: "buffer",
      },
    },
    // Increase memory limits and optimize for build performance
    server: {
      hmr: {
        overlay: false, // Disable error overlay for better performance
      },
    },
    define: {
      "process.env": {},
      global: "globalThis",
      // Inject git information as environment variables
      "import.meta.env.VITE_GIT_BRANCH": JSON.stringify(gitInfo.branch),
      "import.meta.env.VITE_GIT_COMMIT_DATE": JSON.stringify(gitInfo.commitDate),
      "import.meta.env.VITE_GIT_AUTHOR_DATE": JSON.stringify(gitInfo.authorDate),
      "import.meta.env.VITE_GIT_COMMIT_HASH": JSON.stringify(gitInfo.commitHash),
      "import.meta.env.VITE_GIT_COMMIT_MESSAGE": JSON.stringify(gitInfo.commitMessage),
      "import.meta.env.VITE_BUILD_TIME": JSON.stringify(new Date().toISOString()),
    },
    build: {
      chunkSizeWarningLimit: 1000, // Reset to default for better monitoring
      reportCompressedSize: isProduction, // Enable size reporting in production
      // Development mode: No minification for fast builds and readable errors
      // Production mode: Ultra-conservative terser minification to prevent temporal dead zone errors
      minify: isDevelopmentMode ? false : "terser",
      // Use external maps for staging to keep JS small, inline for dev for speed
      sourcemap: enableDebugBuild ? true : isDevelopmentMode ? "inline" : false,
      // Manual chunk splitting for optimal bundle sizes
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunk for React ecosystem
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            // Firebase chunk (lazy loaded)
            "firebase-vendor": ["firebase/app", "firebase/firestore", "firebase/auth"],
            // Data libraries chunk
            "data-vendor": ["@tanstack/react-query", "dexie", "zustand"],
            // UI/Utils chunk
            "ui-vendor": ["lucide-react", "tailwindcss", "@tanstack/react-virtual"],
            // Crypto/Security chunk
            "crypto-vendor": ["bip39", "@msgpack/msgpack", "pako"],
            // PDF/QR chunk (lazy loaded)
            "export-vendor": ["jspdf", "qrcode", "qrcode.react"],
          },
        },
        // Enhanced tree-shaking (less aggressive to avoid temporal dead zone errors)
        treeshake: {
          moduleSideEffects: ["**/*.css", "**/*.scss", "**/*.sass"],
          propertyReadSideEffects: false,
        },
      },
      // Terser options - only applied to production builds (when minify: "terser")
      terserOptions: isDevelopmentMode
        ? {} // No terser options in development (minify is false anyway)
        : {
            compress: {
              drop_console: false, // Keep console for Highlight.io
              drop_debugger: true,
              pure_funcs: ["console.debug"], // Remove debug statements
              // Ultra-conservative settings to prevent temporal dead zone errors
              sequences: false,
              join_vars: false,
              conditionals: false,
              dead_code: false,
              evaluate: false,
              if_return: false,
              loops: false,
              reduce_vars: false,
              unused: false,
              hoist_vars: false,
              hoist_funs: false,
              side_effects: false,
            },
            mangle: {
              // Extremely conservative variable mangling
              keep_fnames: true,
              keep_classnames: true,
              reserved: [
                "$",
                "_",
                "global",
                "globalThis",
                "React",
                "useState",
                "useEffect",
                "useCallback",
                "useRef",
              ],
            },
          },
    },
    esbuild: {
      // Development mode: Keep everything for debugging
      // Production mode: Only drop debugger statements (but not in develop branch debug builds)
      drop: isDevelopmentMode ? [] : isProduction && !enableDebugBuild ? ["debugger"] : [],
    },
  };
});

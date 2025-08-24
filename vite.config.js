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

    // Get last commit date for current branch
    const commitDate = execSync("git log -1 --format=%cI", {
      encoding: "utf8",
    }).trim();

    // Get commit hash
    const commitHash = execSync("git rev-parse HEAD", { encoding: "utf8" })
      .trim()
      .substring(0, 7);

    return {
      branch,
      commitDate,
      commitHash,
    };
  } catch (error) {
    console.warn("Failed to get git info:", error.message);
    return {
      branch: "unknown",
      commitDate: new Date().toISOString(),
      commitHash: "unknown",
    };
  }
};

export default defineConfig(() => {
  const gitInfo = getGitInfo();

  return {
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
      // Inject git information as environment variables
      "import.meta.env.VITE_GIT_BRANCH": JSON.stringify(gitInfo.branch),
      "import.meta.env.VITE_GIT_COMMIT_DATE": JSON.stringify(
        gitInfo.commitDate,
      ),
      "import.meta.env.VITE_GIT_COMMIT_HASH": JSON.stringify(
        gitInfo.commitHash,
      ),
      "import.meta.env.VITE_BUILD_TIME": JSON.stringify(
        new Date().toISOString(),
      ),
    },
    build: {
      chunkSizeWarningLimit: 3000, // Increased from 1000 to 3000 to accommodate large bundles
      reportCompressedSize: process.env.NODE_ENV === "production", // Enable size reporting in production
      minify: process.env.NODE_ENV === "production" ? "terser" : false, // Enable minification in production
      sourcemap: false, // Disable sourcemaps for faster builds
      // Terser options for better compression
      terserOptions:
        process.env.NODE_ENV === "production"
          ? {
              compress: {
                drop_console: false, // Keep console for Highlight.io
                drop_debugger: true,
                pure_funcs: ["console.debug"], // Remove debug statements
              },
            }
          : {},
    },
    esbuild: {
      // Only drop debugger statements in production, keep console for Highlight.io
      drop: process.env.NODE_ENV === "production" ? ["debugger"] : [],
    },
  };
});

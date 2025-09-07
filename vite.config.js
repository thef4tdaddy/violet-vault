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
    const commitHash = execSync("git rev-parse HEAD", { encoding: "utf8" })
      .trim()
      .substring(0, 7);

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
  
  // Enable debug mode for develop branch deployments
  const isDevelopBranch = gitInfo.branch === 'develop';
  const isProduction = process.env.NODE_ENV === 'production';
  const viteNodeEnv = process.env.VITE_NODE_ENV;
  const enableDebugBuild = (isDevelopBranch && isProduction) || (viteNodeEnv === 'development');

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
      "import.meta.env.VITE_GIT_AUTHOR_DATE": JSON.stringify(
        gitInfo.authorDate,
      ),
      "import.meta.env.VITE_GIT_COMMIT_HASH": JSON.stringify(
        gitInfo.commitHash,
      ),
      "import.meta.env.VITE_GIT_COMMIT_MESSAGE": JSON.stringify(
        gitInfo.commitMessage,
      ),
      "import.meta.env.VITE_BUILD_TIME": JSON.stringify(
        new Date().toISOString(),
      ),
    },
    build: {
      chunkSizeWarningLimit: 3000, // Increased from 1000 to 3000 to accommodate large bundles
      reportCompressedSize: isProduction, // Enable size reporting in production
      // Disable minification for develop branch to get readable error messages
      minify: enableDebugBuild ? false : (isProduction ? "terser" : false),
      // Enable sourcemaps for develop branch and development mode
      sourcemap: enableDebugBuild || !isProduction,
      // Terser options for better compression (only when minification is enabled)
      terserOptions:
        isProduction && !enableDebugBuild
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
      // Only drop debugger statements in production (but not in develop branch debug builds)
      drop: isProduction && !enableDebugBuild ? ["debugger"] : [],
    },
  };
});

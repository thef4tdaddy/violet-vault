import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// @ts-ignore
import { VitePWA } from "vite-plugin-pwa";
// @ts-ignore
import viteCompression from "vite-plugin-compression";
import path from "path";
import { execSync } from "child_process";
import { codecovVitePlugin } from "@codecov/vite-plugin";

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
  } catch (error: any) {
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

export default defineConfig(({ mode }) => {
  const gitInfo = getGitInfo();

  // Mode detection
  const isProduction = mode === "production" || process.env.NODE_ENV === "production";
  const viteNodeEnv = process.env.VITE_NODE_ENV || mode;
  // Enable debug mode for staging branches
  const isStagedBranch = ["develop", "feat/polygot-rewrite"].includes(gitInfo.branch);
  const enableDebugBuild = isStagedBranch && isProduction;
  const isDevelopmentMode = mode === "development" || viteNodeEnv === "development";

  return {
    root: path.resolve(__dirname, "../../"),
    envDir: "configs/deployment/envs",
    plugins: [
      react({
        // Configure @vitejs/plugin-react for React 19
        jsxRuntime: 'automatic',
      }),
      tailwindcss(),
      VitePWA({
        registerType: "prompt", 
        devOptions: {
          enabled: true, 
          type: "module",
        },
        includeAssets: [
          "favicon.ico",
          "images/icon-192x192.png",
          "images/icon-512x512.png",
          "images/favicon.ico",
        ],
        manifest: {
          name: "Violet Vault - Budget Management",
          short_name: "Violet Vault",
          description: "Secure envelope-based budgeting app for financial freedom",
          theme_color: "#8B5CF6", 
          background_color: "#F3F4F6", 
          display: "standalone",
          orientation: "portrait-primary",
          scope: "/",
          start_url: "/app/dashboard",
          categories: ["finance", "productivity", "business"],
          icons: [
            {
              src: "/images/icon-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "/images/icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
          shortcuts: [
            {
              name: "Add Transaction",
              short_name: "Add Transaction",
              description: "Quickly add a new transaction",
              url: "/app/transactions/add",
              icons: [
                {
                  src: "/images/icon-192x192.png",
                  sizes: "192x192",
                  type: "image/png",
                },
              ],
            },
            {
              name: "View Budget",
              short_name: "Budget",
              description: "View your budget overview",
              url: "/app/budget",
              icons: [
                {
                  src: "/images/icon-192x192.png",
                  sizes: "192x192",
                  type: "image/png",
                },
              ],
            },
            {
              name: "Bill Manager",
              short_name: "Bills",
              description: "Manage your bills and reminders",
              url: "/app/bills",
              icons: [
                {
                  src: "/images/icon-192x192.png",
                  sizes: "192x192",
                  type: "image/png",
                },
              ],
            },
            {
              name: "Analytics",
              short_name: "Analytics",
              description: "View spending analytics and trends",
              url: "/app/analytics",
              icons: [
                {
                  src: "/images/icon-192x192.png",
                  sizes: "192x192",
                  type: "image/png",
                },
              ],
            },
          ],
          share_target: {
            action: "/app/import",
            method: "POST",
            enctype: "multipart/form-data",
            params: {
              title: "title",
              text: "text",
              url: "url",
              files: [
                {
                  name: "files",
                  accept: [
                    ".csv",
                    ".json",
                    ".pdf",
                    "text/csv",
                    "application/json",
                    "application/pdf",
                  ],
                },
              ],
            },
          },
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
          maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
          navigateFallback: "/offline",
          navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
          additionalManifestEntries: [{ url: "/offline", revision: null }],
          skipWaiting: true,
          clientsClaim: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/[^\/]+\/app\/(dashboard|budget|envelopes|transactions|bills|analytics)(?:\/.*)?$/,
              handler: "CacheFirst",
              options: {
                cacheName: "critical-routes-cache",
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 14 * 24 * 60 * 60,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/[^\/]+\/app/,
              handler: "CacheFirst",
              options: {
                cacheName: "app-shell-cache",
                expiration: {
                  maxEntries: 25,
                  maxAgeSeconds: 7 * 24 * 60 * 60,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/.*\.googleapis\.com\/.*\/(envelopes|transactions|bills|budget)/,
              handler: "NetworkFirst",
              options: {
                cacheName: "budget-data-cache",
                networkTimeoutSeconds: 2,
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 6 * 60 * 60,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
                plugins: [
                  {
                    cacheKeyWillBeUsed: async ({ request }: any) => {
                      const url = new URL(request.url);
                      url.searchParams.delete("auth");
                      return url.href;
                    },
                  },
                ],
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
              handler: "CacheFirst",
              options: {
                cacheName: "images-cache",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 30 * 24 * 60 * 60,
                },
              },
            },
            {
              urlPattern: /\.(?:js|css|woff2?|ttf|eot)$/,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "static-resources",
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 14 * 24 * 60 * 60,
                },
              },
            },
          ],
        },
      }),
      viteCompression({
        verbose: false,
        disable: false,
        threshold: 10240,
        algorithm: "gzip",
        ext: ".gz",
      }),
      viteCompression({
        verbose: false,
        disable: false,
        threshold: 10240,
        algorithm: "brotliCompress",
        ext: ".br",
      }),
      codecovVitePlugin({
        enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
        bundleName: "violet-vault-frontend",
        uploadToken: process.env.CODECOV_TOKEN,
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "../../src"),
      },
    },
    define: {
      "process.env": {},
      global: "globalThis",
      "import.meta.env.VITE_GIT_BRANCH": JSON.stringify(gitInfo.branch),
      "import.meta.env.VITE_GIT_COMMIT_DATE": JSON.stringify(gitInfo.commitDate),
      "import.meta.env.VITE_GIT_AUTHOR_DATE": JSON.stringify(gitInfo.authorDate),
      "import.meta.env.VITE_GIT_COMMIT_HASH": JSON.stringify(gitInfo.commitHash),
      "import.meta.env.VITE_GIT_COMMIT_MESSAGE": JSON.stringify(gitInfo.commitMessage),
      "import.meta.env.VITE_BUILD_TIME": JSON.stringify(new Date().toISOString()),
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      target: "esnext",
      chunkSizeWarningLimit: 1500, // Increased for feature-rich app with lazy-loaded routes
      reportCompressedSize: isProduction,
      minify: (isDevelopmentMode ? false : "terser") as "terser" | false,
      // Use external maps for production to keep JS small, inline for dev for speed
      sourcemap: enableDebugBuild ? true : (isDevelopmentMode ? 'inline' : false),
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "../../index.html"),
          "firebase-messaging-sw": path.resolve(__dirname, "../../src/sw/firebase-messaging-sw.ts"),
        },
        output: {
          format: 'es',
          entryFileNames: (chunkInfo: any) => {
            return chunkInfo.name === 'firebase-messaging-sw' ? '[name].js' : 'assets/[name]-[hash].js';
          },
          manualChunks: (id: string) => {
            // Only split vendors that DON'T depend on React to avoid circular dependencies
            
            // Firebase bundle (independent of React)
            if (id.includes("node_modules/firebase") || id.includes("node_modules/@firebase")) {
              return "firebase-vendor";
            }
            // PDF generation (independent of React)
            if (id.includes("node_modules/jspdf") || id.includes("node_modules/html2canvas")) {
              return "pdf-vendor";
            }
            
            // Note: React, TanStack Query, Recharts, Dexie, and Zustand are left in main/react bundles
            // to avoid circular dependencies since they all depend on or integrate with React
          },
        } as any,
      },
    },
  };
});

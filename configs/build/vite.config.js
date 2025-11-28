import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import commonjs from "@rollup/plugin-commonjs";
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
  const isDevelopBranch = gitInfo.branch === "develop";
  const isProduction = process.env.NODE_ENV === "production";
  const viteNodeEnv = process.env.VITE_NODE_ENV;
  const enableDebugBuild =
    (isDevelopBranch && isProduction) || viteNodeEnv === "development";
  const isDevelopmentMode = viteNodeEnv === "development" || !isProduction;

  return {
    plugins: [
      react({
        // Configure @vitejs/plugin-react for React 19
        jsxRuntime: 'automatic',
      }),
      tailwindcss(),
      // Handle CommonJS modules that use 'module' exports
      // Note: Vite handles CommonJS automatically, but some packages need explicit transformation
      commonjs({
        include: [/node_modules/],
        transformMixedEsModules: true,
        requireReturnsDefault: 'auto',
      }),
      VitePWA({
        registerType: "prompt", // Changed from autoUpdate to prompt for manual control
        devOptions: {
          enabled: true, // Enable PWA in development mode
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
          description:
            "Secure envelope-based budgeting app for financial freedom",
          theme_color: "#8B5CF6", // Purple-500 for brand consistency
          background_color: "#F3F4F6", // Gray-100 for better contrast and branding
          display: "standalone",
          orientation: "portrait-primary",
          scope: "/",
          start_url: "/app",
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
          // App Shortcuts for quick actions
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
          // Share Target API for financial data
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
          // Allow larger files to be cached (dev builds are unminified ~7MB, prod builds ~2MB)
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB to accommodate dev builds
          // Define offline navigation fallback
          navigateFallback: "/offline",
          navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
          // Background sync configuration
          additionalManifestEntries: [{ url: "/offline", revision: null }],
          // Skip waiting handling
          skipWaiting: true,
          clientsClaim: true,
          runtimeCaching: [
            // Critical App Routes - Cache first for offline access
            {
              urlPattern:
                /^https:\/\/[^\/]+\/app\/(dashboard|budget|envelopes|transactions|bills|analytics)(?:\/.*)?$/,
              handler: "CacheFirst",
              options: {
                cacheName: "critical-routes-cache",
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 14 * 24 * 60 * 60, // 14 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            // App Shell - Cache first for instant loading
            {
              urlPattern: /^https:\/\/[^\/]+\/app/,
              handler: "CacheFirst",
              options: {
                cacheName: "app-shell-cache",
                expiration: {
                  maxEntries: 25,
                  maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            // Firebase Budget Data - Optimized for offline access
            {
              urlPattern:
                /^https:\/\/.*\.googleapis\.com\/.*\/(envelopes|transactions|bills|budget)/,
              handler: "NetworkFirst",
              options: {
                cacheName: "budget-data-cache",
                networkTimeoutSeconds: 2,
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 6 * 60 * 60, // 6 hours for budget data
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
                plugins: [
                  {
                    cacheKeyWillBeUsed: async ({ request }) => {
                      // Normalize Firebase API URLs for better caching
                      const url = new URL(request.url);
                      url.searchParams.delete("auth");
                      return url.href;
                    },
                  },
                ],
              },
            },
            // Other Firebase API calls - Network first with shorter cache
            {
              urlPattern: /^https:\/\/.*\.googleapis\.com\//,
              handler: "NetworkFirst",
              options: {
                cacheName: "firebase-api-cache",
                networkTimeoutSeconds: 3,
                expiration: {
                  maxEntries: 150,
                  maxAgeSeconds: 2 * 60 * 60, // 2 hours
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
                plugins: [
                  {
                    cacheKeyWillBeUsed: async ({ request }) => {
                      // Normalize Firebase API URLs for better caching
                      const url = new URL(request.url);
                      url.searchParams.delete("auth");
                      return url.href;
                    },
                  },
                ],
              },
            },
            // Firebase Auth - Network first with short cache
            {
              urlPattern: /^https:\/\/securetoken\.googleapis\.com\//,
              handler: "NetworkFirst",
              options: {
                cacheName: "firebase-auth-cache",
                networkTimeoutSeconds: 2,
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 15 * 60, // 15 minutes
                },
              },
            },
            // Static Images - Cache first, long expiry
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
              handler: "CacheFirst",
              options: {
                cacheName: "images-cache",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            // JS/CSS Resources - Stale while revalidate
            {
              urlPattern: /\.(?:js|css|woff2?|ttf|eot)$/,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "static-resources",
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 14 * 24 * 60 * 60, // 14 days
                },
              },
            },
            // Fonts - Cache first with long expiry
            {
              urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts",
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            // CDN Resources - Stale while revalidate
            {
              urlPattern: /^https:\/\/cdn\./,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "cdn-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                },
              },
            },
            // CHANGELOG and other docs - Network first with fallback
            {
              urlPattern: /\/(CHANGELOG\.md|patch-notes\.json|manifest\.json)$/,
              handler: "NetworkFirst",
              options: {
                cacheName: "docs-cache",
                networkTimeoutSeconds: 5,
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 24 * 60 * 60, // 1 day
                },
              },
            },
          ],
        },
      }),
    ],
    // Optimize dependencies for React 19 compatibility
    optimizeDeps: {
      include: [
        'recharts',
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
      ],
      exclude: [
        'react-is', // Exclude react-is to prevent multiple React copies
      ],
      esbuildOptions: {
        // Ensure React 19 compatibility
        jsx: 'automatic',
        // Ensure React is available during optimization
        define: {
          'process.env.NODE_ENV': '"development"',
        },
      },
      // Force re-optimization when dependencies change
      force: false,
    },
    // Avoid multiple copies of React which can cause
    // "Invalid hook call" errors during development
    resolve: {
      dedupe: ["react", "react-dom", "react-is"],
      alias: {
        buffer: "buffer",
        "@": "/src",
        "@/components": "/src/components",
        "@/hooks": "/src/hooks",
        "@/utils": "/src/utils",
        "@/stores": "/src/stores",
        "@/types": "/src/types",
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
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
      // Define module for CommonJS compatibility (prevents 'module is not defined' errors)
      "typeof module": '"object"',
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
      // Issue 619: Serve Modern JS to Modern Browsers
      target: "esnext",
      chunkSizeWarningLimit: 1000, // Reset to default for better monitoring
      reportCompressedSize: isProduction, // Enable size reporting in production
      // Development mode: No minification for fast builds and readable errors
      // Production mode: Terser minification for all production builds (Issue 618)
      minify: isDevelopmentMode ? false : "terser",
      // Enable sourcemaps for development and debug builds
      // Use 'inline' for development to avoid 404 errors, 'hidden' for production
      sourcemap: enableDebugBuild || isDevelopmentMode ? 'inline' : false,
      // Manual chunk splitting for optimal bundle sizes (Issue 617: Code Splitting)
      rollupOptions: {
        output: {
          // Ensure ES module format for proper CommonJS interop
          format: 'es',
          manualChunks: (id) => {
            // Vendor chunk for React ecosystem
            if (id.includes("node_modules/react") || id.includes("node_modules/react-dom") || id.includes("node_modules/react-router")) {
              return "react-vendor";
            }
            // Firebase chunk (lazy loaded)
            if (id.includes("node_modules/firebase")) {
              return "firebase-vendor";
            }
            // Data libraries chunk
            if (id.includes("node_modules/@tanstack/react-query") || id.includes("node_modules/dexie") || id.includes("node_modules/zustand")) {
              return "data-vendor";
            }
            // Validation chunk - Zod is used everywhere but can be shared
            if (id.includes("node_modules/zod")) {
              return "validation-vendor";
            }
            // Charts chunk - Recharts only used in analytics (lazy loaded)
            if (id.includes("node_modules/recharts")) {
              return "charts-vendor";
            }
            // OCR chunk - Tesseract only used in receipts feature
            if (id.includes("node_modules/tesseract.js")) {
              return "ocr-vendor";
            }
            // Screenshot/Canvas chunk - html2canvas used in bug reports and exports
            if (id.includes("node_modules/html2canvas")) {
              return "canvas-vendor";
            }
            // Monitoring chunk - Sentry (already lazy loaded)
            if (id.includes("node_modules/@sentry")) {
              return "monitoring-vendor";
            }
            // UI/Utils chunk
            if (id.includes("node_modules/lucide-react") || id.includes("node_modules/tailwindcss") || id.includes("node_modules/@tanstack/react-virtual")) {
              return "ui-vendor";
            }
            // Crypto/Security chunk
            if (id.includes("node_modules/bip39") || id.includes("node_modules/@msgpack") || id.includes("node_modules/pako")) {
              return "crypto-vendor";
            }
            // PDF/QR chunk (lazy loaded)
            if (id.includes("node_modules/jspdf") || id.includes("node_modules/qrcode")) {
              return "export-vendor";
            }
            // React utilities chunk
            if (id.includes("node_modules/react-swipeable") || id.includes("node_modules/react-is") || id.includes("node_modules/uuid")) {
              return "react-utils-vendor";
            }
            // Split by feature area for large app code
            if (id.includes("/src/components/analytics") || id.includes("/src/hooks/analytics")) {
              return "analytics-feature";
            }
            if (id.includes("/src/components/receipts") || id.includes("/src/hooks/receipts") || id.includes("/src/utils/receipts")) {
              return "receipts-feature";
            }
            if (id.includes("/src/services/bugReport") || id.includes("/src/components/feedback")) {
              return "bug-report-feature";
            }
          },
        },
        // Enhanced tree-shaking (less aggressive to avoid temporal dead zone errors)
        treeshake: {
          moduleSideEffects: ["**/*.css", "**/*.scss", "**/*.sass"],
          propertyReadSideEffects: false,
        },
        // Add external dependencies to prevent bundling issues
        external: [
          /^swagger-ui-react/, // Dev-only API docs component - not needed in production
        ],
      },
      // Terser options - only applied to production builds (when minify: "terser")
      terserOptions: isDevelopmentMode
        ? {} // No terser options in development (minify is false anyway)
        : {
            compress: {
              drop_console: false, // Keep console for Sentry
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
      drop: isDevelopmentMode
        ? []
        : isProduction && !enableDebugBuild
          ? ["debugger"]
          : [],
    },
  };
});

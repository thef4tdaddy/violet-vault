import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { fileURLToPath, URL } from "node:url";

// Helper function to generate release version with git hash
const generateReleaseVersion = (env, gitHash) => {
  return `chastityOS-${env.VITE_APP_VARIANT || "unknown"}-${gitHash}`;
};

// Helper function to get git hash
const getGitHash = () => {
  let gitHash = "dev";
  try {
    gitHash = execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    console.warn(
      '[vite.config.js] Git hash not available. Using "dev" instead.',
    );
  }
  return gitHash;
};

// Helper function to create environment definitions
const createEnvironmentDefinitions = (env, appVersion) => {
  return {
    "import.meta.env.VITE_APP_VARIANT": JSON.stringify(env.VITE_APP_VARIANT),
    "import.meta.env.VITE_SENTRY_PROJECT": JSON.stringify(
      env.VITE_SENTRY_PROJECT,
    ),
    "import.meta.env.VITE_SENTRY_DSN": JSON.stringify(env.VITE_SENTRY_DSN),
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(appVersion),
  };
};

// Helper function to create base plugins
const createBasePlugins = (isProduction) => {
  return [
    react(),
    tsconfigPaths(),
    tailwindcss(),
    visualizer({
      filename: "./dist/bundle-report.html",
      open: !isProduction,
      gzipSize: true,
      brotliSize: true,
    }),
  ];
};

// Helper function to create compression plugins
const createCompressionPlugins = (isProduction) => {
  return isProduction
    ? [
        viteCompression({
          algorithm: "brotliCompress",
        }),
      ]
    : [];
};

// Helper function to create PWA configuration
const createPWAConfig = (mode) => {
  return VitePWA({
    registerType: "prompt",
    workbox: {
      globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2}"],
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.destination === "document",
          handler: "NetworkFirst",
          options: {
            cacheName: "documents",
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            },
            networkTimeoutSeconds: 3,
          },
        },
        {
          urlPattern: ({ request }) =>
            ["style", "script", "worker"].includes(request.destination),
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "static-resources",
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
            },
          },
        },
        {
          urlPattern: ({ request }) => request.destination === "image",
          handler: "CacheFirst",
          options: {
            cacheName: "images",
            expiration: {
              maxEntries: 60,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            },
          },
        },
        {
          urlPattern: ({ url }) =>
            url.hostname === "firestore.googleapis.com" ||
            url.hostname === "identitytoolkit.googleapis.com",
          handler: "NetworkFirst",
          options: {
            cacheName: "firebase-api",
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 5, // 5 minutes
            },
            networkTimeoutSeconds: 5,
          },
        },
        {
          urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "api-cache",
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 10, // 10 minutes
            },
          },
        },
      ],
      // Enable background sync for offline queue processing
      skipWaiting: false,
      clientsClaim: true,
    },
    manifest: {
      name: "ChastityOS",
      short_name: "ChastityOS",
      description: "Modern chastity tracking and FLR management app",
      start_url: "/",
      display: "standalone",
      background_color: "#282132",
      theme_color: "#581c87",
      orientation: "portrait-primary",
      categories: ["productivity", "utilities"],
      lang: "en-US",
      shortcuts: createPWAShortcuts(),
      icons: createPWAIcons(),
      screenshots: createPWAScreenshots(),
      prefer_related_applications: false,
    },
    devOptions: {
      enabled: mode !== "development",
    },
  });
};

// Helper function to create PWA manifest shortcuts
const createPWAShortcuts = () => {
  return [
    {
      name: "Quick Log Event",
      short_name: "Log Event",
      description: "Quickly log a new chastity event",
      url: "/?shortcut=log-event",
      icons: [{ src: "/icons/shortcut-log.png", sizes: "96x96" }],
    },
    {
      name: "View Tracker",
      short_name: "Tracker",
      description: "View current chastity tracking dashboard",
      url: "/?shortcut=tracker",
      icons: [{ src: "/icons/shortcut-tracker.png", sizes: "96x96" }],
    },
    {
      name: "Keyholder Dashboard",
      short_name: "Keyholder",
      description: "Access keyholder controls and tasks",
      url: "/?shortcut=keyholder",
      icons: [{ src: "/icons/shortcut-keyholder.png", sizes: "96x96" }],
    },
  ];
};

// Helper function to create PWA manifest icons
const createPWAIcons = () => {
  return [
    {
      src: "/icons/icon-72x72.png",
      sizes: "72x72",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/icon-96x96.png",
      sizes: "96x96",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/icon-128x128.png",
      sizes: "128x128",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/icon-144x144.png",
      sizes: "144x144",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/icon-152x152.png",
      sizes: "152x152",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/icon-192x192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/icon-384x384.png",
      sizes: "384x384",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/icon-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/icon-maskable-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ];
};

// Helper function to create PWA manifest screenshots
const createPWAScreenshots = () => {
  return [
    {
      src: "/screenshots/screenshot-mobile-1.png",
      sizes: "390x844",
      type: "image/png",
      form_factor: "narrow",
      label: "Mobile view of the chastity tracker dashboard",
    },
    {
      src: "/screenshots/screenshot-mobile-2.png",
      sizes: "390x844",
      type: "image/png",
      form_factor: "narrow",
      label: "Mobile view of event logging interface",
    },
    {
      src: "/screenshots/screenshot-desktop-1.png",
      sizes: "1280x720",
      type: "image/png",
      form_factor: "wide",
      label: "Desktop view of the main dashboard",
    },
  ];
};

// Helper function to create PWA manifest
const _createPWAManifest = () => {
  return {
    name: "ChastityOS",
    short_name: "ChastityOS",
    description: "Modern chastity tracking and FLR management app",
    start_url: "/",
    display: "standalone",
    background_color: "#282132",
    theme_color: "#581c87",
    orientation: "portrait-primary",
    categories: ["productivity", "utilities"],
    lang: "en-US",
    shortcuts: createPWAShortcuts(),
    icons: createPWAIcons(),
    screenshots: createPWAScreenshots(),
    prefer_related_applications: false,
    edge_side_panel: {
      preferred_width: 400,
    },
    launch_handler: {
      client_mode: "focus-existing",
    },
  };
};

// Helper function to create build configuration
const createBuildConfig = (isProduction, _mode) => {
  // Demo exclusion for PWA builds (Issue #308)
  // Keep demo in development and website, exclude from production PWA
  const shouldExcludeDemo = isProduction;

  return {
    sourcemap: true,
    minify: isProduction ? "terser" : "esbuild",
    rollupOptions: {
      ...(shouldExcludeDemo && {
        external: [/^\/src\/demo\//],
      }),
      output: {
        manualChunks(id) {
          // Exclude demo code from PWA bundle in production (Issue #308)
          if (shouldExcludeDemo && id.includes("/src/demo/")) {
            return undefined; // Don't create a chunk for demo files
          }

          // Split vendor bundles for better caching and parallel loading
          if (id.includes("node_modules")) {
            // React core libraries
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom")
            ) {
              return "react-vendor";
            }
            // Firebase libraries
            if (id.includes("firebase")) {
              return "firebase-vendor";
            }
            // UI libraries (animations, queries)
            if (
              id.includes("framer-motion") ||
              id.includes("@tanstack/react-query")
            ) {
              return "ui-vendor";
            }
            // Chart libraries
            if (id.includes("chart.js") || id.includes("chartjs-adapter")) {
              return "chart-vendor";
            }
            // All other vendor dependencies
            return "vendor";
          }
        },
      },
    },
    ...(isProduction && {
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    }),
  };
};

// Helper function to create esbuild configuration
const createEsbuildConfig = (isNightly, isProduction) => {
  return {
    ...(isNightly && {
      drop: [], // Keep console logs and debugger in nightly builds
    }),
    ...(isProduction && {
      drop: ["console", "debugger"], // Remove console logs and debugger in production
    }),
  };
};

export default defineConfig(({ mode }) => {
  // Load environment variables and setup configuration
  const env = loadEnv(mode, process.cwd(), "");
  const __dirname = fileURLToPath(new URL(".", import.meta.url));
  const packageJson = JSON.parse(
    readFileSync(
      fileURLToPath(new URL("../../package.json", import.meta.url)),
      "utf8",
    ),
  );
  const appVersion = packageJson.version;
  const gitHash = getGitHash();
  const releaseVersion = generateReleaseVersion(env, gitHash);

  // Build mode flags
  const isNightly = mode === "nightly";
  const isProduction = mode === "production";

  return {
    define: createEnvironmentDefinitions(env, appVersion),
    plugins: [
      ...createBasePlugins(isProduction),
      ...createCompressionPlugins(isProduction),
      createPWAConfig(mode),
      sentryVitePlugin({
        org: env.SENTRY_ORG,
        project: env.SENTRY_PROJECT,
        authToken: env.SENTRY_AUTH_TOKEN,
        release: releaseVersion,
        include: "./dist",
        urlPrefix: "~/",
        deploy: {
          env: env.VITE_APP_VARIANT,
        },
        telemetry: false,
      }),
    ],
    server: {
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://identitytoolkit.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://identitytoolkit.googleapis.com https://firestore.googleapis.com https://www.google-analytics.com https://www.googletagmanager.com; frame-src 'self' https://accounts.google.com;",
      },
    },
    build: createBuildConfig(isProduction, mode),
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/tests/setup.js",
    },
    esbuild: createEsbuildConfig(isNightly, isProduction),
  };
});

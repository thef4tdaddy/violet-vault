/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string
  readonly VITE_FIREBASE_APP_ID?: string
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string
  readonly VITE_HIGHLIGHT_PROJECT_ID?: string
  readonly VITE_CLOUDFLARE_WORKER_URL?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_MEASUREMENT_ID: string
  readonly VITE_LOCAL_ONLY_MODE: string
  readonly VITE_ENABLE_CLOUDFLARE_SYNC: string
  readonly VITE_CLOUDFLARE_WORKER_URL: string
  readonly VITE_HIGHLIGHT_PROJECT_ID: string
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
/**
 * Vite Environment Variables Type Declarations
 * Provides type safety for import.meta.env variables
 */

interface ImportMetaEnv {
  // Build-time Git information
interface ImportMetaEnv {
  readonly VITE_GIT_BRANCH: string;
  readonly VITE_GIT_COMMIT_DATE: string;
  readonly VITE_GIT_AUTHOR_DATE: string;
  readonly VITE_GIT_COMMIT_HASH: string;
  readonly VITE_GIT_COMMIT_MESSAGE: string;
  readonly VITE_BUILD_TIME: string;

  // Firebase configuration
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;

  // Bug reporting
  readonly VITE_BUG_REPORT_ENDPOINT?: string;

  // Highlight.io configuration
  readonly VITE_HIGHLIGHT_PROJECT_ID?: string;
  readonly VITE_HIGHLIGHT_ENABLED?: string;

  // Node environment
  readonly VITE_NODE_ENV?: string;

  // Standard Vite variables
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly SSR: boolean;
  readonly VITE_NODE_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
